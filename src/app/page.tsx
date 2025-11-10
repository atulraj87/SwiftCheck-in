"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState, type SyntheticEvent } from "react";
import ReactCrop, { centerCrop, makeAspectCrop, type Crop, type PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { validateIdContent, type OcrWord } from "@/lib/idValidation";

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
  const [cropModal, setCropModal] = useState<{ src: string; filename: string; mimeType: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cropNextFileRef = useRef<((file: File) => Promise<void> | void) | null>(null);
  const isPrefilled = params.get("prefill") === "1";
  const [emailError, setEmailError] = useState<string>("");
  const [phoneError, setPhoneError] = useState<string>("");
  const lockedInputClass = isPrefilled ? "bg-zinc-100 cursor-not-allowed text-zinc-700" : "";

  const today = new Date().toISOString().split("T")[0];

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
    setCropModal(null);
    cropNextFileRef.current = null;
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    sessionStorage.removeItem("uploadedIdName");
    sessionStorage.removeItem("maskedIdPreview");
    sessionStorage.removeItem("maskedIdSummary");
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

  async function processSelectedFile(selected: File | null, options: { skipCrop?: boolean } = {}) {
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
    const isImage = selected.type.startsWith("image/");
    if (!options.skipCrop && isImage) {
      try {
        const dataUrl = await fileToDataUrl(selected);
        cropNextFileRef.current = async (croppedFile: File) => {
          cropNextFileRef.current = null;
          await processSelectedFile(croppedFile, { skipCrop: true });
        };
        setCropModal({
          src: dataUrl,
          filename: selected.name,
          mimeType: selected.type || "image/jpeg",
        });
      } catch (error) {
        console.error(error);
        setFileError("Could not open the image for cropping. Please try another file.");
        resetIdArtifacts({ preserveMessages: true });
      }
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
      setMaskedSummary(masked.summary ?? "");
      sessionStorage.setItem("uploadedIdName", selected.name);
      sessionStorage.setItem("maskedIdPreview", masked.dataUrl);
      sessionStorage.setItem("maskedIdSummary", masked.summary ?? "");
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
      entries.unshift({
        name: fullName,
        ref: bookingRef,
        arrival,
        email: trimmedEmail,
        phone,
        country,
        idType,
        maskedPreview,
        maskedSummary,
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
                  await processSelectedFile(captured, { skipCrop: true });
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
      {cropModal && (
        <CropModal
          src={cropModal.src}
          filename={cropModal.filename}
          mimeType={cropModal.mimeType}
          onSave={async (file) => {
            setCropModal(null);
            const handler = cropNextFileRef.current;
            cropNextFileRef.current = null;
            if (handler) {
              await handler(file);
            }
          }}
          onCancel={() => {
            cropNextFileRef.current = null;
            setCropModal(null);
            resetIdArtifacts({ preserveMessages: true });
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          }}
        />
      )}
    </div>
  );
}

type CameraCaptureProps = {
  onCapture: (file: File) => Promise<void> | void;
  onClose: () => void;
};

function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string>("");
  const [capturedDataUrl, setCapturedDataUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isSaving, setIsSaving] = useState(false);
  const cropAspect = 3 / 2;

  useEffect(() => {
    async function start() {
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
    }

    if (!capturedDataUrl) {
      start();
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [capturedDataUrl]);

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const restartCamera = async () => {
    setCapturedDataUrl(null);
    setCrop(undefined);
    setCompletedCrop(undefined);
    setIsSaving(false);
    setError("");
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
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

  const capture = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
    setCapturedDataUrl(dataUrl);
    stopStream();
  };

  const onImageLoad = (e: SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth: width, naturalHeight: height } = e.currentTarget;
    imageRef.current = e.currentTarget;
    const initialCrop = centerCrop(
      makeAspectCrop(
        {
          unit: "%",
          width: 90,
        },
        cropAspect,
        width,
        height
      ),
      width,
      height
    );
    setCrop(initialCrop);
    setCompletedCrop(initialCrop);
  };

  async function confirmCrop() {
    if (!imageRef.current || !completedCrop || completedCrop.width <= 0 || completedCrop.height <= 0) {
      return;
    }
    setIsSaving(true);
    try {
      const croppedFile = await generateCroppedFile(
        imageRef.current,
        completedCrop,
        "image/jpeg",
        `captured-id-${Date.now()}.jpg`
      );
      await onCapture(croppedFile);
      onClose();
    } catch (err) {
      console.error(err);
      setError("Could not process the cropped image. Please try again.");
      setIsSaving(false);
    }
  }

  const hasCrop = Boolean(capturedDataUrl);

  return (
    <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-zinc-800">
          {hasCrop ? "Adjust crop before uploading" : "Capture ID using your camera"}
        </p>
        <button type="button" className="text-xs text-zinc-500 hover:text-zinc-800" onClick={() => (hasCrop ? restartCamera() : onClose())}>
          Close
        </button>
      </div>
      {error ? (
        <p className="mt-2 text-xs text-red-600">{error}</p>
      ) : hasCrop ? (
        <div className="mt-3 space-y-3">
          <ReactCrop crop={crop} onChange={(newCrop) => setCrop(newCrop)} onComplete={(c) => setCompletedCrop(c)} aspect={cropAspect} minHeight={80}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={capturedDataUrl}
              alt="Captured ID preview"
              className="max-h-[420px] w-full max-w-full rounded"
              onLoad={onImageLoad}
            />
          </ReactCrop>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              className="inline-flex items-center rounded-md border border-zinc-300 px-3 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100"
              onClick={restartCamera}
            >
              Retake
            </button>
            <button
              type="button"
              className="inline-flex items-center rounded-md bg-[#5E0F8B] px-4 py-2 text-sm font-medium text-white hover:bg-[#4A0B6E] disabled:cursor-not-allowed disabled:bg-zinc-400"
              disabled={!completedCrop || isSaving}
              onClick={confirmCrop}
            >
              {isSaving ? "Saving..." : "Save & Continue"}
            </button>
          </div>
          <p className="text-xs text-zinc-500">Drag the corners to keep the photo and name while hiding any background.</p>
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          <video ref={videoRef} className="w-full rounded bg-black/20" playsInline muted />
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              className="inline-flex items-center rounded-md border border-zinc-300 px-3 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100"
              onClick={restartCamera}
            >
              Refresh Camera
            </button>
            <button
              type="button"
              className="inline-flex items-center rounded-md bg-[#5E0F8B] px-4 py-2 text-sm font-medium text-white hover:bg-[#4A0B6E]"
              onClick={capture}
            >
              Capture Photo
            </button>
          </div>
          <p className="text-xs text-zinc-500">Hold steady and ensure the entire ID is visible before capturing.</p>
        </div>
      )}
    </div>
  );
}

type CropModalProps = {
  src: string;
  filename: string;
  mimeType: string;
  onSave: (file: File) => Promise<void> | void;
  onCancel: () => void;
};

function CropModal({ src, filename, mimeType, onSave, onCancel }: CropModalProps) {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isSaving, setIsSaving] = useState(false);
  const cropAspect = 3 / 2;
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const onImageLoad = (e: SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth: width, naturalHeight: height } = e.currentTarget;
    imageRef.current = e.currentTarget;
    const initialCrop = centerCrop(
      makeAspectCrop(
        {
          unit: "%",
          width: 90,
        },
        cropAspect,
        width,
        height
      ),
      width,
      height
    );
    setCrop(initialCrop);
    setCompletedCrop(initialCrop);
  };

  const handleSave = async () => {
    if (!imageRef.current || !completedCrop || completedCrop.width <= 0 || completedCrop.height <= 0) {
      return;
    }
    setIsSaving(true);
    try {
      const croppedFile = await generateCroppedFile(
        imageRef.current,
        completedCrop,
        mimeType || "image/jpeg",
        deriveCroppedFilename(filename, mimeType)
      );
      await onSave(croppedFile);
    } catch (error) {
      console.error(error);
      if (mountedRef.current) {
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-xl rounded-lg bg-white p-4 shadow-xl">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-zinc-800">Adjust crop before uploading</p>
          <button type="button" className="text-xs text-zinc-500 hover:text-zinc-800" onClick={onCancel}>
            Cancel
          </button>
        </div>
        <div className="mt-3 space-y-3">
          <ReactCrop crop={crop} onChange={(newCrop) => setCrop(newCrop)} onComplete={(c) => setCompletedCrop(c)} aspect={cropAspect} minHeight={80}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imageRef}
              src={src}
              alt="Crop selected ID"
              className="max-h-[420px] w-full max-w-full rounded"
              onLoad={onImageLoad}
            />
          </ReactCrop>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              className="inline-flex items-center rounded-md border border-zinc-300 px-3 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100"
              onClick={onCancel}
            >
              Choose different photo
            </button>
            <button
              type="button"
              className="inline-flex items-center rounded-md bg-[#5E0F8B] px-4 py-2 text-sm font-medium text-white hover:bg-[#4A0B6E] disabled:cursor-not-allowed disabled:bg-zinc-400"
              disabled={!completedCrop || isSaving}
              onClick={handleSave}
            >
              {isSaving ? "Saving..." : "Save & Continue"}
            </button>
          </div>
          <p className="text-xs text-zinc-500">Drag the crop to cover the ID while keeping the photo and name visible.</p>
        </div>
      </div>
    </div>
  );
}

async function generateCroppedFile(
  image: HTMLImageElement,
  crop: PixelCrop,
  mimeType = "image/jpeg",
  filename?: string
): Promise<File> {
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.floor(crop.width * scaleX));
  canvas.height = Math.max(1, Math.floor(crop.height * scaleY));
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas not supported");
  }
  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return new Promise<File>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Could not create cropped image"));
          return;
        }
        const extension = mimeType === "image/png" ? "png" : "jpg";
        const safeName =
          filename ??
          `cropped-id-${Date.now()}.${extension}`;
        resolve(new File([blob], safeName, { type: mimeType }));
      },
      mimeType,
      mimeType === "image/png" ? undefined : 0.92
    );
  });
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Could not read file"));
      }
    };
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
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

type MaskBox = { x: number; y: number; width: number; height: number };

function extractIdNumber(
  idType: string,
  text?: string,
  words: OcrWord[] = []
): { number: string; masked: string; boxes?: MaskBox[] } | null {
  if (!text) return null;
  const cleaned = text.replace(/\s+/g, " ");
  if (idType === "Aadhaar") {
    const info = locateNumberFromWords(words, {
      minLength: 12,
      maxLength: 12,
      maskFormatter: (digits) => `XXXX XXXX ${digits.slice(-4)}`,
      digitsOnly: true,
    });
    if (info) {
      return info;
    }
    const match = cleaned.match(/\b\d{4}\s?\d{4}\s?\d{4}\b/);
    if (match) {
      const digits = match[0].replace(/[\s-]/g, "");
      if (digits.length === 12) {
        return { number: digits, masked: `XXXX XXXX ${digits.slice(-4)}` };
      }
    }
  }
  if (idType === "Passport") {
    const info = locateNumberFromWords(words, {
      regex: /^[A-Z][0-9]{7}$/,
      maskFormatter: (value) => `${value[0]}XXXXXXX`,
    });
    if (info) {
      return info;
    }
    const match = cleaned.match(/\b[A-Z][0-9]{7}\b/);
    if (match) {
      const value = match[0];
      return { number: value, masked: `${value[0]}XXXXXXX` };
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
    if (info) {
      return info;
    }
    const match = cleaned.match(/\b784-\d{4}-\d{7}-\d\b/);
    if (match) {
      const parts = match[0].split("-");
      return { number: match[0], masked: `784-XXXX-XXXXXXX-${parts[3]}` };
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
  ctx.drawImage(sourceCanvas, 0, 0);

  const summary = deriveMaskedSummary(idType, extractedText);
  const idNumberInfo = extractIdNumber(idType, extractedText, words);

  if (idNumberInfo) {
    maskNumberRegions(ctx, canvas, idNumberInfo.masked, idNumberInfo.boxes);
  } else {
    const fallbackY = canvas.height * 0.7;
    const fontSize = Math.max(22, Math.round(canvas.width * 0.05));
    drawMaskStrip(ctx, canvas, summary ?? "Sensitive details masked", fallbackY, fontSize, {
      background: "rgba(0,0,0,0.58)",
      textColor: "#FFFFFF",
    });
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

      if (options.regex) {
        if (options.regex.test(candidate)) {
          matchedValue = matchedValue ?? candidate;
          if (matchedValue === candidate) {
            matchedSegments.push(mergeBoxes(segmentBoxes));
          }
          break;
        }
      } else {
        if (options.maxLength && length > options.maxLength) {
          break;
        }
        if ((options.minLength === undefined || length >= options.minLength) && (options.maxLength === undefined || length === options.maxLength)) {
          matchedValue = matchedValue ?? candidate;
          if (matchedValue === candidate) {
            matchedSegments.push(mergeBoxes(segmentBoxes));
          }
          break;
        }
      }
    }
  }

  if (!matchedValue) return null;

  const uniqueBoxes = collapseOverlappingBoxes(matchedSegments);
  return {
    number: matchedValue,
    masked: options.maskFormatter(matchedValue),
    boxes: uniqueBoxes,
  };
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
  const padX = Math.max(12, (isFinite(canvasWidth) ? canvasWidth : box.width) * 0.06);
  const padY = Math.max(12, (isFinite(canvasHeight) ? canvasHeight : box.height) * 0.12);
  const x = Math.max(0, box.x - padX);
  const y = Math.max(0, box.y - padY);
  const maxWidth = isFinite(canvasWidth) ? Math.max(1, canvasWidth - x) : Number.POSITIVE_INFINITY;
  const maxHeight = isFinite(canvasHeight) ? Math.max(1, canvasHeight - y) : Number.POSITIVE_INFINITY;
  const width = Math.min(box.width + padX * 2, maxWidth);
  const height = Math.min(box.height + padY * 2, maxHeight);
  return { x, y, width, height };
}

function maskNumberRegions(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, maskedText: string, boxes?: MaskBox[]) {
  const style = {
    background: "rgba(255,255,255,0.95)",
    textColor: "#111111",
    stroke: "rgba(0,0,0,0.25)",
    strokeWidth: Math.max(1.5, canvas.width * 0.003),
  };

  if (boxes && boxes.length > 0) {
    boxes.forEach((box) => {
      const boundedX = Math.max(0, Math.min(box.x, canvas.width - 1));
      const boundedY = Math.max(0, Math.min(box.y, canvas.height - 1));
      const boundedWidth = Math.min(canvas.width - boundedX, box.width);
      const boundedHeight = Math.min(canvas.height - boundedY, box.height);
      const bounded = {
        x: boundedX,
        y: boundedY,
        width: Math.max(1, boundedWidth),
        height: Math.max(1, boundedHeight),
      };
      const expanded = expandBox(bounded, canvas.width, canvas.height);
      const centerY = expanded.y + expanded.height / 2;
      const fontSize = Math.max(18, expanded.height * 0.55);
      drawMaskStrip(ctx, canvas, maskedText, centerY, fontSize, style, expanded);
    });
    return;
  }

  const defaultY = canvas.height * 0.6;
  const fontSize = Math.max(24, Math.round(canvas.width * 0.055));
  drawMaskStrip(ctx, canvas, maskedText, defaultY, fontSize, style);
}

type MaskStripStyle = {
  background: string;
  textColor: string;
  stroke?: string;
  strokeWidth?: number;
};

function drawMaskStrip(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  text: string,
  centerY: number,
  fontSize: number,
  style: MaskStripStyle,
  bounds?: { x: number; width: number; height?: number }
) {
  ctx.save();
  ctx.font = `bold ${fontSize}px "Segoe UI", Arial, sans-serif`;
  const paddingX = bounds ? Math.max(16, bounds.width * 0.1) : Math.max(24, canvas.width * 0.04);
  const paddingY = Math.max(14, fontSize * 0.35);
  const textWidth = ctx.measureText(text).width;
  const desiredWidth = textWidth + paddingX * 2;
  const maxWidth = bounds ? Math.max(bounds.width, desiredWidth) : Math.min(canvas.width * 0.75, desiredWidth);
  const width = bounds ? Math.min(canvas.width - bounds.x, maxWidth) : maxWidth;
  const height = bounds?.height ? Math.max(bounds.height, fontSize + paddingY) : fontSize + paddingY;
  const x = bounds ? bounds.x : (canvas.width - width) / 2;
  const y = centerY - height / 2;

  ctx.fillStyle = style.background;
  ctx.fillRect(x, y, width, height);

  if (style.stroke) {
    ctx.strokeStyle = style.stroke;
    ctx.lineWidth = style.strokeWidth ?? Math.max(2, canvas.width * 0.003);
    ctx.strokeRect(x, y, width, height);
  }

  ctx.fillStyle = style.textColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x + width / 2, centerY);
  ctx.restore();
}
