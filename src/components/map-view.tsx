"use client";

import * as React from "react";
import maplibregl from "maplibre-gl";
import { Loader2, MapPin, Plus, Search, X } from "lucide-react";
import { Map, MapControls, MapMarker } from "@/components/ui/map";
import type { Place } from "@/lib/types";
import {
  parseCoordinates,
  isShortGoogleLink,
  searchPlaces,
  reverseGeocode,
  type GeoResult,
} from "@/lib/geo";
import type { PendingSpot } from "./place-form";
import { cn } from "@/lib/utils";

export function MapView({
  places,
  pendingSpot,
  onMapReady,
  onSelectPlace,
  onNewSpot,
}: {
  places: Place[];
  pendingSpot: PendingSpot | null;
  onMapReady: (map: maplibregl.Map) => void;
  onSelectPlace: (place: Place) => void;
  onNewSpot: (spot: PendingSpot) => void;
}) {
  const mapRef = React.useRef<maplibregl.Map | null>(null);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<GeoResult[] | null>(null);
  const [searching, setSearching] = React.useState(false);
  const [searchError, setSearchError] = React.useState<string | null>(null);
  const [tapPoint, setTapPoint] = React.useState<{ lat: number; lng: number } | null>(null);
  const [resolvingTap, setResolvingTap] = React.useState(false);

  function flyTo(lat: number, lng: number, zoom = 15) {
    mapRef.current?.flyTo({ center: [lng, lat], zoom, duration: 1200 });
  }

  async function submitSearch() {
    const q = query.trim();
    if (!q) return;
    setSearchError(null);
    setResults(null);

    const coords = parseCoordinates(q);
    if (coords) {
      const spot: PendingSpot = { ...coords };
      flyTo(coords.lat, coords.lng);
      setResolvingTap(true);
      const geo = await reverseGeocode(coords.lat, coords.lng);
      setResolvingTap(false);
      onNewSpot(geo ? { ...spot, name: geo.name, address: geo.address } : spot);
      setQuery("");
      return;
    }

    if (isShortGoogleLink(q)) {
      setSearchError(
        "Los enlaces cortos de Google Maps no se pueden leer desde el navegador. Ábrelo en Maps y copia las coordenadas (mantén pulsado el pin), o busca el sitio por nombre."
      );
      return;
    }

    setSearching(true);
    try {
      const found = await searchPlaces(q);
      if (found.length === 0) {
        setSearchError("No se ha encontrado nada con ese nombre.");
      } else {
        setResults(found);
      }
    } catch {
      setSearchError("Error al buscar. Inténtalo de nuevo.");
    } finally {
      setSearching(false);
    }
  }

  function pickResult(r: GeoResult) {
    setResults(null);
    setQuery("");
    flyTo(r.lat, r.lng);
    onNewSpot({ lat: r.lat, lng: r.lng, name: r.name, address: r.address });
  }

  async function confirmTap() {
    if (!tapPoint) return;
    setResolvingTap(true);
    const geo = await reverseGeocode(tapPoint.lat, tapPoint.lng);
    setResolvingTap(false);
    onNewSpot(
      geo
        ? { ...tapPoint, name: geo.name, address: geo.address }
        : { ...tapPoint }
    );
    setTapPoint(null);
  }

  return (
    <div className="relative h-full w-full">
      <Map
        center={[2.55, 41.0]}
        zoom={4.2}
        onClick={(e) => setTapPoint({ lat: e.lngLat.lat, lng: e.lngLat.lng })}
        onLoad={(m) => {
          mapRef.current = m;
          onMapReady(m);
        }}
      >
        <MapControls position="bottom-right" showZoom showLocate />
        {places.map((p) => (
          <MapMarker
            key={p.id}
            longitude={p.lng}
            latitude={p.lat}
            onClick={() => onSelectPlace(p)}
          />
        ))}
        {tapPoint && !pendingSpot && (
          <MapMarker longitude={tapPoint.lng} latitude={tapPoint.lat} color="#3d3929" />
        )}
        {pendingSpot && (
          <MapMarker
            longitude={pendingSpot.lng}
            latitude={pendingSpot.lat}
            color="#3d3929"
          />
        )}
      </Map>

      {/* Search overlay */}
      <div className="absolute inset-x-3 top-3 z-10 mx-auto max-w-lg">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void submitSearch();
          }}
          className="flex items-center gap-2 rounded-2xl border border-border bg-card/95 px-3.5 py-2.5 shadow-lg backdrop-blur"
        >
          <Search className="h-4.5 w-4.5 shrink-0 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSearchError(null);
            }}
            placeholder="Busca un sitio, o pega enlace/coordenadas"
            className="w-full bg-transparent text-[15px] outline-none placeholder:text-muted-foreground/70"
            enterKeyHint="search"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setResults(null);
                setSearchError(null);
              }}
              className="rounded-full p-1 text-muted-foreground hover:bg-surface"
              aria-label="Borrar búsqueda"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            type="submit"
            disabled={searching || resolvingTap}
            className="shrink-0 rounded-xl bg-primary px-3 py-1.5 text-[13px] font-semibold text-white disabled:opacity-60"
          >
            {searching || resolvingTap ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Ir"
            )}
          </button>
        </form>

        {searchError && (
          <div className="mt-2 rounded-xl border border-border bg-card px-3.5 py-2.5 text-[13px] text-primary-strong shadow-lg">
            {searchError}
          </div>
        )}

        {results && (
          <ul className="mt-2 max-h-72 overflow-y-auto rounded-2xl border border-border bg-card shadow-lg">
            {results.map((r, i) => (
              <li key={i}>
                <button
                  onClick={() => pickResult(r)}
                  className={cn(
                    "flex w-full items-start gap-2.5 px-3.5 py-3 text-left hover:bg-surface",
                    i > 0 && "border-t border-border"
                  )}
                >
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>
                    <span className="block text-[14px] font-medium text-ink">
                      {r.name}
                    </span>
                    <span className="line-clamp-1 block text-[12px] text-muted-foreground">
                      {r.address}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Tap-to-add chip */}
      {tapPoint && !pendingSpot && (
        <div className="absolute inset-x-0 bottom-6 z-10 flex justify-center px-4">
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-card/95 p-2 pl-4 shadow-xl backdrop-blur">
            <span className="text-[13px] text-muted-foreground">
              {tapPoint.lat.toFixed(4)}, {tapPoint.lng.toFixed(4)}
            </span>
            <button
              onClick={() => void confirmTap()}
              disabled={resolvingTap}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-[13px] font-semibold text-white disabled:opacity-60"
            >
              {resolvingTap ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Añadir sitio aquí
            </button>
            <button
              onClick={() => setTapPoint(null)}
              className="rounded-full p-1.5 text-muted-foreground hover:bg-surface"
              aria-label="Cancelar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
