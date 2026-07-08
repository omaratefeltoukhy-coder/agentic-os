"use client";

import { useRef, useState } from "react";
import Image from "next/image";

export function FileUpload({
  value,
  onChange,
  label,
  accept = "image/jpeg,image/png,image/webp",
  preview = true,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  label: string;
  accept?: string;
  preview?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Upload failed");
        return;
      }
      onChange(data.url);
    } catch {
      setError("Network error during upload.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      <div className="flex items-center gap-3">
        {preview && value && (
          <div className="h-16 w-16 overflow-hidden rounded-lg border border-petrol-lighter bg-petrol-light">
            <Image src={value} alt="" width={64} height={64} className="h-full w-full object-cover" />
          </div>
        )}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="rounded-lg border border-petrol-lighter bg-petrol-light px-4 py-2 text-sm text-sand hover:border-gold disabled:opacity-50"
        >
          {uploading ? "Uploading…" : value ? `Replace ${label}` : `Upload ${label}`}
        </button>
        {value && !uploading && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-xs text-sand-dim hover:text-danger"
          >
            Remove
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-danger">{error}</p>}
    </div>
  );
}
