import { zoomRequest } from '../../services/zoom';
import { stripFracSec } from '../general';
import { ZoomMeeting, ZoomMeetingRequest, ZoomUser } from './types';

export const getMeeting = (meetingID: string) => {
  try {
    return zoomRequest({
      path: `/meetings/${meetingID}`,
    }) as Promise<ZoomMeeting>;
  } catch (err) {
    if (err.status === 404) {
      return null;
    }
    throw err;
  }
};

export const scheduleMeeting = (userID: string, meeting: ZoomMeetingRequest) => {
  return zoomRequest({
    path: `/users/${userID}/meetings`,
    method: 'POST',
    body: cleanMeetingReq(meeting),
  }) as Promise<ZoomMeeting>;
};

export const cancelMeeting = (meetingID: string) => {
  return zoomRequest({
    path: `/meetings/${meetingID}`,
    method: 'DELETE',
    noResponse: true,
  });
};

export const getUser = (userID: string) => {
  try {
    return zoomRequest({ path: `/users/${userID}` }) as Promise<ZoomUser>;
  } catch (err) {
    if (err.status === 404) {
      return null;
    }
    throw err;
  }
};

const cleanMeetingReq = (meetingReq: ZoomMeetingRequest) => {
  const req = JSON.parse(JSON.stringify(meetingReq)) as ZoomMeetingRequest;
  // Zoom bugs out when given fractional seconds
  req.start_time = stripFracSec(req.start_time);
  if (req.recurrence?.end_date_time) {
    const end = new Date(req.recurrence.end_date_time);
    end.setHours(23, 59);
    req.recurrence.end_date_time = stripFracSec(end.toISOString());
  }
  return req;
};
