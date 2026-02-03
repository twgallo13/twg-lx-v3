/**
 * Unit Tests for reserveSquare
 * 
 * Tests cover:
 * - Authentication requirements
 * - Input validation (gameId, squareId)
 * - Game existence and status checks
 * - Square existence and state validation
 * - Square coordinate validation
 * - Successful reservation with timestamp
 * - Race condition handling (concurrent reservations)
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

// Mock Timestamp
(admin.firestore as any).Timestamp = {
  fromMillis: jest.fn((ms) => ({ _seconds: Math.floor(ms / 1000), _nanoseconds: 0 })),
};

describe("reserveSquare", () => {
  let reserveSquare: any;

  beforeAll(() => {
    // Import function after mocking admin
    reserveSquare = require("../src/reserveSquare").reserveSquare;
  });

  afterAll(() => {
    testEnv.cleanup();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Authentication", () => {
    it("should reject unauthenticated requests", async () => {
      const wrapped = testEnv.wrap(reserveSquare);

      await expect(
        wrapped({ gameId: "game123", squareId: "square456" }, { auth: null })
      ).rejects.toThrow("Authentication required");
    });

    it("should reject requests without UID", async () => {
      const wrapped = testEnv.wrap(reserveSquare);

      await expect(
        wrapped({ gameId: "game123", squareId: "square456" }, { auth: {} })
      ).rejects.toThrow("Authentication required");
    });
  });

  describe("Input Validation", () => {
    it("should reject missing gameId", async () => {
      const wrapped = testEnv.wrap(reserveSquare);

      await expect(
        wrapped({ squareId: "square456" }, { auth: { uid: "user123" } })
      ).rejects.toThrow("gameId is required");
    });

    it("should reject empty gameId", async () => {
      const wrapped = testEnv.wrap(reserveSquare);

      await expect(
        wrapped({ gameId: "", squareId: "square456" }, { auth: { uid: "user123" } })
      ).rejects.toThrow("gameId is required");
    });

    it("should reject missing squareId", async () => {
      const wrapped = testEnv.wrap(reserveSquare);

      await expect(
        wrapped({ gameId: "game123" }, { auth: { uid: "user123" } })
      ).rejects.toThrow("squareId is required");
    });

    it("should reject empty squareId", async () => {
      const wrapped = testEnv.wrap(reserveSquare);

      await expect(
        wrapped({ gameId: "game123", squareId: "  " }, { auth: { uid: "user123" } })
      ).rejects.toThrow("squareId is required");
    });
  });

  describe("Game Validation", () => {
    it("should reject non-existent game", async () => {
      const wrapped = testEnv.wrap(reserveSquare);

      mockFirestore.runTransaction.mockImplementation(async (callback) => {
        const mockGet = jest.fn().mockResolvedValue({ exists: false });
        await callback({
          get: mockGet,
        });
      });

      await expect(
        wrapped(
          { gameId: "nonexistent", squareId: "square456" },
          { auth: { uid: "user123" } }
        )
      ).rejects.toThrow("Game not found");
    });

    it("should reject game that is not open", async () => {
      const wrapped = testEnv.wrap(reserveSquare);

      mockFirestore.runTransaction.mockImplementation(async (callback) => {
        const mockGameGet = jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({ status: "locked" }),
        });

        await callback({
          get: mockGameGet,
        });
      });

      await expect(
        wrapped(
          { gameId: "game123", squareId: "square456" },
          { auth: { uid: "user123" } }
        )
      ).rejects.toThrow("Game must be open");
    });
  });

  describe("Square Validation", () => {
    it("should reject non-existent square", async () => {
      const wrapped = testEnv.wrap(reserveSquare);

      mockFirestore.runTransaction.mockImplementation(async (callback) => {
        let callCount = 0;
        const mockGet = jest.fn().mockImplementation(() => {
          callCount++;
          if (callCount === 1) {
            // Game exists and is open
            return Promise.resolve({
              exists: true,
              data: () => ({ status: "open" }),
            });
          } else {
            // Square doesn't exist
            return Promise.resolve({ exists: false });
          }
        });

        await callback({
          get: mockGet,
        });
      });

      await expect(
        wrapped(
          { gameId: "game123", squareId: "nonexistent" },
          { auth: { uid: "user123" } }
        )
      ).rejects.toThrow("Square not found");
    });

    it("should reject square with invalid coordinates", async () => {
      const wrapped = testEnv.wrap(reserveSquare);

      mockFirestore.runTransaction.mockImplementation(async (callback) => {
        let callCount = 0;
        const mockGet = jest.fn().mockImplementation(() => {
          callCount++;
          if (callCount === 1) {
            // Game exists and is open
            return Promise.resolve({
              exists: true,
              data: () => ({ status: "open" }),
            });
          } else {
            // Square exists but has invalid coordinates
            return Promise.resolve({
              exists: true,
              data: () => ({
                state: "available",
                row: 15, // Invalid: > 9
                col: 5,
              }),
            });
          }
        });

        await callback({
          get: mockGet,
        });
      });

      await expect(
        wrapped(
          { gameId: "game123", squareId: "square456" },
          { auth: { uid: "user123" } }
        )
      ).rejects.toThrow("invalid coordinates");
    });

    it("should reject square that is not available", async () => {
      const wrapped = testEnv.wrap(reserveSquare);

      mockFirestore.runTransaction.mockImplementation(async (callback) => {
        let callCount = 0;
        const mockGet = jest.fn().mockImplementation(() => {
          callCount++;
          if (callCount === 1) {
            // Game exists and is open
            return Promise.resolve({
              exists: true,
              data: () => ({ status: "open" }),
            });
          } else {
            // Square exists but is already reserved
            return Promise.resolve({
              exists: true,
              data: () => ({
                state: "reserved",
                row: 5,
                col: 3,
                userId: "otheruser",
              }),
            });
          }
        });

        await callback({
          get: mockGet,
        });
      });

      await expect(
        wrapped(
          { gameId: "game123", squareId: "square456" },
          { auth: { uid: "user123" } }
        )
      ).rejects.toThrow("Square not available");
    });
  });

  describe("Successful Reservation", () => {
    it("should successfully reserve an available square", async () => {
      const wrapped = testEnv.wrap(reserveSquare);

      const mockUpdate = jest.fn();
      mockFirestore.runTransaction.mockImplementation(async (callback) => {
        let callCount = 0;
        const mockGet = jest.fn().mockImplementation(() => {
          callCount++;
          if (callCount === 1) {
            // Game exists and is open
            return Promise.resolve({
              exists: true,
              data: () => ({ status: "open" }),
            });
          } else {
            // Square exists and is available
            return Promise.resolve({
              exists: true,
              data: () => ({
                state: "available",
                row: 5,
                col: 3,
              }),
            });
          }
        });

        const result = await callback({
          get: mockGet,
          update: mockUpdate,
        });

        return result;
      });

      // Mock audit log
      const mockAdd = jest.fn().mockResolvedValue({ id: "audit-123" });
      mockFirestore.collection.mockReturnValue({ add: mockAdd });

      const result = await wrapped(
        { gameId: "game123", squareId: "square456" },
        { auth: { uid: "user123" } }
      );

      expect(result).toMatchObject({
        ok: true,
        gameId: "game123",
        squareId: "square456",
      });
      expect(result.reservedUntil).toBeDefined();

      // Verify square was updated with correct fields
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          state: "reserved",
          userId: "user123",
          reservedUntil: expect.anything(),
          reservedAt: "MOCK_TIMESTAMP",
        })
      );

      // Verify audit log was written
      expect(mockAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "SQUARE_RESERVED",
          actorUserId: "user123",
          target: {
            gameId: "game123",
            squareId: "square456",
          },
        })
      );
    });

    it("should calculate reservedUntil as 15 minutes from now", async () => {
      const wrapped = testEnv.wrap(reserveSquare);

      const mockUpdate = jest.fn();
      mockFirestore.runTransaction.mockImplementation(async (callback) => {
        let callCount = 0;
        const mockGet = jest.fn().mockImplementation(() => {
          callCount++;
          if (callCount === 1) {
            return Promise.resolve({
              exists: true,
              data: () => ({ status: "open" }),
            });
          } else {
            return Promise.resolve({
              exists: true,
              data: () => ({
                state: "available",
                row: 2,
                col: 7,
              }),
            });
          }
        });

        const result = await callback({
          get: mockGet,
          update: mockUpdate,
        });

        return result;
      });

      const mockAdd = jest.fn().mockResolvedValue({ id: "audit-123" });
      mockFirestore.collection.mockReturnValue({ add: mockAdd });

      const beforeCall = Date.now();
      const result = await wrapped(
        { gameId: "game123", squareId: "square456" },
        { auth: { uid: "user123" } }
      );
      const afterCall = Date.now();

      // Verify reservedUntil is approximately 15 minutes from now
      const reservedUntilMs = result.reservedUntil._seconds * 1000;
      const expectedMin = beforeCall + (15 * 60 * 1000);
      const expectedMax = afterCall + (15 * 60 * 1000);

      expect(reservedUntilMs).toBeGreaterThanOrEqual(expectedMin - 1000); // 1s tolerance
      expect(reservedUntilMs).toBeLessThanOrEqual(expectedMax + 1000);
    });
  });

  describe("Concurrency & Race Conditions", () => {
    it("should handle transaction aborted error", async () => {
      const wrapped = testEnv.wrap(reserveSquare);

      mockFirestore.runTransaction.mockRejectedValue(
        new Error("Transaction aborted: contention on resource")
      );

      await expect(
        wrapped(
          { gameId: "game123", squareId: "square456" },
          { auth: { uid: "user123" } }
        )
      ).rejects.toThrow("Square already reserved");
    });
  });

  describe("Audit Logging", () => {
    it("should write audit log with correct structure", async () => {
      const wrapped = testEnv.wrap(reserveSquare);

      const mockUpdate = jest.fn();
      mockFirestore.runTransaction.mockImplementation(async (callback) => {
        let callCount = 0;
        const mockGet = jest.fn().mockImplementation(() => {
          callCount++;
          if (callCount === 1) {
            return Promise.resolve({
              exists: true,
              data: () => ({ status: "open" }),
            });
          } else {
            return Promise.resolve({
              exists: true,
              data: () => ({
                state: "available",
                row: 4,
                col: 6,
              }),
            });
          }
        });

        return await callback({
          get: mockGet,
          update: mockUpdate,
        });
      });

      const mockAdd = jest.fn().mockResolvedValue({ id: "audit-123" });
      mockFirestore.collection.mockReturnValue({ add: mockAdd });

      await wrapped(
        { gameId: "game123", squareId: "square456" },
        { auth: { uid: "user123" } }
      );

      expect(mockAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "SQUARE_RESERVED",
          actorUserId: "user123",
          target: {
            gameId: "game123",
            squareId: "square456",
          },
          payload: expect.objectContaining({
            reservedUntil: expect.anything(),
            note: "user reservation",
          }),
          timestamp: "MOCK_TIMESTAMP",
        })
      );
    });
  });
});
