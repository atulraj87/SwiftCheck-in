"use client";

import { Suspense, useState, useEffect } from "react";
import { useParams } from "next/navigation";

export default function WebhookPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-zinc-600">Loading...</div>}>
      <Content />
    </Suspense>
  );
}

function Content() {
  const params = useParams();
  const ref = (params.ref as string) || "BK123456";
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Simulate webhook processing
    setIsProcessing(true);
    const timer = setTimeout(() => {
      setIsProcessing(false);
      setIsComplete(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const webhookPayload = {
    event: "booking.created",
    timestamp: new Date().toISOString(),
    booking: {
      reference: ref,
      hotelId: "HOTEL-12345",
      guestName: "Jane Doe",
      email: "jane.doe@example.com",
      phone: "+1 555 123 4567",
      checkIn: "2024-03-15",
      checkOut: "2024-03-18",
      nights: 3,
      guests: 2,
      roomType: "Deluxe Sea View Room",
      totalAmount: 450,
      currency: "USD",
      status: "confirmed",
    },
    source: "booking.com",
    webhookId: `wh_${Date.now()}`,
  };

  return (
    <div className="min-h-screen bg-[#D9DED7] text-zinc-900">
      <header className="mx-auto w-full max-w-4xl px-6 py-10">
        <h1 className="text-3xl font-semibold tracking-tight">Webhook Processing</h1>
        <p className="mt-2 text-sm text-zinc-700">Booking.com → SwiftCheckin Integration</p>
      </header>

      <main className="mx-auto mb-24 w-full max-w-4xl px-6">
        {/* Flow Diagram */}
        <div className="rounded-2xl border border-transparent bg-[#F3F1ED] p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex flex-col items-center flex-1">
              <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mb-2">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
              </div>
              <p className="text-xs font-medium text-gray-700">Booking.com</p>
            </div>
            
            <div className="flex-1 mx-4">
              <div className="flex items-center">
                <div className="flex-1 h-0.5 bg-gray-300"></div>
                <div className={`px-4 py-2 rounded-full ${isComplete ? 'bg-green-500' : isProcessing ? 'bg-yellow-500 animate-pulse' : 'bg-gray-300'}`}>
                  <svg className={`w-5 h-5 ${isComplete || isProcessing ? 'text-white' : 'text-gray-500'}`} fill="currentColor" viewBox="0 0 20 20">
                    {isComplete ? (
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    ) : (
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    )}
                  </svg>
                </div>
                <div className="flex-1 h-0.5 bg-gray-300"></div>
              </div>
            </div>

            <div className="flex flex-col items-center flex-1">
              <div className={`w-16 h-16 ${isComplete ? 'bg-green-600' : 'bg-purple-600'} rounded-lg flex items-center justify-center mb-2`}>
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-xs font-medium text-gray-700">SwiftCheckin</p>
            </div>
          </div>

          <div className="text-center">
            <p className={`text-sm font-medium ${isComplete ? 'text-green-700' : isProcessing ? 'text-yellow-700' : 'text-gray-600'}`}>
              {isComplete ? "Webhook processed successfully" : isProcessing ? "Processing webhook..." : "Waiting for webhook..."}
            </p>
          </div>
        </div>

        {/* Webhook Details */}
        <div className="rounded-2xl border border-transparent bg-[#F3F1ED] p-6 shadow-sm">
          <h2 className="text-lg font-medium mb-4">Webhook Payload</h2>
          
          <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
            <pre className="text-xs text-green-400 font-mono">
              <code>{JSON.stringify(webhookPayload, null, 2)}</code>
            </pre>
          </div>

          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Request Details</h3>
              <dl className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Method:</dt>
                  <dd className="font-mono text-gray-900">POST</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Endpoint:</dt>
                  <dd className="font-mono text-gray-900">/api/webhooks/booking</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Content-Type:</dt>
                  <dd className="font-mono text-gray-900">application/json</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Signature:</dt>
                  <dd className="font-mono text-gray-900 text-xs">sha256=abc123...</dd>
                </div>
              </dl>
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Response</h3>
              <dl className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Status:</dt>
                  <dd className={`font-mono ${isComplete ? 'text-green-600' : 'text-yellow-600'}`}>
                    {isComplete ? '200 OK' : 'Processing...'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Processing Time:</dt>
                  <dd className="font-mono text-gray-900">{isComplete ? '1.2s' : '...'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Booking Status:</dt>
                  <dd className="font-mono text-gray-900">{isComplete ? 'Synced' : 'Pending'}</dd>
                </div>
              </dl>
            </div>
          </div>

          {isComplete && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-green-800">Booking synced to hotel dashboard</p>
                  <p className="text-xs text-green-700 mt-1">
                    The booking has been successfully received and is now visible in the hotel dashboard.
                  </p>
                  <a
                    href="/hotel/dashboard"
                    className="inline-block mt-2 text-xs font-medium text-green-700 hover:text-green-900 underline"
                  >
                    View Hotel Dashboard →
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

