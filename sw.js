const CACHE='bookflix-shell-v10';
const SHELL=['/','/index.html','/manifest.json','/icon.svg','/enhancements.js','/learning.js','/product.js','/intelligence.js','/growth.js','/quality.js'];
const isOpenLibrary=u=>u.hostname==='openlibrary.org'||u.hostname==='covers.openlibrary.org';
const isPage=r=>r&&r.ok&&r.headers.get('content-type')?.includes('text/html');
async function enhancedResponse(response){
  if(!isPage(response))return response;
  try{
    const text=await response.text();
    const hasEnh=text.includes('/enhancements.js'),hasLearning=text.includes('/learning.js'),hasProduct=text.includes('/product.js'),hasIntel=text.includes('/intelligence.js'),hasGrowth=text.includes('/growth.js'),hasQuality=text.includes('/quality.js');
    const scripts=`${hasEnh?'':'<script src="/enhancements.js"></script>'}${hasLearning?'':'<script src="/learning.js"></script>'}${hasProduct?'':'<script src="/product.js"></script>'}${hasIntel?'':'<script src="/intelligence.js"></script>'}${hasGrowth?'':'<script src="/growth.js"></script>'}${hasQuality?'':'<script src="/quality.js"></script>'}`;
    if(!scripts)return new Response(text,{status:response.status,statusText:response.statusText,headers:response.headers});
    const injected=text.replace('</body>',`${scripts}</body>`);
    const headers=new Headers(response.headers);headers.delete('content-length');
    return new Response(injected,{status:response.status,statusText:response.statusText,headers});
  }catch{return response}
}
async function cachePage(cache,url,response){const enhanced=await enhancedResponse(response.clone());await cache.put(url,enhanced.clone());return enhanced}
self.addEventListener('install',event=>event.waitUntil((async()=>{
  const c=await caches.open(CACHE);
  for(const url of SHELL){try{const r=await fetch(url,{cache:'no-store'});if(url==='/'||url==='/index.html')await cachePage(c,url,r);else if(r.ok)await c.put(url,r)}catch{}}
  await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{const u=new URL(event.request.url);if(event.request.method!=='GET')return;
  if(u.origin===location.origin){event.respondWith((async()=>{const cached=await caches.match(event.request);try{const network=await fetch(event.request);if(network.ok){if(isPage(network))return await cachePage(await caches.open(CACHE),event.request,network);const copy=network.clone();caches.open(CACHE).then(c=>c.put(event.request,copy))}return network}catch{return cached||caches.match('/index.html')}})());return}
  if(isOpenLibrary(u))event.respondWith(caches.match(event.request).then(cached=>{const network=fetch(event.request).then(r=>{if(r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(event.request,copy))}return r}).catch(()=>cached);return cached||network}));
});
