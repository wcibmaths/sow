'use strict';

// Keep the external timetable separate from the main dashboard so dates can
// be updated without rewriting the large single-file application.
const EXTERNAL_EXAM_SERIES = [
  {key:'jan-feb',  label:'January',          startMonth:0, endMonth:1},
  {key:'may-june', label:'May/June',         startMonth:4, endMonth:5},
  {key:'oct-nov',  label:'October/November', startMonth:9, endMonth:10},
];

const EXTERNAL_EXAMS = [
  // Confirmed Pearson IAL January 2027 timetable.
  {date:'2027-01-08', series:'jan-feb', exam:'IAL Mathematics',   code:'WMA11', paper:'P1 Pure Mathematics 1',       yg:'Year 12', session:'AM'},
  {date:'2027-01-12', series:'jan-feb', exam:'IAL Mathematics',   code:'WST01', paper:'S1 Statistics 1',              yg:'Year 12', session:'PM'},
  {date:'2027-01-13', series:'jan-feb', exam:'IAL Mathematics',   code:'WMA12', paper:'P2 Pure Mathematics 2',       yg:'Year 12', session:'PM'},
  {date:'2027-01-14', series:'jan-feb', exam:'IAL Mathematics',   code:'WME01', paper:'M1 Mechanics 1',               yg:'Year 12', session:'AM'},
  {date:'2027-01-14', series:'jan-feb', exam:'IAL Further Maths', code:'WFM01', paper:'FP1 Further Pure 1',           yg:'Year 13', session:'PM'},
  {date:'2027-01-15', series:'jan-feb', exam:'IAL Mathematics',   code:'WMA13', paper:'P3 Pure Mathematics 3',       yg:'Year 13', session:'PM'},
  {date:'2027-01-18', series:'jan-feb', exam:'IAL Mathematics',   code:'WST02', paper:'S2 Statistics 2',              yg:'Year 13', session:'PM'},
  {date:'2027-01-19', series:'jan-feb', exam:'IAL Mathematics',   code:'WMA14', paper:'P4 Pure Mathematics 4',       yg:'Year 13', session:'AM'},
  {date:'2027-01-19', series:'jan-feb', exam:'IAL Mathematics',   code:'WDM11', paper:'D1 Decision Mathematics 1',    yg:'Year 13', session:'AM'},
  {date:'2027-01-20', series:'jan-feb', exam:'IAL Further Maths', code:'WFM02', paper:'FP2 Further Pure 2',           yg:'Year 13', session:'AM'},
  {date:'2027-01-20', series:'jan-feb', exam:'IAL Mathematics',   code:'WME02', paper:'M2 Mechanics 2',               yg:'Year 13', session:'PM'},
  {date:'2027-01-21', series:'jan-feb', exam:'IAL Further Maths', code:'WFM03', paper:'FP3 Further Pure 3',           yg:'Year 13', session:'PM'},
  {date:'2027-01-22', series:'jan-feb', exam:'IAL Mathematics',   code:'WST03', paper:'S3 Statistics 3',              yg:'Year 13', session:'PM'},
  {date:'2027-01-25', series:'jan-feb', exam:'IAL Mathematics',   code:'WME03', paper:'M3 Mechanics 3',               yg:'Year 13', session:'PM'},

  // Existing provisional Summer 2027 entries.
  {date:'2027-05-17', series:'may-june', exam:'IGCSE Mathematics A', code:'4MA1',  paper:'Paper 1 (Higher)',             yg:'Year 11', session:''},
  {date:'2027-05-19', series:'may-june', exam:'IAL Mathematics',     code:'WMA11', paper:'P1 Pure Mathematics 1',         yg:'Year 12', session:''},
  {date:'2027-05-21', series:'may-june', exam:'IAL Mathematics',     code:'WMA13', paper:'P3 Pure Mathematics 3',         yg:'Year 13', session:''},
  {date:'2027-05-25', series:'may-june', exam:'IAL Further Maths',   code:'WFM01', paper:'FP1 Further Pure 1',             yg:'Year 13', session:''},
  {date:'2027-06-04', series:'may-june', exam:'IGCSE Mathematics A', code:'4MA1',  paper:'Paper 2 (Higher)',             yg:'Year 11', session:''},
  {date:'2027-06-07', series:'may-june', exam:'IAL Mathematics',     code:'WMA12', paper:'P2 Pure Mathematics 2',         yg:'Year 12', session:''},
  {date:'2027-06-09', series:'may-june', exam:'IAL Mathematics',     code:'WST01', paper:'S1 Statistics 1',                yg:'Year 12', session:''},
  {date:'2027-06-11', series:'may-june', exam:'IAL Mathematics',     code:'WME01', paper:'M1 Mechanics 1',                 yg:'Year 13', session:''},
  {date:'2027-06-14', series:'may-june', exam:'IAL Mathematics',     code:'WMA14', paper:'P4 Pure Mathematics 4',         yg:'Year 13', session:''},
  {date:'2027-06-16', series:'may-june', exam:'IAL Further Maths',   code:'WFM02', paper:'FP2 Further Pure 2',             yg:'Year 13', session:''},
];