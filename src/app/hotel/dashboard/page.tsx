"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { maskID } from "@/lib/idMasking";

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

function sanitizeEntry(entry: Entry): Entry {
  // Apply generic masking to ensure no raw IDs are displayed in dashboard
  if (entry.idType && entry.maskedSummary) {
    const masked = maskID(entry.idType, entry.maskedSummary);
    if (masked !== entry.maskedSummary) {
      return { ...entry, maskedSummary: masked };
    }
  }
  return entry;
}

function getStatusColor(status: string): string {
  if (status === "Checked-in" || status === "approved" || status === "Checked-out") {
    return "bg-emerald-100 text-emerald-700";
  }
  if (status === "Pending" || status === "submitted" || status === "Booked" || status === "Check-in") {
    return "bg-yellow-100 text-yellow-700";
  }
  if (status === "Rejected" || status === "Cancelled" || status === "No-show") {
    return "bg-red-100 text-red-700";
  }
  if (status === "Paid") {
    return "bg-blue-100 text-blue-700";
  }
  return "bg-zinc-900 text-white";
}

export default function HotelDashboardPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("demoEntries");
      const parsed: Entry[] = raw ? JSON.parse(raw) : [];
      const sanitized = parsed.map(sanitizeEntry);
      setEntries(sanitized);
      const hasChanges = sanitized.some((entry, index) => entry !== parsed[index]);
      if (hasChanges) {
        try {
          localStorage.setItem("demoEntries", JSON.stringify(sanitized));
        } catch {
          // ignore storage errors
        }
      }
    } catch {
      setEntries([]);
    }
  }, []);

  const total = entries.length;
  const pending = useMemo(() => entries.filter((e) => e.status === "Pending" || e.status === "submitted" || e.status === "Booked" || e.status === "Check-in").length, [entries]);
  const checkedIn = useMemo(() => entries.filter((e) => e.status === "Checked-in" || e.status === "approved").length, [entries]);
  const paid = useMemo(() => entries.filter((e) => e.status === "Paid").length, [entries]);
  const filtered = useMemo(() => {
    return entries.filter((e) => {
      const q = query.trim().toLowerCase();
      const matchesQuery = !q || e.name.toLowerCase().includes(q) || e.ref.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || e.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [entries, query, statusFilter]);

  function persist(updated: Entry[]) {
    const sanitized = updated.map(sanitizeEntry);
    setEntries(sanitized);
    try {
      localStorage.setItem("demoEntries", JSON.stringify(sanitized));
    } catch {
      // ignore storage errors
    }
  }

  return (
    <div className="min-h-screen bg-[#D9DED7] text-zinc-900">
      <header className="mx-auto w-full max-w-5xl px-6 py-10">
        <h1 className="text-3xl font-semibold tracking-tight">Hotel Dashboard</h1>
        <p className="mt-2 text-sm text-zinc-700">Pre-check-in submissions captured locally.</p>
      </header>

      <main className="mx-auto mb-24 w-full max-w-5xl px-6">
        <div className="rounded-2xl border border-transparent bg-[#F3F1ED] p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-lg border border-zinc-200 bg-white p-4">
              <p className="text-sm text-zinc-600">Total entries</p>
              <p className="text-2xl font-semibold">{total}</p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-4">
              <p className="text-sm text-zinc-600">Pending / Booked</p>
              <p className="text-2xl font-semibold">{pending}</p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-4">
              <p className="text-sm text-zinc-600">Checked-in</p>
              <p className="text-2xl font-semibold">{checkedIn}</p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-4">
              <p className="text-sm text-zinc-600">Paid</p>
              <p className="text-2xl font-semibold">{paid}</p>
            </div>
          </div>

          <h2 className="mt-6 text-lg font-medium">Latest submissions</h2>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name or ref"
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
            >
              <option value="all">All</option>
              <option value="Booked">Booked</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Check-in">Check-in</option>
              <option value="Checked-in">Checked-in</option>
              <option value="Checked-out">Checked-out</option>
              <option value="Cancelled">Cancelled</option>
              <option value="No-show">No-show</option>
              <option value="submitted">Submitted (Legacy)</option>
              <option value="approved">Approved (Legacy)</option>
              <option value="rejected">Rejected (Legacy)</option>
            </select>
          </div>

          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-zinc-600">
                  <th className="px-3 py-2">Guest</th>
                  <th className="px-3 py-2">Ref</th>
                  <th className="px-3 py-2">Arrival</th>
                  <th className="px-3 py-2">Masked ID</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Created</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e, idx) => (
                  <tr key={idx} className="border-t border-zinc-200">
                    <td className="px-3 py-2 font-medium">{e.name}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/hotel/booking/${encodeURIComponent(e.ref)}`}
                        className="text-blue-600 hover:text-blue-800 underline font-medium"
                      >
                        {e.ref}
                      </Link>
                    </td>
                    <td className="px-3 py-2">{e.arrival}</td>
                    <td className="px-3 py-2">
                      {e.maskedSummary && e.idType ? (
                        <span className="text-sm text-zinc-700">
                          {e.idType}: {e.idType === "Aadhaar" ? maskAadhaar(e.maskedSummary) : e.maskedSummary}
                        </span>
                      ) : e.uploadedIdName ? (
                        <span className="text-sm text-zinc-600">{e.uploadedIdName}</span>
                      ) : (
                        <span className="text-sm text-zinc-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(e.status)}`}>
                        {e.status}
                      </span>
                    </td>
                    <td className="px-3 py-2">{new Date(e.createdAt).toLocaleString()}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/validate?ref=${encodeURIComponent(e.ref)}`}
                        className="text-sm font-medium text-zinc-900 underline"
                      >
                        Validate
                      </Link>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td className="px-3 py-8 text-center text-zinc-600" colSpan={7}>
                      No entries match. Submit the guest form first.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
