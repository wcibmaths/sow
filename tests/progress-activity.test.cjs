'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const storageStart = html.indexOf('let _cache = {};');
const storageEnd = html.indexOf('let _flashT;', storageStart);
assert.notEqual(storageStart, -1, 'storage code start marker exists');
assert.notEqual(storageEnd, -1, 'storage code end marker exists');
const storageSource = html.slice(storageStart, storageEnd);

const resetStart = html.indexOf('async function resetProgress(){');
const resetEndMarker = '\n}\n\n// ════════════════════════════════════════════════════════════════════\n//  ASSESSMENTS';
const resetEnd = html.indexOf(resetEndMarker, resetStart);
assert.notEqual(resetStart, -1, 'resetProgress start marker exists');
assert.notEqual(resetEnd, -1, 'resetProgress end marker exists');
const resetSource = html.slice(resetStart, resetEnd + 2);

const activitySource = fs.readFileSync(path.join(root, 'progress-activity.js'), 'utf8');
const DAY = 24 * 60 * 60 * 1000;
const PAIRS = [
  { yg: 7, set: 'A' },
  { yg: 7, set: 'B' },
  { yg: 8, set: 'A' },
];
const SOW = new Map(PAIRS.map(({ yg, set }) => [
  `${yg}/${set}`,
  [{ id: `lesson-${yg}-${set}`, type: 'core' }],
]));
const TEACHERS = new Map([
  ['7/A', ['Teacher One']],
  ['7/B', ['Teacher One', 'Teacher Two']],
  ['8/A', ['Teacher One']],
]);

function clone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function toDoc(flat) {
  const entries = {};
  for (const [key, value] of Object.entries(flat || {})) {
    if (key !== '__updatedAt' && key !== '__progressActivity') entries[key] = value;
  }
  return {
    entries,
    updatedAt: { ...((flat && flat.__updatedAt) || {}) },
    progressActivity: { ...((flat && flat.__progressActivity) || {}) },
  };
}

function mergeMaps(existing, patch) {
  return { ...(existing || {}), ...(patch || {}) };
}

function mergeDocument(existing, patch) {
  const next = { ...(existing || {}), ...(patch || {}) };
  for (const key of ['entries', 'updatedAt', 'progressActivity']) {
    if (patch && Object.prototype.hasOwnProperty.call(patch, key)) {
      next[key] = mergeMaps(existing && existing[key], patch[key]);
    }
  }
  return next;
}

function snapshot(data) {
  const value = clone(data) || {};
  return {
    exists: true,
    data: () => clone(value),
  };
}

function makeCloud(initialDoc = {}) {
  let document = clone(initialDoc) || {};
  let failSet = false;
  let failTransaction = false;
  let setGate = null;
  let transactionGate = null;
  const writes = [];
  const listeners = [];
  const reference = {
    async get() {
      return snapshot(document);
    },
    onSnapshot(callback) {
      listeners.push(callback);
      return () => {};
    },
    set(patch, options) {
      writes.push({ patch: clone(patch), options: clone(options) });
      const commit = () => {
        if (failSet) throw new Error('mock set failed');
        document = options && options.merge
          ? mergeDocument(document, patch)
          : clone(patch);
      };
      return setGate ? setGate.promise.then(commit) : Promise.resolve().then(commit);
    },
  };
  const firestore = {
    async runTransaction(callback) {
      const pendingWrites = [];
      const transaction = {
        async get() {
          return snapshot(document);
        },
        set(_reference, value, options) {
          const write = { patch: clone(value), options: clone(options) };
          writes.push(write);
          pendingWrites.push(write);
        },
      };
      const result = await callback(transaction);
      if (transactionGate) await transactionGate.promise;
      if (failTransaction) throw new Error('mock transaction failed');
      for (const write of pendingWrites) {
        document = write.options && write.options.merge
          ? mergeDocument(document, write.patch)
          : write.patch;
      }
      return result;
    },
  };
  return {
    reference,
    firestore,
    writes,
    listeners,
    read: () => clone(document),
    failSet(value = true) { failSet = value; },
    failTransaction(value = true) { failTransaction = value; },
    holdSet(gate) { setGate = gate; },
    holdTransaction(gate) { transactionGate = gate; },
  };
}

function makeHarness({
  teacher = 'Teacher One',
  initialFlat = {},
  initialDoc,
  now = Date.parse('2026-10-01T05:00:00.000Z'),
} = {}) {
  const clock = { now };
  class ControlledDate extends Date {
    static now() { return clock.now; }
  }
  const cloud = makeCloud(initialDoc || toDoc(initialFlat));
  const local = new Map();
  const listeners = {};
  const alerts = [];
  const controls = [{ disabled: false }, { disabled: true }];
  let selectedClass = { yg: 7, set: 'A' };
  const window = {
    WCIB_ME: { code: teacher },
    WCIB_DB: cloud.reference,
    WCIB_CAN_EDIT: () => true,
    addEventListener(name, callback) {
      (listeners[name] ||= []).push(callback);
    },
  };
  const context = vm.createContext({
    window,
    Date: ControlledDate,
    Intl,
    JSON,
    Object,
    Promise,
    Map,
    console: { warn() {}, error() {} },
    document: {
      getElementById: () => null,
      querySelectorAll: () => controls,
    },
    localStorage: {
      getItem(key) { return local.has(key) ? local.get(key) : null; },
      setItem(key, value) { local.set(key, String(value)); },
    },
    firebase: { firestore: () => cloud.firestore },
    STORE_KEY: 'test-sow',
    PING_KEY: 'test-ping',
    flashSync() {},
    refreshActiveView() {},
    allClassPairs: () => PAIRS,
    sowFor(yg, set) { return SOW.get(`${yg}/${set}`) || null; },
    teacherNamesForClass(yg, set) { return TEACHERS.get(`${yg}/${set}`) || []; },
    makeKey(lessonId, set) { return `${lessonId}__${set}`; },
    getProgress: () => ({ pct: 0, done: 0, total: 0, prog: 0 }),
    esc: value => String(value),
    tvClassLabel: (yg, set) => `Year ${yg} ${set}`,
    selectedTvClass: () => selectedClass,
    confirm: () => true,
    renderTeacher() {},
    alert: message => alerts.push(message),
    Y7_SOW: SOW.get('7/A'),
  });
  vm.runInContext(storageSource + `
    globalThis.__storage = {
      loadAll, _lsLoad, _lsSave, _fromDoc, _toDoc, saveAll, _saveOne,
      syncFromServer, setStatusValue, getStatusUpdatedAt, makeKey
    };
  `, context, { filename: 'index.html storage extraction' });
  vm.runInContext(activitySource, context, { filename: 'progress-activity.js' });
  vm.runInContext(resetSource + '\nglobalThis.__resetProgress = resetProgress;', context, {
    filename: 'index.html resetProgress extraction',
  });
  return {
    context,
    window,
    cloud,
    local,
    listeners,
    alerts,
    controls,
    clock,
    api: context.__storage,
    activity: window.WCIB_PROGRESS_ACTIVITY,
    reset: context.__resetProgress,
    setSelectedClass(value) { selectedClass = value; },
  };
}

test('record prepares an activity patch without mutating metadata until apply is called', () => {
  const h = makeHarness();
  const data = {
    'lesson-7-A__A': 'In progress',
    __updatedAt: { 'lesson-7-A__A': 1234 },
    __progressActivity: { 'other__7-A': 555 },
  };
  const before = clone(data);
  const activity = h.activity.record(data, 7, 'A', 9000);

  assert.deepEqual(plain(activity), {
    key: 'Teacher One__7-A',
    at: 9000,
    yg: 7,
    set: 'A',
    patch: {
      'Teacher One__7-A': 9000,
      'legacy__7-A': 1234,
    },
  });
  assert.deepEqual(data, before);

  h.activity.apply(data, activity);
  assert.deepEqual(plain(data.__progressActivity), {
    'other__7-A': 555,
    'Teacher One__7-A': 9000,
    'legacy__7-A': 1234,
  });
});

test('Done and incomplete edits atomically persist progress, timestamps, activity, and an optional taught pin', async () => {
  const h = makeHarness();
  await h.api.syncFromServer();
  const key = 'lesson-7-A__A';
  const activityKey = 'Teacher One__7-A';

  h.clock.now = Date.parse('2026-10-01T06:00:00.000Z');
  await h.api.setStatusValue('lesson-7-A', 'A', 'Done');
  let saved = h.cloud.read();
  assert.equal(saved.entries[key], 'Done');
  assert.equal(saved.updatedAt[key], h.clock.now);
  assert.equal(saved.progressActivity[activityKey], h.clock.now);
  let patch = h.cloud.writes.at(-1).patch;
  assert.equal(patch.entries[key], 'Done');
  assert.equal(patch.updatedAt[key], h.clock.now);
  assert.equal(patch.progressActivity[activityKey], h.clock.now);

  h.clock.now += 60_000;
  const taughtPin = { lessonId: 'lesson-7-A', taught: true, slot: 'Tuesday P2' };
  await h.api.setStatusValue('lesson-7-A', 'A', 'In progress', { taught: taughtPin });
  saved = h.cloud.read();
  assert.equal(saved.entries[key], 'In progress');
  assert.equal(saved.updatedAt[key], h.clock.now);
  assert.equal(saved.progressActivity[activityKey], h.clock.now);
  assert.deepEqual(saved.taught, taughtPin);
  patch = h.cloud.writes.at(-1).patch;
  assert.equal(patch.entries[key], 'In progress');
  assert.equal(patch.updatedAt[key], h.clock.now);
  assert.equal(patch.progressActivity[activityKey], h.clock.now);
  assert.deepEqual(patch.taught, taughtPin);
  assert.equal(h.api.loadAll()[key], 'In progress');
  assert.equal(h.api.loadAll().__updatedAt[key], h.clock.now);
  assert.equal(h.api.loadAll().__progressActivity[activityKey], h.clock.now);
  const local = JSON.parse(h.local.get('test-sow'));
  assert.equal(local[key], 'In progress');
  assert.equal(local.__updatedAt[key], h.clock.now);
  assert.equal(local.__progressActivity[activityKey], h.clock.now);
});

test('repeating the current status is not a progress edit, while a taught pin still saves', async () => {
  const h = makeHarness();
  await h.api.syncFromServer();
  await h.api.setStatusValue('lesson-7-A', 'A', 'Done');
  const stamp = h.api.loadAll().__updatedAt['lesson-7-A__A'];
  const activity = h.api.loadAll().__progressActivity['Teacher One__7-A'];
  const writeCount = h.cloud.writes.length;

  h.clock.now += DAY;
  await h.api.setStatusValue('lesson-7-A', 'A', 'Done');
  assert.equal(h.cloud.writes.length, writeCount);
  assert.equal(h.api.loadAll().__updatedAt['lesson-7-A__A'], stamp);
  assert.equal(h.api.loadAll().__progressActivity['Teacher One__7-A'], activity);

  const pin = { lessonId: 'lesson-7-A', taught: true };
  await h.api.setStatusValue('lesson-7-A', 'A', 'Done', { taught: pin });
  assert.deepEqual(h.cloud.writes.at(-1).patch, { taught: pin });
  assert.deepEqual(h.cloud.read().taught, pin);
  assert.equal(h.api.loadAll().__updatedAt['lesson-7-A__A'], stamp);
  assert.equal(h.api.loadAll().__progressActivity['Teacher One__7-A'], activity);
});

test('an ordinary edit resolves a stale local legacy baseline against the server atomically', async () => {
  const key = 'lesson-7-A__A';
  const h = makeHarness({
    teacher: 'Teacher Two',
    initialFlat: {
      [key]: 'Done',
      __updatedAt: { [key]: 100 },
      __progressActivity: {},
    },
    initialDoc: {
      entries: { [key]: 'Done' },
      updatedAt: { [key]: 100 },
      progressActivity: { 'legacy__7-A': 200 },
      resources: { worksheets: ['shared-1'] },
    },
  });
  await h.api.syncFromServer();
  const staleLocal = h.api.loadAll();
  staleLocal[key] = 'Done';
  staleLocal.__updatedAt[key] = 100;
  delete staleLocal.__progressActivity['legacy__7-A'];
  h.clock.now = 9000;
  await h.api.setStatusValue('lesson-7-A', 'A', 'In progress');

  const saved = h.cloud.read();
  const activityKey = 'Teacher Two__7-A';
  assert.equal(saved.progressActivity['legacy__7-A'], 200);
  assert.equal(saved.progressActivity[activityKey], 9000);
  assert.equal(h.activity.lastUpdated('Teacher One', 7, 'A'), 200);
  assert.equal(h.api.loadAll().__progressActivity['legacy__7-A'], 200);
  const txWrite = h.cloud.writes.at(-1);
  assert.deepEqual(txWrite.options, { merge: true });
  assert.equal(txWrite.patch.entries[key], 'In progress');
  assert.equal(txWrite.patch.updatedAt[key], 9000);
  assert.equal(txWrite.patch.progressActivity['legacy__7-A'], 200);
  assert.equal(txWrite.patch.progressActivity[activityKey], 9000);
  assert.deepEqual(saved.resources, { worksheets: ['shared-1'] });
});

test('reset resolves a stale local legacy baseline from the transaction server snapshot', async () => {
  const key = 'lesson-7-A__A';
  const h = makeHarness({
    teacher: 'Teacher Two',
    initialFlat: {
      [key]: 'Done',
      __updatedAt: { [key]: 100 },
      __progressActivity: {},
    },
    initialDoc: {
      entries: { [key]: 'Done' },
      updatedAt: { [key]: 200 },
      progressActivity: { 'legacy__7-A': 200 },
      resources: { worksheets: ['shared-1'] },
    },
  });
  await h.api.syncFromServer();
  const staleLocal = h.api.loadAll();
  staleLocal[key] = 'Done';
  staleLocal.__updatedAt[key] = 100;
  delete staleLocal.__progressActivity['legacy__7-A'];
  h.context.Y7_SOW = [{ id: 'lesson-7-A', type: 'core' }];
  h.context.sowFor = () => h.context.Y7_SOW;
  h.setSelectedClass({ yg: 7, set: 'A' });
  h.clock.now = 9000;

  await h.reset();

  const saved = h.cloud.read();
  assert.equal(saved.entries[key], undefined);
  assert.equal(saved.updatedAt[key], undefined);
  assert.equal(saved.progressActivity['legacy__7-A'], 200);
  assert.equal(saved.progressActivity['Teacher Two__7-A'], 9000);
  assert.equal(h.activity.lastUpdated('Teacher One', 7, 'A'), 200);
  assert.equal(h.api.loadAll().__progressActivity['legacy__7-A'], 200);
  assert.equal(h.api.loadAll().__progressActivity['Teacher Two__7-A'], 9000);
  assert.deepEqual(saved.resources, { worksheets: ['shared-1'] });
});

test('server-already-requested status for stale local progress pins without stamping activity', async () => {
  const key = 'lesson-7-A__A';
  const pin = { lessonId: 'lesson-7-A', taught: true };
  const h = makeHarness({
    initialFlat: {
      [key]: 'In progress',
      __updatedAt: { [key]: 100 },
      __progressActivity: {},
    },
    initialDoc: {
      entries: { [key]: 'Done' },
      updatedAt: { [key]: 200 },
      progressActivity: { 'legacy__7-A': 150 },
    },
  });
  await h.api.syncFromServer();
  // Model a stale browser cache after its last read.
  const staleLocal = h.api.loadAll();
  staleLocal[key] = 'In progress';
  staleLocal.__updatedAt[key] = 100;
  staleLocal.__progressActivity = {};
  await h.api.setStatusValue('lesson-7-A', 'A', 'Done', { taught: pin });

  const saved = h.cloud.read();
  assert.equal(saved.entries[key], 'Done');
  assert.equal(saved.updatedAt[key], 200);
  assert.deepEqual(saved.progressActivity, { 'legacy__7-A': 150 });
  assert.deepEqual(saved.taught, pin);
  assert.equal(h.api.loadAll()[key], 'Done');
  assert.equal(h.api.loadAll().__updatedAt[key], 200);
  assert.deepEqual(plain(h.api.loadAll().__progressActivity), {});
  assert.deepEqual(h.cloud.writes.at(-1).patch, { taught: pin });
  assert.deepEqual(h.cloud.writes.at(-1).options, { merge: true });
});

test('server-already-reset class with stale local progress is not stamped again', async () => {
  const key = 'lesson-7-A__A';
  const h = makeHarness({
    teacher: 'Teacher Two',
    initialFlat: {
      [key]: 'Done',
      __updatedAt: { [key]: 100 },
      __progressActivity: {},
    },
    initialDoc: {
      entries: {},
      updatedAt: {},
      progressActivity: { 'legacy__7-A': 200 },
    },
  });
  await h.api.syncFromServer();
  const staleLocal = h.api.loadAll();
  staleLocal[key] = 'Done';
  staleLocal.__updatedAt[key] = 100;
  delete staleLocal.__progressActivity['legacy__7-A'];
  h.context.Y7_SOW = [{ id: 'lesson-7-A', type: 'core' }];
  h.context.sowFor = () => h.context.Y7_SOW;
  h.setSelectedClass({ yg: 7, set: 'A' });
  h.clock.now = 9000;

  await h.reset();

  const saved = h.cloud.read();
  assert.equal(saved.entries[key], undefined);
  assert.equal(saved.updatedAt[key], undefined);
  assert.deepEqual(saved.progressActivity, { 'legacy__7-A': 200 });
  assert.equal(saved.progressActivity['Teacher Two__7-A'], undefined);
  assert.equal(h.api.loadAll().__progressActivity['Teacher Two__7-A'], undefined);
});

test('reads, login-style sync, local storage events, and resource writes do not create activity stamps', async () => {
  const initial = {
    'lesson-7-A__A': 'Done',
    __updatedAt: { 'lesson-7-A__A': 1234 },
    __progressActivity: {},
  };
  const h = makeHarness({ initialFlat: initial });
  await h.api.syncFromServer();
  assert.deepEqual(plain(h.api.loadAll().__progressActivity), {});
  assert.deepEqual(h.cloud.read().progressActivity, {});

  h.api._lsSave(h.api.loadAll());
  assert.equal(h.local.get('test-sow') !== undefined, true);
  for (const listener of h.listeners.storage || []) listener({ key: 'test-ping' });
  assert.deepEqual(plain(h.api.loadAll().__progressActivity), {});

  const resourceUpdate = {
    ...h.api.loadAll(),
    lessonResources: { 'lesson-7-A': { worksheet: 'shared-resource-id' } },
  };
  await h.api.saveAll(resourceUpdate);
  assert.deepEqual(h.cloud.read().entries.lessonResources, {
    'lesson-7-A': { worksheet: 'shared-resource-id' },
  });
  assert.deepEqual(plain(h.api.loadAll().__progressActivity), {});
  assert.deepEqual(h.cloud.read().progressActivity, {});
});

test('class progress stays isolated and co-teacher activity is attributed to the editing teacher only', async () => {
  const h = makeHarness();
  await h.api.syncFromServer();

  h.clock.now = Date.parse('2026-10-01T06:00:00.000Z');
  await h.api.setStatusValue('lesson-7-A', 'A', 'Done');
  h.clock.now += 1_000;
  await h.api.setStatusValue('lesson-7-B', 'B', 'Done');
  h.window.WCIB_ME.code = 'Teacher Two';
  h.clock.now += 1_000;
  await h.api.setStatusValue('lesson-7-B', 'B', 'In progress');

  const activity = h.api.loadAll().__progressActivity;
  assert.equal(activity['Teacher One__7-A'], Date.parse('2026-10-01T06:00:00.000Z'));
  assert.equal(activity['Teacher One__7-B'], Date.parse('2026-10-01T06:00:01.000Z'));
  assert.equal(activity['Teacher Two__7-B'], Date.parse('2026-10-01T06:00:02.000Z'));
  assert.equal(h.activity.lastUpdated('Teacher One', 7, 'A'), activity['Teacher One__7-A']);
  assert.equal(h.activity.lastUpdated('Teacher One', 7, 'B'), activity['Teacher One__7-B']);
  assert.equal(h.activity.lastUpdated('Teacher Two', 7, 'B'), activity['Teacher Two__7-B']);
  assert.equal(h.activity.lastUpdated('Teacher Two', 7, 'A'), null);
});

test('an editor outside a sole-teacher class cannot replace the assigned teacher historical baseline', async () => {
  const h = makeHarness({
    teacher: 'Teacher Two',
    initialFlat: {
      'lesson-7-A__A': 'Done',
      __updatedAt: { 'lesson-7-A__A': 1234 },
      __progressActivity: {},
    },
  });
  await h.api.syncFromServer();
  h.clock.now = Date.parse('2026-10-01T06:00:00.000Z');

  await h.api.setStatusValue('lesson-7-A', 'A', 'In progress');

  const activity = h.api.loadAll().__progressActivity;
  assert.equal(activity['Teacher Two__7-A'], h.clock.now);
  assert.equal(activity['legacy__7-A'], 1234);
  assert.equal(h.activity.lastUpdated('Teacher One', 7, 'A'), 1234);
  assert.notEqual(h.activity.lastUpdated('Teacher One', 7, 'A'), h.clock.now);
  assert.equal(h.activity.lastUpdated('Teacher Two', 7, 'A'), h.clock.now);
});

test('activity metadata survives document conversion and reconstruction in another browser context', async () => {
  const flat = {
    'lesson-7-A__A': 'Done',
    __updatedAt: { 'lesson-7-A__A': 4567 },
    __progressActivity: { 'Teacher One__7-A': 9876 },
  };
  const first = makeHarness({ initialFlat: flat });
  await first.api.syncFromServer();
  const doc = plain(first.api._toDoc(first.api.loadAll()));
  assert.deepEqual(Object.keys(doc).sort(), ['entries', 'progressActivity', 'updatedAt']);
  assert.equal(doc.entries.__progressActivity, undefined);

  const second = makeHarness({ teacher: 'Teacher One', initialDoc: doc });
  await second.api.syncFromServer();
  assert.deepEqual(plain(second.api.loadAll().__progressActivity), {
    'Teacher One__7-A': 9876,
  });
  assert.equal(second.activity.lastUpdated('Teacher One', 7, 'A'), 9876);
  assert.deepEqual(plain(second.api._toDoc(second.api.loadAll())), doc);
});

test('recency labels use Bangkok calendar days and include the exact seven-day boundary', () => {
  const h = makeHarness({ now: Date.parse('2026-10-01T05:00:00.000Z') });
  const now = h.clock.now;
  assert.deepEqual(plain(h.activity.status(null, now)), { label: 'Never updated', tone: 'not' });
  assert.deepEqual(plain(h.activity.status(now - 60 * 60 * 1000, now)), {
    label: 'Updated today', tone: 'done',
  });
  assert.deepEqual(plain(h.activity.status(now - 13 * 60 * 60 * 1000, now)), {
    label: 'Updated within 7 days', tone: 'prog',
  });
  assert.deepEqual(plain(h.activity.status(now - 7 * DAY, now)), {
    label: 'Updated within 7 days', tone: 'prog',
  });
  assert.deepEqual(plain(h.activity.status(now - 7 * DAY - 1, now)), {
    label: 'More than 7 days ago', tone: 'not',
  });
});

test('formats timestamps in Bangkok time with the expected date and 24-hour time', () => {
  const h = makeHarness();
  assert.equal(h.activity.format(Date.parse('2026-10-01T03:42:00.000Z')), '1 Oct 2026, 10:42');
  assert.equal(h.activity.format(null), '—');
});

test('reset uses a targeted transaction and preserves unrelated class progress, activity, and resources', async () => {
  const initial = {
    'lesson-7-A__A': 'Done',
    'lesson-7-A2__A': 'In progress',
    'lesson-7-B__B': 'Done',
    'lesson-8-A__A': 'Done',
    __updatedAt: {
      'lesson-7-A__A': 10,
      'lesson-7-A2__A': 11,
      'lesson-7-B__B': 12,
      'lesson-8-A__A': 13,
    },
    __progressActivity: {
      'Teacher One__7-A': 20,
      'Teacher One__7-B': 21,
      'Teacher Two__7-B': 22,
      'Teacher One__8-A': 23,
    },
    resourceCatalog: { shared: ['worksheet-1'] },
  };
  const h = makeHarness({
    initialFlat: initial,
    initialDoc: {
      ...toDoc(initial),
      resources: { shared: ['worksheet-1'] },
    },
  });
  await h.api.syncFromServer();
  // Reset the two lessons in this class, independently of the other class's
  // entries and the shared resource catalog held in the same document.
  h.context.Y7_SOW = [
    { id: 'lesson-7-A', type: 'core' },
    { id: 'lesson-7-A2', type: 'core' },
  ];
  h.context.sowFor = () => h.context.Y7_SOW;
  h.setSelectedClass({ yg: 7, set: 'A' });
  h.clock.now = Date.parse('2026-10-01T07:00:00.000Z');
  await h.reset();

  const saved = h.cloud.read();
  assert.equal(saved.entries['lesson-7-A__A'], undefined);
  assert.equal(saved.entries['lesson-7-A2__A'], undefined);
  assert.equal(saved.updatedAt['lesson-7-A__A'], undefined);
  assert.equal(saved.updatedAt['lesson-7-A2__A'], undefined);
  assert.equal(saved.entries['lesson-7-B__B'], 'Done');
  assert.equal(saved.entries['lesson-8-A__A'], 'Done');
  assert.equal(saved.updatedAt['lesson-7-B__B'], 12);
  assert.equal(saved.updatedAt['lesson-8-A__A'], 13);
  assert.deepEqual(saved.progressActivity, {
    'Teacher One__7-A': h.clock.now,
    'Teacher One__7-B': 21,
    'Teacher Two__7-B': 22,
    'Teacher One__8-A': 23,
    'legacy__7-A': 11,
  });
  assert.deepEqual(saved.resources, { shared: ['worksheet-1'] });
  assert.deepEqual(saved.entries.resourceCatalog, { shared: ['worksheet-1'] });
});

test('reset transaction failure rolls back local progress, timestamps, activity, and storage', async () => {
  const initial = {
    'lesson-7-A__A': 'Done',
    __updatedAt: { 'lesson-7-A__A': 10 },
    __progressActivity: { 'Teacher One__7-A': 20 },
  };
  const h = makeHarness({ initialFlat: initial });
  await h.api.syncFromServer();
  h.context.Y7_SOW = [{ id: 'lesson-7-A', type: 'core' }];
  h.context.sowFor = () => h.context.Y7_SOW;
  h.setSelectedClass({ yg: 7, set: 'A' });
  h.cloud.failTransaction();
  await h.reset();

  assert.equal(h.api.loadAll()['lesson-7-A__A'], 'Done');
  assert.equal(h.api.loadAll().__updatedAt['lesson-7-A__A'], 10);
  assert.equal(h.api.loadAll().__progressActivity['Teacher One__7-A'], 20);
  const local = JSON.parse(h.local.get('test-sow'));
  assert.equal(local['lesson-7-A__A'], 'Done');
  assert.equal(local.__updatedAt['lesson-7-A__A'], 10);
  assert.equal(local.__progressActivity['Teacher One__7-A'], 20);
  assert.equal(h.cloud.read().entries['lesson-7-A__A'], 'Done');
  assert.match(h.alerts.at(-1), /Could not reset SOW progress/);
});

test('failed progress mutation rolls back status, lesson timestamp, and actor activity', async () => {
  const initial = {
    'lesson-7-A__A': 'In progress',
    __updatedAt: { 'lesson-7-A__A': 111 },
    __progressActivity: { 'Teacher One__7-A': 222 },
  };
  const h = makeHarness({ initialFlat: initial });
  await h.api.syncFromServer();
  h.cloud.failTransaction();
  await assert.rejects(
    h.api.setStatusValue('lesson-7-A', 'A', 'Done'),
    /mock transaction failed/,
  );

  assert.equal(h.api.loadAll()['lesson-7-A__A'], 'In progress');
  assert.equal(h.api.loadAll().__updatedAt['lesson-7-A__A'], 111);
  assert.equal(h.api.loadAll().__progressActivity['Teacher One__7-A'], 222);
  const local = JSON.parse(h.local.get('test-sow'));
  assert.equal(local['lesson-7-A__A'], 'In progress');
  assert.equal(local.__updatedAt['lesson-7-A__A'], 111);
  assert.equal(local.__progressActivity['Teacher One__7-A'], 222);
  assert.equal(h.cloud.read().entries['lesson-7-A__A'], 'In progress');
});

test('two sequential failed edits leave shared/local progress and historical activity unchanged', async () => {
  const h = makeHarness({
    initialFlat: {
      'lesson-7-A__A': 'Not started',
      __updatedAt: {},
      __progressActivity: {},
    },
  });
  await h.api.syncFromServer();
  const beforeCache = plain(h.api.loadAll());
  const beforeCloud = h.cloud.read();
  const beforeLocal = h.local.get('test-sow');
  h.cloud.failTransaction();

  await assert.rejects(
    h.api.setStatusValue('lesson-7-A', 'A', 'Done'),
    /mock transaction failed/,
  );
  h.clock.now += 1_000;
  await assert.rejects(
    h.api.setStatusValue('lesson-7-A', 'A', 'In progress'),
    /mock transaction failed/,
  );

  assert.deepEqual(plain(h.api.loadAll()), beforeCache);
  assert.deepEqual(h.cloud.read(), beforeCloud);
  assert.equal(h.local.get('test-sow'), beforeLocal);
  assert.equal(h.activity.lastUpdated('Teacher One', 7, 'A'), null);
  assert.equal(h.api.loadAll().__progressActivity['Teacher One__7-A'], undefined);
  assert.equal(h.api.loadAll().__progressActivity['legacy__7-A'], undefined);
});

test('an edit is rejected while reset is pending, and a failed reset leaves data and activity untouched', async () => {
  const initial = {
    'lesson-7-A__A': 'Done',
    __updatedAt: { 'lesson-7-A__A': 111 },
    __progressActivity: {
      'Teacher One__7-A': 222,
      'legacy__7-A': 111,
    },
  };
  const h = makeHarness({ teacher: 'Teacher Two', initialFlat: initial });
  await h.api.syncFromServer();
  h.context.Y7_SOW = [{ id: 'lesson-7-A', type: 'core' }];
  h.context.sowFor = () => h.context.Y7_SOW;
  h.setSelectedClass({ yg: 7, set: 'A' });
  const beforeCache = plain(h.api.loadAll());
  const beforeCloud = h.cloud.read();
  const beforeLocal = h.local.get('test-sow');
  const gate = deferred();
  h.cloud.holdTransaction(gate);

  const resetting = h.reset();
  assert.deepEqual(h.controls.map(control => control.disabled), [true, true]);
  await assert.rejects(
    h.api.setStatusValue('lesson-7-A', 'A', 'In progress'),
    /Another progress change is saving/,
  );
  assert.deepEqual(plain(h.api.loadAll()), beforeCache);
  assert.deepEqual(h.cloud.read(), beforeCloud);
  assert.equal(h.local.get('test-sow'), beforeLocal);

  gate.reject(new Error('mock reset commit failed'));
  await resetting;

  assert.deepEqual(plain(h.api.loadAll()), beforeCache);
  assert.deepEqual(h.cloud.read(), beforeCloud);
  assert.equal(h.local.get('test-sow'), beforeLocal);
  assert.equal(h.api.loadAll().__progressActivity['Teacher Two__7-A'], undefined);
  assert.deepEqual(h.controls.map(control => control.disabled), [false, true]);
});

test('legacy lesson timestamps are attributed only to a sole teacher; missing history remains missing', async () => {
  const flat = {
    'lesson-7-A__A': 'Done',
    'lesson-7-B__B': 'Done',
    __updatedAt: {
      'lesson-7-A__A': 12345,
      'lesson-7-B__B': 67890,
    },
    __progressActivity: {},
  };
  const h = makeHarness({ initialFlat: flat });
  await h.api.syncFromServer();
  assert.equal(h.activity.lastUpdated('Teacher One', 7, 'A'), 12345);
  assert.equal(h.activity.lastUpdated('Teacher One', 7, 'B'), null);
  assert.equal(h.activity.lastUpdated('Teacher Two', 7, 'B'), null);

  const noHistory = makeHarness({ initialFlat: { 'lesson-7-A__A': 'Done' } });
  await noHistory.api.syncFromServer();
  assert.equal(noHistory.activity.lastUpdated('Teacher One', 7, 'A'), null);
  assert.equal(noHistory.activity.format(
    noHistory.activity.lastUpdated('Teacher One', 7, 'A'),
  ), '—');
});