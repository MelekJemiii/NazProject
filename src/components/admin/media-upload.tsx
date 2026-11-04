"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Bucket = "covers" | "videos" | "pdfs";

/**
 * Uploads a file directly to Supabase Storage (admin RLS allows it) and writes
 * the resulting public URL into a hidden input named `name`.
 */
export function MediaUpload({
  name,
  bucket,
  accept,
  label,
  defaultValue,
}: {
  name: string;
  bucket: Bucket;
  accept: string;
  label: string;
  defaultValue?: string | null;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [progress, setProgress] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus("uploading");
    setProgress(file.name);
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (error) {
      setStatus("error");
      setProgress(error.message);
      return;
    }
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    setUrl(data.publicUrl);
    setStatus("idle");
    setProgress("");
  }

  return (
    <div>
      <span className="mb-1 block text-sm font-bold text-ink">{label}</span>
      <input type="hidden" name={name} value={url} readOnly />
      <div className="flex flex-wrap items-center gap-3">
        <label className="cursor-pointer rounded-full border-2 border-ink px-4 py-1.5 text-sm font-bold text-ink hover:bg-ink hover:text-paper">
          {status === "uploading" ? "Envoi…" : "Choisir un fichier"}
          <input
            type="file"
            accept={accept}
            onChange={handleFile}
            className="hidden"
            disabled={status === "uploading"}
          />
        </label>
        {url && status === "idle" && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-maths underline"
          >
            Fichier actuel
          </a>
        )}
      </div>
      {progress && (
        <p
          className="mt-1 text-xs"
          style={{ color: status === "error" ? "var(--francais)" : "var(--ink-soft)" }}
        >
          {status === "error" ? `Erreur : ${progress}` : progress}
        </p>
      )}
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="…ou colle une URL"
        className="mt-2 w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ink"
      />
    </div>
  );
}
