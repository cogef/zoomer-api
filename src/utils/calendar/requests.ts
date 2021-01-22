import { calendar_v3 } from 'googleapis';
import { calendar } from '../../services/googleapis';

/** Returns Zoom calendars sorted by number */
export const getZoomCals = async () => {
  const { data } = await calendar.calendarList.list({ minAccessRole: 'owner' });
  const cals = (data.items?.filter(isZoomCal) || []).map(formatCal).sort(calSort);
  return cals;
};

const isZoomCal = (cal: calendar_v3.Schema$CalendarListEntry) => {
  if (cal.summary) {
    return normalizeCalName(cal.summary).startsWith('zoom-');
  }
  return false;
};

const formatCal = (cal: calendar_v3.Schema$CalendarListEntry): ZoomCal => {
  const name = normalizeCalName(cal.summary!);
  const zoomNum = parseInt(name.split('-')[1], 10);
  return {
    id: cal.id!,
    zoomNum,
  };
};

const calSort = (a: ZoomCal, b: ZoomCal) => {
  return a.zoomNum > b.zoomNum ? 1 : -1;
};

const normalizeCalName = (name: string) => name.toLowerCase().replace(/ +/g, '');

/** Finds the first calendar that is free within the given range, using the order listed in `cals` */
export const findFirstFree = async (timeMin: string, timeMax: string, cals: ZoomCal[]) => {
  const { data } = await calendar.freebusy.query({
    requestBody: { timeMin, timeMax, items: cals.map(cal => ({ id: cal.id })) },
  });

  const calendars = data.calendars!;

  const freeCal = cals.find(cal => calendars[cal.id].busy?.length === 0);
  return freeCal;
};

export const createEvent = async (cal: ZoomCal, event: EventReq) => {
  const rrule = event.recurrence ? `RRULE:${event.recurrence}` : null;
  try {
    const res = await calendar.events.insert({
      calendarId: cal.id,
      requestBody: {
        summary: event.title,
        description: event.description,
        start: { dateTime: event.start, timeZone: utcTzDbName },
        end: { dateTime: event.end, timeZone: utcTzDbName },
        ...(rrule ? { recurrence: [rrule] } : {}),
      },
    });
    console.log({ eventRes: res });
    return [null, res.data.id!] as const;
  } catch (err) {
    return [err, null] as const;
  }
};

/** A TZ database name that uses UTC time */
const utcTzDbName = 'Africa/Abidjan';

type ZoomCal = { id: string; zoomNum: number };

type EventReq = { title: string; description: string; start: string; end: string; recurrence?: string };
