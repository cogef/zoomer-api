require('dotenv/config');
import { addDays } from 'date-fns';
import { adminTest } from './directoryTest';
import { dbTest } from './dbTest';
import { freebusyTest } from './freebusyTest';
import { fullTest } from './fullTest';
import { rruleTest } from './rruleTest';
import { zoomTest } from './zoomTest';

// Tests
fullTest();
//rruleTest();
//freebusyTest();
//adminTest();
//zoomTest();
//dbTest();
