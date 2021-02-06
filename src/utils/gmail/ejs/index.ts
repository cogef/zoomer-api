import ejs from 'ejs';
import path from 'path';

const getFullPath = (relPath: string) => path.join(__dirname, relPath);

export const renderMeetingCreated = (params: Params) => {
  return ejs.renderFile(getFullPath('./meetingCreated.ejs'), params);
};

type Params = {
  host: string;
  hostJoinKey: string;
  topic: string;
  agenda: string;
  reccurrence: string;
  meetingID: string | number;
  password: string;
  datetime: string;
};
