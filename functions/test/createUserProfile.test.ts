/**
 * Unit Tests for createUserProfile
 * 
 * Tests cover:
 * - Authentication requirements
 * - Username validation (length, format)
 * - Username uniqueness (case-insensitive)
 * - User document creation (new users)
 * - User document update (existing users)
 * - Field preservation (protected fields)
 * - Audit log writes
 */

import * as admin from "firebase-admin";
import * as test from "firebase-functions-test";

// Initialize test environment
const testEnv = test();

// Mock Firestore
const mockFirestore = {
  collection: jest.fn(),
  runTransaction: jest.fn(),
};

// Mock admin initialization
jest.mock("firebase-admin", () => ({
  firestore: jest.fn(() => mockFirestore),
  initializeApp: jest.fn(),
  FieldValue: {
    serverTimestamp: jest.fn(() => "MOCK_TIMESTAMP"),
  },
}));

describe("createUserProfile", () => {
  let createUserProfile: any;
  
  beforeAll(() => {
    // Import function after mocking admin
    createUserProfile = require("../src/createUserProfile").createUserProfile;
  });
  
  afterAll(() => {
    testEnv.cleanup();
  });
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe("Authentication", () => {
    it("should reject unauthenticated requests", async () => {
      const wrapped = testEnv.wrap(createUserProfile);
      
      await expect(
        wrapped({ username: "testuser" }, { auth: null })
      ).rejects.toThrow("Authentication required");
    });
    
    it("should reject requests without UID", async () => {
      const wrapped = testEnv.wrap(createUserProfile);
      
      await expect(
        wrapped({ username: "testuser" }, { auth: {} })
      ).rejects.toThrow("Authentication required");
    });
  });
  
  describe("Username Validation", () => {
    it("should reject missing username", async () => {
      const wrapped = testEnv.wrap(createUserProfile);
      
      await expect(
        wrapped({}, { auth: { uid: "test-uid" } })
      ).rejects.toThrow("Username is required");
    });
    
    it("should reject username too short (< 3 chars)", async () => {
      const wrapped = testEnv.wrap(createUserProfile);
      
      await expect(
        wrapped({ username: "ab" }, { auth: { uid: "test-uid" } })
      ).rejects.toThrow("Username must be 3-20 characters");
    });
    
    it("should reject username too long (> 20 chars)", async () => {
      const wrapped = testEnv.wrap(createUserProfile);
      
      await expect(
        wrapped(
          { username: "a".repeat(21) },
          { auth: { uid: "test-uid" } }
        )
      ).rejects.toThrow("Username must be 3-20 characters");
    });
    
    it("should reject username with invalid characters", async () => {
      const wrapped = testEnv.wrap(createUserProfile);
      
      await expect(
        wrapped(
          { username: "test@user!" },
          { auth: { uid: "test-uid" } }
        )
      ).rejects.toThrow("Username can only contain letters, numbers, underscore, and hyphen");
    });
    
    it("should accept valid username with alphanumeric, underscore, hyphen", async () => {
      const wrapped = testEnv.wrap(createUserProfile);
      
      // Mock empty username check (not taken)
      const mockGet = jest.fn().mockResolvedValue({ empty: true, docs: [] });
      mockFirestore.collection.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        get: mockGet,
      });
      
      // Mock transaction
      const mockDoc = jest.fn().mockResolvedValue({ exists: false });
      const mockSet = jest.fn();
      mockFirestore.runTransaction.mockImplementation(async (callback) => {
        await callback({
          get: mockDoc,
          set: mockSet,
        });
      });
      
      // Mock audit log
      const mockAdd = jest.fn().mockResolvedValue({ id: "audit-123" });
      mockFirestore.collection.mockImplementation((name) => {
        if (name === "auditLogs") {
          return { add: mockAdd };
        }
        return {
          where: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          get: mockGet,
          doc: jest.fn().mockReturnValue({}),
        };
      });
      
      const result = await wrapped(
        { username: "Valid_User-123" },
        { auth: { uid: "test-uid" } }
      );
      
      expect(result).toEqual({ ok: true, userId: "test-uid" });
    });
  });
  
  describe("Username Uniqueness", () => {
    it("should reject duplicate username (case-insensitive)", async () => {
      const wrapped = testEnv.wrap(createUserProfile);
      
      // Mock username already exists (different user)
      const mockGet = jest.fn().mockResolvedValue({
        empty: false,
        docs: [{ id: "different-uid", data: () => ({ username: "existinguser" }) }],
      });
      
      mockFirestore.collection.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        get: mockGet,
      });
      
      await expect(
        wrapped(
          { username: "ExistingUser" },
          { auth: { uid: "test-uid" } }
        )
      ).rejects.toThrow("Username taken");
    });
  });
  
  describe("User Document Operations", () => {
    it("should create new user document with required fields", async () => {
      const wrapped = testEnv.wrap(createUserProfile);
      
      // Mock username not taken
      const mockGet = jest.fn().mockResolvedValue({ empty: true, docs: [] });
      
      // Mock transaction for new user
      const mockDoc = jest.fn().mockResolvedValue({ exists: false });
      const mockSet = jest.fn();
      
      mockFirestore.runTransaction.mockImplementation(async (callback) => {
        await callback({
          get: mockDoc,
          set: mockSet,
        });
      });
      
      // Mock audit log
      const mockAdd = jest.fn().mockResolvedValue({ id: "audit-123" });
      
      mockFirestore.collection.mockImplementation((name) => {
        if (name === "auditLogs") {
          return { add: mockAdd };
        }
        return {
          where: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          get: mockGet,
          doc: jest.fn().mockReturnValue({}),
        };
      });
      
      const result = await wrapped(
        {
          username: "newuser",
          favoriteTeam: "Chiefs",
          payoutMethod: "venmo",
          payoutHandle: "@newuser",
        },
        { auth: { uid: "test-uid" } }
      );
      
      expect(result).toEqual({ ok: true, userId: "test-uid" });
      expect(mockSet).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          username: "newuser",
          status: "active",
          smsOptIn: true,
          isShadowUser: false,
          favoriteTeam: "Chiefs",
          payoutMethod: "venmo",
          payoutHandle: "@newuser",
        })
      );
    });
    
    it("should update existing user document and preserve protected fields", async () => {
      const wrapped = testEnv.wrap(createUserProfile);
      
      // Mock username not taken (same user)
      const mockGet = jest.fn().mockResolvedValue({ empty: true, docs: [] });
      
      // Mock transaction for existing user
      const mockDoc = jest.fn().mockResolvedValue({
        exists: true,
        data: () => ({
          username: "oldusername",
          status: "active",
          phoneE164: "+12125551234",
          createdAt: "2025-01-01",
        }),
      });
      const mockUpdate = jest.fn();
      
      mockFirestore.runTransaction.mockImplementation(async (callback) => {
        await callback({
          get: mockDoc,
          update: mockUpdate,
        });
      });
      
      // Mock audit log
      const mockAdd = jest.fn().mockResolvedValue({ id: "audit-123" });
      
      mockFirestore.collection.mockImplementation((name) => {
        if (name === "auditLogs") {
          return { add: mockAdd };
        }
        return {
          where: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          get: mockGet,
          doc: jest.fn().mockReturnValue({}),
        };
      });
      
      const result = await wrapped(
        {
          username: "updatedusername",
          favoriteTeam: "49ers",
        },
        { auth: { uid: "test-uid" } }
      );
      
      expect(result).toEqual({ ok: true, userId: "test-uid" });
      expect(mockUpdate).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          username: "updatedusername",
          favoriteTeam: "49ers",
        })
      );
      // Verify protected fields NOT in update
      expect(mockUpdate).not.toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          phoneE164: expect.anything(),
        })
      );
    });
  });
  
  describe("Audit Logging", () => {
    it("should write audit log on successful creation", async () => {
      const wrapped = testEnv.wrap(createUserProfile);
      
      // Mock username not taken
      const mockGet = jest.fn().mockResolvedValue({ empty: true, docs: [] });
      
      // Mock transaction
      const mockDoc = jest.fn().mockResolvedValue({ exists: false });
      const mockSet = jest.fn();
      
      mockFirestore.runTransaction.mockImplementation(async (callback) => {
        await callback({
          get: mockDoc,
          set: mockSet,
        });
      });
      
      // Mock audit log
      const mockAdd = jest.fn().mockResolvedValue({ id: "audit-123" });
      
      mockFirestore.collection.mockImplementation((name) => {
        if (name === "auditLogs") {
          return { add: mockAdd };
        }
        return {
          where: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          get: mockGet,
          doc: jest.fn().mockReturnValue({}),
        };
      });
      
      await wrapped(
        { username: "testuser" },
        { auth: { uid: "test-uid" } }
      );
      
      expect(mockAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "CREATE_USER_PROFILE",
          actorUserId: "test-uid",
          targetUserId: "test-uid",
        })
      );
    });
  });
});
