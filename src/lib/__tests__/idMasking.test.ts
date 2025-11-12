/**
 * Unit tests for generic ID masking utility
 * Tests multiple ID types: National ID, Passport, SSN, Driver License, etc.
 */

import { describe, it, expect } from "vitest";
import { maskID, validateIDFormat, registerIDType, getMaskingRule, type IDType } from "../idMasking";

describe("maskID - Generic ID Masking", () => {
  describe("Aadhaar (India)", () => {
    it("should mask Aadhaar number showing last 4 digits", () => {
      expect(maskID("Aadhaar", "123456789012")).toBe("XXXX XXXX 9012");
      expect(maskID("Aadhaar", "987654321098")).toBe("XXXX XXXX 1098");
    });

    it("should handle Aadhaar with spaces", () => {
      expect(maskID("Aadhaar", "1234 5678 9012")).toBe("XXXX XXXX 9012");
      expect(maskID("Aadhaar", "9876 5432 1098")).toBe("XXXX XXXX 1098");
    });

    it("should handle short Aadhaar numbers", () => {
      expect(maskID("Aadhaar", "123456")).toBe("XX3456");
    });
  });

  describe("Passport", () => {
    it("should mask Passport showing first char and last 2 digits", () => {
      expect(maskID("Passport", "P12345678")).toBe("PXXXXXX78");
      expect(maskID("Passport", "A98765432")).toBe("AXXXXXX32");
    });

    it("should handle Passport with different lengths", () => {
      expect(maskID("Passport", "P1234567")).toBe("PXXXXX67");
      expect(maskID("Passport", "P123456789")).toBe("PXXXXXXX89");
    });

    it("should handle lowercase passport numbers", () => {
      expect(maskID("Passport", "p12345678")).toBe("PXXXXXX78");
    });
  });

  describe("Social Security Number (USA)", () => {
    it("should mask SSN showing last 4 digits with format", () => {
      expect(maskID("Social Security Number", "123-45-6789")).toBe("XXX-XX-6789");
      expect(maskID("Social Security Number", "987-65-4321")).toBe("XXX-XX-4321");
    });

    it("should handle SSN without dashes", () => {
      expect(maskID("Social Security Number", "123456789")).toBe("XXX-XX-6789");
      expect(maskID("Social Security Number", "987654321")).toBe("XXX-XX-4321");
    });
  });

  describe("Driver License", () => {
    it("should mask Driver License showing last 4 characters", () => {
      expect(maskID("Driver License", "DL12345678")).toBe("XXXX5678");
      expect(maskID("Driver License", "ABC123456")).toBe("XXXX3456");
    });

    it("should handle Driving Licence variant", () => {
      expect(maskID("Driving Licence", "DL12345678")).toBe("XXXX5678");
    });

    it("should handle short license numbers", () => {
      expect(maskID("Driver License", "DL1234")).toBe("XX34");
    });
  });

  describe("State ID (USA)", () => {
    it("should mask State ID showing last 4 characters", () => {
      expect(maskID("State ID", "ST12345678")).toBe("XXXX5678");
      expect(maskID("State ID", "ID98765432")).toBe("XXXX5432");
    });
  });

  describe("Emirates ID (UAE)", () => {
    it("should mask Emirates ID preserving format", () => {
      expect(maskID("Emirates ID", "784-1234-5678901-2")).toBe("784-XXXX-XXXXXXX-2");
      expect(maskID("Emirates ID", "784-9876-5432109-8")).toBe("784-XXXX-XXXXXXX-8");
    });

    it("should handle Emirates ID without dashes", () => {
      expect(maskID("Emirates ID", "784123456789012")).toBe("784-XXXX-XXXXXXX-2");
    });
  });

  describe("BRP (UK)", () => {
    it("should mask BRP showing first 2 letters", () => {
      expect(maskID("BRP", "AB1234567")).toBe("ABXXXXXXX");
      expect(maskID("BRP", "XY9876543")).toBe("XYXXXXXXX");
    });
  });

  describe("National ID", () => {
    it("should mask National ID showing last 4 characters (default)", () => {
      expect(maskID("National ID", "987654321")).toBe("XXXXX4321");
      expect(maskID("National ID", "123456789012")).toBe("XXXXXXXX4321");
    });
  });

  describe("Tax ID", () => {
    it("should mask Tax ID showing last 4 characters", () => {
      expect(maskID("Tax ID", "TAX12345678")).toBe("XXXX5678");
      expect(maskID("Tax ID", "987654321")).toBe("XXXXX4321");
    });
  });

  describe("Unknown ID types", () => {
    it("should default to masking all but last 4 characters", () => {
      expect(maskID("Unknown", "987654321")).toBe("XXXXX4321");
      expect(maskID("", "123456789012")).toBe("XXXXXXXX4321");
      expect(maskID("Custom ID Type", "ABCD12345678")).toBe("XXXXXXXX5678");
    });
  });

  describe("Edge cases", () => {
    it("should handle empty strings", () => {
      expect(maskID("Aadhaar", "")).toBe("XXXX");
      expect(maskID("Passport", "")).toBe("XXXX");
    });

    it("should handle very short IDs", () => {
      expect(maskID("Unknown", "12")).toBe("X2");
      expect(maskID("Unknown", "1")).toBe("X");
    });

    it("should handle whitespace-only strings", () => {
      expect(maskID("Aadhaar", "   ")).toBe("XXXX");
    });

    it("should handle IDs with special characters", () => {
      expect(maskID("Passport", "P-123-456-78")).toBe("PXXXXXX78");
      expect(maskID("Driver License", "DL-123-456")).toBe("XXXX3456");
    });

    it("should handle case-insensitive ID types", () => {
      expect(maskID("aadhaar", "123456789012")).toBe("XXXX XXXX 9012");
      expect(maskID("PASSPORT", "P12345678")).toBe("PXXXXXX78");
      expect(maskID("driver license", "DL12345678")).toBe("XXXX5678");
    });
  });

  describe("Security requirements", () => {
    it("should never return raw ID values", () => {
      const rawId = "123456789012";
      const masked = maskID("Aadhaar", rawId);
      expect(masked).not.toBe(rawId);
      expect(masked).not.toContain(rawId);
    });

    it("should mask majority of ID", () => {
      const masked = maskID("Aadhaar", "123456789012");
      const visibleChars = masked.replace(/X/g, "").replace(/\s/g, "").length;
      expect(visibleChars).toBeLessThan(5); // Only last 4 digits visible
    });

    it("should always return a masked value even for invalid input", () => {
      expect(maskID("Unknown", null as any)).toBe("XXXX");
      expect(maskID("Unknown", undefined as any)).toBe("XXXX");
    });
  });
});

describe("validateIDFormat", () => {
  it("should validate Aadhaar format", () => {
    expect(validateIDFormat("Aadhaar", "123456789012")).toBe(true);
    expect(validateIDFormat("Aadhaar", "1234 5678 9012")).toBe(true);
    expect(validateIDFormat("Aadhaar", "12345")).toBe(false);
  });

  it("should validate Passport format", () => {
    expect(validateIDFormat("Passport", "P12345678")).toBe(true);
    expect(validateIDFormat("Passport", "A98765432")).toBe(true);
    expect(validateIDFormat("Passport", "12345678")).toBe(false);
  });

  it("should validate SSN format", () => {
    expect(validateIDFormat("Social Security Number", "123-45-6789")).toBe(true);
    expect(validateIDFormat("Social Security Number", "123456789")).toBe(true);
    expect(validateIDFormat("Social Security Number", "12345")).toBe(false);
  });

  it("should validate Emirates ID format", () => {
    expect(validateIDFormat("Emirates ID", "784-1234-5678901-2")).toBe(true);
    expect(validateIDFormat("Emirates ID", "784123456789012")).toBe(true);
    expect(validateIDFormat("Emirates ID", "123456789")).toBe(false);
  });

  it("should return true for unknown types (no pattern defined)", () => {
    expect(validateIDFormat("Unknown", "any-value")).toBe(true);
  });
});

describe("registerIDType", () => {
  it("should allow registering new ID types", () => {
    registerIDType("Custom ID", {
      pattern: /^CUST-\d{6}$/,
      mask: (value) => `CUST-XX${value.slice(-2)}`,
      visibleChars: 2,
    });

    expect(maskID("Custom ID", "CUST-123456")).toBe("CUST-XX56");
    expect(validateIDFormat("Custom ID", "CUST-123456")).toBe(true);
  });

  it("should allow overriding existing ID types", () => {
    const original = maskID("Passport", "P12345678");
    registerIDType("Passport", {
      mask: (value) => `MASKED-${value.slice(-2)}`,
    });
    const custom = maskID("Passport", "P12345678");
    expect(custom).toBe("MASKED-78");
    expect(custom).not.toBe(original);
  });
});

describe("getMaskingRule", () => {
  it("should return masking rule for known ID types", () => {
    const rule = getMaskingRule("Aadhaar");
    expect(rule).toBeDefined();
    expect(rule?.mask).toBeDefined();
    expect(typeof rule?.mask).toBe("function");
  });

  it("should return undefined for unknown ID types", () => {
    const rule = getMaskingRule("NonExistent ID");
    expect(rule).toBeUndefined();
  });

  it("should handle case-insensitive lookups", () => {
    const rule1 = getMaskingRule("aadhaar");
    const rule2 = getMaskingRule("AADHAAR");
    expect(rule1).toBeDefined();
    expect(rule2).toBeDefined();
  });
});

describe("Integration examples from requirements", () => {
  it("should handle example: National ID 987654321 → XXXXX4321", () => {
    expect(maskID("National ID", "987654321")).toBe("XXXXX4321");
  });

  it("should handle example: Passport XXXXXXX89", () => {
    const result = maskID("Passport", "P12345689");
    expect(result).toMatch(/X{5,}89/);
  });

  it("should handle example: SSN XXX-XX-6789", () => {
    expect(maskID("Social Security Number", "123-45-6789")).toBe("XXX-XX-6789");
  });
});

