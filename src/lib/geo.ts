export type GeoResult = {
  name: string;
  address: string;
  lat: number;
  lng: number;
};

/**
 * Extract coordinates from raw "lat, lng" text or a Google Maps URL.
 * Supported: "41.9, 9.17", .../@41.9,9.17,15z/..., ?q=41.9,9.17,
 * ?query=41.9,9.17, !3d41.9!4d9.17.
 * Short links (maps.app.goo.gl) can't be expanded from the browser.
 */
export function parseCoordinates(text: string): { lat: number; lng: number } | null {
  const t = text.trim();

  const plain = t.match(/^(-?\d{1,3}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)$/);
  if (plain) {
    const lat = parseFloat(plain[1]);
    const lng = parseFloat(plain[2]);
    if (valid(lat, lng)) return { lat, lng };
  }

  if (/^https?:\/\//i.test(t)) {
    const bang = t.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
    if (bang) {
      const lat = parseFloat(bang[1]);
      const lng = parseFloat(bang[2]);
      if (valid(lat, lng)) return { lat, lng };
    }
    const at = t.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
    if (at) {
      const lat = parseFloat(at[1]);
      const lng = parseFloat(at[2]);
      if (valid(lat, lng)) return { lat, lng };
    }
    const q = t.match(/[?&](?:q|query|ll|destination)=(-?\d+(?:\.\d+)?)(?:,|%2C)(-?\d+(?:\.\d+)?)/i);
    if (q) {
      const lat = parseFloat(q[1]);
      const lng = parseFloat(q[2]);
      if (valid(lat, lng)) return { lat, lng };
    }
  }

  return null;
}

function valid(lat: number, lng: number) {
  return Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
}

export function isShortGoogleLink(text: string): boolean {
  return /https?:\/\/(maps\.app\.goo\.gl|goo\.gl\/maps)\//i.test(text.trim());
}

/** Search places by name using OpenStreetMap Nominatim (free, no key). */
export async function searchPlaces(query: string): Promise<GeoResult[]> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "6");
  url.searchParams.set("addressdetails", "0");
  const res = await fetch(url.toString(), {
    headers: { "Accept-Language": "es" },
  });
  if (!res.ok) throw new Error("Error buscando el sitio");
  const data: Array<{ display_name: string; name?: string; lat: string; lon: string }> =
    await res.json();
  return data.map((d) => ({
    name: d.name || d.display_name.split(",")[0],
    address: d.display_name,
    lat: parseFloat(d.lat),
    lng: parseFloat(d.lon),
  }));
}

/** Reverse-geocode a tapped point to suggest a name/address. */
export async function reverseGeocode(lat: number, lng: number): Promise<GeoResult | null> {
  try {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("lat", String(lat));
    url.searchParams.set("lon", String(lng));
    url.searchParams.set("format", "jsonv2");
    const res = await fetch(url.toString(), {
      headers: { "Accept-Language": "es" },
    });
    if (!res.ok) return null;
    const d: { display_name?: string; name?: string } = await res.json();
    if (!d.display_name) return null;
    return {
      name: d.name || d.display_name.split(",")[0],
      address: d.display_name,
      lat,
      lng,
    };
  } catch {
    return null;
  }
}

export function googleMapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}
