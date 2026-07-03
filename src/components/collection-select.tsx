"use client";

import * as React from "react";
import type { Collection } from "@/lib/types";
import { createCollection } from "@/lib/data";
import { inputCls } from "./sheet";

export function CollectionSelect({
  collections,
  value,
  onChange,
  onCreated,
}: {
  collections: Collection[];
  value: string | null;
  onChange: (id: string | null) => void;
  onCreated: (c: Collection) => void;
}) {
  const [creating, setCreating] = React.useState(false);
  const [name, setName] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  async function create() {
    const trimmed = name.trim();
    if (!trimmed) return;
    setBusy(true);
    try {
      const c = await createCollection(trimmed);
      onCreated(c);
      onChange(c.id);
      setCreating(false);
      setName("");
    } finally {
      setBusy(false);
    }
  }

  if (creating) {
    return (
      <div className="flex gap-2">
        <input
          className={inputCls}
          placeholder="Nombre de la colección (p. ej. Milán 2026)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
        <button
          type="button"
          disabled={busy || !name.trim()}
          onClick={create}
          className="shrink-0 rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          Crear
        </button>
        <button
          type="button"
          onClick={() => setCreating(false)}
          className="shrink-0 rounded-xl border border-border px-3 py-2 text-sm"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <select
      className={inputCls}
      value={value ?? ""}
      onChange={(e) => {
        if (e.target.value === "__new__") {
          setCreating(true);
        } else {
          onChange(e.target.value || null);
        }
      }}
    >
      <option value="">Sin colección</option>
      {collections.map((c) => (
        <option key={c.id} value={c.id}>
          {c.emoji ? `${c.emoji} ` : ""}
          {c.name}
        </option>
      ))}
      <option value="__new__">＋ Nueva colección…</option>
    </select>
  );
}
