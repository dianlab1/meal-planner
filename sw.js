const CACHE_NAME = "meal-planner-cache-v1.3";

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(["index.html", "day.html", "style.css", "script.js", "day.js", "manifest.json", "icon-192.png", "icon-512.png"]);
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    self.clients.claim()
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((response) => {
        return response || fetch(event.request);
    })
  );
});