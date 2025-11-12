/**
 * Generic ID Masking Utility
 * 
 * Provides secure masking for government-approved digital IDs from any country.
 * Ensures raw IDs are never exposed in UI, API responses, database storage, or logs.
 */

export type IDType =
  | "Aadhaar"
  | "Passport"
  | "Social Security Number"
  | "Driver License"
  | "Driving Licence"
  | "State ID"
  | "Emirates ID"
  | "BRP"
  | "National ID"
  | "Tax ID"
  | "Unknown";

export interface MaskingRule {
  /** Pattern to detect the ID format (optional, for validation) */
  pattern?: RegExp;
  /** Function to mask the ID value */
  mask: (value: string) => string;
  /** Number of characters to show at the end (default: 4) */
  visibleChars?: number;
  /** Mask character to use (default: 'X') */
  maskChar?: string;
  /** Whether to preserve formatting (dashes, spaces, etc.) */
  preserveFormat?: boolean;
}

/**
 * Configuration mapping for ID types and their masking rules
 * Easily extensible for new ID types and country-specific formats
 */
export const ID_MASKING_RULES: Record<string, MaskingRule> = {
  // Aadhaar (India): 12 digits, show last 4 (format: XXXXXXXX9620)
  Aadhaar: {
    pattern: /^\d{4}\s?\d{4}\s?\d{4}$/,
    mask: (value: string) => {
      const digits = value.replace(/\D/g, "");
      if (digits.length === 12) {
        return `XXXXXXXX${digits.slice(8, 12)}`;
      }
      return defaultMask(value, 4);
    },
    visibleChars: 4,
    preserveFormat: false,
  },

  // Passport: Format varies, typically show last 2-4 chars
  Passport: {
    pattern: /^[A-Z][0-9]{7,9}$/i,
    mask: (value: string) => {
      const cleaned = value.replace(/\s+/g, "").toUpperCase();
      if (cleaned.length >= 8) {
        const firstChar = cleaned[0];
        const lastChars = cleaned.slice(-2);
        return `${firstChar}${"X".repeat(Math.max(5, cleaned.length - 3))}${lastChars}`;
      }
      return defaultMask(value, 2);
    },
    visibleChars: 2,
  },

  // Social Security Number (USA): XXX-XX-6789
  "Social Security Number": {
    pattern: /^\d{3}-?\d{2}-?\d{4}$/,
    mask: (value: string) => {
      const digits = value.replace(/\D/g, "");
      if (digits.length === 9) {
        return `XXX-XX-${digits.slice(-4)}`;
      }
      return defaultMask(value, 4);
    },
    visibleChars: 4,
    preserveFormat: true,
  },

  // Driver License / Driving Licence: Show last 4
  "Driver License": {
    pattern: /^[A-Z0-9]{6,}$/i,
    mask: (value: string) => {
      const cleaned = value.replace(/\s+/g, "").toUpperCase();
      if (cleaned.length >= 6) {
        const visible = cleaned.slice(-4);
        const masked = "X".repeat(Math.max(4, cleaned.length - 4));
        return `${masked}${visible}`;
      }
      return defaultMask(value, 4);
    },
    visibleChars: 4,
  },

  "Driving Licence": {
    pattern: /^[A-Z0-9]{6,}$/i,
    mask: (value: string) => {
      const cleaned = value.replace(/\s+/g, "").toUpperCase();
      if (cleaned.length >= 6) {
        const visible = cleaned.slice(-4);
        const masked = "X".repeat(Math.max(4, cleaned.length - 4));
        return `${masked}${visible}`;
      }
      return defaultMask(value, 4);
    },
    visibleChars: 4,
  },

  // State ID (USA): Show last 4
  "State ID": {
    pattern: /^[A-Z0-9]{6,}$/i,
    mask: (value: string) => {
      const cleaned = value.replace(/\s+/g, "").toUpperCase();
      if (cleaned.length >= 6) {
        const visible = cleaned.slice(-4);
        const masked = "X".repeat(Math.max(4, cleaned.length - 4));
        return `${masked}${visible}`;
      }
      return defaultMask(value, 4);
    },
    visibleChars: 4,
  },

  // Emirates ID (UAE): 784-XXXX-XXXXXXX-X
  "Emirates ID": {
    pattern: /^784-?\d{4}-?\d{7}-?\d$/,
    mask: (value: string) => {
      const digits = value.replace(/\D/g, "");
      if (digits.startsWith("784") && digits.length === 15) {
        const lastDigit = digits.slice(-1);
        return `784-XXXX-XXXXXXX-${lastDigit}`;
      }
      return defaultMask(value, 1);
    },
    visibleChars: 1,
    preserveFormat: true,
  },

  // BRP (UK): XX XXXXXXX
  BRP: {
    pattern: /^[A-Z]{2}\d{7}$/i,
    mask: (value: string) => {
      const cleaned = value.replace(/\s+/g, "").toUpperCase();
      if (cleaned.length === 9 && /^[A-Z]{2}\d{7}$/.test(cleaned)) {
        return `${cleaned.slice(0, 2)}XXXXXXX`;
      }
      return defaultMask(value, 4);
    },
    visibleChars: 0,
  },

  // National ID: Generic format, show last 4
  "National ID": {
    mask: (value: string) => defaultMask(value, 4),
    visibleChars: 4,
  },

  // Tax ID: Show last 4
  "Tax ID": {
    mask: (value: string) => defaultMask(value, 4),
    visibleChars: 4,
  },
};

/**
 * Default masking function: masks all but last N characters
 */
function defaultMask(value: string, visibleChars: number = 4): string {
  if (!value || value.length === 0) {
    return value;
  }

  const cleaned = value.replace(/\s+/g, "");
  if (cleaned.length <= visibleChars) {
    // If ID is too short, mask all but 1-2 chars
    const show = Math.max(1, Math.floor(cleaned.length / 2));
    return "X".repeat(cleaned.length - show) + cleaned.slice(-show);
  }

  const visible = cleaned.slice(-visibleChars);
  const masked = "X".repeat(Math.max(4, cleaned.length - visibleChars));
  return `${masked}${visible}`;
}

/**
 * Normalizes ID type string to match configuration keys
 */
function normalizeIDType(idType: string): string {
  const normalized = idType.trim();
  
  // Handle common variations
  const aliases: Record<string, string> = {
    "driving licence": "Driving Licence",
    "driver licence": "Driver License",
    "driving license": "Driver License",
    "driver license": "Driver License",
    "ssn": "Social Security Number",
    "social security": "Social Security Number",
    "national id": "National ID",
    "national identification": "National ID",
    "tax id": "Tax ID",
    "tax identification": "Tax ID",
  };

  const lower = normalized.toLowerCase();
  return aliases[lower] || normalized;
}

/**
 * Generic ID masking function
 * 
 * @param idType - Type of ID (e.g., "Aadhaar", "Passport", "Social Security Number")
 * @param idValue - The raw ID value to mask
 * @returns Masked ID string (never returns raw ID)
 * 
 * @example
 * maskID("Aadhaar", "123456789012") // Returns "XXXX XXXX 9012"
 * maskID("Passport", "P12345678") // Returns "PXXXXXX78"
 * maskID("Social Security Number", "123-45-6789") // Returns "XXX-XX-6789"
 * maskID("Unknown", "987654321") // Returns "XXXXX4321" (default: last 4)
 */
export function maskID(idType: string | IDType, idValue: string): string {
  // Security: Never return empty or null - always return a masked value
  if (!idValue || typeof idValue !== "string" || idValue.trim().length === 0) {
    return "XXXX";
  }

  const normalizedType = normalizeIDType(idType || "Unknown");
  const rule = ID_MASKING_RULES[normalizedType];

  if (rule && rule.mask) {
    try {
      return rule.mask(idValue);
    } catch (error) {
      // Log error securely (without raw ID) and fall back to default
      console.error(`[ID Masking] Error masking ${normalizedType}:`, error);
      return defaultMask(idValue, 4);
    }
  }

  // Fallback to default masking for unknown types
  return defaultMask(idValue, 4);
}

/**
 * Validates if an ID value matches the expected pattern for a given type
 * (Does not expose raw ID in error messages)
 */
export function validateIDFormat(idType: string, idValue: string): boolean {
  if (!idValue || typeof idValue !== "string") {
    return false;
  }

  const normalizedType = normalizeIDType(idType || "Unknown");
  const rule = ID_MASKING_RULES[normalizedType];

  if (rule && rule.pattern) {
    const cleaned = idValue.replace(/\s+/g, "");
    return rule.pattern.test(cleaned);
  }

  // If no pattern defined, consider it valid (will use default masking)
  return true;
}

/**
 * Safely logs ID information without exposing raw values
 * Use this instead of console.log when dealing with IDs
 */
export function safeLogID(idType: string, maskedValue: string, context?: string): void {
  const contextStr = context ? `[${context}] ` : "";
  console.log(`${contextStr}ID Type: ${idType}, Masked: ${maskedValue}`);
}

/**
 * Adds a new ID type and masking rule to the configuration
 * Useful for extending support to new countries/formats
 */
export function registerIDType(
  idType: string,
  rule: MaskingRule
): void {
  ID_MASKING_RULES[idType] = rule;
}

/**
 * Gets the masking rule for a specific ID type
 */
export function getMaskingRule(idType: string): MaskingRule | undefined {
  const normalizedType = normalizeIDType(idType);
  return ID_MASKING_RULES[normalizedType];
}

