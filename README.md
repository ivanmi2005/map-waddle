# Checklist personal de lugares

Mini app web, mobile-first y sin frameworks, para guardar los lugares que
quieres visitar. Los datos y las imágenes subidas se conservan localmente en
el navegador mediante `localStorage`. La lista comienza vacía para que cada
persona añada únicamente sus propios lugares.

## Desarrollo

```bash
npm run dev
```

Después abre <http://localhost:3000>.

## Despliegue en Vercel

El repositorio está preparado como un sitio estático sin framework. Al
importarlo en Vercel no hace falta cambiar ningún ajuste: `vercel.json`
ejecuta `npm run build` y publica la carpeta `dist`.

También puedes desplegarlo con la CLI:

```bash
vercel
```

No necesita variables de entorno. Ten en cuenta que cada dominio y navegador
mantiene su propio `localStorage`; usa la exportación JSON antes de cambiar de
dominio o dispositivo si quieres trasladar tus lugares.

## Estructura

- `index.html`: estructura accesible, controles y formulario inferior.
- `style.css`: interfaz responsive y paleta cálida.
- `app.js`: CRUD, filtros, búsqueda, imágenes y persistencia.
- `vercel.json`: configuración del build y publicación en Vercel.

No requiere servicios externos. La exportación JSON permite hacer una copia
de seguridad (incluidas las imágenes) y volver a importarla.
