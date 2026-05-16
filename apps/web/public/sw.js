// StoryVerse Service Worker for Background Audio & Persistence
const CACHE_NAME = 'sv-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Basic fetch handler (can be expanded for offline cache)
self.addEventListener('fetch', (event) => {
  // Pass through
});

// Listen for messages from the main thread (Persistence)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SYNC_AUDIO_STATE') {
    // Logic to persist audio state if needed in IndexedDB or similar
  }
});
