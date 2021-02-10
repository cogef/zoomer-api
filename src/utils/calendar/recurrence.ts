import { Frequency, Options, RRule, Weekday } from 'rrule';
import { ZoomMeetingRequest } from '../zoom';
import { DateTime } from 'luxon';

/**
 * Convert Zoom recurrence properties into RFC5545 recurrence rules,
 * required by Google's Calendar API
 *
 * http://tools.ietf.org/html/rfc5545#section-3.8.5 */
export const zoomToRFCRecurrence = (recur: Recurrence, dtStart?: string) => {
  const isMonthyByDay = Boolean(recur.monthly_day);

  const rruleOpts: Partial<Options> = {
    wkst: RRule.SU,
    freq: rfcFreq[recur.type],
    interval: recur.repeat_interval,
  };

  if (dtStart) {
    rruleOpts.dtstart = rruleDate(dtStart);
  }

  if (recur.end_date_time) {
    rruleOpts.until = rruleDate(recur.end_date_time);
  } else {
    rruleOpts.count = recur.end_times;
  }

  switch (recur.type) {
    case 2: // weekly
      rruleOpts.byweekday = recur.weekly_days!.split(',').map(d => rfcWeekDay[Number(d.trim())]);
      break;
    case 3: // monthly
      if (isMonthyByDay) {
        rruleOpts.bymonthday = recur.monthly_day;
      } else {
        rruleOpts.byweekday = rfcWeekDay[recur.monthly_week_day!].nth(recur.monthly_week!);
      }
  }

  return new RRule(rruleOpts);
};

/** Returns rrule occurrences as true UTC dates */
export const allToUTC = (rrule: RRule) => {
  return rrule.all().map(d => DateTime.fromJSDate(d).toUTC().setZone(timezone, { keepLocalTime: true }).toJSDate());
};

const rfcFreq: Record<Recurrence['type'], Frequency> = {
  1: RRule.DAILY,
  2: RRule.WEEKLY,
  3: RRule.MONTHLY,
};

const rfcWeekDay: Record<number, Weekday> = {
  1: RRule.SU,
  2: RRule.MO,
  3: RRule.TU,
  4: RRule.WE,
  5: RRule.TH,
  6: RRule.FR,
  7: RRule.SA,
};

// RRule wants you to use a +0 offset date with the local time
const rruleDate = (dt: string) => {
  const date = DateTime.fromISO(dt).setZone(timezone);
  const year = date.year,
    month = date.month - 1,
    day = date.day,
    hours = date.hour,
    mins = date.minute;
  return new Date(Date.UTC(year, month, day, hours, mins, 0));
};

const timezone = 'America/New_York';

type Recurrence = Required<ZoomMeetingRequest>['recurrence'];
