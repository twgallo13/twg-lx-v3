/**
 * Test Script for createUserProfile Function
 * 
 * This script tests the deployed createUserProfile function end-to-end.
 * 
 * Requirements:
 * - Firebase SDK installed at repo root (npm install firebase)
 * - Firebase Auth configured with a test user
 * - Function deployed to us-central1
 * 
 * Run: node test-createUserProfile.js
 */

const { initializeApp } = require("firebase/app");
const { getFunctions, httpsCallable, connectFunctionsEmulator } = require("firebase/functions");
const { getAuth, signInAnonymously } = require("firebase/auth");

// Firebase configuration (from spec Section 1.2)
const firebaseConfig = {
  apiKey: "AIzaSyBWwMHFPk7u8VVLphJfD2CjRQVRQJGfvbw",
  authDomain: "studio-3220084595-54dab.firebaseapp.com",
  projectId: "studio-3220084595-54dab",
  storageBucket: "studio-3220084595-54dab.firebasestorage.app",
  messagingSenderId: "171056784022",
  appId: "1:171056784022:web:8f21e1fa34b8f66f1cce01",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const functions = getFunctions(app, "us-central1");
const auth = getAuth(app);

// Uncomment to use local emulator
// connectFunctionsEmulator(functions, "localhost", 5001);

/**
 * Test Cases
 */
async function runTests() {
  console.log("\n=== Testing createUserProfile Function ===\n");
  
  try {
    // Authenticate
    console.log("1. Authenticating with Firebase...");
    const userCredential = await signInAnonymously(auth);
    const user = userCredential.user;
    console.log(`   ✓ Authenticated as: ${user.uid}\n`);
    
    // Test 1: Create new user profile with valid data
    console.log("2. Test: Create new user profile");
    const createUserProfile = httpsCallable(functions, "createUserProfile");
    
    try {
      const result = await createUserProfile({
        username: `testuser_${Date.now()}`, // Unique username
        favoriteTeam: "Kansas City Chiefs",
        payoutMethod: "venmo",
        payoutHandle: "@testuser",
      });
      
      console.log("   ✓ Success:", JSON.stringify(result.data, null, 2));
      console.log(`   ✓ User created with ID: ${result.data.userId}\n`);
    } catch (error) {
      console.error("   ✗ Error:", error.message);
      if (error.code) console.error(`   Code: ${error.code}`);
      console.log();
    }
    
    // Test 2: Update existing user profile
    console.log("3. Test: Update existing user profile");
    try {
      const result = await createUserProfile({
        username: `testuser_${Date.now()}_updated`, // New unique username
        favoriteTeam: "San Francisco 49ers",
        payoutMethod: "zelle",
        payoutHandle: "zelle@test.com",
      });
      
      console.log("   ✓ Success:", JSON.stringify(result.data, null, 2));
      console.log("   ✓ User profile updated\n");
    } catch (error) {
      console.error("   ✗ Error:", error.message);
      if (error.code) console.error(`   Code: ${error.code}`);
      console.log();
    }
    
    // Test 3: Invalid username (too short)
    console.log("4. Test: Invalid username (too short)");
    try {
      const result = await createUserProfile({
        username: "ab", // Only 2 characters
      });
      
      console.log("   ✗ Should have failed but got:", JSON.stringify(result.data, null, 2));
    } catch (error) {
      console.log("   ✓ Expected error:", error.message);
      if (error.code) console.log(`   Code: ${error.code}`);
      console.log();
    }
    
    // Test 4: Invalid username (special characters)
    console.log("5. Test: Invalid username (special characters)");
    try {
      const result = await createUserProfile({
        username: "test@user!", // Invalid characters
      });
      
      console.log("   ✗ Should have failed but got:", JSON.stringify(result.data, null, 2));
    } catch (error) {
      console.log("   ✓ Expected error:", error.message);
      if (error.code) console.log(`   Code: ${error.code}`);
      console.log();
    }
    
    // Test 5: Missing username
    console.log("6. Test: Missing username");
    try {
      const result = await createUserProfile({
        favoriteTeam: "Chiefs",
      });
      
      console.log("   ✗ Should have failed but got:", JSON.stringify(result.data, null, 2));
    } catch (error) {
      console.log("   ✓ Expected error:", error.message);
      if (error.code) console.log(`   Code: ${error.code}`);
      console.log();
    }
    
    // Test 6: Duplicate username (reuse same username)
    console.log("7. Test: Duplicate username");
    const duplicateUsername = `duplicate_${Date.now()}`;
    try {
      // Create first user with this username
      await createUserProfile({
        username: duplicateUsername,
      });
      console.log(`   ✓ First user created with username: ${duplicateUsername}`);
      
      // Sign out and create a new anonymous user
      await auth.signOut();
      await signInAnonymously(auth);
      const newUser = auth.currentUser;
      console.log(`   ✓ New user authenticated: ${newUser.uid}`);
      
      // Try to create second user with same username
      await createUserProfile({
        username: duplicateUsername,
      });
      
      console.log("   ✗ Should have failed but succeeded");
    } catch (error) {
      console.log("   ✓ Expected error:", error.message);
      if (error.code) console.log(`   Code: ${error.code}`);
      console.log();
    }
    
    console.log("=== All Tests Complete ===\n");
    
  } catch (error) {
    console.error("Fatal error:", error);
  } finally {
    // Sign out
    await auth.signOut();
    console.log("Signed out.");
    process.exit(0);
  }
}

// Run tests
runTests().catch(console.error);
