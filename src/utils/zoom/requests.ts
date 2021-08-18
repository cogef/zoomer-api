import { HttpStatus } from '../../handlers/api/helpers';
import { zoomRequest } from '../../services/zoom';
import { stripFracSec } from '../general';
import {
  ZoomMeeting,
  ZoomMeetingInstance,
  ZoomMeetingInstanceList,
  ZoomMeetingRecording,
  ZoomMeetingRequest,
  ZoomUser,
} from './types';
import { encodeUUID } from './utils';

export const getMeeting = async (meetingID: string) => {
  try {
    return await zoomRequest<ZoomMeeting>({
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

export const getUser = async (userID: string) => {
  try {
    return await zoomRequest<ZoomUser>({ path: `/users/${userID}` });
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

export const getPastMeeting = async (meetingUUID: string) => {
  try {
    // Double encoding is required when UUID begins with '/' or contains '//'
    // Ref: https://marketplace.zoom.us/docs/api-reference/zoom-api/meetings/pastmeetingdetails
    const cleanUUID = encodeUUID(meetingUUID);
    return await zoomRequest<ZoomMeetingInstance>({
      path: `/past_meetings/${cleanUUID}`,
    });
  } catch (err) {
    if (err.status === HttpStatus.NOT_FOUND) {
      return null;
    }
    throw err;
  }
};

export const getMeetingRecordings = async (meetingID: string) => {
  try {
    return await zoomRequest<ZoomMeetingRecording>({
      path: `/meetings/${meetingID}/recordings`,
    });
  } catch (err) {
    if (err.status === HttpStatus.NOT_FOUND) {
      return null;
    }
    throw err;
  }
};

export const getPastMeetingInstances = async (meetingID: string) => {
  try {
    return await zoomRequest<ZoomMeetingInstanceList>({
      path: `/past_meetings/${meetingID}/instances`,
    });
  } catch (err) {
    if (err.status === HttpStatus.NOT_FOUND) {
      return null;
    }
    throw err;
  }
};
