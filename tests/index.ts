require('dotenv/config');
//import { adminTest } from './directoryTest'
import { dbTest } from './dbTest';
import { freebusyTest } from './freebusyTest';
import { fullTest } from './fullTest';
import { rruleTest } from './rruleTest';
import { zoomTest } from './zoomTest';
import { calTest } from './calendarTest';
import { adminTest } from './isAdmin';
import { initGAPIs } from '../src/services/googleapis';
import { gmailTest } from './gmailTest';

// Tests
initGAPIs().then(
  () => fullTest()
  //rruleTest()
  //calTest()
  //adminTest()
  //gmailTest()
  //freebusyTest()
  //adminTest()
  //zoomTest()
  //dbTest()
);
