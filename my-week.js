// Timetable transcribed from the 23 September 2026 iSAMS Michaelmas V4 export.
// Each line: teacher, cycle, Monday | Tuesday | Wednesday | Thursday | Friday.
// Within each day: period:class-code. Non-teaching activities are omitted.
const MW_TIMETABLE = `
FTA A 3:8z/Ma3,4:11z/Ma2,5:7V/Ma,6:9z/Ma1 | 1:8z/Ma3,3:12E/Ma,4:12E/Ma,5:9z/Ma1,6:11z/Ma2,7:10z/Ma3 | 2:8z/Ma3,5:11z/Ma2,6:7V/Ma | 1:10z/Ma3,2:9z/Ma1,3:12E/Ma,4:7V/Ma | 1:12E/Ma,2:7V/Ma,3:9z/Ma1,4:10z/Ma3,5:8z/Ma3
FTA B 1:9z/Ma1,3:8z/Ma3,4:12E/Ma,6:7V/Ma | 1:10z/Ma3,2:10z/Ma3,4:11z/Ma2,5:9z/Ma1,6:12E/Ma | 2:7V/Ma,4:12E/Ma,5:11z/Ma2,6:8z/Ma3 | 1:11z/Ma2,5:9z/Ma1,6:12E/Ma | 1:8z/Ma3,2:7V/Ma,5:10z/Ma3
MKM A 3:8z/Ma2,4:11z/Ma4,5:7R/Ma,6:9z/Ma3 | 1:8z/Ma2,2:12B/Fm,3:12E/Fm,4:12E/Fm,5:9z/Ma3,6:11z/Ma4 | 2:8z/Ma2,5:11z/Ma4,6:7R/Ma | 2:9z/Ma3,3:12E/Fm,4:7R/Ma,6:12B/Fm | 1:12E/Fm,2:7R/Ma,3:9z/Ma3,4:12B/Fm,5:8z/Ma2
MKM B 1:9z/Ma3,3:8z/Ma2,4:12E/Fm,6:7R/Ma | 1:12B/Fm,2:12B/Fm,4:11z/Ma4,5:9z/Ma3,6:12E/Fm | 2:7R/Ma,4:12E/Fm,5:11z/Ma4,6:8z/Ma2 | 1:11z/Ma4,5:9z/Ma3,6:12E/Fm | 1:8z/Ma2,2:7R/Ma,6:12B/Fm
HPA A 2:13A/Fm,3:8z/Ma4,5:7S/Ma,6:9z/Ma2 | 1:8z/Ma4,3:13C/Fm,5:9z/Ma2,7:10z/Ma2 | 2:8z/Ma4,3:13C/Fm,6:7S/Ma | 1:10z/Ma2,2:9z/Ma2,4:7S/Ma,5:13A/Fm | 2:7S/Ma,3:9z/Ma2,4:10z/Ma2,5:8z/Ma4,6:13C/Fm
HPA B 1:9z/Ma2,3:8z/Ma4,5:13C/Fm,6:7S/Ma | 1:10z/Ma2,2:10z/Ma2,3:13A/Fm,5:9z/Ma2 | 2:7S/Ma,3:13C/Fm,5:12B/Fm,6:8z/Ma4 | 3:13A/Fm,4:13C/Fm,5:9z/Ma2 | 1:8z/Ma4,2:7S/Ma,3:13A/Fm,5:10z/Ma2,6:11/Fm
SSW A 1:13A/Fm,3:12B/Fm,4:11z/Ma1,5:12C/Ma,6:9z/Ma4 | 5:9z/Ma4,6:11z/Ma1,7:10z/Fm | 2:12C/Ma,3:12C/Ma,4:13A/Fm,5:11z/Ma1 | 1:10z/Fm,2:9z/Ma4,4:13A/M1 | 2:12E/Ma,3:9z/Ma4,4:10z/Fm,6:12C/Ma
SSW B 1:9z/Ma4,3:12B/Fm,6:12C/Ma | 1:10z/Fm,2:10z/Fm,4:11z/Ma1,5:9z/Ma4 | 2:12C/Ma,3:12C/Ma,5:11z/Ma1 | 1:11z/Ma1,4:12C/Ma,5:9z/Ma4 | 1:12E/Ma,2:12E/Ma,4:13A/Fm,5:10z/Fm
ADE A 1:13A/Ma,2:13A/Ma,3:8z/Ma1,4:11z/Ma3,5:7T/Ma,6:12C/Ma | 1:8z/Ma1,6:11z/Ma3,7:10z/Ma1 | 2:8z/Ma1,4:13A/Ma,5:11z/Ma3,6:7T/Ma | 1:10z/Ma1,4:7T/Ma,5:13A/Ma | 2:7T/Ma,4:10z/Ma1,5:8z/Ma1
ADE B 1:13A/M1,2:13A/M1,3:8z/Ma1,5:12C/Ma,6:7T/Ma | 1:10z/Ma1,2:10z/Ma1,3:13A/Ma,4:11z/Ma3 | 2:7T/Ma,5:11z/Ma3,6:8z/Ma1 | 1:11z/Ma3,3:13A/Ma,5:12C/Ma | 1:8z/Ma1,2:7T/Ma,3:13A/Ma,4:13A/Ma,5:10z/Ma1
XLN A 6:13C/Fm | | 2:13C/Fm | 4:13A/D1 | 2:12E/M1 FM
XLN B 1:13A/D1,2:13A/D1 | | 2:13C/Fm | | 1:12E/M1 FM,2:12E/M1 FM
`;

const MW_TIMES = {'1':'07:50','2':'08:50','3':'10:05','4':'11:05','5':'12:55','6':'13:55','7':'14:55'};
const MW_DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday'];
const mwSlots = {};
let mwResources = {};
let mwResourceState = 'loading';
let mwResourceError = '';
let mwOpen = null;
let mwSaving = false;
let mwUnsubscribe = null;
let mwWeekOffset = 0;

// Course and cover assignments resolve to the *underlying* progress key.
function mwClassFor(teacher, code){
  const special = {
    '11/Fm':[11,'Ma1'],
    '10z/Fm':[10,'Ma1'],
    '13A/M1':[13,'M1'],
    '13A/Ma':[13,'P34'],
    '13A/D1':[13,'D1'],
    '12E/M1 FM':[12,'FMM1'],
    '12B/Fm': teacher==='MKM' ? [12,'FMP1234'] : [12,'FMS1'],
    '12E/Fm':[12,'FMP1234'],
    '12C/Ma':[12,teacher==='ADE'?'Ma2S1':'Ma1P12'],
    '12E/Ma':[12,teacher==='FTA'?'Ma2P12':'Ma1S1'],
    '13A/Fm':[13,teacher==='SSW'?'FMS23':'FMFP12'],
    '13C/Fm':[13,teacher==='XLN'?'FMM2':'FMFP12'],
  };
  if(special[code]) return special[code];
  const m=code.match(/^(\d+)[A-Za-z]\/Ma([1-4])$/);
  if(m) return [Number(m[1]),'Ma'+m[2]];
  const y7= {'7V/Ma':'Ma4','7R/Ma':'Ma1','7S/Ma':'Ma2','7T/Ma':'Ma3'};
  if(y7[code]) return [7,y7[code]];
  throw new Error(`Unmapped timetable class ${teacher}: ${code}`);
}

function mwPrepareSlots(){
  MW_TIMETABLE.trim().split('\n').forEach(line=>{
    const m=line.trim().match(/^(\w+) ([AB]) (.*)$/);
    if(!m) throw new Error('Invalid timetable line: '+line);
    const [ ,teacher,cycle,text]=m;
    mwSlots[teacher+'|'+cycle]=text.split('|').map((day,dayIndex)=>
      day.trim() ? day.trim().split(',').map(item=>{
        const i=item.indexOf(':');
        const period=item.slice(0,i), code=item.slice(i+1);
        const [yg,set]=mwClassFor(teacher,code);
        return {teacher,day:dayIndex,period,time:MW_TIMES[period],code,yg,set};
      }) : []
    );
  });
}
mwPrepareSlots();

// 24 August 2026 is Week A in the school's timetable. This is used only
// for choosing timetable slots; lesson content always comes from progress.
function mwWeekInfo(now, offset=0){
  offset=Math.max(-1,Math.min(1,offset));
  const today=new Date(now.getFullYear(),now.getMonth(),now.getDate());
  const monday=new Date(today);
  monday.setDate(today.getDate()-(today.getDay()+6)%7);
  monday.setDate(monday.getDate()+offset*7);
  const friday=new Date(monday); friday.setDate(monday.getDate()+4);
  const anchor=new Date(2026,7,24);
  const utcDay=d=>Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/86400000;
  const weeks=Math.round((utcDay(monday)-utcDay(anchor))/7);
  const planned=Y7_SOW.find(row=>{
    const start=parseStartDate(row.dates);
    const end=parseEndDate(row.dates);
    return start && end && start<=friday && end>=monday && /^[AB]$/.test(row.cycle);
  });
  return {monday,friday,day:offset===0?(today.getDay()+6)%7:(offset<0?5:-1),
    cycle:planned?.cycle || (Math.abs(weeks)%2===0?'A':'B'),offset};
}

function mwResourceKey(slot,lesson){
  return [slot.teacher,slot.yg,slot.set,lesson.id].join('__');
}
function mwLinks(key,type){
  const list=mwResources[key]?.[type];
  return Array.isArray(list) ? list : [];
}
function mwReady(key,type){
  const flag=mwResources[key]?.[type==='slides_links'?'slides_ready':'practice_ready'];
  return flag ?? (mwLinks(key,type).length>0);
}
function mwResourceDoc(){
  return window.WCIB_DB;
}
function mwListen(){
  if(mwUnsubscribe) return;
  const doc=mwResourceDoc();
  if(!doc){
    mwUnsubscribe=()=>{};
    mwResourceState='error';
    mwResourceError='Shared resource storage is unavailable. Links cannot be edited.';
    renderWeek();
    return;
  }
  mwUnsubscribe=doc.onSnapshot(snap=>{
    mwResources=snap.exists ? (snap.data()?.resources||{}) : {};
    mwResourceState='ready';
    mwResourceError='';
    renderWeek();
  },err=>{
    mwResourceState='error';
    mwResourceError='Could not load shared links from Firestore: '+err.message;
    renderWeek();
  });
}

function initWeek(){
  const weekday=new Date().getDay();
  if(weekday===0 || weekday===6) mwWeekOffset=1;
  const teacherSelect=document.getElementById('mw-teacher');
  teacherSelect.innerHTML=document.getElementById('sel-teacher').innerHTML;
  teacherSelect.value=document.getElementById('sel-teacher').value;
  teacherSelect.addEventListener('change',()=>{
    document.getElementById('sel-teacher').value=teacherSelect.value;
    updateClassDropdown();
    saveTvFilters();
    mwOpen=null;
    renderWeek();
  });
  document.getElementById('mw-prev').addEventListener('click',()=>mwChangeWeek(-1));
  document.getElementById('mw-next').addEventListener('click',()=>mwChangeWeek(1));
  document.getElementById('mw-this-week').addEventListener('click',()=>{
    mwWeekOffset=0;
    mwOpen=null;
    renderWeek();
  });
  if(window.firebase?.auth) firebase.auth().onAuthStateChanged(()=>renderWeek());
}

function mwChangeWeek(delta){
  const offset=Math.max(-1,Math.min(1,mwWeekOffset+delta));
  if(offset===mwWeekOffset) return;
  mwWeekOffset=offset;
  mwOpen=null;
  renderWeek();
}

function mwGroupSlots(teacher,cycle){
  const days=mwSlots[teacher+'|'+cycle]||[[],[],[],[],[]];
  const grouped=new Map();
  days.forEach((slots,day)=>slots.forEach(slot=>{
    const key=tvClassKey(slot.yg,slot.set);
    if(!grouped.has(key)) grouped.set(key,[]);
    grouped.get(key).push(slot);
  }));
  return grouped;
}

function mwAssignments(teacher,info){
  const days=mwSlots[teacher+'|'+info.cycle]||[[],[],[],[],[]];
  const grouped=mwGroupSlots(teacher,info.cycle);
  const currentInfo=mwWeekInfo(new Date(),0);
  const currentGrouped=mwGroupSlots(teacher,currentInfo.cycle);
  const previousGrouped=info.offset<0 ? mwGroupSlots(teacher,info.cycle) : null;
  const assigned=new Map();
  grouped.forEach((slots,key)=>{
    const {yg,set}=tvClassFromKey(key);
    const lessons=getTeachable(sowFor(yg,set)||[]);
    const pointer=lessons.findIndex(l=>getStatus(l.id,set)!=='Done');
    const next=pointer<0?lessons.length:pointer;
    // Anchor the pointer to today, then move by this class's actual slot
    // counts; adjacent weeks may have different timetable cycles.
    const currentSlots=currentGrouped.get(key)||[];
    const currentWeekStart=next-currentSlots.filter(s=>s.day<currentInfo.day).length;
    const start=info.offset>0 ? currentWeekStart+currentSlots.length
      : info.offset<0 ? currentWeekStart-(previousGrouped.get(key)||[]).length
      : currentWeekStart;
    slots.forEach((slot,index)=>assigned.set(slot,
      {lesson:lessons[start+index]||null,beforeStart:start+index<0}));
  });
  return {days,grouped,assigned};
}

const mwIconDone='<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 8l3 3 7-7"/></svg>';
const mwIconEmpty='<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="8" cy="8" r="5.5"/></svg>';
const mwIconLink='<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><path d="M6.5 9.5l3-3M5.8 6.4l1.3-1.3a3 3 0 0 1 4.2 4.2L10 10.6M10.2 9.6l-1.3 1.3a3 3 0 0 1-4.2-4.2L6 5.4"/></svg>';

function mwPopover(key,type){
  const links=mwLinks(key,type);
  const editable=!!window.WCIB_CAN_EDIT?.() && mwResourceState==='ready';
  return `<div class="mw-popover" role="region" aria-label="${type==='slides_links'?'Slides':'Practice questions'} links">
    <div class="mw-popover-title"><span>${type==='slides_links'?'Slides':'Practice Qs'}</span>
      <button class="mw-close" type="button" data-mw-close aria-label="Close links">×</button></div>
    <ul class="mw-links">${links.map((link,index)=>`<li>
      ${/^https?:\/\//i.test(link.url)?`<a href="${esc(link.url)}" target="_blank" rel="noopener noreferrer">${esc(link.label)}</a>`:esc(link.label)}
      ${editable?`<button class="mw-remove" type="button" data-mw-remove="${index}" aria-label="Remove ${esc(link.label)}">Remove</button>`:''}
    </li>`).join('')}</ul>
    ${!links.length?'<div class="mw-popover-note">No links yet.</div>':''}
    ${editable?`<form class="mw-form" data-mw-form>
      <input name="label" aria-label="Link label" placeholder="Label" required maxlength="100">
      <input name="url" type="url" aria-label="Link URL" placeholder="https://…" required>
      <button type="submit" ${mwSaving?'disabled':''}>${mwSaving?'Saving…':'Save link'}</button>
    </form>`:`<p class="mw-popover-note">${mwResourceState==='ready'?'Sign in to edit links.':'Shared links are unavailable.'}</p>`}
  </div>`;
}

function renderWeek(){
  const root=document.getElementById('mw-content');
  if(!root) return;
  const teacher=document.getElementById('mw-teacher')?.value;
  const info=mwWeekInfo(new Date(),mwWeekOffset);
  const dateOptions={day:'numeric',month:'short'};
  document.getElementById('mw-dates').textContent=
    `${info.offset>0?'Next week · ':info.offset<0?'Last week · ':''}${info.monday.toLocaleDateString('en-GB',dateOptions)} – ${info.friday.toLocaleDateString('en-GB',dateOptions)} · Week ${info.cycle}`;
  if(info.offset>0){
    const provisional=document.createElement('span');
    provisional.className='mw-provisional';
    provisional.textContent=' · provisional';
    document.getElementById('mw-dates').append(provisional);
  }
  document.getElementById('mw-prev').disabled=info.offset===-1;
  document.getElementById('mw-next').disabled=info.offset===1;
  document.getElementById('mw-this-week').hidden=info.offset===0;
  if(document.getElementById('view-week').classList.contains('active')) mwListen();
  const {days,grouped,assigned}=mwAssignments(teacher,info);
  const keys=[...grouped.keys()].sort((a,b)=>{
    const x=tvClassFromKey(a),y=tvClassFromKey(b);
    return x.yg-y.yg||tvClassLabel(x.yg,x.set).localeCompare(tvClassLabel(y.yg,y.set));
  });
  const notice=mwResourceError
    ? `<div class="mw-notice mw-error" role="alert">${esc(mwResourceError)}</div>`
    : mwResourceState==='loading' ? '<div class="mw-notice">Loading shared links…</div>' : '';
  if(!keys.length){
    root.innerHTML=notice+'<div class="mw-notice">No classes are timetabled for this teacher in the selected week.</div>';
    return;
  }
  root.innerHTML=notice+`<div class="mw-scroll"><table class="mw-grid">
    <thead><tr><th scope="col">Class</th>${MW_DAYS.map((name,day)=>
      `<th scope="col" class="${day<info.day?'mw-past':day===info.day?'mw-today':''}">${name}${day===info.day?'<span class="mw-today-tag">Today</span>':''}</th>`).join('')}</tr></thead>
    <tbody>${keys.map(key=>{
      const {yg,set}=tvClassFromKey(key);
      return `<tr><th scope="row">${esc(tvClassLabel(yg,set))}</th>${days.map((slots,day)=>{
        const matching=slots.filter(slot=>tvClassKey(slot.yg,slot.set)===key);
        return `<td class="${day<info.day?'mw-past':day===info.day?'mw-today':''}">
          ${matching.length ? matching.map(slot=>{
            const {lesson,beforeStart}=assigned.get(slot);
            if(!lesson) return `<div class="mw-lesson"><div class="mw-slot">P${slot.period} · ${slot.time}</div><div class="mw-topic">${beforeStart?'Before recorded progress':'No remaining SoW lesson'}</div></div>`;
            const resourceKey=mwResourceKey(slot,lesson);
            return `<div class="mw-lesson"><div class="mw-slot">P${slot.period} · ${slot.time}</div>
              <div class="mw-topic">${esc(lesson.lessonName)}</div>
               <select class="status-sel mw-status ${statusClass(getStatus(lesson.id,set))}" data-mw-status data-lesson-id="${esc(lesson.id)}" data-set="${esc(set)}" aria-label="Status for ${esc(lesson.lessonName)}">
                 ${['Not started','In progress','Done','N/A'].map(value=>`<option ${getStatus(lesson.id,set)===value?'selected':''}>${value}</option>`).join('')}
               </select>
              <div class="mw-pills">${[['slides_links','Slides'],['practice_links','Practice Qs']].map(([type,label])=>{
                 const count=mwLinks(resourceKey,type).length;
                 const filled=mwReady(resourceKey,type);
                 return `<span class="mw-pill-group">
                   <button type="button" class="mw-pill ${filled?'filled':''}" data-mw-toggle data-mw-key="${esc(resourceKey)}" data-mw-type="${type}" aria-pressed="${filled}" aria-label="${label} ready">${filled?mwIconDone:mwIconEmpty}${label}</button>
                   <button type="button" class="mw-link-chip" data-mw-links data-mw-key="${esc(resourceKey)}" data-mw-type="${type}" aria-expanded="${mwOpen?.key===resourceKey&&mwOpen?.type===type}" aria-label="${label} links${count?`: ${count}`:''}">${mwIconLink}${count||''}</button>
                 </span>`;
              }).join('')}</div>
              ${mwOpen?.key===resourceKey ? mwPopover(resourceKey,mwOpen.type) : ''}
            </div>`;
          }).join(''):'<div class="mw-empty" aria-label="No lesson">–</div>'}
        </td>`;
      }).join('')}</tr>`;
    }).join('')}</tbody></table></div>`;
}

async function mwChangeLinks(key,type,change){
  if(mwSaving || mwResourceState!=='ready' || !window.WCIB_CAN_EDIT?.()) return;
  const doc=mwResourceDoc();
  if(!doc) return;
  mwSaving=true;
  mwResourceError='';
  renderWeek();
  try{
    await firebase.firestore().runTransaction(async transaction=>{
      const snap=await transaction.get(doc);
      const current=snap.data()?.resources?.[key]?.[type];
      const existing=Array.isArray(current)?current:[];
      const updated=change(existing);
      const patch={[type]:updated};
      if(!existing.length && updated.length) patch[type==='slides_links'?'slides_ready':'practice_ready']=true;
      transaction.set(doc,{resources:{[key]:patch}},{merge:true});
    });
  }catch(err){
    mwResourceError='Could not save links to Firestore: '+err.message;
    console.error(mwResourceError,err);
  }finally{
    mwSaving=false;
    renderWeek();
  }
}

async function mwToggleReady(key,type){
  if(mwSaving || mwResourceState!=='ready' || !window.WCIB_CAN_EDIT?.()) return;
  const doc=mwResourceDoc();
  if(!doc) return;
  const readyField=type==='slides_links'?'slides_ready':'practice_ready';
  mwSaving=true;
  mwResourceError='';
  try{
    await firebase.firestore().runTransaction(async transaction=>{
      const snap=await transaction.get(doc);
      const resource=snap.data()?.resources?.[key]||{};
      const links=Array.isArray(resource[type])?resource[type]:[];
      const filled=resource[readyField] ?? (links.length>0);
      transaction.set(doc,{resources:{[key]:{[readyField]:!filled}}},{merge:true});
    });
  }catch(err){
    mwResourceError='Could not update readiness in Firestore: '+err.message;
    console.error(mwResourceError,err);
  }finally{
    mwSaving=false;
    renderWeek();
  }
}

document.addEventListener('click',event=>{
  const root=event.target.closest('#view-week');
  if(!root) return;
  const toggle=event.target.closest('[data-mw-toggle]');
  const chip=event.target.closest('[data-mw-links]');
  if(toggle){
    mwToggleReady(toggle.dataset.mwKey,toggle.dataset.mwType);
  }else if(chip){
    const next={key:chip.dataset.mwKey,type:chip.dataset.mwType};
    mwOpen=mwOpen?.key===next.key&&mwOpen?.type===next.type ? null : next;
    renderWeek();
  }else if(event.target.closest('[data-mw-close]')){
    mwOpen=null;renderWeek();
  }else if(event.target.closest('[data-mw-remove]') && mwOpen){
    const index=Number(event.target.closest('[data-mw-remove]').dataset.mwRemove);
    const {key,type}=mwOpen;
    mwChangeLinks(key,type,links=>links.filter((_,i)=>i!==index));
  }
});
document.addEventListener('submit',event=>{
  const form=event.target.closest('[data-mw-form]');
  if(!form || !mwOpen) return;
  event.preventDefault();
  const label=form.elements.label.value.trim();
  const rawUrl=form.elements.url.value.trim();
  let url;
  try{
    url=new URL(rawUrl);
    if(!['https:','http:'].includes(url.protocol)) throw new Error('Unsupported link');
  }catch(e){
    mwResourceError='Enter a valid http or https link.';
    renderWeek();
    return;
  }
  if(!label) return;
  const {key,type}=mwOpen;
  mwChangeLinks(key,type,links=>[...links,{label,url:url.href}]);
});
document.addEventListener('change',event=>{
  const select=event.target.closest('[data-mw-status]');
  if(!select || !select.closest('#view-week')) return;
  if(!window.WCIB_CAN_EDIT?.()){
    select.value=getStatus(select.dataset.lessonId,select.dataset.set);
    return;
  }
  setStatusValue(select.dataset.lessonId,select.dataset.set,select.value);
  refreshActiveView();
});
