import { HttpStatus } from '../../handlers/api/helpers';
import { zoomRequest } from '../../services/zoom';
import { stripFracSec } from '../general';
import { ZoomMeeting, ZoomMeetingRecording, ZoomMeetingRequest, ZoomUser } from './types';

export const getMeeting = (meetingID: string) => {
  try {
    return zoomRequest<ZoomMeeting>({
      path: `/meetings/${meetingID}`,
    });
  } catch (err) {
    if (err.status === HttpStatus.NOT_FOUND) {
      return null;
    }
    throw err;
  }
};

export const scheduleMeeting = (userID: string, meeting: ZoomMeetingRequest) => {
  return zoomRequest<ZoomMeeting>({
    path: `/users/${userID}/meetings`,
    method: 'POST',
    body: cleanMeetingReq(meeting),
  });
};

export const updateMeeting = (meetingID: string, meeting: ZoomMeetingRequest) => {
  return zoomRequest<void>({
    path: `/meetings/${meetingID}`,
    method: 'PATCH',
    body: cleanMeetingReq(meeting),
  });
};

export const cancelMeeting = (meetingID: string) => {
  return zoomRequest<void>({
    path: `/meetings/${meetingID}?schedule_for_reminder=false`,
    method: 'DELETE',
  });
};

export const getUser = (userID: string) => {
  try {
    return zoomRequest<ZoomUser>({ path: `/users/${userID}` });
  } catch (err) {
    if (err.status === HttpStatus.NOT_FOUND) {
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
    req.recurrence.end_date_time = stripFracSec(req.recurrence.end_date_time);
  }
  return req;
};

export const getMeetingRecordings = (meetingID: string) => {
  const instances = zoomRequest<any>({
    path: `/past_meetings/${meetingID}/instances`,
  }).catch(err => {
    if (err.status === HttpStatus.NOT_FOUND) {
      return null;
    }
    throw err;
  });

  return zoomRequest<ZoomMeetingRecording>({
    path: `/meetings/${meetingID}/recordings`,
  }).catch(err => {
    if (err.status === HttpStatus.NOT_FOUND) {
      return null;
    }
    throw err;
  });
};
