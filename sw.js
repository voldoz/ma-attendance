// خدمة الإشعارات — نظام الحضور والغياب
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
// فتح أحدث نسخة من النظام دائمًا (وعند انقطاع الإنترنت تُفتح آخر نسخة محفوظة)
const PAGES = 'pages-v1';
self.addEventListener('fetch', (e) => {
  const r = e.request;
  if (r.mode !== 'navigate' || r.method !== 'GET') return;
  e.respondWith((async () => {
    try {
      const res = await fetch(r, { cache: 'no-store' });
      if (res && res.ok) { const c = await caches.open(PAGES); c.put(new URL(r.url).pathname, res.clone()); }
      return res;
    } catch (err) {
      const c = await caches.open(PAGES); const hit = await c.match(new URL(r.url).pathname);
      if (hit) return hit; throw err;
    }
  })());
});
self.addEventListener('push', (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { d = { body: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(d.title || 'تنبيه جديد', {
    body: d.body || '', icon: 'icon-192.png', badge: 'icon-192.png', dir: 'rtl', lang: 'ar',
    tag: d.tag || undefined, data: { url: './' } }));
});
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
    for (const c of list) { if ('focus' in c) { c.postMessage({ type: 'open-alerts' }); return c.focus(); } }
    return self.clients.openWindow('./?alerts=1');
  }));
});
