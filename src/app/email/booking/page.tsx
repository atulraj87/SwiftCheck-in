"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { getArrivalParam, getParam, buildPrefillParams } from "@/lib/demoUtils";
import { GrandMarinaHeader } from "@/components/GrandMarinaHeader";

export default function BookingEmailPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-zinc-600">Loading...</div>}>
      <Content />
    </Suspense>
  );
}

function Content() {
  const params = useSearchParams();
  const data = useMemo(() => {
    const name = getParam(params, "name", "Jane Doe");
    const ref = getParam(params, "ref", "ABC1234");
    const arrival = getArrivalParam(params, 1);
    const nights = getParam(params, "nights", "2");
    const room = getParam(params, "room", "Deluxe King");
    const guests = getParam(params, "guests", "2");
    const country = getParam(params, "country", "Singapore");
    const email = getParam(params, "email", "jane@example.com");
    const phone = getParam(params, "phone", "+91 90000 00000");
    const prefillParams = buildPrefillParams({ name, ref, arrival, country, email, phone });
    return { name, ref, arrival, nights, room, guests, country, email, phone, prefillParams };
  }, [params]);

  return (
    <div className="min-h-screen bg-[#D9DED7] text-zinc-900">
      <main className="mx-auto w-full max-w-2xl px-6 py-10">
        <div className="rounded-2xl border border-transparent bg-white p-6 shadow-sm">
          <GrandMarinaHeader />
          <h1 className="text-xl font-semibold">Your reservation is confirmed!</h1>
          <p className="mt-1 text-sm text-zinc-600">Dear {data.name}, we look forward to welcoming you.</p>

          <div className="mt-4 grid gap-3 text-sm">
            <div className="grid grid-cols-2">
              <span className="text-zinc-600">Booking reference</span>
              <span className="font-medium">{data.ref}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-zinc-600">Guest</span>
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
              <span className="text-zinc-600">Guests</span>
              <span className="font-medium">{data.guests}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-zinc-600">Contact</span>
              <span className="font-medium">{data.email} · {data.phone}</span>
            </div>
          </div>

          <div className="mt-6 rounded-lg bg-[#F3F1ED] p-4">
            <p className="text-sm font-medium">🚀 Skip the queue — Complete your pre-check-in</p>
            <p className="text-sm text-zinc-700">Save time at arrival. Complete your check-in formalities now in ~60 seconds.</p>
            <ul className="mt-2 text-xs text-zinc-600 space-y-1">
              <li>✓ No paperwork at reception</li>
              <li>✓ Secure ID verification</li>
              <li>✓ Instant room key upon arrival</li>
            </ul>
            <div className="sticky bottom-4 mt-3 flex justify-end">
              <a
                href={`/?${data.prefillParams}`}
                className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700"
              >
                Complete Pre-Check-In Now
              </a>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-600">
            <p className="font-medium">Important Information:</p>
            <ul className="mt-2 space-y-1">
              <li>• Check-in time: 2:00 PM | Check-out time: 11:00 AM</li>
              <li>• Free Wi-Fi throughout the property</li>
              <li>• Complimentary breakfast included (7 AM - 10 AM)</li>
              <li>• Free parking available</li>
            </ul>
          </div>

          <p className="mt-4 text-xs text-zinc-500">
            Questions? Contact us at <span className="font-medium">+65 6123 4567</span> or <span className="font-medium">guestservices@grandmarina.com</span>
          </p>
        </div>
      </main>
    </div>
  );
}


