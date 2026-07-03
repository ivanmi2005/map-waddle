"use client";

import * as React from "react";
import { ExternalLink, MapPin, Trash2 } from "lucide-react";
import type { Collection, Place, Ref } from "@/lib/types";
import { imageUrl } from "@/lib/supabase";

export function RefCard({
  r,
  place,
  collection,
  onPlaceClick,
  onDelete,
}: {
  r: Ref;
  place?: Place | null;
  collection?: Collection | null;
  onPlaceClick?: (place: Place) => void;
  onDelete?: () => void;
}) {
  const img = imageUrl(r.image_path);
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      {img && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={img} alt={r.title ?? "Referencia"} className="w-full object-cover" />
      )}
      <div className="space-y-1.5 p-3">
        {r.title && <p className="text-[14px] font-semibold leading-snug text-ink">{r.title}</p>}
        {(r.source_name || r.source_url) && (
          <p className="text-[13px] text-muted-foreground">
            {r.source_url ? (
              <a
                href={r.source_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-medium text-primary-strong underline-offset-2 hover:underline"
              >
                {r.source_name || "Ver enlace"}
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : (
              <span className="font-medium">{r.source_name}</span>
            )}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          {place && (
            <button
              onClick={() => onPlaceClick?.(place)}
              className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2 py-0.5 text-[12px] font-medium text-primary-strong"
            >
              <MapPin className="h-3 w-3" />
              {place.name}
            </button>
          )}
          {collection && (
            <span className="rounded-full bg-surface px-2 py-0.5 text-[12px] text-muted-foreground">
              {collection.emoji ? `${collection.emoji} ` : ""}
              {collection.name}
            </span>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="ml-auto rounded-full p-1 text-muted-foreground/60 hover:bg-surface hover:text-primary-strong"
              aria-label="Eliminar referencia"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
