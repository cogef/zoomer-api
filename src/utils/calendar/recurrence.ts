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

/*
export const zoomToRFCRecurrence1 = (recur: Recurrence, dtStart?: string): string => {
  const rfcEnd = recur.end_times === undefined ? rfcEndDate(recur.end_date_time) : rfcOccurrences(recur.end_times);
  const options = [rfcFreq(recur.type), rfcInterval(recur.repeat_interval), rfcEnd];
  const isMonthyByDay = 'monthly_day' in recur;
  let rrule = '';

  if (dtStart) {
    rrule += rfcStartDate(dtStart) + '\n';
  }

  rrule += 'RRULE:';

  switch (recur.type) {
    case 1: // daily
      rrule += options.join(';');
      break;
    case 2: // weekly
      rrule += [...options, rfcByWkDays(recur.weekly_days)].join(';');
      break;
    case 3: // monthly
      const rfcMonthly = isMonthyByDay
        ? rfcByMnthDay(recur.monthly_day)
        : rfcMnthByWkDay(recur.monthly_week, recur.monthly_week_day);
      rrule += [...options, rfcMonthly].join(';');
  }

  return rrule;
};

const rfcFreq = (freq: Recurrence['type']) => {
  const map = {
    1: 'DAILY',
    2: 'WEEKLY',
    3: 'MONTHLY',
  };
  return `FREQ=${map[freq]}`;
};

const rfcInterval = (interval: Recurrence['repeat_interval']) => {
  return `INTERVAL=${interval}`;
};

const rfcEndDate = (date: Recurrence['end_date_time']) => {
  return `UNTIL=${formatRfcDate(date!)}`;
};

const rfcOccurrences = (occurs: Recurrence['end_times']) => {
  return `COUNT=${occurs}`;
};

const rfcByWkDays = (daysStr: Recurrence['weekly_days']) => {
  const days =
    daysStr &&
    daysStr
      .split(',')
      .map(d => weekDays[Number(d.trim())])
      .join(',');
  return `BYDAY=${days}`;
};

const rfcMnthByWkDay = (wkNum: Recurrence['monthly_week'], wkDay: Recurrence['monthly_week_day']) => {
  const day = wkDay && weekDays[wkDay];
  return `BYDAY=${wkNum}${day}`;
};

const rfcByMnthDay = (day: Recurrence['monthly_day']) => {
  return `BYMONTHDAY=${day}`;
};

const rfcStartDate = (date: string) => {
  return `DTSTART:${formatRfcDate(date)}`;
};

const formatRfcDate = (date: string) => {
  return date.replace(/\.\d\d\d/, '').replace(/[-:]/g, '');
};

const weekDays = ['_', 'SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
*/
type Recurrence = Required<ZoomMeetingRequest>['recurrence'];
