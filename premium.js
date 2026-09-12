(()=>{
'use strict';
const boot=()=>{
 if(window.__bfPremium)return;window.__bfPremium=true;
 const host=document.querySelector('#library .head');if(!host)return;
 const box=document.createElement('div');box.className='empty';box.style.cssText='margin-top:18px;text-align:left;background:#0d0f14;border-style:solid';
 box.innerHTML='<b style="font-size:18px;color:#fff">Bookflix Plus</b><br><span class="hint">Le futur niveau premium : recommandations avancées, profil lecteur approfondi, statistiques et synchronisation.</span><div class="chips" style="margin-bottom:0"><span class="badge">🧠 Recommandation avancée</span><span class="badge">📊 Statistiques</span><span class="badge">☁️ Synchronisation</span></div><div style="margin-top:12px;color:#f5c451;font-weight:900">4,90 CHF / mois · bientôt</div>';
 host.parentElement.insertBefore(box,document.getElementById('libraryGrid'));
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
