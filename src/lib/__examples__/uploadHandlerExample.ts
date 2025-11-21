/**
 * Example: Integration of generic ID masking in upload handler
 * 
 * This demonstrates how to use maskID() at the upload handler level
 * to ensure raw IDs are never stored or exposed.
 */

import { maskID, safeLogID, type IDType } from "../idMasking";

/**
 * Example upload handler function
 * This should be called when processing uploaded ID documents
 */
export async function processUploadedID(
  file: File,
  idType: IDType,
  extractedIdValue: string
): Promise<{
  maskedId: string;
  previewUrl: string;
  metadata: Record<string, unknown>;
}> {
  // SECURITY: Mask the ID immediately upon extraction
  // Raw IDs should NEVER be stored, logged, or sent to client
  const maskedId = maskID(idType, extractedIdValue);

  // Safe logging (does not expose raw ID)
  safeLogID(idType, maskedId, "upload-handler");

  // Process the file and create preview (implementation specific)
  const previewUrl = await createMaskedPreview(file, idType, extractedIdValue);

  // Prepare metadata - ONLY include masked ID
  const metadata = {
    idType,
    maskedId, // Only masked value stored
    uploadedAt: new Date().toISOString(),
    fileSize: file.size,
    fileName: file.name,
    // NOTE: extractedIdValue is NOT included in metadata
  };

  // In a real backend, you would:
  // 1. Store only maskedId in database
  // 2. Never log raw extractedIdValue
  // 3. Use secure backend services for verification without exposing raw IDs

  return {
    maskedId,
    previewUrl,
    metadata,
  };
}

/**
 * Example: API response handler
 * Ensures API responses never contain raw IDs
 */
export function createAPIResponse(data: {
  idType: string;
  idValue: string; // This should already be masked, but we double-check
  [key: string]: unknown;
}): Record<string, unknown> {
  // Double-check: ensure ID is masked before sending response
  const safeId = maskID(data.idType, data.idValue);

  return {
    ...data,
    idValue: safeId, // Overwrite with masked value
    // Raw ID never exposed in API response
  };
}

/**
 * Example: Database storage
 * Ensures only masked IDs are stored
 */
export function prepareDatabaseRecord(
  userId: string,
  idType: IDType,
  rawIdValue: string
): {
  userId: string;
  idType: IDType;
  maskedId: string; // Only masked value stored
  createdAt: string;
} {
  return {
    userId,
    idType,
    maskedId: maskID(idType, rawIdValue), // Mask before storage
    createdAt: new Date().toISOString(),
  };
}

/**
 * Example: Logging utility
 * Ensures logs never contain raw IDs
 */
export function logIDEvent(
  event: string,
  idType: IDType,
  idValue: string,
  context?: string
): void {
  const maskedId = maskID(idType, idValue);
  const contextStr = context ? `[${context}] ` : "";
  
  // Log with masked ID only
  console.log(`${contextStr}Event: ${event}, ID Type: ${idType}, Masked ID: ${maskedId}`);
  
  // NEVER log raw ID:
  // ❌ console.log(`Raw ID: ${idValue}`); // SECURITY VIOLATION
  // ✅ console.log(`Masked ID: ${maskedId}`); // CORRECT
}

// Placeholder for preview creation (implementation specific)
async function createMaskedPreview(
  file: File,
  idType: IDType,
  rawIdValue: string
): Promise<string> {
  // In real implementation, this would:
  // 1. Process the image/PDF
  // 2. Apply visual masking to the document
  // 3. Return a data URL or file path
  
  // For this example, we just return a placeholder
  return `data:image/jpeg;base64,...`;
}



