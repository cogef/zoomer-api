import fetch from 'node-fetch';
import { env } from '../../env';
import { HttpStatus } from '../../handlers/api/helpers';
import { URLSearchParams } from 'url';

export const zoomRequest = async <T>(opts: Options) => {
  const accessToken = await getAccessToken();

  const res = await fetch(`https://api.zoom.us/v2${opts.path}`, {
    headers: {
      authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      accept: 'application/json',
    },
    method: opts.method,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  const status = res.status;
  let body: T = status === HttpStatus.NO_CONTENT ? null : await res.json();

  if (status >= 400) {
    throw { context: 'zoom-request', status, error: body };
  }
  return body;
};

const getAccessToken = async () => {
  const accountId = env.ZOOM_ACCOUNT_ID;
  const clientId = env.ZOOM_CLIENT_ID;
  const clientSecret = env.ZOOM_CLIENT_SECRET;

  const authToken = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const requestHeaders = {
    authorization: `Basic ${authToken}`,
    'Content-Type': 'application/x-www-form-urlencoded',
    accept: 'application/json',
  };

  const urlEncodedBody = new URLSearchParams({
    grant_type: 'account_credentials',
    account_id: accountId,
  });

  const res = await fetch('https://zoom.us/oauth/token', {
    headers: requestHeaders,
    method: 'POST',
    body: urlEncodedBody,
  });

  const status = res.status;
  let body = await res.json();

  if (status >= 400) {
    throw { context: 'zoom-oauth-request', status, error: body };
  }
  return body.access_token;
};

type Options = {
  path: string;
} & ({ method?: 'GET' | 'DELETE'; body?: never } | { method: 'POST' | 'PUT' | 'PATCH'; body: any });
