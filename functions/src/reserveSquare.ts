/**
 * reserveSquare
 * 
 * HTTPS Callable Cloud Function (us-central1)
 * 
 * Purpose:
 * Atomically reserves a square for an authenticated user. Transitions square
 * from 'available' → 'reserved' with a 15-minute expiration timer.
 * 
 * Scope:
 * - Validates game is open and square is available
 * - Uses Firestore transaction to prevent race conditions
 * - Sets reservedUntil timestamp for auto-release
 * - Writes audit log for tracking
 * 
 * Constraints:
 * - Server-side authoritative (backend is law)
 * - No payment handling (that's confirmPaymentIntent)
 * - No admin proxy logic (that's adminProxyAssignSquare)
 * - Only operates on: games/{gameId}, games/{gameId}/squares/{squareId}, auditLogs
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

/**
 * Input validation schema
 */
interface ReserveSquareInput {
  gameId: string;
  squareId: string;
}

/**
 * Calculate reservation expiration (15 minutes from now)
 */
function calculateReservedUntil(): admin.firestore.Timestamp {
  const now = new Date();
  const expirationMs = now.getTime() + (15 * 60 * 1000); // 15 minutes
  return admin.firestore.Timestamp.fromMillis(expirationMs);
}

/**
 * Validates square coordinates are within valid range (0-9)
 */
function isValidSquareCoordinates(row: any, col: any): boolean {
  return (
    typeof row === "number" &&
    typeof col === "number" &&
    row >= 0 &&
    row <= 9 &&
    col >= 0 &&
    col <= 9
  );
}

/**
 * Writes audit log for square reservation
 */
async function writeAuditLog(
  userId: string,
  gameId: string,
  squareId: string,
  reservedUntil: admin.firestore.Timestamp
): Promise<void> {
  const auditEntry = {
    type: "SQUARE_RESERVED",
    actorUserId: userId,
    target: {
      gameId,
      squareId,
    },
    payload: {
      reservedUntil,
      note: "user reservation",
    },
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  };

  await db.collection("auditLogs").add(auditEntry);
}

/**
 * Main function implementation
 */
export const reserveSquare = functions
  .region("us-central1")
  .https.onCall(async (data: ReserveSquareInput, context) => {
    // ========================================================================
    // 1. Authentication Check
    // ========================================================================
    if (!context.auth || !context.auth.uid) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Authentication required"
      );
    }

    const userId = context.auth.uid;

    // ========================================================================
    // 2. Input Validation
    // ========================================================================
    if (!data.gameId || typeof data.gameId !== "string" || data.gameId.trim() === "") {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "gameId is required and must be a non-empty string"
      );
    }

    if (!data.squareId || typeof data.squareId !== "string" || data.squareId.trim() === "") {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "squareId is required and must be a non-empty string"
      );
    }

    const gameId = data.gameId.trim();
    const squareId = data.squareId.trim();

    // ========================================================================
    // 3. Transactional Reservation (Race-Safe)
    // ========================================================================
    const gameRef = db.collection("games").doc(gameId);
    const squareRef = gameRef.collection("squares").doc(squareId);
    const reservedUntil = calculateReservedUntil();

    try {
      const result = await db.runTransaction(async (transaction) => {
        // Read game document
        const gameDoc = await transaction.get(gameRef);
        if (!gameDoc.exists) {
          throw new functions.https.HttpsError(
            "not-found",
            "Game not found"
          );
        }

        const gameData = gameDoc.data()!;

        // Validate game is open
        if (gameData.status !== "open") {
          throw new functions.https.HttpsError(
            "failed-precondition",
            "Game must be open"
          );
        }

        // Read square document
        const squareDoc = await transaction.get(squareRef);
        if (!squareDoc.exists) {
          throw new functions.https.HttpsError(
            "not-found",
            "Square not found"
          );
        }

        const squareData = squareDoc.data()!;

        // Validate square coordinates
        if (!isValidSquareCoordinates(squareData.row, squareData.col)) {
          throw new functions.https.HttpsError(
            "invalid-argument",
            "Square has invalid coordinates"
          );
        }

        // Validate square is available
        if (squareData.state !== "available") {
          // If another user just reserved it, return consistent error
          throw new functions.https.HttpsError(
            "failed-precondition",
            "Square not available"
          );
        }

        // Reserve the square
        transaction.update(squareRef, {
          state: "reserved",
          userId: userId,
          reservedUntil: reservedUntil,
          reservedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        return { gameId, squareId, reservedUntil };
      });

      // ========================================================================
      // 4. Audit Log (Outside Transaction - Append-Only)
      // ========================================================================
      try {
        await writeAuditLog(userId, gameId, squareId, reservedUntil);
      } catch (error) {
        console.error("[reserveSquare] Audit log write failed:", error);
        // Don't fail the entire operation if audit log fails
        // The square was successfully reserved
      }

      // ========================================================================
      // 5. Success Response
      // ========================================================================
      return {
        ok: true,
        gameId: result.gameId,
        squareId: result.squareId,
        reservedUntil: result.reservedUntil,
      };
    } catch (error) {
      // Re-throw HttpsError instances (expected errors)
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }

      // Handle transaction aborted (concurrency conflict)
      if (error instanceof Error && error.message.includes("aborted")) {
        throw new functions.https.HttpsError(
          "aborted",
          "Square already reserved"
        );
      }

      // Log unexpected errors
      console.error("[reserveSquare] Unexpected error:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Failed to reserve square"
      );
    }
  });
