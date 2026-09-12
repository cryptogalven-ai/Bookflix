const CACHE='bookflix-shell-v5';
const SHELL=['/','/index.html','/manifest.json','/icon.svg','/enhancements.js','/learning.js'];
const isOpenLibrary=u=>u.hostname==='openlibrary.org'||u.hostname==='covers.openlibrary.org';
const isPage=r=>r&&r.ok&&r.headers.get('content-type')?.includes('text/html');
async function enhancedResponse(response){
  if(!isPage(response))return response;
  try{
    const text=await response.text();
    if(text.includes('/enhancements.js'))return new Response(text,{status:response.status,statusText:response.statusText,headers:response.headers});
    const injected=text.replace('</body>','<script src="/enhancements.js"></script><script src="/learning.js"></script></body>');
    const headers=new Headers(response.headers);headers.delete('content-length');
    return new Response(injected,{status:response.status,statusText:response.statusText,headers:headers});
  }catch{return response}
}
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{const u=new URL(event.request.url);if(event.request.method!=='GET')return;
  if(u.origin===location.origin){event.respondWith((async()=>{const cached=await caches.match(event.request);try{const network=await fetch(event.request);if(network.ok){const copy=network.clone();caches.open(CACHE).then(c=>c.put(event.request,copy))}return await enhancedResponse(network)}catch{return cached||caches.match('/index.html')}})());return}
  if(isOpenLibrary(u))event.respondWith(caches.match(event.request).then(cached=>{const network=fetch(event.request).then(r=>{if(r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(event.request,copy))}return r}).catch(()=>cached);return cached||network}));
});
