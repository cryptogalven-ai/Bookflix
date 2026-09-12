(()=>{
  'use strict';
  const KEY='bookflix_v4';
  const canonical={
    'science-fiction':['science fiction','science-fiction','sci-fi','sf','speculative fiction'],
    'cyberpunk':['cyberpunk','cyberpunk fiction'],
    'dystopie':['dystopia','dystopian','dystopie'],
    'fantasy':['fantasy','fantasy fiction','high fantasy','epic fantasy'],
    'thriller':['thriller','suspense'],
    'mystere':['mystery','mysteries','mystère','detective fiction','detective'],
    'horreur':['horror','horror fiction','gothic'],
    'aventure':['adventure','adventure fiction'],
    'politique':['politics','political fiction','political'],
    'romance':['romance','love stories'],
    'technologie':['technology','technological','computers','artificial intelligence'],
    'philosophie':['philosophy','philosophical'],
    'historique':['history','historical fiction','historical'],
    'guerre':['war','military fiction'],
    'jeunesse':['juvenile fiction','young adult','children'],
    'humour':['humor','humour','satire'],
    'classique':['classics','classic literature'],
    'complexe':['complex','literary fiction','psychological'],
    'univers':['worldbuilding','imaginary worlds','imaginary places'],
    'sombre':['dark fiction','dark','bleak','apocalyptic']
  };
  const moodMap={
    'sombre':['sombre','horreur','dystopie'], 'dark':['sombre','horreur','dystopie'],
    'intelligent':['complexe','philosophie','science-fiction'], 'complexe':['complexe','philosophie'],
    'etrange':['mystere','science-fiction','horreur'], 'bizarre':['mystere','science-fiction'],
    'action':['aventure','thriller','guerre'], 'aventure':['aventure'],
    'politique':['politique'], 'romance':['romance'], 'amour':['romance'],
    'technologie':['technologie','cyberpunk'], 'cyberpunk':['cyberpunk','technologie'],
    'court':['__short__'], 'rapide':['__short__'], 'long':['__long__'],
    'original':['science-fiction','fantasy','mystere'], 'epique':['fantasy','aventure','guerre'],
    'historique':['historique'], 'horreur':['horreur'], 'drôle':['humour'], 'humour':['humour']
  };
  const norm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
  const words=s=>norm(s).split(/\s+/).filter(x=>x.length>2);
  const cats=b=>{const out=new Set();(b?.tags||[]).forEach(raw=>{const t=norm(raw);for(const [c,aliases] of Object.entries(canonical))if(aliases.some(a=>t.includes(norm(a))||norm(a).includes(t)))out.add(c)});return [...out]};
  const ensure=()=>{if(typeof S==='undefined')return;S.learnedTags=S.learnedTags||{};S.dislikedTags=S.dislikedTags||{};};
  const persist=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch{}};
  function boot(){
    if(typeof S==='undefined'||typeof window.recommend!=='function'||window.recommend.__bfIntel)return;
    ensure();
    const baseRecommend=window.recommend;
    const baseRate=typeof window.rate==='function'?window.rate:null;
    if(baseRate&&!baseRate.__bfIntelRate){
      window.rate=function(title,n){
        baseRate(title,n);ensure();
        const b=(S.results||[]).find(x=>x.title===title)||(S.saved||[]).find(x=>x.title===title);
        if(b){for(const c of cats(b)){const delta=n>=4?(n-3):(n<=2?-(3-n):0);if(delta>0)S.learnedTags[c]=(S.learnedTags[c]||0)+delta;if(delta<0)S.dislikedTags[c]=(S.dislikedTags[c]||0)-delta;}}
        persist();
      };
      window.rate.__bfIntelRate=true;
    }
    window.recommend=async function(){
      await baseRecommend();
      try{rerank();persist()}catch{}
    };
    window.recommend.__bfIntel=true;
  }
  function rerank(){
    ensure();const mood=(typeof $==='function'&&$('mood'))?$('mood').value:(S.mood||'');
    const wanted=new Set();words(mood).forEach(w=>(moodMap[w]||[]).forEach(x=>wanted.add(x)));
    const pos=S.learnedTags||{},neg=S.dislikedTags||{};
    const rated=S.ratings||{};
    const selectedAuthors=new Set((S.selected||[]).map(b=>norm(b.author)).filter(Boolean));
    const scored=(S.results||[]).map(b=>{
      const cs=cats(b);let s=Number(b.score)||0;let matched=[];
      cs.forEach(c=>{if(wanted.has(c)){s+=11;matched.push(c)}s+=(pos[c]||0)*3;s-=(neg[c]||0)*4});
      if(selectedAuthors.has(norm(b.author)))s-=6;
      const r=rated[b.title];if(r)s+=(r-3)*2;
      const title=norm(b.title);words(mood).forEach(w=>{if(title.includes(w))s+=4});
      if(wanted.has('__short__')&&b.year){/* keep explicit length preference neutral when metadata is absent */}
      return {...b,_bfScore:Math.max(0,Math.min(99,Math.round(s))),_bfCats:cs,_bfMatched:matched};
    }).sort((a,b)=>b._bfScore-a._bfScore);
    const out=[],seenAuthors=new Set();
    for(const b of scored){const a=norm(b.author);if(out.length<4||!seenAuthors.has(a)||out.length>=7){out.push(b);seenAuthors.add(a)}if(out.length>=8)break}
    S.results=out.map(b=>({...b,score:b._bfScore}));
    if(typeof renderResults==='function')renderResults(S.results);
    const status=typeof $==='function'&&$('status');if(status)status.textContent=S.results.length+' suggestions · profil adaptatif + envie du moment';
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
