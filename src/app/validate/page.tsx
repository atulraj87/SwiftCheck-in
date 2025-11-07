"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import jsQR from "jsqr";

type Entry = {
  name: string;
  ref: string;
  arrival: string;
  email?: string;
  phone?: string;
  country?: string;
  uploadedIdName: string | null;
  idType?: string;
  maskedPreview?: string;
  maskedSummary?: string;
  status: string;
  createdAt: string;
};

type ValidationResult = { ok: boolean; message: string; match?: Entry } | null;

export default function ValidatePage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-zinc-600">Loading...</div>}>
      <ValidateContent />
    </Suspense>
  );
}

function ValidateContent() {
  const params = useSearchParams();
  const router = useRouter();
  const targetRef = params.get("ref") ?? "";
  const [input, setInput] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [result, setResult] = useState<ValidationResult>(null);
  const [showScanner, setShowScanner] = useState(true);
  const [scanComplete, setScanComplete] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("demoEntries");
      setEntries(raw ? JSON.parse(raw) : []);
    } catch {
      setEntries([]);
    }
  }, []);

  const targeted = useMemo(
    () => (targetRef ? entries.find((e) => e.ref === targetRef) : undefined),
    [entries, targetRef]
  );

  const parsed = useMemo(() => {
    try {
      return input ? JSON.parse(input) : null;
    } catch {
      return null;
    }
  }, [input]);

  function handleValidate() {
    if (!parsed) {
      setResult({ ok: false, message: "Invalid QR payload. Expecting JSON with ref, name, arrival." });
      return;
    }
    // Close camera scanner and hide textarea when validation is triggered
    setShowScanner(false);
    setScanComplete(true);
    
    try {
      if ((parsed as any).sig) {
        import("@/lib/hmac").then(async ({ hmacHex }) => {
          const { sig, ...rest } = parsed as any;
          const recomputed = await hmacHex(JSON.stringify(rest), "demo-secret");
          if (recomputed !== sig) {
            setResult({ ok: false, message: "QR signature invalid." });
            return;
          }
          const match = entries.find((e) => e.ref === (parsed as any).ref && e.arrival === (parsed as any).arrival);
          setResult(match ? { ok: true, message: "Booking found and validated.", match } : { ok: false, message: "No matching booking found in the dashboard." });
        });
        return;
      }
    } catch {
      // fall through to simple validation
    }
    const match = entries.find((e) => e.ref === parsed.ref && e.arrival === parsed.arrival);
    if (match) {
      setResult({ ok: true, message: "Booking found and validated.", match });
    } else {
      setResult({ ok: false, message: "No matching booking found in the dashboard." });
    }
  }

  function handleApprove() {
    if (!result?.match) return;
    const updated = entries.map((entry) =>
      entry.ref === result.match!.ref ? { ...entry, status: "Checked-in" } : entry
    );
    setEntries(updated);
    try {
      localStorage.setItem("demoEntries", JSON.stringify(updated));
    } catch {
      // ignore storage errors
    }
    // Update the result to reflect the new status
    const updatedMatch = updated.find((e) => e.ref === result.match!.ref);
    if (updatedMatch) {
      setResult({ ...result, match: updatedMatch });
    }
  }

  function handleReject() {
    if (!result?.match) return;
    const updated = entries.map((entry) =>
      entry.ref === result.match!.ref ? { ...entry, status: "Pending" } : entry
    );
    setEntries(updated);
    try {
      localStorage.setItem("demoEntries", JSON.stringify(updated));
    } catch {
      // ignore storage errors
    }
    // Update the result to reflect the new status
    const updatedMatch = updated.find((e) => e.ref === result.match!.ref);
    if (updatedMatch) {
      setResult({ ...result, match: updatedMatch });
    }
  }

  return (
    <div className="min-h-screen bg-[#D9DED7] text-zinc-900">
      <header className="mx-auto w-full max-w-3xl px-6 py-10">
        <h1 className="text-3xl font-semibold tracking-tight">QR Validator</h1>
        <p className="mt-2 text-sm text-zinc-700">
          {targetRef ? `Target booking ref: ${targetRef}` : "Paste the scanned QR payload to validate against stored entries."}
        </p>
        {targeted && (
          <div className="mt-3 rounded-lg border border-zinc-200 bg-white p-3 text-sm">
            <p className="font-medium">Target booking</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <span className="text-zinc-600">Guest</span><span className="font-medium">{targeted.name}</span>
              <span className="text-zinc-600">Ref</span><span className="font-medium">{targeted.ref}</span>
              <span className="text-zinc-600">Arrival</span><span className="font-medium">{targeted.arrival}</span>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto mb-24 w-full max-w-3xl px-6">
        <div className="rounded-2xl border border-transparent bg-[#F3F1ED] p-6 shadow-sm">
          {showScanner && (
            <Scanner
              onDecoded={async (text) => {
                setInput(text);
                setScanComplete(true);
                setShowScanner(false);
                // Auto-validate and navigate
                try {
                  const parsed = JSON.parse(text);
                  
                  // Load entries if not already loaded
                  let currentEntries = entries;
                  if (currentEntries.length === 0) {
                    try {
                      const raw = localStorage.getItem("demoEntries");
                      currentEntries = raw ? JSON.parse(raw) : [];
                    } catch {
                      currentEntries = [];
                    }
                  }
                  
                  let match: Entry | undefined;
                  
                  // Handle signed QR codes
                  if (parsed.sig) {
                    const { hmacHex } = await import("@/lib/hmac");
                    const { sig, ...rest } = parsed;
                    const recomputed = await hmacHex(JSON.stringify(rest), "demo-secret");
                    if (recomputed === sig) {
                      match = currentEntries.find((e) => e.ref === rest.ref && e.arrival === rest.arrival);
                      if (match) {
                        router.push(`/hotel/booking/${encodeURIComponent(match.ref)}`);
                        return;
                      }
                    }
                  } else {
                    // Simple validation
                    match = currentEntries.find((e) => e.ref === parsed.ref && e.arrival === parsed.arrival);
                    if (match) {
                      router.push(`/hotel/booking/${encodeURIComponent(match.ref)}`);
                      return;
                    }
                  }
                  
                  // If no match found, show error
                  setResult({ ok: false, message: "No matching booking found in the dashboard." });
                } catch {
                  // Invalid QR
                  setResult({ ok: false, message: "Invalid QR payload. Expecting JSON with ref, name, arrival." });
                }
              }}
            />
          )}
          {!scanComplete && (
            <>
              <label className="block text-sm font-medium">Scanned QR payload</label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder='{"ref":"ABC1234","name":"Jane Doe","arrival":"2025-11-06"}'
                className="mt-2 h-28 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </>
          )}
          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={handleValidate}
              disabled={!input || !parsed}
              className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
            >
              Validate
            </button>
          </div>

          {result && (
            <div className={`mt-4 rounded-md border p-4 text-sm ${result.ok ? "border-green-300 bg-green-50" : "border-red-300 bg-red-50"}`}>
              <p className="font-medium text-base">{result.message}</p>
              {result.ok && result.match && (
                <div className="mt-4 space-y-4">
                  <div>
                    <h3 className="text-base font-semibold mb-3">Complete Booking Details</h3>
                    <div className="grid grid-cols-2 gap-4 bg-white rounded-lg border border-zinc-200 p-4">
                      <div>
                        <span className="text-zinc-600 text-sm">Guest Name:</span>
                        <p className="font-medium mt-1">{result.match.name}</p>
                      </div>
                      <div>
                        <span className="text-zinc-600 text-sm">Booking Reference:</span>
                        <p className="font-medium mt-1">{result.match.ref}</p>
                      </div>
                      <div>
                        <span className="text-zinc-600 text-sm">Arrival Date:</span>
                        <p className="font-medium mt-1">{result.match.arrival}</p>
                      </div>
                      <div>
                        <span className="text-zinc-600 text-sm">Status:</span>
                        <p className="mt-1">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            result.match.status === "Checked-in" || result.match.status === "approved" 
                              ? "bg-emerald-100 text-emerald-700" 
                              : result.match.status === "Pending" || result.match.status === "submitted"
                              ? "bg-yellow-100 text-yellow-700"
                              : result.match.status === "Rejected" || result.match.status === "Cancelled" || result.match.status === "No-show"
                              ? "bg-red-100 text-red-700"
                              : "bg-zinc-900 text-white"
                          }`}>
                            {result.match.status}
                          </span>
                        </p>
                      </div>
                      {result.match.email && (
                        <div>
                          <span className="text-zinc-600 text-sm">Email:</span>
                          <p className="font-medium mt-1">{result.match.email}</p>
                        </div>
                      )}
                      {result.match.phone && (
                        <div>
                          <span className="text-zinc-600 text-sm">Phone:</span>
                          <p className="font-medium mt-1">{result.match.phone}</p>
                        </div>
                      )}
                      {result.match.country && (
                        <div>
                          <span className="text-zinc-600 text-sm">Country:</span>
                          <p className="font-medium mt-1">{result.match.country}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-zinc-600 text-sm">Created:</span>
                        <p className="font-medium mt-1">{new Date(result.match.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {result.match.maskedSummary && result.match.idType && (
                    <div className="rounded-lg border border-zinc-200 bg-white p-4">
                      <h4 className="font-semibold mb-2">ID Verification</h4>
                      <div className="space-y-2">
                        <div>
                          <span className="text-zinc-600 text-sm">ID Type:</span>
                          <p className="font-medium mt-1">{result.match.idType}</p>
                        </div>
                        <div>
                          <span className="text-zinc-600 text-sm">Masked ID Number:</span>
                          <p className="font-medium mt-1">{result.match.maskedSummary}</p>
                        </div>
                        {result.match.maskedPreview && (
                          <div className="mt-3">
                            <span className="text-zinc-600 text-sm block mb-2">Masked ID Preview:</span>
                            <div className="rounded border border-zinc-200 bg-zinc-50 p-2">
                              <img
                                src={result.match.maskedPreview}
                                alt={`Masked ID for ${result.match.name}`}
                                className="w-full max-w-md mx-auto rounded object-contain"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleApprove}
                      className="flex-1 rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-zinc-400"
                      disabled={result.match.status === "Checked-in"}
                    >
                      ✓ Approve & Check-in
                    </button>
                    <button
                      onClick={handleReject}
                      className="flex-1 rounded-md bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-zinc-400"
                      disabled={result.match.status === "Pending"}
                    >
                      ✗ Reject (Set to Pending)
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function Scanner({ onDecoded }: { onDecoded: (text: string) => void }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [active, setActive] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        streamRef.current = stream;
        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setActive(true);
        tick();
      } catch {
        setActive(false);
      }
    }

    function tick() {
      if (!videoRef.current || !canvasRef.current) return;
      const v = videoRef.current;
      const c = canvasRef.current;
      const ctx = c.getContext("2d")!;
      c.width = v.videoWidth;
      c.height = v.videoHeight;
      ctx.drawImage(v, 0, 0, c.width, c.height);
      const imageData = ctx.getImageData(0, 0, c.width, c.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (code?.data) {
        onDecoded(code.data);
      } else {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    start();
    return () => {
      cancelAnimationFrame(rafRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [onDecoded]);

  return (
    <div className="mb-4 rounded-md border border-zinc-200 p-3">
      <p className="text-sm font-medium">Camera Scanner</p>
      {!active && <p className="mt-1 text-xs text-zinc-600">Allow camera to scan the guest’s QR.</p>}
      <video ref={videoRef} className="mt-2 w-full rounded" />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
