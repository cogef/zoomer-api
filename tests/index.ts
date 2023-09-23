require('dotenv/config');
import { zoomTest } from './zoomTest';
import { initGAPIs } from '../src/services/googleapis';

// Tests
initGAPIs().then(
  () =>
    //
    //fullTest()
    //rruleTest()
    //calTest()
    //adminTest()
    //gmailTest()
    // testGetZoomRecordings()
    //freebusyTest()
    //adminTest()
    zoomTest()
  //dbTest()
);
