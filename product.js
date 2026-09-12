(()=>{
  'use strict';
  const KEY='bookflix_v4';
  const $=s=>document.querySelector(s);
  const state=()=>typeof S!=='undefined'?S:null;
  const save=()=>{const s=state();if(s)localStorage.setItem(KEY,JSON.stringify(s));};
  const toast=t=>{const el=$('#toast');if(!el)return;el.textContent=t;el.style.display='block';clearTimeout(window.__bfToast);window.__bfToast=setTimeout(()=>el.style.display='none',2200)};
  const exportData=()=>{
    const s=state();if(!s)return;
    const payload={app:'Bookflix',version:4,exportedAt:new Date().toISOString(),data:s};
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='bookflix-profil.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast('Profil exporté.');
  };
  const importData=()=>{
    const input=document.createElement('input');input.type='file';input.accept='application/json';
    input.onchange=async()=>{try{
      const text=await input.files[0].text(),p=JSON.parse(text),d=p.data||p;
      if(!d||!Array.isArray(d.selected)||!Array.isArray(d.saved)||typeof d.ratings!=='object')throw Error();
      const s=state();Object.assign(s,{selected:d.selected,saved:d.saved,ratings:d.ratings||{},hidden:d.hidden||[],history:d.history||[],mood:d.mood||'',learnedTags:d.learnedTags||{},current:[],results:[]});save();
      if(typeof renderBooks==='function')renderBooks(typeof seeds!=='undefined'?seeds:[]);if(typeof renderLibrary==='function')renderLibrary();toast('Profil importé.');
    }catch{toast('Fichier Bookflix invalide.')}};input.click();
  };
  const share=async()=>{
    const s=state();if(!s)return;
    const picks=(s.results||[]).slice(0,3).map(b=>`${b.title} — ${b.author}`).join('\n');
    const text=picks?`Mes recommandations Bookflix :\n${picks}\n\nTrouve ton prochain livre avec Bookflix.`:'Mon profil lecteur Bookflix est prêt : donne 3 livres que tu as aimés et découvre le 4e.';
    try{if(navigator.share){await navigator.share({title:'Bookflix',text});}else if(navigator.clipboard){await navigator.clipboard.writeText(text);toast('Texte copié.')}}catch{}
  };
  function addTools(){
    if($('#bf-data-tools'))return;
    const lib=$('#library .head');if(!lib)return;
    const box=document.createElement('div');box.id='bf-data-tools';box.className='bf-tools';
    const mk=(label,fn)=>{const b=document.createElement('button');b.type='button';b.className='btn ghost tiny';b.textContent=label;b.onclick=fn;return b};
    box.append(mk('↥ Exporter mon profil',exportData),mk('↧ Importer un profil',importData),mk('↗ Partager',share));
    lib.appendChild(box);
  }
  function boot(){addTools();document.addEventListener('click',e=>{if(e.target.closest('#nl'))setTimeout(addTools,50)},{passive:true});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
