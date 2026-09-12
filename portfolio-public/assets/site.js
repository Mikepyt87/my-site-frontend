(() => {
 'use strict';
 const params=new URLSearchParams(window.__previewSearch || location.search);
 const base=document.body.dataset.base||'';
 const menu=document.querySelector('.menu-toggle');
 const nav=document.getElementById('primary-nav');
 menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open);});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav?.classList.contains('open')){menu.setAttribute('aria-expanded','false');nav.classList.remove('open');menu.focus();}});
 // Explicit, linkable views. Do not infer the audience from tracking or cookies.
 if(params.get('view')==='professional'){
  document.body.classList.add('is-pro');
  document.querySelector('.explore-choice')?.classList.remove('selected');
  document.querySelector('.explore-choice')?.removeAttribute('aria-current');
  document.querySelector('.pro-choice')?.classList.add('selected');
  document.querySelector('.pro-choice')?.setAttribute('aria-current','true');
  const bc=document.querySelector('.breadcrumb');if(bc){bc.href=base+'professional.html';bc.textContent='\u2190 Professional view';}
  const panel=document.querySelector('.professional-details');if(panel)panel.open=true;
  document.querySelectorAll('.related a[href*="projects/"]').forEach(a=>{a.href=a.getAttribute('href')+'?view=professional';});
 }
 document.querySelectorAll('.print-button').forEach(b=>b.addEventListener('click',()=>window.print()));
 const dialog=document.querySelector('.lightbox');const large=dialog?.querySelector('img');const caption=dialog?.querySelector('p');let previous=null;
 function closeImage(){dialog?.close();previous?.focus();}
 document.querySelectorAll('[data-lightbox]').forEach(b=>b.addEventListener('click',()=>{previous=b;large.src=b.dataset.lightbox;large.alt=b.dataset.caption||'';caption.textContent=b.dataset.caption||'';if(typeof dialog.showModal==='function')dialog.showModal();}));
 dialog?.querySelector('.lightbox-close')?.addEventListener('click',closeImage);
 dialog?.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeImage();}});
 dialog?.addEventListener('close',()=>{if(large)large.removeAttribute('src');previous?.focus();});

// Draw the supplied, normalized export mesh. No external scripts or reconstructed geometry.
document.querySelectorAll('.model-canvas').forEach(canvas=>{
 const shell=canvas.closest('.model-shell'),status=shell.querySelector('.model-status');
 const gl=canvas.getContext('webgl',{antialias:true,preserveDrawingBuffer:true});
 if(!gl){canvas.hidden=true;const source=document.querySelector('.case-visual img');if(source){const still=source.cloneNode();still.className='model-fallback';shell.insertBefore(still,canvas);}shell.querySelectorAll('button').forEach(b=>b.disabled=true);status.textContent='Static source view. Interactive 3D is unavailable in this browser.';return;}
 try{
  function bufferData(b64){const b=atob(b64),bytes=new Uint8Array(b.length);for(let i=0;i<b.length;i++)bytes[i]=b.charCodeAt(i);return new Float32Array(bytes.buffer);}
  function shader(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
  const vert=shader(gl.VERTEX_SHADER,`attribute vec3 position;attribute vec3 normal;uniform float yaw;uniform float pitch;uniform float zoom;uniform float aspect;varying float shade;void main(){float a=cos(yaw),b=sin(yaw),c=cos(pitch),d=sin(pitch);vec3 q=vec3(a*position.x-b*position.y,b*position.x+a*position.y,position.z);vec3 r=vec3(q.x,c*q.y-d*q.z,d*q.y+c*q.z);gl_Position=vec4(zoom*r.x/aspect,zoom*r.y,-r.z*0.25,1.0);shade=0.40+0.60*abs(dot(normalize(normal),normalize(vec3(0.4,-0.6,0.9))));}`);
  const frag=shader(gl.FRAGMENT_SHADER,`precision mediump float;varying float shade;void main(){gl_FragColor=vec4(vec3(0.37,0.48,0.43)*shade,1.0);}`);
  const program=gl.createProgram();gl.attachShader(program,vert);gl.attachShader(program,frag);gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Could not initialize model program');gl.useProgram(program);
  const vertices=bufferData(canvas.dataset.positions),normals=bufferData(canvas.dataset.normals);delete canvas.dataset.positions;delete canvas.dataset.normals;
  for(const [name,arr] of [['position',vertices],['normal',normals]]){const buff=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buff);gl.bufferData(gl.ARRAY_BUFFER,arr,gl.STATIC_DRAW);const loc=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,3,gl.FLOAT,false,0,0);}
  const locs=Object.fromEntries(['yaw','pitch','zoom','aspect'].map(n=>[n,gl.getUniformLocation(program,n)]));let yaw=-0.65,pitch=-1.05,zoom=0.85,down=false,lastX=0,lastY=0;
  function draw(){const r=canvas.getBoundingClientRect();if(!r.width||!r.height)return;const dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.round(r.width*dpr);canvas.height=Math.round(r.height*dpr);gl.viewport(0,0,canvas.width,canvas.height);gl.clearColor(0.95,0.97,0.96,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.uniform1f(locs.yaw,yaw);gl.uniform1f(locs.pitch,pitch);gl.uniform1f(locs.zoom,zoom);gl.uniform1f(locs.aspect,canvas.width/canvas.height);gl.drawArrays(gl.TRIANGLES,0,vertices.length/3);}
  function action(a){if(a==='left')yaw-=.18;if(a==='right')yaw+=.18;if(a==='up')pitch-=.15;if(a==='down')pitch+=.15;if(a==='in')zoom=Math.min(zoom*1.2,5);if(a==='out')zoom=Math.max(zoom/1.2,.2);if(a==='reset'){yaw=-.65;pitch=-1.05;zoom=.85;}draw();}
  shell.querySelectorAll('[data-model-action]').forEach(b=>b.addEventListener('click',()=>action(b.dataset.modelAction)));
  canvas.addEventListener('pointerdown',e=>{down=true;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture(e.pointerId);canvas.focus();});
  canvas.addEventListener('pointermove',e=>{if(!down)return;yaw+=(e.clientX-lastX)*.009;pitch+=(e.clientY-lastY)*.009;lastX=e.clientX;lastY=e.clientY;draw();});
  canvas.addEventListener('pointerup',()=>down=false);canvas.addEventListener('pointercancel',()=>down=false);
  canvas.addEventListener('keydown',e=>{const a={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down','+':'in','=':'in','-':'out',Home:'reset'}[e.key];if(a){e.preventDefault();action(a);}});
  if(window.ResizeObserver)new ResizeObserver(draw).observe(canvas);else window.addEventListener('resize',draw);
  draw();status.textContent='Source model ready';canvas.dataset.ready='true';
 }catch(e){canvas.hidden=true;status.textContent='The model view could not load. See the source still above.';console.error('Model viewer:',e.message);}
});


 const form=document.getElementById('filter-form');if(!form)return;
 const search=document.getElementById('project-search'),sort=document.getElementById('project-sort'),grid=document.getElementById('project-results');
 const groups=Array.from(grid.querySelectorAll('[data-project-group]'));
 const groupMap=new Map(groups.map(g=>[g.dataset.projectGroup,g]));
 const cards=Array.from(grid.querySelectorAll('.project-card'));
 const type=document.getElementById('entry-type'),software=document.getElementById('software-filter'),series=document.getElementById('series-filter');
 for(const [el,param] of [[type,'type'],[software,'software'],[series,'series'],[sort,'sort']])if(el&&[...el.options].some(o=>o.value===params.get(param)))el.value=params.get(param);
 document.querySelectorAll('[data-display]').forEach(b=>b.addEventListener('click',()=>{const list=b.dataset.display==='list';grid.classList.toggle('index-view',list);groups.forEach(g=>g.querySelector('.project-grid').classList.toggle('index-view',list));document.querySelectorAll('[data-display]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));}));
 const filters=Array.from(document.querySelectorAll('[data-filter]'));
 const count=document.getElementById('results-count'),empty=document.querySelector('.no-results'),clear=document.querySelector('.clear-search'),random=document.querySelector('.surprise-button');
 let active=filters.some(f=>f.dataset.filter===params.get('category'))?params.get('category'):'all';
 let groupFilter=groupMap.has(params.get('group'))?params.get('group'):null;
 search.value=params.get('q')||'';
 function norm(s){return s.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').trim();}
 function apply(){
  const q=norm(search.value);let found=0,visibleGroups=0;
  const ordered=[...cards];
  if(sort.value==='newest')ordered.sort((a,b)=>Number(b.dataset.year)-Number(a.dataset.year)||b.dataset.date.localeCompare(a.dataset.date));
  if(sort.value==='oldest')ordered.sort((a,b)=>Number(a.dataset.year)-Number(b.dataset.year)||a.dataset.date.localeCompare(b.dataset.date));
  if(sort.value==='az')ordered.sort((a,b)=>a.dataset.title.localeCompare(b.dataset.title));
  const tokens=q.split(/\s+/).filter(Boolean);
  for(const c of ordered){
   const show=(!groupFilter||c.dataset.browseGroup===groupFilter)&&(active==='all'||c.dataset.categories.split(' ').includes(active))&&(type.value==='all'||c.dataset.type===type.value)&&(software.value==='all'||c.dataset.software.split('|').includes(software.value))&&(series.value==='all'||c.dataset.series.split(' ').includes(series.value))&&tokens.every(t=>norm(c.dataset.search).includes(t));
   c.hidden=!show;if(show)found++;
   groupMap.get(c.dataset.browseGroup)?.querySelector('.project-grid').appendChild(c);
  }
  for(const g of groups){
   const n=g.querySelectorAll('.project-card:not([hidden])').length;g.hidden=n===0;if(n)visibleGroups++;
   g.querySelector('.group-count').textContent=n+' '+(n===1?'entry':'entries');
   const jump=document.querySelector('[data-group-jump="'+g.dataset.projectGroup+'"]');
   if(jump){jump.hidden=n===0;jump.querySelector('span').textContent=n;}
  }
  filters.forEach(b=>{const on=b.dataset.filter===active&&!groupFilter;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});
  count.textContent=found+' '+(found===1?'entry':'entries')+' in '+visibleGroups+' '+(visibleGroups===1?'section':'sections');
  empty.hidden=found!==0;grid.hidden=found===0;clear.hidden=!search.value;random.disabled=found===0;
  document.querySelector('.group-jumps').hidden=visibleGroups<2;
  document.querySelectorAll('.results-line .reset-filters').forEach(b=>b.hidden=active==='all'&&!groupFilter&&!search.value&&sort.value==='curated'&&type.value==='all'&&software.value==='all'&&series.value==='all');
 }
 function reset(){active='all';groupFilter=null;search.value='';sort.value='curated';type.value='all';software.value='all';series.value='all';apply();search.focus();}
 form.addEventListener('submit',e=>{e.preventDefault();apply();});
 search.addEventListener('input',apply);sort.addEventListener('change',apply);
 for(const el of [type,software,series])el.addEventListener('change',apply);
 filters.forEach(b=>b.addEventListener('click',()=>{active=b.dataset.filter;groupFilter=null;apply();}));
 document.querySelectorAll('.reset-filters').forEach(b=>b.addEventListener('click',reset));
 clear.addEventListener('click',()=>{search.value='';apply();search.focus();});
 random.addEventListener('click',()=>{const visible=cards.filter(c=>!c.hidden);if(visible.length)visible[Math.floor(Math.random()*visible.length)].querySelector('a').click();});
 apply();
})();

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
 const projectFilter=document.getElementById('tc-project');
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
 return `<article class="tc-card${t.visible===false?' tc-card-hidden':''}" id="tool-${safe(t.id)}" data-tool-id="${safe(t.id)}"><details class="tc-details" id="${safe(detailId)}"><summary><span class="tc-chevron" aria-hidden="true"></span><div class="tc-summary-content"><h3>${safe(t.name)}${t.favorite?'<span class="tc-star" title="Personal favorite" aria-label="Personal favorite">&#9733;</span>':''}</h3><div class="tc-row-meta">${t.model?`<span>${safe(t.model)}</span>`:''}<span class="tc-badge tc-badge-${safe(t.status)}">${safe(statuses.get(t.status))}</span>${t.quantity!=null?`<span>Qty: <strong>${safe(t.quantity)}</strong></span>`:''}${t.projects.length?`<span class="tc-use-count">Used on ${t.projects.length} ${t.projects.length===1?'project':'projects'}</span>`:''}</div></div></summary><div class="tc-detail-content"><p class="tc-detail-setting">${safe(settings.get(t.setting))}${t.favorite?' / Personal favorite':''}</p>${t.notes?`<p class="tc-description">${safe(t.notes)}</p>`:''}${links?`<span class="tc-link-label">Used on these projects</span><div class="tc-projects">${links}</div>`:''}${extras}</div></details><div class="tc-row-actions">${t.referenceUrl?`<a class="tc-reference" href="${safe(t.referenceUrl)}" ${t.referenceUrl.startsWith('projects/')?'':'target="_blank" rel="noopener noreferrer"'}>${safe(t.referenceLabel||'Reference')} &#8599;</a>${check}`:''}${!original.ownerEditing?'':`<button class="tc-edit-button" data-edit="${safe(t.id)}" type="button" aria-label="Edit ${safe(t.name)}">Edit</button>`}</div></article>`;
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
   const projectMatches=projectFilter.value==='all'||(projectFilter.value==='none'?t.projects.length===0:t.projects.includes(projectFilter.value));
   const yes=(editing||t.visible!==false)&&(!favorites.checked||t.favorite===true)&&(setting.value==='all'||setting.value===t.setting)&&(status.value==='all'||status.value===t.status)&&projectMatches&&tokens.every(k=>text.includes(k));
   c.hidden=!yes;if(yes)count++;
  }
  for(const g of results.querySelectorAll('[data-tool-group]')){
   const n=g.querySelectorAll('.tc-card:not([hidden])').length;g.hidden=n===0;if(n)groupCount++;
   g.querySelector('.tc-group-count').textContent=n+(n===1?' entry':' entries');
   const a=document.querySelector('[data-tool-jump="'+g.dataset.toolGroup+'"]');a.hidden=n===0;a.querySelector('span').textContent=n;
  }
  const projectName=projectFilter.value==='all'?'':projectFilter.value==='none'?'No documented project':projectMap.get(projectFilter.value);
  resultCount.textContent=count+(count===1?' entry':' entries')+' in '+groupCount+(groupCount===1?' section':' sections')+(projectName?' for '+projectName:'');empty.hidden=count>0;
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
  if(el.hidden){search.value='';setting.value='all';status.value='all';projectFilter.value='all';favorites.checked=false;apply();}
  const detail=el.querySelector('details');if(detail)detail.open=true;
  el.scrollIntoView({block:'center'});
 }
 root.addEventListener('click',e=>{const a=e.target.closest('a[href^="#tool-"]');if(a){e.preventDefault();showTool(a.getAttribute('href'));}});
 window.addEventListener('hashchange',()=>showTool(location.hash));
 $('tc-filter-form').addEventListener('submit',e=>{e.preventDefault();apply();});
 search.addEventListener('input',apply);setting.addEventListener('change',apply);status.addEventListener('change',apply);projectFilter.addEventListener('change',apply);favorites.addEventListener('change',apply);
 $('tc-reset').addEventListener('click',()=>{search.value='';setting.value='all';status.value='all';projectFilter.value='all';favorites.checked=false;apply();search.focus();});
 if(params.get('favorites')==='true')favorites.checked=true;
 if(params.get('q'))search.value=params.get('q');
 if(settings.has(params.get('setting')))setting.value=params.get('setting');
 if(statuses.has(params.get('status')))status.value=params.get('status');
 if((params.get('project')==='none'||projectMap.has(params.get('project')))&&projectFilter.querySelector(`option[value="${CSS.escape(params.get('project'))}"]`))projectFilter.value=params.get('project');
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
