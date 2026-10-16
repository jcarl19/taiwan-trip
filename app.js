const $ = (s) => document.querySelector(s);
const KEY = 'taiwan-together-v1';
let saved = {};
try { saved = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch {}
const starterChecklist = [
  ['todo','Confirm flights, terminals and boarding times'],
  ['todo','Check in online when available; save both boarding passes'],
  ['todo','Confirm current Taiwan entry requirements and arrival-card submission'],
  ['todo','Save flight, hotel and tour confirmations offline'],
  ['todo','Confirm hotel luggage storage and tour meeting points'],
  ['todo','Arrange ride to NAIA Terminal 3'],
  ['todo','Check booked baggage allowance and weigh both bags'],
  ['todo','Prepare TWD cash, payment cards and spending plan'],
  ['todo','Install Taiwan eSIM; save activation instructions'],
  ['todo','Download this trip guide and offline maps on both phones'],
  ['todo','Charge phones and power banks'],
  ['todo','Check the weather and make a final home check'],
  ['bring','Both passports and required travel documents'],
  ['bring','Boarding passes, return tickets and booking confirmations'],
  ['bring','Wallets, cash and payment cards'],
  ['bring','Phones, charging cables and power banks'],
  ['bring','Compatible travel plug adapter'],
  ['bring','Personal medications and basic toiletries'],
  ['bring','Comfortable walking shoes and clothes'],
  ['bring','Light jacket and compact umbrella / rain protection'],
  ['bring','Small day bag and reusable shopping bags'],
  ['bring','Water bottles and light snacks'],
].map(([category,text],i)=>({id:`starter-${i+1}`,category,text,done:false}));
let state = { theme: saved.theme === 'light' ? 'light' : 'dark', completed: saved.completed || {}, lunch: saved.lunch === 'backup' ? 'backup' : 'primary', checklist: Array.isArray(saved.checklist) ? saved.checklist.filter(i=>i && typeof i.id==='string' && typeof i.text==='string' && ['todo','bring'].includes(i.category)).map(i=>({...i,done:!!i.done})) : starterChecklist };
let editingChecklist = null, deletingChecklist = null;
let data, photos = {}, dayIndex = 0, filter = 'all', openActivity = null, expandedExpenses = new Set(), downloading = false, installPrompt;
const icons = {
  guide:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h3"/>',
  summary:'<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3zM9 3v15M15 6v15"/>',
  expenses:'<rect x="3" y="5" width="18" height="15" rx="3"/><path d="M3 9h18M15 13h6M16 16h1M6 5V3h12v2"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1 1M18 18l1 1M5 19l1-1M18 6l1-1"/>',
  moon:'<path d="M20 14a8.5 8.5 0 0 1-10-10 8.5 8.5 0 1 0 10 10z"/>',
  left:'<path d="m14 6-6 6 6 6"/>', right:'<path d="m10 6 6 6-6 6"/>',
  pin:'<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0z"/><circle cx="12" cy="10" r="2"/>',
  check:'<path d="m5 12 4 4 10-10"/>', plane:'<path d="m3 10 7 2 6 8 2-1-3-8 6-5c2-2 0-4-2-2l-6 5-8-1z"/>',
  food:'<path d="M6 3v6M3 3v5a3 3 0 0 0 6 0V3M6 11v10M18 3c-4 3-4 9 0 9V3v18"/>',
  stay:'<path d="M3 18V7M21 18V7M3 14h18M6 10h4M14 10h4M3 18v3M21 18v3"/>',
  explore:'<path d="m12 3 9 6H3zM5 10v8M10 10v8M14 10v8M19 10v8M3 21h18"/>',
  download:'<path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/>', external:'<path d="M14 3h7v7M21 3l-9 9M10 3H3v18h18v-7"/>'
};
const icon = (name) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.explore}</svg>`;
const esc = (s='') => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const inline = s => esc(s).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\[([^\]]+)\]\((https:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
const fmt = n => Math.round(n).toLocaleString('en-PH');
const money = (range, currency='TWD', person=false) => {
  if (!range) return 'Not provided';
  const factor = currency==='TWD' ? 1 : data.rate / (person ? 2 : 1);
  const p = currency==='TWD' ? 'NT$' : '₱';
  return p + fmt(range[0]*factor) + (range[0]===range[1] ? '' : '–'+fmt(range[1]*factor));
};
const dateLabel = date => new Date(date+'T12:00:00+08:00').toLocaleDateString('en-US',{timeZone:'Asia/Taipei',month:'long',day:'numeric'});
const weekday = date => new Date(date+'T12:00:00+08:00').toLocaleDateString('en-US',{timeZone:'Asia/Taipei',weekday:'long'});
function persist() { try { localStorage.setItem(KEY,JSON.stringify(state)); } catch { toast('Browser storage unavailable. Progress may not survive a refresh.'); } }
function toast(message) { $('#toast').textContent=message; $('#toast').classList.add('visible'); clearTimeout(toast.timer); toast.timer=setTimeout(()=>$('#toast').classList.remove('visible'),4000); }
function applyTheme() {
  document.documentElement.dataset.theme=state.theme;
  $('#theme-toggle').innerHTML=icon(state.theme==='dark'?'sun':'moon');
  $('#theme-toggle').setAttribute('aria-label',`Switch to ${state.theme==='dark'?'light':'dark'} theme`);
  $('meta[name="theme-color"]').content=state.theme==='dark'?'#111815':'#f6f5ef';
}
function cost(a) {
  if(a.id==='07-14' && state.lunch==='backup') return [500,800];
  if(a.costPHP) return [0,1].map(i=>(a.cost?.[i] || 0)+a.costPHP[i]/data.rate);
  return a.cost;
}
function total(day) { const amounts=(day.budgetItems || day.activities).map(cost).filter(Boolean); return amounts.length ? amounts.reduce((r,c)=>[r[0]+c[0],r[1]+c[1]],[0,0]) : null; }
function tripTotal() { return data.days.map(total).filter(Boolean).reduce((r,c)=>[r[0]+c[0],r[1]+c[1]],[0,0]); }
function stats(range) { return `<div class="money-grid"><div><small>TWD · 2 PEOPLE</small><strong>${money(range)}</strong></div><div><small>PHP · 2 PEOPLE</small><strong>${money(range,'PHP')}</strong></div><div><small>PHP · PER PERSON</small><strong>${money(range,'PHP',true)}</strong></div></div>`; }
function lunchSelector() { return `<label class="lunch-select">Lunch choice<select id="lunch"><option value="primary" ${state.lunch==='primary'?'selected':''}>Hang Zhou Xiao Long Bao</option><option value="backup" ${state.lunch==='backup'?'selected':''}>Chun Shui Tang · backup</option></select></label>`; }
function budgetNote(day) { return `<p class="fine-print">Planning rate: NT$1 ≈ ₱${data.rate}. ${day?.budgetNote || 'Hotel and prepaid eSIM excluded. Nov 9 includes its planned tour and ?1,000 shopping allocation; other optional shopping is excluded.'} ${!day || day.date==='2026-11-07'?'Nov 7 totals include EasyCard prepaid credit plus separately listed fares, so some transport amounts overlap.':''}</p>`; }
function renderBlocks(blocks=[]) {
  let output='',list=null;
  for(const b of blocks){
    const type=b.kind==='ordered'?'ol':b.kind==='bullet'?'ul':null;
    if(list!==type){if(list)output+=`</${list}>`;if(type)output+=`<${type}>`;list=type;}
    output+=type?`<li>${inline(b.text)}</li>`:b.kind==='heading'?`<h4>${inline(b.text)}</h4>`:`<p>${inline(b.text)}</p>`;
  }
  return output+(list?`</${list}>`:'');
}
function dayExtras(day) { return day.extra?`<section class="day-extra"><h2>${esc(day.extra.title)}</h2><div class="instructions">${renderBlocks(day.extra.blocks)}</div>${day.extra.maps?mapButton(day.extra.maps):''}</section>`:''; }
function mapButton(url) { return `<a class="maps-button" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${icon('pin')} Open Google Maps ${icon('external')}</a>`; }
function photo(a) {
  const destinations = {'06-13':'airport','07-01':'airport','07-11':'longshan','07-13':'cks','07-18':'rainbow','07-19':'red-house','07-20':'ximending','07-21':'eslite','07-22':'donki','08-02':'rainbow','08-03':'red-house','08-04':'tianhou','08-05':'nishi','08-06':'eslite','08-13':'qingtiangang','08-16':'cixian','08-17':'shilin'};
  const p = photos[a.photoKey || destinations[a.id]];
  if (!p) return '';
  return `<figure><img src="${esc(p.src)}" width="${p.width}" height="${p.height}" alt="${esc(p.alt)}" loading="lazy" decoding="async"><figcaption>${esc(p.alt)}<br>Photo: ${esc(p.author)} · <a href="${esc(p.source)}" target="_blank" rel="noopener noreferrer">Wikimedia Commons</a> · ${p.licenseUrl?`<a href="${esc(p.licenseUrl)}" target="_blank" rel="noopener noreferrer">${esc(p.license)}</a>`:esc(p.license)} · ${esc(p.changes)}</figcaption></figure>`;
}
function activityCard(a) {
  const done=!!state.completed[a.id], range=cost(a);
  const maps=a.id==='07-14' && state.lunch==='backup' ? 'https://www.google.com/maps/dir/?api=1&destination=Chun%20Shui%20Tang%20National%20Concert%20Hall%20Taipei&origin=Chiang%20Kai-shek%20Memorial%20Hall%20Taipei&travelmode=walking' : a.maps;
  const body=a.blocks ? renderBlocks(a.blocks) : a.guide.length ? a.guide.map(line => /^\*\*(Primary|Backup)/.test(line)?`<h4>${inline(line)}</h4>`:/^\s*\d+\./.test(line)?`<p class="guide-step">${inline(line)}</p>`:`<p>${inline(line.replace(/^- /,''))}</p>`).join('') : `<ol>${a.steps.map(s=>`<li>${inline(s)}</li>`).join('')}</ol>`;
  return `<details class="activity ${done?'completed':''}" data-activity="${a.id}" ${openActivity===a.id?'open':''}><summary><span class="activity-icon">${icon(done?'check':a.category==='transport'?'plane':a.category)}</span><span class="activity-summary"><span class="time">${esc(a.time)}</span><strong>${esc(a.title)}</strong><span class="location">${esc(a.location)}</span><span class="card-cost">${range?money(range)+' <span>· '+money(range,'PHP')+' / 2</span>':'Budget not provided'}</span></span><span class="chevron">${icon('right')}</span></summary><div class="activity-detail">${photo(a)}${a.id==='07-14'?lunchSelector():''}<h3>Step-by-step guide</h3><div class="instructions">${body}${(a.tourStops || []).map(stop=>`<section class="tour-stop"><h4>${esc(stop.title)}</h4>${photo(stop)}${renderBlocks(stop.blocks)}${stop.maps?mapButton(stop.maps):''}</section>`).join('')}${renderBlocks(a.afterBlocks)}</div>${maps?`<a class="maps-button" href="${esc(maps)}" target="_blank" rel="noopener noreferrer">${icon('pin')} Open Google Maps ${icon('external')}</a>`:''}${a.notes.map(n=>`<aside class="note"><strong>${esc(n.label)}</strong><p>${inline(n.text)}</p></aside>`).join('')}<div class="activity-budget"><span class="eyebrow">ESTIMATED EXPENSE · 2 PEOPLE</span>${stats(range)}</div><button class="complete-button ${done?'undo':''}" data-complete="${a.id}">${icon(done?'left':'check')}${done?'Undo completion':'Mark as complete'}</button></div></details>`;
}
function daily() {
  const d=data.days[dayIndex];
  const activities=d.activities.filter(a=>filter==='all'||(filter==='completed'?state.completed[a.id]:!state.completed[a.id]));
  return `<section class="page-intro"><span class="eyebrow">YOUR DAILY GUIDE</span><h1>${esc(d.title)}</h1><p>${esc(d.subtitle)}</p></section><div class="day-switch"><button class="icon-button" id="prev-day" aria-label="Previous day" ${dayIndex===0?'disabled':''}>${icon('left')}</button><div><strong>${dateLabel(d.date)}</strong><span>${weekday(d.date)} · ${d.label}</span></div><button class="icon-button" id="next-day" aria-label="Next day" ${dayIndex===data.days.length-1?'disabled':''}>${icon('right')}</button></div><div class="timeline-heading"><h2>The day's plan</h2><label class="filter-label"><span class="sr-only">Filter activities</span><select id="filter"><option value="all" ${filter==='all'?'selected':''}>All activities</option><option value="completed" ${filter==='completed'?'selected':''}>Completed</option><option value="unfinished" ${filter==='unfinished'?'selected':''}>Unfinished</option></select></label></div>${d.notice?`<aside class="note day-notice"><strong>Planning reminder</strong><p>${esc(d.notice)}</p></aside>`:''}<section class="timeline">${activities.map(activityCard).join('') || `<div class="empty">${icon(d.activities.length?'check':'summary')}<h3>${d.activities.length?'No activities in this filter':'Itinerary coming soon'}</h3><p>${d.activities.length?'Try another filter to see the rest of your day.':'We’ll add this day when its itinerary is ready.'}</p>${dayIndex===5?'<p>Confirmed return flight: November 11, 11:00 AM.</p>':''}</div>`}</section>${dayExtras(d)}`;
}
function summary() {
  return `<section class="hero"><img src="./assets/taipei.svg" alt="Illustration of Taipei's skyline and temple roofs"><div class="hero-copy"><span class="eyebrow">SIX DAYS. TWO TRAVELERS.</span><h1>A little Taiwan,<br>a lot of memories.</h1><span class="trip-pill">November 6–11, 2026 ${icon('plane')}</span></div></section><section class="overview"><div><span class="eyebrow">THE TRIP AT A GLANCE</span><h2>From takeoff to Taipei</h2><p>A quick look at where we’re going.</p></div><span class="badge">2 travelers</span></section><div class="summary-budget"><span class="eyebrow">KNOWN ESTIMATES · NOV 7–9</span>${stats(tripTotal())}<p class="fine-print">Partial gross planning total. Nov 6 costs and Nov 10–11 itineraries are still pending. Includes Nov 9’s planned tour and shopping allocation.</p><a href="#expenses" class="text-link">View expense breakdown ${icon('right')}</a></div><section class="summary-days">${data.days.map((d,index)=>`<article class="summary-day"><header><span class="day-number">${String(index).padStart(2,'0')}</span><div><span class="eyebrow">${weekday(d.date).toUpperCase()}</span><h2>${dateLabel(d.date)}</h2><p>${esc(d.subtitle)}</p></div><button class="icon-button" data-open-day="${index}" aria-label="View ${dateLabel(d.date)} daily guide">${icon('right')}</button></header>${d.activities.length?`<ul class="spot-list">${d.activities.filter(a=>a.summary).flatMap(a=>a.summaryStops?[a,...a.summaryStops]:[a]).map(a=>`<li><time>${esc(a.time)}</time><span>${esc(a.title)}</span><small>${cost(a)?money(cost(a)):'Cost pending'}</small></li>`).join('')}</ul>`:`<p class="pending">${index===5?'11:00 AM · Return flight. Remaining details pending.':'Itinerary pending'}</p>`}<div class="day-total"><span>Estimated day budget · 2 people</span><strong>${money(total(d))}</strong><small>${total(d)?money(total(d),'PHP'):'Budget pending'}</small></div></article>`).join('')}</section>`;
}
function expenses() {
  return `<section class="page-intro"><span class="eyebrow">A LITTLE PLANNING GOES A LONG WAY</span><h1>The trip budget</h1><p>Estimated expenses, together and per person.</p></section><section class="expense-overview"><span class="badge">Estimates only</span><h2>Whole-trip overview</h2><span class="eyebrow">KNOWN ESTIMATES · NOV 7–9</span>${stats(tripTotal())}<p class="partial-note">This is a partial gross planning total. Nov 6 costs and Nov 10–11 budgets have not been supplied.</p>${budgetNote()}</section><div class="timeline-heading"><h2>Day-by-day breakdown</h2><span class="subtle">For 2 people</span></div><section class="expense-days">${data.days.map((d,i)=>`<details class="expense-card" data-expense="${i}" ${expandedExpenses.has(i)?'open':''}><summary><span><span class="eyebrow">${d.label.toUpperCase()} · ${weekday(d.date).toUpperCase()}</span><strong>${dateLabel(d.date)}</strong></span><span class="expense-total"><strong>${money(total(d))}</strong><small>${total(d)?money(total(d),'PHP'):'Budget pending'}</small></span><span class="chevron">${icon('right')}</span></summary><div class="expense-detail">${i===1?lunchSelector():''}${total(d)?`<div class="table-scroll" tabindex="0" aria-label="Scrollable expense breakdown"><table><thead><tr><th>Item</th><th>TWD / 2</th><th>PHP / 2</th><th>PHP / person</th></tr></thead><tbody>${(d.budgetItems || d.activities).filter(a=>cost(a)&&cost(a)[1]>0).map(a=>`<tr><td>${a.id==='07-14'?(state.lunch==='primary'?'Lunch · Hang Zhou':'Lunch · Chun Shui Tang'):esc(a.title)}</td><td>${money(cost(a))}</td><td>${money(cost(a),'PHP')}</td><td>${money(cost(a),'PHP',true)}</td></tr>`).join('')}</tbody><tfoot><tr><th>Gross planning total</th><td>${money(total(d))}</td><td>${money(total(d),'PHP')}</td><td>${money(total(d),'PHP',true)}</td></tr></tfoot></table></div>${budgetNote(d)}`:'<p class="pending">No expense estimates supplied for this day yet. This does not mean the day is free.</p>'}</div></details>`).join('')}</section>`;
}
function checklistForm(item) {
  return `<form class="checklist-form" data-checklist-form="${item?esc(item.id):'new'}"><label>Item<input name="text" type="text" maxlength="180" value="${esc(item?.text || '')}" placeholder="e.g. Bring sunglasses" required></label><label>Section<select name="category"><option value="todo" ${item?.category!=='bring'?'selected':''}>To do</option><option value="bring" ${item?.category==='bring'?'selected':''}>To bring</option></select></label><div class="checklist-form-actions"><button type="submit" class="checklist-save">${item?'Save changes':'Add item'}</button>${item?'<button type="button" data-checklist-cancel>Cancel</button>':''}</div></form>`;
}
function checklist() {
  return `<section class="page-intro"><span class="eyebrow">BEFORE WE TAKE OFF</span><h1>Ready for Taiwan?</h1><p>One checklist for both of us. Saved on this phone.</p></section>${['todo','bring'].map(category=>`<section class="checklist-section"><h2>${category==='todo'?'To do':'To bring'}</h2><ul class="checklist-items">${state.checklist.filter(item=>item.category===category).map(item=>`<li class="checklist-item ${item.done?'checked':''}">${editingChecklist===item.id?checklistForm(item):`<div class="checklist-row"><label><input type="checkbox" data-checklist-check="${esc(item.id)}" ${item.done?'checked':''}><span>${esc(item.text)}</span></label><button class="checklist-edit" data-checklist-edit="${esc(item.id)}" aria-label="Edit ${esc(item.text)}">Edit</button><button class="checklist-delete" data-checklist-delete="${esc(item.id)}" aria-label="Delete ${esc(item.text)}">Delete</button></div>${deletingChecklist===item.id?`<div class="delete-confirm"><span>Delete this item?</span><button data-checklist-remove="${esc(item.id)}">Delete</button><button data-checklist-cancel>Keep item</button></div>`:''}`}</li>`).join('') || '<li class="checklist-empty">No items yet. Add one below.</li>'}</ul></section>`).join('')}<section class="checklist-section checklist-add"><h2>Add an item</h2>${checklistForm()}</section>`;
}
function saveChecklistItem(id,text,category) {
  text=text.trim();
  if(!text || text.length>180 || !['todo','bring'].includes(category))return false;
  if(id==='new')state.checklist.push({id:`custom-${crypto.randomUUID()}`,text,category,done:false});
  else {const item=state.checklist.find(i=>i.id===id);if(!item)return false;item.text=text;item.category=category;}
  editingChecklist=null;deletingChecklist=null;persist();return true;
}
function currentView() { const v=location.hash.slice(1); return ['daily','summary','expenses','checklist'].includes(v)?v:'summary'; }
function render() {
  const v=currentView();
  $('#main').innerHTML=v==='checklist'?checklist():v==='daily'?daily():v==='expenses'?expenses():summary();
  if(v==='checklist')$('#checklist-toggle').setAttribute('aria-current','page');
  else $('#checklist-toggle').removeAttribute?.('aria-current');
  $('.bottom-nav').innerHTML=[['daily','guide','Daily Guide'],['summary','summary','Trip Summary'],['expenses','expenses','Expenses']].map(([id,ic,title])=>`<a href="#${id}" ${v===id?'aria-current="page"':''}>${icon(ic)}<span>${title}</span></a>`).join('');
  document.title=`${v==='checklist'?'Pre-flight Checklist':v==='daily'?dateLabel(data.days[dayIndex].date):v==='summary'?'Trip Summary':'Expenses'} · Taiwan Together`;
  document.querySelectorAll('[data-activity]').forEach(el=>el.addEventListener('toggle',()=>{
    if(el.open){ openActivity=el.dataset.activity; document.querySelectorAll('[data-activity]').forEach(other=>{if(other!==el)other.open=false;}); }
    else if(openActivity===el.dataset.activity)openActivity=null;
  }));
  document.querySelectorAll('[data-expense]').forEach(el=>el.addEventListener('toggle',()=>el.open?expandedExpenses.add(Number(el.dataset.expense)):expandedExpenses.delete(Number(el.dataset.expense))));
}
$('#theme-toggle').addEventListener('click',()=>{state.theme=state.theme==='dark'?'light':'dark';persist();applyTheme();});
function updateScrollTop() { $('#scroll-top').hidden = !(window.scrollY > 300); }
window.addEventListener('scroll', updateScrollTop, { passive: true });
$('#scroll-top').addEventListener('click',()=>{
  window.scrollTo({top:0,behavior:window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  $('#main').focus({preventScroll:true});
});
updateScrollTop();
$('#main').addEventListener('click',e=>{
  const edit=e.target.closest('[data-checklist-edit]'), del=e.target.closest('[data-checklist-delete]'), remove=e.target.closest('[data-checklist-remove]');
  if(edit){editingChecklist=edit.dataset.checklistEdit;deletingChecklist=null;render();$('#main input[name="text"]').focus();return;}
  if(del){deletingChecklist=del.dataset.checklistDelete;editingChecklist=null;render();return;}
  if(remove){state.checklist=state.checklist.filter(i=>i.id!==remove.dataset.checklistRemove);deletingChecklist=null;persist();render();toast('Checklist item deleted');return;}
  if(e.target.closest('[data-checklist-cancel]')){editingChecklist=null;deletingChecklist=null;render();return;}
  const complete=e.target.closest('[data-complete]'), jump=e.target.closest('[data-open-day]');
  if(complete){const id=complete.dataset.complete; state.completed[id]=!state.completed[id];persist();render();toast(state.completed[id]?'Activity completed':'Completion undone');}
  if(jump){dayIndex=Number(jump.dataset.openDay);openActivity=null;filter='all';location.hash='daily';}
  if(e.target.closest('#prev-day')&&dayIndex>0){dayIndex--;openActivity=null;render();}
  if(e.target.closest('#next-day')&&dayIndex<data.days.length-1){dayIndex++;openActivity=null;render();}
});
$('#main').addEventListener('change',e=>{
  if(e.target.dataset?.checklistCheck){const item=state.checklist.find(i=>i.id===e.target.dataset.checklistCheck);if(item){item.done=e.target.checked;persist();e.target.closest('.checklist-item').classList.toggle('checked',item.done);}return;}
  if(e.target.id==='filter'){filter=e.target.value;openActivity=null;render();}if(e.target.id==='lunch'){state.lunch=e.target.value;persist();render();}
});
$('#main').addEventListener('submit',e=>{
  const form=e.target.closest('[data-checklist-form]');if(!form)return;e.preventDefault();
  const fields=new FormData(form);
  if(!saveChecklistItem(form.dataset.checklistForm,String(fields.get('text') || ''),String(fields.get('category') || ''))){toast('Enter an item with 1–180 characters.');return;}
  render();toast('Checklist saved');
});
window.addEventListener('hashchange',()=>{openActivity=null;render();window.scrollTo({top:0,behavior:'instant'});});
applyTheme();
try {
  const response=await fetch('./data/itinerary.json'); if(!response.ok)throw new Error('Itinerary unavailable'); data=await response.json();
  try { const photoResponse=await fetch('./data/photos.json'); if(photoResponse.ok) photos=await photoResponse.json(); } catch {}
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  const value=t=>parts.find(p=>p.type===t).value; const today=`${value('year')}-${value('month')}-${value('day')}`;
  const todayIndex=data.days.findIndex(d=>d.date===today); dayIndex=todayIndex>=0?todayIndex:0;
  if(!['daily','summary','expenses','checklist'].includes(location.hash.slice(1)))history.replaceState(null,'',todayIndex>=0?'#daily':'#summary');
  render();
} catch { $('#main').innerHTML='<div class="empty"><h1>Couldn’t load the trip</h1><p>Connect to the local server and refresh to try again.</p></div>'; }
let registration;
if('serviceWorker' in navigator) {
  try {
    registration=await navigator.serviceWorker.register('./sw.js');
    await navigator.serviceWorker.ready;
    const ready=await caches.has('taiwan-offline-v4');
    if(ready){$('#offline-status').textContent='Trip downloaded · available offline';$('#download').textContent='Refresh offline download';}
  } catch { $('#offline-status').textContent='Offline support unavailable in this browser'; }
}
$('#download').addEventListener('click',async()=>{
  if(downloading)return;
  if(!registration){toast('Offline support isn’t ready. Try refreshing the app.');return;}
  downloading=true;$('#download').disabled=true;$('#download').textContent='Downloading trip…';
  try{
    const sw=registration.active;
    await new Promise((resolve,reject)=>{const ch=new MessageChannel();const timer=setTimeout(()=>reject(new Error('Download timed out. Try again.')),45000);ch.port1.onmessage=e=>{clearTimeout(timer);e.data.ok?resolve():reject(new Error(e.data.error));};sw.postMessage({type:'DOWNLOAD_TRIP'},[ch.port2]);});
    $('#offline-status').textContent='Trip downloaded · available offline';toast('Guide and available photos are ready offline');$('#download').textContent='Refresh offline download';
  }catch(error){toast(error.message);$('#download').textContent='Retry offline download';}
  finally{downloading=false;$('#download').disabled=false;}
});
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;$('#install').hidden=false;});
$('#install').addEventListener('click',async()=>{if(installPrompt){await installPrompt.prompt();installPrompt=null;$('#install').hidden=true;}});
window.addEventListener('appinstalled',()=>{$('#install').hidden=true;toast('Taiwan Together installed');});
window.addEventListener('offline',()=>toast('You’re offline. Google Maps may need a connection.'));
