# Firebase Functions Deployment Guide

## Prerequisites

Ensure you're authenticated with Firebase CLI:

```powershell
firebase login
```

## Deployment Steps

### 1. Confirm Project Selection

```powershell
cd c:\TWG-LX
firebase use studio-3220084595-54dab
```

Expected output:
```
Now using project studio-3220084595-54dab
```

### 2. Deploy All Functions

```powershell
firebase deploy --only functions
```

Expected output:
```
✔  functions: Finished running predeploy script.
i  functions: preparing codebase default for deployment
i  functions: ensuring required API cloudfunctions.googleapis.com is enabled...
i  functions: ensuring required API cloudbuild.googleapis.com is enabled...
✔  functions: required API cloudfunctions.googleapis.com is enabled
✔  functions: required API cloudbuild.googleapis.com is enabled
i  functions: uploading functions archive to Firebase...

✔  functions[us-central1-createUserProfile]: Successful create operation.
✔  functions[us-central1-reserveSquare]: Successful create operation.
✔  functions[us-central1-confirmPaymentIntent]: Successful create operation.
✔  functions[us-central1-adminConfirmPayment]: Successful create operation.
✔  functions[us-central1-adminVoidSquare]: Successful create operation.
✔  functions[us-central1-adminProxyAssignSquare]: Successful create operation.
✔  functions[us-central1-claimAdminCreatedParticipant]: Successful create operation.
✔  functions[us-central1-lockGame]: Successful create operation.
✔  functions[us-central1-submitScore]: Successful create operation.
✔  functions[us-central1-autoReleaseExpiredReservations]: Successful create operation.
✔  functions[us-central1-autoLockGamesAtCloseTime]: Successful create operation.
✔  functions[us-central1-processSmsOutbox]: Successful create operation.

✔  Deploy complete!
```

### 3. Verify Deployment

List all deployed functions:

```powershell
firebase functions:list
```

Expected: 12 functions, all in us-central1

### 4. View Function Logs

```powershell
firebase functions:log
```

## Canonical Functions (Appendix A.4)

### Callable Functions (9)
1. createUserProfile
2. reserveSquare
3. confirmPaymentIntent
4. adminConfirmPayment
5. adminVoidSquare
6. adminProxyAssignSquare
7. claimAdminCreatedParticipant
8. lockGame
9. submitScore

### Scheduled Functions (3)
10. autoReleaseExpiredReservations (every 5 minutes)
11. autoLockGamesAtCloseTime (every 1 minute)
12. processSmsOutbox (every 5 minutes)

## Testing a Callable Function

See `test-function.js` for a Node.js script to invoke a callable function and verify it returns NOT_IMPLEMENTED.
