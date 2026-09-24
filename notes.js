(function(){
  'use strict';
  const root=document.getElementById('mw-notes');
  if(!root) return;
  const allowedCodes=new Set(['SSW','FTA','MKM','HPA','ADE','XLN']);
  const colours=new Set(['butter','blush','mint','blue']);
  const oldColours={amber:'butter',teal:'mint',grey:'blue'};
  const state={identity:null,unsubscribe:null,items:[],loading:false,error:'',saving:false,
    editId:null,editText:'',draft:'',draftOpen:false,draftColour:null,colour:'butter',collapsed:false,operation:0};
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
    colour:colours.has(item.colour)?item.colour:(oldColours[item.colour]||'blue'),done:item.done===true})) : [];
  const tilt=id=>{
    let hash=0;
    for(const char of id) hash=(hash*31+char.charCodeAt(0))|0;
    return ((Math.abs(hash)%15)-7)/10;
  };

  const style=document.createElement('style');
  style.textContent=`
    #mw-notes{margin:16px 0 18px;font:400 12px Inter,'Segoe UI',Arial,sans-serif;color:#2F3640}
    #mw-notes .mn-muted{color:#6C7480}
    #mw-notes .mn-panel{background:#F9F5EE;border:1px solid #E2DDD7;border-radius:12px;padding:15px 17px}
    #mw-notes .mn-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
    #mw-notes .mn-title,#mw-notes .mn-controls{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
    #mw-notes h3{font-size:13.5px;font-weight:600;line-height:1.3;margin:0}
    #mw-notes .mn-count{color:#6C7480;font-size:11px}
    #mw-notes button,#mw-notes input{font:inherit}
    #mw-notes button{cursor:pointer}
    #mw-notes .mn-control{border:1px solid #E2DDD7;border-radius:5px;background:#fff;color:#4F5762;padding:5px 8px}
    #mw-notes button:disabled{opacity:.5;cursor:not-allowed}
    #mw-notes button:focus-visible,#mw-notes input:focus-visible,#mw-notes [contenteditable]:focus-visible{outline:2px solid #5A9B7F;outline-offset:2px}
    #mw-notes .mn-swatches{display:inline-flex;gap:7px;align-items:center}
    #mw-notes .mn-swatch{width:22px;height:22px;border-radius:4px;display:inline-block;cursor:pointer;border:1px solid rgba(47,54,64,.1);position:relative}
    #mw-notes .mn-swatch input{position:absolute;opacity:0;width:100%;height:100%;inset:0;margin:0;cursor:pointer}
    #mw-notes .mn-swatch:has(input:checked){outline:2px solid #3E7358;outline-offset:2px}
    #mw-notes .mn-swatch:has(input:focus-visible){outline:2px solid #5A9B7F;outline-offset:3px}
    #mw-notes .mn-butter{--mn-paper:#F7E9B0;--mn-ink:#6B5A1E}
    #mw-notes .mn-blush{--mn-paper:#F3DCD7;--mn-ink:#9C5B4B}
    #mw-notes .mn-mint{--mn-paper:#DCEFE3;--mn-ink:#3F7C61}
    #mw-notes .mn-blue{--mn-paper:#DCE7F0;--mn-ink:#4F7290}
    #mw-notes .mn-swatch{background:var(--mn-paper)}
    #mw-notes .mn-rail{display:flex;gap:13px;overflow-x:auto;overflow-y:hidden;padding:11px 2px 14px;margin-top:7px;scrollbar-color:#C9C4BC transparent}
    #mw-notes .mn-list{display:contents;list-style:none;margin:0;padding:0}
    #mw-notes .mn-item,#mw-notes .mn-add{box-sizing:border-box;flex:0 0 164px;width:164px;min-height:150px;border-radius:3px}
    #mw-notes .mn-item{position:relative;display:flex;flex-direction:column;padding:15px 14px 13px;background:var(--mn-paper);color:var(--mn-ink);box-shadow:0 1px 2px rgba(47,54,64,.06),0 6px 16px -8px rgba(47,54,64,.28);transform:rotate(var(--mn-tilt,0deg));transition:transform .18s ease,box-shadow .18s ease,opacity .18s ease}
    #mw-notes .mn-item:hover,#mw-notes .mn-item:focus-within{transform:translateY(-3px) rotate(0deg);box-shadow:0 3px 9px rgba(47,54,64,.12),0 12px 22px -8px rgba(47,54,64,.3)}
    #mw-notes .mn-item::after{content:"";position:absolute;bottom:0;right:0;width:20px;height:20px;background:linear-gradient(135deg,transparent 50%,rgba(0,0,0,.09) 50%);pointer-events:none}
    #mw-notes .mn-item.mn-done{opacity:.6}
    #mw-notes .mn-check{position:absolute;top:12px;right:11px;width:19px;height:19px;border:1.6px solid currentColor;border-radius:50%;color:var(--mn-ink);background:transparent;display:grid;place-items:center;padding:0;opacity:.4}
    #mw-notes .mn-check[aria-pressed=true]{background:var(--mn-ink);opacity:1}
    #mw-notes .mn-check svg{width:12px;height:12px;color:var(--mn-paper)}
    #mw-notes .mn-text{flex:1;min-height:70px;margin:16px 0 8px;outline:none;white-space:pre-wrap;overflow-wrap:anywhere;font:600 14.5px/1.45 Inter,'Segoe UI',Arial,sans-serif;letter-spacing:-.01em}
    #mw-notes .mn-text:empty::before{content:attr(data-placeholder);opacity:.6}
    #mw-notes .mn-done .mn-text{text-decoration:line-through}
    #mw-notes .mn-bottom{display:flex;align-items:end;justify-content:space-between;gap:5px}
    #mw-notes .mn-date{font-size:10.5px;opacity:.72}
    #mw-notes .mn-delete{width:22px;height:22px;flex:none;border:0;border-radius:5px;background:rgba(255,255,255,.55);color:var(--mn-ink);padding:0;opacity:0;transition:opacity .15s}
    #mw-notes .mn-item:hover .mn-delete,#mw-notes .mn-item:focus-within .mn-delete{opacity:1}
    #mw-notes .mn-add{border:2px dashed #E2DDD7;background:transparent;color:#6C7480;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px}
    #mw-notes .mn-add span:first-child{font-size:30px;font-weight:300;line-height:1}
    #mw-notes .mn-add:hover{background:#fff}
    #mw-notes .mn-error{background:#F0DDD9;color:#7E4A3E;border-radius:6px;padding:9px;margin:10px 0 0}
    @media(max-width:650px){#mw-notes .mn-panel{padding:13px 12px}#mw-notes .mn-controls{gap:8px}}
    @media(hover:none){#mw-notes .mn-delete{opacity:1}}
    @media(prefers-reduced-motion:reduce){#mw-notes .mn-item,#mw-notes .mn-delete{transition:none}}
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
        ? 'Reminders are private to each teacher.'
        : 'Your teacher code is not configured. Ask the administrator to add it before using reminders.'}</p>`;
      return;
    }
    const count=state.items.filter(item=>!item.done).length;
    const countLabel=state.items.length ? (count ? `${count} to do` : 'all done') : '';
    root.innerHTML=`<section class="mn-panel" aria-label="My reminders">
      <div class="mn-head">
        <div class="mn-title"><h3>My reminders</h3><span class="mn-count">${countLabel}</span></div>
        <div class="mn-controls">
          <div class="mn-swatches" role="group" aria-label="New reminder colour">
            ${['butter','blush','mint','blue'].map(colour=>`<label class="mn-swatch mn-${colour}" title="${colour}">
              <input type="radio" name="colour" value="${colour}" aria-label="${colour}" ${state.colour===colour?'checked':''}></label>`).join('')}
          </div>
          ${state.items.some(item=>item.done)?`<button class="mn-control" type="button" data-mn-clear ${state.saving?'disabled':''}>Clear ticked</button>`:''}
          <button class="mn-control" type="button" data-mn-collapse aria-expanded="${!state.collapsed}">${state.collapsed?'Expand':'Collapse'}</button>
        </div>
      </div>
      ${state.error?`<div class="mn-error" role="alert">${escapeHtml(state.error)}</div>`:''}
      ${state.collapsed?'':state.loading?'<p class="mn-muted">Loading reminders…</p>':`
        <div class="mn-rail" aria-label="Reminder notes">
          <ul class="mn-list">
            ${state.items.map(item=>`<li class="mn-item mn-${item.colour} ${item.done?'mn-done':''}" style="--mn-tilt:${tilt(item.id)}deg">
              <button type="button" class="mn-check" data-mn-done="${escapeHtml(item.id)}"
                aria-label="${item.done?'Untick':'Tick'} reminder: ${escapeHtml(item.text)}" aria-pressed="${item.done}" ${state.saving?'disabled':''}>
                ${item.done?'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m3 8 3 3 7-7"/></svg>':''}
              </button>
              <div class="mn-text" contenteditable="${!state.saving}" role="textbox" aria-label="Edit reminder"
                aria-multiline="false" data-mn-text="${escapeHtml(item.id)}" data-placeholder="Write a reminder…">${escapeHtml(state.editId===item.id?state.editText:item.text)}</div>
              <div class="mn-bottom"><span class="mn-date">Added ${escapeHtml(dateLabel(item.created))}</span>
                <button type="button" class="mn-delete" data-mn-delete="${escapeHtml(item.id)}" aria-label="Delete reminder: ${escapeHtml(item.text)}" ${state.saving?'disabled':''}>✕</button>
              </div>
            </li>`).join('')}
            ${state.draftOpen?`<li class="mn-item mn-${state.draftColour||state.colour}" style="--mn-tilt:0deg">
              <div class="mn-text" contenteditable="${!state.saving}" role="textbox" aria-label="New reminder"
                aria-multiline="false" data-mn-draft data-placeholder="Write a reminder…">${escapeHtml(state.draft)}</div>
              <div class="mn-bottom"><span class="mn-date">New note</span>
                <button type="button" class="mn-delete" data-mn-cancel-draft aria-label="Discard new reminder">✕</button>
              </div>
            </li>`:''}
          </ul>
          <button type="button" class="mn-add" data-mn-add-tile aria-label="New reminder" ${state.saving?'disabled':''}><span aria-hidden="true">+</span><span>New reminder</span></button>
        </div>`}
    </section>`;
  }
  function refresh(){
    const me=owner(), next=me?.code||null;
    if(next!==state.identity){
      if(state.unsubscribe){ state.unsubscribe(); state.unsubscribe=null; }
      state.operation++;
      state.saving=false;
      state.identity=next;
      state.items=[];
      state.error='';
      state.loading=!!next;
      state.editId=null;
      state.editText='';
      state.draft='';
      state.draftOpen=false;
      state.draftColour=null;
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
    if(!me || me.code!==state.identity || state.saving || state.loading) return false;
    const identity=me.code;
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
  function saveEditor(editor){
    if(state.saving || !owner()) return;
    const text=(editor.textContent||'').trim().slice(0,160);
    const identity=owner().code;
    if(editor.hasAttribute('data-mn-draft')){
      if(!state.draftOpen) return;
      if(!text){state.draftOpen=false;state.draft='';state.draftColour=null;render();return;}
      const id=window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
      const colour=state.draftColour;
      state.draft=text;
      update(items=>[...items,{id,text,colour,done:false,created:Date.now(),updated:Date.now()}])
        .then(success=>{if(success && owner()?.code===identity){
          state.draftOpen=false;state.draft='';state.draftColour=null;render();
        }});
      return;
    }
    const id=editor.dataset.mnText;
    const item=state.items.find(note=>note.id===id);
    if(!item) return;
    if(!text || text===item.text){state.editId=null;state.editText='';render();return;}
    state.editId=id;
    state.editText=text;
    update(items=>items.map(note=>note.id===id?{...note,text,updated:Date.now()}:note))
      .then(success=>{if(success && owner()?.code===identity && state.editId===id){
        state.editId=null;state.editText='';render();
      }});
  }
  root.addEventListener('focusin',event=>{
    const editor=event.target.closest('[data-mn-text]');
    if(editor && !state.saving && state.editId!==editor.dataset.mnText){
      state.editId=editor.dataset.mnText;
      state.editText=editor.textContent||'';
    }
  });
  root.addEventListener('input',event=>{
    const editor=event.target.closest('[data-mn-text],[data-mn-draft]');
    if(!editor) return;
    let text=editor.textContent||'';
    if(text.length>160){
      text=text.slice(0,160);
      editor.textContent=text;
      const range=document.createRange();
      range.selectNodeContents(editor);range.collapse(false);
      const selection=window.getSelection();
      selection.removeAllRanges();selection.addRange(range);
    }
    if(editor.hasAttribute('data-mn-draft')) state.draft=text;
    else{state.editId=editor.dataset.mnText;state.editText=text;}
  });
  root.addEventListener('paste',event=>{
    if(!event.target.closest('[data-mn-text],[data-mn-draft]')) return;
    event.preventDefault();
    document.execCommand('insertText',false,event.clipboardData.getData('text/plain'));
  });
  root.addEventListener('keydown',event=>{
    const editor=event.target.closest('[data-mn-text],[data-mn-draft]');
    if(editor && event.key==='Enter'){
      event.preventDefault();
      editor.blur();
    }
  });
  root.addEventListener('focusout',event=>{
    const editor=event.target.closest('[data-mn-text],[data-mn-draft]');
    if(!editor) return;
    const action=event.relatedTarget?.closest('[data-mn-cancel-draft],[data-mn-delete],[data-mn-done]');
    if(action && (editor.hasAttribute('data-mn-draft')
      ? action.hasAttribute('data-mn-cancel-draft')
      : action.dataset.mnDelete===editor.dataset.mnText || action.dataset.mnDone===editor.dataset.mnText)) return;
    saveEditor(editor);
  });
  root.addEventListener('change',event=>{
    if(event.target.matches('[name=colour]') && colours.has(event.target.value)) state.colour=event.target.value;
  });
  root.addEventListener('click',event=>{
    if(event.target.matches('[data-mn-collapse]')){
      state.collapsed=!state.collapsed;
      try{localStorage.setItem('wcib-notes-collapsed',String(state.collapsed));}catch(e){}
      render();
    }else if(event.target.closest('[data-mn-add-tile]')){
      if(state.draftOpen){root.querySelector('[data-mn-draft]')?.focus();return;}
      if(state.saving) return;
      state.draftOpen=true;state.draft='';state.draftColour=state.colour;
      render();
      root.querySelector('[data-mn-draft]')?.focus();
    }else if(event.target.closest('[data-mn-cancel-draft]')){
      state.draftOpen=false;state.draft='';state.draftColour=null;render();
    }else if(event.target.closest('[data-mn-done]')){
      const id=event.target.closest('[data-mn-done]').dataset.mnDone;
      const text=state.editId===id ? state.editText.trim().slice(0,160) : '';
      update(items=>items.map(item=>item.id===id?{...item,done:!item.done,
        text:text||item.text,updated:Date.now()}:item))
        .then(success=>{if(success && state.editId===id){state.editId=null;state.editText='';render();}});
    }else if(event.target.matches('[data-mn-delete]')){
      const id=event.target.dataset.mnDelete;
      update(items=>items.filter(item=>item.id!==id))
        .then(success=>{if(success && state.editId===id){state.editId=null;state.editText='';render();}});
    }else if(event.target.matches('[data-mn-clear]')){
      update(items=>items.filter(item=>!item.done));
    }
  });
})();