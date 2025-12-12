# ID Document Masking Guide

## Overview

The SwiftCheckin system implements comprehensive ID document masking to protect sensitive personal information when guests upload their identification documents. This feature ensures that **raw ID numbers, names, and dates of birth are never displayed or stored** in their original form.

## What Gets Masked?

Following the privacy standards demonstrated in government-issued documents (like the Aadhaar card sample), the system masks three critical types of information:

### 1. **ID Numbers**
- **First 8 characters masked**, last 4 visible
- Example: `123456789012` → `XXXX XXXX 9012`
- Applies to all ID types: Aadhaar, Passport, Driver License, etc.

### 2. **Personal Names**
- Full name masked
- Example: `Jane Smith` → `XXXX XXXX`
- Detects names in multiple languages and formats

### 3. **Dates of Birth**
- Year masked in date of birth
- Example: `15/06/1990` → `XX/XX/XXXX` or `1990` → `XXXX`
- Prevents age discrimination and identity theft

## Supported ID Types

The system supports ID documents from countries worldwide, each with appropriate masking rules:

### 🇮🇳 India
- **Aadhaar**: 12 digits → `XXXXXXXX6666` (last 4 visible)
- **PAN Card**: 10 alphanumeric → `XXXXXX7890`
- **Passport**: Format varies → First letter + last 2 visible
- **Driving Licence**: Alphanumeric → Last 4 visible

### 🇺🇸 USA
- **Social Security Number**: `XXX-XX-6789` (last 4 visible)
- **Driver License**: State-specific → Last 4 visible
- **State ID**: Alphanumeric → Last 4 visible
- **Passport**: Standard format → First letter + last 2 visible

### 🇸🇬 Singapore
- **NRIC**: `S1234567A` → `S XXXX567A` (first letter + last 4 visible)
- **Passport**: Standard format
- **Driving Licence**: Alphanumeric → Last 4 visible

### 🇦🇪 UAE
- **Emirates ID**: `784-1234-5678901-2` → `784-XXXX-XXXXXXX-2` (last digit visible)
- **Passport**: Standard format
- **Driving Licence**: Alphanumeric → Last 4 visible

### 🇬🇧 UK
- **Passport**: Standard format
- **Driving Licence**: Alphanumeric → Last 4 visible
- **BRP (Biometric Residence Permit)**: `XX XXXXXXX` (first 2 letters visible)

### 🇨🇳 China
- **China ID**: 18 digits → Last 4 visible

### 🇰🇷 South Korea
- **Korean ID (Resident Registration)**: 13 digits → `XXXXXX-XXX1234` (last 4 visible)

### 🇯🇵 Japan
- **My Number**: 12 digits → `XXXXXXXX5678` (last 4 visible)

### 🇦🇺 Australia
- **Medicare Card**: 10 digits → Last 4 visible
- **Passport**: Standard format
- **Driving Licence**: State-specific → Last 4 visible

### 🇨🇦 Canada
- **Social Insurance Number**: 9 digits → `XXX-XXX-789` (last 3 visible)
- **Passport**: Standard format
- **Driving Licence**: Province-specific → Last 4 visible

### 🇧🇷 Brazil
- **CPF**: 11 digits → `XXX.XXX.XXX-89` (last 2 visible)

### 🇪🇸 Spain / 🇦🇷 Argentina
- **DNI**: 7-8 digits + letter → Last 4 visible

### 🇲🇽 Mexico
- **CURP**: 18 characters → Last 4 visible

### 🇪🇺 European Union
- **EU National ID**: Generic support for all EU member states
- **Passport**: Standard format

## How It Works

### Step 1: Document Upload
When a guest uploads their ID document (image or PDF), the system:
1. Validates the document type matches the selected ID type
2. Extracts text using OCR (Optical Character Recognition)
3. Identifies sensitive information locations

### Step 2: Smart Detection
The system uses advanced pattern recognition to detect:
- **ID numbers**: Using country-specific formats and patterns
- **Names**: Following indicators like "NAME", "GIVEN", "SURNAME", etc. in multiple languages
- **Dates**: Finding year patterns near "DOB", "BIRTH", "DATE OF BIRTH" indicators

### Step 3: Masking Application
The system applies masking by:
1. **Covering original text** with a white overlay
2. **Drawing masked text** in the same position (e.g., "XXXX XXXX 9620")
3. **Preserving document layout** so it remains readable
4. **Storing only the masked version** - original never leaves the browser

### Step 4: Secure Storage
- **Original document**: Never uploaded or stored
- **Masked preview**: Stored securely with hotel records
- **Verification**: Hotel staff can verify last 4 digits match physical ID at check-in

## Technical Implementation

### Adding New ID Types

To support a new ID type, add it to `src/lib/idMasking.ts`:

```typescript
registerIDType("New ID Type", {
  pattern: /^PATTERN$/,  // Validation regex
  mask: (value: string) => {
    // Custom masking logic
    const cleaned = value.replace(/\s+/g, "");
    const visible = cleaned.slice(-4);
    const masked = "X".repeat(cleaned.length - 4);
    return `${masked}${visible}`;
  },
  visibleChars: 4,
  preserveFormat: false,
});
```

### Multilingual Support

The name detection supports indicators in multiple languages:
- **English**: NAME, GIVEN, SURNAME, FAMILY, FIRST, LAST
- **Spanish**: NOMBRE
- **French**: NOM
- **Portuguese**: NOME
- **Indonesian/Malay**: NAMA
- **Hindi**: नाम (in Devanagari script on Aadhaar cards)

### Date of Birth Detection

The system recognizes DOB indicators in multiple languages:
- **English**: BIRTH, BORN, DOB, D.O.B, DATE OF BIRTH, YEAR
- **Spanish**: NACIMIENTO
- **French**: NAISSANCE
- **Portuguese**: NASCIMENTO
- **Indonesian/Malay**: LAHIR
- **Hindi**: जन्म, वर्ष

## Security & Privacy

### Data Protection
- ✅ **Original IDs never leave the browser** - processing happens client-side
- ✅ **Only masked versions stored** - maximum privacy protection
- ✅ **No raw ID data in logs** - secure logging functions prevent leaks
- ✅ **GDPR/CCPA compliant** - minimal data collection

### Verification Process
Hotels can verify guest identity at check-in by:
1. Checking last 4 digits of ID match the masked preview
2. Comparing photo on physical ID with masked preview photo
3. Verifying name format matches (length, structure)

### Audit Trail
The system logs all masking operations with:
- Timestamp
- ID type
- Masked value (never raw value)
- Processing status

## User Experience

### For Guests
1. Select destination country
2. Choose ID type from available options
3. Upload photo or PDF of ID
4. System automatically masks sensitive data
5. See masked preview before submission
6. Submit with confidence - privacy protected

### For Hotel Staff
1. View masked ID previews in dashboard
2. Verify last 4 digits at check-in
3. Confirm photo matches physical ID
4. Complete check-in process

## Example Masking Outputs

### Aadhaar Card (India)
```
Original:  Jane Doe
Masked:    XXXX XXXX

Original:  Date of Birth: 15/06/1990
Masked:    Date of Birth: XXXX

Original:  1234 5678 9012
Masked:    XXXX XXXX 9012
```

### US Passport
```
Original:  JANE MARIE DOE
Masked:    XXXX XXXX XXXX

Original:  Date of Birth: 15 JUN 1990
Masked:    Date of Birth: XX XXX XXXX

Original:  P12345678
Masked:    PXXXXXX78
```

### Singapore NRIC
```
Original:  TAN WEI MING
Masked:    XXXX XXXX XXXX

Original:  Date of Birth: 1990
Masked:    Date of Birth: XXXX

Original:  S1234567A
Masked:    SXXXX567A
```

### Emirates ID (UAE)
```
Original:  AHMED HASSAN ALI
Masked:    XXXX XXXX XXXX

Original:  Date of Birth: 1990
Masked:    Date of Birth: XXXX

Original:  784-1234-5678901-2
Masked:    784-XXXX-XXXXXXX-2
```

## Troubleshooting

### Document Not Recognized
- Ensure good lighting when photographing ID
- Make sure entire ID is visible in frame
- Use high-resolution image (minimum 600x400 pixels)
- Try PDF scan if photo quality is poor

### Masking Not Applied
- Check ID type selection matches uploaded document
- Verify document text is readable (not blurry)
- Ensure ID is from supported country
- Contact support if issue persists

### Incorrect Masking
The system uses OCR which may occasionally misidentify text. If masking appears incorrect:
- Re-upload with better image quality
- Use PDF scan instead of photo
- Manual review flags will alert hotel staff

## Best Practices

### For Implementation
1. **Always mask before display** - Never show raw IDs in UI
2. **Use secure logging** - Call `safeLogID()` instead of `console.log()`
3. **Validate on client side** - Reduce server processing and enhance privacy
4. **Test with real samples** - Use actual ID scans for testing (with permission)

### For Users
1. **Use good lighting** when photographing IDs
2. **Avoid glare** on laminated IDs
3. **Keep ID flat** for clear scanning
4. **Check preview** before submitting

## Extending the System

### Adding New Countries
1. Research ID format for the country
2. Add masking rule in `idMasking.ts`
3. Add validation pattern in `idValidation.ts`
4. Add name/DOB indicators in local language
5. Test with sample documents
6. Update this documentation

### Custom Masking Rules
Create custom rules for specific use cases:

```typescript
// Show only first letter and last digit
const customRule: MaskingRule = {
  pattern: /^[A-Z]\d{7}$/,
  mask: (value: string) => {
    return `${value[0]}XXXXXX${value.slice(-1)}`;
  },
  visibleChars: 1,
};
```

## Compliance

This masking system helps meet requirements for:
- **GDPR** (Europe): Data minimization principle
- **CCPA** (California): Privacy by design
- **PIPEDA** (Canada): Reasonable safeguards
- **PDPA** (Singapore): Protection of personal data
- **IT Act** (India): Reasonable security practices

## Support

For questions or issues:
- Check this documentation first
- Review code comments in `src/lib/idMasking.ts`
- Contact development team for custom requirements
- Report bugs through issue tracker

## Version History

- **v1.0** (Current): Initial release with 20+ country support
  - Aadhaar, Passport, Driver License across multiple countries
  - Name and DOB masking
  - Multi-language support
  - Client-side processing for maximum privacy

## Future Enhancements

Planned features:
- [ ] AI-powered face blurring
- [ ] Automatic document orientation correction
- [ ] Support for more African countries
- [ ] Support for more Middle Eastern countries
- [ ] Real-time masking preview during upload
- [ ] Batch processing for multiple IDs
- [ ] Mobile app integration

---

**Remember**: The goal is to protect guest privacy while allowing necessary verification. When in doubt, mask more rather than less.

