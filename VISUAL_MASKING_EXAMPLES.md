# 📸 Visual ID Masking Examples

## Before & After: ID Document Masking

This document shows exactly what happens when guests upload their ID documents.

---

## 🇮🇳 Example 1: Aadhaar Card (India)

### BEFORE (Original Upload)
```
╔════════════════════════════════════════════════╗
║  🇮🇳  GOVERNMENT OF INDIA                      ║
║      UNIQUE IDENTIFICATION AUTHORITY           ║
║                                                ║
║  ┌─────────┐                                  ║
║  │         │  Name: Jane Marie Doe             ║
║  │  PHOTO  │  जन्म वर्ष / Year of Birth: 1990 ║
║  │         │  महिला / Female                  ║
║  └─────────┘                                  ║
║                                                ║
║         1234 5678 9012                        ║
║                                                ║
║         [QR CODE]                              ║
╚════════════════════════════════════════════════╝
```

### AFTER (Masked & Stored)
```
╔════════════════════════════════════════════════╗
║  🇮🇳  GOVERNMENT OF INDIA                      ║
║      UNIQUE IDENTIFICATION AUTHORITY           ║
║                                                ║
║  ┌─────────┐                                  ║
║  │         │  Name: XXXX XXXX XXXX             ║
║  │  PHOTO  │  जन्म वर्ष / Year of Birth: XXXX ║
║  │         │  महिला / Female                  ║
║  └─────────┘                                  ║
║                                                ║
║         XXXX XXXX 9012   ← Last 4 visible     ║
║                                                ║
║         [QR CODE]                              ║
╚════════════════════════════════════════════════╝
```

**What Changed:**
- ✅ Name: `Jane Marie Doe` → `XXXX XXXX XXXX`
- ✅ Birth Year: `1990` → `XXXX`
- ✅ ID Number: `1234 5678 9012` → `XXXX XXXX 9012`
- ✅ Photo: Preserved for verification
- ✅ QR Code: Preserved for scanning

---

## 🇺🇸 Example 2: US Passport

### BEFORE (Original Upload)
```
╔════════════════════════════════════════════════╗
║  UNITED STATES OF AMERICA                      ║
║  PASSPORT                                      ║
║                                                ║
║  ┌─────────┐                                  ║
║  │         │  Type: P                          ║
║  │  PHOTO  │  Code: USA                        ║
║  │         │  Passport No: P12345678           ║
║  └─────────┘  Surname: SMITH                  ║
║               Given Names: JOHN ROBERT         ║
║               Nationality: UNITED STATES       ║
║               Date of Birth: 15 JUN 1985       ║
║               Place of Birth: NEW YORK, USA    ║
║               Date of Issue: 01 JAN 2020       ║
║               Date of Expiry: 01 JAN 2030      ║
║                                                ║
║  ══════════════════════════════════════════    ║
║  P<USASMITH<<JOHN<ROBERT<<<<<<<<<<<<<<<<<<<<  ║
║  P123456780USA8506159M3001010<<<<<<<<<<<<08   ║
╚════════════════════════════════════════════════╝
```

### AFTER (Masked & Stored)
```
╔════════════════════════════════════════════════╗
║  UNITED STATES OF AMERICA                      ║
║  PASSPORT                                      ║
║                                                ║
║  ┌─────────┐                                  ║
║  │         │  Type: P                          ║
║  │  PHOTO  │  Code: USA                        ║
║  │         │  Passport No: PXXXXXX78  ← Masked║
║  └─────────┘  Surname: XXXX          ← Masked ║
║               Given Names: XXXX XXXX  ← Masked ║
║               Nationality: UNITED STATES       ║
║               Date of Birth: XX XXX XXXX       ║
║               Place of Birth: NEW YORK, USA    ║
║               Date of Issue: 01 JAN 2020       ║
║               Date of Expiry: 01 JAN 2030      ║
║                                                ║
║  ══════════════════════════════════════════    ║
║  [MRZ preserved for scanning capability]      ║
║  [But OCR text masked in stored version]      ║
╚════════════════════════════════════════════════╝
```

**What Changed:**
- ✅ Name: `SMITH, JOHN ROBERT` → `XXXX, XXXX XXXX`
- ✅ Birth Date: `15 JUN 1985` → `XX XXX XXXX`
- ✅ Passport No: `P12345678` → `PXXXXXX78` (first + last 2)
- ✅ Photo: Preserved for verification
- ✅ MRZ: Preserved for airport scanning

---

## 🇸🇬 Example 3: Singapore NRIC

### BEFORE (Original Upload)
```
╔════════════════════════════════════════════════╗
║  REPUBLIC OF SINGAPORE                         ║
║  NATIONAL REGISTRATION IDENTITY CARD           ║
║                                                ║
║  ┌─────────┐  NAME                            ║
║  │         │  TAN WEI MING                     ║
║  │  PHOTO  │                                   ║
║  │         │  NRIC NO.                         ║
║  └─────────┘  S9012345A                        ║
║                                                ║
║               DATE OF BIRTH                    ║
║               15 JUN 1992                      ║
║                                                ║
║               RACE                 SEX         ║
║               CHINESE              MALE        ║
║                                                ║
║               DATE OF ISSUE                    ║
║               01 JAN 2020                      ║
╚════════════════════════════════════════════════╝
```

### AFTER (Masked & Stored)
```
╔════════════════════════════════════════════════╗
║  REPUBLIC OF SINGAPORE                         ║
║  NATIONAL REGISTRATION IDENTITY CARD           ║
║                                                ║
║  ┌─────────┐  NAME                            ║
║  │         │  XXXX XXXX XXXX      ← Masked    ║
║  │  PHOTO  │                                   ║
║  │         │  NRIC NO.                         ║
║  └─────────┘  SXXXX345A           ← Masked    ║
║                                                ║
║               DATE OF BIRTH                    ║
║               XX XXX XXXX         ← Masked    ║
║                                                ║
║               RACE                 SEX         ║
║               CHINESE              MALE        ║
║                                                ║
║               DATE OF ISSUE                    ║
║               01 JAN 2020                      ║
╚════════════════════════════════════════════════╝
```

**What Changed:**
- ✅ Name: `TAN WEI MING` → `XXXX XXXX XXXX`
- ✅ Birth Date: `15 JUN 1992` → `XX XXX XXXX`
- ✅ NRIC: `S9012345A` → `SXXXX345A` (first + last 4)
- ✅ Photo: Preserved for verification

---

## 🇦🇪 Example 4: Emirates ID (UAE)

### BEFORE (Original Upload)
```
╔════════════════════════════════════════════════╗
║  🇦🇪  UNITED ARAB EMIRATES                     ║
║      IDENTITY CARD                             ║
║                                                ║
║  ┌─────────┐                                  ║
║  │         │  Name: Ahmed Hassan Ali           ║
║  │  PHOTO  │  الاسم: أحمد حسن علي             ║
║  │         │                                   ║
║  └─────────┘  ID Number: 784-1234-5678901-2   ║
║                                                ║
║               Date of Birth: 15/06/1988        ║
║               تاريخ الميلاد: 1988/06/15        ║
║                                                ║
║               Nationality: UAE                 ║
║               الجنسية: الإمارات               ║
║                                                ║
║               [Card Chip]  [Barcode]           ║
╚════════════════════════════════════════════════╝
```

### AFTER (Masked & Stored)
```
╔════════════════════════════════════════════════╗
║  🇦🇪  UNITED ARAB EMIRATES                     ║
║      IDENTITY CARD                             ║
║                                                ║
║  ┌─────────┐                                  ║
║  │         │  Name: XXXX XXXX XXXX   ← Masked ║
║  │  PHOTO  │  الاسم: XXXX XXXX XXXX  ← Masked ║
║  │         │                                   ║
║  └─────────┘  ID Number: 784-XXXX-XXXXXXX-2   ║
║                                    ↑ Only last ║
║               Date of Birth: XX/XX/XXXX        ║
║               تاريخ الميلاد: XXXX/XX/XX        ║
║                                                ║
║               Nationality: UAE                 ║
║               الجنسية: الإمارات               ║
║                                                ║
║               [Card Chip]  [Barcode]           ║
╚════════════════════════════════════════════════╝
```

**What Changed:**
- ✅ Name (English): `Ahmed Hassan Ali` → `XXXX XXXX XXXX`
- ✅ Name (Arabic): `أحمد حسن علي` → `XXXX XXXX XXXX`
- ✅ Birth Date: `15/06/1988` → `XX/XX/XXXX`
- ✅ ID Number: `784-1234-5678901-2` → `784-XXXX-XXXXXXX-2`
- ✅ Photo: Preserved for verification

---

## 🇧🇷 Example 5: Brazilian CPF

### BEFORE (Original Upload)
```
╔════════════════════════════════════════════════╗
║  REPÚBLICA FEDERATIVA DO BRASIL                ║
║  CADASTRO DE PESSOAS FÍSICAS                  ║
║                                                ║
║  Nome: Maria Silva Santos                      ║
║                                                ║
║  CPF: 123.456.789-01                          ║
║                                                ║
║  Data de Nascimento: 20/03/1995               ║
║                                                ║
║  [Barcode: 12345678901]                       ║
╚════════════════════════════════════════════════╝
```

### AFTER (Masked & Stored)
```
╔════════════════════════════════════════════════╗
║  REPÚBLICA FEDERATIVA DO BRASIL                ║
║  CADASTRO DE PESSOAS FÍSICAS                  ║
║                                                ║
║  Nome: XXXX XXXX XXXX            ← Masked     ║
║                                                ║
║  CPF: XXX.XXX.XXX-01             ← Last 2     ║
║                                                ║
║  Data de Nascimento: XX/XX/XXXX  ← Masked     ║
║                                                ║
║  [Barcode: preserved]                          ║
╚════════════════════════════════════════════════╝
```

**What Changed:**
- ✅ Name: `Maria Silva Santos` → `XXXX XXXX XXXX`
- ✅ Birth Date: `20/03/1995` → `XX/XX/XXXX`
- ✅ CPF: `123.456.789-01` → `XXX.XXX.XXX-01` (last 2)
- ✅ Barcode: Preserved for scanning

---

## 🇰🇷 Example 6: Korean Resident Registration

### BEFORE (Original Upload)
```
╔════════════════════════════════════════════════╗
║  대한민국 (REPUBLIC OF KOREA)                   ║
║  주민등록증 (RESIDENT REGISTRATION CARD)         ║
║                                                ║
║  ┌─────────┐                                  ║
║  │         │  이름 (Name): 김민수               ║
║  │  사진   │  KIM MIN SOO                      ║
║  │  PHOTO  │                                   ║
║  └─────────┘  주민등록번호:                     ║
║               900615-1234567                   ║
║                                                ║
║               주소 (Address):                   ║
║               서울시 강남구 테헤란로 123          ║
║                                                ║
║               발급일: 2020.01.01               ║
╚════════════════════════════════════════════════╝
```

### AFTER (Masked & Stored)
```
╔════════════════════════════════════════════════╗
║  대한민국 (REPUBLIC OF KOREA)                   ║
║  주민등록증 (RESIDENT REGISTRATION CARD)         ║
║                                                ║
║  ┌─────────┐                                  ║
║  │         │  이름 (Name): XXXX    ← Masked   ║
║  │  사진   │  XXXX XXXX XXXX       ← Masked   ║
║  │  PHOTO  │                                   ║
║  └─────────┘  주민등록번호:                     ║
║               XXXXXX-XXX4567      ← Last 4     ║
║                                                ║
║               주소 (Address):                   ║
║               서울시 강남구 테헤란로 123          ║
║                                                ║
║               발급일: 2020.01.01               ║
╚════════════════════════════════════════════════╝
```

**What Changed:**
- ✅ Name (Korean): `김민수` → `XXXX`
- ✅ Name (English): `KIM MIN SOO` → `XXXX XXXX XXXX`
- ✅ ID Number: `900615-1234567` → `XXXXXX-XXX4567`
- ✅ Birth year embedded in ID: Masked
- ✅ Photo: Preserved for verification

---

## 🎯 Key Masking Rules

### ID Numbers
| ID Type | Format | Masked Format | Last Visible |
|---------|--------|---------------|--------------|
| Aadhaar | 12 digits | XXXXXXXX9012 | 4 digits |
| NRIC | S1234567A | SXXXX567A | First + 4 |
| SSN | 123-45-6789 | XXX-XX-6789 | 4 digits |
| Emirates ID | 784-1234-5678901-2 | 784-XXXX-XXXXXXX-2 | 1 digit |
| CPF | 123.456.789-01 | XXX.XXX.XXX-01 | 2 digits |
| Passport | P12345678 | PXXXXXX78 | First + 2 |

### Names
- **All formats**: Full name → `XXXX XXXX XXXX`
- **Multilingual**: Works in English, Spanish, French, Portuguese, Hindi, Arabic, Korean, Japanese, Chinese

### Dates of Birth
- **Full dates**: `15/06/1990` → `XX/XX/XXXX`
- **Years only**: `1990` → `XXXX`
- **Month-Year**: `JUN 1985` → `XXX XXXX`

---

## ✅ What Stays Visible?

### Always Preserved:
- ✅ **Photo**: For visual verification at check-in
- ✅ **Document type**: Passport, NRIC, etc.
- ✅ **Country**: Issuing country remains visible
- ✅ **Gender**: Male/Female (non-sensitive)
- ✅ **Issue/Expiry dates**: For validity checking
- ✅ **Last 4 digits of ID**: For verification

### Always Masked:
- ❌ **Full name**: Replaced with XXXX
- ❌ **Birth year**: Replaced with XXXX
- ❌ **First 8 digits of ID**: Replaced with XXXX
- ❌ **Full birth date**: Year masked

---

## 🔒 Privacy Protection

### Client-Side Processing
```
┌─────────────┐
│ User Device │
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│  Browser OCR     │ ← Original stays here
│  + Masking       │
└──────┬───────────┘
       │
       ▼ Masked version only
┌──────────────────┐
│  Server Storage  │ ← Original NEVER reaches here
└──────────────────┘
```

### What Happens to Original?
1. ✅ User uploads ID
2. ✅ Browser extracts text (OCR)
3. ✅ Browser applies masking
4. ✅ **Original file discarded**
5. ✅ Only masked version sent to server
6. ✅ Original NEVER stored or transmitted

---

## 🏨 Hotel Verification at Check-In

### How Hotels Verify Identity

1. **Photo Comparison**
   - Compare physical ID photo with masked preview
   - Verify person matches

2. **Last Digits Check**
   - Guest shows physical ID
   - Staff verifies last 4 digits match masked preview
   - No need to see full ID number

3. **Document Type**
   - Verify document type matches (Passport, NRIC, etc.)
   - Check expiry date is valid

4. **Visual Inspection**
   - Physical ID looks legitimate
   - Not expired or damaged

### Example Verification:

**Masked Preview Shows:**
- Photo: ✓ (visible)
- Name: `XXXX XXXX`
- ID: `XXXX XXXX 9012`

**Staff Checks Physical ID:**
- Photo matches preview? ✓
- Last 4 digits: `9012`? ✓
- Document appears legitimate? ✓
- Not expired? ✓

**Result: Identity verified! ✅**

---

## 🌍 International Coverage

### Supported Countries Summary

| Region | Countries | ID Types |
|--------|-----------|----------|
| **Asia-Pacific** | 6 countries | 18 ID types |
| **Middle East** | 1 country | 3 ID types |
| **Americas** | 5 countries | 15 ID types |
| **Europe** | 8 countries | 24 ID types |
| **Total** | **20+ countries** | **60+ ID types** |

---

## 📱 Mobile Example

### On Mobile Phone

```
┌────────────────────┐
│  📱 SwiftCheckin   │
├────────────────────┤
│                    │
│ Upload Your ID:    │
│                    │
│ ┌──────────────┐  │
│ │   [Camera]   │  │
│ │  Take Photo  │  │
│ └──────────────┘  │
│                    │
│ Processing...      │
│ ██████████ 100%   │
│                    │
│ ✅ Masked Preview: │
│ ┌──────────────┐  │
│ │  📷          │  │
│ │ XXXX XXXX    │  │
│ │ XXXX XXXX    │  │
│ │              │  │
│ │ XXXX XXXX    │  │
│ │ 9012         │  │
│ └──────────────┘  │
│                    │
│ [Submit] [Retake] │
│                    │
└────────────────────┘
```

---

## ✨ Summary

### What Gets Masked:
1. ✅ **ID Numbers** - First 8 characters (or appropriate for type)
2. ✅ **Names** - Full name replaced with XXXX
3. ✅ **Birth Years** - Year replaced with XXXX

### What Stays Visible:
1. ✅ **Last 4 digits** of ID number
2. ✅ **Photo** for visual verification
3. ✅ **Document type** and country
4. ✅ **Non-sensitive fields** (gender, issue date, etc.)

### Security:
1. ✅ **Original never stored** - processed in browser
2. ✅ **Only masked version saved** - maximum privacy
3. ✅ **Hotel can still verify** - last 4 digits + photo

---

**Your privacy is protected while maintaining security! 🔒✨**

*Last updated: December 12, 2025*

