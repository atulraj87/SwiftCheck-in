"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { QRCodeCanvas as QRCode } from "qrcode.react";
import { hmacHex } from "@/lib/hmac";

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-zinc-600">Loading...</div>}>
      <Content />
    </Suspense>
  );
}

function Content() {
  const params = useSearchParams();
  const router = useRouter();
  const name = params.get("name") ?? "Guest";
  const ref = params.get("ref") ?? "—";
  const arrival = params.get("arrival") ?? "—";
  const uploaded = typeof window !== "undefined" ? sessionStorage.getItem("uploadedIdName") : null;
  const maskedSummary = typeof window !== "undefined" ? sessionStorage.getItem("maskedIdSummary") : null;
  const [qrValue, setQrValue] = useState("{}");
  const wifiNetwork = ref && ref !== "—" ? `NOVATAL-${ref.slice(-4).padStart(4, "0")}` : null;
  const wifiPassword = ref && ref !== "—" ? `${ref.toUpperCase()}2024` : null;
  const supportContacts = [
    { label: "🔑 Lost or locked out?", ext: "Ext. 101" },
    { label: "🌡️ Room temperature issues?", ext: "Ext. 205" },
    { label: "📺 TV or remote not working?", ext: "Ext. 205" },
    { label: "🛏️ Extra towels or amenities?", ext: "Ext. 301" },
    { label: "🚪 Late checkout request?", ext: "Ext. 101" },
    { label: "🍽️ Room service or dining?", ext: "Ext. 401" },
  ];

  useEffect(() => {
    async function build() {
      const payload = JSON.stringify({ ref, name, arrival });
      const sig = await hmacHex(payload, "demo-secret");
      setQrValue(JSON.stringify({ ref, name, arrival, sig }));
    }
    build();
  }, [ref, name, arrival]);

  const sendStatus = typeof window !== "undefined" ? localStorage.getItem("demoSendStatus") : null;

  return (
    <div className="min-h-screen bg-[#D9DED7] text-zinc-900">
      <header className="mx-auto w-full max-w-3xl px-6 py-10">
        <h1 className="text-3xl font-semibold tracking-tight">You're all set ✅</h1>
        <p className="mt-2 text-sm text-zinc-700">Show this screen at the hotel to skip paperwork.</p>
      </header>

      <main className="mx-auto w-full max-w-3xl px-6">
        <div className="rounded-2xl border border-transparent bg-[#F3F1ED] p-6 shadow-sm">
          <h2 className="text-lg font-medium">Check-in Summary</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-zinc-600">Guest</dt>
              <dd className="text-base font-medium">{name}</dd>
            </div>
            <div>
              <dt className="text-sm text-zinc-600">Booking Ref</dt>
              <dd className="text-base font-medium">{ref}</dd>
            </div>
            <div>
              <dt className="text-sm text-zinc-600">Arrival</dt>
              <dd className="text-base font-medium">{arrival}</dd>
            </div>
            <div>
              <dt className="text-sm text-zinc-600">ID Upload</dt>
              <dd className="text-base font-medium">{maskedSummary ? maskedSummary : uploaded ? uploaded : "Provided"}</dd>
            </div>
          </dl>

          <div className="mt-8">
            <div className="rounded-lg border border-zinc-200 bg-white p-4">
              <p className="text-sm font-medium">Scan at Reception</p>
              <div className="mt-3 flex items-center justify-center rounded-md bg-white p-4">
                <QRCode value={qrValue} size={160} includeMargin={true} level="M" />
              </div>
              <p className="mt-2 text-xs text-zinc-600">Contains booking reference, name, and arrival information.</p>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <button
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-100"
              onClick={() => router.push("/")}
            >
              Start over
            </button>
            <div className="text-right">
              <p className="text-sm text-zinc-600">Show this confirmation at reception.</p>
              <p className="text-xs text-zinc-500">{sendStatus ? "Confirmation sent to your email/WhatsApp." : "A masked copy of your ID is securely shared with the hotel."}</p>
              <button
                className="mt-2 inline-flex items-center rounded border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-100"
                onClick={() => navigator.clipboard.writeText(qrValue)}
              >
                Copy QR payload
              </button>
            </div>
          </div>
        </div>

        {wifiNetwork && wifiPassword && (
          <div className="mt-6 rounded-2xl border border-transparent bg-[#F3F1ED] p-6 shadow-sm">
            <h2 className="text-lg font-medium text-zinc-900">Wi-Fi credentials</h2>
            <div className="mt-3 rounded-lg border border-zinc-200 bg-white p-4 font-mono text-xs text-zinc-900">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-1.5">
                <span className="text-zinc-600">Network</span>
                <span className="font-semibold text-zinc-900">{wifiNetwork}</span>
              </div>
              <div className="mt-1.5 flex items-center justify-between">
                <span className="text-zinc-600">Password</span>
                <span className="font-semibold text-zinc-900">{wifiPassword}</span>
              </div>
            </div>
          </div>
        )}
        <div className="mt-6 rounded-2xl border border-transparent bg-[#F3F1ED] p-6 shadow-sm">
          <h2 className="text-lg font-medium text-zinc-900">Quick support</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {supportContacts.map((item) => (
              <div key={item.label} className="rounded-lg border border-zinc-200 bg-white p-3 text-sm">
                <p className="font-medium text-zinc-900">{item.label}</p>
                <p className="mt-2 text-xs font-medium text-zinc-900">
                  Dial: <span className="font-mono">{item.ext}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-zinc-600">No data is uploaded to a server.</p>
      </main>
    </div>
  );
}
