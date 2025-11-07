"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type Entry = {
  name: string;
  ref: string;
  arrival: string;
  email?: string;
  phone?: string;
  country?: string;
  idType?: string;
  uploadedIdName: string | null;
  maskedPreview?: string;
  maskedSummary?: string;
  status: string;
  createdAt: string;
};

export default function BookingDetailsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-zinc-600">Loading...</div>}>
      <Content />
    </Suspense>
  );
}

function Content() {
  const params = useParams();
  const router = useRouter();
  const ref = params.ref as string;
  const [entry, setEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("demoEntries");
      const entries = raw ? JSON.parse(raw) : [];
      const found = entries.find((e: Entry) => e.ref === ref);
      setEntry(found || null);
    } catch {
      setEntry(null);
    } finally {
      setLoading(false);
    }
  }, [ref]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#D9DED7] flex items-center justify-center">
        <p className="text-zinc-600">Loading...</p>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="min-h-screen bg-[#D9DED7] text-zinc-900">
        <main className="mx-auto w-full max-w-3xl px-6 py-10">
          <div className="rounded-2xl border border-transparent bg-[#F3F1ED] p-6 shadow-sm">
            <h1 className="text-xl font-semibold">Booking Not Found</h1>
            <p className="mt-2 text-sm text-zinc-600">No booking found with reference: {ref}</p>
            <Link
              href="/hotel/dashboard"
              className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-800 underline"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#D9DED7] text-zinc-900">
      <header className="mx-auto w-full max-w-3xl px-6 py-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Booking Details</h1>
            <p className="mt-2 text-sm text-zinc-700">Reference: {entry.ref}</p>
          </div>
          <Link
            href="/hotel/dashboard"
            className="text-sm text-zinc-600 hover:text-zinc-900 underline"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto mb-24 w-full max-w-3xl px-6">
        <div className="rounded-2xl border border-transparent bg-[#F3F1ED] p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-4">Guest Information</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-zinc-600">Guest Name:</span>
                <p className="font-medium mt-1">{entry.name}</p>
              </div>
              <div>
                <span className="text-zinc-600">Booking Reference:</span>
                <p className="font-medium mt-1">{entry.ref}</p>
              </div>
              <div>
                <span className="text-zinc-600">Arrival Date:</span>
                <p className="font-medium mt-1">{entry.arrival}</p>
              </div>
              <div>
                <span className="text-zinc-600">Status:</span>
                <p className="mt-1">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    entry.status === "Checked-in" || entry.status === "approved" 
                      ? "bg-emerald-100 text-emerald-700" 
                      : entry.status === "Pending" || entry.status === "submitted"
                      ? "bg-yellow-100 text-yellow-700"
                      : entry.status === "Rejected" || entry.status === "Cancelled" || entry.status === "No-show"
                      ? "bg-red-100 text-red-700"
                      : "bg-zinc-900 text-white"
                  }`}>
                    {entry.status}
                  </span>
                </p>
              </div>
              {entry.email && (
                <div>
                  <span className="text-zinc-600">Email:</span>
                  <p className="font-medium mt-1">{entry.email}</p>
                </div>
              )}
              {entry.phone && (
                <div>
                  <span className="text-zinc-600">Phone:</span>
                  <p className="font-medium mt-1">{entry.phone}</p>
                </div>
              )}
              {entry.country && (
                <div>
                  <span className="text-zinc-600">Country:</span>
                  <p className="font-medium mt-1">{entry.country}</p>
                </div>
              )}
              <div>
                <span className="text-zinc-600">Created:</span>
                <p className="font-medium mt-1">{new Date(entry.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {entry.maskedSummary && entry.idType && (
            <div className="mb-6 rounded-lg border border-zinc-200 bg-white p-4">
              <h2 className="text-lg font-medium mb-2">ID Verification</h2>
              <div className="text-sm">
                <p className="text-zinc-600">ID Type:</p>
                <p className="font-medium mt-1">{entry.idType}</p>
                <p className="text-zinc-600 mt-3">Masked ID Number:</p>
                <p className="font-medium mt-1">{entry.maskedSummary}</p>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Link
              href={`/validate?ref=${encodeURIComponent(entry.ref)}`}
              className="inline-flex items-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Validate QR Code
            </Link>
            <Link
              href="/hotel/dashboard"
              className="inline-flex items-center rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

