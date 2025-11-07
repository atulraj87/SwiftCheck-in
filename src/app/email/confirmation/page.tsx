"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { QRCodeCanvas as QRCode } from "qrcode.react";

export default function ConfirmationEmailPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-zinc-600">Loading...</div>}>
      <Content />
    </Suspense>
  );
}

function Content() {
  const params = useSearchParams();
  const name = params.get("name") ?? "Guest";
  const ref = params.get("ref") ?? "—";
  const arrival = params.get("arrival") ?? "—";
  const qrValue = JSON.stringify({ ref, name, arrival });

  return (
    <div className="min-h-screen bg-[#D9DED7] text-zinc-900">
      <main className="mx-auto w-full max-w-2xl px-6 py-10">
        <div className="rounded-2xl border border-transparent bg-white p-6 shadow-sm">
          <p className="text-xs font-medium tracking-wide text-zinc-500">From: Your Hotel</p>
          <h1 className="mt-1 text-xl font-semibold">Your pre-check-in is confirmed</h1>
          <p className="mt-1 text-sm text-zinc-600">Show this QR at reception to skip paperwork.</p>

          <div className="mt-4 grid gap-3 text-sm">
            <div className="grid grid-cols-2">
              <span className="text-zinc-600">Guest</span>
              <span className="font-medium">{name}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-zinc-600">Booking ref</span>
              <span className="font-medium">{ref}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-zinc-600">Arrival</span>
              <span className="font-medium">{arrival}</span>
            </div>
          </div>

          {ref !== "—" && (
            <div className="mt-6 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
              <p className="text-xs font-medium">📶 Your Wi-Fi credentials</p>
              <div className="mt-2 rounded-md bg-white px-2 py-1.5 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-zinc-200 pb-1">
                  <span className="text-zinc-600">Network:</span>
                  <span className="font-semibold text-zinc-900">NOVATAL-{ref.slice(-4).padStart(4, "0")}</span>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-zinc-600">Password:</span>
                  <span className="font-semibold text-zinc-900">{ref.toUpperCase()}2024</span>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center justify-center rounded-lg border border-zinc-200 p-4">
            <QRCode value={qrValue} size={180} includeMargin={true} level="M" />
          </div>

          <div className="mt-6 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs">
            <p className="font-medium">Quick support</p>
            <ul className="mt-2 space-y-1 text-zinc-600">
              <li className="flex items-center justify-between">
                <span>🔑 Lost key?</span>
                <span className="font-mono text-zinc-800">Ext. 101</span>
              </li>
              <li className="flex items-center justify-between">
                <span>🌡️ Room issues?</span>
                <span className="font-mono text-zinc-800">Ext. 205</span>
              </li>
              <li className="flex items-center justify-between">
                <span>🛏️ Need amenities?</span>
                <span className="font-mono text-zinc-800">Ext. 301</span>
              </li>
              <li className="flex items-center justify-between">
                <span>🍽️ Room service?</span>
                <span className="font-mono text-zinc-800">Ext. 401</span>
              </li>
            </ul>
          </div>

          <p className="mt-4 text-xs text-zinc-500">This is an email preview rendered as a web page.</p>
        </div>
      </main>
    </div>
  );
}


