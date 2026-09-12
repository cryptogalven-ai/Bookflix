(()=>{
'use strict';
const boot=()=>{
 if(window.__bfQualityV3)return;window.__bfQualityV3=true;
 const native=window.fetch.bind(window);
 const norm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
 const quality=(d,q)=>{const title=norm(d.title),query=norm(q),authors=(d.author_name||[]).join(' ');let s=0;if(query&&title===query)s+=45;else if(query&&title.includes(query))s+=25;else if(query&&query.split(/\s+/).every(w=>w.length<3||title.includes(w)))s+=10;if(Array.isArray(d.language)&&(d.language.includes('fre')||d.language.includes('fra')))s+=12;if(d.cover_i)s+=5;if(d.author_name&&d.author_name.length)s+=4;if(d.subject&&d.subject.length)s+=Math.min(8,Math.log2(d.subject.length+1)*2);if(d.edition_count)s+=Math.min(8,Math.log2(Number(d.edition_count)+1)*2);if(!d.title||!authors)s-=30;return s};
 window.fetch=async function(input,init){
  let isSearch=false,q='';
  try{const raw=typeof input==='string'?input:(input&&input.url)||'';if(raw.includes('openlibrary.org/search.json')){const u=new URL(raw,location.href);q=u.searchParams.get('q')||'';const n=Math.max(24,Math.min(50,Number(u.searchParams.get('limit')||24)));u.searchParams.set('limit',String(n));if(!u.searchParams.has('lang'))u.searchParams.set('lang','fr');if(!u.searchParams.has('fields'))u.searchParams.set('fields','key,title,author_name,cover_i,subject,first_publish_year,edition_count,language');input=typeof input==='string'?u.toString():new Request(u.toString(),input);isSearch=true}}catch{}
  const response=await native(input,init);if(!isSearch||!response.ok)return response;
  try{const data=await response.clone().json();if(Array.isArray(data.docs)){const docs=data.docs.map((d,i)=>({...d,_bfQuality:quality(d,q),_bfOriginal:i}));docs.sort((a,b)=>b._bfQuality-a._bfQuality||a._bfOriginal-b._bfOriginal);data.docs=docs.map(({_bfQuality,_bfOriginal,...d})=>d);const headers=new Headers(response.headers);headers.delete('content-length');headers.set('content-type','application/json');return new Response(JSON.stringify(data),{status:response.status,statusText:response.statusText,headers})}}catch{}return response;
 };
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
