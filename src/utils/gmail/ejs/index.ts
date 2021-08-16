/// <reference path='./areacodes.d.ts'/>

import AreaCodes, { AreaCodeData } from 'areacodes';
import ejs from 'ejs';
import path from 'path';
import { toEasternDTString } from '../../general';

const getFullPath = (relPath: string) => path.join(__dirname, relPath);

export const renderMeetingCreated = async (params: Params) => {
  // Add State to each Dial In Number
  const _dialIns = (params.dialIns || []).reduce((acc, di) => {
    acc[di.number] = getAreaCodeState(di.number);
    return acc;
  }, {} as Record<string, Promise<string>>);

  const dialIns = [];
  for (let { number, country } of params.dialIns) {
    dialIns.push({ number, country, state: await _dialIns[number] });
  }

  const datetime = toEasternDTString(params.startTime);

  return ejs.renderFile(getFullPath('./meetingCreated.ejs'), { ...params, datetime, dialIns });
};

const getAreaCodeState = async (tel: string) => {
  tel = tel.replace(/\+1\-?/, '').trim();
  const ac = new AreaCodes();
  const data = await new Promise<AreaCodeData>(resolve => {
    ac.get(tel, (err, data) => resolve(data));
  });
  return data.stateCode;
};

type Params = {
  host: string;
  hostJoinKey: string;
  topic: string;
  agenda: string;
  reccurrence?: string;
  meetingID: string | number;
  password: string;
  startTime: string;
  joinURL: string;
  dialIns: { number: string; country: string }[];
};
