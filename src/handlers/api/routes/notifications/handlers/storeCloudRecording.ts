import * as DB from '../../../../../utils/db';
import { attemptTo, HandlerResponse, HttpStatus } from '../../../helpers';

export const storeCloudRecording = async (meetingUUID: string, share_url: string): Promise<HandlerResponse> => {
  const [zMeetingErr] = await attemptTo('store cloud recording', () => DB.storeCloudRecording(meetingUUID, share_url));

  if (zMeetingErr) {
    return zMeetingErr;
  }

  return { success: true, data: {}, code: HttpStatus.NO_CONTENT };
};
