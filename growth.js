(()=>{
'use strict';
const KEY='bookflix_v4';
const boot=()=>{
  if(typeof S==='undefined'||typeof window.renderResults!=='function'||typeof window.renderLibrary!=='function')return setTimeout(boot,250);
  if(window.__bfGrowth)return;window.__bfGrowth=true;
  S.status=S.status||{};
  const persist=()=>localStorage.setItem(KEY,JSON.stringify(S));
  const getBook=title=>(S.results||[]).find(b=>b.title===title)||(S.saved||[]).find(b=>b.title===title)||(S.selected||[]).find(b=>b.title===title);
  const learn=(book,positive)=>{
    if(!book)return;
    const bag=positive?(S.learnedTags||(S.learnedTags={} )):(S.dislikedTags||(S.dislikedTags={}));
    (book.tags||[]).slice(0,12).forEach(t=>{const k=String(t||'').toLowerCase();if(k)bag[k]=(bag[k]||0)+1});
    persist();
  };
  const decorateResults=()=>{
    document.querySelectorAll('#results .result').forEach(card=>{
      if(card.querySelector('.bf-pref'))return;
      const title=card.querySelector('h3')?.textContent?.trim();if(!title)return;
      const row=document.createElement('div');row.className='ra bf-pref';row.innerHTML='<button class="btn ghost tiny" data-bf-more="1">＋ Plus comme ça</button><button class="btn ghost tiny" data-bf-less="1">− Moins comme ça</button>';
      card.querySelector('.ra')?.appendChild(row);
      card.dataset.bfTitle=title;
    });
  };
  const originalRenderResults=window.renderResults;
  window.renderResults=function(a){originalRenderResults(a);setTimeout(decorateResults,0)};
  document.addEventListener('click',e=>{
    const more=e.target.closest('[data-bf-more]'),less=e.target.closest('[data-bf-less]');
    if(!more&&!less)return;
    const card=e.target.closest('.result'),title=card?.dataset.bfTitle,book=getBook(title);if(!book)return;
    learn(book,!!more);if(less){S.hidden=S.hidden||[];if(!S.hidden.includes(title))S.hidden.push(title);}
    if(typeof window.recommend==='function')window.recommend();
    if(typeof window.toast==='function')window.toast(more?'Compris — je vais chercher davantage ce type de livre.':'Compris — je vais éviter ce type de livre.');
  });
  const originalLibrary=window.renderLibrary;
  window.renderLibrary=function(){originalLibrary();setTimeout(()=>{
    const grid=document.getElementById('libraryGrid');if(!grid||grid.querySelector('.bf-plus'))return;
    const box=document.createElement('div');box.className='empty bf-plus';box.style.cssText='grid-column:1/-1;text-align:left;background:#0d0f14;border-style:solid';
    box.innerHTML='<b style="font-size:18px;color:#fff">Bookflix Plus</b><br><span class="hint">Bientôt : recommandations encore plus poussées, profil lecteur approfondi, statistiques et synchronisation.</span><br><span class="badge" style="margin-top:10px">Accès premium · bientôt</span>';
    grid.prepend(box);
    grid.querySelectorAll('.lib').forEach(card=>{
      if(card.querySelector('[data-bf-status]'))return;
      const title=card.querySelector('small b')?.textContent?.trim();if(!title)return;
      const sel=document.createElement('select');sel.className='input';sel.dataset.bfStatus='1';sel.style.cssText='width:100%;padding:8px;margin-top:4px;font-size:12px';
      const val=S.status[title]||'a-lire';sel.innerHTML='<option value="a-lire">À lire</option><option value="en-cours">En cours</option><option value="lu">Lu</option><option value="abandonne">Abandonné</option>';sel.value=val;sel.dataset.title=title;card.appendChild(sel);
    });
  },0)};
  document.addEventListener('change',e=>{const sel=e.target.closest('[data-bf-status]');if(!sel)return;S.status[sel.dataset.title]=sel.value;persist();if(typeof window.toast==='function')window.toast('Statut enregistré.');});
  decorateResults();
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
