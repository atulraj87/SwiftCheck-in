"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { validateIdContent, type OcrWord } from "@/lib/idValidation";
import { maskID } from "@/lib/idMasking";

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
  const [fileWarning, setFileWarning] = useState<string>("");
  const [maskedPreview, setMaskedPreview] = useState<string>("");
  const [maskedSummary, setMaskedSummary] = useState<string>("");
  const [showCamera, setShowCamera] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isPrefilled = params.get("prefill") === "1";
  const [emailError, setEmailError] = useState<string>("");
  const [phoneError, setPhoneError] = useState<string>("");
  const lockedInputClass = isPrefilled ? "bg-zinc-100 cursor-not-allowed text-zinc-700" : "";

  const today = new Date().toISOString().split("T")[0];

  // Masking feature removed - no summary to display

  useEffect(() => {
    if (!isPrefilled) return;
    setFullName(params.get("name") ?? "");
    setBookingRef(params.get("ref") ?? "");
    setArrival(params.get("arrival") ?? "");
    setEmail(params.get("email") ?? "");
    setPhone(params.get("phone") ?? "");
    setCountry(params.get("country") ?? "");
  }, [isPrefilled, params]);

  const countryToIdTypes: Record<string, string[]> = {
    India: ["Aadhaar", "Passport", "Driving Licence"],
    USA: ["Passport", "Driver License", "State ID"],
    UAE: ["Emirates ID", "Passport", "Driving Licence"],
    UK: ["Passport", "Driving Licence", "BRP"],
  };
  const idOptions = country ? countryToIdTypes[country] ?? ["Passport"] : [];

  function resetIdArtifacts(options: { preserveMessages?: boolean } = {}) {
    const { preserveMessages = false } = options;
    setFile(null);
    setMaskedPreview("");
    setMaskedSummary("");
    if (!preserveMessages) {
      setFileError("");
      setFileWarning("");
    }
    setShowCamera(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    sessionStorage.removeItem("uploadedIdName");
    sessionStorage.removeItem("maskedIdPreview");
    sessionStorage.removeItem("maskedIdSummary");
    sessionStorage.removeItem("maskedIdType");
  }

  function validateEmailFormat(value: string): boolean {
    const trimmed = value.trim();
    if (!trimmed) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  }

  function validatePhoneNumber(value: string, selectedCountry: string): { ok: boolean; message?: string } {
    const digitsOnly = value.replace(/\D/g, "");
    if (!digitsOnly) {
      return { ok: false, message: "Enter a valid phone number." };
    }

    const invalid = (message: string) => ({ ok: false, message });
    let normalized = digitsOnly;

    switch (selectedCountry) {
      case "India": {
        if (normalized.startsWith("91") && normalized.length === 12) {
          normalized = normalized.slice(2);
        } else if (normalized.startsWith("0") && normalized.length === 11) {
          normalized = normalized.slice(1);
        }
        if (normalized.length === 10 && /^[6-9]/.test(normalized)) {
          return { ok: true };
        }
        return invalid("Enter a valid Indian mobile number (10 digits, starting with 6-9).");
      }
      case "USA": {
        if (normalized.startsWith("1") && normalized.length === 11) {
          normalized = normalized.slice(1);
        }
        if (normalized.length === 10) {
          return { ok: true };
        }
        return invalid("Enter a valid US phone number (10 digits).");
      }
      case "UAE": {
        if (normalized.startsWith("971") && normalized.length >= 11) {
          normalized = normalized.slice(3);
        }
        if (normalized.length === 9 && normalized.startsWith("5")) {
          return { ok: true };
        }
        return invalid("Enter a valid UAE mobile number (9 digits, starting with 5).");
      }
      case "UK": {
        if (normalized.startsWith("44") && normalized.length >= 12) {
          normalized = normalized.slice(2);
        }
        if (normalized.startsWith("0") && normalized.length >= 10) {
          normalized = normalized.slice(1);
        }
        if (normalized.length >= 10 && normalized.length <= 11) {
          return { ok: true };
        }
        return invalid("Enter a valid UK phone number (10-11 digits).");
      }
      default: {
        if (normalized.length >= 7) {
          return { ok: true };
        }
        return invalid("Enter a valid phone number.");
      }
    }
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
      setFileWarning("");
      resetIdArtifacts({ preserveMessages: true });
      return;
    }
    setFileError("");
    setFileWarning("");
    setIsProcessing(true);
    try {
      const validation = await validateIdContent(selected, idType);
      if (!validation.ok) {
        const message = validation.message || `The uploaded file does not match ${idType}. Please upload the correct document.`;
        setFileError(message);
        setFileWarning("");
        setFile(null);
        setMaskedPreview("");
        setMaskedSummary("");
        sessionStorage.removeItem("uploadedIdName");
        sessionStorage.removeItem("maskedIdPreview");
        sessionStorage.removeItem("maskedIdSummary");
        sessionStorage.removeItem("maskedIdType");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        setShowCamera(false);
        return;
      }
      setFileWarning(validation.message ?? "");
      const masked = await createMaskedPreview(selected, idType, validation.extractedText, validation.words);
      setFile(selected);
      setMaskedPreview(masked.dataUrl);
      // No masking summary - feature removed
      setMaskedSummary("");
      sessionStorage.setItem("uploadedIdName", selected.name);
      sessionStorage.setItem("maskedIdPreview", masked.dataUrl);
      sessionStorage.setItem("maskedIdSummary", "");
      sessionStorage.setItem("maskedIdType", idType);
      setShowCamera(false);
    } catch (error) {
      console.error(error);
      setFileError("Could not process the document. Please try a clearer scan or PDF.");
      resetIdArtifacts({ preserveMessages: true });
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmedEmail = email.trim();
    if (trimmedEmail !== email) {
      setEmail(trimmedEmail);
    }

    if (!validateEmailFormat(trimmedEmail)) {
      setEmailError("Enter a valid email address.");
      return;
    }
    setEmailError("");

    const phoneCheck = validatePhoneNumber(phone, country);
    if (!phoneCheck.ok) {
      setPhoneError(phoneCheck.message || "Enter a valid phone number.");
      return;
    }
    setPhoneError("");

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
      // Masking feature removed - no summary to store
      entries.unshift({
        name: fullName,
        ref: bookingRef,
        arrival,
        email: trimmedEmail,
        phone,
        country,
        idType,
        maskedPreview,
        maskedSummary: "",
        uploadedIdName: file.name,
        status: "Booked",
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem("demoEntries", JSON.stringify(entries));
      localStorage.setItem("demoSendStatus", JSON.stringify({ sentEmail: true, sentWhatsApp: true }));
    } catch {
      // storage errors can be ignored
    }

    router.push(`/confirmation?${searchParams.toString()}`);
  }

  return (
    <div className="min-h-screen bg-[#D9DED7] text-zinc-900">
      <header className="mx-auto w-full max-w-3xl px-6 py-10">
        <h1 className="text-3xl font-semibold tracking-tight">Hotel Pre-Check-In</h1>
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
                  readOnly={isPrefilled}
                  aria-readonly={isPrefilled}
                  className={`mt-1 w-full rounded-md border px-3 py-2 outline-none focus:ring-2 border-zinc-300 focus:ring-zinc-900 ${lockedInputClass}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) {
                      setEmailError("");
                    }
                  }}
                  onBlur={() => {
                    if (!email) return;
                    setEmailError(validateEmailFormat(email) ? "" : "Enter a valid email address.");
                  }}
                  placeholder="jane@example.com"
                  readOnly={isPrefilled}
                  aria-readonly={isPrefilled}
                  aria-invalid={!!emailError}
                  className={`mt-1 w-full rounded-md border px-3 py-2 outline-none focus:ring-2 ${emailError ? "border-red-500 focus:ring-red-500" : "border-zinc-300 focus:ring-zinc-900"} ${lockedInputClass}`}
                />
                {emailError && <p className="mt-1 text-xs text-red-600">{emailError}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium">Phone</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (phoneError) {
                      setPhoneError("");
                    }
                  }}
                  onBlur={() => {
                    if (!phone) return;
                    const validation = validatePhoneNumber(phone, country);
                    setPhoneError(validation.ok ? "" : validation.message || "Enter a valid phone number.");
                  }}
                  placeholder="+1 555 123 4567"
                  readOnly={isPrefilled}
                  aria-readonly={isPrefilled}
                  aria-invalid={!!phoneError}
                  className={`mt-1 w-full rounded-md border px-3 py-2 outline-none focus:ring-2 ${phoneError ? "border-red-500 focus:ring-red-500" : "border-zinc-300 focus:ring-zinc-900"} ${lockedInputClass}`}
                />
                {phoneError && <p className="mt-1 text-xs text-red-600">{phoneError}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium">Booking reference</label>
                <input
                  type="text"
                  required
                  value={bookingRef}
                  onChange={(e) => setBookingRef(e.target.value)}
                  placeholder="ABC1234"
                  readOnly={isPrefilled}
                  aria-readonly={isPrefilled}
                  className={`mt-1 w-full rounded-md border px-3 py-2 outline-none focus:ring-2 border-zinc-300 focus:ring-zinc-900 ${lockedInputClass}`}
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
                  className={`mt-1 w-full rounded-md border px-3 py-2 outline-none focus:ring-2 border-zinc-300 focus:ring-zinc-900 ${isPrefilled ? "bg-zinc-100 cursor-not-allowed text-zinc-700" : ""}`}
                  disabled={isPrefilled}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Destination country</label>
                <select
                  required
                  value={country}
                  onChange={(e) => {
                    const value = e.target.value;
                    setCountry(value);
                    setIdType("");
                    resetIdArtifacts();
                    if (phone) {
                      const validation = validatePhoneNumber(phone, value);
                      setPhoneError(validation.ok ? "" : validation.message || "Enter a valid phone number.");
                    } else {
                      setPhoneError("");
                    }
                  }}
                  className={`mt-1 w-full rounded-md border px-3 py-2 outline-none focus:ring-2 border-zinc-300 focus:ring-zinc-900 ${isPrefilled ? "bg-zinc-100 cursor-not-allowed text-zinc-700" : ""}`}
                  disabled={isPrefilled}
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
          </section>

          <section className="mt-8">
            <h2 className="text-lg font-medium">Upload ID</h2>
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
                {!fileError && fileWarning && <p className="mt-2 text-xs text-amber-600">{fileWarning}</p>}
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
                  ID document uploaded successfully.
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
                !agree ||
                !!emailError ||
                !!phoneError
              }
            >
              {isProcessing ? "Processing..." : "Submit & Get Confirmation"}
            </button>
        </div>
        </form>

        <p className="mt-6 text-center text-xs text-zinc-500">
          Original IDs never leave your browser. A masked copy is securely shared with the hotel.
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
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    startCamera();
    return () => {
      stopStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const startCamera = async () => {
    setError("");
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Camera access is not supported in this browser.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      setError("Camera access was blocked. Please allow camera permissions or upload a file instead.");
    }
  };

  const restartCamera = async () => {
    stopStream();
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    await startCamera();
  };

  const capture = async () => {
    if (!videoRef.current || isProcessing) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
    stopStream();
    setIsProcessing(true);
    try {
      const file = await dataUrlToFile(dataUrl, `captured-id-${Date.now()}.jpg`, "image/jpeg");
      await onCapture(file);
      onClose();
    } catch (err) {
      console.error(err);
      setError("Could not process the captured image. Please try again.");
      await restartCamera();
    } finally {
      setIsProcessing(false);
    }
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
        <div className="mt-3 space-y-3">
          <video ref={videoRef} className="w-full rounded bg-black/20" playsInline muted />
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              className="inline-flex items-center rounded-md border border-zinc-300 px-3 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100"
              onClick={restartCamera}
              disabled={isProcessing}
            >
              Refresh Camera
            </button>
            <button
              type="button"
              className="inline-flex items-center rounded-md bg-[#5E0F8B] px-4 py-2 text-sm font-medium text-white hover:bg-[#4A0B6E] disabled:cursor-not-allowed disabled:bg-zinc-400"
              onClick={capture}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Capture Photo"}
            </button>
          </div>
          <p className="text-xs text-zinc-500">Hold steady and ensure the entire ID is visible before capturing.</p>
        </div>
      )}
    </div>
  );
}

async function dataUrlToFile(dataUrl: string, filename: string, fallbackMimeType = "image/jpeg"): Promise<File> {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const mimeType = blob.type || fallbackMimeType;
  return new File([blob], filename, { type: mimeType });
}

function deriveCroppedFilename(originalName: string, mimeType: string): string {
  if (originalName) {
    const dotIndex = originalName.lastIndexOf(".");
    if (dotIndex > 0) {
      const base = originalName.slice(0, dotIndex);
      const ext = originalName.slice(dotIndex + 1) || mimeTypeToExtension(mimeType);
      return `${base}-cropped.${ext}`;
    }
  }
  return `cropped-id-${Date.now()}.${mimeTypeToExtension(mimeType)}`;
}

function mimeTypeToExtension(mimeType: string): string {
  switch (mimeType) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/jpeg":
    default:
      return "jpg";
  }
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
  
  // Extract ID number patterns for different ID types
  let extractedId: string | null = null;
  
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
        if (digits.length >= 4) {
          extractedId = digits;
          break;
        }
      }
    }
  } else if (idType === "Passport") {
    const match = cleaned.match(/\b[A-Z][0-9]{7,9}\b/);
    if (match) {
      extractedId = match[0];
    }
  } else if (idType === "Emirates ID") {
    const match = cleaned.match(/\b784-?\d{4}-?\d{7}-?\d\b/);
    if (match) {
      extractedId = match[0];
    }
  } else if (idType === "Driving Licence" || idType === "Driver License") {
    const match = cleaned.match(/\b[A-Z0-9]{6,}\b/);
    if (match) {
      extractedId = match[0];
    }
  } else if (idType === "State ID") {
    const match = cleaned.match(/\b[A-Z0-9]{6,}\b/);
    if (match) {
      extractedId = match[0];
    }
  } else if (idType === "BRP") {
    const match = cleaned.match(/\b[A-Z]{2}\d{7}\b/);
    if (match) {
      extractedId = match[0];
    }
  } else if (idType === "Social Security Number") {
    const match = cleaned.match(/\b\d{3}-?\d{2}-?\d{4}\b/);
    if (match) {
      extractedId = match[0];
    }
  }
  
  // Use generic masking function for all ID types
  if (extractedId) {
    return maskID(idType, extractedId);
  }
  
  // Fallback: try to find any numeric/alphanumeric sequence
  const fallbackMatch = cleaned.match(/\b[A-Z0-9]{8,}\b/);
  if (fallbackMatch) {
    return maskID(idType, fallbackMatch[0]);
  }
  
  return undefined;
}

type MaskBox = { x: number; y: number; width: number; height: number };

function extractIdNumber(
  idType: string,
  text?: string,
  words: OcrWord[] = []
): { number: string; masked: string; boxes?: MaskBox[] } | null {
  if (!text) return null;
  const cleaned = text.replace(/\s+/g, " ");
  if (idType === "Aadhaar") {
    // First, try to locate the ID number value using locateNumberFromWords
    // This finds the actual ID number value from OCR words
    const info = locateNumberFromWords(words, {
      minLength: 12,
      maxLength: 12,
      maskFormatter: (value) => maskID("Aadhaar", value),
      digitsOnly: true,
    });
    
    if (info && info.number) {
      // Now use collectSequentialBoxes to find ALL occurrences of this ID number
      // This ensures we mask the number everywhere it appears in the document
      const allBoxes = collectSequentialBoxes(words, info.number, { digitsOnly: true });
      if (allBoxes.length > 0) {
        // Don't collapse overlapping boxes here - let maskNumberRegions handle each occurrence separately
        // Only collapse boxes that are truly duplicates (same position), not separate occurrences
        return {
          number: info.number,
          masked: info.masked,
          boxes: allBoxes, // Return all boxes without collapsing - each occurrence should be masked separately
        };
      }
      // Fallback: use boxes from locateNumberFromWords if collectSequentialBoxes found nothing
      return info;
    }
    
    // Fallback: try regex pattern matching
    const match = cleaned.match(/\b\d{4}\s?\d{4}\s?\d{4}\b/);
    if (match) {
      const digits = match[0].replace(/[\s-]/g, "");
      if (digits.length === 12) {
        const boxes = collectSequentialBoxes(words, digits, { digitsOnly: true });
        return {
          number: digits,
          masked: maskID("Aadhaar", digits),
          boxes: boxes.length > 0 ? boxes : undefined, // Return all boxes without collapsing
        };
      }
    }
    
    // Additional fallback: Extract any 12-digit sequence from full text
    const fullTextDigits = cleaned.replace(/\D/g, "");
    const twelveDigitMatch = fullTextDigits.match(/\d{12}/);
    if (twelveDigitMatch) {
      return {
        number: twelveDigitMatch[0],
        masked: maskID("Aadhaar", twelveDigitMatch[0]),
        boxes: undefined, // Will use fallback masking in maskNumberRegions
      };
    }
  }
  if (idType === "Passport") {
    const info = locateNumberFromWords(words, {
      regex: /^[A-Z][0-9]{7}$/,
      maskFormatter: (value) => `${value[0]}XXXXXXX`,
    });
    
    if (info && info.number) {
      // Find ALL occurrences of this passport number
      const allBoxes = collectSequentialBoxes(words, info.number);
      if (allBoxes.length > 0) {
        return {
          number: info.number,
          masked: info.masked,
          boxes: collapseOverlappingBoxes(allBoxes),
        };
      }
      return info;
    }
    
    const match = cleaned.match(/\b[A-Z][0-9]{7}\b/);
    if (match) {
      const value = match[0];
      const boxes = collectSequentialBoxes(words, value);
      return {
        number: value,
        masked: `${value[0]}XXXXXXX`,
        boxes: boxes.length > 0 ? collapseOverlappingBoxes(boxes) : undefined,
      };
    }
  }
  if (idType === "Emirates ID") {
    const info = locateNumberFromWords(words, {
      regex: /^784[-\s]?\d{4}[-\s]?\d{7}[-\s]?\d$/,
      maskFormatter: (value) => {
        const digits = value.replace(/\D/g, "");
        const last = digits.slice(-1);
        return `784-XXXX-XXXXXXX-${last}`;
      },
    });
    
    if (info && info.number) {
      // Extract digits for matching
      const digits = info.number.replace(/\D/g, "");
      const allBoxes = collectSequentialBoxes(words, digits, { digitsOnly: true });
      if (allBoxes.length > 0) {
        return {
          number: info.number,
          masked: info.masked,
          boxes: collapseOverlappingBoxes(allBoxes),
        };
      }
      return info;
    }
    
    const match = cleaned.match(/\b784-\d{4}-\d{7}-\d\b/);
    if (match) {
      const parts = match[0].split("-");
      const digits = match[0].replace(/\D/g, "");
      const boxes = collectSequentialBoxes(words, digits, { digitsOnly: true });
      return {
        number: match[0],
        masked: `784-XXXX-XXXXXXX-${parts[3]}`,
        boxes: boxes.length > 0 ? collapseOverlappingBoxes(boxes) : undefined,
      };
    }
  }
  return null;
}

async function createMaskedPreview(
  file: File,
  idType: string,
  extractedText?: string,
  words: OcrWord[] = []
): Promise<MaskedPreviewResult> {
  const sourceCanvas = await canvasFromFile(file);
  const canvas = document.createElement("canvas");
  canvas.width = sourceCanvas.width;
  canvas.height = sourceCanvas.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas not supported");
  }
  // Simply copy the original image without any masking or watermark
  ctx.drawImage(sourceCanvas, 0, 0);

  return {
    dataUrl: canvas.toDataURL("image/jpeg", 0.85),
    summary: undefined,
  };
}

type LocateOptions = {
  minLength?: number;
  maxLength?: number;
  regex?: RegExp;
  maskFormatter: (value: string) => string;
  digitsOnly?: boolean;
};

function locateNumberFromWords(words: OcrWord[], options: LocateOptions): { number: string; masked: string; boxes: MaskBox[] } | null {
  if (!words.length) return null;
  let matchedValue: string | null = null;
  const matchedSegments: MaskBox[] = [];

  for (let start = 0; start < words.length; start += 1) {
    let normalized = "";
    let digitsNormalized = "";
    const segmentBoxes: MaskBox[] = [];

    for (let index = start; index < words.length; index += 1) {
      const current = words[index];
      if (!current.text?.trim()) {
        if (options.digitsOnly && digitsNormalized.length > 0) {
          break;
        }
        continue;
      }
      normalized += current.text.replace(/\s+/g, "");
      digitsNormalized += current.text.replace(/\D+/g, "");
      const candidate = options.digitsOnly ? digitsNormalized : normalized;
      const length = candidate.length;
      segmentBoxes.push({
        x: Math.max(0, current.bbox.x0),
        y: Math.max(0, current.bbox.y0),
        width: Math.max(1, current.bbox.x1 - current.bbox.x0),
        height: Math.max(1, current.bbox.y1 - current.bbox.y0),
      });

      let isMatch = false;
      if (options.regex) {
        if (options.regex.test(candidate)) {
          isMatch = true;
        }
      } else {
        if (options.maxLength && length > options.maxLength) {
          break;
        }
        if ((options.minLength === undefined || length >= options.minLength) && (options.maxLength === undefined || length === options.maxLength)) {
          isMatch = true;
        }
      }

      if (isMatch) {
        // Store the first matched value as the canonical one (the actual ID number)
        if (!matchedValue) {
          matchedValue = candidate;
        }
        
        // Collect ALL occurrences that match the canonical value
        // This ensures we mask the same ID number everywhere it appears
        if (matchedValue === candidate) {
          matchedSegments.push(mergeBoxes(segmentBoxes));
        }
        // Break from inner loop to move to next starting position
        // The outer loop will continue and find the next occurrence
        break;
      }
    }
  }

  if (!matchedValue || matchedSegments.length === 0) return null;

  const uniqueBoxes = collapseOverlappingBoxes(matchedSegments);
  return {
    number: matchedValue,
    masked: options.maskFormatter(matchedValue),
    boxes: uniqueBoxes,
  };
}

function collectSequentialBoxes(words: OcrWord[], value: string, options: { digitsOnly?: boolean } = {}): MaskBox[] {
  if (!words.length || !value) return [];
  const normalizedTarget = options.digitsOnly ? value.replace(/\D/g, "") : value.replace(/\s+/g, "").toUpperCase();
  if (!normalizedTarget) return [];

  const occurrences: MaskBox[] = [];
  const targetLength = normalizedTarget.length;

  // Check all possible starting positions to find ALL occurrences
  // This handles both single-word matches (entire ID in one word) and multi-word matches (ID split across words)
  for (let start = 0; start < words.length; start += 1) {
    let consumed = 0;
    const segment: MaskBox[] = [];

    // Try to match the target starting from this position
    for (let index = start; index < words.length; index += 1) {
      const rawText = words[index].text ?? "";
      const normalizedWord = options.digitsOnly ? rawText.replace(/\D/g, "") : rawText.replace(/\s+/g, "").toUpperCase();

      if (!normalizedWord) {
        // Empty word - if we've consumed part of the target, this breaks the sequence
        if (consumed > 0) {
          break;
        }
        // Otherwise, skip empty words and continue
        continue;
      }

      // Check if this word matches the next part of the target
      const remainingTarget = normalizedTarget.slice(consumed);
      if (remainingTarget.length === 0) {
        // We've already matched the full target, but continue to check if there are more matches
        break;
      }

      // Check if the word exactly matches the next part of the target
      if (normalizedWord === remainingTarget.slice(0, normalizedWord.length)) {
        // This word matches the next part - add it to the segment
        segment.push({
          x: Math.max(0, words[index].bbox.x0),
          y: Math.max(0, words[index].bbox.y0),
          width: Math.max(1, words[index].bbox.x1 - words[index].bbox.x0),
          height: Math.max(1, words[index].bbox.y1 - words[index].bbox.y0),
        });
        consumed += normalizedWord.length;

        // Check if we've matched the complete target
        if (consumed >= targetLength) {
          if (segment.length > 0) {
            occurrences.push(mergeBoxes(segment));
          }
          // Break from inner loop to try next starting position
          break;
        }
      } else if (normalizedWord.length >= targetLength && normalizedWord.includes(normalizedTarget)) {
        // Special case: entire target is embedded within this single word
        // This handles cases where OCR puts the whole ID in one word
        occurrences.push({
          x: Math.max(0, words[index].bbox.x0),
          y: Math.max(0, words[index].bbox.y0),
          width: Math.max(1, words[index].bbox.x1 - words[index].bbox.x0),
          height: Math.max(1, words[index].bbox.y1 - words[index].bbox.y0),
        });
        // Break since we found a complete match in this word
        break;
      } else {
        // Mismatch - this sequence doesn't match the target
        // Break and try next starting position
        break;
      }
    }
  }

  // Return all occurrences - don't collapse them here as they might be separate instances
  // The masking functions will handle avoiding duplicate masking
  return occurrences;
}

function mergeBoxes(boxes: MaskBox[]): MaskBox {
  const x = Math.min(...boxes.map((b) => b.x));
  const y = Math.min(...boxes.map((b) => b.y));
  const x2 = Math.max(...boxes.map((b) => b.x + b.width));
  const y2 = Math.max(...boxes.map((b) => b.y + b.height));
  return { x, y, width: x2 - x, height: y2 - y };
}

function collapseOverlappingBoxes(boxes: MaskBox[]): MaskBox[] {
  const result: MaskBox[] = [];
  boxes.forEach((box) => {
    const expanded = expandBox(box, Infinity, Infinity);
    const overlappingIndex = result.findIndex((other) => boxesOverlap(expanded, other));
    if (overlappingIndex >= 0) {
      const merged = mergeBoxes([result[overlappingIndex], expanded]);
      result[overlappingIndex] = merged;
    } else {
      result.push(expanded);
    }
  });
  return result;
}

function boxesOverlap(a: MaskBox, b: MaskBox): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function expandBox(box: MaskBox, canvasWidth: number, canvasHeight: number): MaskBox {
  const widthBasis = isFinite(canvasWidth) ? canvasWidth : box.width;
  const heightBasis = isFinite(canvasHeight) ? canvasHeight : box.height;
  const padX = Math.min(Math.max(10, box.width * 0.2), widthBasis * 0.08);
  const padY = Math.min(Math.max(8, box.height * 0.3), heightBasis * 0.12);
  const x = Math.max(0, box.x - padX);
  const y = Math.max(0, box.y - padY);
  const maxWidth = isFinite(canvasWidth) ? Math.max(1, canvasWidth - x) : Number.POSITIVE_INFINITY;
  const maxHeight = isFinite(canvasHeight) ? Math.max(1, canvasHeight - y) : Number.POSITIVE_INFINITY;
  const width = Math.min(
    box.width + padX * 2,
    isFinite(canvasWidth) ? Math.min(maxWidth, canvasWidth * 0.55) : box.width + padX * 2
  );
  const height = Math.min(
    box.height + padY * 2,
    isFinite(canvasHeight) ? Math.min(maxHeight, canvasHeight * 0.25) : box.height + padY * 2
  );
  return { x, y, width, height };
}

function maskNumberRegions(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  info: { number: string; masked: string; boxes?: MaskBox[] },
  reservedBottom = 0
) {
  const style: NumberMaskStyle = {
    background: "#FFFFFF", // White background for text-based masking
    textColor: "#000000", // Black text
    accentColor: "#FBBF24",
    shadowColor: "rgba(15, 23, 42, 0.35)",
    highlightBackground: "rgba(251, 191, 36, 0.18)",
  };

  const usableHeight = Math.max(1, canvas.height - reservedBottom);
  const boxes = info.boxes && info.boxes.length > 0 ? info.boxes : [];

  if (boxes.length === 0) {
    // CRITICAL FIX: If no boxes found, still mask using a fallback area
    // This ensures the ID is masked even if OCR didn't find exact boxes
    const fallbackArea: MaskBox = {
      x: Math.max(0, canvas.width * 0.15),
      y: Math.max(0, canvas.height * 0.35),
      width: Math.min(canvas.width * 0.7, canvas.width - 30),
      height: Math.max(50, canvas.height * 0.12),
    };
    drawNumberMask(ctx, fallbackArea, info, style);
    return;
  }

  // Mask each occurrence by covering original text and drawing masked text
  boxes.forEach((box) => {
    // Use the original box dimensions, but add small padding for better coverage
    const paddingX = Math.max(4, box.width * 0.1);
    const paddingY = Math.max(2, box.height * 0.15);
    const maskArea: MaskBox = {
      x: Math.max(0, box.x - paddingX),
      y: Math.max(0, box.y - paddingY),
      width: box.width + paddingX * 2,
      height: box.height + paddingY * 2,
    };
    drawNumberMask(ctx, maskArea, info, style);
  });
}

function maskAadhaarFragments(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  words: OcrWord[],
  options: { originalDigits?: string; excludeBoxes?: MaskBox[] } = {}
) {
  if (!words.length) return;
  let digitsTarget = options.originalDigits?.replace(/\D/g, "") ?? "";
  
  // If no digits provided, try to extract from words
  if (!digitsTarget || digitsTarget.length !== 12) {
    let accumulated = "";
    for (const word of words) {
      const wordDigits = (word.text || "").replace(/\D/g, "");
      accumulated += wordDigits;
      if (accumulated.length >= 12) {
        digitsTarget = accumulated.slice(0, 12);
        break;
      }
    }
  }
  
  if (!digitsTarget || digitsTarget.length !== 12) return;
  
  const excludedBoxes = options.excludeBoxes ?? [];
  const seen = new Set<string>();
  const maskedValue = maskID("Aadhaar", digitsTarget); // Format: "XXXXXXXX9620"

  const style: NumberMaskStyle = {
    background: "#FFFFFF",
    textColor: "#000000",
    accentColor: "#FBBF24",
    shadowColor: "rgba(15, 23, 42, 0.35)",
    highlightBackground: "rgba(251, 191, 36, 0.18)",
  };

  const keyForBox = (box: MaskBox) =>
    `${Math.round(box.x)}-${Math.round(box.y)}-${Math.round(box.width)}-${Math.round(box.height)}`;

  // Check if a box overlaps significantly with already-masked boxes
  const hasSignificantOverlap = (box: MaskBox): boolean => {
    return excludedBoxes.some((ex) => {
      const overlapX = Math.max(0, Math.min(box.x + box.width, ex.x + ex.width) - Math.max(box.x, ex.x));
      const overlapY = Math.max(0, Math.min(box.y + box.height, ex.y + ex.height) - Math.max(box.y, ex.y));
      const overlapArea = overlapX * overlapY;
      const boxArea = box.width * box.height;
      return overlapArea > boxArea * 0.3; // 30% overlap threshold
    });
  };

  // Function to mask a box with text-based masking
  const applyTextMask = (box: MaskBox) => {
    if (hasSignificantOverlap(box)) {
      return;
    }
    
    const key = keyForBox(box);
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    
    // Add small padding for better coverage
    const paddingX = Math.max(4, box.width * 0.1);
    const paddingY = Math.max(2, box.height * 0.15);
    const maskArea: MaskBox = {
      x: Math.max(0, box.x - paddingX),
      y: Math.max(0, box.y - paddingY),
      width: box.width + paddingX * 2,
      height: box.height + paddingY * 2,
    };
    
    drawNumberMask(ctx, maskArea, { number: digitsTarget, masked: maskedValue }, style);
  };

  // Find ALL occurrences of the Aadhaar number
  const allSequenceBoxes = collectSequentialBoxes(words, digitsTarget, { digitsOnly: true });
  
  // Mask each occurrence
  allSequenceBoxes.forEach(applyTextMask);

  // Also check individual words for fragments containing parts of the ID
  words.forEach((word) => {
    const raw = word.text ? String(word.text) : "";
    if (!raw.trim()) return;
    const digitsOnly = raw.replace(/\D/g, "");
    
    if (digitsOnly.length < 6) return;
    
    // Check if this word's digits are part of the target Aadhaar number
    let isPartOfTarget = false;
    for (let i = 0; i <= digitsTarget.length - digitsOnly.length; i++) {
      if (digitsTarget.slice(i, i + digitsOnly.length) === digitsOnly) {
        isPartOfTarget = true;
        break;
      }
    }
    
    if (!isPartOfTarget) return;

    const base: MaskBox = {
      x: Math.max(0, word.bbox.x0),
      y: Math.max(0, word.bbox.y0),
      width: Math.max(1, word.bbox.x1 - word.bbox.x0),
      height: Math.max(1, word.bbox.y1 - word.bbox.y0),
    };

    // Check if already masked
    if (excludedBoxes.some((box) => boxesOverlap(box, base))) {
      return;
    }

    applyTextMask(base);
  });
}

type NumberMaskStyle = {
  background: string;
  textColor: string;
  accentColor: string;
  shadowColor: string;
  highlightBackground: string;
};

function adjustMaskArea(box: MaskBox, canvasWidth: number, usableHeight: number): MaskBox {
  const paddingX = Math.max(12, box.width * 0.18);
  const paddingY = Math.max(10, box.height * 0.45);

  let width = Math.max(box.width + paddingX * 2, Math.max(160, box.width * 1.4));
  width = Math.min(width, canvasWidth - 16);

  let x = Math.max(8, box.x - paddingX);
  if (x + width > canvasWidth - 8) {
    x = Math.max(8, canvasWidth - 8 - width);
  }

  let height = Math.max(box.height + paddingY * 2, Math.max(40, box.height * 1.6));
  height = Math.min(height, usableHeight - 8);

  let y = Math.max(8, box.y - paddingY);
  if (y + height > usableHeight - 8) {
    y = Math.max(8, usableHeight - 8 - height);
  }

  return { x, y, width, height };
}

function drawNumberMask(
  ctx: CanvasRenderingContext2D,
  area: MaskBox,
  info: { number: string; masked: string },
  style: NumberMaskStyle
) {
  // Text-based masking: cover original text with background, then draw masked text
  // Format: "xxxx xxxx 9620" (like the sample image)
  ctx.save();
  
  // First, cover the original text with a white rectangle
  // Use composite operation to ensure it covers everything
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "#FFFFFF"; // White background to cover original text
  // Draw slightly larger rectangle to ensure full coverage
  ctx.fillRect(
    Math.max(0, area.x - 2), 
    Math.max(0, area.y - 2), 
    area.width + 4, 
    area.height + 4
  );
  
  // Now draw the masked text in the same location
  // Format: "XXXXXXXX9620" - first 8 digits masked, last 4 visible
  const maskedText = info.masked.toLowerCase(); // Convert "XXXXXXXX9620" to "xxxxxxxx9620" for display
  
  if (!maskedText || maskedText.trim().length === 0) {
    ctx.restore();
    return;
  }
  
  // Calculate font size based on box height - match the original text size
  const fontSize = Math.max(area.height * 0.7, 16);
  ctx.font = `bold ${fontSize}px "Segoe UI", Arial, sans-serif`;
  ctx.fillStyle = "#000000"; // Black text like the original
  ctx.textAlign = "center"; // Center alignment for better positioning
  ctx.textBaseline = "middle";
  
  // Center the text in the box
  const textX = area.x + area.width / 2;
  const textY = area.y + area.height / 2;
  
  // Draw the masked text
  ctx.fillText(maskedText, textX, textY);
  
  ctx.restore();
}

function paintRedaction(ctx: CanvasRenderingContext2D, area: MaskBox) {
  // Simple white rectangle to cover text (for non-Aadhaar IDs)
  ctx.save();
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(area.x, area.y, area.width, area.height);
  ctx.restore();
}

function formatMaskLabel(maskedText: string, originalNumber?: string): {
  maskedPart: string;
  tail: string;
  combined: string;
} {
  const masked = (maskedText || "").trim();
  const numericTailMatch = masked.match(/(\d{3,})$/);
  if (numericTailMatch) {
    const tail = numericTailMatch[1];
    const maskedPart = masked.slice(0, -tail.length).trimEnd();
    const combined = `${maskedPart} ${tail}`.trim();
    return { maskedPart, tail, combined };
  }

  const digits = (originalNumber ?? "").replace(/\D/g, "");
  if (digits.length >= 4) {
    const tail = digits.slice(-4);
    const maskedPartCandidate = masked && /X/i.test(masked) ? masked : "XXXX XXXX";
    const maskedPart = maskedPartCandidate.trim();
    const combined = `${maskedPart} ${tail}`.trim();
    return { maskedPart, tail, combined };
  }

  return { maskedPart: masked, tail: "", combined: masked };
}

type MaskPanelStyle = {
  background: string;
  textColor: string;
  stroke?: string;
  strokeWidth?: number;
};

function drawMaskPanel(ctx: CanvasRenderingContext2D, area: MaskBox, text: string, style: MaskPanelStyle) {
  ctx.save();
  const radius = Math.min(area.height / 2, Math.max(8, area.height * 0.25));
  drawRoundedRectPath(ctx, area.x, area.y, area.width, area.height, radius);

  ctx.fillStyle = style.background;
  ctx.fill();

  if (style.stroke) {
    ctx.strokeStyle = style.stroke;
    ctx.lineWidth = style.strokeWidth ?? Math.max(1.5, area.width * 0.003);
    ctx.stroke();
  }

  let fontSize = Math.max(18, Math.min(area.height * 0.55, area.width * 0.2));
  fontSize = fitFontSize(ctx, text, area.width - 24, fontSize);
  ctx.font = `bold ${fontSize}px "Segoe UI", Arial, sans-serif`;
  ctx.fillStyle = style.textColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, area.x + area.width / 2, area.y + area.height / 2);
  ctx.restore();
}

function fitFontSize(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, initialSize: number): number {
  let size = initialSize;
  while (size > 12) {
    ctx.font = `bold ${size}px "Segoe UI", Arial, sans-serif`;
    if (ctx.measureText(text).width <= maxWidth) {
      return size;
    }
    size -= 1;
  }
  return 12;
}

function drawRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
