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
// Single-day closures published in the school calendar. These sit inside
// ordinary teaching weeks, so the week keeps its A/B letter but the day
// itself teaches nothing and must not advance any class through its SoW.
const MW_FIXED_OFF_DAYS = {
  '2026-10-13':'National holiday',
  '2026-12-07':'National holiday',
  '2026-12-10':'National holiday',
  '2027-05-04':'National holiday',
  '2027-06-03':'National holiday',
  '2027-06-04':'National holiday',
};
const mwSlots = {};
let mwResources = {};
let mwResourceState = 'loading';
let mwResourceError = '';
let mwOpen = null;
let mwSaving = false;
let mwUnsubscribe = null;
let mwViewMonday = null;
let mwTaught = {};
let mwServerTaught = {};
let mwOffDays = {};
let mwPicker = null;
const mwPendingPins = new Map();
let mwPinError = '';

// Course and cover assignments resolve to the *underlying* progress key.
function mwClassFor(teacher, code){
  const special = {
    '11/Fm':[11,'Ma1'],
    '10z/Fm':[10,'Ma1'],
    // Year 10 timetable names use the new labels; progress and SoW keys retain the old set numbers.
    '10z/Ma1':[10,'Ma2'],
    '10z/Ma2':[10,'Ma3'],
    '10z/Ma3':[10,'Ma4'],
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

function mwIso(date){
  return [date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),
    String(date.getDate()).padStart(2,'0')].join('-');
}
function mwMondayOf(date){
  const monday=new Date(date.getFullYear(),date.getMonth(),date.getDate());
  monday.setDate(monday.getDate()-(monday.getDay()+6)%7);
  return monday;
}

// The A/B cycle pauses over every holiday, so it cannot be derived by
// alternating calendar weeks: counting from a fixed anchor drifts one week
// out of step after each break. The schemes of work already state, for every
// teaching week, both its week code (M9A) and its cycle letter, so that is
// the only source of truth used here. A Monday absent from this map is not a
// school week at all — it is a holiday, and nothing is timetabled.
let mwWeeksCache=null;
function mwTeachingWeeks(){
  if(mwWeeksCache) return mwWeeksCache;
  const found=new Map();
  const seen=new Set();
  const collect=rows=>{
    if(!Array.isArray(rows) || seen.has(rows)) return;
    seen.add(rows);
    rows.forEach(row=>{
      if(!row || !/^[AB]$/.test(row.cycle||'')) return;
      const start=parseStartDate(row.dates);
      if(!start) return;
      const iso=mwIso(mwMondayOf(start));
      if(!found.has(iso)) found.set(iso,{iso,monday:mwMondayOf(start),cycles:{},codes:{}});
      const entry=found.get(iso);
      entry.cycles[row.cycle]=(entry.cycles[row.cycle]||0)+1;
      if(row.week) entry.codes[row.week]=(entry.codes[row.week]||0)+1;
    });
  };
  Object.keys(SETS_BY_YG).forEach(yg=>
    (SETS_BY_YG[yg]||[]).forEach(set=>collect(sowFor(Number(yg),set))));
  // A single stray row must not redefine a week, so take the most common value.
  const best=counts=>Object.keys(counts).sort((a,b)=>counts[b]-counts[a]||a.localeCompare(b))[0]||'';
  mwWeeksCache=[...found.values()]
    .map(entry=>({iso:entry.iso,monday:entry.monday,cycle:best(entry.cycles),code:best(entry.codes)}))
    .sort((a,b)=>a.iso<b.iso?-1:a.iso>b.iso?1:0);
  return mwWeeksCache;
}
function mwWeekAt(monday){
  const iso=typeof monday==='string'?monday:mwIso(monday);
  return mwTeachingWeeks().find(week=>week.iso===iso)||null;
}
function mwWeekPosition(iso){
  return mwTeachingWeeks().findIndex(week=>week.iso===iso);
}
// The first teaching week starting on or after this Monday — where a holiday
// week hands off to, and what "next" means while school is out.
function mwWeekOnOrAfter(iso){
  return mwTeachingWeeks().find(week=>week.iso>=iso)||null;
}
function mwWeekBefore(iso){
  const weeks=mwTeachingWeeks();
  for(let i=weeks.length-1;i>=0;i--) if(weeks[i].iso<iso) return weeks[i];
  return null;
}

function mwOffDayReason(date){
  const iso=mwIso(date);
  const manual=mwOffDays[iso];
  if(manual) return typeof manual==='string'?manual:'Off day';
  return MW_FIXED_OFF_DAYS[iso]||'';
}
function mwIsFixedOffDay(date){ return !!MW_FIXED_OFF_DAYS[mwIso(date)]; }

// Week shown in the grid. `monday` may be a holiday week, in which case the
// grid is replaced by a notice rather than invented from a guessed letter.
function mwWeekInfo(now, monday){
  const today=new Date(now.getFullYear(),now.getMonth(),now.getDate());
  const base=monday?new Date(monday.getFullYear(),monday.getMonth(),monday.getDate()):mwMondayOf(today);
  const friday=new Date(base); friday.setDate(base.getDate()+4);
  const week=mwWeekAt(base);
  const currentMonday=mwIso(mwMondayOf(today));
  const iso=mwIso(base);
  const offset=iso===currentMonday?0:(iso>currentMonday?1:-1);
  return {monday:base,friday,iso,
    day:offset===0?(today.getDay()+6)%7:(offset<0?5:-1),
    cycle:week?week.cycle:'',code:week?week.code:'',holiday:!week,offset};
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
    mwServerTaught=snap.exists ? (snap.data()?.taught||{}) : {};
    mwOffDays=snap.exists ? (snap.data()?.offDays||{}) : {};
    mwApplyPendingPins();
    mwResourceState='ready';
    mwResourceError='';
    mwRenderAll();
  },err=>{
    mwResourceState='error';
    mwResourceError='Could not load shared links from Firestore: '+err.message;
    renderWeek();
  });
}

function mwApplyPendingPins(){
  mwTaught={...mwServerTaught};
  mwPendingPins.forEach((value,key)=>{
    if(value.id===null) delete mwTaught[key];
    else mwTaught[key]=value.id;
  });
}

function initWeek(){
  mwViewMonday=mwDefaultMonday();
  const teacherSelect=document.getElementById('mw-teacher');
  teacherSelect.innerHTML=document.getElementById('sel-teacher').innerHTML;
  teacherSelect.value=document.getElementById('sel-teacher').value;
  window.WCIB_NOTES_REFRESH?.();
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
    mwViewMonday=mwDefaultMonday();
    mwOpen=null;
    mwPicker=null;
    renderWeek();
  });
  if(window.firebase?.auth) firebase.auth().onAuthStateChanged(()=>mwRenderAll());
  // Lesson notes are shown on the planning pages too, so listen from the
  // start rather than only once the week view has been opened.
  mwListen();
}

// On a weekend, or during a holiday, open on the next week that actually teaches.
function mwDefaultMonday(){
  const now=new Date();
  const monday=mwMondayOf(now);
  const iso=mwIso(monday);
  const weekend=now.getDay()===0||now.getDay()===6;
  if(!weekend && mwWeekAt(monday)) return monday;
  const next=mwWeekOnOrAfter(weekend?mwIso(new Date(monday.getFullYear(),monday.getMonth(),monday.getDate()+7)):iso);
  return next?next.monday:monday;
}

// Navigation steps through teaching weeks, skipping the holidays entirely,
// so "next" from the last week of term is the first week back.
function mwChangeWeek(delta){
  const iso=mwIso(mwViewMonday);
  const target=delta>0?mwWeekOnOrAfter(mwIso(new Date(mwViewMonday.getFullYear(),mwViewMonday.getMonth(),mwViewMonday.getDate()+7)))
    :mwWeekBefore(iso);
  if(!target) return;
  mwViewMonday=target.monday;
  mwOpen=null;
  mwPicker=null;
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

function mwSlotDate(info,slot){
  const date=new Date(info.monday);
  date.setDate(date.getDate()+slot.day);
  return date;
}
function mwPinKey(info,slot){
  const date=mwSlotDate(info,slot);
  const day=[date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-');
  return `${slot.teacher}__${slot.yg}-${slot.set}__${day}__P${slot.period}`;
}

function mwAssignIndexes(weekInfo,slotsForThatWeek,lessons,set,startIndex){
  const fixed=slotsForThatWeek.map(slot=>{
    const id=mwTaught[mwPinKey(weekInfo,slot)];
    return typeof id==='string' ? lessons.findIndex(lesson=>lesson.id===id) : -1;
  });
  const first=fixed.findIndex(index=>index>=0);
  const indexes=[];
  let cursor=startIndex;
  for(let i=0;i<slotsForThatWeek.length;i++){
    if(fixed[i]>=0){
      indexes[i]=fixed[i];
      cursor=fixed[i]+(getStatus(lessons[fixed[i]].id,set)==='In progress'?0:1);
    }else if(first<0 || i>first){
      indexes[i]=cursor++;
    }
  }
  if(first>=0){
    for(let i=first-1;i>=0;i--) indexes[i]=indexes[i+1]-1;
  }
  return {indexes,cursor};
}

// The next lesson to teach is the one after the last lesson marked Done or
// N/A — not the first lesson that is not yet Done. Deferring a lesson (a unit
// test pushed back a week, say) therefore no longer holds the whole class at
// that lesson and leaves every later week reading one lesson behind. The
// lesson that was passed over is reported separately, as outstanding.
function mwNextLessonIndex(lessons,set){
  let last=-1;
  lessons.forEach((lesson,index)=>{
    const status=getStatus(lesson.id,set);
    if(status==='Done'||status==='N/A') last=index;
  });
  return last+1;
}
function mwOutstanding(lessons,set,before){
  return lessons.slice(0,Math.max(0,before)).filter(lesson=>{
    const status=getStatus(lesson.id,set);
    return status!=='Done' && status!=='N/A';
  });
}

// Slots a class actually teaches in a given week: its timetable for that
// week's own cycle letter, minus any day the school is closed.
function mwWeekSlots(teacher,week,key){
  const slots=mwGroupSlots(teacher,week.cycle).get(key)||[];
  return slots.filter(slot=>!mwOffDayReason(mwSlotDate(week,slot)));
}

// Where progress is measured from: this week if school is in, otherwise the
// first week back. During a holiday nothing has been taught yet, so the
// cursor must not advance — the old code let a holiday week's phantom slots
// push every class forward a full week of lessons.
function mwAnchorWeek(){
  const now=new Date();
  const monday=mwMondayOf(now);
  const here=mwWeekAt(monday);
  if(here) return {week:here,day:(now.getDay()+6)%7};
  const next=mwWeekOnOrAfter(mwIso(monday));
  return next?{week:next,day:-1}:null;
}

// Walk teaching week by teaching week from the anchor to the week on screen,
// so each week consumes its own slot count (A and B weeks differ) and
// holidays consume none.
function mwStartIndex(teacher,key,lessons,set,anchor,anchorStart,targetIso){
  const weeks=mwTeachingWeeks();
  const from=mwWeekPosition(anchor.week.iso);
  const to=mwWeekPosition(targetIso);
  if(from<0 || to<0) return null;
  if(to>=from){
    let cursor=anchorStart;
    for(let i=from;i<to;i++){
      cursor=mwAssignIndexes(weeks[i],mwWeekSlots(teacher,weeks[i],key),lessons,set,cursor).cursor;
    }
    return cursor;
  }
  let start=anchorStart;
  for(let i=from-1;i>=to;i--) start-=mwWeekSlots(teacher,weeks[i],key).length;
  return start;
}

function mwAssignments(teacher,info){
  const days=info.holiday?[[],[],[],[],[]]:(mwSlots[teacher+'|'+info.cycle]||[[],[],[],[],[]]);
  const grouped=info.holiday?new Map():mwGroupSlots(teacher,info.cycle);
  const anchor=mwAnchorWeek();
  const assigned=new Map();
  const outstanding=new Map();
  grouped.forEach((slots,key)=>{
    const {yg,set}=tvClassFromKey(key);
    const lessons=getTeachable(sowFor(yg,set)||[]);
    const next=mwNextLessonIndex(lessons,set);
    outstanding.set(key,mwOutstanding(lessons,set,next));
    const active=slots.filter(slot=>!mwOffDayReason(mwSlotDate(info,slot)));
    let start=next;
    if(anchor){
      const anchorSlots=mwWeekSlots(teacher,anchor.week,key);
      const anchorStart=next-anchorSlots.filter(slot=>slot.day<anchor.day).length;
      const walked=mwStartIndex(teacher,key,lessons,set,anchor,anchorStart,info.iso);
      if(walked!==null) start=walked;
    }
    const {indexes}=mwAssignIndexes(info,active,lessons,set,start);
    active.forEach((slot,index)=>{
      const position=indexes[index];
      const pinnedId=mwTaught[mwPinKey(info,slot)];
      assigned.set(slot,{lesson:lessons[position]||null,beforeStart:position<0,
        pinned:typeof pinnedId==='string' && lessons[position]?.id===pinnedId,
        lessons,set,position});
    });
  });
  return {days,grouped,assigned,outstanding};
}

async function mwSetStatusAndPin(info,slot,lessonId,value){
  const doc=mwResourceDoc();
  if(!doc){
    mwPinError='Could not save progress and taught lesson: shared storage is unavailable.';
    renderWeek();
    return;
  }
  const key=mwPinKey(info,slot);
  const pending={id:value==='Not started'?null:lessonId};
  mwPendingPins.set(key,pending);
  mwApplyPendingPins();
  mwPinError='';
  renderWeek();
  try{
    await setStatusValue(lessonId,slot.set,value,
      {taught:{[key]:pending.id||firebase.firestore.FieldValue.delete()}});
  }catch(err){
    mwPinError='Could not save progress and taught lesson to Firestore: '+err.message;
    console.error(mwPinError,err);
  }finally{
    if(mwPendingPins.get(key)===pending){
      mwPendingPins.delete(key);
      mwApplyPendingPins();
      renderWeek();
    }
  }
}

// Pin a specific lesson to a slot without touching its status, for the weeks
// the automatic sequence gets wrong (a swapped lesson, a catch-up slot).
async function mwSetPin(info,slot,lessonId){
  const doc=mwResourceDoc();
  if(!doc || !window.WCIB_CAN_EDIT?.()){
    mwPinError='Could not save the lesson for this slot: shared storage is unavailable.';
    renderWeek();
    return;
  }
  const key=mwPinKey(info,slot);
  const pending={id:lessonId};
  mwPendingPins.set(key,pending);
  mwApplyPendingPins();
  mwPinError='';
  mwPicker=null;
  renderWeek();
  try{
    await doc.set({taught:{[key]:lessonId===null
      ?firebase.firestore.FieldValue.delete():lessonId}},{merge:true});
  }catch(err){
    mwPinError='Could not save the lesson for this slot: '+err.message;
    console.error(mwPinError,err);
  }finally{
    if(mwPendingPins.get(key)===pending){
      mwPendingPins.delete(key);
      mwApplyPendingPins();
      renderWeek();
    }
  }
}

// Off days are shared across the department, so one teacher marking a closure
// corrects everyone's week.
async function mwToggleOffDay(iso){
  const doc=mwResourceDoc();
  if(!doc || !window.WCIB_CAN_EDIT?.() || MW_FIXED_OFF_DAYS[iso]) return;
  const on=!!mwOffDays[iso];
  mwPinError='';
  try{
    await doc.set({offDays:{[iso]:on
      ?firebase.firestore.FieldValue.delete():'Off day'}},{merge:true});
  }catch(err){
    mwPinError='Could not save the off day: '+err.message;
    console.error(mwPinError,err);
    renderWeek();
  }
}

const mwIconDone='<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 8l3 3 7-7"/></svg>';
const mwIconEmpty='<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="8" cy="8" r="5.5"/></svg>';
const mwIconLink='<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><path d="M6.5 9.5l3-3M5.8 6.4l1.3-1.3a3 3 0 0 1 4.2 4.2L10 10.6M10.2 9.6l-1.3 1.3a3 3 0 0 1-4.2-4.2L6 5.4"/></svg>';

// ── Lesson notes ──────────────────────────────────────────────────────
// One free-text panel per lesson, shared by My Week and the planning pages,
// replacing the old Label + URL form. Anything can be pasted in; URLs are
// detected on display rather than being typed into a separate field.
const MW_NOTES_LIMIT=4000;

function mwNotesText(key){
  const value=mwResources[key]?.notes;
  return typeof value==='string' ? value : '';
}
// Links saved under the old two-field form, rendered as text so the first
// save of a note carries them over instead of losing them.
function mwLegacyNotes(key){
  return [['slides_links','Slides'],['practice_links','Practice']]
    .flatMap(([type,label])=>mwLinks(key,type)
      .map(link=>`${label}: ${link.label} ${link.url}`.trim()))
    .join('\n');
}
function mwNotesFor(key){
  return mwNotesText(key) || mwLegacyNotes(key);
}
function mwLinkify(text){
  return esc(text).replace(/(https?:\/\/[^\s<]+)/g,match=>{
    // Trailing punctuation is almost always sentence punctuation, not URL.
    const url=match.replace(/[.,;:!?)\]]+$/,'');
    return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>${match.slice(url.length)}`;
  }).replace(/\n/g,'<br>');
}
function mwNotesSummary(key){
  const text=mwNotesFor(key).replace(/\s+/g,' ').trim();
  return text.length>160 ? text.slice(0,159)+'…' : text;
}

async function mwSaveNotes(key,text){
  if(mwSaving || mwResourceState!=='ready' || !window.WCIB_CAN_EDIT?.()) return;
  const doc=mwResourceDoc();
  if(!doc) return;
  mwSaving=true;
  mwResourceError='';
  mwRenderAll();
  try{
    const notes=String(text||'').slice(0,MW_NOTES_LIMIT);
    // The old link arrays are emptied in the same write, because their
    // contents are now inside the note itself.
    await doc.set({resources:{[key]:{notes,slides_links:[],practice_links:[]}}},{merge:true});
  }catch(err){
    mwResourceError='Could not save notes to Firestore: '+err.message;
    console.error(mwResourceError,err);
  }finally{
    mwSaving=false;
    mwOpen=null;
    mwRenderAll();
  }
}

function mwNotesPanel(key){
  const editable=!!window.WCIB_CAN_EDIT?.() && mwResourceState==='ready';
  const text=mwNotesFor(key);
  return `<div class="mw-popover mw-notes-panel" role="region" aria-label="Lesson notes and links">
    <div class="mw-popover-title"><span>Notes &amp; links</span>
      <button class="mw-close" type="button" data-mw-close aria-label="Close notes">×</button></div>
    ${editable?`<form class="mw-form" data-mw-notes-form data-mw-key="${esc(key)}">
      <textarea name="notes" rows="6" maxlength="${MW_NOTES_LIMIT}" aria-label="Notes and links for this lesson"
        placeholder="Paste links, type reminders — anything. Links become clickable once saved.">${esc(text)}</textarea>
      <div class="mw-notes-actions">
        <button type="submit" ${mwSaving?'disabled':''}>${mwSaving?'Saving…':'Save'}</button>
        <button type="button" class="mw-notes-cancel" data-mw-close>Cancel</button>
      </div>
    </form>`
    :text?`<div class="mw-notes-read">${mwLinkify(text)}</div>`
    :`<p class="mw-popover-note">${mwResourceState==='ready'?'No notes yet. Sign in to add some.':'Shared notes are unavailable.'}</p>`}
    ${editable&&text?`<div class="mw-notes-read mw-notes-preview">${mwLinkify(text)}</div>`:''}
  </div>`;
}

function mwNotesChip(key,open){
  const text=mwNotesFor(key);
  const summary=mwNotesSummary(key);
  return `<button type="button" class="mw-link-chip mw-notes-chip ${text?'filled':''}"
    data-mw-notes data-mw-key="${esc(key)}" aria-expanded="${!!open}"
    title="${text?esc(summary):'Add notes or links for this lesson'}"
    aria-label="Notes and links${text?' (has notes)':''}">${mwIconLink}Notes${text?'<span class="mw-dot" aria-hidden="true"></span>':''}</button>`;
}

// Both views read the same Firestore document, so a save made in one must
// redraw the other.
function mwRenderAll(){
  renderWeek();
  const active=document.querySelector('.view.active');
  if(active && active.id==='view-teacher' && typeof renderTeacher==='function') renderTeacher();
}

window.WCIB_LESSON_NOTES={
  key:(teacher,yg,set,lessonId)=>[teacher,yg,set,lessonId].join('__'),
  chip:mwNotesChip,panel:mwNotesPanel,text:mwNotesFor,linkify:mwLinkify,
  isOpen:key=>mwOpen===key,
  toggle(key){ mwOpen=mwOpen===key?null:key; mwRenderAll(); },
};

function mwLessonPicker(info,slot,record){
  const {lessons,set,position}=record;
  const outstanding=mwOutstanding(lessons,set,position);
  const from=Math.max(0,position-6), to=Math.min(lessons.length,position+7);
  const nearby=lessons.slice(from,to).map((lesson,index)=>({lesson,index:from+index}));
  const row=(lesson,index)=>`<li><button type="button" class="mw-pick ${index===position?'current':''}"
    data-mw-pick="${esc(lesson.id)}" data-mw-pin="${esc(mwPinKey(info,slot))}">
    <span class="mw-pick-name">${esc(lesson.lessonName)}</span>
    <span class="mw-pick-status ${statusClass(getStatus(lesson.id,set))}">${esc(getStatus(lesson.id,set))}</span>
  </button></li>`;
  return `<div class="mw-popover mw-picker" role="region" aria-label="Choose the lesson for this slot">
    <div class="mw-popover-title"><span>Lesson for this slot</span>
      <button class="mw-close" type="button" data-mw-close aria-label="Close lesson list">×</button></div>
    ${outstanding.length?`<div class="mw-popover-note">Passed over earlier</div>
      <ul class="mw-picks">${outstanding.map(lesson=>row(lesson,lessons.indexOf(lesson))).join('')}</ul>`:''}
    <div class="mw-popover-note">Around this point in the scheme</div>
    <ul class="mw-picks">${nearby.map(item=>row(item.lesson,item.index)).join('')}</ul>
    ${record.pinned?`<button type="button" class="mw-unpin" data-mw-unpin="${esc(mwPinKey(info,slot))}">Clear pinned lesson</button>`:''}
  </div>`;
}

function renderWeek(){
  const root=document.getElementById('mw-content');
  if(!root) return;
  const teacher=document.getElementById('mw-teacher')?.value;
  if(!mwViewMonday) mwViewMonday=mwDefaultMonday();
  const info=mwWeekInfo(new Date(),mwViewMonday);
  const dateOptions={day:'numeric',month:'short'};
  const range=`${info.monday.toLocaleDateString('en-GB',dateOptions)} – ${info.friday.toLocaleDateString('en-GB',dateOptions)}`;
  const here=mwIso(mwMondayOf(new Date()));
  const relative=info.iso===here?'This week · '
    :mwWeekOnOrAfter(here)?.iso===info.iso&&info.iso!==here?'Next week · '
    :mwWeekBefore(here)?.iso===info.iso?'Last week · ':'';
  document.getElementById('mw-dates').textContent=info.holiday
    ? `${range} · School holiday`
    : `${relative}${range} · Week ${info.cycle}${info.code?` · ${info.code}`:''}`;
  if(info.offset>0 && !info.holiday){
    const provisional=document.createElement('span');
    provisional.className='mw-provisional';
    provisional.textContent=' · provisional';
    document.getElementById('mw-dates').append(provisional);
  }
  document.getElementById('mw-prev').disabled=!mwWeekBefore(info.iso);
  document.getElementById('mw-next').disabled=!mwWeekOnOrAfter(mwIso(
    new Date(info.monday.getFullYear(),info.monday.getMonth(),info.monday.getDate()+7)));
  document.getElementById('mw-this-week').hidden=info.iso===mwIso(mwDefaultMonday());
  if(document.getElementById('view-week').classList.contains('active')) mwListen();
  if(info.holiday){
    const back=mwWeekOnOrAfter(info.iso);
    root.innerHTML=`<div class="mw-notice mw-holiday">
      <strong>No lessons this week — school holiday.</strong>
      ${back?`Teaching resumes on ${back.monday.toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'})} in Week ${back.cycle}${back.code?` (${back.code})`:''}.`:''}
      Progress is unchanged over the break.</div>`;
    return;
  }
  const {days,grouped,assigned,outstanding}=mwAssignments(teacher,info);
  const keys=[...grouped.keys()].sort((a,b)=>{
    const x=tvClassFromKey(a),y=tvClassFromKey(b);
    return x.yg-y.yg||tvClassLabel(x.yg,x.set).localeCompare(tvClassLabel(y.yg,y.set));
  });
  const notice=(mwPinError?`<div class="mw-notice mw-error" role="alert">${esc(mwPinError)}</div>`:'')+(mwResourceError
    ? `<div class="mw-notice mw-error" role="alert">${esc(mwResourceError)}</div>`
    : mwResourceState==='loading' ? '<div class="mw-notice">Loading shared links…</div>' : '');
  if(!keys.length){
    root.innerHTML=notice+'<div class="mw-notice">No classes are timetabled for this teacher in the selected week.</div>';
    return;
  }
  const editable=!!window.WCIB_CAN_EDIT?.();
  const dayDates=MW_DAYS.map((name,day)=>{
    const date=new Date(info.monday); date.setDate(date.getDate()+day);
    return {name,day,date,iso:mwIso(date),reason:mwOffDayReason(date),fixed:mwIsFixedOffDay(date)};
  });
  root.innerHTML=notice+`<div class="mw-scroll"><table class="mw-grid">
    <thead><tr><th scope="col">Class</th>${dayDates.map(({name,day,iso,reason,fixed})=>
      `<th scope="col" class="${reason?'mw-off':day<info.day?'mw-past':day===info.day?'mw-today':''}">${name}${day===info.day?'<span class="mw-today-tag">Today</span>':''}
        ${reason?`<span class="mw-off-tag">${esc(reason)}</span>`:''}
        ${editable&&!fixed?`<button type="button" class="mw-off-toggle" data-mw-offday="${iso}" aria-pressed="${!!reason}" title="${reason?'Restore this teaching day':'Mark as an off day — no lessons taught'}">${reason?'Restore day':'Off day'}</button>`:''}
      </th>`).join('')}</tr></thead>
    <tbody>${keys.map(key=>{
      const {yg,set}=tvClassFromKey(key);
      const missed=outstanding.get(key)||[];
      return `<tr><th scope="row">${esc(tvClassLabel(yg,set))}
        ${missed.length?`<span class="mw-catchup" title="${esc(missed.slice(0,6).map(l=>l.lessonName).join('\n'))}${missed.length>6?`\n+${missed.length-6} more`:''}">${missed.length} to catch up</span>`:''}
      </th>${dayDates.map(({day,reason})=>{
        const slots=days[day]||[];
        const matching=slots.filter(slot=>tvClassKey(slot.yg,slot.set)===key);
        if(reason) return `<td class="mw-off">${matching.length?'<div class="mw-empty" aria-label="School closed">No lesson</div>':'<div class="mw-empty" aria-label="No lesson">–</div>'}</td>`;
        return `<td class="${day<info.day?'mw-past':day===info.day?'mw-today':''}">
          ${matching.length ? matching.map(slot=>{
             const record=assigned.get(slot)||{};
             const {lesson,beforeStart,pinned}=record;
            if(!lesson) return `<div class="mw-lesson"><div class="mw-slot">P${slot.period} · ${slot.time}</div><div class="mw-topic">${beforeStart?'Before recorded progress':'No remaining SoW lesson'}</div></div>`;
            const resourceKey=mwResourceKey(slot,lesson);
            const pinKey=mwPinKey(info,slot);
            return `<div class="mw-lesson"><div class="mw-slot">P${slot.period} · ${slot.time}</div>
              <button type="button" class="mw-topic mw-topic-pick" data-mw-choose="${esc(pinKey)}" aria-expanded="${mwPicker===pinKey}" title="Change the lesson for this slot">${esc(lesson.lessonName)}</button>
              ${mwPicker===pinKey ? mwLessonPicker(info,slot,record) : ''}
                <select class="status-sel mw-status ${statusClass(getStatus(lesson.id,set))}" data-mw-status data-mw-pin="${esc(mwPinKey(info,slot))}" data-lesson-id="${esc(lesson.id)}" data-set="${esc(set)}" aria-label="Status for ${esc(lesson.lessonName)}">
                 ${['Not started','In progress','Done','N/A'].map(value=>`<option ${getStatus(lesson.id,set)===value?'selected':''}>${value}</option>`).join('')}
               </select>
               ${pinned?`<div class="mw-slot">Pinned · taught ${mwSlotDate(info,slot).toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'})}</div>`:''}
              <div class="mw-pills">${[['slides_links','Slides'],['practice_links','Practice Qs']].map(([type,label])=>{
                 const filled=mwReady(resourceKey,type);
                 return `<button type="button" class="mw-pill solo ${filled?'filled':''}" data-mw-toggle data-mw-key="${esc(resourceKey)}" data-mw-type="${type}" aria-pressed="${filled}" aria-label="${label} ready">${filled?mwIconDone:mwIconEmpty}${label}</button>`;
              }).join('')}${mwNotesChip(resourceKey,mwOpen===resourceKey)}</div>
              ${mwOpen===resourceKey ? mwNotesPanel(resourceKey) : ''}
            </div>`;
          }).join(''):'<div class="mw-empty" aria-label="No lesson">–</div>'}
        </td>`;
      }).join('')}</tr>`;
    }).join('')}</tbody></table></div>`;
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

function mwCurrentInfo(){
  if(!mwViewMonday) mwViewMonday=mwDefaultMonday();
  return mwWeekInfo(new Date(),mwViewMonday);
}
function mwSlotForPin(pinKey){
  const info=mwCurrentInfo();
  if(info.holiday) return null;
  return mwSlots[document.getElementById('mw-teacher')?.value+'|'+info.cycle]
    ?.flat().find(item=>mwPinKey(info,item)===pinKey)||null;
}

document.addEventListener('click',event=>{
  // The notes chip and its close button also appear on the planning pages,
  // so they are handled before the My Week scope check.
  const notesChip=event.target.closest('[data-mw-notes]');
  if(notesChip){
    mwPicker=null;
    window.WCIB_LESSON_NOTES.toggle(notesChip.dataset.mwKey);
    return;
  }
  if(event.target.closest('[data-mw-close]')){
    mwOpen=null;mwPicker=null;mwRenderAll();
    return;
  }
  const root=event.target.closest('#view-week');
  if(!root) return;
  const toggle=event.target.closest('[data-mw-toggle]');
  const choose=event.target.closest('[data-mw-choose]');
  const pick=event.target.closest('[data-mw-pick]');
  const unpin=event.target.closest('[data-mw-unpin]');
  const offday=event.target.closest('[data-mw-offday]');
  if(offday){
    mwToggleOffDay(offday.dataset.mwOffday);
  }else if(pick){
    const slot=mwSlotForPin(pick.dataset.mwPin);
    if(slot) mwSetPin(mwCurrentInfo(),slot,pick.dataset.mwPick);
  }else if(unpin){
    const slot=mwSlotForPin(unpin.dataset.mwUnpin);
    if(slot) mwSetPin(mwCurrentInfo(),slot,null);
  }else if(choose){
    const key=choose.dataset.mwChoose;
    mwPicker=mwPicker===key?null:key;
    mwOpen=null;
    renderWeek();
  }else if(toggle){
    mwToggleReady(toggle.dataset.mwKey,toggle.dataset.mwType);
  }
});
// The notes panel appears in both views, so the form handler is global.
document.addEventListener('submit',event=>{
  const form=event.target.closest('[data-mw-notes-form]');
  if(!form) return;
  event.preventDefault();
  mwSaveNotes(form.dataset.mwKey,form.elements.notes.value);
});
document.addEventListener('change',event=>{
  const select=event.target.closest('[data-mw-status]');
  if(!select || !select.closest('#view-week')) return;
  if(!window.WCIB_CAN_EDIT?.()){
    select.value=getStatus(select.dataset.lessonId,select.dataset.set);
    return;
  }
  const info=mwCurrentInfo();
  const slot=mwSlotForPin(select.dataset.mwPin);
  if(slot) mwSetStatusAndPin(info,slot,select.dataset.lessonId,select.value);
  refreshActiveView();
});
