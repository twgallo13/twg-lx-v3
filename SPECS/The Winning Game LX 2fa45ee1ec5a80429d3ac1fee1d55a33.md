# The Winning Game LX

## **Section 0: Document Contract & Source of Truth**

**This document is the single authoritative source of truth for The Winning Game LX (V3). It defines all requirements, constraints, and behavioral specifications for the rebuild.**

### **0.1 Authoritative Hierarchy**

- **This document is the sole source of truth.** Any behavior not explicitly defined here must not be inferred, assumed, or added.
- **Backend is authoritative.** Cloud Functions and Firestore Security Rules enforce all state transitions, game logic, and data integrity. The frontend is non-authoritative and displays backend state only.
- **This is a fresh frontend build on an existing Firebase environment.** No data migration. No destructive operations. No deletion of existing records.
- **Non-goals are binding constraints, not suggestions.** Features listed as non-goals must never be implemented, even if they seem helpful or logical.

### **0.2 Explicit Non-Goals**

**The following features are explicitly excluded from The Winning Game LX. Do not implement, suggest, or build infrastructure for:**

- **No user-to-user direct messages.** Users cannot send private messages to each other within the application.
- **No square trading or resale.** Once a square is confirmed, it cannot be transferred, sold, or reassigned to another user.
- **No refunds or reversals via UI.** Financial disputes must be handled manually by the admin outside the system. The UI does not support automated refund workflows.
- **No admin deletion or mutation of audit logs.** Audit log entries are immutable. Admins cannot edit, delete, or modify historical audit records.
- **No AI-generated predictions stored as historical data.** AI-generated scouting reports and hype content are ephemeral and must not be saved to Firestore as permanent records.

### **0.3 System Authority Boundaries**

**To prevent logic duplication and state conflicts, authority is explicitly divided between backend and frontend:**

**Backend Enforces (Authoritative):**

- **Game locks:** Transition from open to locked status based on closesAt timestamp or admin action.
- **Square state transitions:** All moves through the state machine (available → reserved → pending_payment → confirmed/void) are validated and committed server-side.
- **Winner determination:** Score events trigger server-side winner calculation; frontend never computes winners.
- **Audit logging:** All financial and administrative actions are logged immutably in the auditLogs collection.

**Frontend Displays (Non-Authoritative):**

- **Timers:** Reservation countdown timers are visual-only. The backend auto-release function is the source of truth for expiration.
- **UI state:** All interactive elements reflect backend state via real-time Firestore listeners. The frontend never commits authoritative state changes directly.
- **Conflict resolution:** In any conflict between frontend display and backend state, backend state is correct and authoritative.

---

## **Section 1: Technical Configuration & Infrastructure**

### **1.1 Project Constants (Source of Truth)**

*These values are factual and fixed. Do NOT invent or guess new identifiers.*

- **Project Name:** Superbowl 2026
- **Project ID:** `studio-3220084595-54dab`
- **Project Number:** `171056784022`
- **Region / Location:** `us-central1`

*(Default for Firestore and Cloud Functions unless explicitly specified otherwise)*

- **Billing Plan:** Blaze (Pay as you go)

*(Required for Cloud Functions and Cloud Build)*

### **1.2 Firebase Web Configuration (Environment Variables)**

*Use these exact keys for initializing the app. Do not generate new API keys.*

```jsx
const firebaseConfig = {
  apiKey: "AIzaSyAVSevNYj_NlGwQqLqNyZabCh116v19Fag",
  authDomain: "studio-3220084595-54dab.firebaseapp.com",
  projectId: "studio-3220084595-54dab",
  storageBucket: "studio-3220084595-54dab.firebasestorage.app",
  messagingSenderId: "171056784022",
  appId: "1:171056784022:web:55c6c576644e02116298b7"
};
```

*Source: Firebase Console → Project Settings → SDK Setup*

### **1.3 Service Architecture (Enabled APIs — Why & How)**

*The following Google Cloud APIs are enabled. No additional configuration is required beyond enabling them.*

| **Service / API** | **Why (Role)** | **How (Usage Context)** |
| --- | --- | --- |
| **Cloud Workstations API** | **Development Environment** | **Required to launch Firebase Studio workspaces. Passive dependency.** |
| **Cloud Functions API** | **Backend Logic ("Backend is Law")** | **Executes all authoritative server-side logic (game locks, winners, enforcement).** |
| **Cloud Build API** | **Automated Builder** | **Builds frontend and backend artifacts during deployment. Triggered by `firebase deploy`.** |
| **Artifact Registry API** | **Deployment Storage** | **Stores built artifacts for redeploys. Used automatically by Cloud Build.** |
| **Firebase Management API** | **Project Introspection** | **Allows CLI and AI tools to read project configuration safely.** |

### **1.4 Enablement Rule (Non-Negotiable)**

For the services above:

- **Enable = sufficient**
- No per-API configuration is required
- Do not add IAM rules unless explicitly defined elsewhere
- If an API is disabled, deployments or IDE startup will fail

---

This **Project Launch Checklist** ensures that the first 60 minutes of your **The Winners Grid (TWG)** rebuild are perfectly synced across GitHub, Firebase, and your development environment.

### **Phase 1: Environment & Infrastructure (Minutes 0–20)**

- **Step 1: Mandatory GitHub Sync**
    - Initialize a new repository and link it to your Firebase project **before** writing code to prevent VM-based data loss.
- **Step 2: Enable Mandatory APIs**
    - Manually enable **Cloud Workstations**, **App Hosting**, **Firebase Storage**, and **Firebase Functions** in the Google Cloud Console.
- **Step 3: Billing Verification**
    - Confirm your project is on the **Blaze (Pay-as-you-go) Plan** to support Cloud Functions, external messaging, and Storage.

### **Phase 2: Configuration & Security (Minutes 20–40)**

- **Step 4: Standardize next.config.ts**
    - Apply the allowedDevOrigins to trust the Cloud Workstation domain.
    - Add Webpack **polling** (1000ms) to prevent file-watching hangs in the cloud environment.
- **Step 5: Apply Storage CORS Policy**
    - Run the terminal command: gsutil cors set cors.json gs://[PROJECT_ID].firebasestorage.app.
- **Step 6: Hardened Security Rules**
    - Deploy the V3 rules requiring isSignedIn() for public data and isAdmin() for the **Command Center** and **Clearinghouse**.

### **Phase 3: Core Data Setup (Minutes 40–60)**

- **Step 7: Manual Admin Assignment**
    - In the Firestore Data tab, create an admins collection.
    - Create a document with your UID (xbiKtluKLzNg9pQnENNYySBs7P12) and field active: true.
- **Step 8: Define the Schema Logic**
    - Ensure the games collection includes the new payoutConfig map for **Progressive** and **Tiered** modes.
- **Step 9: Initialize Audit Logs**
    - Verify the auditLogs collection is ready to receive PAYMENT_CONFIRMED and WINNER_ANNOUNCED events.

## **Section 2: Project Foundation & Environment Setup**

**This section establishes the technical bedrock for The Winning Game LX (V3). It defines the technology stack, mandatory cloud environment configurations to prevent stability issues, and the Twilio integration for secure authentication and notifications.**

### **1.1 Technical Stack (The "Greenfield" Rebuild)**

- **Framework: Next.js 15.5.9 NO TURBOPACK (Standard Webpack for stability in cloud cluster environments).**
- **Language: TypeScript (Strict Mode).**
- **Backend & Data: Firebase (Firestore, Storage, App Hosting).**
- **AI Engine: Google Gemini via Genkit.**
- **Messaging: Twilio for outbound SMS and Firebase Phone Auth for identity.**
- **UI Library: Shadcn UI + Tailwind CSS (Light Mode default).**

### **1.2 Environment Stability Hooks (Mandatory)**

**To prevent the "Starting app" loops and WebSocket failures encountered in previous iterations, these configurations must be applied immediately upon project initialization.**

### **next.config.ts Configuration**

**TypeScript**

****

**const nextConfig = {**

**experimental: {**

**// Explicitly trust the Cloud Workstation domain for internal resource loading**

**allowedDevOrigins: ['*.cloudworkstations.dev'] [cite: 1365, 1754]**

**},**

**webpack: (config) => {**

**// Use polling to prevent file-watching hangs in cloud container environments**

**config.watchOptions = {**

**poll: 1000,**

**aggregateTimeout: 300**

**}; [cite: 1524, 1767]**

**return config;**

**},**

**images: {**

**// Standardize for modern props to avoid legacy layout console noise**

**remotePatterns: [{ protocol: 'https', hostname: 'firebasestorage.googleapis.com' }] [cite: 1120, 1392]**

**}**

**};**

**export default nextConfig;**

### **Firebase Storage CORS Policy**

**A cors.json file must be applied via terminal to the .firebasestorage.app bucket to allow file uploads from the development workstation.**

**JSON**

****

**[**

**{**

**"origin": ["*"],**

**"method": ["GET", "POST", "PUT", "DELETE", "HEAD"],**

**"maxAgeSeconds": 3600**

**}**

**]**

**Terminal Command: gsutil cors set cors.json gs://studio-[project-id].firebasestorage.app.**

### 1.3 Authentication & Messaging (Twilio Integration) (Updated)

> Authentication is strictly phone-based (No passwords) using E.164 formatting.
> 
- **Identity Provider: Firebase Phone Auth is used strictly for user login only via SMS OTP (Zero-cost for current volumes (<10k/month)).**
- **Messaging Provider: Twilio Programmable Messaging is used strictly for transactional game alerts only (Score changes, wins, and payment reminders).**
- **Compliance Requirement: All high-volume messaging must include 10DLC A2P Registration via Twilio to ensure deliverability.**
- **Data Requirement: All phone numbers must be stored in the users collection in a hidden phoneE164 field.**
- **Admin-Created Participant Phone Handling: For Admin-Created Participants (manually created accounts for non-tech/offline players), the phoneE164 field is required and must be a valid E.164 phone number. No placeholder values are permitted.**

### **1.4 Environment Constraints: Must Reuse / Must Not Recreate**

**This rebuild operates on an existing Firebase environment. The following infrastructure must be reused exactly as-is:**

| **Component** | **Status** | **Identifier** |
| --- | --- | --- |
| **Firebase Project** | **Must Reuse** | **studio-3220084595-54dab** |
| **Firestore Collections** | **Must Reuse** | **users, games, admins, auditLogs, smsOutbox (and sub-collections)** |
| **Storage Bucket** | **Must Reuse** | [**studio-3220084595-54dab.firebasestorage.app**](http://studio-3220084595-54dab.firebasestorage.app) |
| **Storage Path** | **Must Reuse** | **/payout_qrs/{uid}/qr.png** |
| **Billing Plan** | **Must Reuse** | **Blaze (Pay-as-you-go)** |
| **Next.js Frontend** | **Fresh Build** | **New codebase; deploy via Firebase App Hosting** |

**Critical Constraints:**

- **No deletion of existing Firestore records.** The frontend must gracefully handle existing data.
- **No destructive Storage operations.** Existing QR codes and payout proofs must remain accessible.
- **No Firebase project recreation or migration.** All development and production builds use the existing project.

### **1.5 Data Validation Rules**

**To ensure data integrity across the existing environment and new frontend:**

- **Phone Number Format:** All phone numbers stored in the phoneE164 field must be in strict E.164 international format (e.g., +12125551234). No exceptions. This applies to all users including Admin-Created Participants.
- **SMS Opt-In Preservation:** The onboarding wizard must not overwrite the existing smsOptIn field if it is already set to true. This field defaults to true for new users but must be preserved for existing users.
- **Admin-Created Participant Requirements:** For Admin-Created Participants (isShadowUser: true), both phoneE164 (valid E.164 format) and username are required fields at creation time. The name field is optional.

### **1.6 Initialization Guardrails**

1. **Mandatory GitHub Sync: The project must be linked to a GitHub repository before any feature development begins to prevent data loss due to VM provisioning hangs.**
2. **API Verification: Cloud Workstations, App Hosting, and Firebase Storage must be manually enabled in the Google Cloud Console before the first build.**
3. **Blaze Plan: The project must be confirmed on the "Blaze Pay-as-you-go" plan to support Cloud Functions and external API calls (Twilio/Gemini).**

## **Section 3: Core Data Schema**

**This section defines the structural integrity of The Winning Game LX. It outlines the Firestore collection hierarchy, field types, Storage bucket organization, and the role-based permission model required to support a scalable, multi-game platform with robust audit tracking.**

### **2.0 Role & Permission Matrix**

**The Winning Game LX operates on a strict role-based permission model enforced by Firestore Security Rules and Cloud Functions. The following matrix defines all access boundaries.**

| **Role / Entity** | **Read Permissions** | **Write Permissions** | **Restricted Actions** | **UI Visibility** | **Backend Enforcement** |
| --- | --- | --- | --- | --- | --- |
| **Admin** | **Full read access to all collections: users, games, squares, scoreEvents, auditLogs, smsOutbox, admins.** | **Full write access to all collections except auditLogs (append-only). Can create/modify games, confirm payments, assign squares via proxy, submit scores, and register Shadow Users.** | **Cannot delete or modify auditLogs entries. Cannot impersonate users for authentication.** | **Command Center, Clearinghouse, Payout Hub, Audit Feed, Global User CRM, and all game grids.** | **Verified via admins/{uid} with active: true. All admin actions require isAdmin() check in Security Rules.** |
| **User** | **Read own user document. Read all games. Read all squares. Read own square reservations and ownership. Cannot read other users' phoneE164 or PII.** | **Write own user profile (username, payoutMethod, payoutHandle, payoutQrUrl). Reserve squares (transition available → reserved). Confirm payment intent (transition reserved → pending_payment). Cannot write to games, scoreEvents, or auditLogs.** | **Cannot confirm own payments. Cannot assign squares to others. Cannot modify game settings or scores. Cannot access admin-only collections.** | **Dashboard, Game Grids (player view), Profile, Leaderboard, Onboarding Wizard.** | **Verified via Firebase Auth UID. Security Rules enforce request.auth.uid == [resource.id](http://resource.id) for user document writes.** |
| **Admin-Created Participant (Entity)** | **No independent read access. Admin-Created Participants are dormant user documents created by admins for offline/non-tech players to ensure anyone can participate.** | **No independent write access. Admin-Created Participants cannot act until claimed via first authentication.** | **Cannot log in. Cannot reserve squares. Cannot receive notifications (isShadowUser: true blocks all SMS/Email). Admins assign squares on their behalf via Proxy Mode.** | **No UI access. Admin-Created Participants are claimable inactive entities until first login.** | **Created via admin CRM with required phoneE164 (valid E.164), required username, isShadowUser: true, suppressNotifications: true, and smsOptIn: false. Transition to active User upon first successful authentication.** |

**Explicit Permission Rules:**

- **Admin-Created Participants are claimable inactive users until first login.** Once an Admin-Created Participant authenticates (e.g., via Firebase Phone Auth), the isShadowUser flag must be set to false, and the user transitions to the active state.
- **Admin-Created Participants cannot act independently until authenticated.** All square assignments for Admin-Created Participants must be performed by admins using the Admin Proxy Selection workflow.
- **Admin authority is always verified via admins/{uid}.** The presence of a document in the admins collection with active: true is the sole source of truth for admin permissions. No role-based access control (RBAC) or custom claims are used.

### **2.0.1 User Lifecycle State Machine**

**Users transition through a strict lifecycle enforced by Cloud Functions and Security Rules. The following state machine prevents authentication and onboarding edge-case failures.**

| **State** | **Entry Condition** | **Allowed Transitions** | **Invalid Transitions (Forbidden)** |
| --- | --- | --- | --- |
| **admin_created** | **Admin manually creates an Admin-Created Participant via Global User CRM with required phoneE164 (valid E.164), required username, isShadowUser: true, suppressNotifications: true, and smsOptIn: false. The user has never authenticated.** | **→ active (first successful login and claim via claimAdminCreatedParticipant)** | **Cannot transition to active without authentication. Cannot transition to suppressed directly.** |
| **active** | **User has completed authentication and onboarding. Profile is complete (username set, phoneE164 valid). The user can interact with all game features.** | **→ suppressed (user opts out of notifications or admin sets suppressNotifications: true)** | **Cannot transition back to admin_created. Active is a terminal interactive state.** |
| **suppressed** | **User has opted out of notifications (smsOptIn: false) or admin has set suppressNotifications: true. The user remains active but receives zero outbound messages.** | **→ active (user re-enables notifications or admin clears suppressNotifications flag)** | **Cannot transition to admin_created. Suppressed state does not affect authentication or game participation.** |

**State Transition Rules:**

- **Entry to admin_created:** Admin creates Admin-Created Participant document with required phoneE164 (valid E.164), required username, isShadowUser: true, suppressNotifications: true, smsOptIn: false, and status: 'admin_created'.
- **admin_created → active:** Triggered by first successful Firebase Phone Auth login. The claimAdminCreatedParticipant Cloud Function creates a new UID-based user document, migrates data, sets isShadowUser: false and status: 'active', and redirects to Onboarding Wizard for confirmation.
- **active ↔ suppressed:** User toggles smsOptIn in profile settings, or admin manually sets suppressNotifications field. Notifications are blocked when suppressNotifications: true OR smsOptIn: false.

### **2.1 Firestore Collections (Top-Level)**

**User Lifecycle Status Field:**

All user documents must include a required `status` field with one of three values:

- **admin_created**: Admin-Created Participant (not logged in yet)
- **active**: Authenticated user who has completed onboarding
- **suppressed**: User who has opted out of notifications or has notifications disabled

This field is the single source of truth for user lifecycle state. All authentication, onboarding, and notification logic must reference `status`. No other lifecycle fields may substitute for it.

| **Collection** | **Purpose** | **Key Fields** |
| --- | --- | --- |
| **users/{authUid}** | **Player profiles and identity.** | **status (required): 'admin_created' | 'active' | 'suppressed', username, phoneE164, payoutMethod, payoutHandle, payoutQrUrl, smsOptIn, isShadowUser (bool), suppressNotifications (bool).** |
| **games/{gameId}** | **Global game state and configuration.** | **name, squarePrice, status (open/locked/final/archived), payoutConfig (type/values), paymentSettings.** |
| **admins/{authUid}** | **Explicit admin allowlist.** | **active (bool).** |
| **auditLogs/{logId}** | **Immutable record of financial and admin actions.** | **type, actorUserId, targetUserId, payload (map), timestamp.** |
| **smsOutbox/{smsId}** | **Queue for Twilio messaging triggers.** | **toUserId, message, status (queued/sent), dedupeKey.** |

## 2.2 Game Sub-Collections (Updated)

### **games/{gameId}/squares/{squareId} (100 documents)**

### **state: available, reserved, pending_payment, confirmed, void.**

### **row / col: Index (0–9).**

### **userId: The UID of the confirmed owner or current reserver.**

### **reservedUntil: Timestamp for auto-release logic.**

### **assignedByAdminId: The Admin UID who proxy-assigned this square (for audit purposes).**

### **games/{gameId}/scoreEvents/{eventId}**

### **quarter: q1, q2, q3, final.**

### **homeScore / awayScore: Integer.**

### **winnerSnapshot: Map of winning userId and squareId.**

###

### **2.3 Storage Bucket Structure**

**All files reside in the studio-[project-id].firebasestorage.app bucket.**

- **/payout_qrs/{userId}/qr.png: User-uploaded personal QR codes for receiving winnings.**
- **/game_qrs/{gameId}/{method}_qr.png: Admin-uploaded QR codes for specific game payment channels (Venmo, Zelle, etc.).**
- **/payout_proofs/{gameId}/{userId}_{timestamp}.png: Admin-uploaded screenshots confirming a payout has been sent.**

### **2.4 Indexing Requirements (firestore.indexes.json)**

**To support world-class dashboard performance and the "Live Community" feed, the following composite indexes are required:**

1. **Games: status (ASC) + updatedAt (DESC).**
2. **Squares: userId (ASC) + state (ASC).**
3. **Audit Logs: targetUserId (ASC) + timestamp (DESC).**
4. **SMS Outbox: status (ASC) + createdAt (ASC).**

## **Section 4: Lifecycle State Machines**

**This section defines the authoritative state machines for games and squares. These state machines are enforced exclusively by the backend (Cloud Functions and Firestore Security Rules). The frontend displays state but never commits state transitions directly.**

All backend services and deployments rely on the fixed infrastructure identifiers defined in Section 1 — Technical Configuration & Infrastructure.

> **UX Authority Reference:** User-facing behavior during lifecycle transitions must comply with Section 16 — Phase 2 Game Day UX Moment Map.
> 

### **3.1 Game Lifecycle State Machine**

**Games transition through a strict lifecycle that controls when users can reserve squares, when admins can modify settings, and when the game is considered complete. All transitions are backend-enforced.**

| **State** | **Who Can Trigger Transition** | **Backend Enforcement** | **UI Behavior** | **Disallowed Actions** |
| --- | --- | --- | --- | --- |
| **open** | **Admin creates a new game via Game Central.** | **Cloud Function initializes game document with status: 'open'. Firestore Security Rules allow square reservations only when game.status == 'open'.** | **Grid is fully interactive. Users can reserve available squares. 'Time Until Lock' countdown displays if closesAt is set.** | **Admin Proxy Selection Toggle is disabled if game is locked or final. Score submission is blocked (no scoreEvents can be created).** |
| **locked** | **Admin manually locks the game, OR closesAt timestamp is reached (automated transition via scheduled Cloud Function).** | **Cloud Function sets status: 'locked', finalizes grid digits (rowDigits, colDigits), and records digitsFinalizedAt and digitsFinalizedBy. Security Rules block all new square reservations.** | **Grid becomes read-only for users. Finalized row/column digits are displayed. Admin can begin submitting scores. Admin Proxy Selection Toggle is automatically disabled.** | **Users cannot reserve new squares. Users cannot modify existing reservations. Admins cannot change squarePrice or payoutConfig. Admins cannot delete the game.** |
| **final** | **Admin submits the final score (quarter: 'final') via Game Control.** | **Cloud Function creates final scoreEvent, calculates final winner, writes winnerSnapshot, and sets status: 'final'. Payout Hub becomes active for this game.** | **Grid displays all four winners (Q1, Q2, Q3, Final). Confetti animation triggers for winners. Admin Proxy Selection Toggle remains disabled. Payout Hub shows pending payouts.** | **Score edits require Manual Override with mandatory reason. Admin cannot reopen the game to 'open' or 'locked'. Users cannot modify square ownership.** |
| **archived** | **Admin manually archives the game after all payouts are confirmed.** | **Cloud Function sets status: 'archived'. Game is removed from active game lists but remains in Firestore for historical audit.** | **Game appears in 'Past Games' section only. Grid is read-only. Winners Wall displays historical data. No admin actions are available except viewing Audit Feed.** | **No state reversals. Archived games cannot transition back to open, locked, or final. No new scoreEvents. No payout modifications.** |

**State Transition Diagram:**

- **open → locked:** Admin action OR closesAt timestamp reached
- **locked → final:** Admin submits final scoreEvent (quarter: 'final')
- **final → archived:** Admin confirms all payouts complete and manually archives
- **Invalid transitions:** locked → open, final → locked, archived → any state

### **3.2 Square Lifecycle State Machine**

**Every square on the 10x10 grid follows a strict linear progression enforced by Cloud Functions. This state machine prevents race conditions, duplicate ownership, and unauthorized modifications.**

| **State** | **Trigger Source** | **Required Audit Log Entry** | **Auto-Release Conditions** | **Proxy Mode Behavior** |
| --- | --- | --- | --- | --- |
| **available** | **Default state when game is created, OR auto-release function reverts reserved square, OR admin voids a square.** | **No audit log entry required.** | **N/A (terminal state until user action).** | **Admin can select this square via Proxy Mode to instantly assign to a selected user and transition to confirmed.** |
| **reserved** | **User taps an available square. Cloud Function validates game.status == 'open' and square.state == 'available', then atomically sets state: 'reserved', userId: request.auth.uid, reservedUntil: now + 15 minutes.** | **No audit log entry required (temporary reservation).** | **Scheduled Cloud Function runs every 5 minutes. If now > reservedUntil, transition to available and clear userId.** | **Proxy Mode bypasses reserved state entirely. Admin selection transitions available → confirmed directly.** |
| **pending_payment** | **User confirms selection in Orchestrator Modal. Cloud Function validates square.state == 'reserved' and square.userId == request.auth.uid, then sets state: 'pending_payment' and clears reservedUntil.** | **No audit log entry required (awaiting admin verification).** | **No auto-release. Square remains in pending_payment until admin confirms or voids.** | **Not applicable. Proxy Mode skips pending_payment entirely.** |
| **confirmed** | **Admin verifies payment in Clearinghouse and clicks 'Confirm'. Cloud Function validates admin permissions, sets state: 'confirmed', increments game pot, and enqueues SMS alert to user.** | **Required: type: 'PAYMENT_CONFIRMED', actorUserId: admin UID, targetUserId: square owner UID, amount: game.squarePrice, squareIds: [squareId].** | **No auto-release. Confirmed is a terminal state.** | **Admin Proxy Selection transitions available → confirmed instantly, skipping reserved and pending_payment. Audit log required: type: 'ADMIN_PROXY_ASSIGNMENT'.** |
| **void** | **Admin cancels a reservation (reserved or pending_payment) with a mandatory reason. Cloud Function validates admin permissions, sets state: 'void', clears userId, and records reason.** | **Required: type: 'SQUARE_VOIDED', actorUserId: admin UID, targetUserId: original square holder UID, reason: admin-provided reason, squareIds: [squareId].** | **Void is temporary. Cloud Function immediately transitions void → available after audit log write.** | **Not applicable. Voided squares return to available and can be reassigned via Proxy Mode.** |

**State Transition Rules:**

- **available → reserved:** User-initiated via square tap (validated by Cloud Function with Firestore Transaction to prevent race conditions)
- **reserved → available:** Auto-release function (scheduled every 5 minutes) OR user cancels own reservation
- **reserved → pending_payment:** User confirms in Orchestrator Modal
- **pending_payment → confirmed:** Admin verifies payment in Clearinghouse
- **pending_payment → void:** Admin cancels with reason
- **available → confirmed:** Admin Proxy Selection (bypasses reserved and pending_payment)
- **confirmed → void:** Forbidden (confirmed squares cannot be voided; dispute resolution is manual)
- **void → available:** Automatic immediate transition after audit log write

**Invalid Transitions (Explicitly Forbidden):**

- **pending_payment → reserved:** Cannot revert to timer-based reservation
- **confirmed → available:** Confirmed ownership is permanent
- **confirmed → pending_payment:** Cannot un-confirm a square
- **void → confirmed:** Cannot confirm a voided square without transitioning to available first

## **Section 5: Identity & Onboarding**

**This section defines the critical first-touch experience for The Winning Game LX. It ensures privacy by hiding sensitive data while building a social atmosphere through unique, fun identities.**

### **4.1 Authentication Strategy**

- **Phone-Only Access: Authentication uses Firebase Phone Auth (SMS OTP) only.**
- **No Passwords: Authentication is strictly linked to a verified phone number.**
- **No Manual Fallback: Users who cannot receive SMS do not log in. They can still participate via Admin-Created Participant workflow with admin-assigned squares.**

### **4.2 The Onboarding Wizard (Blocking)**

> New users cannot access the Dashboard or Games until the following profile fields are completed:
> 
- **Username (Required): Must be unique. UI copy should encourage "fun names your friends will recognize."**
- **Phone Number (Hidden): Stored only in E.164 format for authentication; never displayed publicly.**
- **Favorite Team (Optional): Used to personalize AI scouting reports and UI accents.**
- **Admin-Created Participants: A user manually created by an admin for non-tech/offline players to ensure anyone can participate. These accounts are flagged with isShadowUser: true and require both phoneE164 (valid E.164) and username at creation.**

### **4.3 Security & Logic (Cloud Functions)**

- **createUserProfile: An HTTPS Callable function that is executed after onboarding completion. It initializes or finalizes the UID-based user document with status: 'active'. There is no intermediate lifecycle state during onboarding.**
    1. **Verifies the user is authenticated.**
    2. **Checks that the requested username is not already taken in the users collection.**
    3. **Creates or initializes the users/{authUid} document with default values: smsOptIn: true, status: 'active', and authMode: 'sms'.**
    4. **For new users (not claimed Admin-Created Participants), this function creates the initial user document. For claimed Admin-Created Participants, the claimAdminCreatedParticipant function has already created the UID-based document, so createUserProfile only updates it with final onboarding data.**
- **Admin CRM Visibility: Admins have full CRUD access to the users collection via a dedicated "Global User CRM" tab. When creating Admin-Created Participants, both phoneE164 (valid E.164) and username are required fields.**

### **4.4 Data Privacy Guardrails**

- **PII Protection: Firestore security rules must strictly prevent standard users from reading the phoneE164 field of any other user.**
- **Username-Only UI: All public grids, leaderboards, and activity tickers must use the username field.**
- **Notification Suppression: The system must check the suppressNotifications field (set to true for all Admin-Created Participants) and disable all SMS and Email alerts for that user.**

### **4.5 Admin-Created Participant Claiming & Account Reconciliation**

**Admin-Created Participants are pre-created user documents that allow admins to ensure anyone can participate, including offline or non-tech players, before they authenticate. The system must prevent duplicate accounts and safely reconcile Firebase Auth UIDs with pre-existing user records.**

**Admin-Created Participant Creation (Admin-Initiated):**

Admins manually create Admin-Created Participant documents via the Global User CRM with:

- `phoneE164`: **Required** - Valid E.164 phone number (e.g., +12125551234)
- `username`: **Required** - Pre-assigned username for use on grids and leaderboards
- `name`: **Optional** - If present historically, keep; otherwise not required
- `isShadowUser`: true (internal flag)
- `suppressNotifications`: true
- `smsOptIn`: false
- No Firebase Auth UID (document ID is a temporary placeholder)

**Admin Proxy Assignment:**

- Once created, admins can immediately assign squares to the Admin-Created Participant via the Admin Proxy Selection workflow.
- Assigned squares are marked with the Admin-Created Participant's temporary document ID and transition directly to confirmed state.

**First Authentication & Claiming Workflow:**

When a person successfully authenticates via Firebase Phone Auth for the first time, the `claimAdminCreatedParticipant` Cloud Function is invoked:

1. **Lookup by phoneE164:** The function queries the users collection for an existing document where phoneE164 matches the authenticated phone number **and isDeprecated == false** (or isDeprecated is not set).
2. **If found and status == 'admin_created':**
    - The authenticated Firebase Auth UID claims that existing user record.
    - The function creates a new user document with the authenticated UID as the document ID, copying all data from the Admin-Created Participant document.
    - The new user document sets isShadowUser: false and status: 'active'.
    - All square assignments and audit log entries are migrated to the new UID.
    - The original Admin-Created Participant document is retained and marked with:
        - isDeprecated: true
        - claimedByUid: {new authenticated UID}
        - claimedAt: {timestamp}
        - phoneE164Deprecated: {original phoneE164}
        - phoneE164: null (cleared to prevent lookup collisions)
    - The user is redirected to complete the Onboarding Wizard (username is pre-populated and can be confirmed or changed).
3. **If found and status != 'admin_created':**
    - The user is an existing active user. Skip onboarding and redirect to Dashboard.
4. **If not found:**
    - Create a new user document with the authenticated UID, set status: 'active', and redirect to Onboarding Wizard.
5. **If multiple non-deprecated matches exist:**
    - Block authentication and display an error: "Multiple accounts detected. Please contact support."
    - Require admin resolution via the Global User CRM to merge or delete duplicate records.

**Authoritative Document Rules:**

- **After claiming, the UID-based user document is the only authoritative user record for reads/writes.** All game logic, permissions checks, and UI displays must reference the UID-based document only.
- **The original Admin-Created Participant record becomes audit-only** (isDeprecated: true) and must never be used as an active identity.
- **Deprecated records must not be returned by phoneE164 lookups.** All queries by phoneE164 must include `isDeprecated == false` (or equivalent) and must ignore deprecated records.

**Explicit Constraints:**

- **Only one non-deprecated record may contain a given phoneE164.** The system must enforce uniqueness via Firestore composite indexes or query validation for non-deprecated records only.
- **Deprecated records must not retain phoneE164 in the main field.** During deprecation, the phone number is moved to phoneE164Deprecated and the phoneE164 field is set to null.
- **Auto-creation of a second user record for the same phone is explicitly forbidden.** The claiming workflow must always check for existing non-deprecated records before creating new ones.
- **All Admin-Created Participants must have valid E.164 phoneE164 at creation.** No placeholder values are permitted.

**UID Reconciliation Rules:**

- The Firebase Auth UID is always the authoritative document ID for active users.
- Admin-Created Participant placeholder IDs are deprecated (not deleted) during the claiming process and marked with isDeprecated: true, claimedByUid, claimedAt, phoneE164Deprecated, and phoneE164: null.
- All square assignments and audit log entries for Admin-Created Participants (created via Admin Proxy Selection) must be migrated to the new UID during claiming.
- Deprecated Admin-Created Participant records are retained for audit purposes and must never be deleted.

## **Section 6: Game Orchestration**

**This section defines the multi-game architecture for The Winning Game LX. It focuses on the transition from a single-game demo to a scalable platform where admins can manage multiple matchups with independent pricing and unique payment settings.**

> **UX Authority Reference:** Game Day behavior and experience states must comply with Section 16 — PHASE 2 — Game Day UX Moment Map (Experience Contract).
> 

### **5.1 Game-Centric Architecture**

**The "Game" is the primary orchestrator of the user experience. All rules, pricing, and payment instructions are scoped to the individual game document rather than the global application settings.**

- **Multi-Game Support: The system must allow multiple games to exist simultaneously in different states (e.g., one $1 game, one $5 game, and one archived past game).**
- **Dynamic Identity: Each game supports custom homeTeam and awayTeam names, allowing for matchups beyond a single event.**

### **5.2 Variable Pricing & Payout Engine**

**Admins configure the financial stakes for each game individually.**

- **Square Price: Standard increments include $1, $2, or $5 per square, though the schema supports any positive integer.**
- **Payout Logic Modes:**
    - **Tiered: Fixed prize amounts set for Q1, Q2, Q3, and Final (e.g., $50 for Q1 regardless of pot size).**
    - **Progressive: Percentages of the total pot that increase as the game progresses (e.g., Q1: 10%, Q2: 20%, Q3: 30%, Final: 40%).**

### **5.3 Game-Specific Payment Settings (The Orchestrator)**

**To support diverse hosting scenarios, the "Pay the Host" information is linked directly to the game.**

- **Payment Channels: Each game can define its own handles and QR codes for:**
    - **Venmo, Zelle, Cash App, PayPal, Cash, and Other.**
- **Asset Management: QR codes are stored in Firebase Storage under /game_qrs/{gameId}/{method}_qr.png.**
- **Visibility: When a user selects a square, the app pulls these specific settings to populate the payment modal, ensuring money is routed correctly for that specific board.**

### **5.4 Automated Game Lifecycle**

- **Board Locks At (Optional): Admins can set a closesAt timestamp.**
- **Trigger: A scheduled Cloud Function exclusively transitions open → locked at closesAt. Frontend timers are visual only.**
- **Editability: Admins may modify or remove closesAt only while game.status == 'open'. Once game.status transitions to 'locked', the game cannot be reopened. locked → open is forbidden.**
- **Safety Guardrail (Admin Proxy Selection): The Admin Proxy Selection Toggle must be automatically disabled once a game is moved to 'Locked' or 'Final' status to prevent accidental post-game square assignments.**

## **Section 7: Square Lifecycle**

**This section defines the core interactive mechanism of The Winning Game LX. It details the strict backend state machine and the "Administrative Handshake" workflow that ensures data integrity and prevents disputes over square ownership.**

> **UX Authority Reference:** Square rendering and behavior must comply with Section 15 — PHASE 1 — Mobile Square Grid Hierarchy (UX Contract).
> 

> **Copy Authority Reference:** User-facing copy must comply with Phase 3 — UI Copy Rewrite (UX Contract).
> 

### **6.1 The Square State Machine**

**Every square on the 10x10 grid must follow a strict linear progression enforced by Cloud Functions.**

| **Backend State** | **UI Label** | **Condition / Trigger** |
| --- | --- | --- |
| **available** | **Open** | **Default state; interactive tap target for users.** |
| **reserved** | **Held (Timer)** | **User selects square; 15-minute countdown begins.** |
| **pending_payment** | **Waiting for Organizer** | **User confirms selection in Orchestrator Modal.** |
| **confirmed** | **Owned** | **Admin verifies payment in the Clearinghouse.** |
| **void** | **Released** | **Admin cancels reservation with a required reason.** |

### **6.2 The Orchestrator Modal (The Handshake)**

**When a user moves from reserved to pending_payment, they must interact with the High-Fidelity Orchestrator Modal.**

- **Verified Host Badge: Displays a metallic gold "Verified Host" badge to build user trust.**
- **Game-Centric Info: Displays the specific payment handles (Venmo, Zelle, etc.) and QR codes defined in the individual game settings.**
- **Tap-to-Copy: Provides one-tap copying of payment handles to eliminate mobile entry errors.**
- **Proof of Payment: Includes an optional file uploader for users to attach a screenshot of their transaction.**

### **6.3 Technical Logic & Automation**

- **Atomic Reservations: All reservations must use a Firestore Transaction to prevent two users from claiming the same square simultaneously.**
- **Auto-Release Cleanup: A scheduled Cloud Function runs every 5 minutes to find squares in the reserved state where reservedUntil is less than now, reverting them to available.**
- **Ownership Clarity: Claimed squares must display the Full Username (or first 8 characters + '...') instead of initials to enhance social recognition on the grid.**
- **Removal Logic: Users are permitted to remove their own reserved squares directly from the grid as long as the game status is open and not yet locked.**
- **Proxy Timer Bypass: The 'Admin Proxy Selection' workflow must bypass the standard 15-minute reservation timer and instantly transition the square state from available to confirmed.**

### **6.4 Audit Log Integration**

**Every transition from pending_payment to confirmed or void must write an immutable entry to the auditLogs.**

- **Required Fields: type, actorUserId (Admin), targetUserId (Player), amount, and squareIds.**

Square lifecycle, state, and rendering behavior are unaffected by branding asset changes. Branding rules are governed exclusively by Section 18 — Phase 3.1.

## **Section 8: Messaging & Notifications**

**This section defines the authoritative contract for all outbound messaging (SMS via Twilio) and the safety rules that prevent notification abuse, opt-in violations, and duplicate messages.**

### **7.1 SMS Outbox Contract**

**The smsOutbox collection is the exclusive write-only queue for all outbound SMS messages. The frontend may never call Twilio directly. All messaging authority is delegated to backend Cloud Functions.**

**Collection Structure:**

- **Collection path:** `smsOutbox/{smsId}`
- **Write authority:** Cloud Functions only (append-only for functions; no write access for frontend or users)
- **Read authority:** Admin-only (for debugging and monitoring)

**Required Fields:**

| **Field** | **Type** | **Purpose** |
| --- | --- | --- |
| **toUserId** | **String** | **The Firebase Auth UID of the recipient.** |
| **phoneE164** | **String** | **The recipient's phone number in E.164 format (denormalized for performance).** |
| **messageType** | **String** | **Enum: PAYMENT_CONFIRMED, WINNER_ANNOUNCED, SCORE_UPDATE, ADMIN_ANNOUNCEMENT.** |
| **payload** | **Map** | **Message-specific data (e.g., squareId, gameId, amount).** |
| **status** | **String** | **Enum: queued, sent, failed.** |
| **dedupeKey** | **String** | **Unique key for deduplication (e.g., {messageType}:{toUserId}:{gameId}:{quarter}).** |
| **createdAt** | **Timestamp** | **When the message was enqueued.** |
| **sentAt** | **Timestamp (optional)** | **When Twilio confirmed delivery.** |
| **failureReason** | **String (optional)** | **Error message if status == failed.** |
| **retryCount** | **Number** | **Number of retry attempts (max 3).** |

**Cloud Function Responsibilities:**

1. **Deduplication:** Before writing a new smsOutbox document, the Cloud Function must check if a document with the same dedupeKey already exists. If found, skip the write.
2. **Retry on Transient Failure:** If Twilio returns a transient error (e.g., rate limit, temporary network issue), increment retryCount and retry up to 3 times with exponential backoff.
3. **Mark Permanent Failure:** If Twilio returns a permanent error (e.g., invalid phone number, blocked recipient) or retryCount exceeds 3, set status: 'failed' and record failureReason.
4. **Twilio API Authority:** Only the Cloud Function may invoke the Twilio API. The frontend must never have access to Twilio credentials or SDKs.

**Frontend Constraints:**

- **Frontend may never write to smsOutbox.** All messaging requests must be indirect (e.g., admin confirms payment → Cloud Function writes to smsOutbox).
- **Frontend may never call Twilio directly.** Twilio credentials must be secured in Cloud Functions environment variables and never exposed to the client.

### **7.2 Notification Safety & Opt-In Rules**

**To ensure compliance with SMS regulations and provide a respectful user experience, the system enforces strict opt-in and suppression rules before enqueuing any message to the smsOutbox.**

**Opt-In Preservation:**

- **smsOptIn: true is the default for all new users** (set during onboarding).
- **smsOptIn: true must be preserved unless the user explicitly opts out** via their profile settings.
- **Admin-Created Participants default to smsOptIn: false until claimed.** This prevents accidental messaging to users who have not yet authenticated.
- **The onboarding wizard must not overwrite an existing smsOptIn: true field.** If a user already has smsOptIn set, preserve it.

**Pre-Send Validation (Enforced by Cloud Functions):**

Before writing a document to smsOutbox, the Cloud Function must validate:

1. **smsOptIn == true:** If the user has smsOptIn: false, do not enqueue the message.
2. **suppressNotifications == false:** If the user has suppressNotifications: true, do not enqueue the message.
3. **status == 'active':** Do not enqueue SMS unless the user's status field is set to 'active'. Users in 'admin_created' or 'suppressed' states must not receive automated notifications.
4. **isShadowUser == false:** Admin-Created Participants must never receive automated notifications (enforced via suppressNotifications: true).

**Admin Action Compliance:**

- **Admin-triggered notifications (e.g., bulk confirmations, payout confirmations) must respect opt-in state.** Admins cannot override a user's smsOptIn: false preference.
- **Manual admin announcements:** If an admin sends a manual announcement, the system must still filter recipients by smsOptIn: true and suppressNotifications: false.

**Opt-Out Workflow:**

- Users can toggle smsOptIn: false in their profile settings at any time.
- Once disabled, the system must immediately stop enqueuing new messages to smsOutbox for that user.
- Users can re-enable notifications by toggling smsOptIn: true.

## **Section 9: Error Handling & Fail-Safe Rules**

**This section defines the system's behavior when errors occur. The goal is to eliminate silent failures, prevent inconsistent state, and provide clear feedback to users and admins.**

### **8.1 SMS Failure Handling**

**Behavior when Twilio SMS delivery fails:**

- **Transient failures (rate limits, temporary network issues):**
    - Retry up to 3 times with exponential backoff (2s, 4s, 8s).
    - If retry succeeds, mark status: 'sent' and record sentAt timestamp.
    - If all retries fail, mark status: 'failed' and record failureReason.
- **Permanent failures (invalid phone number, blocked recipient, compliance violation):**
    - Immediately mark status: 'failed' and record failureReason.
    - Do not retry.
- **Core flow impact:**
    - **SMS failure must not block core game actions.** If a payment confirmation SMS fails, the square state still transitions to confirmed and the audit log is still written.
    - Admins can view failed messages in the SMS Outbox monitoring tab and manually retry or notify users via alternative channels.

### **8.2 Storage Upload Failure Handling**

**Behavior when Firebase Storage upload fails (e.g., QR code upload, payout proof upload):**

- **Surface error to user:** Display a clear error message: "Upload failed. Please check your connection and try again."
- **Do not advance state:** If the upload is required for a state transition (e.g., uploading a payout proof to mark a payout as complete), the state must not advance until the upload succeeds.
- **Retry option:** Provide a "Retry Upload" button in the UI.
- **Partial upload cleanup:** If an upload starts but does not complete, the Cloud Function must clean up any partial file artifacts in Storage.

### **8.3 Audit Log Write Failure Handling**

**Behavior when an audit log write fails:**

- **Abort the triggering action.** Audit logs are critical for financial integrity. If an audit log write fails (e.g., due to a Firestore timeout or permission error), the entire transaction must be rolled back.
- **Examples:**
    - If a PAYMENT_CONFIRMED audit log write fails, the square state must not transition to confirmed.
    - If a WINNER_ANNOUNCED audit log write fails, the scoreEvent must not be created.
- **Error feedback:** Display a critical error message to the admin: "Action failed due to audit log error. Please retry or contact support."
- **Retry logic:** Allow the admin to retry the action. The Cloud Function must use idempotent logic to prevent duplicate audit log entries on retry.

### **8.4 Cloud Function Error Handling**

**Behavior when a Cloud Function throws an unhandled exception:**

- **Frontend displays non-destructive error state:** Show a user-friendly error message: "Something went wrong. Please try again."
- **Log the error:** The Cloud Function must log the full error stack trace to Cloud Logging for debugging.
- **Do not corrupt data:** The function must use Firestore Transactions or Write Batches to ensure atomicity. If the function fails mid-operation, all changes must be rolled back.
- **Retry guidance:** If the error is transient (e.g., Firestore timeout), encourage the user to retry. If the error is persistent, direct the user to contact support.

### **8.5 Frontend Validation & Defensive State**

**Frontend behavior when backend state is unexpected:**

- **Graceful degradation:** If the frontend receives a game or square in an unexpected state (e.g., a game with status: 'locked' but no digitsFinalizedAt timestamp), display a warning: "This game is in an inconsistent state. Contact support."
- **No destructive actions:** The frontend must never attempt to "fix" inconsistent backend state by writing corrections. All fixes must be performed by admins or Cloud Functions.
- **Real-time listener recovery:** If a Firestore real-time listener disconnects, the frontend must automatically reconnect and re-sync state when the connection is restored.

## **Section 10: Admin Command Center**

**This section defines the "Desktop-First" management hub for The Winning Game LX. It is designed as a high-density command center to handle the operational scale of 100+ users across multiple games with professional efficiency.**

> **UX Authority Reference:** Game Day behavior and experience states must comply with Section 16 — PHASE 2 — Game Day UX Moment Map (Experience Contract).
> 

> **Admin Workflow Guarantee:** Admin workflows must preserve the calm, low-interruption guarantees defined in Phase 2.
> 

> **Copy Authority Reference:** User-facing copy must comply with Phase 3 — UI Copy Rewrite (UX Contract).
> 

### **9.1 Tabbed Command Interface**

**The Admin panel utilizes a sidebar or top-tabbed layout to organize high-velocity tasks.**

- **🏟️ Game Central: A dashboard showing all active and archived games with "Occupancy %" and "Total Pot Value". Includes a "Direct Game Link" for rapid grid management.**
- **💳 The Clearinghouse (Payment Hub): A dedicated clearinghouse for bulk verifications. Pending payments are grouped by User to allow one-click confirmation for multiple squares across different games.**
- **👥 Global User CRM: A searchable, sortable data table for all users. Admins can manually register "Admin-Created Participants" (required: phoneE164 in E.164 format + username; optional: name) to ensure anyone can participate, including non-tech players.**
- **💰 Payout Hub: A specialized interface to cross-reference winners' preferred payout methods (Venmo, Zelle, etc.) and handles.**
- **📜 Audit Feed: A live, real-time stream of all administrative actions, including manual registrations, proxy picks, and score overrides.**

### **9.2 High-Velocity Workflows**

- **Atomic Bulk Confirm: Admins can select multiple users or squares and hit "Bulk Confirm". This uses a Firestore Write Batch to update square states to confirmed, update the pot, and enqueue "Payment Confirmed" SMS alerts simultaneously.**
- **Admin "Proxy" Selection: A compact toggle on the Game Grid (part of the Grid Orchestrator) allowing admins to select a user from a dropdown. Once activated, clicking an available square instantly assigns it to the selected user (bypassing the 15-minute reservation timer) and marks the square as confirmed. This must be used for Admin-Created Participants.**
- **Scan-to-Verify Payouts: In the Payout Hub, admins can open a high-contrast modal displaying a winner's uploaded QR code. This allows for direct phone scanning to eliminate manual entry errors.**
- **Manual Override: A dedicated UI for score adjustments that requires a mandatory reason field, ensuring all changes are recorded in the permanent Audit Log.**
- **Zero-Noise Policy (Admin-Created Participants): The system must be hard-coded to never attempt an outbound Twilio SMS or Email for any user where isShadowUser is true. This ensures Admin-Created Participants (manually registered offline players) receive zero automated notifications.**

### **9.3 Operational Guardrails**

- **Emergency Lock: A global backend-only kill switch stored as a backend flag. All square reservation and proxy assignment Cloud Functions must check this flag before allowing state transitions. When enabled:**
    - **No squares may transition to reserved or confirmed**
    - **Admin Proxy Mode is also blocked**
    - **UI may display lock state but may not override it**
    - **Only backend functions enforce the lock; frontend displays state only**
- **Verification Requirements: The "Mark as Paid" action for payouts should include an optional "Reference ID" field for pasting confirmation codes from Venmo or Zelle.**
- **Proof of Payment: Admins have an optional "Upload Proof" button to save transaction screenshots to /payout_proofs/ in Storage, which then appear in the winner's personal Profile Journal.**

Global branding controls available to Admins must comply with Section 18 — Phase 3.1 Admin Brand Asset Manager (UX Contract). Per-board or per-user branding is explicitly unsupported.

## **Section 11: Live Game Logic**

**This section defines the backend intelligence and automated decision-making of The Winning Game LX. It focuses on server-side integrity for the two most critical moments of the game: final number generation and winner determination.**

> **UX Authority Reference:** User-visible transitions (Kickoff, Quarter End, Final) must align with Phase 2 experience moments.
> 

### **10.1 Idempotent Game Locking**

**To ensure absolute fairness, the generation of grid numbers (0–9) must be protected against accidental duplication or regeneration.**

- **Trigger: A manual admin action or the reaching of a closesAt timestamp.**
- **Safety Logic: The system must check if digitsFinalizedAt is null. If it already contains a timestamp, the function must exit immediately without making changes.**
- **Number Generation:**
    - **Generates a unique digitsSeed (e.g., ${gameId}:${timestamp}).**
    - **Produces a random permutation of 0–9 for rows and a separate permutation for columns.**
    - **Writes rowDigits, colDigits, digitsSeed, digitsFinalizedAt, and digitsFinalizedBy to the game document.**

### **10.2 Event-Based Scoring System**

**Rather than simply overwriting a "current score" field, the system uses an immutable event log to maintain an audit trail of game progression.**

- **Submission: Admin submits score via the "Game Control" tab.**
- **Validation: A Cloud Function validates the progression (e.g., preventing a Q3 score submission if Q2 does not exist).**
- **Immutable Write: Every submission creates a new scoreEvent document. Manual overrides must be flagged and include a mandatory reason for the audit log.**

### **10.3 Automated Winner Calculation**

**Winners are determined on the server immediately after a valid scoreEvent is written.**

- **Logic:**
    1. **Extract the last digit of the home and away scores (Score % 10).**
    2. **Locate the corresponding row and column index based on the finalized grid digits.**
    3. **Identify the winningSquareId and the winningUserId.**
- **Winner Snapshot: The system stores a permanent winnerSnapshot containing the winning UID, username, and square ID for that specific quarter.**
- **Real-time Propagation: All score and winner updates propagate instantly to user dashboards and the "Winners Wall."**

### **10.4 Score Preview (Admin QoL)**

**Before officially publishing a score, admins have access to a "Score Preview" tool. This calculates the potential winner in real-time as the admin types, preventing public data entry errors.**

## **Section 12: Dashboard & AI**

**This section defines the "World-Class" engagement hub for The Winning Game LX. It focuses on visualizing multi-game data and using AI to provide personalized, social "magic" that keeps players engaged throughout the season.**

> **UX Authority Reference:** Square rendering and behavior must comply with Section 15 — PHASE 1 — Mobile Square Grid Hierarchy (UX Contract).
> 

> **UX Authority Reference:** Game Day behavior and experience states must comply with Section 16 — PHASE 2 — Game Day UX Moment Map (Experience Contract).
> 

> **Copy Authority Reference:** User-facing copy must comply with Phase 3 — UI Copy Rewrite (UX Contract).
> 

### **11.1 Unified Player Dashboard**

**The Dashboard serves as the primary landing page after login, providing a centralized view of a user's entire standing within the community.**

- **Global Summary: Displays aggregated stats across all active and archived games, including "Total Spent," "Total Winnings," and "Global Rank".**
- **Active Game Cards: Clickable cards for every matchup a user has joined. Each card displays:**
    - **Live Progress: Game state (Open/Locked/Final), live score, and current quarter.**
    - **Square Count: Number of squares owned in that specific game.**
    - **The "What You Need to Win" Helper: A real-time display of the specific last-digit combinations needed for the user to win the upcoming quarter based on their squares.**

### **11.2 Live Community Hub**

**To drive social engagement and "FOMO," the dashboard includes a live activity section.**

- **Player Directory: A list of active usernames currently participating in the community.**
- **Activity Stats: Shows real-time "Squares Filled" percentages for open games to encourage new reservations.**
- **Total Community Prize Pool: A dynamic counter showing the total scale of prizes distributed during the current season.**

### **11.3 Global Leaderboard**

**A high-fidelity ranking system that transforms individual games into a shared competition.**

- **Ranking Logic: Users are ranked by "Total Winnings" aggregated from all games.**
- **Stadium Podium: The top 3 winners are highlighted with distinct Gold, Silver, and Bronze "Stadium-style" accents.**
- **Player Cards: Entries display the user's username, favorite team icon, and rank.**

### **11.3.1 Leaderboard Computation (Authoritative)**

The Global Leaderboard is computed **exclusively by backend Cloud Functions**.

The frontend **never calculates, modifies, or infers leaderboard values**.

**Total Winnings** is defined as the **sum of all confirmed payout amounts** awarded to a user across all games, derived from finalized winnerSnapshots.

Only payouts from games with status `final` or `archived` are included.

Leaderboard values are recalculated immediately after a valid winnerSnapshot is written following a scoreEvent, or after a manual score override is finalized and logged.

Rankings are ordered by:

1. Highest Total Winnings
2. If tied, earliest first win timestamp

Manual overrides update leaderboard standings automatically once finalized and recorded in the Audit Log.

Archived games remain included in leaderboard calculations.

### **11.4 The "Elite Report" AI Hype Engine (Genkit/Gemini)**

**Using Gemini via Genkit, the app generates personalized social content for each user, relocated to the bottom of the dashboard for data priority.**

- **AI Scouting Reports: Branded as "The Winners Grid Elite Reports," these use historical data and the user's specific squares to generate "Hype".**
- **Example Output: *"Onyx, your square at r3c7 is in the 'Hot Zone' for a Q3 win based on historical Super Bowl data! Keep an eye on the Seahawks' red-zone efficiency!"***
- **Performance Optimization: AI report generation must be deferred using requestIdleCallback to ensure it never blocks the main UI thread during navigation.**

### **11.5 AI Boundaries & Non-Persistence Rules**

**The AI-generated content in The Winning Game LX is strictly entertainment-only and must never influence game state, winner determination, or financial outcomes. The following rules prevent AI feature creep and data pollution.**

**AI Operational Phases (Exclusive):**

AI operates in exactly three phases. No additional phases may be added without explicit document update.

1. **Pre-Game Phase (Game Status: Open):**
    - **Purpose:** Generate excitement and engagement before the game starts.
    - **Output:** Tips, hype messages, historical fun facts, and engagement prompts.
    - **Example:** "This square combo has won 12% of Super Bowls since 2010!"
2. **Game-Time Phase (Game Status: Locked or Final, scores updating):**
    - **Purpose:** Provide live commentary as scores are submitted.
    - **Output:** Real-time commentary on current winning squares, dramatic narratives.
    - **Example:** "The tide has turned! r5c3 just took the lead for Q2!"
3. **Post-Numbers Phase (Game Status: Locked, digits finalized):**
    - **Purpose:** Explain why certain squares have better or worse odds.
    - **Output:** Statistical explanations of winning probabilities based on finalized grid digits.
    - **Example:** "Your square needs a score ending in 7-3. Historically, that happens 8% of the time in Q1."

**AI Output Characteristics:**

- **Non-Authoritative:** AI content is entertainment only and has no effect on game mechanics, winner calculation, or payout distribution.
- **Entertainment-Only:** AI output must never be presented as factual predictions or guaranteed outcomes.
- **Ephemeral:** AI-generated content is displayed in real-time but must not be persisted as game state, historical records, or database fields.

**AI Read Permissions (Allowed):**

AI may read the following data to generate personalized content:

- **Game state:** status, homeTeam, awayTeam, squarePrice, current scores (from scoreEvents)
- **User-owned squares:** The specific row/col coordinates and state of squares owned by the requesting user
- **Finalized grid digits:** rowDigits and colDigits (only after digitsFinalizedAt is set)
- **Historical data:** Public sports statistics or historical Super Bowl trends (external to Firestore)

**AI Write Restrictions (Explicitly Forbidden):**

AI may never:

- **Write to core game data:** AI cannot modify game documents, square states, scoreEvents, or auditLogs.
- **Influence winners:** AI output must never be used as input to winner calculation logic. Winners are determined solely by the backend winner calculation function (Section 10.3 Automated Winner Calculation).
- **Store predictions as facts:** AI-generated predictions, odds, or commentary must not be saved to Firestore. They are ephemeral UI content only.
- **Trigger financial actions:** AI cannot enqueue SMS alerts, confirm payments, or initiate payouts.
- **Create or modify users:** AI cannot write to the users collection or authenticate users.

**Implementation Constraints:**

- AI generation must be client-side only (via Genkit SDK in the frontend).
- AI requests must be rate-limited to prevent abuse (max 5 requests per user per minute).
- AI failures must degrade gracefully. If AI generation fails, hide the AI section entirely rather than showing an error.
- AI content must be visually distinct from authoritative game data (e.g., use a different background color, italicized text, or a "Fun Fact" badge).

## **Section 13: Theming & Polish**

**This final section defines the visual and emotional identity of The Winners Grid (TWG). It focuses on the transition to a professional, light-themed aesthetic with high-end sports branding and rewarding celebratory moments.**

> **UX Authority Reference:** Square rendering and behavior must comply with Section 15 — PHASE 1 — Mobile Square Grid Hierarchy (UX Contract).
> 

### **12.1 Light Mode Default Refactor**

**To achieve a "world-class" feel, the application pivots from a dark base to a clean, sophisticated light mode.**

- **Global Palette: Use soft light grays (e.g., #F8F9FA) for page backgrounds to provide depth without being stark white.**
- **Card & Menu UI: Sidebar, top header, and content cards must use white or ultra-light gray backgrounds with subtle borders and proper spacing.**
- **Typography: All text must be dark charcoal or black for maximum readability on light backgrounds.**
- **Metallic Gold Accents: Retain signature gold accents on borders, "Verified Host" badges, and the "Bulk Confirm" button to signify the "Elite" nature of the grid.**

### **12.2 Stadium Aesthetics & Identity**

**The app must feel like a shared game night rather than just a utility.**

- **Grid Texture: Apply a subtle, professional stadium or yard-line texture to the game grid background.**
- **Watermarking: Subtly integrate the "TWG" initials into the navigation bar or as a watermark on the game board to establish the rebrand.**
- **Sports Iconography: Integrate thematic icons (helmets, whistles, scoreboards) throughout navigation and action buttons.**

### 12.3 Celebratory "Polish & Delight"

**Visual feedback is used to create a rewarding experience for users.**

- **Winning-Square Glow: Implement a subtle pulse animation or glow effect on squares currently in a winning position based on the live score.**
- **Championship Confetti:**
    - **Trigger A: Trigger a gold confetti burst when an admin completes an "Atomic Bulk Confirmation" in the Clearinghouse.**
    - **Trigger B: Trigger a celebratory burst when a user views their confirmed payout in their personal Profile Journal.**
- **Haptic & Micro-Interactions: Square selection on mobile must feel "snappy" with subtle scale-up effects on tap.**
- **Dynamic Button States: Buttons should provide immediate visual feedback with a subtle scale-down effect on press and scale-up on release. Additionally, buttons must display a 'Success' color transition (e.g., gold or green flash) once an admin confirms a payout in the Clearinghouse to provide clear confirmation of the completed action.**

### **12.4 Accessibility & Performance Guardrails**

**The high-fidelity UI must not compromise speed or compliance.**

- **Modern Image Props: Use the modern fill prop and sizes (e.g., (max-width: 768px) 100vw, 400px) for all Next.js Image components to resolve "legacy prop" console noise and improve performance.**
- **Focus Integrity: All dialogs must use trapFocus={true} and ensure focus is returned to the trigger element upon closing to maintain ARIA compliance.**
- **Animation Throttling: Wrap heavy animations in requestAnimationFrame or setTimeout(..., 0) to prevent blocking the UI thread on lower-powered mobile devices.**

All branding assets are decorative only and must not alter grid behavior, square states, animations, or Game Day moments, as defined in Phase 1, Phase 2, and Phase 3.1.

## **Section 14: System Ownership & Separation of Concerns**

**This section defines the authoritative boundaries between frontend, backend, schema, and automation responsibilities. The goal is to ensure clean architecture, prevent business logic duplication, and maintain a single source of truth for each concern.**

Backend and automation layers must use the project constants and enabled services defined in Section 1.

### **13.1 Frontend Responsibilities**

**The frontend is a non-authoritative presentation layer. It displays backend state but never enforces it.**

**Allowed:**

- **Display game state:** Render grids, scores, winners, and timers based on Firestore real-time listeners.
- **Collect user input:** Capture square selections, profile updates, QR code uploads, and payment method preferences.
- **Trigger backend actions:** Call Cloud Functions via HTTPS Callable endpoints (e.g., reserveSquare, confirmPaymentIntent, updateProfile).
- **Client-side validation:** Provide immediate feedback for invalid inputs (e.g., "Username must be 3-20 characters") before calling backend.
- **UI-only timers:** Display countdown timers for square reservations (visual-only; backend auto-release is authoritative).
- **AI content generation:** Generate ephemeral AI hype content using Genkit (client-side only; no persistence).

**Explicitly Forbidden:**

- **State enforcement:** Frontend must never enforce state transitions (e.g., do not block a user from tapping a square based on frontend logic alone; the backend validates and rejects if invalid).
- **Business logic duplication:** Do not replicate backend validation, winner calculation, or payout logic in the frontend.
- **Direct Firestore writes for authoritative data:** Frontend may only write to users/{uid} for profile updates. All other writes must go through Cloud Functions.
- **Direct Twilio or external API calls:** Frontend must never have access to Twilio credentials or invoke third-party APIs directly.

### **13.2 Backend (Cloud Functions) Responsibilities**

**The backend is the authoritative enforcement layer. All state transitions, validations, and financial actions are performed server-side.**

**Allowed:**

- **State transitions:** Enforce game and square state machines (open → locked → final, available → reserved → confirmed).
- **Validation:** Verify permissions (isAdmin, request.auth.uid), check game status, validate square availability.
- **Winner calculation:** Compute winners based on scoreEvents and finalized grid digits.
- **Audit logging:** Write immutable records to auditLogs for all financial and administrative actions.
- **Messaging:** Enqueue SMS alerts to smsOutbox and invoke Twilio API.
- **Scheduled automation:** Auto-release expired reservations, auto-lock games at closesAt timestamp.
- **Data integrity:** Use Firestore Transactions and Write Batches to ensure atomicity.

**Explicitly Forbidden:**

- **UI rendering:** Backend functions must not generate HTML or UI components (return structured data only).
- **Bypassing Security Rules:** Cloud Functions run with admin privileges but must still respect logical access boundaries (e.g., do not allow admins to delete audit logs).

### **13.3 Firestore Schema Responsibilities**

**The Firestore schema is the single source of truth for data structure and relationships.**

**Allowed:**

- **Define collections and sub-collections:** Specify top-level collections (users, games, admins, auditLogs, smsOutbox) and sub-collections (squares, scoreEvents).
- **Define field types and constraints:** Enforce data types (string, number, timestamp, map, array) and required fields.
- **Enforce uniqueness:** Use composite indexes to prevent duplicate phoneE164 values.

**Explicitly Forbidden:**

- **Storing business logic in schema:** Do not use Firestore to store executable code or procedural logic (use Cloud Functions).
- **Storing UI state in schema:** Do not persist ephemeral UI state (e.g., modal open/closed, selected tab) in Firestore.

### **13.4 Automation / Scheduled Jobs Responsibilities**

**Scheduled Cloud Functions handle time-based automation that does not require user interaction.**

**Allowed:**

- **Auto-release expired reservations:** Run every 5 minutes; revert squares from reserved → available if now > reservedUntil.
- **Auto-lock games at closesAt:** Run every 1 minute; transition games from open → locked if now >= closesAt.
- **Retry failed SMS:** Check smsOutbox for status: 'queued' with retryCount < 3 and retry delivery.

**Explicitly Forbidden:**

- **User-triggered actions:** Scheduled jobs must not handle user-initiated requests (use HTTPS Callable functions).
- **Financial actions without audit logs:** Scheduled jobs must write to auditLogs if they modify financial state (e.g., voiding squares).

### **13.5 Explicit Prohibitions (Cross-Cutting)**

**The following actions are forbidden across all layers:**

- **Frontend-side state enforcement:** Frontend must never block user actions based on client-side state checks alone. Always defer to backend validation.
- **Business logic duplication:** Do not implement the same validation, calculation, or state transition logic in both frontend and backend. Backend is authoritative.
- **Data inconsistency:** If frontend and backend state conflict, backend state is correct. Frontend must re-sync via real-time listeners.
- **Silent failures:** All errors must be surfaced to users or logged. No silent failure modes.

## **Appendix A: Canonical Naming & Reserved Terms**

**This appendix defines the canonical internal names for roles, collections, state enums, and Cloud Functions. These identifiers are locked and must not be changed or repurposed without explicit document update. UI labels may change, but internal identifiers must not.**

### **A.1 Canonical Role Names**

| **Internal Role Name** | **UI Label** | **Reserved** |
| --- | --- | --- |
| **Admin** | **Admin** (may change to "Organizer" or "Host" in UI) | **Yes** |
| **User** | **Player** (may change to "Participant" in UI) | **Yes** |
| **ShadowUser** (entity flag) | **Admin-Created Participant** (UI label for admin reference) | **Yes** |

### **A.2 Canonical Collection Names**

| **Collection Path** | **Reserved** |
| --- | --- |
| **users** | **Yes** |
| **games** | **Yes** |
| **games/{gameId}/squares** | **Yes** |
| **games/{gameId}/scoreEvents** | **Yes** |
| **admins** | **Yes** |
| **auditLogs** | **Yes** |
| **smsOutbox** | **Yes** |

### **A.3 Canonical State Enums**

**User Lifecycle States:**

- `admin_created`
- `active`
- `suppressed`

**Game Lifecycle States:**

- `open`
- `locked`
- `final`
- `archived`

**Square Lifecycle States:**

- `available`
- `reserved`
- `pending_payment`
- `confirmed`
- `void`

**SMS Outbox States:**

- `queued`
- `sent`
- `failed`

**Quarter Enums:**

- `q1`
- `q2`
- `q3`
- `final`

### **A.4 Canonical Cloud Function Names**

| **Function Name** | **Purpose** | **Reserved** |
| --- | --- | --- |
| **createUserProfile** | **Initialize new user document after onboarding.** | **Yes** |
| **reserveSquare** | **Transition square from available → reserved.** | **Yes** |
| **confirmPaymentIntent** | **Transition square from reserved → pending_payment.** | **Yes** |
| **adminConfirmPayment** | **Transition square from pending_payment → confirmed.** | **Yes** |
| **adminVoidSquare** | **Transition square from reserved/pending_payment → void → available.** | **Yes** |
| **adminProxyAssignSquare** | **Transition square from available → confirmed (bypass reservation timer).** | **Yes** |
| **claimAdminCreatedParticipant** | **Links authenticated UID to an admin-created participant by phoneE164, migrates ownership, marks original record deprecated.** | **Yes** |
| **lockGame** | **Transition game from open → locked, finalize grid digits.** | **Yes** |
| **submitScore** | **Create scoreEvent, calculate winner, update game state.** | **Yes** |
| **autoReleaseExpiredReservations** | **Scheduled job: revert reserved → available if reservedUntil expired.** | **Yes** |
| **autoLockGamesAtCloseTime** | **Scheduled job: transition open → locked if closesAt reached.** | **Yes** |
| **processSmsOutbox** | **Scheduled job: send queued SMS via Twilio, retry on transient failure.** | **Yes** |

### **A.5 Reserved Field Names**

The following field names are reserved and must not be repurposed:

- `phoneE164`
- `isShadowUser`
- `suppressNotifications`
- `smsOptIn`
- `digitsFinalizedAt`
- `digitsSeed`
- `rowDigits`
- `colDigits`
- `reservedUntil`
- `assignedByAdminId`
- `dedupeKey`
- `winnerSnapshot`

### **A.6 Naming Stability Declaration**

**UI labels may change** to improve user experience, accommodate branding, or support internationalization.

**Internal identifiers must not change** once deployed. Renaming a collection, state enum, or Cloud Function requires:

1. Explicit document update
2. Migration plan for existing data
3. Coordinated deployment across frontend, backend, and Security Rules

**Reserved words must not be repurposed.** If a feature is deprecated, its identifier must remain unused to prevent namespace conflicts.

## **Section 15: Build Readiness & Execution Constraints**

**This document is now locked as the single authoritative source of truth for The Winning Game LX (V3). It is build-ready for AI IDE execution and human engineering teams.**

### **14.1 Build Readiness Declaration**

**Status: Build-Ready ✅**

This document defines:

- **Complete lifecycle state machines** for users, games, and squares (Section 3)
- **Explicit role and permission boundaries** for Admin, User, and Shadow User entities (Section 2.0)
- **Comprehensive error handling and fail-safe rules** for SMS, Storage, Audit Logs, and Cloud Functions (Section 8)
- **Authoritative messaging contract** via smsOutbox with deduplication, retry, and opt-in enforcement (Section 7)
- **Shadow User claiming and UID reconciliation** to prevent duplicate accounts (Section 4.3)
- **AI boundaries and non-persistence rules** to prevent feature creep and data pollution (Section 11.5)
- **Canonical naming and reserved terms** to prevent identifier drift (Appendix A)
- **System ownership and separation of concerns** to ensure clean architecture (Section 13)

### **14.2 Execution Constraints**

**Any deviation from this document requires an explicit document update.**

Engineers and AI IDEs must:

1. **Reference this document as the sole source of truth.** Do not infer behavior, assume defaults, or add "helpful" features not defined here.
2. **Respect non-goals as binding constraints.** Features listed in Section 0.2 (Explicit Non-Goals) must never be implemented.
3. **Adhere to canonical naming.** Use only the identifiers defined in Appendix A. Do not rename collections, state enums, or Cloud Functions without document approval.
4. **Enforce backend authority.** All state transitions, validations, and financial actions must be performed server-side (Section 0.3).
5. **Follow error handling rules.** All failures must be handled according to Section 8 (no silent failures, audit log failures abort actions).

### **14.3 Change Governance: Smithers Workflow**

**All future changes to this document must follow the Smithers Workflow:**

1. **Audit:** Review the current document state and identify conflicts or gaps.
2. **Plan:** Propose changes in structured batches with explicit purposes.
3. **Implement:** Update the document atomically (all related changes in one batch).
4. **Verify:** Confirm that all sections exist, no contradictions were introduced, and section numbering is coherent.

**No ad-hoc edits.** Changes must be deliberate, documented, and verified.

### **14.4 Single Source of Truth Commitment**

**This document is the single authoritative source of truth for The Winning Game LX (V3).**

- **Backend enforces what is written here.** Firestore Security Rules and Cloud Functions implement the state machines, permissions, and validations defined in this document.
- **Frontend displays what is written here.** UI labels, workflows, and visual hierarchies reflect the structure and constraints defined in this document.
- **AI IDEs build what is written here.** Code generation tools must not infer, assume, or add features beyond what is explicitly defined.

**If a requirement is not in this document, it does not exist.**

---

## **Section 16: PHASE 1 — Mobile Square Grid Hierarchy (UX Contract)**

**App:** The Winning Game LX (TWG LX)

**Status:** UX-Authoritative | Locked

**Audience:** AI Architecture (Lisa), AI Notion (Smithers)

**Immutability Notice:** No changes permitted without Matt approval.

### **Design Intent (Admin-First, Friends-and-Family)**

The Winning Game LX is designed for trusted friends-and-family football square games where payment is expected and typically completed by payday before the game. The UX must never feel like a payment enforcement system.

Payment states exist for admin clarity and bookkeeping, not player pressure.

Admins require fast, calm oversight to manage multiple boards without stress.

Players should feel welcomed, trusted, and excited.

The grid experience must feel fun, readable, social, and relaxed — never corporate or transactional.

### **1. Core UX Principle (Non-Negotiable)**

**The grid is the product. Everything else supports it.**

On mobile:

- The grid must feel **fun, readable, touchable, and calm**
- Not dense
- Not noisy
- Not technical

If the grid fails, the app fails.

### **2. Visual Priority Stack (Strict Order)**

Every square on mobile must follow this visual priority hierarchy:

1. Winning Square(s)
2. User-Owned Squares
3. Available Squares
4. Other Players' Squares

At no point should a user need to ask:

- "Which square is winning?"
- "Which squares are mine?"

If that happens → **UX failure**.

### **3. Square Anatomy (Mobile)**

Each square may use up to **four layers**, but **never all at once**.

**Base Layer**

- Background color (state-driven)
- Subtle border (≤ 1px)

**Content Layer**

- Username (truncated) or empty

**State Layer**

- Glow, pulse, or highlight (state-specific)

**Interaction Layer**

- Tap feedback
- Reservation indicator

### **4. Square State Visual Contract**

### **4.1 Available**

**Purpose:** Invite interaction

- Light neutral background
- Subtle border
- No text, no icons
- Immediate tap feedback

### **4.2 Reserved (User)**

**Purpose:** Gentle courtesy hold

- Soft neutral tint
- Username visible
- Thin progress ring or bar (non-numeric)
- Subtle pulse (≤ once every 5s)

**Rule:** Timer must never obscure the username.

### **4.3 Pending Payment (Acknowledged)**

**Purpose:** "You're in — we'll settle up later"

- Neutral background with soft checkmark
- Username visible
- No lock icon
- No warning colors
- No pulse

This state communicates **acknowledgment**, not urgency.

### **4.4 Confirmed (User-Owned)**

**Purpose:** Ownership pride

- Slightly darker neutral or soft team tint
- Username visible
- Subtle inner border or corner notch
- No animation unless winning

### **4.5 Confirmed (Other Player)**

**Purpose:** Context only

- Muted background
- Username truncated (6–8 chars)
- Reduced opacity
- No animation, no icons

### **4.6 Winning Square (Any Owner)**

**Purpose:** Celebration + instant clarity

- Gold glow ring overlay
- Soft pulse (2–3s interval)
- Background unchanged

**Rule:**

**Winning glow is the only glow allowed on the grid.**

### **5. Username Display Rules (Mobile)**

- Truncate to **6–8 characters**
- Ellipsis if longer
- Full name revealed on tap (tooltip or bottom sheet)

**Typography:**

- Condensed
- Bold
- High-legibility
- Sans-serif only

**Gold text is forbidden.**

### **6. Grid Layout & Spacing**

- Fixed **10 × 10 grid**
- No internal scrolling
- Grid fits viewport width
- **1–2px gutters max**
- True square aspect ratio (no stretching)

### **7. Touch Interaction Rules**

- Tap: immediate visual feedback (< 100ms)
- Long-press (optional): square details (owner, status)
- Confirm modal: **only** when transitioning **Available → Reserved**
- Inspection never requires confirmation

### **8. Sticky Score Bar (Mobile-Only)**

Always visible **above the grid**:

- Home score
- Away score
- Current quarter
- Status badge (Open / Locked / Final)

**Score context must never scroll away.**

### **9. "What You Need to Win" Helper (Mobile)**

- Must live **outside the grid**
- Collapsed by default
- One-line summary

*(e.g. "You win with 7-3, 2-0")*

- Expanded view on tap

### **10. Color Usage Rules**

- **Gold:** winning & celebration only
- **Team colors:** optional, subtle
- **Red:** forbidden
- **Green:** forbidden
- **Neutral grays:** default state language

### **11. Performance & Animation Guards**

- Max **one animation per square**
- No flashing
- No overlapping effects
- Pause animations when app is backgrounded

### **12. Explicit UX Failure Conditions**

The grid fails UX review if:

- User cannot instantly find their squares
- Winning square is not obvious
- Grid feels busy or stressful
- Text is unreadable on small phones
- Gold is overused
- Timers overlap content

### **13. Usage Guidance**

**For Lisa (AI Architecture):**

- Treat this as a **visual behavior contract**
- Backend state must map cleanly to these states
- **No additional square states allowed**

**For Smithers (AI Notion):**

- Insert as a **locked UX section**
- Reference from **Square Lifecycle**, **Dashboard**, and **Mobile Design**
- **Do not paraphrase**

🔒 **END OF PHASE 1 — LOCKED**

---

## **Section 17: PHASE 2 — Game Day UX Moment Map (Experience Contract)**

**App:** The Winning Game LX (TWG LX)

**Status:** UX-Authoritative | Locked

**Audience:** AI Architecture (Lisa), AI Notion (Smithers)

**Depends on:** Phase 1 – Mobile Square Grid Hierarchy

**Immutability Notice:** No changes permitted without Matt approval.

### **Design Intent (Why This Exists)**

The Winning Game LX is a **Game Day experience**, not a continuous-attention app.

Users:

- Drop in
- Pick squares
- Leave
- Come back during commercials
- Check winners
- Celebrate
- Drift away again

The UX must support this rhythm, not fight it.

Admins must feel:

- Calm
- In control
- Confident
- Free to enjoy the day

Players must feel:

- Excited
- Included
- Entertained
- Never confused

### **The Game Day Timeline (Canonical)**

Every game follows this fixed experiential arc:

1. Pre-Game Build-Up
2. Board Lock ("Kickoff Moment")
3. Live Game Flow (Quarters)
4. Final Whistle
5. Post-Game Loop

Each moment has clear UX goals, allowed UI behaviors, and emotional intent.

### **1. Pre-Game Build-Up**

*(Days → Hours Before Kickoff)*

**User Mindset**

"Who's in? How many boards are live? This looks fun."

**UX Goals**

- Build anticipation
- Encourage participation
- Make joining feel low-pressure
- Let admins scale fast

**UX Elements**

- Game Day Lobby
- Shows all active boards
- Board names (Kickoff Grid, Red Zone Grid, etc.)
- Fill progress (% or squares left)
- Clear "Join / View Squares" CTA
- Friendly copy (no urgency language)

**Admin Experience**

- One-tap "Create New Board"
- Ability to clone last board settings
- Board creation must feel instant

**Explicit Rules**

- No timers yelling at users
- No payment prompts
- No warnings

### **2. Board Lock Moment ("Kickoff")**

**User Mindset**

"Game's starting — let's see how this plays out."

**UX Goals**

- Signal kickoff clearly
- Create shared moment
- Remove interaction anxiety

**UX Moment**

- Single celebratory banner or toast:

"🏈 Kickoff — Squares Locked"

- Grid transitions to read-only
- Digits reveal feels intentional, not technical

**Emotional Intent**

- Calm confidence
- "We're live"
- No panic

**Admin Experience**

- Lock happens automatically or with one tap
- No confirmation friction
- Clear confirmation state

**Explicit Rules**

- No user actions required
- No error states visible to players
- No reopening flows

### **3. Live Game Flow (Quarters)**

Each quarter is a **mini-moment**, not a workflow.

### **3.1 Quarter Start**

Copy example:

"Q1 is live — good luck!"

**UX Rules**

- Minimal UI change
- No modals
- Score bar updates smoothly

### **3.2 During Quarter (Commercial Behavior)**

**User Reality**

Most engagement happens during commercials.

Users pop in, check, pop out.

**UX Behavior**

- Grid shows:
    
    ◦ Winning glow (if applicable)
    
    ◦ User squares subtly highlighted
    
    ◦ "What You Need to Win" helper updates live
    
- No notifications unless admin explicitly enables

**AI Content (Optional / Fun)**

- Lightweight hype copy
- Clearly labeled as fun
- Never authoritative

### **3.3 Quarter End (Winner Moment)**

**UX Moment**

- Subtle celebration:
    
    ◦ Glow intensifies briefly
    
    ◦ Small confetti burst (once)
    
- Winner clearly indicated on grid
- Score freezes briefly for clarity

**Admin Experience**

- Winner auto-identified
- Payout info surfaced quietly
- No immediate action required

**Explicit Rules**

- No modal spam
- No forced acknowledgments
- Celebration > workflow

### **4. Final Whistle (End of Game)**

**User Mindset**

"Who won? How'd I do?"

**UX Goals**

- Closure
- Celebration
- Easy recap

**UX Elements**

- Final score banner
- All winning squares clearly marked
- Winners summary (names + board)
- Friendly closing copy

**Admin Experience**

- Clear list of winners
- Payout overview:
    
    ◦ Who to pay
    
    ◦ How much
    
    ◦ Preferred payout method
    
- Ability to mark payouts complete at leisure

**Explicit Rules**

- No pressure language
- No payment reminders to players
- Admin controls pace

### **5. Post-Game Loop**

**Purpose**

Encourage return, sharing, and future games.

**UX Elements**

- "Thanks for playing" tone
- Past games visible
- Winners celebrated
- Next game teased (if exists)

**Social Energy**

- Seeing multiple boards reinforces scale
- People want in next time

### **Cross-Cutting UX Rules (All Moments)**

- No dead ends
- No cognitive overload
- No corporate language
- No fear-based UI
- No urgency unless celebratory

The app should feel like:

"I can check this whenever — it's fun."

### **Admin-First Guarantees**

Admins must always have:

- At-a-glance board health
- Clear payment tracking
- Fast board creation
- Zero stress during the game

If an admin feels rushed or overwhelmed → **UX failure**.

### **Usage Guidance**

**For Lisa (AI Architecture):**

- Treat moments as **experience states**, not workflows
- Backend must support **silent transitions**
- Avoid forcing UI actions during live play

**For Smithers (AI Notion):**

- Insert as a **locked UX section**
- Reference from **Dashboard**, **Games**, and **Admin UX**
- **Do not merge with logic sections**

### **Phase 2 Status**

✅ **Complete**

This defines how the app **feels on Game Day**.

🔒 **END OF PHASE 2 — LOCKED**

---

## **Section 18: PHASE 3 — UI Copy Rewrite (Football-First, Friends-and-Family Tone)**

**App:** The Winning Game LX (TWG LX)

**Status:** UX-Authoritative | Locked

**Audience:** AI Architecture (Lisa), AI Notion (Smithers)

**Depends on:** Phase 1 (Grid UX), Phase 2 (Game Day Moments)

**Immutability Notice:** No changes permitted without Matt approval.

### **0. Tone Definition (Locked)**

**Primary Tone**

**Friends watching football in a living room**

→ relaxed, familiar, inclusive

**Secondary Tone**

**Tailgate energy**

→ excitement, momentum, celebration

**Explicitly NOT**

- Corporate
- Fintech
- Gambling-heavy
- "Urgent / collections" language
- Overly slangy or juvenile

**Rule of thumb:**

If the copy wouldn't feel natural said out loud during commercials, it doesn't belong.

### **1. Global Language Rules**

**Words We USE**

- Game Day
- Board
- Squares
- Locked
- Live
- Final
- Winner
- Marked
- All set
- Good luck
- Nice hit
- You're still alive
- Next board

**Words We BAN**

- Transaction
- Payment due
- Outstanding balance
- Enforcement
- Compliance
- Audit
- Risk
- Failure
- Deadline
- Penalty

### **2. Primary Navigation Labels**

| **Area** | **Label** |
| --- | --- |
| **Home** | **Game Day** |
| **Boards** | **Boards** |
| **My Squares** | **My Squares** |
| **Winners** | **Winners** |
| **Admin** | **Host Tools** |
| **History** | **Past Games** |

### **3. Dashboard Copy (Player)**

**Header**

Game Day

**Subheader (dynamic)**

- "Kickoff coming up"
- "We're live"
- "Final whistle"

**Board Card States**

- **Open:** "Squares open"
- **Almost Full:** "Filling up"
- **Locked:** "Kickoff — locked"
- **Final:** "Final — winners posted"

### **4. Square Grid Copy**

- **Available:** *(no text)*
- **Reserved (User):** **Held for you**
- **Pending:** **Marked for you 👍**
- **Confirmed:** **You're in**
- **Winning:** **Winner!**

No timers as text.

No pressure language.

### **5. "What You Need to Win" Helper**

**Collapsed:**

**You win with:** 7-3, 2-0

**Expanded:**

If the score ends with one of these numbers at the end of the quarter, you win this board.

### **6. Game Day Moments (Phase 2 Aligned)**

- **Kickoff:** 🏈 **Kickoff — squares locked**
- **Quarter Start:** **Q2 is live — good luck**
- **Quarter Win:** 🎉 **Nice hit! You won this quarter**
- **Quarter Loss:** **Still alive — next quarter coming up**
- **Final:** 🏁 **Final — great game**

### **7. Winners View**

**Header**

Winners

**Board Summary**

Red Zone Grid

Q1: Alex

Q2: Sam

Q3: You

Final: Chris

**Celebration Copy**

That's a wrap. Thanks for playing.

### **8. Admin / Host Tools Copy**

**Section Title**

Host Tools

**Payment Status**

- Paid
- Not yet
- Offline / cash

**Actions**

- Mark as paid
- Undo
- Mark paid later

**Payout Section**

Who gets paid

**Example:**

Alex — $20 — Venmo

Sam — $20 — Cash

You — $40 — Zelle

**Completion**

All payouts marked — nice work

### **9. Board Creation Copy**

**Title**

Create a new board

**Board Types**

- Kickoff Grid
- Red Zone Grid
- Quick Play
- Prime Time
- Just for Fun

**CTA**

Create board

### **10. Empty States**

- **No Boards:** First board of the day coming up.

Want to start one?

- **No Squares:** Jump in — plenty of good squares left.
- **Game Over:** That one's in the books.

Check out the next board.

### **11. Admin Asset Manager (Copy Only)**

**Title**

Branding & Assets

**Helper Copy**

Swap logos and images anytime.

We'll handle the sizing.

**Buttons:**

- Upload logo
- Preview
- Save & apply

### **12. Explicit Copy Failure Conditions**

Copy fails if:

- It sounds corporate
- It pressures payment
- It explains too much
- It feels awkward read out loud
- It breaks the living-room / tailgate vibe

### **Phase 3 Status**

✅ **Complete — Ready for Review**

### **Usage Guidance**

**Lisa**

- Validate tone consistency
- Ensure no logic depends on copy wording

**Smithers**

- Insert as **PHASE 3 — UI Copy Contract**
- Do not paraphrase
- Map copy to existing UI surfaces only

🔒 **END OF PHASE 3 — LOCKED**

---

## **Section 19: PHASE 3.1 — Admin Brand Asset Manager (UX Contract)**

**App:** The Winning Game LX (TWG LX)

**Status:** UX-Authoritative | Locked

**Audience:** AI Architecture (Lisa), AI Notion (Smithers)

**Depends on:** Phase 3 — UI Copy Rewrite

**Purpose:** Non-developer branding control with zero UX risk

**Immutability Notice:** No changes permitted without Matt approval.

### **Design Intent**

The Winning Game LX must allow Admins (Hosts) to manage core brand assets without developer involvement, while preserving:

- Visual consistency
- Mobile readability
- App-store quality
- Zero chaos across boards

This system exists to support:

- Iteration over time
- Seasonal refreshes
- Brand polish
- Founder / admin autonomy

This is a **global branding system**, not a theming playground.

### **1. Scope of Admin Control (Explicit)**

Admins are allowed to manage **global brand assets only**.

**Supported Asset Types**

Admins may upload and manage:

- **Primary App Icon**

Used for iOS / Android / PWA

- **Primary Logo (Wordmark)**

Header, splash, marketing

- **Secondary Logo / Emblem**

Boards, winners, badges

- **Favicon**

Browser tab, shortcuts

- **Social Preview Image**

Link previews, sharing

**No other asset types are supported in v1.**

### **2. Global Rules (Non-Negotiable)**

- One active brand asset set at a time
- Applies globally across the app
- Changes affect all boards and games
- Admin-only access

Explicitly not supported:

- Per-board branding
- Per-user branding

This prevents fragmentation and UX drift.

### **3. Admin UX — Branding & Assets Section**

**Location**

Admin → Host Tools → Branding & Assets

**Layout (Conceptual)**

Each asset type appears as a card with:

- Asset name
- Current image preview
- "Upload" action
- Size / usage note
- Live preview thumbnails

### **4. Upload & Processing Behavior (UX Contract)**

When an Admin uploads an image, the system automatically:

- Crops or pads (never stretches)
- Scales to required sizes
- Generates variants internally

The Admin:

- Does not choose sizes
- Does not manage files

**Admin Sees**

- Original upload preview
- Small / medium / large previews
- App icon preview
- Dashboard preview

If an image is unsuitable (too detailed, low contrast):

- The system displays a **friendly warning**
- Upload is **not blocked**
- Admin remains in control

### **5. Preview & Apply Flow**

**Preview**

Admins can preview how assets appear in:

- App icon
- Dashboard header
- Board header
- Winners view

**Apply**

- One-click **"Save & apply"**
- Changes apply immediately
- No publish workflow required

**Optional future enhancement (not required):**

- "Preview only" mode

### **6. Safety & Guardrails**

The system must enforce:

- No animation uploads
- No SVG logic injection
- Image files only
- Reasonable file size limits (UX-invisible)

If an asset fails to load:

- App falls back to last valid asset
- No broken UI states

### **7. Explicit Non-Goals (Important)**

This system does **not** support:

- Per-board branding
- Seasonal themes (automatic)
- User-uploaded avatars
- Theme color editing
- Font replacement
- Dynamic logo switching per game

These are intentionally out of scope.

### **8. Relationship to Other Phases**

- **Phase 1:** Grid visuals are unaffected by branding swaps
- **Phase 2:** Game Day moments remain unchanged
- **Phase 3:** Copy remains authoritative regardless of assets

Branding is **decorative, not behavioral**.

### **9. Governance & Change Control**

This section is **UX-Authoritative | Locked**.

- No changes without Matt approval
- Any future expansion requires a new phase

### **Phase 3.1 Status**

✅ **Complete**

This closes the final optional UX gap and removes all remaining assumptions around branding control.

### **Matt — Closing Confirmation**

With Phase 3.1 added:

- There are no remaining undocumented features
- No admin behavior is left implied
- No "we'll figure it out later" areas remain

You now have:

- Core gameplay (Phases 1–2)
- Language & tone (Phase 3)
- Admin autonomy for branding (Phase 3.1)

This is the correct level of polish for an app that:

- Wants to grow
- Wants to look great next year
- Wants to stay sane as it evolves

🔒 **END OF PHASE 3.1 — LOCKED**

---

**End of The Winning Game LX (V3) Build Document.**

**Document Status: ✅ Build-Ready | Single Source of Truth | Locked**