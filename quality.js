(()=>{
'use strict';
const boot=()=>{
 if(window.__bfQuality)return;window.__bfQuality=true;
 const native=window.fetch.bind(window);
 window.fetch=async function(input,init){
  try{
   const raw=typeof input==='string'?input:(input&&input.url)||'';
   if(raw.includes('openlibrary.org/search.json')){
    const u=new URL(raw,location.href);
    const n=Math.max(16,Math.min(40,Number(u.searchParams.get('limit')||16)));
    u.searchParams.set('limit',String(n));
    if(!u.searchParams.has('lang'))u.searchParams.set('lang','fr');
    input=typeof input==='string'?u.toString():new Request(u.toString(),input);
   }
  }catch{}
  return native(input,init);
 };
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
