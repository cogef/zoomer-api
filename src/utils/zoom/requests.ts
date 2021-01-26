import { zoomRequest } from '../../services/zoom';
import { ZoomMeeting, ZoomMeetingRequest } from './types';

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
    body: meeting,
  });
};

export const cancelMeeting = (meetingID: string) => {
  return zoomRequest({
    path: `/meetings/${meetingID}`,
    method: 'DELETE',
    noResponse: true,
  });
};

export const getUser = (userID: string) => {
  return zoomRequest({ path: `/users/${userID}` });
};
