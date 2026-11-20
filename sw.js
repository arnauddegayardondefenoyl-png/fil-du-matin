/* Le journal d'Arnaud : service worker (appli installée, lecture hors ligne) */
const V='fdm-v31';
const CORE=['./','./index.html','./manifest.json','./img/icon-192.png','./img/icon-512.png'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(V).then(c=>c.addAll(CORE).catch(()=>{})).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET') return; const u=new URL(r.url); if(u.origin!==location.origin) return;
  const page=r.mode==='navigate'||/\.html$|\/$/.test(u.pathname)||/data\/.*\.json$/.test(u.pathname);
  if(page){ /* réseau d'abord : l'édition du jour est toujours fraîche ; cache si hors ligne */
    e.respondWith(fetch(r,{cache:'no-cache'}).then(res=>{ const c=res.clone(); caches.open(V).then(x=>x.put(r,c)); return res; }).catch(()=>caches.match(r).then(m=>m||caches.match('./index.html'))));
    return; }
  /* images, cartes, polices : cache d'abord */
  e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{ if(res.ok&&!r.headers.get('range')){ const c=res.clone(); caches.open(V).then(x=>x.put(r,c)); } return res; })));
});
