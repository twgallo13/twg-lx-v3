/**
 * Test Script for reserveSquare Function
 * 
 * This script demonstrates the deployed reserveSquare function behavior.
 * 
 * Requirements:
 * - Firebase SDK installed at repo root
 * - Firebase Auth configured with a test user
 * - A test game created in Firestore with status: 'open'
 * - Test squares in games/{gameId}/squares/{squareId} with state: 'available'
 * 
 * Run: node test-reserveSquare.js
 */

const { initializeApp } = require("firebase/app");
const { getFunctions, httpsCallable } = require("firebase/functions");
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

/**
 * Test Cases
 */
async function runTests() {
  console.log("\n=== Testing reserveSquare Function ===\n");

  try {
    // Authenticate
    console.log("1. Authenticating with Firebase...");
    const userCredential = await signInAnonymously(auth);
    const user = userCredential.user;
    console.log(`   ✓ Authenticated as: ${user.uid}\n`);

    // Test 1: Unauthenticated request
    console.log("2. Test: Unauthenticated request");
    try {
      await auth.signOut();
      const reserveSquare = httpsCallable(functions, "reserveSquare");
      await reserveSquare({ gameId: "test-game", squareId: "test-square" });
      console.log("   ✗ Should have failed but succeeded\n");
    } catch (error) {
      console.log("   ✓ Expected error:", error.message);
      console.log(`   Code: ${error.code}\n`);
    }

    // Re-authenticate for remaining tests
    await signInAnonymously(auth);

    // Test 2: Missing gameId
    console.log("3. Test: Missing gameId");
    try {
      const reserveSquare = httpsCallable(functions, "reserveSquare");
      await reserveSquare({ squareId: "test-square" });
      console.log("   ✗ Should have failed but succeeded\n");
    } catch (error) {
      console.log("   ✓ Expected error:", error.message);
      console.log(`   Code: ${error.code}\n`);
    }

    // Test 3: Empty squareId
    console.log("4. Test: Empty squareId");
    try {
      const reserveSquare = httpsCallable(functions, "reserveSquare");
      await reserveSquare({ gameId: "test-game", squareId: "" });
      console.log("   ✗ Should have failed but succeeded\n");
    } catch (error) {
      console.log("   ✓ Expected error:", error.message);
      console.log(`   Code: ${error.code}\n`);
    }

    // Test 4: Non-existent game
    console.log("5. Test: Non-existent game");
    try {
      const reserveSquare = httpsCallable(functions, "reserveSquare");
      await reserveSquare({
        gameId: "nonexistent-game-" + Date.now(),
        squareId: "square-0-0",
      });
      console.log("   ✗ Should have failed but succeeded\n");
    } catch (error) {
      console.log("   ✓ Expected error:", error.message);
      console.log(`   Code: ${error.code}\n`);
    }

    // Test 5: Successful reservation (requires manual setup)
    console.log("6. Test: Successful reservation");
    console.log("   NOTE: This test requires a test game and square to be set up manually.");
    console.log("   Create a game with status: 'open' and a square with state: 'available'");
    console.log("   Then uncomment and update the code below:\n");

    /*
    try {
      const reserveSquare = httpsCallable(functions, "reserveSquare");
      const result = await reserveSquare({
        gameId: "YOUR_TEST_GAME_ID",
        squareId: "YOUR_TEST_SQUARE_ID",
      });

      console.log("   ✓ Success:", JSON.stringify(result.data, null, 2));
      console.log(`   ✓ Square reserved until: ${new Date(result.data.reservedUntil._seconds * 1000).toISOString()}\n`);
    } catch (error) {
      console.error("   ✗ Error:", error.message);
      console.error(`   Code: ${error.code}\n`);
    }
    */

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
