import { deleteEvent } from '../../../utils/calendar';
import { getEvent, getZoomAccount, removeEvent } from '../../../utils/db';
import { cancelMeeting } from '../../../utils/zoom/requests';
import { HandlerResponse } from '../types';

export const deleteMeeting = async (meetingID: string): Promise<HandlerResponse> => {
  const dbMeeting = await getEvent(meetingID);
  if (!dbMeeting) {
    return { success: false, error: 'meeting not found' };
  }

  const zoomAccount = await getZoomAccount(dbMeeting.zoomAccount);
  if (!zoomAccount) {
    return { success: false, error: 'zoom account not found' };
  }

  await cancelMeeting(meetingID);
  await deleteEvent(zoomAccount.calendarID, dbMeeting.calendarEvents.zoomEventID);
  //await deleteEvent(zoomAccount.calendarID, dbMeeting.calendarEvents.leadershipEventID);
  await removeEvent(meetingID);

  return { success: true, data: null };
};
