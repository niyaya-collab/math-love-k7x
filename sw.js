const VERSION = "love-eq-v1";
const CORE = [
  "./",
  "./index.html",
  "./css/style.css",
  "./manifest.webmanifest",
  "./js/main.js",
  "./js/config.js",
  "./js/i18n.js",
  "./js/storage.js",
  "./js/tree.js",
  "./js/latex.js",
  "./js/messages.js",
  "./js/recipes.js",
  "./js/recognize.js",
  "./js/editor.js",
  "./js/notebook.js",
  "./js/heart.js",
  "./js/audio.js",
  "./js/background.js",
  "./js/share.js",
  "./assets/vendor/katex/katex.min.js",
  "./assets/vendor/katex/katex.min.css",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== VERSION).map((key) => caches.delete(key)))).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(VERSION).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => caches.match(event.request).then((hit) => hit || caches.match("./index.html"))),
  );
});
