"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import type { Collection, Place } from "@/lib/types";
import { createRef } from "@/lib/data";
import { Sheet, inputCls, labelCls, btnPrimary } from "./sheet";
import { CollectionSelect } from "./collection-select";
import { ImagePaste } from "./image-paste";

export function RefForm({
  open,
  place,
  places,
  collections,
  onCollectionCreated,
  onClose,
  onSaved,
}: {
  open: boolean;
  /** When set, the reference is attached to this place. */
  place?: Place | null;
  /** When standalone, allow optionally linking to an existing place. */
  places?: Place[];
  collections: Collection[];
  onCollectionCreated: (c: Collection) => void;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = React.useState("");
  const [sourceName, setSourceName] = React.useState("");
  const [sourceUrl, setSourceUrl] = React.useState("");
  const [imagePath, setImagePath] = React.useState<string | null>(null);
  const [collectionId, setCollectionId] = React.useState<string | null>(null);
  const [placeId, setPlaceId] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setTitle("");
      setSourceName("");
      setSourceUrl("");
      setImagePath(null);
      setPlaceId(place?.id ?? null);
      setCollectionId(place?.collection_id ?? null);
      setError(null);
    }
  }, [open, place]);

  const hasContent =
    title.trim() || sourceName.trim() || sourceUrl.trim() || imagePath;

  async function save() {
    if (!hasContent) return;
    setBusy(true);
    setError(null);
    try {
      await createRef({
        title: title.trim() || undefined,
        source_name: sourceName.trim() || undefined,
        source_url: sourceUrl.trim() || undefined,
        image_path: imagePath,
        place_id: place?.id ?? placeId,
        collection_id: collectionId,
      });
      onSaved();
    } catch {
      setError("No se pudo guardar. Comprueba tu conexión.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={place ? `Referencia en ${place.name}` : "Nueva referencia"}
    >
      <div className="space-y-4">
        <div>
          <label className={labelCls}>Imagen (pega del portapapeles)</label>
          <ImagePaste value={imagePath} onChange={setImagePath} />
        </div>

        <div>
          <label className={labelCls}>Título</label>
          <input
            className={inputCls}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Camiseta que quiero, sitio del vídeo…"
          />
        </div>

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

        {!place && places && (
          <div>
            <label className={labelCls}>Sitio (opcional)</label>
            <select
              className={inputCls}
              value={placeId ?? ""}
              onChange={(e) => setPlaceId(e.target.value || null)}
            >
              <option value="">Sin sitio</option>
              {places.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className={labelCls}>Colección</label>
          <CollectionSelect
            collections={collections}
            value={collectionId}
            onChange={setCollectionId}
            onCreated={onCollectionCreated}
          />
        </div>

        {error && <p className="text-[13px] text-primary-strong">{error}</p>}

        <button
          className={btnPrimary + " w-full"}
          disabled={busy || !hasContent}
          onClick={save}
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          Guardar referencia
        </button>
      </div>
    </Sheet>
  );
}
