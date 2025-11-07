"use client";

import { Suspense, useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function WhatsAppMessageDemo() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-zinc-600">Loading...</div>}>
      <Content />
    </Suspense>
  );
}

function Content() {
  const params = useSearchParams();
  const [origin, setOrigin] = useState<string>("");
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const data = useMemo(() => {
    const name = params.get("name") ?? "Jane Doe";
    const ref = params.get("ref") ?? "ABC1234";
    const arrival = params.get("arrival") ?? new Date().toISOString().slice(0, 10);
    const country = params.get("country") ?? "India";
    const email = params.get("email") ?? "jane@example.com";
    const phone = params.get("phone") ?? "+91 90000 00000";
    const prefillParams = new URLSearchParams({
      prefill: "1",
      name,
      ref,
      arrival,
      country,
      email,
      phone,
    }).toString();
    return { name, ref, arrival, country, email, phone, prefillParams };
  }, [params]);

  const checkInLink = origin ? `${origin}/?${data.prefillParams}` : `/?${data.prefillParams}`;

  return (
    <div className="min-h-screen bg-[#D9DED7] text-zinc-900">
      <main className="mx-auto w-full max-w-md px-4 py-8">
        <div className="mb-4 text-center">
          <h1 className="text-lg font-semibold">WhatsApp / Text Message</h1>
          <p className="mt-1 text-xs text-zinc-600">Mobile message preview</p>
        </div>

        {/* Mobile Phone Frame */}
        <div className="mx-auto max-w-sm rounded-[2.5rem] border-8 border-zinc-800 bg-zinc-900 p-2 shadow-2xl">
          <div className="rounded-[2rem] bg-white">
            {/* Status Bar */}
            <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-4 py-2 text-xs">
              <span className="font-medium">9:41</span>
              <div className="flex items-center gap-1">
                <span>📶</span>
                <span>📶</span>
                <span>🔋</span>
              </div>
            </div>

            {/* WhatsApp Header */}
            <div className="flex items-center gap-3 border-b border-zinc-200 bg-[#075E54] px-4 py-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#075E54] font-bold">
                N
              </div>
              <div className="flex-1 text-white">
                <p className="text-sm font-semibold">NOVATAL Hotel</p>
                <p className="text-xs text-green-100">online</p>
              </div>
            </div>

            {/* Messages */}
            <div className="min-h-[400px] bg-[#ECE5DD] p-4">
              <div className="space-y-3">
                {/* Incoming message */}
                <div className="flex items-start gap-2">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#075E54] text-xs font-semibold text-white">
                    N
                  </div>
                  <div className="flex-1 rounded-lg bg-white px-3 py-2 shadow-sm">
                    <p className="text-sm text-zinc-900">
                      Hi {data.name}! 👋
                    </p>
                    <p className="mt-1 text-sm text-zinc-900">
                      Complete your pre-check-in for booking <strong>{data.ref}</strong>
                    </p>
                    <p className="mt-2 text-sm text-zinc-900">
                      Arrival: {new Date(data.arrival).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  <span className="text-[10px] text-zinc-500">9:15</span>
                </div>

                {/* Link message */}
                <div className="flex items-start gap-2">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#075E54] text-xs font-semibold text-white">
                    N
                  </div>
                  <div className="flex-1 rounded-lg bg-white px-3 py-2 shadow-sm">
                    <p className="text-sm text-zinc-900">
                      Tap to complete:
                    </p>
                    <a
                      href={`/?${data.prefillParams}`}
                      className="mt-2 block rounded-md bg-[#25D366] px-3 py-2 text-center text-sm font-medium text-white hover:bg-[#20BA5A]"
                    >
                      Complete Pre-Check-In →
                    </a>
                    <p className="mt-1 text-[10px] text-zinc-500 break-all">
                      {origin ? (checkInLink.length > 50 ? `${checkInLink.substring(0, 50)}...` : checkInLink) : "Loading link..."}
                    </p>
                  </div>
                  <span className="text-[10px] text-zinc-500">9:16</span>
                </div>

                {/* Quick info */}
                <div className="flex items-start gap-2">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#075E54] text-xs font-semibold text-white">
                    N
                  </div>
                  <div className="flex-1 rounded-lg bg-white px-3 py-2 shadow-sm">
                    <p className="text-xs text-zinc-600">
                      ⏱️ Takes ~60 seconds
                    </p>
                  </div>
                  <span className="text-[10px] text-zinc-500">9:16</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alternative SMS-style view */}
        <div className="mt-8 rounded-2xl border border-transparent bg-[#F3F1ED] p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold">SMS / Text Message Format</h2>
          <div className="rounded-lg border border-zinc-200 bg-white p-4 font-mono text-xs">
            <div className="space-y-1 text-zinc-700">
              <p className="text-zinc-500">From: NOVATAL</p>
              <p className="mt-2">Hi {data.name}! Complete pre-check-in for booking {data.ref}. Arrival: {new Date(data.arrival).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
              <p className="mt-2 break-all">
                {origin ? (
                  <a href={`/?${data.prefillParams}`} className="text-[#5E0F8B] underline">
                    {checkInLink}
                  </a>
                ) : (
                  <span className="text-zinc-400">Loading link...</span>
                )}
              </p>
              <p className="mt-2 text-zinc-500">Takes ~60s. Reply STOP to opt out.</p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <a
            href={`/?${data.prefillParams}`}
            className="inline-flex items-center rounded-md bg-[#5E0F8B] px-6 py-3 text-sm font-medium text-white hover:bg-[#4A0B6E]"
          >
            Test Pre-Check-In Link →
          </a>
        </div>
      </main>
    </div>
  );
}

