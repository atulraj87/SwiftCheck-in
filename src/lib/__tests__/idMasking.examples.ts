/**
 * ID Masking Examples
 * Demonstrates how different ID types are masked across various countries
 */

import { maskID, validateIDFormat } from "../idMasking";

/**
 * Example test cases for various ID types from around the world
 */
export const maskingExamples = [
  // India
  {
    country: "India",
    idType: "Aadhaar",
    original: "123456789012",
    masked: maskID("Aadhaar", "123456789012"),
    expected: "XXXXXXXX9012",
    description: "12-digit Aadhaar number with last 4 digits visible",
  },
  {
    country: "India",
    idType: "Aadhaar",
    original: "1234 5678 9012",
    masked: maskID("Aadhaar", "1234 5678 9012"),
    expected: "XXXXXXXX9012",
    description: "Aadhaar with spaces (spaces removed in masking)",
  },
  {
    country: "India",
    idType: "PAN Card",
    original: "ABCDE1234F",
    masked: maskID("PAN Card", "ABCDE1234F"),
    expected: "XXXXXX234F",
    description: "PAN card with last 4 characters visible",
  },
  {
    country: "India",
    idType: "Passport",
    original: "P12345678",
    masked: maskID("Passport", "P12345678"),
    expected: "PXXXXXX78",
    description: "Indian passport with first letter and last 2 visible",
  },

  // USA
  {
    country: "USA",
    idType: "Social Security Number",
    original: "123-45-6789",
    masked: maskID("Social Security Number", "123-45-6789"),
    expected: "XXX-XX-6789",
    description: "SSN with last 4 digits visible, format preserved",
  },
  {
    country: "USA",
    idType: "Driver License",
    original: "A1234567",
    masked: maskID("Driver License", "A1234567"),
    expected: "XXXX4567",
    description: "US driver license with last 4 visible",
  },
  {
    country: "USA",
    idType: "State ID",
    original: "ID1234567890",
    masked: maskID("State ID", "ID1234567890"),
    expected: "XXXXXXXX7890",
    description: "State ID with last 4 visible",
  },

  // Singapore
  {
    country: "Singapore",
    idType: "NRIC",
    original: "S1234567A",
    masked: maskID("NRIC", "S1234567A"),
    expected: "SXXXX567A",
    description: "Singapore NRIC with first letter and last 4 visible",
  },
  {
    country: "Singapore",
    idType: "NRIC",
    original: "T9876543Z",
    masked: maskID("NRIC", "T9876543Z"),
    expected: "TXXXX543Z",
    description: "Singapore NRIC (foreign worker)",
  },

  // UAE
  {
    country: "UAE",
    idType: "Emirates ID",
    original: "784-1234-5678901-2",
    masked: maskID("Emirates ID", "784-1234-5678901-2"),
    expected: "784-XXXX-XXXXXXX-2",
    description: "Emirates ID with last digit visible",
  },

  // UK
  {
    country: "UK",
    idType: "BRP",
    original: "AB1234567",
    masked: maskID("BRP", "AB1234567"),
    expected: "ABXXXXXXX",
    description: "UK BRP with first 2 letters visible",
  },
  {
    country: "UK",
    idType: "Driving Licence",
    original: "SMITH801234AB1CD",
    masked: maskID("Driving Licence", "SMITH801234AB1CD"),
    expected: "XXXXXXXXXXX1CD",
    description: "UK driving licence with last 4 visible",
  },

  // China
  {
    country: "China",
    idType: "China ID",
    original: "123456789012345678",
    masked: maskID("China ID", "123456789012345678"),
    expected: "XXXXXXXXXXXXXX5678",
    description: "18-digit China ID with last 4 visible",
  },

  // South Korea
  {
    country: "South Korea",
    idType: "Korean ID",
    original: "900101-1234567",
    masked: maskID("Korean ID", "900101-1234567"),
    expected: "XXXXXX-XXX4567",
    description: "Korean resident registration with last 4 visible",
  },

  // Japan
  {
    country: "Japan",
    idType: "My Number",
    original: "123456789012",
    masked: maskID("My Number", "123456789012"),
    expected: "XXXXXXXX9012",
    description: "Japanese My Number with last 4 visible",
  },

  // Australia
  {
    country: "Australia",
    idType: "Medicare Card",
    original: "1234567890",
    masked: maskID("Medicare Card", "1234567890"),
    expected: "XXXXXX7890",
    description: "Medicare card with last 4 visible",
  },

  // Canada
  {
    country: "Canada",
    idType: "Social Insurance Number",
    original: "123-456-789",
    masked: maskID("Social Insurance Number", "123-456-789"),
    expected: "XXX-XXX-789",
    description: "Canadian SIN with last 3 visible",
  },

  // Brazil
  {
    country: "Brazil",
    idType: "CPF",
    original: "123.456.789-01",
    masked: maskID("CPF", "123.456.789-01"),
    expected: "XXX.XXX.XXX-01",
    description: "Brazilian CPF with last 2 visible",
  },

  // Spain/Argentina
  {
    country: "Spain",
    idType: "DNI",
    original: "12345678A",
    masked: maskID("DNI", "12345678A"),
    expected: "XXXXX678A",
    description: "Spanish DNI with last 4 visible",
  },

  // Mexico
  {
    country: "Mexico",
    idType: "CURP",
    original: "ABCD901234HDFRRL09",
    masked: maskID("CURP", "ABCD901234HDFRRL09"),
    expected: "XXXXXXXXXXXXRL09",
    description: "Mexican CURP with last 4 visible",
  },

  // Generic/Unknown
  {
    country: "Unknown",
    idType: "Unknown",
    original: "ABC1234567890",
    masked: maskID("Unknown", "ABC1234567890"),
    expected: "XXXXXXXXX7890",
    description: "Unknown ID type defaults to last 4 visible",
  },
];

/**
 * Validation examples
 */
export const validationExamples = [
  // Valid IDs
  { idType: "Aadhaar", value: "123456789012", valid: validateIDFormat("Aadhaar", "123456789012") },
  { idType: "NRIC", value: "S1234567A", valid: validateIDFormat("NRIC", "S1234567A") },
  { idType: "Emirates ID", value: "784-1234-5678901-2", valid: validateIDFormat("Emirates ID", "784-1234-5678901-2") },
  { idType: "Social Security Number", value: "123-45-6789", valid: validateIDFormat("Social Security Number", "123-45-6789") },
  { idType: "CPF", value: "123.456.789-01", valid: validateIDFormat("CPF", "123.456.789-01") },
  
  // Invalid IDs
  { idType: "Aadhaar", value: "12345", valid: validateIDFormat("Aadhaar", "12345") }, // Too short
  { idType: "NRIC", value: "A1234567A", valid: validateIDFormat("NRIC", "A1234567A") }, // Wrong format
  { idType: "Emirates ID", value: "784-123-456-7", valid: validateIDFormat("Emirates ID", "784-123-456-7") }, // Wrong format
];

/**
 * Display masking examples (for testing and documentation)
 */
export function displayMaskingExamples(): void {
  console.log("=== ID Masking Examples ===\n");
  
  maskingExamples.forEach((example, index) => {
    console.log(`${index + 1}. ${example.country} - ${example.idType}`);
    console.log(`   Original: ${example.original}`);
    console.log(`   Masked:   ${example.masked}`);
    console.log(`   Expected: ${example.expected}`);
    console.log(`   ✓ ${example.masked === example.expected ? "PASS" : "FAIL"}`);
    console.log(`   ${example.description}`);
    console.log("");
  });
}

/**
 * Display validation examples
 */
export function displayValidationExamples(): void {
  console.log("=== ID Validation Examples ===\n");
  
  validationExamples.forEach((example, index) => {
    console.log(`${index + 1}. ${example.idType}: ${example.value}`);
    console.log(`   Valid: ${example.valid ? "✓ YES" : "✗ NO"}`);
    console.log("");
  });
}

/**
 * Test all masking examples
 */
export function testAllMasking(): { passed: number; failed: number; total: number } {
  let passed = 0;
  let failed = 0;
  
  maskingExamples.forEach((example) => {
    if (example.masked === example.expected) {
      passed++;
    } else {
      failed++;
      console.error(`FAILED: ${example.idType} - Expected "${example.expected}", got "${example.masked}"`);
    }
  });
  
  return { passed, failed, total: maskingExamples.length };
}

/**
 * Example usage scenarios
 */
export const usageScenarios = {
  hotelCheckIn: {
    scenario: "Hotel Pre-Check-In",
    description: "Guest uploads Aadhaar card for pre-check-in",
    steps: [
      "1. Guest selects 'India' as destination country",
      "2. Guest selects 'Aadhaar' as ID type",
      "3. Guest uploads Aadhaar card image",
      "4. System extracts: Name='Jane Doe', DOB='1990', ID='123456789012'",
      "5. System masks: Name='XXXX XXXX', DOB='XXXX', ID='XXXXXXXX9012'",
      "6. Guest sees masked preview and confirms",
      "7. Only masked data is stored in database",
      "8. At check-in, hotel verifies last 4 digits match physical ID",
    ],
  },
  
  internationalGuest: {
    scenario: "International Guest with Passport",
    description: "US guest staying at hotel in Singapore",
    steps: [
      "1. Guest selects 'Singapore' as destination country",
      "2. Guest selects 'Passport' as ID type",
      "3. Guest uploads US passport image",
      "4. System extracts: Name='John Smith', DOB='1985', ID='P12345678'",
      "5. System masks: Name='XXXX XXXX', DOB='XXXX', ID='PXXXXXX78'",
      "6. Guest sees masked preview and confirms",
      "7. Hotel can verify first letter 'P' and last 2 digits '78'",
    ],
  },
  
  multipleGuests: {
    scenario: "Family Check-In (Multiple Guests)",
    description: "Family of 4 checking in with different ID types",
    steps: [
      "1. Primary guest enters booking details",
      "2. Selects '4 guests' from dropdown",
      "3. Each guest uploads their own ID document",
      "4. System masks each ID individually",
      "5. All masked IDs stored with booking reference",
      "6. Hotel verifies each guest at check-in",
    ],
  },
};

// Export for use in tests
export default {
  maskingExamples,
  validationExamples,
  usageScenarios,
  displayMaskingExamples,
  displayValidationExamples,
  testAllMasking,
};

