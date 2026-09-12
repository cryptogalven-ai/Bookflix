(()=>{
  'use strict';
  const KEY='bookflix_v4';
  const boot=()=>{
    if(typeof S==='undefined'||typeof window.rate!=='function'||typeof window.recommend!=='function')return;
    if(window.rate.__bfLearning2)return;
    const originalRate=window.rate, originalRecommend=window.recommend;
    window.rate=function(title,n){
      originalRate(title,n);
      try{
        const b=(S.results||[]).find(x=>x.title===title)||(S.saved||[]).find(x=>x.title===title);
        S.learnedTags=S.learnedTags||{};
        if(b&&n>=4)(b.tags||[]).slice(0,8).forEach(t=>S.learnedTags[t]=(S.learnedTags[t]||0)+(n-3));
        if(n<=2&&!S.hidden.includes(title))S.hidden.push(title);
        localStorage.setItem(KEY,JSON.stringify(S));
      }catch{}
      setTimeout(()=>window.recommend(),100);
    };
    window.rate.__bfLearning2=true;
    window.recommend=async function(){
      const learned=S.learnedTags||{};
      const tags=Object.entries(learned).sort((a,b)=>b[1]-a[1]).slice(0,8).map(x=>x[0]);
      if(!tags.length)return originalRecommend();
      const fake={title:'__bookflix_learning__',author:'',tags};
      S.selected.push(fake);
      try{return await originalRecommend()}finally{S.selected=S.selected.filter(x=>x!==fake);localStorage.setItem(KEY,JSON.stringify(S))}
    };
    window.recommend.__bfLearning2=true;
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
