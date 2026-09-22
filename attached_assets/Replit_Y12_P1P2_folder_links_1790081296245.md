# Replit instructions — add unit folder + assessment folder links to Year 12 Pure 1 & 2

Copy everything below the line into Replit as a single message.

---

In `index.html`, add SharePoint folder links to the Year 12 **Pure 1 & 2** scheme of work (sets `Ma1P12` and `Ma2P12`), exactly the way Year 7 and Year 8 already work via `UNIT_FOLDERS` / `ASSESSMENT_FOLDERS` and the `folderBtn()` function.

Make these three edits only. Do not restructure anything else.

## Step 1 — Add two new constants

Find this existing block (around line 1137):

```js
const UNIT_FOLDERS_BY_YG     = { 7: UNIT_FOLDERS, 8: Y8_UNIT_FOLDERS, 9: Y9_UNIT_FOLDERS };
const ASSESSMENT_FOLDERS_BY_YG = { 7: ASSESSMENT_FOLDERS, 8: Y8_ASSESSMENT_FOLDERS, 9: Y9_ASSESSMENT_FOLDERS };
```

Immediately **after** it, insert this new block:

```js
// ── Year 12 IAL Pure 1 & 2 — unit folder links (SharePoint) ───────
// Keys are the `unit` numbers used in Y12_P12_SOW (1-13).
const Y12_P12_UNIT_FOLDERS = {
  1:  'https://wcibth.sharepoint.com/:f:/r/sites/Mathematics/Shared%20Documents/Maths%20Team%20Hub/4.%20Resources/C.%20Key%20Stage%205/Pure%201%20and%202/Pure%201/P1.1%20Algebraic%20Expressions?csf=1&web=1',
  2:  'https://wcibth.sharepoint.com/:f:/r/sites/Mathematics/Shared%20Documents/Maths%20Team%20Hub/4.%20Resources/C.%20Key%20Stage%205/Pure%201%20and%202/Pure%201/P1.2%20Quadratics?csf=1&web=1',
  3:  'https://wcibth.sharepoint.com/:f:/r/sites/Mathematics/Shared%20Documents/Maths%20Team%20Hub/4.%20Resources/C.%20Key%20Stage%205/Pure%201%20and%202/Pure%201/P1.4%20Graphs%20and%20Transformations?csf=1&web=1',
  4:  'https://wcibth.sharepoint.com/:f:/r/sites/Mathematics/Shared%20Documents/Maths%20Team%20Hub/4.%20Resources/C.%20Key%20Stage%205/Pure%201%20and%202/Pure%201/P1.5%20Straight%20Line%20Graphs?csf=1&web=1',
  5:  'https://wcibth.sharepoint.com/:f:/r/sites/Mathematics/Shared%20Documents/Maths%20Team%20Hub/4.%20Resources/C.%20Key%20Stage%205/Pure%201%20and%202/Pure%201/P1.6%20Trigonometric%20Ratios?csf=1&web=1',
  6:  'https://wcibth.sharepoint.com/:f:/r/sites/Mathematics/Shared%20Documents/Maths%20Team%20Hub/4.%20Resources/C.%20Key%20Stage%205/Pure%201%20and%202/Pure%201/P1.7%20Radians?csf=1&web=1',
  7:  'https://wcibth.sharepoint.com/:f:/r/sites/Mathematics/Shared%20Documents/Maths%20Team%20Hub/4.%20Resources/C.%20Key%20Stage%205/Pure%201%20and%202/Pure%201/P1.8%20Differentiation?csf=1&web=1',
  8:  'https://wcibth.sharepoint.com/:f:/r/sites/Mathematics/Shared%20Documents/Maths%20Team%20Hub/4.%20Resources/C.%20Key%20Stage%205/Pure%201%20and%202/Pure%201/P1.9%20Integration?csf=1&web=1',
  9:  'https://wcibth.sharepoint.com/:f:/r/sites/Mathematics/Shared%20Documents/Maths%20Team%20Hub/4.%20Resources/C.%20Key%20Stage%205/Pure%201%20and%202/Pure%202/P2.1%20Algebraic%20Methods?csf=1&web=1',
  10: 'https://wcibth.sharepoint.com/:f:/r/sites/Mathematics/Shared%20Documents/Maths%20Team%20Hub/4.%20Resources/C.%20Key%20Stage%205/Pure%201%20and%202/Pure%202/P2.2%20Coordinate%20Geometry%20in%20the%20%28x%2Cy%29%20Plane?csf=1&web=1',
  11: 'https://wcibth.sharepoint.com/:f:/r/sites/Mathematics/Shared%20Documents/Maths%20Team%20Hub/4.%20Resources/C.%20Key%20Stage%205/Pure%201%20and%202/Pure%202/P2.3%20Exponentials%20and%20Logarithms?csf=1&web=1',
  12: 'https://wcibth.sharepoint.com/:f:/r/sites/Mathematics/Shared%20Documents/Maths%20Team%20Hub/4.%20Resources/C.%20Key%20Stage%205/Pure%201%20and%202/Pure%202/P2.5%20Sequences%20and%20Series?csf=1&web=1',
  13: 'https://wcibth.sharepoint.com/:f:/r/sites/Mathematics/Shared%20Documents/Maths%20Team%20Hub/4.%20Resources/C.%20Key%20Stage%205/Pure%201%20and%202/Pure%202/P2.6%20Trigonometric%20Identities%20and%20Equations?csf=1&web=1',
};

// Four SoW units cover two textbook chapters. The button opens the first
// chapter's folder; the partner folders are listed here for reference only.
//   unit 2  also: .../Pure%201/P1.3%20Equations%20and%20Inequalities
//   unit 7  also: .../Pure%202/P2.7%20Differentiation
//   unit 8  also: .../Pure%202/P2.8%20Integration
//   unit 11 also: .../Pure%202/P2.4%20The%20Binomial%20Expansion

// ── Year 12 IAL Pure 1 & 2 — assessment folder (SharePoint) ───────
// The unit tests are one flat folder, not per-unit subfolders, so every
// assessment row in Y12_P12_SOW points at this single link.
const Y12_P12_ASSESSMENT_FOLDER =
  'https://wcibth.sharepoint.com/:f:/r/sites/Mathematics/Shared%20Documents/Maths%20Team%20Hub/4.%20Resources/C.%20Key%20Stage%205/Pure%201%20and%202/Pure%201/Pure%20Maths%201%20and%202%20Unit%20Tests?csf=1&web=1';
```

**Important:** do NOT add a `12:` key to `UNIT_FOLDERS_BY_YG` or `ASSESSMENT_FOLDERS_BY_YG`. Those maps are keyed by year group only, and Year 12 also contains the S1, FM P1-4, FM S1 and FM M1 sets, which reuse the same unit numbers — they would pick up the wrong links. It would also make `lessonFileUrl()` build non-existent `intmathprogtt12_lp_*.docx` file links.

## Step 2 — Update `folderBtn()`

Find `function folderBtn(lesson, yg){` (around line 3894). Change the signature to accept `set`, and add the Year 12 branch at the very top, right after the existing KS3 guard. Everything below the new branch stays exactly as it is:

```js
function folderBtn(lesson, yg, set){
  if([7,8,9].includes(Number(yg))) return '';

  // ── Year 12 IAL Pure 1 & 2 (sets Ma1P12 / Ma2P12) ───────────────
  if(Number(yg) === 12 && (set === 'Ma1P12' || set === 'Ma2P12')){
    if(!lesson.unit) return '';
    if(lesson.type === 'assessment'){
      return `<a href="${Y12_P12_ASSESSMENT_FOLDER}" target="_blank" rel="noopener noreferrer" class="res-btn assess-btn" title="Open Pure 1 &amp; 2 unit test folder">📋 Test</a>`;
    }
    const p12Url = Y12_P12_UNIT_FOLDERS[lesson.unit];
    if(!p12Url) return '';
    return `<a href="${p12Url}" target="_blank" rel="noopener noreferrer" class="res-btn" title="Open unit folder">📂 Folder</a>`;
  }

  yg = yg || 7;
  // ...rest of the existing function unchanged...
}
```

The Year 12 branch must `return` before reaching `lessonFileUrl()`, so no lesson-plan `.docx` guessing happens for KS5.

## Step 3 — Pass `set` at the call site

In `renderTeacher()` (around line 5318) find:

```js
          ${[7,8,9].includes(yg)
            ? '<span></span>'
            : lesson.unit?folderBtn(lesson,yg):'<span></span>'}
```

Change the `folderBtn` call to pass `set` (which is already in scope in that function — it is used a few lines below in `data-set="${set}"`):

```js
            : lesson.unit?folderBtn(lesson,yg,set):'<span></span>'}
```

## Do not change

- Year 7, 8 and 9 behaviour, or any of the `ks3*` URL functions.
- The Y12 S1, FM P1-4, FM S1, FM M1 sets, or any Year 13 set — they must keep showing no folder button.
- `Y12_P12_SOW` itself: no unit numbers, lesson names, dates or IDs are to be edited.
- The Assessment Schedule view (`ASSESSMENT_FOLDERS_BY_YG[ygInt]` around line 5683) — leave as is for now.

## Test after the change

1. Teacher View → Year 12 → set **Ma1P12**: every core/CSE lesson with a unit number shows a `📂 Folder` button, and each `Unit Test: ...` row shows a `📋 Test` button.
2. Same for **Ma2P12**.
3. Year 12 → **Ma1S1** and the FM sets: no folder buttons (unchanged).
4. Year 7, 8, 9: unchanged.
5. Start of Year / mock week / past paper rows (`unit: 0`) show no button.
6. Buttons open in a new tab; a signed-in staff account lands in the right SharePoint folder.
