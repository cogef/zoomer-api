import * as DB from '../../../../../utils/db';
import * as Zoom from '../../../../../utils/zoom';
import { attemptTo, HandlerResponse } from '../../../helpers';

export const storeAllCloudRecordings = async (): Promise<HandlerResponse> => {
  console.log(`Storing all cloud recordings`);

  const zoomAccounts = await DB.getZoomAccounts();
  let recordingCount = 0;

  await Promise.all(
    zoomAccounts.map(async zoomAccount => {
      const [recordingErr, recordingList] = await attemptTo(`get recordings for ${zoomAccount.email}`, () =>
        Zoom.getUserRecordings(zoomAccount.email)
      );

      if (recordingErr) {
        console.error(recordingErr);
      }

      await Promise.all(
        recordingList!.meetings.map(async meeting => {
          const [dbErr] = await attemptTo(`store recording for ${meeting.uuid}`, () =>
            DB.storeCloudRecording(meeting.uuid, meeting.share_url)
          );

          if (dbErr) {
            console.error(dbErr);
          } else {
            recordingCount++;
          }
        })
      );
    })
  );

  console.log(`Successfully stored ${recordingCount} recordings`);
  return { success: true, data: {} };
};
