require('dotenv/config');
import { addDays } from 'date-fns';
import { dbTest } from './dbTest';
import { fullTest } from './fullTest';
import { zoomTest } from './zoomTest';

// Tests
fullTest();
//zoomTest();
//dbTest();
