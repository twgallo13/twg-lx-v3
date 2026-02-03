/**
 * Test script to invoke a callable Cloud Function and verify NOT_IMPLEMENTED response.
 * 
 * Usage:
 *   node test-function.js
 * 
 * Prerequisites:
 *   npm install firebase firebase-admin
 */

const { initializeApp } = require("firebase/app");
const { getFunctions, httpsCallable } = require("firebase/functions");

// Firebase config from spec Section 1.2
const firebaseConfig = {
  apiKey: "AIzaSyAVSevNYj_NlGwQqLqNyZabCh116v19Fag",
  authDomain: "studio-3220084595-54dab.firebaseapp.com",
  projectId: "studio-3220084595-54dab",
  storageBucket: "studio-3220084595-54dab.firebasestorage.app",
  messagingSenderId: "171056784022",
  appId: "1:171056784022:web:55c6c576644e02116298b7",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const functions = getFunctions(app, "us-central1");

// Test createUserProfile function
async function testCreateUserProfile() {
  console.log("Testing createUserProfile callable function...\n");

  const createUserProfile = httpsCallable(functions, "createUserProfile");

  try {
    const result = await createUserProfile({ test: "data" });
    console.log("✅ Function invoked successfully");
    console.log("Response:", JSON.stringify(result.data, null, 2));

    if (
      result.data &&
      result.data.error === "NOT_IMPLEMENTED"
    ) {
      console.log("\n✅ PASS: Function returned NOT_IMPLEMENTED as expected");
      return true;
    } else {
      console.log("\n❌ FAIL: Unexpected response format");
      return false;
    }
  } catch (error) {
    console.error("❌ Error invoking function:", error.message);
    return false;
  }
}

// Run test
testCreateUserProfile()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("Unhandled error:", error);
    process.exit(1);
  });
