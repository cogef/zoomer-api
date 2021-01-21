export type EventInfo = {
  zoomAccount: number;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  meetingID: string;
  host: {
    ministry: string;
    email: string;
    name: string;
  };
  calendarEvents: {
    zoomEventID: string;
    leadershipEventID: string;
  };
};

export type StoredEvent = { createdAt: Date } & EventInfo;
