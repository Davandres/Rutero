const SHELL = "rutero-shell-v1", TILES = "rutero-tiles-v1";
const ARCHIVOS = ["./", "./index.html", "./manifest.json",
  "https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js",
  "https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(ARCHIVOS)));
  self.skipWaiting();
});
self.addEventListener("activate", e => e.waitUntil(clients.claim()));

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  if (url.hostname === "tile.openstreetmap.org") {
    e.respondWith(caches.open(TILES).then(async c => {
      const hit = await c.match(e.request);
      if (hit) return hit;
      try { const r = await fetch(e.request); c.put(e.request, r.clone()); return r; }
      catch { return Response.error(); }
    }));
    return;
  }
  if (url.hostname.includes("google.com") || url.hostname.includes("googleusercontent.com")) return; // los datos los maneja la app
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request)));
});
