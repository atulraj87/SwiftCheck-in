"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { QRCodeCanvas as QRCode } from "qrcode.react";
import { buildQrPayload, getParam, getWifiCredentials } from "@/lib/demoUtils";

export default function GmailConfirmationPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-zinc-600">Loading...</div>}>
      <Content />
    </Suspense>
  );
}

function Content() {
  const params = useSearchParams();
  const name = getParam(params, "name", "Jane Doe");
  const ref = getParam(params, "ref", "BK123456");
  const arrival = getParam(params, "arrival", "2024-03-15");
  const email = getParam(params, "email", "jane.doe@example.com");
  const qrValue = buildQrPayload({ ref, name, arrival });
  const wifi = getWifiCredentials(ref);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Gmail Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">G</span>
                </div>
                <span className="text-sm font-medium text-gray-700">Gmail</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-12 gap-4">
          {/* Sidebar */}
          <aside className="hidden md:block col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-2">
              <button className="w-full flex items-center gap-3 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                Inbox
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="col-span-12 md:col-span-10">
            {/* Email List */}
            <div className="bg-white rounded-lg shadow-sm mb-4">
              <div className="border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium text-gray-900">Inbox</h2>
                  <span className="text-xs text-gray-500">1 new</span>
                </div>
              </div>
              
              {/* Email Item */}
              <div className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">H</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          Grand Marina Hotel
                        </p>
                        <span className="text-xs text-gray-500 ml-2">Just now</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        Your pre-check-in is confirmed ✓
                      </p>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        Show this QR at reception to skip paperwork. Your booking reference: {ref}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Email Content */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="border-b border-gray-200 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h1 className="text-xl font-semibold text-gray-900 mb-2">
                      Your pre-check-in is confirmed ✓
                    </h1>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="font-medium">Grand Marina Hotel</span>
                      <span>&lt;noreply@hotel.com&gt;</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">to {email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-full">
                      <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-full">
                      <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="prose max-w-none">
                  <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="text-sm font-semibold text-green-800">Pre-check-in confirmed!</p>
                        <p className="text-xs text-green-700 mt-1">Show this QR code at reception to skip paperwork.</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 mb-4">
                    Dear {name},
                  </p>

                  <p className="text-sm text-gray-700 mb-4">
                    Thank you for completing your pre-check-in! We're excited to welcome you to Grand Marina Hotel.
                  </p>

                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Booking Summary</h3>
                    <dl className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <dt className="text-gray-600">Guest Name</dt>
                        <dd className="font-medium text-gray-900">{name}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-600">Booking Reference</dt>
                        <dd className="font-medium text-gray-900">{ref}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-600">Check-in Date</dt>
                        <dd className="font-medium text-gray-900">{new Date(arrival).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-600">Status</dt>
                        <dd className="font-medium text-green-600">Confirmed</dd>
                      </div>
                    </dl>
                  </div>

                  <div className="flex justify-center my-6">
                    <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                      <QRCode value={qrValue} size={200} includeMargin={true} level="M" />
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 mb-4">
                    <strong>What to do next:</strong>
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 mb-6">
                    <li>Save this email or take a screenshot of the QR code</li>
                    <li>Upon arrival, proceed directly to reception</li>
                    <li>Show the QR code to our staff</li>
                    <li>Receive your room key and enjoy your stay!</li>
                  </ol>

                  {wifi && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <h3 className="text-sm font-semibold text-blue-900 mb-2">📶 Your Wi-Fi Credentials</h3>
                      <div className="bg-white rounded-md p-3 font-mono text-xs">
                        <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-2">
                          <span className="text-gray-600">Network:</span>
                          <span className="font-semibold text-gray-900">{wifi.network}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Password:</span>
                          <span className="font-semibold text-gray-900">{wifi.password}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="border-t border-gray-200 pt-4 mt-6">
                    <p className="text-xs text-gray-600">
                      If you have any questions, please contact us at <a href="mailto:support@grandmarina.com" className="text-blue-600 hover:underline">support@grandmarina.com</a> or call +65 6123 4567.
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      We look forward to welcoming you!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}


