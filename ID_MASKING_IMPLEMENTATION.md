# Generic ID Masking Implementation

## Overview

This implementation provides a secure, generic masking facility for government-approved digital IDs from any country. The system ensures that raw IDs are never exposed in UI, API responses, database storage, or logs.

## Key Features

1. **Generic Masking Function**: `maskID(idType, idValue)` handles all ID types
2. **Consistent Application**: Masking applied uniformly across all layers
3. **Security First**: Raw IDs never stored or logged
4. **Extensible**: Easy to add new ID types and masking rules
5. **Comprehensive Testing**: Unit tests for multiple ID types

## Files Created/Modified

### New Files

1. **`src/lib/idMasking.ts`** - Core masking utility with configuration
2. **`src/lib/__tests__/idMasking.test.ts`** - Comprehensive unit tests
3. **`src/lib/__examples__/uploadHandlerExample.ts`** - Integration examples
4. **`vitest.config.ts`** - Test configuration

### Modified Files

1. **`src/lib/idValidation.ts`** - Updated to use generic masking (backward compatible)
2. **`src/app/page.tsx`** - Integrated masking at upload handler level
3. **`src/app/validate/page.tsx`** - Updated to use generic masking
4. **`src/app/hotel/dashboard/page.tsx`** - Updated to use generic masking
5. **`package.json`** - Added testing dependencies and scripts

## Usage

### Basic Usage

```typescript
import { maskID } from "@/lib/idMasking";

// Mask different ID types
const maskedAadhaar = maskID("Aadhaar", "123456789012");
// Returns: "XXXX XXXX 9012"

const maskedPassport = maskID("Passport", "P12345678");
// Returns: "PXXXXXX78"

const maskedSSN = maskID("Social Security Number", "123-45-6789");
// Returns: "XXX-XX-6789"

const maskedDriverLicense = maskID("Driver License", "DL12345678");
// Returns: "XXXX5678"
```

### At Upload Handler Level

```typescript
async function processSelectedFile(file: File, idType: string) {
  // Extract ID from document
  const extractedId = await extractIdFromDocument(file);
  
  // SECURITY: Mask immediately - raw IDs never stored
  const maskedId = maskID(idType, extractedId);
  
  // Store only masked ID
  await saveToDatabase({
    idType,
    maskedId, // Only masked value
    // extractedId is NOT stored
  });
  
  return maskedId;
}
```

### Safe Logging

```typescript
import { safeLogID } from "@/lib/idMasking";

// Safe logging (never exposes raw ID)
safeLogID("Aadhaar", maskedId, "upload-handler");
// Logs: [upload-handler] ID Type: Aadhaar, Masked: XXXX XXXX 9012
```

## Supported ID Types

- **Aadhaar** (India): `XXXX XXXX 9012`
- **Passport**: `PXXXXXX78`
- **Social Security Number** (USA): `XXX-XX-6789`
- **Driver License** / **Driving Licence**: `XXXX5678`
- **State ID** (USA): `XXXX5678`
- **Emirates ID** (UAE): `784-XXXX-XXXXXXX-2`
- **BRP** (UK): `ABXXXXXXX`
- **National ID**: `XXXXX4321` (default: last 4)
- **Tax ID**: `XXXX5678` (default: last 4)
- **Unknown types**: Default to last 4 characters

## Adding New ID Types

```typescript
import { registerIDType } from "@/lib/idMasking";

registerIDType("Custom ID", {
  pattern: /^CUST-\d{6}$/,
  mask: (value) => `CUST-XX${value.slice(-2)}`,
  visibleChars: 2,
});

// Now you can use it
const masked = maskID("Custom ID", "CUST-123456");
// Returns: "CUST-XX56"
```

## Security Requirements

### ✅ Implemented

1. **Masking at Upload Handler**: Raw IDs are masked immediately upon extraction
2. **Database Storage**: Only masked IDs are stored
3. **UI Display**: All ID displays use masked values
4. **API Responses**: Responses never contain raw IDs
5. **Logging**: Safe logging utility prevents raw ID exposure
6. **Consistency**: Same masking applied across all layers

### Security Best Practices

- ❌ **NEVER** log raw IDs: `console.log(rawId)`
- ✅ **ALWAYS** log masked IDs: `safeLogID(type, maskedId)`

- ❌ **NEVER** store raw IDs: `db.save({ id: rawId })`
- ✅ **ALWAYS** store masked IDs: `db.save({ id: maskID(type, rawId) })`

- ❌ **NEVER** send raw IDs in API responses
- ✅ **ALWAYS** mask before sending: `response.id = maskID(type, rawId)`

## Testing

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Coverage

The test suite covers:
- All supported ID types
- Edge cases (empty strings, short IDs, special characters)
- Security requirements (never returns raw IDs)
- Format validation
- Custom ID type registration
- Integration examples from requirements

### Example Test

```typescript
it("should mask Aadhaar number showing last 4 digits", () => {
  expect(maskID("Aadhaar", "123456789012")).toBe("XXXX XXXX 9012");
});

it("should handle example: National ID 987654321 → XXXXX4321", () => {
  expect(maskID("National ID", "987654321")).toBe("XXXXX4321");
});
```

## Integration Points

### 1. Upload Handler (`src/app/page.tsx`)

```typescript
// Line 194: Masking applied at upload handler level
const safeSummary = rawSummary ? maskID(idType, rawSummary) : rawSummary;
setMaskedSummary(safeSummary);
```

### 2. Database Storage (`src/app/page.tsx`)

```typescript
// Line 252: Masking before persistence
const persistedMaskedSummary = maskedSummary ? maskID(idType, maskedSummary) : maskedSummary;
```

### 3. UI Display (`src/app/page.tsx`)

```typescript
// Line 48: Masking for display
const displayMaskedSummary = maskedSummary ? maskID(idType, maskedSummary) : maskedSummary;
```

### 4. Validation Page (`src/app/validate/page.tsx`)

```typescript
// Line 26: Masking in validation display
const masked = maskID(entry.idType, entry.maskedSummary);
```

### 5. Dashboard (`src/app/hotel/dashboard/page.tsx`)

```typescript
// Line 25: Masking in dashboard
const masked = maskID(entry.idType, entry.maskedSummary);
```

## Configuration

ID masking rules are configured in `src/lib/idMasking.ts` in the `ID_MASKING_RULES` object. Each rule includes:

- `pattern`: Optional regex for format validation
- `mask`: Function to mask the ID value
- `visibleChars`: Number of characters to show (default: 4)
- `maskChar`: Character to use for masking (default: 'X')
- `preserveFormat`: Whether to preserve formatting (dashes, spaces)

## Backward Compatibility

The original `maskAadhaar()` function is maintained for backward compatibility but now uses the generic `maskID()` function internally:

```typescript
export function maskAadhaar(aadhaar = ""): string {
  return maskID("Aadhaar", aadhaar);
}
```

## Requirements Compliance

✅ **Masking Rules**: Always hides majority, shows small non-sensitive portion  
✅ **Consistency**: Applied uniformly across UI, API, database, logs  
✅ **Implementation**: Generic `maskID()` function with extensible configuration  
✅ **Security**: Raw IDs never exposed, only masked values stored  
✅ **Extensibility**: Easy to add new ID types via `registerIDType()`  
✅ **Testing**: Comprehensive unit tests for multiple ID types  

## Next Steps

1. Install dependencies: `npm install`
2. Run tests: `npm test`
3. Review integration examples in `src/lib/__examples__/uploadHandlerExample.ts`
4. Extend with additional ID types as needed




