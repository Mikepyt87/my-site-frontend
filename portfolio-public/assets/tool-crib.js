// Tool Crib: local filtering and an explicitly local, preview-only inventory editor.
(() => {
 'use strict';
 const dataNode=document.getElementById('tool-crib-data');
 if(!dataNode)return;
 const original=JSON.parse(dataNode.value||dataNode.textContent);
 let inventory=structuredClone(original);
 const root=document.querySelector('[data-tool-crib-root]');
 const results=document.getElementById('tc-results');
 const search=document.getElementById('tc-search');
 const setting=document.getElementById('tc-setting');
 const status=document.getElementById('tc-status');
 const empty=document.getElementById('tc-empty');
 const favorites=document.getElementById('tc-favorites');
 const resultCount=document.getElementById('tc-result-count');
 const projectMap=new Map(original.projects.map(p=>[p.slug,p.title]));
 const categories=new Map(original.categories.map(c=>[c.id,c]));
 const settings=new Map(original.settings.map(c=>[c.id,c.name]));
 const shortStatus={current:'In use','workplace-experience':'Workplace experience',retired:'Retired'};
 const statuses=new Map(original.statuses.map(c=>[c.id,shortStatus[c.id]||c.name]));
 const params=new URLSearchParams(window.__previewSearch||location.search);
 const professional=params.get('view')==='professional';
 // Reuse the draft key so an existing inventory is not discarded by a link update.
 const storageKey='mp-tool-crib-v5.2-local-draft';
 const suppliedTools=new Map(original.tools.map(t=>[t.id,t]));
 const referenceRepairs=new Map((original.referenceRepairs||[]).map(r=>[r.toolId,r]));
 const inventoryRepairs=new Map((original.inventoryRepairs||[]).map(r=>[r.toolId,r.fields]));
 let repairedReferences=0;
 const cleanSource=s=>/Earlier Mike['’]s Functional Artistry Tool Crib list/i.test(s||'')?'':(s||'');
 let editing=false,opener=null,draftLoaded=false,storageWorks=false,allDetails=false;
 const $=id=>document.getElementById(id);
 const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const norm=s=>String(s).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').trim();
 const urlOk=value=>{if(!value)return true;const m=/^projects\/([a-z0-9-]+)\.html$/.exec(value);if(m)return projectMap.has(m[1]);try{return ['https:','http:'].includes(new URL(value).protocol);}catch{return false;}};
 function validate(value){
  if(!value||value.schemaVersion!==1||!Array.isArray(value.tools)||value.tools.length>2000)throw Error('Use a Tool Crib JSON export (schemaVersion 1), with no more than 2,000 entries.');
  const seen=new Set();
  const tools=value.tools.map((input,i)=>{
   let t=input;
   // Upgrade only known legacy values. Preserve edited quantities, notes, URLs, and visibility.
   if(t && value.edition!==original.edition){
    const patch=inventoryRepairs.get(t.id), supplied=suppliedTools.get(t.id);
    if(patch){t={...t};for(const [field,change] of Object.entries(patch)){
     if(JSON.stringify(t[field]??null)===JSON.stringify(change.old??null))t[field]=change.new;
    }}
    if(['earlier','documented','owner-account','previous','needs-review'].includes(t.status))
     t={...t,status:supplied?.status||(t.setting==='workplace'?'workplace-experience':'current')};
   }
   // Only migrate a known old URL (or an already corrected URL lacking a label).
   // User-added/replaced reference URLs are never silently overwritten.
   const fix=referenceRepairs.get(t?.id);
   if(fix&&t&&((fix.oldUrl!==fix.newUrl&&t.referenceUrl===fix.oldUrl)||(t.referenceUrl===fix.newUrl&&!t.referenceLabel))){
    t={...t,referenceUrl:fix.newUrl,referenceLabel:fix.label,referenceType:fix.kind};repairedReferences++;
   }
   const supplied=suppliedTools.get(t?.id);
   if(supplied&&t?.referenceUrl===supplied.referenceUrl)t={...t,referenceCheck:supplied.referenceCheck||''};
   if(!t||typeof t!=='object'||typeof t.id!=='string'||!/^[a-z0-9-]{1,180}$/.test(t.id)||seen.has(t.id))throw Error('Invalid or repeated tool ID at entry '+(i+1));seen.add(t.id);
   if(typeof t.name!=='string'||!t.name.trim()||t.name.length>160)throw Error('Each tool needs a name of 1 to 160 characters.');
   if(!categories.has(t.category)||!settings.has(t.setting)||!statuses.has(t.status))throw Error('Unknown category, setting, or status on '+t.name);
   for(const [key,max] of [['brand',100],['model',200],['notes',2400],['source',1000],['referenceUrl',1000],['referenceLabel',120],['referenceType',40],['referenceCheck',80],['secondaryUrl',1000],['secondaryLabel',120],['secondaryCheck',80]])if(t[key]!=null&&(typeof t[key]!=='string'||t[key].length>max))throw Error('Invalid '+key+' on '+t.name);
   if(t.quantity!=null&&(!Number.isInteger(t.quantity)||t.quantity<1||t.quantity>9999))throw Error('Quantity must be a whole number from 1 to 9999, or blank.');
   if(!['','owner-confirmed','visible-in-photo'].includes(t.quantityBasis||''))throw Error('Unknown quantity basis.');
   if(t.favorite!=null&&typeof t.favorite!=='boolean')throw Error('Favorite must be true or false.');
   if(!urlOk(t.referenceUrl)||!urlOk(t.secondaryUrl))throw Error('Use an https:// URL or an existing projects/name.html page.');
   if(!Array.isArray(t.projects)||t.projects.some(p=>!projectMap.has(p)))throw Error('One of the connected projects is not in this portfolio: '+t.name);
   return {id:t.id,name:t.name.trim(),brand:t.brand||'',model:t.model||'',category:t.category,setting:t.setting,status:t.status,quantity:t.quantity??null,quantityBasis:t.quantityBasis||'',favorite:t.favorite===true,notes:t.notes||'',projects:[...new Set(t.projects)],source:cleanSource(t.source),image:null,photoAlt:'',referenceUrl:t.referenceUrl||'',referenceLabel:t.referenceLabel||(t.referenceUrl?'Reference':''),referenceType:t.referenceType||'reference',referenceCheck:t.referenceCheck||'',secondaryUrl:t.secondaryUrl||'',secondaryLabel:t.secondaryLabel||'',secondaryCheck:t.secondaryCheck||'',visible:t.visible!==false};
  });
  return {...structuredClone(original),tools,updated:typeof value.updated==='string'?value.updated:original.updated};
 }
 function facts(t){return `<div class="tc-facts">${t.quantity!=null?`<span class="tc-quantity">Quantity: <strong>${safe(t.quantity)}</strong></span>`:''}${t.favorite?'<span class="tc-favorite">&#9733; Personal favorite</span>':''}</div>`;}
function card(t){
 const links=t.projects.map(s=>`<a href="projects/${safe(s)}.html${professional?'?view=professional':''}">${safe(projectMap.get(s))} &#8599;</a>`).join('');
 const detailId='tc-detail-'+t.id;
 const check='';
 const extras=t.secondaryUrl?`<p class="tc-secondary"><a href="${safe(t.secondaryUrl)}" target="_blank" rel="noopener noreferrer">${safe(t.secondaryLabel||'Additional reference')} &#8599;</a></p>`:'';
 return `<article class="tc-card${t.visible===false?' tc-card-hidden':''}" id="tool-${safe(t.id)}" data-tool-id="${safe(t.id)}"><details class="tc-details" id="${safe(detailId)}"><summary><span class="tc-chevron" aria-hidden="true"></span><div class="tc-summary-content"><h3>${safe(t.name)}${t.favorite?'<span class="tc-star" title="Personal favorite" aria-label="Personal favorite">&#9733;</span>':''}</h3><div class="tc-row-meta">${t.model?`<span>${safe(t.model)}</span>`:''}<span class="tc-badge tc-badge-${safe(t.status)}">${safe(statuses.get(t.status))}</span>${t.quantity!=null?`<span>Qty: <strong>${safe(t.quantity)}</strong></span>`:''}</div></div></summary><div class="tc-detail-content"><p class="tc-detail-setting">${safe(settings.get(t.setting))}${t.favorite?' / Personal favorite':''}</p>${t.notes?`<p class="tc-description">${safe(t.notes)}</p>`:''}${links?`<span class="tc-link-label">Connected projects</span><div class="tc-projects">${links}</div>`:''}${extras}</div></details><div class="tc-row-actions">${t.referenceUrl?`<a class="tc-reference" href="${safe(t.referenceUrl)}" ${t.referenceUrl.startsWith('projects/')?'':'target="_blank" rel="noopener noreferrer"'}>${safe(t.referenceLabel||'Reference')} &#8599;</a>${check}`:''}${!original.ownerEditing?'':`<button class="tc-edit-button" data-edit="${safe(t.id)}" type="button" aria-label="Edit ${safe(t.name)}">Edit</button>`}</div></article>`;
}
 function render(){
  results.innerHTML=original.categories.map(c=>`<section class="tc-group" id="tc-${safe(c.id)}" data-tool-group="${safe(c.id)}"><div class="tc-group-header"><div><h2>${safe(c.name)}</h2><p>${safe(c.intro)}</p></div><span class="tc-group-count"></span></div><div class="tc-grid">${inventory.tools.filter(t=>t.category===c.id).map(card).join('')}</div></section>`).join('');
  $('tc-total').textContent=inventory.tools.filter(t=>t.visible!==false).length;
  results.querySelectorAll('.tc-details').forEach(d=>d.open=allDetails);
  apply();
 }
 function apply(){
  const tokens=norm(search.value).split(/\s+/).filter(Boolean);let count=0,groupCount=0;
  const byId=new Map(inventory.tools.map(t=>[t.id,t]));
  for(const c of results.querySelectorAll('[data-tool-id]')){
   const t=byId.get(c.dataset.toolId);
   const text=norm([t.name,t.brand,t.model,t.notes,t.referenceLabel,...t.projects.map(p=>projectMap.get(p))].join(' '));
   const yes=(editing||t.visible!==false)&&(!favorites.checked||t.favorite===true)&&(setting.value==='all'||setting.value===t.setting)&&(status.value==='all'||status.value===t.status)&&tokens.every(k=>text.includes(k));
   c.hidden=!yes;if(yes)count++;
  }
  for(const g of results.querySelectorAll('[data-tool-group]')){
   const n=g.querySelectorAll('.tc-card:not([hidden])').length;g.hidden=n===0;if(n)groupCount++;
   g.querySelector('.tc-group-count').textContent=n+(n===1?' entry':' entries');
   const a=document.querySelector('[data-tool-jump="'+g.dataset.toolGroup+'"]');a.hidden=n===0;a.querySelector('span').textContent=n;
  }
  resultCount.textContent=count+(count===1?' entry':' entries')+' in '+groupCount+(groupCount===1?' section':' sections');empty.hidden=count>0;
 }
 function setDetailView(expanded){
  allDetails=expanded;
  results.querySelectorAll('.tc-details').forEach(d=>d.open=expanded);
  $('tc-compact-view').setAttribute('aria-pressed',String(!expanded));
  $('tc-expanded-view').setAttribute('aria-pressed',String(expanded));
 }
 $('tc-compact-view').addEventListener('click',()=>setDetailView(false));
 $('tc-expanded-view').addEventListener('click',()=>setDetailView(true));
 function showTool(hash){
  if(!hash||!hash.startsWith('#tool-'))return;
  const el=document.getElementById(decodeURIComponent(hash.slice(1)));
  if(!el||!el.matches('[data-tool-id]'))return;
  if(el.hidden){search.value='';setting.value='all';status.value='all';favorites.checked=false;apply();}
  const detail=el.querySelector('details');if(detail)detail.open=true;
  el.scrollIntoView({block:'center'});
 }
 root.addEventListener('click',e=>{const a=e.target.closest('a[href^="#tool-"]');if(a){e.preventDefault();showTool(a.getAttribute('href'));}});
 window.addEventListener('hashchange',()=>showTool(location.hash));
 $('tc-filter-form').addEventListener('submit',e=>{e.preventDefault();apply();});
 search.addEventListener('input',apply);setting.addEventListener('change',apply);status.addEventListener('change',apply);favorites.addEventListener('change',apply);
 $('tc-reset').addEventListener('click',()=>{search.value='';setting.value='all';status.value='all';favorites.checked=false;apply();search.focus();});
 if(params.get('favorites')==='true')favorites.checked=true;
 if(params.get('q'))search.value=params.get('q');
 if(settings.has(params.get('setting')))setting.value=params.get('setting');
 if(statuses.has(params.get('status')))status.value=params.get('status');
 // The read-only public build never loads local drafts or creates editor controls.
 if(original.ownerEditing){
  try{
   const probe=storageKey+'-test';localStorage.setItem(probe,'1');localStorage.removeItem(probe);storageWorks=true;
   const saved=localStorage.getItem(storageKey);if(saved){inventory=validate(JSON.parse(saved)); const present=new Set(inventory.tools.map(t=>t.id)); for(const t of original.tools)if(!present.has(t.id))inventory.tools.push(structuredClone(t)); draftLoaded=true;}
  }catch{storageWorks=false;}
  function exportObject(){const copy=structuredClone(inventory);delete copy.projects;delete copy.ownerEditing;delete copy.referenceRepairs;delete copy.inventoryRepairs;return copy;}
  function notice(){
   $('tc-local-notice').hidden=!draftLoaded;
   $('tc-local-notice').textContent='Viewing a local inventory draft. It has not changed the source files or published website. Export JSON to keep it.'+(repairedReferences?' Outdated supplied reference links were updated; your other edits were preserved.':'');
   $('tc-save-state').textContent=storageWorks?'Drafts can be remembered in this browser. Browser data can be cleared; export JSON for a portable backup.':'Browser storage is unavailable here. Changes last only while this page is open. Export JSON before navigating away.';
  }
  function persist(){
   inventory.updated=new Date().toISOString().slice(0,10);draftLoaded=true;
   if(storageWorks){try{localStorage.setItem(storageKey,JSON.stringify(exportObject()));}catch{storageWorks=false;}}
   notice();
  }
  const toggle=$('tc-edit-toggle');
  toggle.addEventListener('click',()=>{editing=!editing;root.classList.toggle('tc-editing',editing);toggle.setAttribute('aria-expanded',String(editing));toggle.textContent=editing?'Close editor':'Edit inventory';$('tc-owner-panel').hidden=!editing;notice();apply();});
  const dialog=$('tc-editor'),form=$('tc-editor-form');
  const field=n=>form.elements.namedItem(n);
  function close(){dialog.close();opener?.focus();}
  function openEditor(id,button){
   const tool=inventory.tools.find(t=>t.id===id)||{id:'',name:'',brand:'',model:'',category:'woodshop',setting:'personal',status:'current',notes:'',source:'',referenceUrl:'',projects:[],visible:true};
   opener=button;form.reset();$('tc-editor-title').textContent=tool.id?'Edit tool':'Add a tool';
   for(const name of ['id','name','brand','model','category','setting','status','notes','source','referenceUrl','referenceLabel','secondaryUrl','secondaryLabel'])field(name).value=tool[name]||'';
   field('visible').checked=tool.visible!==false;
   field('quantity').value=tool.quantity??'';field('quantityBasis').value=tool.quantityBasis||'';field('favorite').checked=tool.favorite===true;
   for(const opt of field('projects').options)opt.selected=tool.projects.includes(opt.value);
   $('tc-editor-error').textContent='';dialog.showModal();$('te-name').focus();
  }
  $('tc-add').addEventListener('click',e=>openEditor('',e.currentTarget));
  results.addEventListener('click',e=>{const button=e.target.closest('[data-edit]');if(button)openEditor(button.dataset.edit,button);});
  for(const id of ['tc-editor-close','tc-editor-cancel'])$(id).addEventListener('click',close);
  dialog.addEventListener('close',()=>opener?.focus());
  form.addEventListener('submit',e=>{
   e.preventDefault();
   try{
    let id=field('id').value;
    if(!id){const stem=norm(field('name').value).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,140)||'tool';id=stem;let i=2;while(inventory.tools.some(t=>t.id===id))id=stem+'-'+i++;}
    const t={id};for(const name of ['name','brand','model','category','setting','status','notes','referenceUrl','referenceLabel','secondaryUrl','secondaryLabel','source'])t[name]=field(name).value.trim();
    const previous=inventory.tools.find(x=>x.id===id);
    t.referenceType=previous?.referenceUrl===t.referenceUrl?(previous.referenceType||'reference'):'reference';
    t.referenceCheck=previous?.referenceUrl===t.referenceUrl?(previous.referenceCheck||''):'owner-supplied-unverified';
    t.secondaryCheck=previous?.secondaryUrl===t.secondaryUrl?(previous.secondaryCheck||''):'owner-supplied-unverified';
    if(!t.referenceUrl)t.referenceLabel='';
    else if(!t.referenceLabel)t.referenceLabel='Reference';
    t.quantity=field('quantity').value===''?null:Number(field('quantity').value);t.quantityBasis=field('quantityBasis').value;t.favorite=field('favorite').checked;
    t.projects=[...field('projects').selectedOptions].map(o=>o.value);t.visible=field('visible').checked;
    const copy=structuredClone(inventory);const pos=copy.tools.findIndex(x=>x.id===id);if(pos>=0)copy.tools[pos]=t;else copy.tools.push(t);
    inventory=validate(copy);persist();render();close();
   }catch(error){$('tc-editor-error').textContent=error.message;}
  });
  $('tc-export').addEventListener('click',()=>{
   const blob=new Blob([JSON.stringify(exportObject(),null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='MichaelPytlowany_Tool_Crib.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);
  });
  $('tc-import').addEventListener('click',()=>$('tc-import-file').click());
  $('tc-import-file').addEventListener('change',async e=>{
   const file=e.target.files?.[0];if(!file)return;$('tc-import-error').textContent='';
   try{if(file.size>2*1024*1024)throw Error('The inventory JSON must be smaller than 2 MB.');const next=validate(JSON.parse(await file.text()));const present=new Set(next.tools.map(t=>t.id));for(const t of original.tools)if(!present.has(t.id))next.tools.push(structuredClone(t));if(!confirm('Replace the local draft with '+next.tools.length+' imported entries? Export your current draft first to keep it.'))return;inventory=next;persist();render();}
   catch(error){$('tc-import-error').textContent='Import not applied: '+error.message;}
   finally{e.target.value='';}
  });
  $('tc-restore').addEventListener('click',()=>{
   if(!confirm('Restore the supplied inventory and discard this local draft? Export JSON first to keep your changes.'))return;
   inventory=structuredClone(original);draftLoaded=false;try{localStorage.removeItem(storageKey);}catch{}notice();render();
  });
  notice();
 }
 render();
 requestAnimationFrame(()=>showTool(window.__previewFragment||location.hash));
})();
