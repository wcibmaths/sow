# Replit — fix the Year 12 Pure 1 & 2 unit test links

Copy everything below the line into Replit as a single message.

---

In `index.html`, the Year 12 Pure 1 & 2 `📋 Test` buttons currently all point at one shared folder. They must instead point at the `Unit_#_Assessment` subfolder **inside each chapter folder**, e.g. `Pure 1 / P1.4 Graphs and Transformations / Unit_4_Assessment`.

Two edits only. Leave `Y12_P12_UNIT_FOLDERS`, the rest of `folderBtn()`, and everything else untouched.

## Edit 1 — replace the single assessment constant with a per-unit map

Around line 1224 there is this block:

```js
// ── Year 12 IAL Pure 1 & 2 — assessment folder (SharePoint) ───────
// The unit tests are one flat folder, not per-unit subfolders, so every
// assessment row in Y12_P12_SOW points at this single link.
const Y12_P12_ASSESSMENT_FOLDER =
  'https://wcibth.sharepoint.com/:f:/r/sites/Mathematics/Shared%20Documents/Maths%20Team%20Hub/4.%20Resources/C.%20Key%20Stage%205/Pure%201%20and%202/Pure%201/Pure%20Maths%201%20and%202%20Unit%20Tests?csf=1&web=1';
```

Delete it entirely and put this in its place:

```js
// ── Year 12 IAL Pure 1 & 2 — assessment folders (SharePoint) ──────
// Each chapter folder contains its own Unit_#_Assessment subfolder, where the
// # is the chapter number WITHIN ITS MODULE, not the SoW unit number:
// P1.4 -> Unit_4_Assessment, P2.2 -> Unit_2_Assessment. Do not "correct" these
// numbers to match the keys — the keys are Y12_P12_SOW unit numbers (1-13) and
// they are deliberately different from the folder numbers.
const Y12_P12_ASSESSMENT_FOLDERS = {
  1:  'https://wcibth.sharepoint.com/:f:/r/sites/Mathematics/Shared%20Documents/Maths%20Team%20Hub/4.%20Resources/C.%20Key%20Stage%205/Pure%201%20and%202/Pure%201/P1.1%20Algebraic%20Expressions/Unit_1_Assessment?csf=1&web=1',
  2:  'https://wcibth.sharepoint.com/:f:/r/sites/Mathematics/Shared%20Documents/Maths%20Team%20Hub/4.%20Resources/C.%20Key%20Stage%205/Pure%201%20and%202/Pure%201/P1.2%20Quadratics/Unit_2_Assessment?csf=1&web=1',
  3:  'https://wcibth.sharepoint.com/:f:/r/sites/Mathematics/Shared%20Documents/Maths%20Team%20Hub/4.%20Resources/C.%20Key%20Stage%205/Pure%201%20and%202/Pure%201/P1.4%20Graphs%20and%20Transformations/Unit_4_Assessment?csf=1&web=1',
  4:  'https://wcibth.sharepoint.com/:f:/r/sites/Mathematics/Shared%20Documents/Maths%20Team%20Hub/4.%20Resources/C.%20Key%20Stage%205/Pure%201%20and%202/Pure%201/P1.5%20Straight%20Line%20Graphs/Unit_5_Assessment?csf=1&web=1',
  5:  'https://wcibth.sharepoint.com/:f:/r/sites/Mathematics/Shared%20Documents/Maths%20Team%20Hub/4.%20Resources/C.%20Key%20Stage%205/Pure%201%20and%202/Pure%201/P1.6%20Trigonometric%20Ratios/Unit_6_Assessment?csf=1&web=1',
  6:  'https://wcibth.sharepoint.com/:f:/r/sites/Mathematics/Shared%20Documents/Maths%20Team%20Hub/4.%20Resources/C.%20Key%20Stage%205/Pure%201%20and%202/Pure%201/P1.7%20Radians/Unit_7_Assessment?csf=1&web=1',
  7:  'https://wcibth.sharepoint.com/:f:/r/sites/Mathematics/Shared%20Documents/Maths%20Team%20Hub/4.%20Resources/C.%20Key%20Stage%205/Pure%201%20and%202/Pure%201/P1.8%20Differentiation/Unit_8_Assessment?csf=1&web=1',
  8:  'https://wcibth.sharepoint.com/:f:/r/sites/Mathematics/Shared%20Documents/Maths%20Team%20Hub/4.%20Resources/C.%20Key%20Stage%205/Pure%201%20and%202/Pure%201/P1.9%20Integration/Unit_9_Assessment?csf=1&web=1',
  9:  'https://wcibth.sharepoint.com/:f:/r/sites/Mathematics/Shared%20Documents/Maths%20Team%20Hub/4.%20Resources/C.%20Key%20Stage%205/Pure%201%20and%202/Pure%202/P2.1%20Algebraic%20Methods/Unit_1_Assessment?csf=1&web=1',
  10: 'https://wcibth.sharepoint.com/:f:/r/sites/Mathematics/Shared%20Documents/Maths%20Team%20Hub/4.%20Resources/C.%20Key%20Stage%205/Pure%201%20and%202/Pure%202/P2.2%20Coordinate%20Geometry%20in%20the%20%28x%2Cy%29%20Plane/Unit_2_Assessment?csf=1&web=1',
  11: 'https://wcibth.sharepoint.com/:f:/r/sites/Mathematics/Shared%20Documents/Maths%20Team%20Hub/4.%20Resources/C.%20Key%20Stage%205/Pure%201%20and%202/Pure%202/P2.3%20Exponentials%20and%20Logarithms/Unit_3_Assessment?csf=1&web=1',
  12: 'https://wcibth.sharepoint.com/:f:/r/sites/Mathematics/Shared%20Documents/Maths%20Team%20Hub/4.%20Resources/C.%20Key%20Stage%205/Pure%201%20and%202/Pure%202/P2.5%20Sequences%20and%20Series/Unit_5_Assessment?csf=1&web=1',
  13: 'https://wcibth.sharepoint.com/:f:/r/sites/Mathematics/Shared%20Documents/Maths%20Team%20Hub/4.%20Resources/C.%20Key%20Stage%205/Pure%201%20and%202/Pure%202/P2.6%20Trigonometric%20Identities%20and%20Equations/Unit_6_Assessment?csf=1&web=1',
};

// Units covering two chapters use the first chapter's assessment folder.
// The partner folders, if ever needed:
//   unit 2  .../Pure%201/P1.3%20Equations%20and%20Inequalities/Unit_3_Assessment
//   unit 7  .../Pure%202/P2.7%20Differentiation/Unit_7_Assessment
//   unit 8  .../Pure%202/P2.8%20Integration/Unit_8_Assessment
//   unit 11 .../Pure%202/P2.4%20The%20Binomial%20Expansion/Unit_4_Assessment
```

## Edit 2 — use the map in `folderBtn()`

Inside `function folderBtn(lesson, yg, set)` (around line 3995), find the assessment branch:

```js
    if(lesson.type === 'assessment'){
      return `<a href="${Y12_P12_ASSESSMENT_FOLDER}" target="_blank" rel="noopener noreferrer" class="res-btn assess-btn" title="Open Pure 1 &amp; 2 unit test folder">📋 Test</a>`;
    }
```

Replace it with:

```js
    if(lesson.type === 'assessment'){
      const testUrl = Y12_P12_ASSESSMENT_FOLDERS[lesson.unit];
      if(!testUrl) return '';
      return `<a href="${testUrl}" target="_blank" rel="noopener noreferrer" class="res-btn assess-btn" title="Open unit assessment folder">📋 Test</a>`;
    }
```

After these edits the name `Y12_P12_ASSESSMENT_FOLDER` (singular) must not appear anywhere in the file. Search for it and confirm there are zero matches.

## Test

1. Teacher View → Year 12 → **Ma1P12** → the `📋 Test` button on **Unit Test: P1.1. Algebraic Expressions** opens `Pure 1 / P1.1 Algebraic Expressions / Unit_1_Assessment`.
2. The `📋 Test` button on **Unit Test: P1.4 Graphs and Transformations** opens `Pure 1 / P1.4 Graphs and Transformations / Unit_4_Assessment` — note the folder is `Unit_4`, not `Unit_3`.
3. The `📋 Test` button on **Unit Test: P2.2 Coordinate Geometry in the (x,y) Plane** opens `Pure 2 / P2.2 Coordinate Geometry in the (x,y) Plane / Unit_2_Assessment`.
4. No `📋 Test` button anywhere still opens the shared `Pure Maths 1 and 2 Unit Tests` folder.
5. The `📂 Folder` buttons are unchanged and still open the chapter folders.
6. Year 7, 8, 9, the Y12 S1 and FM sets, and all Year 13 sets are unchanged.
