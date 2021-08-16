import { env } from '../../env';

export const ministries = {
  cap: 'Communications and Promotions',
  media: 'Media',
  familyLife: 'Family Life',
  chaplains: 'Chaplains',
  children: 'Children',
  christForm: 'Christian Formation',
  frontDoor: 'Front Door',
  mission: 'Mission',
  outreach: 'Outreach',
  'm&a': 'Music & Arts',
  prayer: 'Prayer',
  youth: 'Youth',
  deacons: 'Deacons',
  ministers: 'Ministers',
  admin: 'Administration',
  trustees: 'Trustees',
  pastors: 'Pastors',
};

export const MASTER_ZOOM_CAL_ID = env.MASTER_ZOOM_CALENDAR_ID;

export type MinistryKey = keyof typeof ministries;
