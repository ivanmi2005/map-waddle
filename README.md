# 🐧 Waddle — Mapa de sitios y referencias de viaje

App personal para guardar sitios en un mapa con sus referencias e inspiración
(cuentas, enlaces de vídeos, imágenes pegadas del portapapeles), pensada para
consultarla en el móvil mientras viajas.

## Funciones

- **Mapa** (MapLibre GL, estilo mapcn): busca sitios por nombre (Nominatim),
  toca el mapa para marcar un punto, o pega coordenadas / enlaces de Google
  Maps en el buscador.
- **Sitios**: nombre, descripción, colección y referencias asociadas
  (p. ej. `@ishowspeed` + enlace del vídeo). Botón para abrirlo en Google Maps.
- **Referencias**: galería de imágenes/enlaces, sueltas o unidas a un sitio,
  con colecciones para filtrar. Las imágenes se pegan directamente del
  portapapeles (Gboard) o se suben desde la galería.
- **Datos** en Supabase (tablas `travel_*` + bucket `travel-images`).
- Paleta clara estilo Claude (beige `#faf9f5`, naranja `#d97757`).

## Desarrollo

```bash
npm install
npm run dev
```

Variables opcionales (hay valores por defecto en `src/lib/supabase.ts`):
ver `.env.example`.

## Estructura

- `src/components/ui/map.tsx` — componentes de mapa estilo mapcn
  (`Map`, `MapControls`, `MapMarker`, `MapPopup`) sobre maplibre-gl.
- `src/components/` — vistas del mapa y referencias, formularios y hojas.
- `src/lib/` — cliente de Supabase, tipos, geocodificación y parseo de enlaces.
