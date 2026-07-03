"use client";

import * as React from "react";
import { Loader2, MapPin } from "lucide-react";
import type { Collection } from "@/lib/types";
import { createPlace, createRef } from "@/lib/data";
import { Sheet, inputCls, labelCls, btnPrimary } from "./sheet";
import { CollectionSelect } from "./collection-select";
import { ImagePaste } from "./image-paste";

export type PendingSpot = {
  lat: number;
  lng: number;
  name?: string;
  address?: string;
};

export function PlaceForm({
  spot,
  collections,
  onCollectionCreated,
  onClose,
  onSaved,
}: {
  spot: PendingSpot | null;
  collections: Collection[];
  onCollectionCreated: (c: Collection) => void;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [collectionId, setCollectionId] = React.useState<string | null>(null);
  const [sourceName, setSourceName] = React.useState("");
  const [sourceUrl, setSourceUrl] = React.useState("");
  const [imagePath, setImagePath] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (spot) {
      setName(spot.name ?? "");
      setDescription("");
      setSourceName("");
      setSourceUrl("");
      setImagePath(null);
      setError(null);
    }
  }, [spot]);

  async function save() {
    if (!spot || !name.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const place = await createPlace({
        name: name.trim(),
        description: description.trim() || undefined,
        lat: spot.lat,
        lng: spot.lng,
        address: spot.address,
        collection_id: collectionId,
      });
      if (sourceName.trim() || sourceUrl.trim() || imagePath) {
        await createRef({
          source_name: sourceName.trim() || undefined,
          source_url: sourceUrl.trim() || undefined,
          image_path: imagePath,
          place_id: place.id,
          collection_id: collectionId,
        });
      }
      onSaved();
    } catch {
      setError("No se pudo guardar. Comprueba tu conexión.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Sheet open={!!spot} onClose={onClose} title="Añadir sitio">
      {spot && (
        <div className="space-y-4">
          <p className="flex items-start gap-1.5 text-[13px] text-muted-foreground">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span className="line-clamp-2">
              {spot.address ?? `${spot.lat.toFixed(5)}, ${spot.lng.toFixed(5)}`}
            </span>
          </p>

          <div>
            <label className={labelCls}>Nombre *</label>
            <input
              className={inputCls}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tienda del AC Milan"
            />
          </div>

          <div>
            <label className={labelCls}>Descripción</label>
            <textarea
              className={inputCls}
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Qué quiero hacer / ver aquí…"
            />
          </div>

          <div>
            <label className={labelCls}>Colección</label>
            <CollectionSelect
              collections={collections}
              value={collectionId}
              onChange={setCollectionId}
              onCreated={onCollectionCreated}
            />
          </div>

          <div className="rounded-2xl border border-border bg-surface/50 p-3.5">
            <p className="mb-3 text-[13px] font-semibold text-ink">
              ¿De dónde lo has sacado? <span className="font-normal text-muted-foreground">(opcional)</span>
            </p>
            <div className="space-y-3">
              <div>
                <label className={labelCls}>Cuenta / fuente</label>
                <input
                  className={inputCls}
                  value={sourceName}
                  onChange={(e) => setSourceName(e.target.value)}
                  placeholder="@ishowspeed"
                />
              </div>
              <div>
                <label className={labelCls}>Enlace del vídeo / foto</label>
                <input
                  className={inputCls}
                  type="url"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://…"
                />
              </div>
              <div>
                <label className={labelCls}>Imagen</label>
                <ImagePaste value={imagePath} onChange={setImagePath} />
              </div>
            </div>
          </div>

          {error && <p className="text-[13px] text-primary-strong">{error}</p>}

          <button
            className={btnPrimary + " w-full"}
            disabled={busy || !name.trim()}
            onClick={save}
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Guardar sitio
          </button>
        </div>
      )}
    </Sheet>
  );
}
