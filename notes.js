(function(){
  'use strict';
  const root=document.getElementById('mw-notes');
  if(!root) return;
  // Remove this warning only after a live two-account isolation test passes.
  const isolationTestConfirmed=false;
  const allowedCodes=new Set(['SSW','FTA','MKM','HPA','ADE','XLN']);
  const colours=new Set(['amber','teal','grey']);
  const state={identity:null,unsubscribe:null,items:[],loading:false,error:'',saving:false,
    editId:null,editText:'',draft:'',colour:'amber',collapsed:false,operation:0};
  try{ state.collapsed=localStorage.getItem('wcib-notes-collapsed')==='true'; }catch(e){}

  const escapeHtml=value=>String(value).replace(/[&<>"']/g,char=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  })[char]);
  const dateLabel=stamp=>{
    const date=new Date(stamp);
    return Number.isFinite(date.getTime())
      ? date.toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'})
      : 'Unknown date';
  };
  const safeItems=items=>Array.isArray(items) ? items.filter(item=>
    item && typeof item.id==='string' && typeof item.text==='string'
  ).map(item=>({...item,text:item.text.slice(0,160),
    colour:colours.has(item.colour)?item.colour:'grey',done:item.done===true})) : [];

  const style=document.createElement('style');
  style.textContent=`
    #mw-notes{margin-top:18px;font:12px Poppins,Arial,sans-serif;color:#213746}
    #mw-notes .mn-muted{color:#637580}
    #mw-notes .mn-panel{border-top:1px solid #e0e8e7;padding-top:17px}
    #mw-notes .mn-head{display:flex;align-items:center;justify-content:space-between;gap:12px}
    #mw-notes h3{font-size:16px;letter-spacing:-.02em;margin:0}
    #mw-notes .mn-count{color:#637580;font-size:11px}
    #mw-notes button,#mw-notes input{font:inherit}
    #mw-notes button{cursor:pointer;border:1px solid #bfd6d3;border-radius:6px;background:#f4faf9;color:#195f61;padding:6px 10px}
    #mw-notes button:disabled{opacity:.5;cursor:not-allowed}
    #mw-notes button:focus-visible,#mw-notes input:focus-visible{outline:2px solid #e49930;outline-offset:2px}
    #mw-notes .mn-body{margin-top:14px}
    #mw-notes .mn-form,#mw-notes .mn-edit{display:flex;align-items:center;gap:9px;flex-wrap:wrap}
    #mw-notes input[type=text]{flex:1;min-width:175px;padding:7px 9px;border:1px solid #bfd6d3;border-radius:6px;color:#213746;background:#fff}
    #mw-notes .mn-swatches{display:inline-flex;gap:7px;align-items:center}
    #mw-notes .mn-swatch{width:24px;height:24px;border-radius:50%;display:inline-block;cursor:pointer;border:2px solid transparent}
    #mw-notes .mn-swatch input{position:absolute;opacity:0;width:1px;height:1px}
    #mw-notes .mn-swatch:has(input:checked){outline:2px solid #195f61;outline-offset:2px}
    #mw-notes .mn-swatch:has(input:focus-visible){outline:2px solid #e49930;outline-offset:2px}
    #mw-notes .mn-amber{background:#e49930} #mw-notes .mn-teal{background:#247d79} #mw-notes .mn-grey{background:#a1aeb2}
    #mw-notes .mn-list{list-style:none;margin:14px 0 0;padding:0}
    #mw-notes .mn-item{display:flex;align-items:flex-start;gap:10px;padding:11px 10px;margin-top:7px;border:1px solid #e0e8e7;border-left:4px solid #a1aeb2;border-radius:6px}
    #mw-notes .mn-item.mn-amber{border-left-color:#e49930;background:#fffaf0}
    #mw-notes .mn-item.mn-teal{border-left-color:#247d79;background:#f4faf9}
    #mw-notes .mn-item.mn-grey{border-left-color:#a1aeb2;background:#f8faf9}
    #mw-notes .mn-item.mn-done{opacity:.68}
    #mw-notes .mn-item input[type=checkbox]{margin-top:3px;accent-color:#247d79}
    #mw-notes .mn-detail{min-width:0;flex:1}
    #mw-notes .mn-text{overflow-wrap:anywhere} #mw-notes .mn-done .mn-text{text-decoration:line-through}
    #mw-notes .mn-date{font-size:10px;color:#637580;margin-top:3px}
    #mw-notes .mn-actions{display:flex;gap:5px;flex-wrap:wrap}
    #mw-notes .mn-actions button{font-size:10px;padding:3px 6px}
    #mw-notes .mn-footer{margin-top:12px}
    #mw-notes .mn-error{background:#ffebe8;color:#962e25;border-radius:6px;padding:9px;margin-top:10px}
    #mw-notes .mn-empty{color:#637580;margin-top:16px}
  `;
  document.head.append(style);

  function owner(){
    const me=window.WCIB_ME, selected=document.getElementById('mw-teacher')?.value;
    const email=window.firebase?.auth?.().currentUser?.email?.toLowerCase();
    return me && me.email===email && allowedCodes.has(me.code) && selected===me.code ? me : null;
  }
  function render(){
    const me=window.WCIB_ME, own=owner();
    if(!me){
      root.innerHTML='<p class="mn-muted">Sign in with your school email to use your reminders.</p>';
      return;
    }
    if(!own){
      root.innerHTML=`<p class="mn-muted">${allowedCodes.has(me.code)
        ? (isolationTestConfirmed ? 'Reminders are private to each teacher.' : 'Reminders only appear when viewing your own timetable. Privacy check pending.')
        : 'Your teacher code is not configured. Ask the administrator to add it before using reminders.'}</p>`;
      return;
    }
    const count=state.items.filter(item=>!item.done).length;
    root.innerHTML=`<section class="mn-panel" aria-label="My reminders">
      <div class="mn-head"><div><h3>My reminders</h3><span class="mn-count">${count} unticked</span></div>
        <button type="button" data-mn-collapse aria-expanded="${!state.collapsed}">${state.collapsed?'Expand':'Collapse'}</button></div>
      ${isolationTestConfirmed?'':'<p class="mn-error" role="status">Privacy check pending. Use test reminders only until access has been checked with two teacher accounts.</p>'}
      ${state.error?`<div class="mn-error" role="alert">${escapeHtml(state.error)}</div>`:''}
      ${state.collapsed?'':`<div class="mn-body">
        ${state.loading?'<p class="mn-muted">Loading reminders…</p>':`
          <form class="mn-form" data-mn-add>
            <input type="text" name="text" maxlength="160" required aria-label="New reminder" placeholder="Add a reminder…" value="${escapeHtml(state.draft)}">
            <div class="mn-swatches" role="group" aria-label="Reminder colour">
              ${['amber','teal','grey'].map(colour=>`<label class="mn-swatch mn-${colour}" title="${colour}">
                <input type="radio" name="colour" value="${colour}" aria-label="${colour}" ${state.colour===colour?'checked':''}></label>`).join('')}
            </div>
            <button type="submit" ${state.saving?'disabled':''}>Add</button>
          </form>
          ${state.items.length?`<ul class="mn-list">${state.items.map(item=>`<li class="mn-item mn-${item.colour} ${item.done?'mn-done':''}">
            <input type="checkbox" data-mn-done="${escapeHtml(item.id)}" aria-label="Tick reminder: ${escapeHtml(item.text)}" ${item.done?'checked':''} ${state.saving?'disabled':''}>
            <div class="mn-detail">${state.editId===item.id?`<form class="mn-edit" data-mn-edit="${escapeHtml(item.id)}">
              <input type="text" name="text" maxlength="160" required aria-label="Edit reminder" value="${escapeHtml(state.editText)}">
              <button type="submit" ${state.saving?'disabled':''}>Save</button>
              <button type="button" data-mn-cancel>Cancel</button></form>`:
              `<div class="mn-text">${escapeHtml(item.text)}</div><div class="mn-date">Added ${escapeHtml(dateLabel(item.created))}</div>`}</div>
            <div class="mn-actions"><button type="button" data-mn-start="${escapeHtml(item.id)}" ${state.saving?'disabled':''}>Edit</button>
              <button type="button" data-mn-delete="${escapeHtml(item.id)}" ${state.saving?'disabled':''}>Delete</button></div>
          </li>`).join('')}</ul>
          ${state.items.some(item=>item.done)?'<div class="mn-footer"><button type="button" data-mn-clear '+(state.saving?'disabled':'')+'>Clear ticked</button></div>':''}
          `:'<p class="mn-empty">Nothing here yet.</p>'}
        `}
      </div>`}
    </section>`;
  }
  function refresh(){
    const me=owner(), next=me?.email||null;
    if(next!==state.identity){
      if(state.unsubscribe){ state.unsubscribe(); state.unsubscribe=null; }
      state.operation++;
      state.saving=false;
      state.identity=next;
      state.items=[];
      state.error='';
      state.loading=!!next;
      state.editId=null;
      state.draft='';
      if(next){
        const doc=firebase.firestore().collection('notes').doc(next);
        state.unsubscribe=doc.onSnapshot(snap=>{
          if(state.identity!==next) return;
          state.items=safeItems(snap.exists ? snap.data()?.items : []);
          state.loading=false;
          state.error='';
          render();
        },err=>{
          if(state.identity!==next) return;
          state.loading=false;
          state.error='Could not load reminders from Firestore: '+err.message;
          render();
        });
      }
    }
    render();
  }
  window.WCIB_NOTES_REFRESH=refresh;
  document.getElementById('mw-teacher')?.addEventListener('change',refresh);
  document.getElementById('sel-teacher')?.addEventListener('change',()=>setTimeout(refresh,0));
  refresh();

  async function update(change){
    const me=owner();
    if(!me || me.email!==state.identity || state.saving || state.loading) return false;
    const identity=me.email;
    const operation=++state.operation;
    const doc=firebase.firestore().collection('notes').doc(identity);
    state.saving=true; state.error=''; render();
    try{
      await firebase.firestore().runTransaction(async transaction=>{
        const snap=await transaction.get(doc);
        const current=safeItems(snap.exists ? snap.data()?.items : []);
        transaction.set(doc,{items:change(current)},{merge:true});
      });
      return state.identity===identity && state.operation===operation;
    }catch(err){
      if(state.identity===identity && state.operation===operation){
        state.error='Could not save reminders to Firestore: '+err.message;
        console.error(state.error,err);
      }
      return false;
    }finally{
      if(state.identity===identity && state.operation===operation){
        state.saving=false;
        render();
      }
    }
  }
  root.addEventListener('input',event=>{
    if(event.target.matches('[data-mn-add] input[name=text]')) state.draft=event.target.value;
    if(event.target.matches('[data-mn-edit] input[name=text]')) state.editText=event.target.value;
  });
  root.addEventListener('change',event=>{
    if(event.target.matches('[data-mn-add] input[name=colour]')) state.colour=event.target.value;
    if(event.target.matches('[data-mn-done]')){
      const id=event.target.dataset.mnDone,done=event.target.checked;
      update(items=>items.map(item=>item.id===id?{...item,done,updated:Date.now()}:item));
    }
  });
  root.addEventListener('submit',event=>{
    if(event.target.matches('[data-mn-add]')){
      event.preventDefault();
      const text=event.target.elements.text.value.trim().slice(0,160);
      if(!text) return;
      const colour=colours.has(state.colour)?state.colour:'amber';
      const id=window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
      const identity=owner()?.email;
      update(items=>[...items,{id,text,colour,done:false,created:Date.now(),updated:Date.now()}])
        .then(success=>{ if(success && owner()?.email===identity){state.draft='';render();} });
    }else if(event.target.matches('[data-mn-edit]')){
      event.preventDefault();
      const id=event.target.dataset.mnEdit,text=event.target.elements.text.value.trim().slice(0,160);
      if(!text) return;
      const identity=owner()?.email;
      update(items=>items.map(item=>item.id===id?{...item,text,updated:Date.now()}:item))
        .then(success=>{if(success && owner()?.email===identity){state.editId=null;render();}});
    }
  });
  root.addEventListener('click',event=>{
    if(event.target.matches('[data-mn-collapse]')){
      state.collapsed=!state.collapsed;
      try{localStorage.setItem('wcib-notes-collapsed',String(state.collapsed));}catch(e){}
      render();
    }else if(event.target.matches('[data-mn-start]')){
      const item=state.items.find(item=>item.id===event.target.dataset.mnStart);
      if(item){state.editId=item.id;state.editText=item.text;render();root.querySelector('[data-mn-edit] input')?.focus();}
    }else if(event.target.matches('[data-mn-cancel]')){
      state.editId=null;render();
    }else if(event.target.matches('[data-mn-delete]')){
      const id=event.target.dataset.mnDelete;
      update(items=>items.filter(item=>item.id!==id));
    }else if(event.target.matches('[data-mn-clear]')){
      update(items=>items.filter(item=>!item.done));
    }
  });
})();