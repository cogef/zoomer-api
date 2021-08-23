import { captureException } from '@sentry/serverless';
import * as DB from '../../../../../utils/db';
import * as Zoom from '../../../../../utils/zoom';
import { attemptTo, HandlerResponse } from '../../../helpers';
import { storeMeetingInstance } from '../../notifications/handlers';

export const storeAllMeetingInstances = async (): Promise<HandlerResponse> => {
  console.log(`Storing all meeting instances`);

  const [dbMeetingErr, dbMeetings] = await attemptTo('get all meetings from database', () => DB.__getAllMeetings());
  if (dbMeetingErr) {
    captureException(dbMeetingErr.error);
    return dbMeetingErr;
  }

  let instanceCount = 0;
  let instanceFailedCount = 0;

  await Promise.all(
    dbMeetings!.map(async dbMeeting => {
      const [instanceListErr, instanceList] = await attemptTo(`get meeting instances for ${dbMeeting.meetingID}`, () =>
        Zoom.getPastMeetingInstances(dbMeeting.meetingID)
      );

      if (instanceListErr) {
        instanceFailedCount++;
        console.error(instanceListErr);
        captureException(instanceListErr.error);
        return;
      }

      // Utilizing notification handler to store meeting instances
      await Promise.all(
        instanceList!.meetings.map(async ({ uuid }) => {
          const [dbInstanceErr, dbInstance] = await attemptTo(`get meeting instance ${uuid} from database`, () =>
            DB.getMeetingInstance(uuid)
          );

          if (dbInstanceErr) {
            console.error(dbInstanceErr);
            captureException(dbInstanceErr.error);
            return;
          }

          if (dbInstance) {
            return;
          }

          const resp = await storeMeetingInstance(uuid, dbMeeting);
          if (!resp.success) {
            console.error(resp);
            captureException(resp.error);
          } else {
            instanceCount++;
          }
        })
      );
    })
  );

  const msg = `Successfully stored ${instanceCount} instances for ${dbMeetings!.length} meetings`;

  if (instanceFailedCount > 0) {
    const errMsg = `${msg}\nFailed to retrieve instances for ${instanceFailedCount} of ${dbMeetings!.length} meetings`;
    console.error(errMsg);
    return { success: false, error: errMsg };
  }

  console.log(msg);
  return { success: true, data: { message: msg } };
};
