"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";

export default function BookingComPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-zinc-600">Loading...</div>}>
      <Content />
    </Suspense>
  );
}

function Content() {
  const params = useParams();
  const ref = (params.ref as string) || "BK123456";
  
  // Mock booking data
  const booking = {
    ref,
    hotelName: "Grand Marina Hotel",
    hotelAddress: "123 Harbor Boulevard, Marina Bay, Singapore",
    checkIn: "2024-03-15",
    checkOut: "2024-03-18",
    nights: 3,
    guests: 2,
    roomType: "Deluxe Sea View Room",
    guestName: "Jane Doe",
    email: "jane.doe@example.com",
    phone: "+65 6123 4567",
    totalPrice: 600,
    currency: "SGD",
    status: "Confirmed",
    bookingDate: "2024-02-20",
    country: "Singapore",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Booking.com Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-32 h-8 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">booking.com</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="text-sm text-gray-700 hover:text-gray-900">Help</button>
              <button className="text-sm text-gray-700 hover:text-gray-900">Sign in</button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Banner */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-green-800">Booking Confirmed</p>
              <p className="text-xs text-green-700">Your reservation is confirmed. Booking reference: {booking.ref}</p>
            </div>
          </div>
        </div>

        {/* Hotel Image & Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="relative h-64 bg-gradient-to-r from-blue-400 to-blue-600">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <svg className="w-24 h-24 mx-auto opacity-50" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
                <p className="mt-2 text-lg font-semibold">{booking.hotelName}</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{booking.hotelName}</h1>
            <p className="text-sm text-gray-600 mb-4">{booking.hotelAddress}</p>
            
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Details</h2>
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Booking Reference</dt>
                    <dd className="text-sm font-medium text-gray-900">{booking.ref}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Check-in</dt>
                    <dd className="text-sm font-medium text-gray-900">{new Date(booking.checkIn).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Check-out</dt>
                    <dd className="text-sm font-medium text-gray-900">{new Date(booking.checkOut).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Nights</dt>
                    <dd className="text-sm font-medium text-gray-900">{booking.nights}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Guests</dt>
                    <dd className="text-sm font-medium text-gray-900">{booking.guests}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Room Type</dt>
                    <dd className="text-sm font-medium text-gray-900">{booking.roomType}</dd>
                  </div>
                </dl>
              </div>
              
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Guest Information</h2>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm text-gray-600">Guest Name</dt>
                    <dd className="text-sm font-medium text-gray-900 mt-1">{booking.guestName}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-600">Email</dt>
                    <dd className="text-sm font-medium text-gray-900 mt-1">{booking.email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-600">Phone</dt>
                    <dd className="text-sm font-medium text-gray-900 mt-1">{booking.phone}</dd>
                  </div>
                </dl>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex justify-between items-baseline">
                    <span className="text-lg font-semibold text-gray-900">Total Price</span>
                    <span className="text-2xl font-bold text-gray-900">{booking.currency} {booking.totalPrice}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Includes taxes and fees</p>
                </div>
              </div>
            </div>

            {/* Redirect to Hotel Email CTA */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-blue-900 mb-1">Check Your Email</h3>
                  <p className="text-xs text-blue-800 mb-3">
                    You should receive a confirmation email from the hotel shortly. The email will contain details about your booking and instructions for pre-check-in.
                  </p>
                  <a
                    href={`/email/booking?name=${encodeURIComponent(booking.guestName)}&ref=${encodeURIComponent(booking.ref)}&arrival=${encodeURIComponent(booking.checkIn)}&nights=${booking.nights}&room=${encodeURIComponent(booking.roomType)}&guests=${booking.guests}&country=${encodeURIComponent(booking.country)}&email=${encodeURIComponent(booking.email)}&phone=${encodeURIComponent(booking.phone)}`}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                  >
                    View Hotel Email
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Important Information</h2>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>Check-in time: 2:00 PM - 11:00 PM</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>Check-out time: Before 11:00 AM</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>Free cancellation until {new Date(booking.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}

