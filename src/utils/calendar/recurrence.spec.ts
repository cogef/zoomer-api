import { zoomToRFCRecurrence } from './recurrence';

describe('converting zoom recurrence into rfc rule', () => {
  test('daily recurrence - 1', () => {
    const actual = zoomToRFCRecurrence({
      type: 1,
      repeat_interval: 5,
      end_times: 12,
    });
    const expected = 'FREQ=DAILY;INTERVAL=5;COUNT=12';
    expect(actual).toBe(expected);
  });

  test('daily recurrence - 2', () => {
    const actual = zoomToRFCRecurrence({
      type: 1,
      repeat_interval: 5,
      end_date_time: new Date('4/28/2021').toISOString(),
    });
    const expected = 'FREQ=DAILY;INTERVAL=5;UNTIL=20210428T040000Z';
    expect(actual).toBe(expected);
  });

  test('weekly recurrence', () => {
    const actual = zoomToRFCRecurrence({
      type: 2,
      repeat_interval: 2,
      weekly_days: '1,4,7',
      end_date_time: new Date('1/12/2021').toISOString(),
    });
    const expected = 'FREQ=WEEKLY;INTERVAL=2;UNTIL=20210112T050000Z;BYDAY=SU,WE,SA';
    expect(actual).toBe(expected);
  });

  test('monthly recurrence, by week day - 1', () => {
    const actual = zoomToRFCRecurrence({
      type: 3,
      repeat_interval: 3,
      monthly_week: '-1',
      monthly_week_day: 3,
      end_times: 30,
    });
    const expected = 'FREQ=MONTHLY;INTERVAL=3;COUNT=30;BYDAY=-1TU';
    expect(actual).toBe(expected);
  });

  test('monthly recurrence, by week day - 2', () => {
    const actual = zoomToRFCRecurrence({
      type: 3,
      repeat_interval: 3,
      monthly_week: 2,
      monthly_week_day: 4,
      end_times: 30,
    });
    const expected = 'FREQ=MONTHLY;INTERVAL=3;COUNT=30;BYDAY=2WE';
    expect(actual).toBe(expected);
  });

  test('monthly recurrence, by date', () => {
    const actual = zoomToRFCRecurrence({
      type: 3,
      repeat_interval: 11,
      monthly_day: 24,
      end_date_time: new Date('3/14/2025 3:30 PM').toISOString(),
    });
    const expected = 'FREQ=MONTHLY;INTERVAL=11;UNTIL=20250314T193000Z;BYMONTHDAY=24';
    expect(actual).toBe(expected);
  });
});
