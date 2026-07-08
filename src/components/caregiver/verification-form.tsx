"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";

export function VerificationForm({ existingUrl }: { existingUrl: string | null }) {
  const router = useRouter();
  const [url, setUrl] = useState<string | null>(existingUrl);
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!url) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/caregiver/verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idDocumentUrl: url }),
      });
      if (res.ok) router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <p className="text-sm text-sand-dim">
        Upload a clear photo of your Emirates ID, Iqama, or national ID. Our team reviews
        submissions within 1-2 business days.
      </p>
      <div className="mt-3">
        <FileUpload
          value={null}
          preview={false}
          accept="image/jpeg,image/png,application/pdf"
          label="ID document"
          onChange={setUrl}
        />
      </div>
      {url && (
        <Button size="sm" className="mt-3" onClick={submit} disabled={submitting}>
          {submitting ? "Submitting…" : "Submit for review"}
        </Button>
      )}
    </Card>
  );
}
