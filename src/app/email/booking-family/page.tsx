"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";

export default function FamilyBookingEmailPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-zinc-600">Loading...</div>}>
      <Content />
    </Suspense>
  );
}

function Content() {
  const params = useSearchParams();
  const data = useMemo(() => {
    const name = params.get("name") ?? "John Doe";
    const ref = params.get("ref") ?? "BK789012";
    const nextDay = new Date();
    nextDay.setDate(nextDay.getDate() + 1);
    const arrival = params.get("arrival") ?? nextDay.toISOString().slice(0, 10);
    const nights = params.get("nights") ?? "3";
    const room = params.get("room") ?? "Family Suite";
    const guests = params.get("guests") ?? "4";
    const country = params.get("country") ?? "USA";
    const email = params.get("email") ?? "john.doe@example.com";
    const phone = params.get("phone") ?? "+1 555 123 4567";
    
    // Parse guest names if provided, otherwise generate defaults
    const guestNamesParam = params.get("guestNames");
    const guestNames = guestNamesParam 
      ? guestNamesParam.split(",")
      : ["John Doe", "Jane Doe", "Emma Doe", "Lucas Doe"].slice(0, parseInt(guests, 10));
    
    const prefillParams = new URLSearchParams({
      prefill: "1",
      name,
      ref,
      arrival,
      country,
      email,
      phone,
      guests,
      guestNames: guestNames.join(","),
    }).toString();
    
    return { 
      name, 
      ref, 
      arrival, 
      nights, 
      room, 
      guests: parseInt(guests, 10), 
      guestNames,
      country, 
      email, 
      phone, 
      prefillParams 
    };
  }, [params]);

  return (
    <div className="min-h-screen bg-[#D9DED7] text-zinc-900">
      <main className="mx-auto w-full max-w-2xl px-6 py-10">
        <div className="rounded-2xl border border-transparent bg-white p-6 shadow-sm">
          {/* Novotel Header */}
          <div className="mb-4 flex items-center gap-3 border-b border-zinc-200 pb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#5E0F8B] text-white font-bold text-lg">
              N
            </div>
            <div>
              <p className="text-sm font-semibold text-[#5E0F8B]">NOVATAL</p>
              <p className="text-xs text-zinc-500">checkin@novatal.com</p>
            </div>
          </div>
          <h1 className="text-xl font-semibold">Your family reservation is confirmed!</h1>
          <p className="mt-1 text-sm text-zinc-600">Dear {data.name}, we look forward to welcoming your family.</p>

          <div className="mt-4 grid gap-3 text-sm">
            <div className="grid grid-cols-2">
              <span className="text-zinc-600">Booking reference</span>
              <span className="font-medium">{data.ref}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-zinc-600">Primary guest</span>
              <span className="font-medium">{data.name}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-zinc-600">Arrival</span>
              <span className="font-medium">{data.arrival}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-zinc-600">Nights</span>
              <span className="font-medium">{data.nights}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-zinc-600">Room</span>
              <span className="font-medium">{data.room}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-zinc-600">Total guests</span>
              <span className="font-medium">{data.guests}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-zinc-600">Contact</span>
              <span className="font-medium">{data.email} · {data.phone}</span>
            </div>
          </div>

          {/* Guest List */}
          <div className="mt-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
            <p className="text-sm font-semibold text-zinc-900 mb-3">👨‍👩‍👧‍👦 Guests in this booking</p>
            <div className="space-y-2">
              {data.guestNames.map((guestName, index) => (
                <div key={index} className="flex items-center gap-2 bg-white rounded-md px-3 py-2">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#5E0F8B] text-white flex items-center justify-center text-xs font-semibold">
                    {index + 1}
                  </div>
                  <span className="text-sm text-zinc-900">{guestName}</span>
                  {index === 0 && (
                    <span className="ml-auto text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                      Primary
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-lg bg-[#F3F1ED] p-4">
            <p className="text-sm font-medium">🚀 Skip the queue — Complete your pre-check-in</p>
            <p className="text-sm text-zinc-700 mt-1">
              Save time at arrival. Complete check-in formalities for all {data.guests} {data.guests === 1 ? "guest" : "guests"} now in ~{Math.ceil(data.guests * 60)} seconds.
            </p>
            <ul className="mt-3 text-xs text-zinc-600 space-y-1">
              <li>✓ No paperwork at reception</li>
              <li>✓ Secure ID verification for all guests</li>
              <li>✓ Instant room key upon arrival</li>
              <li className="font-semibold text-zinc-800 mt-2">
                ⚠️ Important: Each guest must upload their own ID document
              </li>
            </ul>
            <div className="sticky bottom-4 mt-4 flex justify-end">
              <a
                href={`/?${data.prefillParams}`}
                className="inline-flex items-center rounded-md bg-[#5E0F8B] px-4 py-2 text-sm font-medium text-white shadow hover:bg-[#4A0B6E]"
              >
                Complete Pre-Check-In for All Guests
              </a>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-amber-900">ID Requirements for All Guests</p>
                <p className="text-xs text-amber-800 mt-1">
                  Each guest must provide a valid government-issued ID (Passport, Driver License, State ID, etc.). 
                  The primary guest can complete the pre-check-in process for the entire family, but each guest's ID must be uploaded separately.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-600">
            <p className="font-medium">Important Information:</p>
            <ul className="mt-2 space-y-1">
              <li>• Check-in time: 2:00 PM | Check-out time: 11:00 AM</li>
              <li>• Free Wi-Fi throughout the property</li>
              <li>• Complimentary breakfast included for all guests (7 AM - 10 AM)</li>
              <li>• Free parking available</li>
              <li>• Family-friendly amenities: Kids' play area, pool, and game room</li>
            </ul>
          </div>

          <p className="mt-4 text-xs text-zinc-500">
            Questions? Contact us at <span className="font-medium">+1 (555) 123-4567</span> or <span className="font-medium">guestservices@novatal.com</span>
          </p>
        </div>
      </main>
    </div>
  );
}

