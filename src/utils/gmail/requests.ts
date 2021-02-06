import { gmail } from '../../services/googleapis';

export const sendEmail = async (recipient: string, subject: string, body: string) => {
  const raw = makeBody(recipient, 'Zoom Scheduler <scheduler@cogef.org>', subject, body, true);

  return gmail.messages.send({
    userId: 'me',
    requestBody: {
      raw,
    },
  });
};

/*
  Procedure from https://stackoverflow.com/questions/34546142/gmail-api-for-sending-mails-in-node-js
  because Google can't provide reasonable examples
*/
const makeBody = (to: string, from: string, subject: string, message: string, isHTML?: boolean) => {
  const contentType = isHTML ? 'text/html' : 'text/plain';
  const msgStr = [
    `Content-Type: ${contentType}; charset="UTF-8"`,
    'MIME-Version: 1.0',
    'Content-Transfer-Encoding: 7bit',
    `to: ${to}`,
    `from: ${from}`,
    `subject: ${subject}\n`,
    message,
  ].join('\n');

  const encodedMsg = Buffer.from(msgStr).toString('base64').replace(/\+/g, '-').replace(/\//g, '_'); // IDK either
  return encodedMsg;
};
