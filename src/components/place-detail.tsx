"use client";

import * as React from "react";
import { ExternalLink, Plus, Trash2 } from "lucide-react";
import type { Collection, Place, Ref } from "@/lib/types";
import { deletePlace, deleteRef } from "@/lib/data";
import { googleMapsUrl } from "@/lib/geo";
import { Sheet, btnGhost, btnPrimary } from "./sheet";
import { RefCard } from "./ref-card";

export function PlaceDetail({
  place,
  refs,
  collections,
  onClose,
  onAddRef,
  onChanged,
}: {
  place: Place | null;
  refs: Ref[];
  collections: Collection[];
  onClose: () => void;
  onAddRef: (place: Place) => void;
  onChanged: () => void;
}) {
  const collection = place
    ? collections.find((c) => c.id === place.collection_id)
    : null;
  const placeRefs = place ? refs.filter((r) => r.place_id === place.id) : [];

  async function removePlace() {
    if (!place) return;
    if (!confirm(`¿Eliminar «${place.name}» y sus referencias?`)) return;
    await deletePlace(place.id);
    onChanged();
    onClose();
  }

  async function removeRef(id: string) {
    await deleteRef(id);
    onChanged();
  }

  return (
    <Sheet open={!!place} onClose={onClose} title={place?.name}>
      {place && (
        <div className="space-y-4">
          {(place.address || collection) && (
            <div className="space-y-1.5">
              {place.address && (
                <p className="text-[13px] leading-snug text-muted-foreground">
                  {place.address}
                </p>
              )}
              {collection && (
                <span className="inline-block rounded-full bg-surface px-2.5 py-1 text-[12px] font-medium text-muted-foreground">
                  {collection.emoji ? `${collection.emoji} ` : ""}
                  {collection.name}
                </span>
              )}
            </div>
          )}

          {place.description && (
            <p className="text-[15px] leading-relaxed text-foreground">
              {place.description}
            </p>
          )}

          <div className="flex gap-2">
            <a
              href={googleMapsUrl(place.lat, place.lng)}
              target="_blank"
              rel="noreferrer"
              className={btnPrimary + " flex-1"}
            >
              <ExternalLink className="h-4 w-4" />
              Google Maps
            </a>
            <button className={btnGhost + " flex-1"} onClick={() => onAddRef(place)}>
              <Plus className="h-4 w-4" />
              Referencia
            </button>
          </div>

          {placeRefs.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">
                Referencias · {placeRefs.length}
              </h3>
              <div className="space-y-3">
                {placeRefs.map((r) => (
                  <RefCard
                    key={r.id}
                    r={r}
                    collection={collections.find((c) => c.id === r.collection_id)}
                    onDelete={() => removeRef(r.id)}
                  />
                ))}
              </div>
            </div>
          )}

          <button
            onClick={removePlace}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-[13px] font-medium text-muted-foreground hover:text-primary-strong"
          >
            <Trash2 className="h-4 w-4" />
            Eliminar sitio
          </button>
        </div>
      )}
    </Sheet>
  );
}
