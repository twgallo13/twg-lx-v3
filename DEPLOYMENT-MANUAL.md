# Manual Deployment Instructions

## ⚠️ REQUIRED: Interactive Authentication

Firebase CLI requires browser-based authentication which cannot be automated. Follow these steps:

---

## Option 1: PowerShell Script (Recommended)

```powershell
cd c:\TWG-LX
.\deploy-functions.ps1
```

The script will:
1. Open browser for Firebase authentication
2. Set the correct project
3. Deploy all 12 functions
4. List deployed functions
5. Provide next steps

---

## Option 2: Manual Commands

### Step 1: Authenticate

```powershell
cd c:\TWG-LX
firebase login
```

**What happens:**
- Browser window opens
- Sign in with Google account that has access to `studio-3220084595-54dab`
- Return to terminal

**Expected output:**
```
✔  Success! Logged in as your-email@example.com
```

---

### Step 2: Set Project

```powershell
firebase use studio-3220084595-54dab
```

**Expected output:**
```
Now using project studio-3220084595-54dab
```

---

### Step 3: Deploy Functions

```powershell
firebase deploy --only functions
```

**Expected output:**
```
=== Deploying to 'studio-3220084595-54dab'...

i  deploying functions
i  functions: preparing codebase default for deployment
Running command: npm --prefix "$RESOURCE_DIR" run build

> twg-lx-functions@1.0.0 build
> tsc

✔  functions: Finished running predeploy script.
i  functions: ensuring required API cloudfunctions.googleapis.com is enabled...
i  functions: ensuring required API cloudbuild.googleapis.com is enabled...
✔  functions: required API cloudfunctions.googleapis.com is enabled
✔  functions: required API cloudbuild.googleapis.com is enabled
i  functions: preparing functions directory for uploading...
i  functions: packaged functions (X.XX KB) for uploading
✔  functions: functions folder uploaded successfully

The following functions are found in your project but do not exist in your local source code:
  No functions to remove.

The following functions will be deployed:
  createUserProfile(us-central1)
  reserveSquare(us-central1)
  confirmPaymentIntent(us-central1)
  adminConfirmPayment(us-central1)
  adminVoidSquare(us-central1)
  adminProxyAssignSquare(us-central1)
  claimAdminCreatedParticipant(us-central1)
  lockGame(us-central1)
  submitScore(us-central1)
  autoReleaseExpiredReservations(us-central1)
  autoLockGamesAtCloseTime(us-central1)
  processSmsOutbox(us-central1)

i  functions: creating Node.js 18 function createUserProfile(us-central1)...
✔  functions[createUserProfile(us-central1)] Successful create operation.
Function URL (createUserProfile(us-central1)): https://us-central1-studio-3220084595-54dab.cloudfunctions.net/createUserProfile

i  functions: creating Node.js 18 function reserveSquare(us-central1)...
✔  functions[reserveSquare(us-central1)] Successful create operation.
Function URL (reserveSquare(us-central1)): https://us-central1-studio-3220084595-54dab.cloudfunctions.net/reserveSquare

i  functions: creating Node.js 18 function confirmPaymentIntent(us-central1)...
✔  functions[confirmPaymentIntent(us-central1)] Successful create operation.

i  functions: creating Node.js 18 function adminConfirmPayment(us-central1)...
✔  functions[adminConfirmPayment(us-central1)] Successful create operation.

i  functions: creating Node.js 18 function adminVoidSquare(us-central1)...
✔  functions[adminVoidSquare(us-central1)] Successful create operation.

i  functions: creating Node.js 18 function adminProxyAssignSquare(us-central1)...
✔  functions[adminProxyAssignSquare(us-central1)] Successful create operation.

i  functions: creating Node.js 18 function claimAdminCreatedParticipant(us-central1)...
✔  functions[claimAdminCreatedParticipant(us-central1)] Successful create operation.

i  functions: creating Node.js 18 function lockGame(us-central1)...
✔  functions[lockGame(us-central1)] Successful create operation.

i  functions: creating Node.js 18 function submitScore(us-central1)...
✔  functions[submitScore(us-central1)] Successful create operation.

i  functions: creating Node.js 18 function autoReleaseExpiredReservations(us-central1)...
✔  functions[autoReleaseExpiredReservations(us-central1)] Successful create operation.
Scheduled cloud function created successfully.

i  functions: creating Node.js 18 function autoLockGamesAtCloseTime(us-central1)...
✔  functions[autoLockGamesAtCloseTime(us-central1)] Successful create operation.
Scheduled cloud function created successfully.

i  functions: creating Node.js 18 function processSmsOutbox(us-central1)...
✔  functions[processSmsOutbox(us-central1)] Successful create operation.
Scheduled cloud function created successfully.

✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/studio-3220084595-54dab/overview
```

**🎯 Success Indicators:**
- ✅ All 12 functions show "Successful create operation"
- ✅ All functions in `(us-central1)` region
- ✅ 3 scheduled functions show "Scheduled cloud function created successfully"

---

### Step 4: Verify Deployment

```powershell
firebase functions:list
```

**Expected output:**
```
┌────────────────────────────────────┬────────────────────────┬─────────────┐
│ Function Name                      │ Region                 │ Trigger     │
├────────────────────────────────────┼────────────────────────┼─────────────┤
│ createUserProfile                  │ us-central1            │ HTTP        │
│ reserveSquare                      │ us-central1            │ HTTP        │
│ confirmPaymentIntent               │ us-central1            │ HTTP        │
│ adminConfirmPayment                │ us-central1            │ HTTP        │
│ adminVoidSquare                    │ us-central1            │ HTTP        │
│ adminProxyAssignSquare             │ us-central1            │ HTTP        │
│ claimAdminCreatedParticipant       │ us-central1            │ HTTP        │
│ lockGame                           │ us-central1            │ HTTP        │
│ submitScore                        │ us-central1            │ HTTP        │
│ autoReleaseExpiredReservations     │ us-central1            │ Scheduled   │
│ autoLockGamesAtCloseTime           │ us-central1            │ Scheduled   │
│ processSmsOutbox                   │ us-central1            │ Scheduled   │
└────────────────────────────────────┴────────────────────────┴─────────────┘

12 function(s) total.
```

**🎯 Verification Checklist:**
- ✅ Exactly 12 functions listed
- ✅ All in `us-central1` region
- ✅ 9 HTTP triggers (callable functions)
- ✅ 3 Scheduled triggers (scheduled functions)

---

### Step 5: Test Callable Function

```powershell
node test-function.js
```

**Expected output:**
```
Testing createUserProfile callable function...

✅ Function invoked successfully
Response: {
  "error": "NOT_IMPLEMENTED",
  "message": "This function is not yet implemented. Business logic pending."
}

✅ PASS: Function returned NOT_IMPLEMENTED as expected
```

---

## Firebase Console Verification

1. Navigate to: https://console.firebase.google.com/project/studio-3220084595-54dab/functions
2. You should see all 12 functions listed
3. All should have green status indicators
4. Click any function to view details and confirm region: `us-central1`

---

## Troubleshooting

### Error: "Failed to authenticate"
**Solution:** Run `firebase login` and complete browser authentication

### Error: "Permission denied"
**Solution:** Ensure your Google account has Owner or Editor role on project `studio-3220084595-54dab`

### Error: "Cannot find module 'firebase'"
**Solution:** In project root, run: `npm install firebase firebase-admin`

### Functions not showing in console
**Solution:** 
1. Wait 30-60 seconds for propagation
2. Refresh Firebase Console
3. Check Cloud Functions logs for errors: `firebase functions:log`

---

## Post-Deployment

After successful deployment:

✅ All 12 canonical Appendix A.4 functions are live
✅ All respond with NOT_IMPLEMENTED (no business logic)
✅ Zero Firestore operations performed
✅ Scheduled functions run on schedule (log-only, no side effects)
✅ Frontend can call all 9 callable functions

**Ready for:** Backend business logic implementation (future work)

---

## Files Modified During Deployment

**Expected:** None (all functions were built locally before deployment)

If the deployment process modified any files, report them immediately as this may indicate an issue.
