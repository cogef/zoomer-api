import { calendar } from '../../services/googleapis';

/** Finds the first calendar that is free within the given range, using the order listed in `cals` */
export const findFirstFree = async (timeMin: string, timeMax: string, cals: ZoomCal[]) => {
  const { data } = await calendar.freebusy.query({
    requestBody: { timeMin, timeMax, items: cals.map(cal => ({ id: cal.calendarID })) },
  });

  const calendars = data.calendars!;

  const freeIdx = cals.findIndex(cal => calendars[cal.calendarID].busy?.length === 0);
  return freeIdx;
};

export const createEvent = async (calendarID: string, event: EventReq) => {
  const rrule = event.recurrence ? `RRULE:${event.recurrence}` : null;
  const res = await calendar.events.insert({
    calendarId: calendarID,
    requestBody: {
      summary: event.title,
      description: event.description,
      start: { dateTime: event.start, timeZone: utcTzDbName },
      end: { dateTime: event.end, timeZone: utcTzDbName },
      ...(rrule ? { recurrence: [rrule] } : {}),
    },
  });
  return res.data.id!;
};

export const deleteEvent = async (calendarID: string, eventID: string) => {
  const res = await calendar.events.delete({
    calendarId: calendarID,
    eventId: eventID,
  });
  return res.data;
};

/** A TZ database name that uses UTC time */
const utcTzDbName = 'Africa/Abidjan';

type ZoomCal = { calendarID: string; sequence: number };

type EventReq = { title: string; description: string; start: string; end: string; recurrence?: string };
