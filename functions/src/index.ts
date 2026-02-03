/**
 * Cloud Functions for The Winning Game LX
 * 
 * All functions are deployed to us-central1 per spec Section 1.1.
 * These are inert stubs returning NOT_IMPLEMENTED until business logic is added.
 * 
 * Canonical function names per spec Appendix A.4:
 * 
 * Callable Functions:
 * - createUserProfile
 * - reserveSquare
 * - confirmPaymentIntent
 * - adminConfirmPayment
 * - adminVoidSquare
 * - adminProxyAssignSquare
 * - claimAdminCreatedParticipant
 * - lockGame
 * - submitScore
 * 
 * Scheduled Functions:
 * - autoReleaseExpiredReservations (every 5 minutes)
 * - autoLockGamesAtCloseTime (every 1 minute)
 * - processSmsOutbox (every 5 minutes)
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK
admin.initializeApp();

// Region configuration per spec Section 1.1
const REGION = "us-central1";

/**
 * Standard NOT_IMPLEMENTED response for all stub functions
 */
const NOT_IMPLEMENTED = {
  error: "NOT_IMPLEMENTED",
  message: "This function is not yet implemented. Business logic pending.",
};

/**
 * createUserProfile
 * Purpose: Initialize new user document after onboarding
 */
export const createUserProfile = functions
  .region(REGION)
  .https.onCall(async (data, context) => {
    // Stub: No business logic
    return NOT_IMPLEMENTED;
  });

/**
 * reserveSquare
 * Purpose: Transition square from available → reserved
 */
export const reserveSquare = functions
  .region(REGION)
  .https.onCall(async (data, context) => {
    // Stub: No business logic
    return NOT_IMPLEMENTED;
  });

/**
 * confirmPaymentIntent
 * Purpose: Transition square from reserved → pending_payment
 */
export const confirmPaymentIntent = functions
  .region(REGION)
  .https.onCall(async (data, context) => {
    // Stub: No business logic
    return NOT_IMPLEMENTED;
  });

/**
 * adminConfirmPayment
 * Purpose: Transition square from pending_payment → confirmed
 */
export const adminConfirmPayment = functions
  .region(REGION)
  .https.onCall(async (data, context) => {
    // Stub: No business logic
    return NOT_IMPLEMENTED;
  });

/**
 * adminVoidSquare
 * Purpose: Transition square from reserved/pending_payment → void → available
 */
export const adminVoidSquare = functions
  .region(REGION)
  .https.onCall(async (data, context) => {
    // Stub: No business logic
    return NOT_IMPLEMENTED;
  });

/**
 * adminProxyAssignSquare
 * Purpose: Transition square from available → confirmed (bypass reservation timer)
 */
export const adminProxyAssignSquare = functions
  .region(REGION)
  .https.onCall(async (data, context) => {
    // Stub: No business logic
    return NOT_IMPLEMENTED;
  });

/**
 * claimAdminCreatedParticipant
 * Purpose: Links authenticated UID to an admin-created participant by phoneE164,
 *          migrates ownership, marks original record deprecated
 */
export const claimAdminCreatedParticipant = functions
  .region(REGION)
  .https.onCall(async (data, context) => {
    // Stub: No business logic
    return NOT_IMPLEMENTED;
  });

/**
 * lockGame
 * Purpose: Transition game from open → locked, finalize grid digits
 */
export const lockGame = functions
  .region(REGION)
  .https.onCall(async (data, context) => {
    // Stub: No business logic
    return NOT_IMPLEMENTED;
  });

/**
 * submitScore
 * Purpose: Create scoreEvent, calculate winner, update game state
 */
export const submitScore = functions
  .region(REGION)
  .https.onCall(async (data, context) => {
    // Stub: No business logic
    return NOT_IMPLEMENTED;
  });

// ============================================================================
// SCHEDULED FUNCTIONS (Appendix A.4)
// ============================================================================

/**
 * autoReleaseExpiredReservations
 * Schedule: Every 5 minutes
 * Purpose: Revert reserved → available if reservedUntil expired
 */
export const autoReleaseExpiredReservations = functions
  .region(REGION)
  .pubsub.schedule("every 5 minutes")
  .onRun(async (context) => {
    // Stub: No Firestore operations, log-only
    console.log("[autoReleaseExpiredReservations] Stub execution - no operations performed");
    return null;
  });

/**
 * autoLockGamesAtCloseTime
 * Schedule: Every 1 minute
 * Purpose: Transition open → locked if closesAt reached
 */
export const autoLockGamesAtCloseTime = functions
  .region(REGION)
  .pubsub.schedule("every 1 minutes")
  .onRun(async (context) => {
    // Stub: No Firestore operations, log-only
    console.log("[autoLockGamesAtCloseTime] Stub execution - no operations performed");
    return null;
  });

/**
 * processSmsOutbox
 * Schedule: Every 5 minutes
 * Purpose: Send queued SMS via Twilio, retry on transient failure
 */
export const processSmsOutbox = functions
  .region(REGION)
  .pubsub.schedule("every 5 minutes")
  .onRun(async (context) => {
    // Stub: No Firestore operations, no Twilio calls, log-only
    console.log("[processSmsOutbox] Stub execution - no operations performed");
    return null;
  });
