"use client";

/**
 * mapcn-style map components built on MapLibre GL JS.
 *
 * The mapcn registry (https://mapcn.dev) was unreachable from the build
 * environment, so this file provides the same public API surface:
 * <Map>, <MapControls>, <MapMarker>, <MapPopup> imported from
 * "@/components/ui/map", rendered inside a sized container.
 */

import * as React from "react";
import { createPortal } from "react-dom";
import maplibregl from "maplibre-gl";
import { cn } from "@/lib/utils";

const DEFAULT_STYLE =
  "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json";

const BLANK_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {},
  layers: [
    { id: "background", type: "background", paint: { "background-color": "#faf9f5" } },
  ],
};

type MapContextValue = { map: maplibregl.Map | null };

const MapContext = React.createContext<MapContextValue>({ map: null });

export function useMap() {
  return React.useContext(MapContext);
}

export type MapProps = {
  center?: [number, number];
  zoom?: number;
  blank?: boolean;
  styleUrl?: string;
  className?: string;
  children?: React.ReactNode;
  onClick?: (e: { lngLat: { lng: number; lat: number } }) => void;
  onLoad?: (map: maplibregl.Map) => void;
};

export function Map({
  center = [0, 20],
  zoom = 2,
  blank = false,
  styleUrl,
  className,
  children,
  onClick,
  onLoad,
}: MapProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [map, setMap] = React.useState<maplibregl.Map | null>(null);
  const onClickRef = React.useRef(onClick);
  onClickRef.current = onClick;
  const onLoadRef = React.useRef(onLoad);
  onLoadRef.current = onLoad;

  React.useEffect(() => {
    if (!containerRef.current) return;
    const m = new maplibregl.Map({
      container: containerRef.current,
      style: blank ? BLANK_STYLE : styleUrl || DEFAULT_STYLE,
      center,
      zoom,
      attributionControl: { compact: true },
    });
    m.on("click", (e) => onClickRef.current?.(e));
    m.on("load", () => onLoadRef.current?.(m));
    setMap(m);
    return () => {
      m.remove();
      setMap(null);
    };
    // The map is created once; center/zoom afterwards are driven imperatively.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blank, styleUrl]);

  return (
    <div ref={containerRef} className={cn("relative h-full w-full", className)}>
      <MapContext.Provider value={{ map }}>{map ? children : null}</MapContext.Provider>
    </div>
  );
}

export type MapControlsProps = {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  showZoom?: boolean;
  showCompass?: boolean;
  showLocate?: boolean;
};

export function MapControls({
  position = "bottom-right",
  showZoom = true,
  showCompass = false,
  showLocate = false,
}: MapControlsProps) {
  const { map } = useMap();

  React.useEffect(() => {
    if (!map) return;
    const controls: maplibregl.IControl[] = [];
    if (showZoom || showCompass) {
      const nav = new maplibregl.NavigationControl({
        showZoom,
        showCompass,
      });
      map.addControl(nav, position);
      controls.push(nav);
    }
    if (showLocate) {
      const geo = new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
      });
      map.addControl(geo, position);
      controls.push(geo);
    }
    return () => controls.forEach((c) => map.removeControl(c));
  }, [map, position, showZoom, showCompass, showLocate]);

  return null;
}

export type MapMarkerProps = {
  longitude: number;
  latitude: number;
  color?: string;
  onClick?: () => void;
  children?: React.ReactNode;
};

export function MapMarker({
  longitude,
  latitude,
  color = "#d97757",
  onClick,
  children,
}: MapMarkerProps) {
  const { map } = useMap();
  const markerRef = React.useRef<maplibregl.Marker | null>(null);
  const [customEl, setCustomEl] = React.useState<HTMLDivElement | null>(null);
  const onClickRef = React.useRef(onClick);
  onClickRef.current = onClick;

  React.useEffect(() => {
    if (!map) return;
    let marker: maplibregl.Marker;
    if (children) {
      const el = document.createElement("div");
      setCustomEl(el);
      marker = new maplibregl.Marker({ element: el });
    } else {
      marker = new maplibregl.Marker({ color });
    }
    marker.setLngLat([longitude, latitude]).addTo(map);
    const el = marker.getElement();
    el.style.cursor = "pointer";
    const handle = (e: MouseEvent) => {
      e.stopPropagation();
      onClickRef.current?.();
    };
    el.addEventListener("click", handle);
    markerRef.current = marker;
    return () => {
      el.removeEventListener("click", handle);
      marker.remove();
      markerRef.current = null;
      setCustomEl(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, color, !!children]);

  React.useEffect(() => {
    markerRef.current?.setLngLat([longitude, latitude]);
  }, [longitude, latitude]);

  if (children && customEl) {
    return createPortal(children, customEl);
  }
  return null;
}

export type MapPopupProps = {
  longitude: number;
  latitude: number;
  onClose?: () => void;
  children?: React.ReactNode;
  offset?: number;
};

export function MapPopup({
  longitude,
  latitude,
  onClose,
  children,
  offset = 14,
}: MapPopupProps) {
  const { map } = useMap();
  const [container] = React.useState(() =>
    typeof document !== "undefined" ? document.createElement("div") : null
  );
  const onCloseRef = React.useRef(onClose);
  onCloseRef.current = onClose;

  React.useEffect(() => {
    if (!map || !container) return;
    const popup = new maplibregl.Popup({ offset, closeButton: false })
      .setLngLat([longitude, latitude])
      .setDOMContent(container)
      .addTo(map);
    popup.on("close", () => onCloseRef.current?.());
    return () => {
      popup.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, container]);

  if (!container) return null;
  return createPortal(children, container);
}
