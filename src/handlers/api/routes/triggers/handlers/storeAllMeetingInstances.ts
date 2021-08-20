import * as DB from '../../../../../utils/db';
import * as Zoom from '../../../../../utils/zoom';
import { attemptTo, HandlerResponse } from '../../../helpers';
import { storeMeetingInstance } from '../../notifications/handlers';

export const storeAllMeetingInstances = async (): Promise<HandlerResponse> => {
  console.log(`Storing all meeting instances`);

  const [dbMeetingErr, dbMeetings] = await attemptTo('get all meetings from database', () => DB.__getAllMeetings());
  if (dbMeetingErr) {
    return dbMeetingErr;
  }

  let instanceCount = 0;

  await Promise.all(
    dbMeetings!.map(async dbMeeting => {
      const [instanceListErr, instanceList] = await attemptTo(`get meeting instances for ${dbMeeting.meetingID}`, () =>
        Zoom.getPastMeetingInstances(dbMeeting.meetingID)
      );

      if (instanceListErr) {
        console.error(instanceListErr);
        return;
      }

      await Promise.all(
        // Utilizing notification handler to store meeting instances
        instanceList!.meetings.map(async ({ uuid }) => {
          const resp = await storeMeetingInstance(uuid, dbMeeting);
          if (!resp.success) {
            console.error(resp);
          } else {
            instanceCount++;
          }
        })
      );
    })
  );

  console.log(`Successfully stored ${instanceCount} instances of ${dbMeetings!.length} meetings`);
  return { success: true, data: {} };
};
