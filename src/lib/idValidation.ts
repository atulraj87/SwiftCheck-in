export type OcrWord = {
  text: string;
  bbox: { x0: number; y0: number; x1: number; y1: number };
  confidence: number;
};

export type IdValidationResult = {
  ok: boolean;
  message?: string;
  extractedText?: string;
  words?: OcrWord[];
};

async function fileToCanvas(file: File): Promise<HTMLCanvasElement> {
  const isPdf = file.type === "application/pdf";
  if (isPdf) {
    const pdfjs: any = await import("pdfjs-dist");
    // Worker optional for this small demo
    pdfjs.GlobalWorkerOptions = pdfjs.GlobalWorkerOptions || {};
    if (!pdfjs.GlobalWorkerOptions.workerSrc) {
      pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
    }
    const arrayBuf = await file.arrayBuffer();
    const doc = await pdfjs.getDocument({ data: arrayBuf }).promise;
    const page = await doc.getPage(1);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: ctx, viewport }).promise;
    return canvas;
  } else {
    const imgUrl = URL.createObjectURL(file);
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = (e) => reject(e);
      i.src = imgUrl;
    });
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const maxDim = 1600;
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    canvas.width = Math.floor(img.width * scale);
    canvas.height = Math.floor(img.height * scale);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas;
  }
}

export type OcrResult = { text: string; confidence: number; words: OcrWord[] };

export async function ocrTextFromFile(file: File): Promise<OcrResult> {
  const { createWorker } = await import("tesseract.js");
  const canvas = await fileToCanvas(file);
  try {
    const worker = await createWorker("eng", 1, { logger: () => {} });
    const { data } = await worker.recognize(canvas);
    await worker.terminate();
    return {
      text: (data.text || "").toUpperCase(),
      confidence: typeof data.confidence === "number" ? data.confidence : 0,
      words:
        Array.isArray(data.words)
          ? data.words
              .filter((word: any) => word?.text)
              .map((word: any) => ({
                text: String(word.text || "").toUpperCase(),
                bbox: {
                  x0: Number(word.bbox?.x0 ?? 0),
                  y0: Number(word.bbox?.y0 ?? 0),
                  x1: Number(word.bbox?.x1 ?? 0),
                  y1: Number(word.bbox?.y1 ?? 0),
                },
                confidence: Number(word.confidence ?? 0),
              }))
          : [],
    };
  } catch (error) {
    console.warn("[ocr] failed to process ID document", error);
    return { text: "", confidence: 0, words: [] };
  }
}

export async function validateIdContent(file: File, idType: string): Promise<IdValidationResult> {
  const { text, confidence, words } = await ocrTextFromFile(file);
  const hasMrz = /P</.test(text) && /<{5,}/.test(text);
  const hasAadhaar = /\b\d{4}\s?\d{4}\s?\d{4}\b/.test(text);
  const hasEmiratesId = /\b784-\d{4}-\d{7}-\d\b/.test(text);
  const hasDriverWords = /\bDRIVER\b|\bLICENCE\b|\bLICENSE\b/.test(text);
  const hasStateId = /\bSTATE\b.*\bID\b|\bID\b.*\bSTATE\b/.test(text);
  const hasBrp = /\bRESIDENCE PERMIT\b|\bBRP\b/.test(text);

  let ok = false;
  switch (idType) {
    case "Passport":
      ok = hasMrz;
      break;
    case "Aadhaar":
      ok = hasAadhaar;
      break;
    case "Emirates ID":
      ok = hasEmiratesId;
      break;
    case "Driving Licence":
    case "Driver License":
      ok = hasDriverWords;
      break;
    case "State ID":
      ok = hasStateId;
      break;
    case "BRP":
      ok = hasBrp;
      break;
    default:
      ok = false;
  }

  if (ok) {
    return { ok: true, extractedText: text, words };
  }

  const fallbackAcceptable =
    text.replace(/\s+/g, "").length > 20 ||
    confidence < 40 ||
    /\bIDENTITY\b|\bGOVERNMENT\b|\bPERMIT\b/.test(text);

  if (fallbackAcceptable) {
    return {
      ok: true,
      extractedText: text,
      words,
      message: "We could not auto-verify this ID with high confidence. Flagged for manual review.",
    };
  }

  return { ok: false, message: `The uploaded file does not look like a valid ${idType}.` };
}


