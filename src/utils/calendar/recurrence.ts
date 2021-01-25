import { ZoomMeetingRequest } from '../zoom';

/**
 * Convert Zoom recurrence properties into RFC5545 recurrence rules,
 * required by Google's Calendar API
 *
 * http://tools.ietf.org/html/rfc5545#section-3.8.5 */
export const zoomToRFCRecurrence = (recur: Recurrence): string => {
  const rfcEnd = recur.end_times === undefined ? rfcEndDate(recur.end_date_time) : rfcOccurrences(recur.end_times);
  const options = [rfcFreq(recur.type), rfcInterval(recur.repeat_interval), rfcEnd];
  const isMonthyByDay = 'monthly_day' in recur;

  switch (recur.type) {
    case 1: // daily
      return options.join(';');
    case 2: // weekly
      return [...options, rfcByWkDays(recur.weekly_days)].join(';');
    case 3: // monthly
      const rfcMonthly = isMonthyByDay
        ? rfcByMnthDay(recur.monthly_day)
        : rfcMnthByWkDay(recur.monthly_week, recur.monthly_week_day);
      return [...options, rfcMonthly].join(';');
  }
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
  return `UNTIL=${date}`.replace('.000', '').replace(/[-:]/g, '');
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

const weekDays = ['_', 'SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
type Recurrence = Required<ZoomMeetingRequest>['recurrence'];
