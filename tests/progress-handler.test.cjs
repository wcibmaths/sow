'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const start=html.indexOf('async function handleChange(e){');
const end=html.indexOf('async function resetProgress(){',start);
assert(start>=0 && end>start);
const source=html.slice(start,end);
const event={target:{dataset:{lessonId:'fixture-lesson',set:'Ma1'},value:'Done'}};

test('Teacher View refreshes all progress totals only after the save completes',async ()=>{
  let resolve,refreshes=0;
  const pending=new Promise(done=>{resolve=done;});
  const context=vm.createContext({
    setStatusValue:(id,set,value)=>{
      assert.deepEqual([id,set,value],['fixture-lesson','Ma1','Done']);
      return pending;
    },
    renderTeacher:()=>{refreshes++;},
    alert:()=>assert.fail('Unexpected save error'),
    console:{error(){}}
  });
  vm.runInContext(source,context);
  const saved=context.handleChange(event);
  assert.equal(refreshes,0);
  resolve();
  await saved;
  assert.equal(refreshes,1);
});

test('A rejected progress save shows an error and refreshes the unchanged totals',async ()=>{
  let refreshes=0;
  const alerts=[];
  const context=vm.createContext({
    setStatusValue:()=>Promise.reject(new Error('fixture failure')),
    renderTeacher:()=>{refreshes++;},
    alert:message=>alerts.push(message),
    console:{error(){}}
  });
  vm.runInContext(source,context);
  await context.handleChange(event);
  assert.equal(refreshes,1);
  assert.deepEqual(alerts,['Could not save SOW progress: fixture failure']);
});