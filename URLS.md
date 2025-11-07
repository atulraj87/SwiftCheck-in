# SwiftCheckin Demo - All Page URLs

## Base URL
When running the dev server, the base URL is typically:
- **Local Development**: `http://localhost:3000`
- **Production**: (Your production domain)

---

## Main Pages

### 1. Pre-Check-In Form (Guest Form)
**URL**: `http://localhost:3000/`

**Description**: Main guest-facing form where users complete their pre-check-in details, upload ID, and accept policies.

**With Pre-filled Data** (from email/WhatsApp link):
```
http://localhost:3000/?prefill=1&name=Jane%20Doe&ref=ABC1234&arrival=2024-12-25&country=India&email=jane@example.com&phone=%2B91%2090000%2000000
```

**Query Parameters**:
- `prefill=1` - Enables pre-filling
- `name` - Guest full name
- `ref` - Booking reference
- `arrival` - Arrival date (YYYY-MM-DD)
- `country` - Destination country
- `email` - Guest email
- `phone` - Guest phone number

---

### 2. Confirmation Page
**URL**: `http://localhost:3000/confirmation`

**Description**: Shows confirmation after successful pre-check-in submission, displays QR code, WiFi credentials, and masked ID preview.

**With Query Parameters**:
```
http://localhost:3000/confirmation?name=Jane%20Doe&ref=ABC1234&arrival=2024-12-25
```

---

### 3. Hotel Dashboard
**URL**: `http://localhost:3000/hotel/dashboard`

**Description**: Hotel staff dashboard showing all guest submissions with search, filter, and validation options.

**Features**:
- View all submissions
- Search by name or booking reference
- Filter by status (All/Submitted/Approved/Rejected)
- Approve bookings
- Access validation page for each booking

---

### 4. QR Validator Page
**URL**: `http://localhost:3000/validate`

**Description**: Hotel staff page to validate guest QR codes using camera scanner or manual entry.

**With Booking Reference** (pre-targets a booking):
```
http://localhost:3000/validate?ref=ABC1234
```

**Query Parameters**:
- `ref` - (Optional) Booking reference to pre-target

---

## Email Demo Pages

### 5. Booking Confirmation Email
**URL**: `http://localhost:3000/email/booking`

**Description**: Demo page showing how the initial booking confirmation email looks, with pre-check-in link.

**With Custom Data**:
```
http://localhost:3000/email/booking?name=Jane%20Doe&ref=ABC1234&arrival=2024-12-25&nights=2&room=Deluxe%20King&guests=2&country=India&email=jane@example.com&phone=%2B91%2090000%2000000
```

**Query Parameters**:
- `name` - Guest name
- `ref` - Booking reference
- `arrival` - Arrival date
- `nights` - Number of nights
- `room` - Room type
- `guests` - Number of guests
- `country` - Destination country
- `email` - Guest email
- `phone` - Guest phone

---

### 6. Pre-Check-In Confirmation Email
**URL**: `http://localhost:3000/email/confirmation`

**Description**: Demo page showing the confirmation email sent after successful pre-check-in, includes QR code and WiFi credentials.

**With Custom Data**:
```
http://localhost:3000/email/confirmation?name=Jane%20Doe&ref=ABC1234&arrival=2024-12-25
```

---

### 7. WhatsApp / Text Message
**URL**: `http://localhost:3000/email/whatsapp`

**Description**: Demo page showing how WhatsApp/text messages look with booking details and pre-check-in link.

**With Custom Data**:
```
http://localhost:3000/email/whatsapp?name=Jane%20Doe&ref=ABC1234&arrival=2024-12-25&country=India&email=jane@example.com&phone=%2B91%2090000%2000000
```

---

## Example Complete Flow URLs

### Flow 1: Email → Pre-Check-In → Confirmation
1. **Start**: `http://localhost:3000/email/booking?name=Jane%20Doe&ref=ABC1234&arrival=2024-12-25&country=India&email=jane@example.com&phone=%2B91%2090000%2000000`
2. **Click Link**: Takes you to pre-filled form at `http://localhost:3000/?prefill=1&name=Jane%20Doe&ref=ABC1234&arrival=2024-12-25&country=India&email=jane@example.com&phone=%2B91%2090000%2000000`
3. **After Submit**: Redirects to `http://localhost:3000/confirmation?name=Jane%20Doe&ref=ABC1234&arrival=2024-12-25`

### Flow 2: WhatsApp → Pre-Check-In → Confirmation
1. **Start**: `http://localhost:3000/email/whatsapp?name=Jane%20Doe&ref=ABC1234&arrival=2024-12-25&country=India&email=jane@example.com&phone=%2B91%2090000%2000000`
2. **Click Link**: Same as Flow 1, step 2
3. **After Submit**: Same as Flow 1, step 3

### Flow 3: Hotel Staff Validation
1. **Dashboard**: `http://localhost:3000/hotel/dashboard`
2. **Click Validate**: `http://localhost:3000/validate?ref=ABC1234`
3. **Scan QR or Enter Code**: Validates against stored booking

---

## Quick Test URLs (Default Data)

- **Pre-Check-In Form**: `http://localhost:3000/`
- **Booking Email**: `http://localhost:3000/email/booking`
- **WhatsApp Message**: `http://localhost:3000/email/whatsapp`
- **Hotel Dashboard**: `http://localhost:3000/hotel/dashboard`
- **QR Validator**: `http://localhost:3000/validate`

---

## Notes

- All links now use regular anchor tags (`<a>`) instead of Next.js `Link` components for better compatibility
- Query parameters are URL-encoded automatically
- The pre-check-in form automatically pre-fills when `prefill=1` is in the URL
- All demo data is stored in `localStorage` for persistence during the session
- The dev server typically runs on port `3000`, but check your terminal output for the actual port


