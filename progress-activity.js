(function(){
  'use strict';
  const SCHOOL_TIME_ZONE='Asia/Bangkok';
  const activityKey=(teacher,yg,set)=>`${teacher}__${yg}-${set}`;
  const legacyKey=(yg,set)=>`legacy__${yg}-${set}`;
  const timestamp=value=>typeof value==='number' && Number.isFinite(value) && value>0 ? value : null;

  function historicalUpdate(data,yg,set){
    if(teacherNamesForClass(yg,set).length!==1) return null;
    const dates=(sowFor(yg,set)||[]).map(lesson=>timestamp(data.__updatedAt?.[makeKey(lesson.id,set)]))
      .filter(value=>value!==null);
    return dates.length ? Math.max(...dates) : null;
  }

  function record(data,yg,set,at){
    const teacher=window.WCIB_ME?.code;
    if(!teacher || !timestamp(at)) return null;
    const key=activityKey(teacher,yg,set);
    const baselineKey=legacyKey(yg,set);
    const patch={[key]:at};
    // Freeze historical attribution BEFORE the new actor's lesson timestamp is written.
    if(!Object.prototype.hasOwnProperty.call(data.__progressActivity||{},baselineKey)){
      patch[baselineKey]=historicalUpdate(data,yg,set)||0;
    }
    return {key,at,patch,yg,set};
  }

  function resolve(activity,data){
    const baselineKey=legacyKey(activity.yg,activity.set);
    const current=data.__progressActivity||{};
    const patch={
      [activity.key]:Math.max(timestamp(current[activity.key])||0,activity.at),
      [baselineKey]:Object.prototype.hasOwnProperty.call(current,baselineKey)
        ? current[baselineKey] : (historicalUpdate(data,activity.yg,activity.set)||0)
    };
    return {...activity,patch};
  }

  function apply(data,activity){
    if(!activity) return;
    const current=data.__progressActivity||{};
    data.__progressActivity={...current};
    Object.entries(activity.patch).forEach(([key,value])=>{
      if(key===activity.key){
        data.__progressActivity[key]=Math.max(timestamp(current[key])||0,value);
      }else{
        data.__progressActivity[key]=value;
      }
    });
  }

  function recordLesson(data,lessonId,set,at){
    const pair=allClassPairs().find(pair=>pair.set===set &&
      (sowFor(pair.yg,pair.set)||[]).some(lesson=>lesson.id===lessonId));
    return pair ? record(data,pair.yg,set,at) : null;
  }

  function lastUpdated(teacher,yg,set){
    const data=loadAll();
    const recorded=timestamp(data.__progressActivity?.[activityKey(teacher,yg,set)]);
    if(recorded) return recorded;
    const teachers=teacherNamesForClass(yg,set);
    if(teachers.length!==1 || teachers[0]!==teacher) return null;
    const baselineKey=legacyKey(yg,set);
    if(Object.prototype.hasOwnProperty.call(data.__progressActivity||{},baselineKey)){
      return timestamp(data.__progressActivity[baselineKey]);
    }
    return historicalUpdate(data,yg,set);
  }

  function status(at,now=Date.now()){
    if(!timestamp(at)) return {label:'Never updated',tone:'not'};
    const day=value=>new Intl.DateTimeFormat('en-CA',{
      timeZone:SCHOOL_TIME_ZONE,year:'numeric',month:'2-digit',day:'2-digit'
    }).format(new Date(value));
    if(day(at)===day(now)) return {label:'Updated today',tone:'done'};
    if(now-at<=7*86400000) return {label:'Updated within 7 days',tone:'prog'};
    return {label:'More than 7 days ago',tone:'not'};
  }

  function format(at){
    if(!timestamp(at)) return '—';
    const date=new Date(at);
    return date.toLocaleDateString('en-GB',{
      timeZone:SCHOOL_TIME_ZONE,day:'numeric',month:'short',year:'numeric'
    })+', '+date.toLocaleTimeString('en-GB',{
      timeZone:SCHOOL_TIME_ZONE,hour:'2-digit',minute:'2-digit',hour12:false
    });
  }

  function renderTable(yg,sets,now=Date.now()){
    const rows=sets.flatMap(set=>teacherNamesForClass(yg,set).map(teacher=>{
      const progress=getProgress(set,sowFor(yg,set)||[]);
      const at=lastUpdated(teacher,yg,set);
      const update=status(at,now);
      return `<tr>
        <td>${esc(teacher)}</td>
        <td><button type="button" class="activity-class-link" onclick="openDashboardClassProgress(${Number(yg)},'${esc(set)}')">${esc(tvClassLabel(yg,set))}</button></td>
        <td><strong>${progress.pct}%</strong><div class="activity-detail">${progress.done} of ${progress.total} completed · ${progress.prog} in progress</div></td>
        <td>${at?`<time datetime="${new Date(at).toISOString()}">${esc(format(at))}</time>`:'—'}</td>
        <td><span class="pill ${update.tone}">${update.label}</span></td>
      </tr>`;
    })).join('');
    return `<div class="scroll activity-table-wrap"><table class="hod-table activity-table">
      <caption class="activity-caption">Progress edits only · times shown in Bangkok time. Historical co-teacher edits were not attributed; their individual tracking starts with their next edit.</caption>
      <thead><tr><th scope="col">Teacher</th><th scope="col">Class</th><th scope="col">Current progress</th><th scope="col">Last Updated</th><th scope="col">Update status</th></tr></thead>
      <tbody>${rows}</tbody></table></div>`;
  }

  window.WCIB_PROGRESS_ACTIVITY={record,recordLesson,resolve,apply,lastUpdated,status,format,renderTable};
})();