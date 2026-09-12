(()=>{
'use strict';
const APP='bookflix_v4';
const qs=s=>document.querySelector(s);
const nativeFetch=window.fetch.bind(window);
const mem=new Map();
window.fetch=async(input,init={})=>{
 const url=typeof input==='string'?input:input?.url||'';
 if(!/openlibrary\.org|covers\.openlibrary\.org/.test(url))return nativeFetch(input,init);
 const isSearch=/openlibrary\.org\/search\.json/.test(url);
 if(isSearch){const hit=mem.get(url);if(hit&&Date.now()-hit.t<10*60*1000)return new Response(hit.body,{status:200,headers:{'Content-Type':'application/json'}})}
 const ctl=new AbortController();const timer=setTimeout(()=>ctl.abort(),9000);
 try{const r=await nativeFetch(input,{...init,signal:init.signal||ctl.signal});if(isSearch&&r.ok){const body=await r.clone().text();mem.set(url,{t:Date.now(),body})}return r}catch(e){if(isSearch){const hit=mem.get(url);if(hit)return new Response(hit.body,{status:200,headers:{'Content-Type':'application/json'}})}throw e}finally{clearTimeout(timer)}
};
function setup(){
 const search=qs('#q');if(search){search.setAttribute('aria-label','Rechercher un livre ou un auteur');search.setAttribute('enterkeyhint','search')}
 const actions=document.querySelector('.actions');
 if(actions&&!qs('#bf-reset')){const b=document.createElement('button');b.id='bf-reset';b.type='button';b.className='btn ghost tiny bf-clear';b.textContent='↺ Recommencer';b.onclick=()=>{if(!confirm('Recommencer le profil ? Tes favoris et tes notes seront conservés.'))return;if(typeof S!=='undefined'){S.selected=[];S.hidden=[];S.mood='';S.results=[];S.current=[];localStorage.setItem(APP,JSON.stringify(S))}if(qs('#mood'))qs('#mood').value='';if(qs('#profileBox'))qs('#profileBox').style.display='none';if(typeof renderBooks==='function'&&typeof seeds!=='undefined')renderBooks(seeds);window.scrollTo({top:0,behavior:'smooth'})};actions.appendChild(b)}
 const nav=document.querySelector('nav');if(nav&&!qs('#bf-online')){const s=document.createElement('span');s.id='bf-online';s.className='bf-online';s.innerHTML='<i class="bf-dot"></i><span>En ligne</span>';nav.appendChild(s);const r=()=>{s.classList.toggle('off',!navigator.onLine);s.querySelector('span').textContent=navigator.onLine?'En ligne':'Hors ligne'};addEventListener('online',r);addEventListener('offline',r);r()}
}
addEventListener('beforeinstallprompt',e=>{e.preventDefault();window.__bfInstallEvent=e});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&document.activeElement?.id==='mood'&&typeof window.recommend==='function'){e.preventDefault();window.recommend()}});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup();
})();
