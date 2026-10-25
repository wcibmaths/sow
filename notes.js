(function(){
  'use strict';
  const root=document.getElementById('mw-notes');
  if(!root) return;
  const allowedCodes=new Set(['SSW','FTA','MKM','HPA','ADE','XLN']);
  const colours=new Set(['butter','blush','mint','blue']);
  const oldColours={amber:'butter',teal:'mint',grey:'blue'};
  const maxLines=20, maxChars=160;
  const blankLines=()=>[{text:'',done:false}];
  const state={identity:null,unsubscribe:null,items:[],loading:false,error:'',saving:false,
    editId:null,editLines:[],draftLines:blankLines(),draftOpen:false,draftColour:null,colour:'butter',
    collapsed:false,operation:0,rerendering:false};
  try{ state.collapsed=localStorage.getItem('wcib-notes-collapsed')==='true'; }catch(e){}

  const escapeHtml=value=>String(value).replace(/[&<>"']/g,char=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  })[char]);
  const cssValue=value=>String(value).replace(/["\\]/g,'\\$&');
  const tickIcon='<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m3 8 3 3 7-7"/></svg>';
  const dateLabel=stamp=>{
    const date=new Date(stamp);
    return Number.isFinite(date.getTime())
      ? date.toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'})
      : 'Unknown date';
  };
  const safeLine=line=>{
    if(typeof line==='string') return {text:line.slice(0,maxChars),done:false};
    if(!line || typeof line!=='object') return null;
    const text=typeof line.text==='string' ? line.text : (line.text==null ? '' : String(line.text));
    return {...line,text:text.slice(0,maxChars),done:line.done===true};
  };
  const safeItems=items=>Array.isArray(items) ? items.filter(item=>
    item && typeof item.id==='string' && item.id
  ).map(item=>{
    const source=Array.isArray(item.lines) ? item.lines
      : (typeof item.text==='string' ? [{text:item.text,done:item.done===true}] : []);
    let lines=source.map(safeLine).filter(Boolean).slice(0,maxLines);
    if(!lines.length) lines=blankLines();
    return {...item,lines,
      colour:colours.has(item.colour)?item.colour:(oldColours[item.colour]||'blue'),done:item.done===true};
  }) : [];
  const forStorage=item=>{
    const lines=(Array.isArray(item.lines)?item.lines:[]).slice(0,maxLines).map(line=>{
      const base=line && typeof line==='object' ? line : {};
      const text=typeof base.text==='string' ? base.text : (typeof line==='string' ? line : '');
      return {...base,text:text.slice(0,maxChars),done:base.done===true};
    });
    return {...item,lines,done:item.done===true,
      text:lines.map(line=>line.text).join('\n').slice(0,maxChars)};
  };
  const cleanLines=lines=>lines.map(line=>({text:line.text.trim().slice(0,maxChars),done:line.done===true}))
    .filter(line=>line.text).slice(0,maxLines);
  const sameLines=(a,b)=>a.length===b.length && a.every((line,index)=>
    line.text===b[index].text && line.done===b[index].done);
  const summary=item=>item.lines.map(line=>line.text).join(', ').slice(0,maxChars);
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
    #mw-notes .mn-lines{flex:1;min-height:70px;margin:16px 0 8px;display:flex;flex-direction:column;gap:5px;list-style:none;padding:0}
    #mw-notes .mn-line{display:flex;align-items:flex-start;gap:6px}
    #mw-notes .mn-tick,#mw-notes .mn-ghost{box-sizing:border-box;flex:none;width:13px;height:13px;margin-top:4px;border:1.4px solid currentColor;border-radius:3px;color:var(--mn-ink);background:transparent;display:grid;place-items:center;padding:0;opacity:.4}
    #mw-notes .mn-ghost{border-style:dashed;opacity:.25}
    #mw-notes .mn-tick[aria-pressed=true]{background:var(--mn-ink);opacity:1}
    #mw-notes .mn-tick svg{width:9px;height:9px;color:var(--mn-paper)}
    #mw-notes .mn-text{flex:1;min-width:0;min-height:21px;outline:none;white-space:pre-wrap;overflow-wrap:anywhere;font:600 14.5px/1.45 Inter,'Segoe UI',Arial,sans-serif;letter-spacing:-.01em}
    #mw-notes .mn-text:empty::before{content:attr(data-placeholder);opacity:.6}
    #mw-notes .mn-line-done>.mn-text,#mw-notes .mn-done .mn-text{text-decoration:line-through}
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
  const itemLines=item=>state.editId===item.id ? state.editLines : item.lines;
  const lineRow=(lines,index,note)=>{
    const line=lines[index], placeholder=index===0&&lines.length===1 ? ' data-placeholder="Write a reminder…"' : '';
    return `<li class="mn-line ${line.done?'mn-line-done':''}">
      ${note?`<button type="button" class="mn-tick" data-mn-line-done="${escapeHtml(note.id)}" data-mn-line="${index}"
        aria-label="${line.done?'Untick':'Tick'} line: ${escapeHtml(line.text)}" aria-pressed="${line.done}" ${state.saving?'disabled':''}>
        ${line.done?tickIcon:''}
      </button>`:'<span class="mn-ghost" aria-hidden="true"></span>'}
      <div class="mn-text" contenteditable="${!state.saving}" role="textbox" aria-multiline="true"
        aria-label="${note?'Edit reminder':'New reminder'} line ${index+1}"
        ${note?`data-mn-text="${escapeHtml(note.id)}"`:'data-mn-draft'} data-mn-line="${index}"${placeholder}>${escapeHtml(line.text)}</div>
    </li>`;
  };
  const lineRows=(lines,note)=>lines.map((line,index)=>lineRow(lines,index,note)).join('');
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
    const count=state.items.reduce((total,item)=>
      total+(item.done?0:item.lines.filter(line=>!line.done).length),0);
    const countLabel=state.items.length ? (count ? `${count} to do` : 'all done') : '';
    const ticked=state.items.some(item=>item.done || item.lines.some(line=>line.done));
    root.innerHTML=`<section class="mn-panel" aria-label="My reminders">
      <div class="mn-head">
        <div class="mn-title"><h3>My reminders</h3><span class="mn-count">${countLabel}</span></div>
        <div class="mn-controls">
          <div class="mn-swatches" role="group" aria-label="New reminder colour">
            ${['butter','blush','mint','blue'].map(colour=>`<label class="mn-swatch mn-${colour}" title="${colour}">
              <input type="radio" name="colour" value="${colour}" aria-label="${colour}" ${state.colour===colour?'checked':''}></label>`).join('')}
          </div>
          ${ticked?`<button class="mn-control" type="button" data-mn-clear ${state.saving?'disabled':''}>Clear ticked</button>`:''}
          <button class="mn-control" type="button" data-mn-collapse aria-expanded="${!state.collapsed}">${state.collapsed?'Expand':'Collapse'}</button>
        </div>
      </div>
      ${state.error?`<div class="mn-error" role="alert">${escapeHtml(state.error)}</div>`:''}
      ${state.collapsed?'':state.loading?'<p class="mn-muted">Loading reminders…</p>':`
        <div class="mn-rail" aria-label="Reminder notes">
          <ul class="mn-list">
            ${state.items.map(item=>`<li class="mn-item mn-${item.colour} ${item.done?'mn-done':''}" style="--mn-tilt:${tilt(item.id)}deg">
              <button type="button" class="mn-check" data-mn-done="${escapeHtml(item.id)}"
                aria-label="${item.done?'Untick':'Tick'} reminder: ${escapeHtml(summary(item))}" aria-pressed="${item.done}" ${state.saving?'disabled':''}>
                ${item.done?tickIcon:''}
              </button>
              <ul class="mn-lines">${lineRows(itemLines(item),item)}</ul>
              <div class="mn-bottom"><span class="mn-date">Added ${escapeHtml(dateLabel(item.created))}</span>
                <button type="button" class="mn-delete" data-mn-delete="${escapeHtml(item.id)}" aria-label="Delete reminder: ${escapeHtml(summary(item))}" ${state.saving?'disabled':''}>✕</button>
              </div>
            </li>`).join('')}
            ${state.draftOpen?`<li class="mn-item mn-${state.draftColour||state.colour}" style="--mn-tilt:0deg">
              <ul class="mn-lines">${lineRows(state.draftLines,null)}</ul>
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
      state.editLines=[];
      state.draftLines=blankLines();
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
        transaction.set(doc,{items:change(current).map(forStorage)},{merge:true});
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
  const isDraft=editor=>editor.hasAttribute('data-mn-draft');
  const lineIndex=editor=>Number(editor.dataset.mnLine)||0;
  function beginEdit(editor){
    if(isDraft(editor)) return state.draftLines;
    const id=editor.dataset.mnText;
    if(state.editId!==id){
      const item=state.items.find(note=>note.id===id);
      state.editId=id;
      state.editLines=item ? item.lines.map(line=>({text:line.text,done:line.done===true}))
        : [{text:editor.textContent||'',done:false}];
    }
    return state.editLines;
  }
  function caretOffset(editor){
    const selection=window.getSelection();
    if(!selection || !selection.rangeCount) return (editor.textContent||'').length;
    const range=selection.getRangeAt(0);
    if(!editor.contains(range.endContainer)) return (editor.textContent||'').length;
    const probe=range.cloneRange();
    probe.selectNodeContents(editor);
    probe.setEnd(range.endContainer,range.endOffset);
    return probe.toString().length;
  }
  function placeCaret(editor,offset){
    editor.focus();
    const range=document.createRange(), node=editor.firstChild;
    if(node && node.nodeType===3){
      range.setStart(node,Math.max(0,Math.min(offset,node.length)));
      range.collapse(true);
    }else{
      range.selectNodeContents(editor);
      range.collapse(offset<=0);
    }
    const selection=window.getSelection();
    if(!selection) return;
    selection.removeAllRanges(); selection.addRange(range);
  }
  const lineSelector=(editor,index)=>isDraft(editor)
    ? `[data-mn-draft][data-mn-line="${index}"]`
    : `[data-mn-text="${cssValue(editor.dataset.mnText)}"][data-mn-line="${index}"]`;
  function rerender(selector,offset){
    state.rerendering=true;
    render();
    const next=selector ? root.querySelector(selector) : null;
    if(next) placeCaret(next,offset);
    state.rerendering=false;
  }
  function saveEditor(editor){
    if(state.saving || !owner()) return;
    const identity=owner().code, draft=isDraft(editor), index=lineIndex(editor);
    const item=draft ? null : state.items.find(note=>note.id===editor.dataset.mnText);
    const source=draft ? state.draftLines
      : (state.editId===editor.dataset.mnText ? state.editLines : (item?item.lines:[]));
    const working=source.map(line=>({text:line.text,done:line.done===true}));
    while(working.length<=index) working.push({text:'',done:false});
    working[index]={text:editor.textContent||'',done:working[index].done};
    const lines=cleanLines(working);
    if(draft){
      if(!state.draftOpen) return;
      if(!lines.length){state.draftOpen=false;state.draftLines=blankLines();state.draftColour=null;render();return;}
      const id=window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
      const colour=state.draftColour;
      state.draftLines=lines;
      update(items=>[...items,{id,lines,colour,done:false,created:Date.now(),updated:Date.now()}])
        .then(success=>{if(success && owner()?.code===identity){
          state.draftOpen=false;state.draftLines=blankLines();state.draftColour=null;render();
        }});
      return;
    }
    const id=editor.dataset.mnText;
    if(!item) return;
    if(!lines.length || sameLines(lines,item.lines)){state.editId=null;state.editLines=[];render();return;}
    state.editId=id;
    state.editLines=lines.map(line=>({...line}));
    update(items=>items.map(note=>note.id===id?{...note,lines,updated:Date.now()}:note))
      .then(success=>{if(success && owner()?.code===identity && state.editId===id){
        state.editId=null;state.editLines=[];render();
      }});
  }
  root.addEventListener('focusin',event=>{
    const editor=event.target.closest('[data-mn-text],[data-mn-draft]');
    if(editor && !state.saving) beginEdit(editor);
  });
  root.addEventListener('input',event=>{
    const editor=event.target.closest('[data-mn-text],[data-mn-draft]');
    if(!editor) return;
    let text=editor.textContent||'';
    if(text.length>maxChars){
      text=text.slice(0,maxChars);
      editor.textContent=text;
      const range=document.createRange();
      range.selectNodeContents(editor);range.collapse(false);
      const selection=window.getSelection();
      selection.removeAllRanges();selection.addRange(range);
    }
    const lines=beginEdit(editor), index=lineIndex(editor);
    if(lines[index]) lines[index].text=text;
    else{while(lines.length<index) lines.push({text:'',done:false}); lines.push({text,done:false});}
  });
  root.addEventListener('paste',event=>{
    const editor=event.target.closest('[data-mn-text],[data-mn-draft]');
    if(!editor) return;
    event.preventDefault();
    const pasted=event.clipboardData.getData('text/plain'), parts=pasted.split(/\r\n|\r|\n/);
    if(parts.length<2){
      document.execCommand('insertText',false,pasted);
      return;
    }
    const lines=beginEdit(editor), index=lineIndex(editor), offset=caretOffset(editor);
    const text=editor.textContent||'', before=text.slice(0,offset), after=text.slice(offset);
    const current=lines[index]||{text:'',done:false};
    const added=parts.map((part,at)=>({
      text:((at===0?before:'')+part+(at===parts.length-1?after:'')).slice(0,maxChars),
      done:at===0?current.done:false
    }));
    lines.splice(index,1,...added);
    if(lines.length>maxLines) lines.length=maxLines;
    const last=Math.min(index+added.length-1,lines.length-1);
    rerender(lineSelector(editor,last),parts[parts.length-1].length);
  });
  root.addEventListener('keydown',event=>{
    const editor=event.target.closest('[data-mn-text],[data-mn-draft]');
    if(!editor) return;
    if(event.key==='Escape'){
      event.preventDefault();
      editor.blur();
      return;
    }
    if(event.key==='Enter'){
      event.preventDefault();
      const lines=beginEdit(editor), index=lineIndex(editor);
      if(lines.length>=maxLines) return;
      const offset=caretOffset(editor), text=editor.textContent||'';
      const current=lines[index]||{text:'',done:false};
      lines.splice(index,1,{text:text.slice(0,offset),done:current.done},{text:text.slice(offset),done:false});
      rerender(lineSelector(editor,index+1),0);
      return;
    }
    if(event.key==='Backspace' && !(editor.textContent||'')){
      const index=lineIndex(editor);
      if(index<1 || caretOffset(editor)!==0) return;
      const lines=beginEdit(editor);
      if(lines.length<2) return;
      event.preventDefault();
      lines.splice(index,1);
      const previous=lines[index-1];
      rerender(lineSelector(editor,index-1),previous?previous.text.length:0);
    }
  });
  root.addEventListener('focusout',event=>{
    const editor=event.target.closest('[data-mn-text],[data-mn-draft]');
    if(!editor || !editor.isConnected || state.rerendering) return;
    const sibling=event.relatedTarget?.closest('[data-mn-text],[data-mn-draft]');
    if(sibling && (isDraft(editor)
      ? isDraft(sibling)
      : sibling.dataset.mnText===editor.dataset.mnText)) return;
    const action=event.relatedTarget?.closest('[data-mn-cancel-draft],[data-mn-delete],[data-mn-done],[data-mn-line-done]');
    if(action && (isDraft(editor)
      ? action.hasAttribute('data-mn-cancel-draft')
      : action.dataset.mnDelete===editor.dataset.mnText || action.dataset.mnDone===editor.dataset.mnText
        || action.dataset.mnLineDone===editor.dataset.mnText)) return;
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
      state.draftOpen=true;state.draftLines=blankLines();state.draftColour=state.colour;
      render();
      root.querySelector('[data-mn-draft]')?.focus();
    }else if(event.target.closest('[data-mn-cancel-draft]')){
      state.draftOpen=false;state.draftLines=blankLines();state.draftColour=null;render();
    }else if(event.target.closest('[data-mn-line-done]')){
      const button=event.target.closest('[data-mn-line-done]');
      const id=button.dataset.mnLineDone, index=Number(button.dataset.mnLine)||0;
      let target=index, edited=null;
      if(state.editId===id){
        const working=state.editLines.map(line=>({text:line.text.trim().slice(0,maxChars),done:line.done===true}));
        if(!working[index] || !working[index].text) return;
        target=working.slice(0,index).filter(line=>line.text).length;
        edited=working.filter(line=>line.text).slice(0,maxLines);
      }
      update(items=>items.map(item=>{
        if(item.id!==id) return item;
        const base=edited&&edited.length?edited:item.lines;
        return {...item,lines:base.map((line,at)=>at===target?{...line,done:!line.done}:line),updated:Date.now()};
      })).then(success=>{if(success && state.editId===id){state.editId=null;state.editLines=[];render();}});
    }else if(event.target.closest('[data-mn-done]')){
      const id=event.target.closest('[data-mn-done]').dataset.mnDone;
      const edited=state.editId===id ? cleanLines(state.editLines) : null;
      update(items=>items.map(item=>item.id===id?{...item,done:!item.done,
        lines:(edited&&edited.length?edited:item.lines),updated:Date.now()}:item))
        .then(success=>{if(success && state.editId===id){state.editId=null;state.editLines=[];render();}});
    }else if(event.target.matches('[data-mn-delete]')){
      const id=event.target.dataset.mnDelete;
      update(items=>items.filter(item=>item.id!==id))
        .then(success=>{if(success && state.editId===id){state.editId=null;state.editLines=[];render();}});
    }else if(event.target.matches('[data-mn-clear]')){
      update(items=>items.filter(item=>!item.done).map(item=>{
        const lines=item.lines.filter(line=>!line.done);
        return lines.length===item.lines.length ? item : {...item,lines,updated:Date.now()};
      }).filter(item=>item.lines.length));
    }
  });
})();
