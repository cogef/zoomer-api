require('dotenv/config');
import { addDays } from 'date-fns';
//import { adminTest } from './directoryTest'
import { dbTest } from './dbTest';
import { freebusyTest } from './freebusyTest';
import { fullTest } from './fullTest';
import { rruleTest } from './rruleTest';
import { zoomTest } from './zoomTest';
import { calTest } from './calendarTest';
import { adminTest } from './isAdmin';

// Tests
//fullTest();
//rruleTest();
//calTest();
adminTest();
//freebusyTest();
//adminTest();
//zoomTest();
//dbTest();
