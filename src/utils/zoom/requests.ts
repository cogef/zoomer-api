import { zoomRequest } from '../../services/zoom';
import { ZoomMeetingRequest } from './types';

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
