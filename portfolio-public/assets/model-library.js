(() => {
 'use strict';
 const normalize=s=>(s||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
 const match=(text,query)=>normalize(query).split(/\s+/).every(term=>normalize(text).includes(term));
 const applyGold=viewer=>{
  for(const material of viewer.model?.materials||[]){
   const pbr=material.pbrMetallicRoughness;
   pbr.setBaseColorFactor('#d19a2a');
   pbr.setMetallicFactor(.72);
   pbr.setRoughnessFactor(.34);
  }
 };
 document.querySelectorAll('[data-preview-material="gold"]').forEach(viewer=>viewer.addEventListener('load',()=>applyGold(viewer)));
 const root=document.querySelector('[data-model-library]');
 if(root){
  const params=new URLSearchParams(window.__previewSearch||location.search);
  const search=document.getElementById('ml-search');
  const linked=document.getElementById('ml-linked');
  const buttons=[...root.querySelectorAll('[data-ml-category]')];
  const allowed=new Set(buttons.map(b=>b.dataset.mlCategory));
  let category=allowed.has(params.get('category'))?params.get('category'):'all';
  search.value=params.get('q')||'';linked.checked=params.get('linked')==='1';
  function render(updateUrl=true){
   let count=0;
   root.querySelectorAll('[data-model-card]').forEach(c=>{
    const visible=(category==='all'||c.dataset.category===category)&&(!linked.checked||c.dataset.linked==='true')&&match(c.dataset.search,search.value);
    c.hidden=!visible;if(visible)count++;
   });
   root.querySelectorAll('[data-model-section]').forEach(section=>{
    const n=[...section.querySelectorAll('[data-model-card]')].filter(c=>!c.hidden).length;
    section.hidden=n===0;section.querySelector('.ml-section-count').textContent=`${n} set${n===1?'':'s'}`;
   });
   for(const b of buttons){const on=b.dataset.mlCategory===category;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));}
   document.getElementById('ml-results').textContent=`${count} model set${count===1?'':'s'}${category!=='all'?' in '+buttons.find(b=>b.dataset.mlCategory===category).childNodes[0].textContent.trim():''}`;
   document.getElementById('ml-empty').hidden=count>0;
   if(updateUrl){
    const q=new URLSearchParams();if(category!=='all')q.set('category',category);if(search.value.trim())q.set('q',search.value.trim());if(linked.checked)q.set('linked','1');
    const route='model-library.html'+(q.size?'?'+q.toString():'');
    if(window.__previewSearch!==undefined)parent.postMessage({type:'mp-preview-replace',path:route},'*');
    else try{history.replaceState(null,'',route);}catch{/* File-preview restrictions do not affect filtering. */}
   }
  }
  buttons.forEach(b=>b.addEventListener('click',()=>{category=b.dataset.mlCategory;render();}));
  search.addEventListener('input',()=>render());linked.addEventListener('change',()=>render());
  document.getElementById('ml-reset').addEventListener('click',()=>{category='all';search.value='';linked.checked=false;render();search.focus();});
  render(false);
 }
 const detail=document.querySelector('[data-model-detail]');
 if(detail){
  const input=document.getElementById('ml-file-search');
 input?.addEventListener('input',()=>{
   let count=0;
   detail.querySelectorAll('[data-model-file]').forEach(row=>{row.hidden=!match(row.dataset.search,input.value);if(!row.hidden)count++;});
   detail.querySelectorAll('[data-model-subset]').forEach(s=>{const n=[...s.querySelectorAll('[data-model-file]')].filter(r=>!r.hidden).length;s.hidden=n===0;if(input.value.trim())s.open=true;s.querySelector('.ml-subset-count').textContent=`${n} file${n===1?'':'s'}`;});
   document.getElementById('ml-file-results').textContent=`${count} matching file${count===1?'':'s'}`;
   document.getElementById('ml-file-empty').hidden=count>0;
  });
  const dialog=detail.querySelector('[data-model-dialog]');
  const viewer=dialog?.querySelector('[data-model-viewer]');
  const title=dialog?.querySelector('[data-model-title]');
  const status=dialog?.querySelector('[data-model-status]');
  const download=dialog?.querySelector('[data-model-download]');
  if(dialog&&viewer&&title&&status&&download){
   detail.querySelectorAll('[data-model-preview]').forEach(button=>button.addEventListener('click',()=>{
    title.textContent=button.dataset.modelName;
    status.textContent=button.dataset.previewNote||'Drag to rotate. Scroll or pinch to zoom.';
    download.href=button.dataset.download;
    download.setAttribute('download',button.dataset.downloadName);
    viewer.setAttribute('alt',`Interactive 360 degree preview of ${button.dataset.modelName}`);
    viewer.setAttribute('src',button.dataset.preview);
    dialog.showModal();
   }));
   viewer.addEventListener('load',()=>{status.textContent=status.textContent||'Drag to rotate. Scroll or pinch to zoom.';});
   viewer.addEventListener('error',()=>{status.textContent='The 3D preview could not load. The original file is still available to download.';});
   dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
   dialog.addEventListener('close',()=>viewer.removeAttribute('src'));
  }
 }
})();
