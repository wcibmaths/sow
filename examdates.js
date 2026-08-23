/* ══════════════════════════════════════════════════════════════════
   WCIB Maths — External examination dates
   Pearson Edexcel International (International Advanced Level + IGCSE)

   Sources (official Pearson timetables):
     IAL   October 2026  — final       ial-october2026-final.pdf
     IGCSE November 2026 — final       intgcse-nov-2026-final.pdf
     IAL   January 2027  — final       ial-january-2027-final.pdf
     IAL   Summer 2027   — PROVISIONAL ial-summer-2027-prov.pdf
     IGCSE Summer 2027   — PROVISIONAL int-gcse-summer-2027-prov.pdf

   Summer 2027 entries are PROVISIONAL and will be reconfirmed by Pearson.
   Re-check before publishing them to students or parents.

   Row shape:
     { date:'YYYY-MM-DD', series:'oct-nov'|'jan-feb'|'may-june',
       exam:'…', paper:'…', code:'WMA11', session:'AM'|'PM', yg:'Year 12' }
   ══════════════════════════════════════════════════════════════════ */

const EXTERNAL_EXAM_SERIES = [
  { key: 'jan-feb',  label: 'January',          startMonth: 0, endMonth: 1  },
  { key: 'may-june', label: 'May/June',         startMonth: 4, endMonth: 5  },
  { key: 'oct-nov',  label: 'October/November', startMonth: 9, endMonth: 10 },
];

const EXTERNAL_EXAMS = [

  // ── OCTOBER 2026 · IAL (final) ────────────────────────────────────
  // NOTE: Further Pure (FP1/FP2/FP3), D1, S3 and M3 are NOT offered in
  // the October series. Only P1–P4, M1, M2, S1 and S2 are available.
  {date:'2026-10-09', series:'oct-nov', exam:'IAL Mathematics', paper:'P1 Pure Mathematics 1',   code:'WMA11', session:'AM', yg:'Year 12 P1/P2'},
  {date:'2026-10-13', series:'oct-nov', exam:'IAL Mathematics', paper:'M1 Mechanics 1',          code:'WME01', session:'PM', yg:'Year 12 FM M1 · Year 13 M1'},
  {date:'2026-10-15', series:'oct-nov', exam:'IAL Mathematics', paper:'P2 Pure Mathematics 2',   code:'WMA12', session:'AM', yg:'Year 12 P1/P2'},
  {date:'2026-10-19', series:'oct-nov', exam:'IAL Mathematics', paper:'S1 Statistics 1',         code:'WST01', session:'AM', yg:'Year 12 S1'},
  {date:'2026-10-21', series:'oct-nov', exam:'IAL Mathematics', paper:'P3 Pure Mathematics 3',   code:'WMA13', session:'PM', yg:'Year 13 P3/P4'},
  {date:'2026-10-22', series:'oct-nov', exam:'IAL Mathematics', paper:'M2 Mechanics 2',          code:'WME02', session:'AM', yg:'Year 13 FM M2'},
  {date:'2026-10-26', series:'oct-nov', exam:'IAL Mathematics', paper:'S2 Statistics 2',         code:'WST02', session:'AM', yg:'Year 13 FM S2/S3'},
  {date:'2026-10-28', series:'oct-nov', exam:'IAL Mathematics', paper:'P4 Pure Mathematics 4',   code:'WMA14', session:'PM', yg:'Year 13 P3/P4'},

  // ── NOVEMBER 2026 · IGCSE (final) ─────────────────────────────────
  {date:'2026-11-04', series:'oct-nov', exam:'IGCSE Mathematics A', paper:'Paper 1H (Higher)',   code:'4MA1',  session:'AM', yg:'Year 11'},
  {date:'2026-11-06', series:'oct-nov', exam:'IGCSE Mathematics A', paper:'Paper 2H (Higher)',   code:'4MA1',  session:'AM', yg:'Year 11'},

  // ── JANUARY 2027 · IAL (final) ────────────────────────────────────
  {date:'2027-01-08', series:'jan-feb', exam:'IAL Mathematics', paper:'P1 Pure Mathematics 1',   code:'WMA11', session:'AM', yg:'Year 12 P1/P2'},
  {date:'2027-01-12', series:'jan-feb', exam:'IAL Mathematics', paper:'S1 Statistics 1',         code:'WST01', session:'PM', yg:'Year 12 S1'},
  {date:'2027-01-13', series:'jan-feb', exam:'IAL Mathematics', paper:'P2 Pure Mathematics 2',   code:'WMA12', session:'PM', yg:'Year 12 P1/P2'},
  {date:'2027-01-14', series:'jan-feb', exam:'IAL Mathematics', paper:'M1 Mechanics 1',          code:'WME01', session:'AM', yg:'Year 12 FM M1 · Year 13 M1'},
  {date:'2027-01-14', series:'jan-feb', exam:'IAL Further Maths', paper:'FP1 Further Pure 1',    code:'WFM01', session:'PM', yg:'Year 13 FM FP1/FP2'},
  {date:'2027-01-15', series:'jan-feb', exam:'IAL Mathematics', paper:'P3 Pure Mathematics 3',   code:'WMA13', session:'PM', yg:'Year 13 P3/P4'},
  {date:'2027-01-18', series:'jan-feb', exam:'IAL Mathematics', paper:'S2 Statistics 2',         code:'WST02', session:'PM', yg:'Year 13 FM S2/S3'},
  {date:'2027-01-19', series:'jan-feb', exam:'IAL Mathematics', paper:'P4 Pure Mathematics 4',   code:'WMA14', session:'AM', yg:'Year 13 P3/P4'},
  {date:'2027-01-19', series:'jan-feb', exam:'IAL Mathematics', paper:'D1 Decision Mathematics 1',code:'WDM11',session:'PM', yg:'Year 13 D1'},
  {date:'2027-01-20', series:'jan-feb', exam:'IAL Further Maths', paper:'FP2 Further Pure 2',    code:'WFM02', session:'AM', yg:'Year 13 FM FP1/FP2'},
  {date:'2027-01-20', series:'jan-feb', exam:'IAL Mathematics', paper:'M2 Mechanics 2',          code:'WME02', session:'PM', yg:'Year 13 FM M2'},
  {date:'2027-01-21', series:'jan-feb', exam:'IAL Further Maths', paper:'FP3 Further Pure 3',    code:'WFM03', session:'PM', yg:'Year 13 FM'},
  {date:'2027-01-22', series:'jan-feb', exam:'IAL Mathematics', paper:'S3 Statistics 3',         code:'WST03', session:'PM', yg:'Year 13 FM S2/S3'},
  {date:'2027-01-25', series:'jan-feb', exam:'IAL Mathematics', paper:'M3 Mechanics 3',          code:'WME03', session:'PM', yg:'Year 13 FM'},

  // ── SUMMER 2027 · IAL (PROVISIONAL) ───────────────────────────────
  {date:'2027-05-06', series:'may-june', exam:'IAL Mathematics', paper:'P1 Pure Mathematics 1',  code:'WMA11', session:'PM', yg:'Year 12 P1/P2'},
  {date:'2027-05-07', series:'may-june', exam:'IAL Mathematics', paper:'S1 Statistics 1',        code:'WST01', session:'PM', yg:'Year 12 S1'},
  {date:'2027-05-11', series:'may-june', exam:'IAL Mathematics', paper:'P2 Pure Mathematics 2',  code:'WMA12', session:'PM', yg:'Year 12 P1/P2'},
  {date:'2027-05-13', series:'may-june', exam:'IAL Mathematics', paper:'M1 Mechanics 1',         code:'WME01', session:'PM', yg:'Year 12 FM M1 · Year 13 M1'},
  {date:'2027-05-25', series:'may-june', exam:'IAL Mathematics', paper:'P3 Pure Mathematics 3',  code:'WMA13', session:'PM', yg:'Year 13 P3/P4'},
  {date:'2027-05-27', series:'may-june', exam:'IAL Further Maths', paper:'FP1 Further Pure 1',   code:'WFM01', session:'PM', yg:'Year 13 FM FP1/FP2'},
  {date:'2027-06-01', series:'may-june', exam:'IAL Mathematics', paper:'D1 Decision Mathematics 1',code:'WDM11',session:'PM', yg:'Year 13 D1'},
  {date:'2027-06-02', series:'may-june', exam:'IAL Mathematics', paper:'S2 Statistics 2',        code:'WST02', session:'PM', yg:'Year 13 FM S2/S3'},
  {date:'2027-06-03', series:'may-june', exam:'IAL Mathematics', paper:'M2 Mechanics 2',         code:'WME02', session:'PM', yg:'Year 13 FM M2'},
  {date:'2027-06-04', series:'may-june', exam:'IAL Further Maths', paper:'FP2 Further Pure 2',   code:'WFM02', session:'PM', yg:'Year 13 FM FP1/FP2'},
  {date:'2027-06-08', series:'may-june', exam:'IAL Mathematics', paper:'P4 Pure Mathematics 4',  code:'WMA14', session:'PM', yg:'Year 13 P3/P4'},
  {date:'2027-06-09', series:'may-june', exam:'IAL Mathematics', paper:'S3 Statistics 3',        code:'WST03', session:'PM', yg:'Year 13 FM S2/S3'},
  {date:'2027-06-10', series:'may-june', exam:'IAL Mathematics', paper:'M3 Mechanics 3',         code:'WME03', session:'PM', yg:'Year 13 FM'},
  {date:'2027-06-11', series:'may-june', exam:'IAL Further Maths', paper:'FP3 Further Pure 3',   code:'WFM03', session:'AM', yg:'Year 13 FM'},

  // ── SUMMER 2027 · IGCSE (PROVISIONAL) ─────────────────────────────
  {date:'2027-05-14', series:'may-june', exam:'IGCSE Mathematics A', paper:'Paper 1H (Higher)',  code:'4MA1',  session:'AM', yg:'Year 11'},
  {date:'2027-05-27', series:'may-june', exam:'IGCSE Mathematics A', paper:'Paper 2H (Higher)',  code:'4MA1',  session:'AM', yg:'Year 11'},
];
