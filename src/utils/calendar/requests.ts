import { addMinutes } from 'date-fns';
import { rrulestr } from 'rrule';
import { calendar } from '../../services/googleapis';
import { allToUTC } from './recurrence';

/** Finds the first calendar that is free within the given range, using the order listed in `cals` */
export const findFirstFree = async (timeMin: string, durationMins: number, cals: ZoomCal[], rrule?: string) => {
  const dates = rrule ? allToUTC(rrulestr(rrule)) : [new Date(timeMin)];
  const calItems = cals.map(cal => ({ id: cal.calendarID }));
  const busyCals = new Set();

  await Promise.all(
    dates.map(async date => {
      const dtStart = date.toISOString();
      const dtEnd = addMinutes(date, durationMins).toISOString();

      const { data } = await calendar.freebusy.query({
        requestBody: { timeMin: dtStart, timeMax: dtEnd, items: calItems },
      });

      const calResults = data.calendars!;

      cals.forEach(cal => {
        if (calResults[cal.calendarID].busy?.length) {
          busyCals.add(cal.calendarID);
        }
      });
    })
  );

  const freeIdx = cals.findIndex(cal => !busyCals.has(cal.calendarID));
  return freeIdx;
};

export const createEvent = async (calendarID: string, event: EventReq) => {
  const rrule = event.recurrence;
  const res = await calendar.events.insert({
    calendarId: calendarID,
    requestBody: {
      summary: event.title,
      description: event.description,
      start: { dateTime: event.start, timeZone: timezone },
      end: { dateTime: event.end, timeZone: timezone },
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

const timezone = 'America/New_York';

type ZoomCal = { calendarID: string; sequence: number };

type EventReq = { title: string; description: string; start: string; end: string; recurrence?: string };
