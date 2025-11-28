import { Client } from "@replit/object-storage";

let client: Client | null = null;
let initError: string | null = null;

function getClient(): Client | null {
  if (!client && !initError) {
    try {
      client = new Client();
    } catch (error) {
      initError = error instanceof Error ? error.message : "Failed to initialize App Storage";
      console.warn("App Storage not available:", initError);
    }
  }
  return client;
}

export interface UploadResult {
  ok: boolean;
  path?: string;
  error?: string;
}

export async function uploadFile(
  buffer: Buffer,
  fileName: string
): Promise<UploadResult> {
  const storageClient = getClient();
  if (!storageClient) {
    return { ok: false, error: initError || "App Storage not available" };
  }

  try {
    const result = await storageClient.uploadFromBytes(fileName, buffer);
    
    if (result.ok) {
      return { ok: true, path: fileName };
    } else {
      return { ok: false, error: result.error?.message || "Upload failed" };
    }
  } catch (error) {
    console.error("App Storage upload error:", error);
    return { ok: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function downloadFile(fileName: string): Promise<Buffer | null> {
  const storageClient = getClient();
  if (!storageClient) {
    console.warn("App Storage not available for download");
    return null;
  }

  try {
    const result = await storageClient.downloadAsBytes(fileName);
    if (result.ok && result.value) {
      return result.value[0];
    }
    return null;
  } catch (error) {
    console.error("App Storage download error:", error);
    return null;
  }
}

export async function deleteFile(fileName: string): Promise<boolean> {
  const storageClient = getClient();
  if (!storageClient) {
    console.warn("App Storage not available for delete");
    return false;
  }

  try {
    const result = await storageClient.delete(fileName);
    return result.ok;
  } catch (error) {
    console.error("App Storage delete error:", error);
    return false;
  }
}

export async function listFiles(prefix?: string): Promise<string[]> {
  const storageClient = getClient();
  if (!storageClient) {
    console.warn("App Storage not available for listing");
    return [];
  }

  try {
    const options = prefix ? { prefix } : undefined;
    const result = await storageClient.list(options);
    if (result.ok && result.value) {
      return result.value.map((obj) => obj.name);
    }
    return [];
  } catch (error) {
    console.error("App Storage list error:", error);
    return [];
  }
}

export async function fileExists(fileName: string): Promise<boolean> {
  const storageClient = getClient();
  if (!storageClient) {
    return false;
  }

  try {
    const result = await storageClient.exists(fileName);
    return result.ok && result.value === true;
  } catch (error) {
    console.error("App Storage exists error:", error);
    return false;
  }
}

export function isStorageAvailable(): boolean {
  return getClient() !== null;
}
