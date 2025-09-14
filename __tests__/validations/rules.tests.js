import { z } from "zod";

import {
  integerValidation,
  stringValidation,
  uuidValidation,
  authorizationValidation,
  emailValidation,
  arrayValidation,
} from "../../src/validations/rules";

describe("Validation Rules", () => {
  describe("integerValidation", () => {
    it("should validate an integer without min/max constraints", () => {
      const schema = integerValidation("age");
      expect(schema.safeParse(25).success).toBe(true);
      expect(schema.safeParse("25").success).toBe(true);
      expect(schema.safeParse(25.5).success).toBe(false);
      expect(schema.safeParse("abc").success).toBe(false);
    });

    it("should validate an integer with a min constraint", () => {
      const schema = integerValidation("age", 18);
      expect(schema.safeParse(25).success).toBe(true);
      expect(schema.safeParse(18).success).toBe(true);
      expect(schema.safeParse(17).success).toBe(false);
    });

    it("should validate an integer with a max constraint", () => {
      const schema = integerValidation("age", undefined, 65);
      expect(schema.safeParse(60).success).toBe(true);
      expect(schema.safeParse(65).success).toBe(true);
      expect(schema.safeParse(66).success).toBe(false);
    });

    it("should validate an integer with both min and max constraints", () => {
      const schema = integerValidation("age", 18, 65);
      expect(schema.safeParse(30).success).toBe(true);
      expect(schema.safeParse(17).success).toBe(false);
      expect(schema.safeParse(66).success).toBe(false);
    });
  });

  describe("stringValidation", () => {
    it("should validate a string", () => {
      const schema = stringValidation("name");
      expect(schema.safeParse("John Doe").success).toBe(true);
      expect(schema.safeParse("  John Doe  ").success).toBe(true);
      expect(schema.safeParse("").success).toBe(false);
      expect(schema.safeParse("a".repeat(256)).success).toBe(false);
    });
  });

  describe("uuidValidation", () => {
    it("should validate a UUID", () => {
      const schema = uuidValidation("id");
      expect(
        schema.safeParse("123e4567-e89b-12d3-a456-426614174000").success
      ).toBe(true);
      expect(schema.safeParse("not-a-uuid").success).toBe(false);
    });
  });

  describe("authorizationValidation", () => {
    it("should validate an authorization header", () => {
      const schema = authorizationValidation();
      const validHeader =
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
      expect(schema.safeParse({ authorization: validHeader }).success).toBe(
        true
      );
      expect(
        schema.safeParse({ authorization: "Bearer invalid" }).success
      ).toBe(false);
      expect(schema.safeParse({ authorization: "invalid" }).success).toBe(
        false
      );
    });
  });

  describe("emailValidation", () => {
    it("should validate an email", () => {
      const schema = emailValidation();
      expect(schema.safeParse("test@example.com").success).toBe(true);
      expect(schema.safeParse("not-an-email").success).toBe(false);
    });
  });

  describe("arrayValidation", () => {
    it("should validate an array of strings", () => {
      const schema = arrayValidation("tags", z.string());
      expect(schema.safeParse(["tag1", "tag2"]).success).toBe(true);
      expect(schema.safeParse([]).success).toBe(false);
      expect(schema.safeParse(["tag1", 2]).success).toBe(false);
    });
  });
});
