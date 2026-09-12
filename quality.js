(()=>{
'use strict';
// V5: ne surcharge plus window.fetch. La recherche Open Library doit rester
// sur le fetch natif du navigateur; le Service Worker gère le cache réseau.
if(window.__bfQualityV5)return;window.__bfQualityV5=true;
window.__bfQuality={
  norm:s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim(),
  score:(d,q)=>{const n=window.__bfQuality.norm,title=n(d.title),query=n(q),authors=(d.author_name||[]).join(' ');let s=0;if(query&&title===query)s+=45;else if(query&&title.includes(query))s+=25;else if(query&&query.split(/\s+/).every(w=>w.length<3||title.includes(w)))s+=10;if(Array.isArray(d.language)&&(d.language.includes('fre')||d.language.includes('fra')))s+=12;if(d.cover_i)s+=5;if(d.author_name?.length)s+=4;if(d.subject?.length)s+=Math.min(8,Math.log2(d.subject.length+1)*2);if(d.edition_count)s+=Math.min(8,Math.log2(Number(d.edition_count)+1)*2);if(!d.title||!authors)s-=30;return s}
};
})();
