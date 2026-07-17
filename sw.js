/**
 * Service Worker para ORION React App
 * Proporciona funcionalidad offline y cacheo de recursos
 */

const CACHE_NAME = 'orion-app-v4';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/improvements.js'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache abierto');
        return cache.addAll(URLS_TO_CACHE);
      })
      .catch((error) => {
        console.error('Error instalando Service Worker:', error);
      })
  );
});

// Activar Service Worker
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia de caché: Network First, fallback a Cache
self.addEventListener('fetch', (event) => {
  // Solo controlamos peticiones al propio origen (los archivos de la app).
  // Las peticiones a la API de Supabase (u otro origen) van siempre directas
  // a la red — cachearlas dejaba la app leyendo datos viejos para siempre.
  if (new URL(event.request.url).origin !== self.location.origin) return;

  // Para requests POST (como API), usar Network first
  if (event.request.method === 'POST') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Si es exitoso, guardar en cache para fallback
          if (response && response.status === 200) {
            const clonedResponse = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, clonedResponse);
              });
          }
          return response;
        })
        .catch(() => {
          // Si falla la red, intenta cache
          return caches.match(event.request);
        })
    );
  } else {
    // Para requests GET (recursos), usar Cache first
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            return response;
          }

          return fetch(event.request).then((response) => {
            // No cachear respuestas no-exitosas
            if (!response || response.status !== 200) {
              return response;
            }

            const clonedResponse = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, clonedResponse);
              });

            return response;
          });
        })
        .catch(() => {
          // Fallback para páginas HTML
          return caches.match('/index.html');
        })
    );
  }
});

// Background sync para sincronizar sesiones offline
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-sessions') {
    event.waitUntil(syncOfflineSessions());
  }
});

// Función para sincronizar sesiones offline
async function syncOfflineSessions() {
  try {
    // Abrir IndexedDB
    const db = await openIndexedDB();
    const unsynced = await getUnsyncedSessions(db);

    for (const session of unsynced) {
      try {
        const response = await fetch('/api/sessions/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(session)
        });

        if (response.ok) {
          await markSessionSynced(db, session.id);
        }
      } catch (error) {
        console.error('Error sincronizando sesión:', error);
      }
    }
  } catch (error) {
    console.error('Error en sync:', error);
  }
}

// Helpers para IndexedDB
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('OrionOfflineDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('sessions')) {
        db.createObjectStore('sessions', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

function getUnsyncedSessions(db) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['sessions'], 'readonly');
    const store = tx.objectStore('sessions');
    const request = store.getAll();
    
    request.onsuccess = () => {
      const unsynced = request.result.filter(s => !s.synced);
      resolve(unsynced);
    };
    request.onerror = () => reject(request.error);
  });
}

function markSessionSynced(db, sessionId) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['sessions'], 'readwrite');
    const store = tx.objectStore('sessions');
    const request = store.get(sessionId);
    
    request.onsuccess = () => {
      const data = request.result;
      if (data) {
        data.synced = true;
        store.put(data);
        resolve();
      }
    };
    request.onerror = () => reject(request.error);
  });
}

console.log('Service Worker cargado');
