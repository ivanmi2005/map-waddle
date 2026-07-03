"use client";

import * as React from "react";
import { ImagePlus } from "lucide-react";
import type { Collection, Place, Ref } from "@/lib/types";
import { deleteRef } from "@/lib/data";
import { RefCard } from "./ref-card";
import { btnPrimary } from "./sheet";
import { cn } from "@/lib/utils";

export function RefsView({
  refs,
  places,
  collections,
  onNewRef,
  onPlaceClick,
  onChanged,
}: {
  refs: Ref[];
  places: Place[];
  collections: Collection[];
  onNewRef: () => void;
  onPlaceClick: (place: Place) => void;
  onChanged: () => void;
}) {
  const [filter, setFilter] = React.useState<string | null>(null);

  const visible = filter ? refs.filter((r) => r.collection_id === filter) : refs;

  async function remove(id: string) {
    await deleteRef(id);
    onChanged();
  }

  return (
    <div className="mx-auto h-full w-full max-w-lg overflow-y-auto px-4 pb-24 pt-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-ink">Referencias</h1>
        <button className={btnPrimary + " !py-2 !text-[13px]"} onClick={onNewRef}>
          <ImagePlus className="h-4 w-4" />
          Nueva
        </button>
      </div>

      {collections.length > 0 && (
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          <FilterChip active={filter === null} onClick={() => setFilter(null)}>
            Todas
          </FilterChip>
          {collections.map((c) => (
            <FilterChip
              key={c.id}
              active={filter === c.id}
              onClick={() => setFilter(filter === c.id ? null : c.id)}
            >
              {c.emoji ? `${c.emoji} ` : ""}
              {c.name}
            </FilterChip>
          ))}
        </div>
      )}

      {visible.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-4xl">🖼️</p>
          <p className="mt-3 text-[15px] font-medium text-ink">
            Aún no hay referencias
          </p>
          <p className="mx-auto mt-1 max-w-xs text-[13px] leading-relaxed text-muted-foreground">
            Guarda capturas del portapapeles, enlaces de vídeos y cuentas que te
            inspiren, sueltas o unidas a un sitio del mapa.
          </p>
        </div>
      ) : (
        <div className="columns-2 gap-3 [&>*]:mb-3 [&>*]:break-inside-avoid">
          {visible.map((r) => (
            <RefCard
              key={r.id}
              r={r}
              place={places.find((p) => p.id === r.place_id)}
              collection={collections.find((c) => c.id === r.collection_id)}
              onPlaceClick={onPlaceClick}
              onDelete={() => remove(r.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-3 py-1.5 text-[13px] font-medium transition",
        active
          ? "border-primary bg-primary text-white"
          : "border-border bg-card text-muted-foreground hover:bg-surface"
      )}
    >
      {children}
    </button>
  );
}
