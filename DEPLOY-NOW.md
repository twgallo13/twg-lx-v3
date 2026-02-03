# 🚀 DEPLOY NOW — Step-by-Step Guide

**Status:** Functions are built and ready. Authentication required to deploy.

---

## ⚡ Quick Deploy (3 Steps)

### Step 1: Authenticate

```powershell
cd c:\TWG-LX
firebase login
```

**What happens:**
- A browser window will open automatically
- Sign in with the Google account that has access to the Firebase project
- Return to the terminal when authentication completes

**Expected output:**
```
✔  Success! Logged in as your-email@example.com
```

---

### Step 2: Deploy Functions

```powershell
firebase deploy --only functions
```

**This will take 2-5 minutes.** Watch for:

✅ **Critical success indicators:**
```
✔  functions[createUserProfile(us-central1)] Successful create operation.
✔  functions[reserveSquare(us-central1)] Successful create operation.
✔  functions[confirmPaymentIntent(us-central1)] Successful create operation.
✔  functions[adminConfirmPayment(us-central1)] Successful create operation.
✔  functions[adminVoidSquare(us-central1)] Successful create operation.
✔  functions[adminProxyAssignSquare(us-central1)] Successful create operation.
✔  functions[claimAdminCreatedParticipant(us-central1)] Successful create operation.
✔  functions[lockGame(us-central1)] Successful create operation.
✔  functions[submitScore(us-central1)] Successful create operation.
✔  functions[autoReleaseExpiredReservations(us-central1)] Successful create operation.
✔  functions[autoLockGamesAtCloseTime(us-central1)] Successful create operation.
✔  functions[processSmsOutbox(us-central1)] Successful create operation.

✔  Deploy complete!
```

**Copy the entire output** and paste it into `DEPLOYMENT-EVIDENCE.md` under section "3. Deployment"

---

### Step 3: Verify Deployment

```powershell
firebase functions:list
```

**Expected output:**
```
┌────────────────────────────────────┬─────────────┬───────────┐
│ Function Name                      │ Region      │ Trigger   │
├────────────────────────────────────┼─────────────┼───────────┤
│ createUserProfile                  │ us-central1 │ HTTP      │
│ reserveSquare                      │ us-central1 │ HTTP      │
│ confirmPaymentIntent               │ us-central1 │ HTTP      │
│ adminConfirmPayment                │ us-central1 │ HTTP      │
│ adminVoidSquare                    │ us-central1 │ HTTP      │
│ adminProxyAssignSquare             │ us-central1 │ HTTP      │
│ claimAdminCreatedParticipant       │ us-central1 │ HTTP      │
│ lockGame                           │ us-central1 │ HTTP      │
│ submitScore                        │ us-central1 │ HTTP      │
│ autoReleaseExpiredReservations     │ us-central1 │ Scheduled │
│ autoLockGamesAtCloseTime           │ us-central1 │ Scheduled │
│ processSmsOutbox                   │ us-central1 │ Scheduled │
└────────────────────────────────────┴─────────────┴───────────┘

12 function(s) total.
```

**Verify:**
- ✅ Exactly 12 functions
- ✅ All in `us-central1`
- ✅ 9 HTTP (callable)
- ✅ 3 Scheduled

**Copy this output** and paste it into `DEPLOYMENT-EVIDENCE.md` under section "4. Functions List"

---

## 🧪 Test Callable Function

### Install test dependencies (one-time):

```powershell
npm install firebase
```

### Run test:

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

**Copy this output** and paste it into `DEPLOYMENT-EVIDENCE.md` under section "5. Test Invocation"

---

## 📋 Evidence Checklist

After completing all steps above, ensure `DEPLOYMENT-EVIDENCE.md` contains:

- [ ] Authentication output (section 1)
- [ ] Project selection output (section 2)
- [ ] Full deployment output showing all 12 functions (section 3)
- [ ] `firebase functions:list` output (section 4)
- [ ] Test invocation output showing NOT_IMPLEMENTED (section 5)
- [ ] Region confirmation: us-central1 (section 6)
- [ ] Files changed: none (section 8)

---

## 🌐 Firebase Console Verification

Open: https://console.firebase.google.com/project/studio-3220084595-54dab/functions

**Verify:**
1. All 12 functions are visible
2. All have green status indicators
3. Click any function → Details → Region shows `us-central1`

Take a screenshot and save as `functions-deployed-screenshot.png`

---

## ✅ Success Criteria

Deployment is successful when:

- ✅ All 12 Appendix A.4 functions deployed
- ✅ All functions in `us-central1` region
- ✅ `firebase functions:list` shows all 12 functions
- ✅ Test invocation returns `NOT_IMPLEMENTED`
- ✅ No Firestore changes (check console)
- ✅ No files modified locally (`git status` if using git)

---

## 🆘 Troubleshooting

### "Failed to authenticate"
**Fix:** Run `firebase login` again, ensure browser auth completes

### "Permission denied"
**Fix:** Verify Google account has Owner/Editor role on project `studio-3220084595-54dab`

### Functions not visible in console
**Fix:** Wait 60 seconds, refresh console. Run `firebase functions:log` to check for errors

### Test script errors
**Fix:** 
```powershell
# Ensure dependencies installed
npm install firebase

# Try again
node test-function.js
```

---

## 📞 Next Steps After Deployment

Once deployment is verified:

1. ✅ Backend contract established
2. ✅ All 12 canonical functions live in production
3. ✅ Frontend can call all 9 callable functions
4. ✅ Scheduled functions run on schedule (log-only, no operations)
5. ⏳ Ready for business logic implementation (future work)

**All functions return NOT_IMPLEMENTED until business logic is added.**

---

## 🎯 Summary

**Current Status:**
- Functions built: ✅
- Firebase CLI installed: ✅ (v14.18.0)
- Project configured: ✅ (studio-3220084595-54dab)
- Authentication: ⏳ Required (run `firebase login`)
- Deployment: ⏳ Pending (run `firebase deploy --only functions`)

**Action Required:** Run the 3 steps above to complete deployment.
