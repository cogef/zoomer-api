import { Frequency, Options, RRule, Weekday } from 'rrule';
import { ZoomMeetingRequest } from '../zoom';

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
    rruleOpts.dtstart = new Date(dtStart);
  }

  if (recur.end_date_time) {
    rruleOpts.until = new Date(recur.end_date_time);
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

type Recurrence = Required<ZoomMeetingRequest>['recurrence'];
