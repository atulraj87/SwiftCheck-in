# SwiftCheckin ID Masking Implementation

## 🎯 Overview

This document provides a complete overview of the ID masking feature implemented in the SwiftCheckin hotel pre-check-in system. The feature automatically masks sensitive personal information on government-issued ID documents to protect guest privacy.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [What Was Implemented](#what-was-implemented)
- [How It Works](#how-it-works)
- [Supported Countries & ID Types](#supported-countries--id-types)
- [Technical Architecture](#technical-architecture)
- [Usage Examples](#usage-examples)
- [Testing](#testing)
- [Security & Compliance](#security--compliance)
- [Documentation](#documentation)
- [Future Enhancements](#future-enhancements)

---

## 🚀 Quick Start

### For Users

1. **Select your destination country** from the dropdown
2. **Choose your ID type** (e.g., Passport, Aadhaar, Driver License)
3. **Upload your ID** document (photo or PDF)
4. **Review the masked preview** - sensitive information is automatically hidden
5. **Submit** - only the masked version is stored

### For Developers

```typescript
import { maskID } from "@/lib/idMasking";

// Mask an Aadhaar number
const masked = maskID("Aadhaar", "123456789012");
// Returns: "XXXXXXXX9012"

// Mask a US SSN
const maskedSSN = maskID("Social Security Number", "123-45-6789");
// Returns: "XXX-XX-6789"

// Mask any ID type
const maskedPassport = maskID("Passport", "P12345678");
// Returns: "PXXXXXX78"
```

---

## 💡 What Was Implemented

### 1. **Intelligent ID Number Masking**

Following the Aadhaar card sample provided, the system masks ID numbers with these rules:

- **First 8 characters**: Masked with 'X'
- **Last 4 characters**: Visible for verification
- **Format**: `XXXX XXXX 9012`

This pattern is applied to all ID types across all countries.

### 2. **Name Masking**

The system detects and masks personal names using multilingual indicators:

- **Detects**: NAME, NOMBRE, NOM, NOME, GIVEN, SURNAME, etc.
- **Masks**: Full name replaced with `XXXX XXXX`
- **Languages**: English, Spanish, French, Portuguese, Indonesian, Hindi

### 3. **Date of Birth Masking**

Birth years are masked to prevent age discrimination:

- **Detects**: BIRTH, DOB, DATE OF BIRTH, NACIMIENTO, etc.
- **Masks**: Year replaced with `XXXX`
- **Format**: `15/06/1990` → `XX/XX/XXXX` or `1990` → `XXXX`

### 4. **Visual Masking**

The system applies visual masking directly on the document image:

- **Covers original text** with white overlay
- **Draws masked text** in the same position
- **Preserves layout** so document remains readable
- **Maintains photo** for visual verification

### 5. **Country-Specific Support**

Added support for **20+ countries** with their specific ID types:

| Region | Countries | ID Types |
|--------|-----------|----------|
| **Asia** | India, Singapore, China, Japan, South Korea | Aadhaar, NRIC, China ID, My Number, Korean ID, PAN Card |
| **Middle East** | UAE | Emirates ID |
| **Europe** | UK, France, Germany, Italy, Netherlands, Spain | Passport, EU National ID, BRP, DNI, Driving Licence |
| **Americas** | USA, Canada, Brazil, Mexico, Argentina | SSN, SIN, CPF, CURP, Driver License, State ID |
| **Oceania** | Australia | Medicare Card, Passport, Driving Licence |

### 6. **Validation System**

Enhanced validation to detect and verify ID documents:

- **OCR-based validation** using Tesseract.js
- **Pattern matching** for ID formats
- **Type hints** for fallback validation
- **Confidence scoring** for manual review flags

---

## 🔧 How It Works

### Architecture Flow

```
┌──────────────┐
│ User uploads │
│   ID image   │
└──────┬───────┘
       │
       ▼
┌──────────────────────────┐
│ OCR Text Extraction      │
│ (Tesseract.js)           │
│ - Extract all text       │
│ - Get word positions     │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ ID Type Validation       │
│ - Check document matches │
│ - Verify ID patterns     │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Information Detection    │
│ - Locate ID numbers      │
│ - Find names             │
│ - Detect DOB             │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Masking Application      │
│ - Cover original text    │
│ - Draw masked text       │
│ - Preserve document      │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Masked Preview Display   │
│ - Show to user           │
│ - Get confirmation       │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Secure Storage           │
│ - Store masked version   │
│ - Discard original       │
└──────────────────────────┘
```

### Key Components

#### 1. **`src/lib/idMasking.ts`**
Core masking library with rules for all ID types.

```typescript
// Key functions:
maskID(idType, idValue)           // Mask an ID number
validateIDFormat(idType, idValue) // Validate format
registerIDType(idType, rule)      // Add new ID type
```

#### 2. **`src/lib/idValidation.ts`**
OCR and validation logic.

```typescript
// Key functions:
ocrTextFromFile(file)                    // Extract text from image/PDF
validateIdContent(file, idType)          // Validate document matches ID type
```

#### 3. **`src/app/page.tsx`**
Main UI component with enhanced masking functions.

```typescript
// Key functions:
createMaskedPreview()          // Apply masking to document
maskPersonalInformation()      // Mask names and DOB
maskNumberRegions()            // Mask ID numbers
extractIdNumber()              // Extract and locate ID numbers
```

---

## 🌍 Supported Countries & ID Types

### Complete List

<details>
<summary><b>🇮🇳 India (4 ID types)</b></summary>

- **Aadhaar**: 12 digits → `XXXXXXXX9012`
- **PAN Card**: 10 alphanumeric → `XXXXXX234F`
- **Passport**: Standard format → `PXXXXXX78`
- **Driving Licence**: Alphanumeric → Last 4 visible

</details>

<details>
<summary><b>🇺🇸 United States (4 ID types)</b></summary>

- **Social Security Number**: 9 digits → `XXX-XX-6789`
- **Driver License**: State-specific → Last 4 visible
- **State ID**: Alphanumeric → Last 4 visible
- **Passport**: Standard format → First letter + last 2 visible

</details>

<details>
<summary><b>🇸🇬 Singapore (3 ID types)</b></summary>

- **NRIC**: `S1234567A` → `SXXXX567A`
- **Passport**: Standard format
- **Driving Licence**: Alphanumeric → Last 4 visible

</details>

<details>
<summary><b>🇦🇪 UAE (3 ID types)</b></summary>

- **Emirates ID**: 15 digits → `784-XXXX-XXXXXXX-2`
- **Passport**: Standard format
- **Driving Licence**: Alphanumeric → Last 4 visible

</details>

<details>
<summary><b>🇬🇧 United Kingdom (3 ID types)</b></summary>

- **Passport**: Standard format
- **Driving Licence**: Alphanumeric → Last 4 visible
- **BRP**: `AB1234567` → `ABXXXXXXX`

</details>

<details>
<summary><b>🇨🇳 China (2 ID types)</b></summary>

- **Passport**: Standard format
- **China ID**: 18 digits → Last 4 visible

</details>

<details>
<summary><b>🇰🇷 South Korea (3 ID types)</b></summary>

- **Passport**: Standard format
- **Korean ID**: 13 digits → `XXXXXX-XXX4567`
- **Driving Licence**: Alphanumeric → Last 4 visible

</details>

<details>
<summary><b>🇯🇵 Japan (3 ID types)</b></summary>

- **Passport**: Standard format
- **My Number**: 12 digits → `XXXXXXXX9012`
- **Driving Licence**: Alphanumeric → Last 4 visible

</details>

<details>
<summary><b>🇦🇺 Australia (3 ID types)</b></summary>

- **Passport**: Standard format
- **Medicare Card**: 10 digits → Last 4 visible
- **Driving Licence**: State-specific → Last 4 visible

</details>

<details>
<summary><b>🇨🇦 Canada (3 ID types)</b></summary>

- **Passport**: Standard format
- **Social Insurance Number**: 9 digits → `XXX-XXX-789`
- **Driving Licence**: Province-specific → Last 4 visible

</details>

<details>
<summary><b>🇧🇷 Brazil (3 ID types)</b></summary>

- **Passport**: Standard format
- **CPF**: 11 digits → `XXX.XXX.XXX-01`
- **Driving Licence**: Alphanumeric → Last 4 visible

</details>

<details>
<summary><b>🇪🇸 Spain (3 ID types)</b></summary>

- **Passport**: Standard format
- **DNI**: 8 digits + letter → Last 4 visible
- **Driving Licence**: Alphanumeric → Last 4 visible

</details>

<details>
<summary><b>🇲🇽 Mexico (3 ID types)</b></summary>

- **Passport**: Standard format
- **CURP**: 18 characters → Last 4 visible
- **Driving Licence**: Alphanumeric → Last 4 visible

</details>

<details>
<summary><b>🇦🇷 Argentina (3 ID types)</b></summary>

- **Passport**: Standard format
- **DNI**: 7-8 digits → Last 4 visible
- **Driving Licence**: Alphanumeric → Last 4 visible

</details>

<details>
<summary><b>🇪🇺 EU Countries (France, Germany, Italy, Netherlands, etc.)</b></summary>

- **Passport**: Standard format
- **EU National ID**: Generic support
- **Driving Licence**: Alphanumeric → Last 4 visible

</details>

---

## 📚 Usage Examples

### Example 1: Aadhaar Card (India)

**Input Document:**
```
┌─────────────────────────────┐
│  GOVERNMENT OF INDIA         │
│  📷                          │
│  Name: Jane Marie Doe        │
│  DOB: 15/06/1990            │
│  Female                      │
│  1234 5678 9012             │
│  [QR Code]                   │
└─────────────────────────────┘
```

**Masked Output:**
```
┌─────────────────────────────┐
│  GOVERNMENT OF INDIA         │
│  📷                          │
│  Name: XXXX XXXX XXXX        │
│  DOB: XX/XX/XXXX            │
│  Female                      │
│  XXXX XXXX 9012             │
│  [QR Code]                   │
└─────────────────────────────┘
```

### Example 2: US Passport

**Input Document:**
```
┌─────────────────────────────┐
│  United States of America    │
│  PASSPORT                    │
│  📷                          │
│  Surname: SMITH              │
│  Given Names: JOHN ROBERT    │
│  Date of Birth: 15 JUN 1985  │
│  Passport No: P12345678      │
│  ══════════════════════      │
│  P<USASMITH<<JOHN<ROBERT<<<  │
│  P123456780USA8506159M3012..│
└─────────────────────────────┘
```

**Masked Output:**
```
┌─────────────────────────────┐
│  United States of America    │
│  PASSPORT                    │
│  📷                          │
│  Surname: XXXX               │
│  Given Names: XXXX XXXX      │
│  Date of Birth: XX XXX XXXX  │
│  Passport No: PXXXXXX78      │
│  ══════════════════════      │
│  [MRZ remains for scanning]  │
│  [But OCR masked]            │
└─────────────────────────────┘
```

### Example 3: Singapore NRIC

**Code Example:**

```typescript
import { maskID } from "@/lib/idMasking";

// Singapore NRIC
const nric = "S9012345A";
const masked = maskID("NRIC", nric);
console.log(masked); // Output: "SXXXX345A"

// Verification at check-in
function verifyNRIC(physicalID: string, maskedID: string): boolean {
  const firstLetter = physicalID[0];
  const lastFour = physicalID.slice(-4);
  const expectedMasked = `${firstLetter}XXXX${lastFour}`;
  return maskedID === expectedMasked;
}
```

---

## 🧪 Testing

### Running the Examples

```typescript
import { displayMaskingExamples, testAllMasking } from "@/lib/__tests__/idMasking.examples";

// Display all masking examples
displayMaskingExamples();

// Run all tests
const results = testAllMasking();
console.log(`Passed: ${results.passed}/${results.total}`);
console.log(`Failed: ${results.failed}/${results.total}`);
```

### Manual Testing

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Navigate to the pre-check-in page:**
   ```
   http://localhost:3000
   ```

3. **Test with sample IDs:**
   - Use real ID samples (with permission)
   - Or use mock IDs with test images

4. **Verify masking:**
   - ✓ ID numbers show last 4 digits
   - ✓ Names are fully masked
   - ✓ DOB years are masked
   - ✓ Document layout preserved

### Test Cases

| Test Case | Country | ID Type | Expected Result |
|-----------|---------|---------|-----------------|
| Valid Aadhaar | India | Aadhaar | `XXXXXXXX9012` |
| Valid NRIC | Singapore | NRIC | `SXXXX567A` |
| Valid SSN | USA | Social Security Number | `XXX-XX-6789` |
| Valid Emirates ID | UAE | Emirates ID | `784-XXXX-XXXXXXX-2` |
| Invalid format | Any | Any | Validation error |
| Wrong ID type | India | NRIC | Validation error |

---

## 🔒 Security & Compliance

### Privacy Protection

✅ **Original IDs never leave the browser**
- All processing happens client-side using JavaScript
- No raw ID data sent to server
- Original file discarded after masking

✅ **Only masked versions stored**
- Database only contains masked IDs
- Logs only show masked values
- No raw ID in error messages

✅ **Secure verification process**
- Hotel verifies last 4 digits at check-in
- Photo comparison for visual verification
- No need to see full ID number

### Compliance

The system helps meet requirements for:

- **GDPR (Europe)**: Data minimization, privacy by design
- **CCPA (California)**: Consumer privacy rights
- **PIPEDA (Canada)**: Reasonable safeguards
- **PDPA (Singapore)**: Protection of personal data
- **IT Act (India)**: Reasonable security practices

### Audit Logging

All masking operations are logged securely:

```typescript
import { safeLogID } from "@/lib/idMasking";

// Safe logging (never shows raw ID)
safeLogID("Aadhaar", "XXXXXXXX9012", "Pre-check-in upload");

// Output: [Pre-check-in upload] ID Type: Aadhaar, Masked: XXXXXXXX9012
```

---

## 📖 Documentation

### For End Users
- **[ID_PRIVACY_NOTICE.md](./ID_PRIVACY_NOTICE.md)**: User-friendly privacy notice explaining how IDs are protected
- Includes visual examples and FAQs
- Available in multiple languages (coming soon)

### For Developers
- **[ID_MASKING_GUIDE.md](./ID_MASKING_GUIDE.md)**: Comprehensive technical guide
- Architecture details
- API documentation
- Extension guide

### For System Administrators
- **[ID_MASKING_GUIDE.md#compliance](./ID_MASKING_GUIDE.md#compliance)**: Compliance section
- Security best practices
- Audit logging setup
- Monitoring recommendations

---

## 🚀 Future Enhancements

### Planned Features

1. **Face Blurring** (v1.1)
   - AI-powered face detection
   - Automatic blurring of ID photos
   - Preserve verification capability

2. **Document Orientation** (v1.2)
   - Auto-rotate skewed IDs
   - Perspective correction
   - Better OCR accuracy

3. **More Countries** (v1.3)
   - African countries support
   - More Middle Eastern countries
   - More Asian countries

4. **Real-time Preview** (v1.4)
   - Show masking while uploading
   - Instant feedback
   - Adjust before finalizing

5. **Mobile App** (v1.5)
   - Native iOS/Android apps
   - Better camera integration
   - Offline processing

6. **Batch Processing** (v1.6)
   - Upload multiple IDs at once
   - Family check-in optimization
   - Bulk verification

### Contributing

To add support for a new country/ID type:

1. **Add masking rule** in `src/lib/idMasking.ts`:
   ```typescript
   registerIDType("New ID Type", {
     pattern: /^YOUR_PATTERN$/,
     mask: (value) => {
       // Your masking logic
       return maskedValue;
     },
     visibleChars: 4,
   });
   ```

2. **Add validation** in `src/lib/idValidation.ts`:
   ```typescript
   const hasNewID = /YOUR_PATTERN/.test(text);
   // Add to switch case
   ```

3. **Update country mapping** in `src/app/page.tsx`:
   ```typescript
   countryToIdTypes: {
     "New Country": ["New ID Type", "Passport"],
   }
   ```

4. **Add tests** in `src/lib/__tests__/idMasking.examples.ts`

5. **Update documentation** in this README

---

## 📞 Support

For questions or issues:

- 📧 Email: support@swiftcheckin.com
- 💬 Chat: In-app support
- 📚 Docs: [Full documentation](./ID_MASKING_GUIDE.md)
- 🐛 Issues: GitHub issue tracker

---

## 📝 License

This ID masking implementation is part of the SwiftCheckin hotel pre-check-in system.

Copyright © 2025 SwiftCheckin. All rights reserved.

---

## ✨ Summary

This implementation provides:

✅ **20+ countries** with specific ID type support  
✅ **Intelligent masking** of ID numbers, names, and dates  
✅ **Client-side processing** for maximum privacy  
✅ **Visual masking** directly on document images  
✅ **Validation system** to verify document authenticity  
✅ **Comprehensive documentation** for all stakeholders  
✅ **Extensible architecture** for future enhancements  
✅ **Compliance-ready** for international privacy laws  

**The system ensures guest privacy is protected while maintaining necessary verification capabilities for hotels.**

---

*Last updated: December 12, 2025*  
*Version: 1.0*

