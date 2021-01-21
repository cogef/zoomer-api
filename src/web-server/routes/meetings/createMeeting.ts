import { addMinutes } from 'date-fns';
import { getZoomCals, findFirstFree, createEvent } from '../../../utils/calendar';
import { zoomToRFCRecurrence } from '../../../utils/calendar/recurrence';
import { storeEvent } from '../../../utils/db';
import { ZoomerMeetingRequest } from '../../../utils/zoom';
import { HandlerResponse } from '../types';

export const createMeeting = async (meetingReq: ZoomerMeetingRequest): Promise<HandlerResponse> => {
  const startDT = meetingReq.start_time;
  const endDT = addMinutes(new Date(startDT), meetingReq.duration).toISOString();
  const calendars = await getZoomCals();
  const freeCal = await findFirstFree(startDT, endDT, calendars);

  if (freeCal) {
    const eventReq = {
      title: meetingReq.topic,
      description: meetingReq.agenda,
      start: startDT,
      end: endDT,
      recurrence: meetingReq.recurrence ? zoomToRFCRecurrence(meetingReq.recurrence) : undefined,
    };

    const [zoomCalErr, zoomCalEventID] = await createEvent(freeCal, eventReq);
    //const [leaderCalErr, leaderCalEventID] = await createEvent(freeCal, eventReq);
    const [leaderCalErr, leaderCalEventID] = [null as any, '~' + Math.random()];

    if (zoomCalErr) {
      throw zoomCalErr.errors[0];
    }

    if (leaderCalErr) {
      throw leaderCalErr.errors[0];
    }

    // Create Zoom meeting
    const meetingID = '~' + Math.random(); // createZoomMeeting

    await storeEvent({
      zoomAccount: freeCal.zoomNum,
      title: meetingReq.topic,
      description: meetingReq.agenda,
      startDate: new Date(startDT),
      endDate: new Date(endDT),
      meetingID,
      host: {
        ...meetingReq.host,
        ministry: meetingReq.ministry,
      },
      calendarEvents: {
        zoomEventID: zoomCalEventID!,
        leadershipEventID: leaderCalEventID!,
      },
    });

    console.log({ zCalEventID: zoomCalEventID });
    return { success: true, data: { meetingID } };
  }

  console.log('No calendars free');
  return { success: false, error: 'no calendars free' };
};
