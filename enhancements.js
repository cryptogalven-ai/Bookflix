(()=>{
  'use strict';
  const APP='bookflix_v4';
  const qs=s=>document.querySelector(s), qsa=s=>[...document.querySelectorAll(s)];
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  const nativeFetch=window.fetch.bind(window);
  const mem=new Map();
  window.fetch=async(input,init={})=>{
    const url=typeof input==='string'?input:input?.url||'';
    if(!/openlibrary\.org|covers\.openlibrary\.org/.test(url)) return nativeFetch(input,init);
    const isSearch=/openlibrary\.org\/search\.json/.test(url);
    if(isSearch){
      const hit=mem.get(url);
      if(hit && Date.now()-hit.t<10*60*1000) return new Response(hit.body,{status:200,headers:{'Content-Type':'application/json'}});
    }
    const ctl=new AbortController();
    const timer=setTimeout(()=>ctl.abort(),9000);
    try{
      const r=await nativeFetch(input,{...init,signal:init.signal||ctl.signal});
      if(isSearch && r.ok){const body=await r.clone().text();mem.set(url,{t:Date.now(),body});}
      return r;
    }finally{clearTimeout(timer)}
  };

  function addStyles(){
    if(qs('#bf-enhance-style')) return;
    const s=document.createElement('style');s.id='bf-enhance-style';s.textContent=`
      .bf-tools{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
      .bf-pwa{position:fixed;right:18px;bottom:18px;z-index:30;box-shadow:0 12px 35px #0008}
      .bf-online{display:inline-flex;align-items:center;gap:6px;border:1px solid #292c35;background:#101218;color:#aeb3be;border-radius:999px;padding:6px 9px;font-size:11px}
      .bf-online.off{color:#ff7b83;border-color:#5a252a}.bf-dot{width:7px;height:7px;border-radius:50%;background:#54d98b}.off .bf-dot{background:#ff5962}
      .bf-clear{margin-left:auto}.bf-history-title{grid-column:1/-1;margin-top:8px;font-weight:900;font-size:15px}
      .bf-history-item{display:flex;justify-content:space-between;gap:10px;align-items:center;grid-column:1/-1;background:#0c0e13;border:1px solid #292c35;border-radius:14px;padding:12px}
      .bf-history-item small{color:#777e8d}.bf-kbd{font-size:10px;border:1px solid #393d47;border-radius:5px;padding:2px 5px;color:#8e94a0}
      @media(max-width:720px){.bf-pwa{left:18px;right:18px;width:calc(100% - 36px)}}`;
    document.head.appendChild(s);
  }

  function button(text,cls='btn ghost tiny'){
    const b=document.createElement('button');b.className=cls;b.type='button';b.textContent=text;return b;
  }

  function setupTools(){
    const actions=qs('.actions');
    if(actions && !qs('#bf-reset')){
      const reset=button('↺ Recommencer','btn ghost tiny bf-clear');reset.id='bf-reset';
      reset.title='Effacer les livres du profil sans supprimer ta bibliothèque';
      reset.onclick=()=>{
        if(!confirm('Recommencer le profil ? Tes favoris et tes notes seront conservés.')) return;
        if(typeof S!=='undefined'){S.selected=[];S.hidden=[];S.mood='';S.results=[];S.current=[];localStorage.setItem(APP,JSON.stringify(S));}
        const mood=qs('#mood');if(mood)mood.value='';const pb=qs('#profileBox');if(pb)pb.style.display='none';
        if(typeof renderBooks==='function'&&typeof seeds!=='undefined')renderBooks(seeds);window.scrollTo({top:0,behavior:'smooth'});
      };
      actions.appendChild(reset);
    }
    const search=qs('#q');
    if(search && !qs('#bf-search-hint')){
      search.setAttribute('aria-label','Rechercher un livre ou un auteur');
      search.setAttribute('enterkeyhint','search');
      const hint=document.createElement('span');hint.id='bf-search-hint';hint.className='hint';hint.innerHTML='Entrée pour rechercher <span class="bf-kbd">↵</span>';
      search.parentElement.appendChild(hint);
    }
    const nav=qs('nav');
    if(nav && !qs('#bf-online')){
      const state=document.createElement('span');state.id='bf-online';state.className='bf-online';state.innerHTML='<i class="bf-dot"></i><span>En ligne</span>';nav.appendChild(state);
      const refresh=()=>{state.classList.toggle('off',!navigator.onLine);state.querySelector('span').textContent=navigator.onLine?'En ligne':'Hors ligne';};
      addEventListener('online',refresh);addEventListener('offline',refresh);refresh();
    }
  }

  function wireLearning(){
    if(typeof window.rate==='function' && !window.rate.__bfWrapped){
      const original=window.rate;
      const wrapped=function(title,n){
        original(title,n);
        try{ if(typeof S!=='undefined' && n<=2 && !S.hidden.includes(title)) S.hidden.push(title); if(typeof S!=='undefined')localStorage.setItem(APP,JSON.stringify(S)); }catch{}
        if(typeof window.recommend==='function' && typeof S!=='undefined' && S.selected?.length>=3) setTimeout(()=>window.recommend(),80);
      };
      wrapped.__bfWrapped=true;window.rate=wrapped;
    }
  }

  let deferredInstall=null;
  addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;showInstall();});
  function showInstall(){
    if(qs('#bf-install')||!deferredInstall) return;
    const b=button('＋ Installer Bookflix','btn bf-pwa');b.id='bf-install';b.onclick=async()=>{
      deferredInstall.prompt();
      try{await deferredInstall.userChoice}catch{}
      deferredInstall=null;b.remove();
    };document.body.appendChild(b);
  }
  addEventListener('appinstalled',()=>{deferredInstall=null;qs('#bf-install')?.remove();});

  document.addEventListener('keydown',e=>{
    if(e.key!=='Enter'||e.shiftKey) return;
    const a=document.activeElement;
    if(a?.id==='mood' && typeof window.recommend==='function'){e.preventDefault();recommend();}
  });

  document.addEventListener('error',e=>{
    const el=e.target;if(!(el instanceof HTMLImageElement)) return;
    el.style.display='none';
  },true);

  addStyles();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{setupTools();wireLearning();},{once:true});else {setupTools();wireLearning();}
})();
