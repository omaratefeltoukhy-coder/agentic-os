import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_BYTES = 8 * 1024 * 1024; // 8MB

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

export async function saveUploadedFile(file: File) {
  if (!ALLOWED_TYPES[file.type]) {
    throw new Error("Unsupported file type. Use JPG, PNG, WEBP, or PDF.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("File is too large (max 8MB).");
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const ext = ALLOWED_TYPES[file.type];
  const filename = `${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);

  return `/uploads/${filename}`;
}
