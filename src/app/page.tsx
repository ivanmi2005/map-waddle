"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import type maplibregl from "maplibre-gl";
import { Images, Loader2, Map as MapIcon } from "lucide-react";
import type { Collection, Place, Ref } from "@/lib/types";
import { loadAll } from "@/lib/data";
import { PlaceForm, type PendingSpot } from "@/components/place-form";
import { PlaceDetail } from "@/components/place-detail";
import { RefForm } from "@/components/ref-form";
import { RefsView } from "@/components/refs-view";
import { cn } from "@/lib/utils";

const MapView = dynamic(
  () => import("@/components/map-view").then((m) => m.MapView),
  { ssr: false }
);

type Tab = "map" | "refs";

export default function Home() {
  const [tab, setTab] = React.useState<Tab>("map");
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState(false);
  const [places, setPlaces] = React.useState<Place[]>([]);
  const [refs, setRefs] = React.useState<Ref[]>([]);
  const [collections, setCollections] = React.useState<Collection[]>([]);

  const [pendingSpot, setPendingSpot] = React.useState<PendingSpot | null>(null);
  const [selectedPlace, setSelectedPlace] = React.useState<Place | null>(null);
  const [refFormOpen, setRefFormOpen] = React.useState(false);
  const [refFormPlace, setRefFormPlace] = React.useState<Place | null>(null);

  const mapRef = React.useRef<maplibregl.Map | null>(null);

  const reload = React.useCallback(async () => {
    try {
      const data = await loadAll();
      setPlaces(data.places);
      setRefs(data.refs);
      setCollections(data.collections);
      setLoadError(false);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void reload();
  }, [reload]);

  function addCollection(c: Collection) {
    setCollections((prev) => [...prev, c]);
  }

  function goToPlace(place: Place) {
    setTab("map");
    setSelectedPlace(place);
    mapRef.current?.flyTo({ center: [place.lng, place.lat], zoom: 15, duration: 1000 });
  }

  return (
    <div className="flex h-dvh flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border bg-background px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xl">🐧</span>
          <div>
            <h1 className="text-[15px] font-bold leading-tight text-ink">Waddle</h1>
            <p className="text-[11px] leading-tight text-muted-foreground">
              Tus sitios y referencias de viaje
            </p>
          </div>
        </div>
        {loading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
      </header>

      {/* Views (both stay mounted so the map keeps its state) */}
      <main className="relative min-h-0 flex-1">
        <div className={cn("absolute inset-0", tab !== "map" && "invisible")}>
          <MapView
            places={places}
            pendingSpot={pendingSpot}
            onMapReady={(m) => {
              mapRef.current = m;
            }}
            onSelectPlace={setSelectedPlace}
            onNewSpot={setPendingSpot}
          />
        </div>
        <div
          className={cn(
            "absolute inset-0 bg-background",
            tab !== "refs" && "invisible"
          )}
        >
          <RefsView
            refs={refs}
            places={places}
            collections={collections}
            onNewRef={() => {
              setRefFormPlace(null);
              setRefFormOpen(true);
            }}
            onPlaceClick={goToPlace}
            onChanged={() => void reload()}
          />
        </div>

        {loadError && (
          <div className="absolute inset-x-4 top-4 z-20 mx-auto max-w-lg rounded-xl border border-border bg-card px-4 py-3 text-[13px] text-primary-strong shadow-lg">
            No se pudieron cargar tus datos.{" "}
            <button className="font-semibold underline" onClick={() => void reload()}>
              Reintentar
            </button>
          </div>
        )}
      </main>

      {/* Bottom tab bar */}
      <nav className="flex border-t border-border bg-background pb-[env(safe-area-inset-bottom)]">
        <TabButton
          active={tab === "map"}
          onClick={() => setTab("map")}
          icon={<MapIcon className="h-5 w-5" />}
          label="Mapa"
          badge={places.length}
        />
        <TabButton
          active={tab === "refs"}
          onClick={() => setTab("refs")}
          icon={<Images className="h-5 w-5" />}
          label="Referencias"
          badge={refs.length}
        />
      </nav>

      {/* Sheets */}
      <PlaceForm
        spot={pendingSpot}
        collections={collections}
        onCollectionCreated={addCollection}
        onClose={() => setPendingSpot(null)}
        onSaved={() => {
          setPendingSpot(null);
          void reload();
        }}
      />
      <PlaceDetail
        place={selectedPlace}
        refs={refs}
        collections={collections}
        onClose={() => setSelectedPlace(null)}
        onAddRef={(p) => {
          setRefFormPlace(p);
          setRefFormOpen(true);
        }}
        onChanged={() => void reload()}
      />
      <RefForm
        open={refFormOpen}
        place={refFormPlace}
        places={places}
        collections={collections}
        onCollectionCreated={addCollection}
        onClose={() => setRefFormOpen(false)}
        onSaved={() => {
          setRefFormOpen(false);
          void reload();
        }}
      />
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition",
        active ? "text-primary-strong" : "text-muted-foreground"
      )}
    >
      <span className="relative">
        {icon}
        {badge != null && badge > 0 && (
          <span className="absolute -right-3 -top-1.5 rounded-full bg-primary px-1.5 text-[10px] font-bold leading-4 text-white">
            {badge}
          </span>
        )}
      </span>
      {label}
    </button>
  );
}
