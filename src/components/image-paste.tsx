"use client";

import * as React from "react";
import { ClipboardPaste, ImagePlus, Loader2, X } from "lucide-react";
import { uploadImage, imageUrl } from "@/lib/supabase";
import { cn } from "@/lib/utils";

/**
 * Image input designed for pasting from the Gboard clipboard on Android:
 * long-press the field and choose "Pegar", or use the buttons.
 */
export function ImagePaste({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (path: string | null) => void;
}) {
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);

  async function handleBlob(blob: Blob) {
    setError(null);
    setBusy(true);
    try {
      const path = await uploadImage(blob);
      onChange(path);
    } catch {
      setError("No se pudo subir la imagen. Inténtalo otra vez.");
    } finally {
      setBusy(false);
    }
  }

  function onPaste(e: React.ClipboardEvent) {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) void handleBlob(file);
        return;
      }
    }
  }

  async function pasteFromClipboardApi() {
    setError(null);
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const type = item.types.find((t) => t.startsWith("image/"));
        if (type) {
          const blob = await item.getType(type);
          void handleBlob(blob);
          return;
        }
      }
      setError("No hay ninguna imagen en el portapapeles.");
    } catch {
      setError(
        "No se pudo leer el portapapeles. Mantén pulsado el recuadro y elige «Pegar»."
      );
    }
  }

  const url = imageUrl(value);

  if (url) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-border bg-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt="Imagen pegada" className="max-h-56 w-full object-cover" />
        <button
          type="button"
          onClick={() => onChange(null)}
          className="absolute right-2 top-2 rounded-full bg-ink/70 p-1.5 text-white"
          aria-label="Quitar imagen"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div
        tabIndex={0}
        onPaste={onPaste}
        className={cn(
          "flex min-h-24 cursor-text flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border bg-surface/60 px-4 py-5 text-center",
          "focus:outline-none focus:ring-2 focus:ring-primary/40"
        )}
      >
        {busy ? (
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        ) : (
          <>
            <ClipboardPaste className="h-6 w-6 text-primary" />
            <p className="text-[13px] text-muted-foreground">
              Mantén pulsado aquí y elige <b>Pegar</b> (imagen de Gboard)
            </p>
          </>
        )}
      </div>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={pasteFromClipboardApi}
          disabled={busy}
          className="flex-1 rounded-xl border border-border bg-card px-3 py-2 text-[13px] font-medium text-ink hover:bg-surface disabled:opacity-50"
        >
          <ClipboardPaste className="mr-1.5 inline h-4 w-4" />
          Pegar imagen
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="flex-1 rounded-xl border border-border bg-card px-3 py-2 text-[13px] font-medium text-ink hover:bg-surface disabled:opacity-50"
        >
          <ImagePlus className="mr-1.5 inline h-4 w-4" />
          Galería
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleBlob(f);
            e.target.value = "";
          }}
        />
      </div>
      {error && <p className="mt-1.5 text-[13px] text-primary-strong">{error}</p>}
    </div>
  );
}
