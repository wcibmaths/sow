# Replit task — load the revised Y10 Accelerated SoW, preserve all teacher progress

## Goal

Replace the Year 10 Accelerated (Ma1) scheme of work with the revised workbook
`KS4_Accelerated_SoW.xlsx` (v7 — consolidated units, per-unit revision and tests).

**Teacher progress must not change.** Not one status, not one timestamp. The SoW rows are
reference data; the statuses are the teachers' own record and are the only thing in this app
that cannot be regenerated.

---

## Do not touch — read this before you start

Leave all of the following exactly as they are. Do not edit, migrate, clean up, re-key,
re-seed, back-fill or reset any of it, and do not write a script that does:

1. The Postgres table **`sow_store`** (row `id = 1`, the `data` JSONB blob). No `UPDATE`,
   no `DELETE`, no migration script, no "tidying up orphaned keys".
2. The endpoints **`GET /api/data`** and **`POST /api/data`** in `server.py`, and the
   `load_data()` / `save_data()` functions.
3. Every key in that blob: the `<lessonId>__Ma1` status keys, the `__updatedAt` map and the
   `__progressActivity` map.
4. **`progress-activity.js`** — the teacher-attribution logic and its `legacy__` baseline keys.
5. In `index.html`: `makeKey()`, `loadAll()`, `_lsSave()`, `y10StableLessonId()`,
   `normaliseY10IdentityText()` and **`migrateY10ProgressAliases()`**. The migration function
   is what carries progress forward — it must keep its current behaviour, which is to fill in
   a new key **only when that key has no status yet**, and never to overwrite one.
6. The **"Reset My Progress"** button and anything it calls. Do not run it, do not call it
   programmatically, and do not suggest the user press it.
7. Any other year group or set (Y7–Y9, Y11, Y12/Y13, Ma2/Ma3, Bottom set, IAL). This task
   touches Year 10 Accelerated only.

If at any point you think a step requires clearing or rewriting stored progress, **stop and
report back instead of doing it.** There is no version of this task that needs that.

---

## How progress survives a SoW change (so you know why the steps below are what they are)

A Year 10 Accelerated status is stored under `<lesson.id>__Ma1`. The lesson ID is **not** a row
number — it is a hash of `type | lessonName | specification`, computed by `y10StableLessonId()`.
So a row can move to a different week, unit or lesson number and keep its ID and its status.

But if the lesson **name**, **type** or **specification points** change, the hash changes, and
the status would be left behind on the old ID. That is what the 16th column,
**`Legacy progress IDs`**, exists for: `migrateY10ProgressAliases()` copies a status from an old
ID to the new one when the new row lists that old ID.

I have already worked all of this out and generated the data file for you. Of the 108 rows:

- **73 rows keep their existing ID** — their status carries over with no action needed.
- **9 rows are two-lesson topics collapsed into single lessons** (2.1 surds, 5.1 algebraic
  fractions, 5.8 cubic/reciprocal graphs, 6.2 percentages, 8.1 inequalities, 9.1 arithmetic
  series, 10.3 circle theorems, 11.1 binomial expansion, 14.1 vector notation). Each one lists
  both former halves in `Legacy progress IDs`, so the status migrates automatically.
- **26 rows are genuinely new** (the per-unit Revision and Test rows, plus the second 2.8
  lesson). These correctly start with no status. Teachers will mark them as they go.
- **17 old rows no longer exist** (the grouped "Units 1–3 Check up" / "Units 1–3 Assessment"
  pairs and the three Summer revision lessons). **Their statuses stay in the database,
  untouched and unreferenced.** Do not delete them. They cost nothing and they are the only
  record of what was marked against the old structure.

---

## Steps

### 1. Add the new workbook

Upload `KS4_Accelerated_SoW.xlsx` to `attached_assets/`. Replit will append a timestamp to the
filename — that is fine. **Keep the existing `KS4_Accelerated_SoW_(3)_1787970692790.xlsx`
file in place**; do not delete it.

### 2. Add the new data file

Replace `y10-fm-sow.js` at the project root with the version supplied alongside this
instruction. It is already generated from the revised workbook, with the `Legacy progress IDs`
column filled in. **Do not regenerate it, reorder its rows, or edit the legacy arrays** —
in particular, never remove an entry from a `Legacy progress IDs` array.

Sanity check after uploading: the file should declare
`version: "2026-10-03-v7-consolidated-units"` and contain 108 rows of 16 values each.

### 3. Point the API at the new workbook

In `server.py`, in `get_y10_accelerated_sow()`, change `workbook_path` from
`'KS4_Accelerated_SoW_(3)_1787970692790.xlsx'` to the filename of the workbook uploaded in
step 1. Change nothing else in that function — the sheet name stays `'Y10 Accelerated'`, and
the row-shape mapping stays as it is.

This step matters: when the endpoint responds, its rows take priority over the static file.
If the endpoint keeps serving the old workbook, the site will keep showing the old SoW.

### 4. Update the cache-buster

In `index.html`, around line 1183, change

```html
<script src="./y10-fm-sow.js?v=2026-08-29-v2-fm-anchored"></script>
```

to

```html
<script src="./y10-fm-sow.js?v=2026-10-03-v7-consolidated-units"></script>
```

Without this, browsers will serve the cached old data file.

### 5. Leave the dead fallback alone

`index.html` also contains a hardcoded `let Y10_FM_SOW = [ {id:'y10_fm_001', ...} ]` array.
It is overwritten at load time by `loadY10AcceleratedSow()` and is never displayed. **Do not
update it and do not delete it** — its `y10_fm_0NN` IDs appear in the legacy arrays.

---

## Verify, without writing anything

Run these checks and report the results. All of them are read-only.

1. **Progress blob is byte-identical.** Before step 1, `GET /api/data` and save the response.
   After step 4, `GET /api/data` again and diff. The two must match exactly — same keys, same
   values, same `__updatedAt`, same `__progressActivity`. If anything differs, stop and report
   it; do not attempt a fix.
2. **The new SoW is showing.** Year 10 Accelerated shows 16 units (0–15), Unit 3 is
   "Quadratic Functions & Graphs" with 3.1–3.4, and every unit ends with a Test row.
3. **Unit 1 Test appears in week 2B** (Fri 4 Sep 2026), and Unit 2 has two Revision rows.
4. **Migration worked.** On the Y10 Accelerated view, the nine collapsed lessons listed above
   show the status their former first half had. Confirm with 2.1 "Simplifying and manipulating
   surds" in week 3A.
5. **Nothing else moved.** Spot-check one other class (e.g. Y9 Ma1) and confirm its statuses
   and its "last updated" display are unchanged.
6. **Console is clean** — no "workbook endpoint unavailable" warning, which would mean the
   site has silently fallen back to the static file.

## Report back

Tell me, in plain English:

- which files you changed,
- the result of check 1 (identical or not),
- the result of check 4,
- anything you chose not to do, and why.

Do not deploy or publish until I have read that report.
