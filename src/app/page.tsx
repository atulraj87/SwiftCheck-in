"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { validateIdContent } from "@/lib/idValidation";

type MaskedPreviewResult = {
  dataUrl: string;
  summary?: string;
};

export default function Home() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-zinc-600">Loading...</div>}>
      <Content />
    </Suspense>
  );
}

function Content() {
  const router = useRouter();
  const params = useSearchParams();
  const [fullName, setFullName] = useState("");
  const [bookingRef, setBookingRef] = useState("");
  const [arrival, setArrival] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [idType, setIdType] = useState("");
  const [agree, setAgree] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string>("");
  const [maskedPreview, setMaskedPreview] = useState<string>("");
  const [maskedSummary, setMaskedSummary] = useState<string>("");
  const [showCamera, setShowCamera] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (params.get("prefill") === "1") {
      setFullName(params.get("name") ?? "");
      setBookingRef(params.get("ref") ?? "");
      setArrival(params.get("arrival") ?? "");
      setEmail(params.get("email") ?? "");
      setPhone(params.get("phone") ?? "");
      setCountry(params.get("country") ?? "");
    }
  }, [params]);

  const countryToIdTypes: Record<string, string[]> = {
    India: ["Aadhaar", "Passport", "Driving Licence"],
    USA: ["Passport", "Driver License", "State ID"],
    UAE: ["Emirates ID", "Passport", "Driving Licence"],
    UK: ["Passport", "Driving Licence", "BRP"],
  };
  const idOptions = country ? countryToIdTypes[country] ?? ["Passport"] : [];

  function resetIdArtifacts() {
    setFile(null);
    setMaskedPreview("");
    setMaskedSummary("");
    setFileError("");
    setShowCamera(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    sessionStorage.removeItem("uploadedIdName");
    sessionStorage.removeItem("maskedIdPreview");
    sessionStorage.removeItem("maskedIdSummary");
  }

  async function processSelectedFile(selected: File | null) {
    if (!selected) return;
    if (!idType) {
      setFileError("Select an ID type before uploading.");
      return;
    }
    const allowed = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowed.includes(selected.type)) {
      setFileError("Only JPG, PNG or PDF files are allowed.");
      resetIdArtifacts();
      return;
    }
    setFileError("");
    setIsProcessing(true);
    try {
      const validation = await validateIdContent(selected, idType);
      if (!validation.ok) {
        setFileError(validation.message || "The file content does not match the selected ID type. For demo, you can still proceed.");
        // For demo: allow proceeding even if validation fails, but still create masked preview
        try {
          const masked = await createMaskedPreview(selected, idType, undefined);
          setFile(selected);
          setMaskedPreview(masked.dataUrl);
          setMaskedSummary(masked.summary ?? "ID captured (validation skipped for demo)");
          sessionStorage.setItem("uploadedIdName", selected.name);
          sessionStorage.setItem("maskedIdPreview", masked.dataUrl);
          sessionStorage.setItem("maskedIdSummary", masked.summary ?? "ID captured");
          setShowCamera(false);
          setIsProcessing(false);
          return;
        } catch (maskError) {
          console.error(maskError);
          setFileError("Could not process the document. Please try a clearer scan or PDF.");
          resetIdArtifacts();
          setIsProcessing(false);
          return;
        }
      }
      const masked = await createMaskedPreview(selected, idType, validation.extractedText);
      setFile(selected);
      setMaskedPreview(masked.dataUrl);
      setMaskedSummary(masked.summary ?? "");
      sessionStorage.setItem("uploadedIdName", selected.name);
      sessionStorage.setItem("maskedIdPreview", masked.dataUrl);
      sessionStorage.setItem("maskedIdSummary", masked.summary ?? "");
      setShowCamera(false);
    } catch (error) {
      console.error(error);
      setFileError("Could not process the document. Please try a clearer scan or PDF.");
      resetIdArtifacts();
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agree) {
      alert("Please accept the policies to continue.");
      return;
    }
    if (!file || !maskedPreview) {
      setFileError("Upload and validate an ID before continuing.");
      return;
    }

    const searchParams = new URLSearchParams({
      name: fullName,
      ref: bookingRef,
      arrival,
    });

    sessionStorage.setItem("uploadedIdName", file.name);

    try {
      const raw = localStorage.getItem("demoEntries");
      const entries = raw ? JSON.parse(raw) : [];
      entries.unshift({
        name: fullName,
        ref: bookingRef,
        arrival,
        email,
        phone,
        country,
        idType,
        maskedPreview,
        maskedSummary,
        uploadedIdName: file.name,
        status: "submitted",
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem("demoEntries", JSON.stringify(entries));
      localStorage.setItem("demoSendStatus", JSON.stringify({ sentEmail: true, sentWhatsApp: true }));
    } catch {
      // demo-only storage errors can be ignored
    }

    router.push(`/confirmation?${searchParams.toString()}`);
  }

  return (
    <div className="min-h-screen bg-[#D9DED7] text-zinc-900">
      <header className="mx-auto w-full max-w-3xl px-6 py-10">
        <h1 className="text-3xl font-semibold tracking-tight">Hotel Pre-Check-In (Demo)</h1>
        <p className="mt-2 text-sm text-zinc-700">Skip the desk. Finish essentials before you arrive.</p>
        <ol className="mt-4 flex flex-wrap items-center gap-2 text-xs text-zinc-700">
          <li className={`rounded-full px-2 py-1 ${fullName && email && phone && bookingRef && arrival && country ? "bg-zinc-900 text-white" : "bg-zinc-400/60"}`}>1 • Details</li>
          <li className={`rounded-full px-2 py-1 ${agree ? "bg-zinc-900 text-white" : "bg-zinc-400/60"}`}>2 • Policies</li>
          <li className="rounded-full bg-zinc-900 px-2 py-1 text-white">3 • Package</li>
          <li className={`rounded-full px-2 py-1 ${maskedPreview ? "bg-zinc-900 text-white" : "bg-zinc-400/60"}`}>4 • ID</li>
        </ol>
      </header>

      <main className="mx-auto mb-24 w-full max-w-3xl px-6">
        <form onSubmit={handleSubmit} className="rounded-2xl border border-transparent bg-[#F3F1ED] p-6 shadow-sm">
          <section>
            <h2 className="text-lg font-medium">Booking details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium">Full name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Doe"
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Phone</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 555 123 4567"
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Booking reference</label>
                <input
                  type="text"
                  required
                  value={bookingRef}
                  onChange={(e) => setBookingRef(e.target.value)}
                  placeholder="ABC1234"
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Arrival date</label>
                <input
                  type="date"
                  required
                  min={today}
                  value={arrival}
                  onChange={(e) => setArrival(e.target.value)}
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Destination country</label>
                <select
                  required
                  value={country}
                  onChange={(e) => {
                    setCountry(e.target.value);
                    setIdType("");
                    resetIdArtifacts();
                  }}
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-900"
                >
                  <option value="" disabled>
                    Select country
                  </option>
                  {Object.keys(countryToIdTypes).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-lg font-medium">Policies</h2>
            <div className="mt-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-700">
              <ul className="list-disc pl-5">
                <li>Check-in from 2 PM; Check-out by 11 AM.</li>
                <li>No smoking inside rooms. A cleaning fee may apply.</li>
                <li>Quiet hours 10 PM – 7 AM.</li>
                <li>Government-issued ID required upon arrival.</li>
              </ul>
            </div>
            <label className="mt-4 flex items-start gap-3 text-sm">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
              <span>I have read and accept the hotel policies and terms.</span>
            </label>
          </section>

          <section className="mt-8">
            <h2 className="text-lg font-medium">Package inclusions & exclusions</h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-700">
                <p className="font-medium">Inclusions</p>
                <ul className="mt-2 list-disc pl-5">
                  <li>Daily breakfast for 2</li>
                  <li>Complimentary bottled water</li>
                  <li>Late checkout (subject to availability)</li>
                </ul>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-700">
                <p className="font-medium">Exclusions</p>
                <ul className="mt-2 list-disc pl-5">
                  <li>Airport transfers</li>
                  <li>Mini-bar consumption</li>
                  <li>Spa & activities</li>
                  <li>Tourist taxes (if applicable)</li>
                </ul>
              </div>
            </div>
            {bookingRef && (
              <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-4">
                <p className="text-sm font-medium text-zinc-900">📶 Your Wi-Fi credentials</p>
                <div className="mt-2 rounded-md bg-zinc-50 px-3 py-2.5 font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-zinc-200 pb-1.5">
                    <span className="text-zinc-600">Network:</span>
                    <span className="font-semibold text-zinc-900">NOVATAL-{bookingRef.slice(-4).padStart(4, "0")}</span>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="text-zinc-600">Password:</span>
                    <span className="font-semibold text-zinc-900">{bookingRef.toUpperCase()}2024</span>
                  </div>
                </div>
              </div>
            )}
          </section>

          <section className="mt-8">
            <h2 className="text-lg font-medium">Quick support</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-zinc-200 bg-white p-3 text-sm">
                <p className="font-medium text-zinc-900">🔑 Lost or locked out?</p>
                <p className="mt-2 text-xs font-medium text-zinc-900">Dial: <span className="font-mono">Ext. 101</span></p>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-white p-3 text-sm">
                <p className="font-medium text-zinc-900">🌡️ Room temperature issues?</p>
                <p className="mt-2 text-xs font-medium text-zinc-900">Dial: <span className="font-mono">Ext. 205</span></p>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-white p-3 text-sm">
                <p className="font-medium text-zinc-900">📺 TV or remote not working?</p>
                <p className="mt-2 text-xs font-medium text-zinc-900">Dial: <span className="font-mono">Ext. 205</span></p>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-white p-3 text-sm">
                <p className="font-medium text-zinc-900">🛏️ Extra towels or amenities?</p>
                <p className="mt-2 text-xs font-medium text-zinc-900">Dial: <span className="font-mono">Ext. 301</span></p>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-white p-3 text-sm">
                <p className="font-medium text-zinc-900">🚪 Late checkout request?</p>
                <p className="mt-2 text-xs font-medium text-zinc-900">Dial: <span className="font-mono">Ext. 101</span></p>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-white p-3 text-sm">
                <p className="font-medium text-zinc-900">🍽️ Room service or dining?</p>
                <p className="mt-2 text-xs font-medium text-zinc-900">Dial: <span className="font-mono">Ext. 401</span></p>
              </div>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-lg font-medium">Upload ID (demo)</h2>
            <p className="mt-1 text-sm text-zinc-600">Select an acceptable ID type and upload or capture it. Only the masked copy is stored.</p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium">ID type</label>
                <select
                  required
                  value={idType}
                  onChange={(e) => {
                    setIdType(e.target.value);
                    resetIdArtifacts();
                  }}
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-900"
                >
                  <option value="" disabled>
                    Select ID
                  </option>
                  {idOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="block text-sm font-medium">Upload or capture</label>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="inline-flex cursor-pointer items-center rounded-md bg-white px-4 py-2 text-sm font-medium text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 hover:bg-zinc-50">
                    Choose file
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,application/pdf"
                      className="sr-only"
                      onChange={(e) => processSelectedFile(e.target.files?.[0] ?? null)}
                    />
                  </label>
                  <button
                    type="button"
                    className="inline-flex items-center rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-800 hover:bg-zinc-100"
                    onClick={() => {
                      if (!idType) {
                        setFileError("Select an ID type before using the camera.");
                        return;
                      }
                      setShowCamera((prev) => !prev);
                    }}
                  >
                    {showCamera ? "Hide Camera" : "Use Camera"}
                  </button>
                  <span className="text-sm text-zinc-700">{file ? file.name : "No file chosen"}</span>
                </div>
                {isProcessing && (
                  <p className="mt-2 text-xs text-zinc-600">Processing ID... Please wait.</p>
                )}
                {fileError && <p className="mt-2 text-xs text-red-600">{fileError}</p>}
              </div>
            </div>

            {showCamera && !isProcessing && (
              <CameraCapture
                onCapture={async (captured) => {
                  await processSelectedFile(captured);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
                onClose={() => setShowCamera(false)}
              />
            )}

            {maskedPreview && (
              <div className="mt-4 space-y-2 rounded-lg border border-zinc-200 bg-white p-3">
                <div className="overflow-hidden rounded border border-zinc-100 bg-zinc-50">
                  <img src={maskedPreview} alt="Masked ID preview" className="w-full object-contain" />
                </div>
                <p className="text-xs text-zinc-600">
                  {maskedSummary
                    ? `Masking applied: ${maskedSummary}`
                    : "Sensitive details automatically masked. Only this copy is shared with the hotel."}
          </p>
        </div>
            )}
          </section>

          <div className="mt-8 flex items-center justify-end gap-3">
            <button
              type="submit"
              className="inline-flex items-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
              disabled={
                isProcessing ||
                !fullName ||
                !email ||
                !phone ||
                !bookingRef ||
                !arrival ||
                !country ||
                !idType ||
                !maskedPreview ||
                !agree
              }
            >
              {isProcessing ? "Processing..." : "Submit & Get Confirmation"}
            </button>
        </div>
        </form>

        <p className="mt-6 text-center text-xs text-zinc-500">
          Demo only — original IDs never leave your browser. A masked copy is securely shared with the hotel.
        </p>
      </main>
    </div>
  );
}

type CameraCaptureProps = {
  onCapture: (file: File) => Promise<void> | void;
  onClose: () => void;
};

function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let stream: MediaStream | null = null;

    async function start() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("Camera access is not supported in this browser.");
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch {
        setError("Camera access was blocked. Please allow camera permissions or upload a file instead.");
      }
    }

    start();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const capture = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      async (blob) => {
        if (!blob) return;
        const capturedFile = new File([blob], `captured-id-${Date.now()}.jpg`, { type: "image/jpeg" });
        await onCapture(capturedFile);
        onClose();
      },
      "image/jpeg",
      0.9
    );
  };

  return (
    <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-zinc-800">Capture ID using your camera</p>
        <button type="button" className="text-xs text-zinc-500 hover:text-zinc-800" onClick={onClose}>
          Close
        </button>
      </div>
      {error ? (
        <p className="mt-2 text-xs text-red-600">{error}</p>
      ) : (
        <>
          <video ref={videoRef} className="mt-3 w-full rounded bg-black/20" playsInline muted />
          <button
            type="button"
            className="mt-3 inline-flex items-center rounded-md bg-[#5E0F8B] px-4 py-2 text-sm font-medium text-white hover:bg-[#4A0B6E]"
            onClick={capture}
          >
            Capture & Use Photo
          </button>
        </>
      )}
    </div>
  );
}

async function canvasFromFile(file: File): Promise<HTMLCanvasElement> {
  const isPdf = file.type === "application/pdf";
  if (isPdf) {
    const pdfjs: any = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions = pdfjs.GlobalWorkerOptions || {};
    if (!pdfjs.GlobalWorkerOptions.workerSrc) {
      pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
    }
    const buffer = await file.arrayBuffer();
    const doc = await pdfjs.getDocument({ data: buffer }).promise;
    const page = await doc.getPage(1);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Canvas not supported");
    }
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: ctx, viewport }).promise;
    return canvas;
  }

  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Canvas not supported");
    }
    const maxDim = 1600;
    const scale = Math.min(1, maxDim / Math.max(image.width, image.height));
    canvas.width = Math.floor(image.width * scale);
    canvas.height = Math.floor(image.height * scale);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function deriveMaskedSummary(idType: string, text?: string): string | undefined {
  if (!text) return undefined;
  const cleaned = text.replace(/\s+/g, " ");
  if (idType === "Aadhaar") {
    // Try multiple patterns: with spaces, without spaces, or any 12-digit sequence
    const patterns = [
      /\b\d{4}\s+\d{4}\s+\d{4}\b/,  // 1234 5678 9012
      /\b\d{4}\s?\d{4}\s?\d{4}\b/,  // 1234 5678 9012 or 123456789012
      /\b\d{12}\b/,                  // 123456789012 (no spaces)
      /\d{4}[\s-]?\d{4}[\s-]?\d{4}/, // with optional dashes
    ];
    
    for (const pattern of patterns) {
      const match = cleaned.match(pattern);
      if (match) {
        const digits = match[0].replace(/[\s-]/g, "");
        if (digits.length === 12) {
          return `XXXX XXXX ${digits.slice(-4)}`;
        }
      }
    }
    return "XXXX XXXX XXXX";
  }
  if (idType === "Passport") {
    const match = cleaned.match(/\b[A-Z][0-9]{7}\b/);
    if (match) {
      const value = match[0];
      return `${value[0]}XXXXXXX`;
    }
    return "PXXXXXXX";
  }
  if (idType === "Emirates ID") {
    const match = cleaned.match(/\b784-\d{4}-\d{7}-\d\b/);
    if (match) {
      const parts = match[0].split("-");
      return `784-XXXX-XXXXXXX-${parts[3]}`;
    }
    return "784-XXXX-XXXXXXX-X";
  }
  if (idType === "Driving Licence" || idType === "Driver License") {
    const match = cleaned.match(/\b[A-Z0-9]{8,}\b/);
    if (match) {
      const value = match[0];
      return `${"X".repeat(Math.max(4, value.length - 4))}${value.slice(-4)}`;
    }
    return "XXXX XXXX";
  }
  if (idType === "State ID") {
    const match = cleaned.match(/\b[A-Z0-9]{6,}\b/);
    if (match) {
      const value = match[0];
      return `${"X".repeat(Math.max(4, value.length - 4))}${value.slice(-4)}`;
    }
    return "XXXX XXXX";
  }
  if (idType === "BRP") {
    const match = cleaned.match(/\b[A-Z]{2}\d{7}\b/);
    if (match) {
      const value = match[0];
      return `${value.slice(0, 2)}XXXXXXX`;
    }
    return "XX XXXXXXX";
  }
  return undefined;
}

function extractIdNumber(idType: string, text?: string): { number: string; masked: string } | null {
  if (!text) return null;
  const cleaned = text.replace(/\s+/g, " ");
  if (idType === "Aadhaar") {
    // Try multiple patterns: with spaces, without spaces, or any 12-digit sequence
    const patterns = [
      /\b\d{4}\s+\d{4}\s+\d{4}\b/,  // 1234 5678 9012
      /\b\d{4}\s?\d{4}\s?\d{4}\b/,  // 1234 5678 9012 or 123456789012
      /\b\d{12}\b/,                  // 123456789012 (no spaces)
      /\d{4}[\s-]?\d{4}[\s-]?\d{4}/, // with optional dashes
    ];
    
    for (const pattern of patterns) {
      const match = cleaned.match(pattern);
      if (match) {
        const digits = match[0].replace(/[\s-]/g, "");
        if (digits.length === 12) {
          return { number: digits, masked: `XXXX XXXX ${digits.slice(-4)}` };
        }
      }
    }
  }
  if (idType === "Passport") {
    const match = cleaned.match(/\b[A-Z][0-9]{7}\b/);
    if (match) {
      const value = match[0];
      return { number: value, masked: `${value[0]}XXXXXXX` };
    }
  }
  if (idType === "Emirates ID") {
    const match = cleaned.match(/\b784-\d{4}-\d{7}-\d\b/);
    if (match) {
      const parts = match[0].split("-");
      return { number: match[0], masked: `784-XXXX-XXXXXXX-${parts[3]}` };
    }
  }
  return null;
}

async function createMaskedPreview(file: File, idType: string, extractedText?: string): Promise<MaskedPreviewResult> {
  const sourceCanvas = await canvasFromFile(file);
  const canvas = document.createElement("canvas");
  canvas.width = sourceCanvas.width;
  canvas.height = sourceCanvas.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas not supported");
  }
  ctx.drawImage(sourceCanvas, 0, 0);

  const summary = deriveMaskedSummary(idType, extractedText);
  const idNumberInfo = extractIdNumber(idType, extractedText);

  // Mask the ID number area (typically in center/middle area of ID card)
  // For Aadhaar-style masking: mask the number area and show masked version
  if (idNumberInfo && idType === "Aadhaar") {
    // Aadhaar number is typically in the center area
    const maskX = canvas.width * 0.15;
    const maskY = canvas.height * 0.4;
    const maskWidth = canvas.width * 0.7;
    const maskHeight = canvas.height * 0.12;
    
    // Draw white background over the number area
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(maskX, maskY, maskWidth, maskHeight);
    
    // Draw the masked number (XXXX XXXX last4)
    ctx.fillStyle = "#000000";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const fontSize = Math.max(24, Math.round(canvas.width * 0.06));
    ctx.font = `bold ${fontSize}px "Segoe UI", Arial, sans-serif`;
    ctx.fillText(idNumberInfo.masked, canvas.width / 2, maskY + maskHeight / 2);
  } else if (idNumberInfo) {
    // For other ID types, mask the number area similarly
    const maskX = canvas.width * 0.15;
    const maskY = canvas.height * 0.4;
    const maskWidth = canvas.width * 0.7;
    const maskHeight = canvas.height * 0.12;
    
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(maskX, maskY, maskWidth, maskHeight);
    
    ctx.fillStyle = "#000000";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const fontSize = Math.max(20, Math.round(canvas.width * 0.05));
    ctx.font = `bold ${fontSize}px "Segoe UI", Arial, sans-serif`;
    ctx.fillText(idNumberInfo.masked, canvas.width / 2, maskY + maskHeight / 2);
  } else {
    // Fallback: generic overlay if number not found
    const overlayWidth = canvas.width * 0.75;
    const overlayHeight = canvas.height * 0.22;
    const overlayX = (canvas.width - overlayWidth) / 2;
    const overlayY = canvas.height * 0.35;

    ctx.fillStyle = "rgba(0, 0, 0, 0.58)";
    ctx.fillRect(overlayX, overlayY, overlayWidth, overlayHeight);

    ctx.strokeStyle = "rgba(255,255,255,0.6)";
    ctx.lineWidth = Math.max(2, canvas.width * 0.006);
    ctx.strokeRect(overlayX, overlayY, overlayWidth, overlayHeight);

    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    const primarySize = Math.max(18, Math.round(canvas.width * 0.045));
    ctx.font = `${primarySize}px "Segoe UI", sans-serif`;
    ctx.fillText(summary ?? "Sensitive details masked", canvas.width / 2, overlayY + overlayHeight / 2);
  }

  // Add watermark stripe at bottom
  const stripeHeight = Math.max(40, Math.round(canvas.height * 0.12));
  ctx.fillStyle = "rgba(46, 62, 52, 0.85)";
  ctx.fillRect(0, canvas.height - stripeHeight, canvas.width, stripeHeight);

  ctx.fillStyle = "#F3F1ED";
  ctx.font = `${Math.max(16, Math.round(canvas.width * 0.035))}px "Segoe UI", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Masked Copy — For Hotel Verification Only", canvas.width / 2, canvas.height - stripeHeight / 2);

  return {
    dataUrl: canvas.toDataURL("image/jpeg", 0.85),
    summary,
  };
}
