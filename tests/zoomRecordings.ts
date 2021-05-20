import { getMeetingRecordings } from '../src/utils/zoom';
import util from 'util';

export const testGetZoomRecordings = async () => {
  const res = await getMeetingRecordings('98881510186');
  console.log(util.inspect({ res }, false, Infinity));
};
