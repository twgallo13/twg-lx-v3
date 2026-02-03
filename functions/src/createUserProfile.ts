/**
 * createUserProfile
 * 
 * HTTPS Callable Cloud Function (us-central1)
 * 
 * Purpose:
 * Enforces onboarding rules from The Winning Game LX spec (Section 4.2, 4.5).
 * Creates or updates a UID-based user document after authentication.
 * Validates input, enforces username uniqueness, and writes an audit log.
 * 
 * Scope:
 * - Normal onboarding: Creates users/{uid} with status: 'active'
 * - Post-claim finalization: Updates existing users/{uid} after claimAdminCreatedParticipant
 * - Does NOT handle admin_created migration (that's claimAdminCreatedParticipant)
 * 
 * Constraints:
 * - All writes are server-side authoritative
 * - Username uniqueness enforced (case-insensitive)
 * - Uses Firestore transactions to prevent race conditions
 * - Appends to auditLogs (immutable)
 * - No writes to games, squares, or other collections
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

/**
 * Input validation schema
 */
interface CreateUserProfileInput {
  username: string;
  favoriteTeam?: string;
  payoutMethod?: string;
  payoutHandle?: string;
}

/**
 * Validates username format per spec:
 * - 3-20 characters
 * - Alphanumeric + underscore + hyphen only
 * - Trimmed (no leading/trailing whitespace)
 */
function validateUsername(username: string): { valid: boolean; error?: string } {
  const trimmed = username.trim();
  
  if (trimmed.length < 3 || trimmed.length > 20) {
    return { valid: false, error: "Username must be 3-20 characters" };
  }
  
  const usernameRegex = /^[a-zA-Z0-9_-]+$/;
  if (!usernameRegex.test(trimmed)) {
    return { valid: false, error: "Username can only contain letters, numbers, underscore, and hyphen" };
  }
  
  return { valid: true };
}

/**
 * Checks if username is already taken by another user
 * Case-insensitive check across all non-deprecated users
 */
async function isUsernameTaken(username: string, currentUid: string): Promise<boolean> {
  const normalizedUsername = username.toLowerCase().trim();
  
  // Query for any users with matching username (case-insensitive)
  // Exclude the current user to allow updates
  const snapshot = await db.collection("users")
    .where("username", "==", normalizedUsername)
    .limit(1)
    .get();
  
  if (snapshot.empty) {
    return false;
  }
  
  // If we found a match, check if it's the current user (allowed for updates)
  const existingDoc = snapshot.docs[0];
  return existingDoc.id !== currentUid;
}

/**
 * Creates audit log entry for user profile creation/update
 */
async function writeAuditLog(userId: string, payload: CreateUserProfileInput, isUpdate: boolean): Promise<void> {
  const auditEntry = {
    type: isUpdate ? "UPDATE_USER_PROFILE" : "CREATE_USER_PROFILE",
    actorUserId: userId,
    targetUserId: userId,
    payload: {
      username: payload.username,
      favoriteTeam: payload.favoriteTeam || null,
      payoutMethod: payload.payoutMethod || null,
      payoutHandle: payload.payoutHandle || null,
    },
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  };
  
  await db.collection("auditLogs").add(auditEntry);
}

/**
 * Main function implementation
 */
export const createUserProfile = functions
  .region("us-central1")
  .https.onCall(async (data: CreateUserProfileInput, context) => {
    // ========================================================================
    // 1. Authentication Check
    // ========================================================================
    if (!context.auth || !context.auth.uid) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Authentication required"
      );
    }
    
    const uid = context.auth.uid;
    
    // ========================================================================
    // 2. Input Validation
    // ========================================================================
    if (!data.username) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Username is required"
      );
    }
    
    const usernameValidation = validateUsername(data.username);
    if (!usernameValidation.valid) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        usernameValidation.error || "Invalid username"
      );
    }
    
    const normalizedUsername = data.username.toLowerCase().trim();
    
    // ========================================================================
    // 3. Username Uniqueness Check
    // ========================================================================
    const usernameTaken = await isUsernameTaken(normalizedUsername, uid);
    if (usernameTaken) {
      throw new functions.https.HttpsError(
        "already-exists",
        "Username taken"
      );
    }
    
    // ========================================================================
    // 4. User Document Creation/Update (Transactional)
    // ========================================================================
    const userRef = db.collection("users").doc(uid);
    let isUpdate = false;
    
    try {
      await db.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        isUpdate = userDoc.exists;
        
        if (isUpdate) {
          // Update existing user document
          // Preserve protected fields: phoneE164, status (if already active), createdAt
          const existingData = userDoc.data()!;
          const updateData: any = {
            username: normalizedUsername,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          };
          
          // Only update optional fields if provided
          if (data.favoriteTeam !== undefined) {
            updateData.favoriteTeam = data.favoriteTeam;
          }
          if (data.payoutMethod !== undefined) {
            updateData.payoutMethod = data.payoutMethod;
          }
          if (data.payoutHandle !== undefined) {
            updateData.payoutHandle = data.payoutHandle;
          }
          
          // Ensure status is active if not already set (post-claim scenario)
          if (existingData.status !== "active") {
            updateData.status = "active";
          }
          
          transaction.update(userRef, updateData);
        } else {
          // Create new user document
          const newUserData = {
            username: normalizedUsername,
            status: "active",
            smsOptIn: true,
            isShadowUser: false,
            favoriteTeam: data.favoriteTeam || null,
            payoutMethod: data.payoutMethod || null,
            payoutHandle: data.payoutHandle || null,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          };
          
          transaction.set(userRef, newUserData);
        }
      });
    } catch (error) {
      console.error("[createUserProfile] Transaction failed:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Failed to create/update user profile"
      );
    }
    
    // ========================================================================
    // 5. Audit Log (Append-Only)
    // ========================================================================
    try {
      await writeAuditLog(uid, data, isUpdate);
    } catch (error) {
      console.error("[createUserProfile] Audit log write failed:", error);
      // Don't fail the entire operation if audit log fails
      // The user document was successfully created/updated
    }
    
    // ========================================================================
    // 6. Success Response
    // ========================================================================
    return {
      ok: true,
      userId: uid,
    };
  });
