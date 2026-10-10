/* Service Worker دفتر یادداشت برداری مهران
   - آفلاین کار کردن کامل برنامه
   - نسخه جدید index.html همیشه اول از اینترنت گرفته می‌شه (بروز می‌مونه)
   - فونت وزیرمتن و کتابخانه‌ها بعد از اولین بار کش می‌شن (آفلاین هم کار می‌کنن)
   - درخواست‌های Supabase هیچ‌وقت کش نمی‌شن */
const VERSION='mn-v3.2.0';
const CORE=['./','./index.html','./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png'];
const WARM=['https://cdn.jsdelivr.net/npm/vazirmatn@33.0.3/Vazirmatn-font-face.css','https://cdn.jsdelivr.net/npm/marked/marked.min.js','https://cdn.jsdelivr.net/npm/mammoth@1.8.0/mammoth.browser.min.js','https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js'];
const CDN=['cdn.jsdelivr.net','unpkg.com','fonts.googleapis.com','fonts.gstatic.com'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(VERSION).then(c=>c.addAll(CORE).then(()=>Promise.all(WARM.map(u=>c.add(u).catch(()=>{}))))).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET') return;
  const url=new URL(req.url);
  if(url.hostname.endsWith('supabase.co')||url.pathname.startsWith('/rest/')||url.pathname.startsWith('/auth/')) return;
  if(url.origin===location.origin){ // اول شبکه (بدون کش قدیمی مرورگر)، اگه نبود از کش
    e.respondWith(fetch(req,{cache:'no-cache'}).then(r=>{ const cp=r.clone(); if(r.ok) caches.open(VERSION).then(c=>c.put(req,cp)); return r; })
      .catch(()=>caches.match(req,{ignoreSearch:true}).then(r=>r||(req.mode==='navigate'?caches.match('./index.html'):Response.error())))); return; }
  if(CDN.includes(url.hostname)){ // فونت و کتابخانه‌ها: اول کش
    e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(r=>{ const cp=r.clone(); if(r.ok||r.type==='opaque') caches.open(VERSION).then(c=>c.put(req,cp)); return r; }))); }
});
