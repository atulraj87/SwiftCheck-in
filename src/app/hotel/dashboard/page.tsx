"use client";

import { useEffect, useMemo, useState } from "react";
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

export default function HotelDashboardPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("demoEntries");
      setEntries(raw ? JSON.parse(raw) : []);
    } catch {
      setEntries([]);
    }
  }, []);

  const total = entries.length;
  const upcoming = useMemo(() => entries.filter((e) => e.status === "submitted").length, [entries]);
  const approved = useMemo(() => entries.filter((e) => e.status === "approved").length, [entries]);
  const filtered = useMemo(() => {
    return entries.filter((e) => {
      const q = query.trim().toLowerCase();
      const matchesQuery = !q || e.name.toLowerCase().includes(q) || e.ref.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || e.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [entries, query, statusFilter]);

  function persist(updated: Entry[]) {
    setEntries(updated);
    try {
      localStorage.setItem("demoEntries", JSON.stringify(updated));
    } catch {
      // ignore demo storage errors
    }
  }

  return (
    <div className="min-h-screen bg-[#D9DED7] text-zinc-900">
      <header className="mx-auto w-full max-w-5xl px-6 py-10">
        <h1 className="text-3xl font-semibold tracking-tight">Hotel Dashboard (Demo)</h1>
        <p className="mt-2 text-sm text-zinc-700">Pre-check-in submissions captured locally for demo.</p>
      </header>

      <main className="mx-auto mb-24 w-full max-w-5xl px-6">
        <div className="rounded-2xl border border-transparent bg-[#F3F1ED] p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-zinc-200 bg-white p-4">
              <p className="text-sm text-zinc-600">Total entries</p>
              <p className="text-2xl font-semibold">{total}</p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-4">
              <p className="text-sm text-zinc-600">Submitted / under review</p>
              <p className="text-2xl font-semibold">{upcoming}</p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-4">
              <p className="text-sm text-zinc-600">Approved</p>
              <p className="text-2xl font-semibold">{approved}</p>
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
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
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
                    <td className="px-3 py-2">{e.ref}</td>
                    <td className="px-3 py-2">{e.arrival}</td>
                    <td className="px-3 py-2">
                      {e.maskedSummary && e.idType ? (
                        <span className="text-sm text-zinc-700">
                          {e.idType}: {e.maskedSummary}
                        </span>
                      ) : e.uploadedIdName ? (
                        <span className="text-sm text-zinc-600">{e.uploadedIdName}</span>
                      ) : (
                        <span className="text-sm text-zinc-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${e.status === "approved" ? "bg-emerald-100 text-emerald-700" : "bg-zinc-900 text-white"}`}>
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
                      <button
                        type="button"
                        className={`ml-3 text-sm ${e.status === "approved" ? "cursor-default text-zinc-400" : "text-green-700 underline"}`}
                        onClick={() => {
                          if (e.status === "approved") return;
                          const updated = entries.map((entry) =>
                            entry.ref === e.ref ? { ...entry, status: "approved" } : entry
                          );
                          persist(updated);
                        }}
                        disabled={e.status === "approved"}
                      >
                        {e.status === "approved" ? "Approved" : "Approve"}
                      </button>
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
