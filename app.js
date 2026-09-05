const STORAGE_KEY = "saved-places-v1";

const avatarPlaceholder = svgPlaceholder("C", "#d8b19f", "#6d4638", true);
const photoPlaceholder = svgPlaceholder("MILANO", "#d8c1ab", "#7e5541", false);

const seedPlaces = [
  { name: "Arco della Pace", city: "Milano", country: "Italia", visited: true, person: "Claudia", avatar: avatarPlaceholder, referenceImage: photoPlaceholder },
  { name: "Duomo di Milano", city: "Milano", country: "Italia", visited: true },
  { name: "Lago di Como", city: "Como", country: "Italia", visited: true },
  { name: "Apple Piazza Liberty", city: "Milano", country: "Italia", visited: true },
  { name: "Villa Monastero", city: "Varenna", country: "Italia", visited: false },
  { name: "San Giovanni Bianco", city: "Bergamo", country: "Italia", visited: false },
  { name: "Maranello", city: "Modena", country: "Italia", visited: false },
].map((place, index) => ({ ...place, id: `example-${index + 1}`, createdAt: index }));

const state = { places: loadPlaces(), filter: "all", search: "", avatar: "", referenceImage: "" };
const $ = (selector) => document.querySelector(selector);
const list = $("#places-list");
const sheetLayer = $("#sheet-layer");
const form = $("#place-form");

function svgPlaceholder(text, background, foreground, avatar) {
  const art = avatar
    ? `<circle cx="50" cy="39" r="17" fill="${foreground}" opacity=".7"/><path d="M18 100c3-27 19-40 32-40s29 13 32 40" fill="${foreground}" opacity=".7"/>`
    : `<path d="M0 75 31 39l18 21 15-14 36 42v12H0z" fill="${foreground}" opacity=".6"/><circle cx="72" cy="25" r="9" fill="${foreground}" opacity=".55"/><text x="50" y="94" text-anchor="middle" font-size="9" font-family="sans-serif" fill="white">${text}</text>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="${background}"/>${art}</svg>`)}`;
}

function loadPlaces() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : seedPlaces;
  } catch { return seedPlaces; }
}

function savePlaces() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.places)); }
  catch { showToast("No hay espacio para guardar más imágenes"); }
}

function escapeHtml(value = "") {
  const node = document.createElement("div");
  node.textContent = value;
  return node.innerHTML;
}

function render() {
  const query = state.search.trim().toLocaleLowerCase("es");
  const visible = [...state.places]
    .sort((a, b) => Number(a.visited) - Number(b.visited) || (a.createdAt ?? 0) - (b.createdAt ?? 0))
    .filter((place) => state.filter === "all" || (state.filter === "visited") === Boolean(place.visited))
    .filter((place) => place.name.toLocaleLowerCase("es").includes(query));

  const visited = state.places.filter((place) => place.visited).length;
  $("#total-count").textContent = `${state.places.length} ${state.places.length === 1 ? "lugar" : "lugares"}`;
  $("#visited-count").textContent = `${visited} ${visited === 1 ? "visitado" : "visitados"}`;
  list.innerHTML = visible.map(placeCard).join("");
  $("#empty-state").hidden = visible.length > 0;
}

function placeCard(place) {
  const hasReference = Boolean(place.person || place.avatar || place.referenceImage);
  const avatar = place.avatar || avatarPlaceholder;
  const photo = place.referenceImage || photoPlaceholder;
  return `<article class="place-card ${place.visited ? "visited" : ""} ${hasReference ? "has-reference" : ""}" data-id="${escapeHtml(place.id)}">
    <button class="card-edit" type="button" data-action="edit" aria-label="Editar ${escapeHtml(place.name)}"></button>
    <button class="check-button" type="button" data-action="toggle" aria-label="${place.visited ? "Marcar como pendiente" : "Marcar como visitado"}">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 7"></path></svg>
    </button>
    <div class="place-main">
      <h2>${escapeHtml(place.name)}</h2>
      <p class="location">${escapeHtml(place.city)} · ${escapeHtml(place.country)}</p>
      ${hasReference ? `<div class="seen-in"><span class="seen-label">Lo he visto en…</span><span class="person"><img class="person-avatar" src="${escapeHtml(avatar)}" alt="" />${escapeHtml(place.person || "Sin nombre")}</span></div>` : ""}
    </div>
    ${hasReference ? `<div class="reference-photo" aria-hidden="true"><img src="${escapeHtml(photo)}" alt="" /></div>` : ""}
  </article>`;
}

function openSheet(place = null) {
  form.reset();
  state.avatar = place?.avatar || "";
  state.referenceImage = place?.referenceImage || "";
  $("#place-id").value = place?.id || "";
  $("#place-name").value = place?.name || "";
  $("#place-city").value = place?.city || "";
  $("#place-country").value = place?.country || "";
  $("#place-visited").checked = Boolean(place?.visited);
  $("#person-name").value = place?.person || "";
  $("#sheet-title").textContent = place ? "Editar lugar" : "Añadir lugar";
  $("#delete-button").hidden = !place;
  $("#reference-fields").open = Boolean(place?.person || place?.avatar || place?.referenceImage);
  updatePreview("#avatar-preview", state.avatar);
  updatePreview("#reference-preview", state.referenceImage);
  sheetLayer.hidden = false;
  document.body.style.overflow = "hidden";
  requestAnimationFrame(() => { sheetLayer.classList.add("open"); $("#place-name").focus(); });
}

function closeSheet() {
  sheetLayer.classList.remove("open");
  document.body.style.overflow = "";
  setTimeout(() => { sheetLayer.hidden = true; }, 330);
}

function updatePreview(selector, image) {
  const preview = $(selector);
  preview.style.backgroundImage = image ? `url("${image}")` : "";
  preview.textContent = image ? "" : "+";
}

function readImage(file, target) {
  if (!file) return;
  if (!file.type.startsWith("image/")) return showToast("El archivo debe ser una imagen");
  const reader = new FileReader();
  reader.onload = () => {
    state[target] = reader.result;
    updatePreview(target === "avatar" ? "#avatar-preview" : "#reference-preview", reader.result);
  };
  reader.readAsDataURL(file);
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2200);
}

list.addEventListener("click", (event) => {
  const action = event.target.closest("[data-action]")?.dataset.action;
  const id = event.target.closest(".place-card")?.dataset.id;
  const place = state.places.find((item) => item.id === id);
  if (!place) return;
  if (action === "toggle") {
    place.visited = !place.visited;
    savePlaces(); render();
    showToast(place.visited ? "Marcado como visitado" : "Marcado como pendiente");
  } else if (action === "edit") openSheet(place);
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const id = $("#place-id").value;
  const person = $("#person-name").value.trim();
  const data = {
    id: id || (crypto.randomUUID?.() || `place-${Date.now()}`),
    name: $("#place-name").value.trim(), city: $("#place-city").value.trim(), country: $("#place-country").value.trim(),
    visited: $("#place-visited").checked, person,
    avatar: person ? state.avatar : "", referenceImage: person ? state.referenceImage : "",
    createdAt: id ? state.places.find((place) => place.id === id)?.createdAt : Date.now(),
  };
  if (id) state.places = state.places.map((place) => place.id === id ? data : place);
  else state.places.push(data);
  savePlaces(); render(); closeSheet(); showToast(id ? "Lugar actualizado" : "Lugar añadido");
});

$("#delete-button").addEventListener("click", () => {
  const id = $("#place-id").value;
  if (!id || !confirm("¿Eliminar este lugar de tu lista?")) return;
  state.places = state.places.filter((place) => place.id !== id);
  savePlaces(); render(); closeSheet(); showToast("Lugar eliminado");
});

$("#search-input").addEventListener("input", (event) => { state.search = event.target.value; render(); });
document.querySelectorAll(".filter").forEach((button) => button.addEventListener("click", () => {
  document.querySelectorAll(".filter").forEach((item) => { item.classList.toggle("active", item === button); item.setAttribute("aria-pressed", item === button); });
  state.filter = button.dataset.filter; render();
}));
$("#add-button").addEventListener("click", () => openSheet());
$("#empty-add-button").addEventListener("click", () => openSheet());
$("#close-sheet").addEventListener("click", closeSheet);
$("#sheet-backdrop").addEventListener("click", closeSheet);
document.addEventListener("keydown", (event) => { if (event.key === "Escape" && !sheetLayer.hidden) closeSheet(); });
$("#avatar-input").addEventListener("change", (event) => readImage(event.target.files[0], "avatar"));
$("#reference-input").addEventListener("change", (event) => readImage(event.target.files[0], "referenceImage"));

$("#data-menu-button").addEventListener("click", () => {
  const menu = $("#data-menu"); menu.hidden = !menu.hidden;
  $("#data-menu-button").setAttribute("aria-expanded", !menu.hidden);
});
$("#export-button").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(state.places, null, 2)], { type: "application/json" });
  const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "lugares-guardados.json"; link.click(); URL.revokeObjectURL(link.href);
  $("#data-menu").hidden = true; showToast("Datos exportados");
});
$("#import-button").addEventListener("click", () => $("#import-input").click());
$("#import-input").addEventListener("change", async (event) => {
  try {
    const imported = JSON.parse(await event.target.files[0].text());
    if (!Array.isArray(imported) || imported.some((place) => !place.name || !place.city || !place.country)) throw new Error();
    state.places = imported.map((place, index) => ({ ...place, id: String(place.id || `imported-${Date.now()}-${index}`), visited: Boolean(place.visited) }));
    savePlaces(); render(); showToast("Datos importados correctamente");
  } catch { showToast("El archivo JSON no es válido"); }
  event.target.value = ""; $("#data-menu").hidden = true;
});

render();
