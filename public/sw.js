const cacheName = 'politica-v1'
const shell = ['/offline.html', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(cacheName).then((cache) => cache.addAll(shell)))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== cacheName).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return
  }

  const url = new URL(event.request.url)
  if (url.origin !== self.location.origin) {
    return
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(fromNetwork(event.request))
    return
  }

  if (shell.includes(url.pathname)) {
    event.respondWith(fromCache(event.request))
  }
})

async function fromNetwork(request) {
  try {
    return await fetch(request)
  } catch {
    const cached = await caches.match('/offline.html')
    if (cached) {
      return cached
    }

    return new Response('Sin conexión', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }
}

async function fromCache(request) {
  const cached = await caches.match(request)
  if (cached) {
    return cached
  }

  const response = await fetch(request)
  const cache = await caches.open(cacheName)
  await cache.put(request, response.clone())
  return response
}
