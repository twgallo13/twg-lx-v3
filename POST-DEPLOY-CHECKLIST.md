# Post-Deployment Verification Checklist

## After running `firebase deploy --only functions`, complete this checklist:

---

## ✅ 1. Deployment Output Verification

**Command run:** `firebase deploy --only functions`

**Verify these lines appeared:**

- [ ] `✔  functions[createUserProfile(us-central1)] Successful create operation.`
- [ ] `✔  functions[reserveSquare(us-central1)] Successful create operation.`
- [ ] `✔  functions[confirmPaymentIntent(us-central1)] Successful create operation.`
- [ ] `✔  functions[adminConfirmPayment(us-central1)] Successful create operation.`
- [ ] `✔  functions[adminVoidSquare(us-central1)] Successful create operation.`
- [ ] `✔  functions[adminProxyAssignSquare(us-central1)] Successful create operation.`
- [ ] `✔  functions[claimAdminCreatedParticipant(us-central1)] Successful create operation.`
- [ ] `✔  functions[lockGame(us-central1)] Successful create operation.`
- [ ] `✔  functions[submitScore(us-central1)] Successful create operation.`
- [ ] `✔  functions[autoReleaseExpiredReservations(us-central1)] Successful create operation.`
- [ ] `✔  functions[autoLockGamesAtCloseTime(us-central1)] Successful create operation.`
- [ ] `✔  functions[processSmsOutbox(us-central1)] Successful create operation.`
- [ ] `✔  Deploy complete!`

**Status:** [ ] PASS / [ ] FAIL

---

## ✅ 2. Functions List Verification

**Command run:** `firebase functions:list`

**Verify:**

- [ ] Exactly 12 functions listed
- [ ] All functions show region: `us-central1`
- [ ] 9 functions show trigger: `HTTP`
- [ ] 3 functions show trigger: `Scheduled`
- [ ] Output shows: `12 function(s) total.`

**Callable Functions (HTTP):**
- [ ] createUserProfile
- [ ] reserveSquare
- [ ] confirmPaymentIntent
- [ ] adminConfirmPayment
- [ ] adminVoidSquare
- [ ] adminProxyAssignSquare
- [ ] claimAdminCreatedParticipant
- [ ] lockGame
- [ ] submitScore

**Scheduled Functions:**
- [ ] autoReleaseExpiredReservations
- [ ] autoLockGamesAtCloseTime
- [ ] processSmsOutbox

**Status:** [ ] PASS / [ ] FAIL

---

## ✅ 3. Test Invocation Verification

**Command run:** `node test-function.js`

**Verify:**

- [ ] Script executed without errors
- [ ] Output shows: `✅ Function invoked successfully`
- [ ] Response contains: `"error": "NOT_IMPLEMENTED"`
- [ ] Response contains: `"message": "This function is not yet implemented..."`
- [ ] Output shows: `✅ PASS: Function returned NOT_IMPLEMENTED as expected`

**Status:** [ ] PASS / [ ] FAIL

---

## ✅ 4. Firebase Console Verification

**URL:** https://console.firebase.google.com/project/studio-3220084595-54dab/functions

**Verify:**

- [ ] All 12 functions visible in the list
- [ ] All functions have green/active status indicators
- [ ] Clicked one function → Details shows Region: `us-central1`
- [ ] No error logs in Cloud Functions logs

**Status:** [ ] PASS / [ ] FAIL

---

## ✅ 5. No Side Effects Verification

### Firestore Check

**URL:** https://console.firebase.google.com/project/studio-3220084595-54dab/firestore

- [ ] No unexpected collections created
- [ ] No documents added/modified
- [ ] Data unchanged from before deployment

### Storage Check

**URL:** https://console.firebase.google.com/project/studio-3220084595-54dab/storage

- [ ] No new files uploaded
- [ ] Storage unchanged from before deployment

**Status:** [ ] PASS / [ ] FAIL

---

## ✅ 6. Local Files Verification

**Command run:** `git status` (if using git) or manual check

**Verify:**

- [ ] No files modified during deployment
- [ ] `functions/lib/` directory exists (compiled output)
- [ ] No unexpected file changes

**Status:** [ ] PASS / [ ] FAIL

---

## ✅ 7. Region Confirmation

**From `firebase functions:list` output:**

All 12 functions deployed to region: **us-central1**

- [ ] Confirmed all functions in us-central1

**Status:** [ ] PASS / [ ] FAIL

---

## ✅ 8. Scheduled Functions Verification

**URL:** https://console.cloud.google.com/cloudscheduler?project=studio-3220084595-54dab

**Verify:**

- [ ] 3 scheduled jobs appear:
  - [ ] `autoReleaseExpiredReservations` (every 5 minutes)
  - [ ] `autoLockGamesAtCloseTime` (every 1 minute)
  - [ ] `processSmsOutbox` (every 5 minutes)
- [ ] All jobs show status: Enabled

**Status:** [ ] PASS / [ ] FAIL

---

## 🎯 OVERALL STATUS

**All checks passed:** [ ] YES / [ ] NO

**If NO, list failing checks:**
```
[List any checks that failed]
```

**Issues encountered:**
```
[Describe any issues]
```

**Resolved:** [ ] YES / [ ] NO / [ ] PARTIALLY

---

## 📝 Evidence Captured

Ensure all output is recorded in `DEPLOYMENT-EVIDENCE.md`:

- [ ] Authentication output
- [ ] Project selection output
- [ ] Full deployment output
- [ ] `firebase functions:list` output
- [ ] Test invocation output
- [ ] Region confirmation
- [ ] No side effects confirmation
- [ ] Files changed: none

---

## ✅ Acceptance Criteria Met

Final verification against original requirements:

- [ ] `firebase functions:list` shows all 12 canonical functions
- [ ] All functions deployed in us-central1
- [ ] Callable test invocation returns NOT_IMPLEMENTED
- [ ] No side effects (no Firestore ops)
- [ ] DEPLOYMENT-EVIDENCE.md completed with all outputs
- [ ] No files modified during deployment

**DEPLOYMENT VERIFIED:** [ ] YES / [ ] NO

---

## 📅 Completion

**Date/Time:** _______________  
**Deployed By:** _______________  
**Total Functions:** 12  
**Region:** us-central1  
**Status:** [ ] SUCCESS / [ ] FAILED  

**Signature:** _______________

---

## 🎉 Next Steps

After all checks pass:

1. ✅ Mark deployment as complete
2. ✅ Archive DEPLOYMENT-EVIDENCE.md
3. ✅ Notify team that backend contract is established
4. ✅ Frontend can now call all 9 callable functions
5. ⏳ Schedule business logic implementation (future work)

**All functions currently return NOT_IMPLEMENTED (expected behavior for stubs).**
