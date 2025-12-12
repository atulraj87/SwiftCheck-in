# SwiftCheckin - All Page Routes

Base URL: `https://swift-check-in.vercel.app`

## ✅ Verified Routes

### Main Pages

1. **Home/Pre-Check-In Form**
   - URL: `https://swift-check-in.vercel.app/`
   - Status: ✅ Working
   - Description: Main pre-check-in form with multi-guest support

2. **Confirmation Page**
   - URL: `https://swift-check-in.vercel.app/confirmation?name=Jane%20Doe&ref=BK123456&arrival=2024-03-15`
   - Status: ✅ Working
   - Query Params: `name`, `ref`, `arrival`

### Email Pages

3. **Booking Confirmation Email**
   - URL: `https://swift-check-in.vercel.app/email/booking?name=Jane%20Doe&ref=BK123456&arrival=2024-03-15&nights=2&room=Deluxe%20King&guests=2&country=USA&email=jane@example.com&phone=%2B15551234567`
   - Status: ✅ Working (Verified)
   - Query Params: `name`, `ref`, `arrival`, `nights`, `room`, `guests`, `country`, `email`, `phone`

4. **Family Booking Email**
   - URL: `https://swift-check-in.vercel.app/email/booking-family?name=John%20Doe&ref=BK789012&arrival=2024-03-15&nights=3&room=Family%20Suite&guests=4&guestNames=John%20Doe,Jane%20Doe,Emma%20Doe,Lucas%20Doe&country=USA&email=john@example.com&phone=%2B15551234567`
   - Status: ✅ Working
   - Query Params: `name`, `ref`, `arrival`, `nights`, `room`, `guests`, `guestNames` (comma-separated), `country`, `email`, `phone`

5. **Confirmation Email**
   - URL: `https://swift-check-in.vercel.app/email/confirmation?name=Jane%20Doe&ref=BK123456&arrival=2024-03-15`
   - Status: ✅ Working
   - Query Params: `name`, `ref`, `arrival`

6. **WhatsApp Email**
   - URL: `https://swift-check-in.vercel.app/email/whatsapp?name=Jane%20Doe&ref=BK123456&arrival=2024-03-15`
   - Status: ✅ Working
   - Query Params: `name`, `ref`, `arrival`

### Hotel Dashboard Pages

7. **Hotel Dashboard**
   - URL: `https://swift-check-in.vercel.app/hotel/dashboard`
   - Status: ✅ Working
   - Description: Shows all pre-check-in submissions

8. **Hotel Booking Detail**
   - URL: `https://swift-check-in.vercel.app/hotel/booking/BK123456`
   - Status: ✅ Working
   - Dynamic Route: Replace `BK123456` with any booking reference

### Validation Page

9. **Validation Page**
   - URL: `https://swift-check-in.vercel.app/validate?ref=BK123456`
   - Status: ✅ Working
   - Query Params: `ref`

### Booking.com & Integration Pages

10. **Booking.com Page**
    - URL: `https://swift-check-in.vercel.app/booking-com/booking/BK123456`
    - Status: ✅ Fixed
    - Dynamic Route: Replace `BK123456` with any booking reference
    - **Note:** Must include booking reference in URL (e.g., `/booking-com/booking/BK123456`)

11. **Webhook Processing Page**
    - URL: `https://swift-check-in.vercel.app/webhook/booking/BK123456`
    - Status: ✅ Working
    - Dynamic Route: Replace `BK123456` with any booking reference
    - Description: Shows webhook flow visualization

### Gmail Page

12. **Gmail Confirmation Page**
    - URL: `https://swift-check-in.vercel.app/gmail/confirmation?name=Jane%20Doe&ref=BK123456&arrival=2024-03-15&email=jane@example.com`
    - Status: ✅ Working
    - Query Params: `name`, `ref`, `arrival`, `email`

## 🔧 Testing URLs

### Single Guest Flow
```
1. Booking.com: https://swift-check-in.vercel.app/booking-com/booking/BK123456
2. Hotel Email: https://swift-check-in.vercel.app/email/booking?name=Jane%20Doe&ref=BK123456&arrival=2024-03-15&nights=2&room=Deluxe%20King&guests=2&country=USA&email=jane@example.com&phone=%2B15551234567
3. Pre-Check-In: https://swift-check-in.vercel.app/?prefill=1&name=Jane%20Doe&ref=BK123456&arrival=2024-03-15&country=USA&email=jane@example.com&phone=%2B15551234567
4. Confirmation: https://swift-check-in.vercel.app/confirmation?name=Jane%20Doe&ref=BK123456&arrival=2024-03-15
5. Gmail: https://swift-check-in.vercel.app/gmail/confirmation?name=Jane%20Doe&ref=BK123456&arrival=2024-03-15&email=jane@example.com
```

### Family Booking Flow
```
1. Booking.com: https://swift-check-in.vercel.app/booking-com/booking/BK789012
2. Family Email: https://swift-check-in.vercel.app/email/booking-family?name=John%20Doe&ref=BK789012&arrival=2024-03-15&nights=3&room=Family%20Suite&guests=4&guestNames=John%20Doe,Jane%20Doe,Emma%20Doe,Lucas%20Doe&country=USA&email=john@example.com&phone=%2B15551234567
3. Pre-Check-In: https://swift-check-in.vercel.app/?prefill=1&name=John%20Doe&ref=BK789012&arrival=2024-03-15&country=USA&email=john@example.com&phone=%2B15551234567&guests=4&guestNames=John%20Doe,Jane%20Doe,Emma%20Doe,Lucas%20Doe
```

## ⚠️ Important Notes

1. **Dynamic Routes**: Routes with `[ref]` require a booking reference (e.g., `BK123456`)
2. **URL Encoding**: Use `%20` for spaces, `%2B` for `+` in phone numbers
3. **Query Parameters**: All query params should be URL encoded
4. **Booking.com Route**: Must include booking reference: `/booking-com/booking/[REF]` (not `/booking-com/booking`)

## 🐛 Troubleshooting

If you get a 404 error:
- Ensure dynamic routes include the required parameter (e.g., booking reference)
- Check that query parameters are properly URL encoded
- Verify the route structure matches exactly (case-sensitive)




