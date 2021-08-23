import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import { inspect } from 'util';
import { env } from '../../env';
import { HttpStatus } from '../../handlers/api/helpers';

export const zoomRequest = async <T>(opts: Options) => {
  const apiKey = env.ZOOM_API_KEY;
  const apiSecret = env.ZOOM_API_SECRET;

  const jwtPayload = {
    iss: apiKey,
    exp: new Date().getTime() + 5000,
  };

  const token = jwt.sign(jwtPayload, apiSecret);

  const res = await fetch(`https://api.zoom.us/v2${opts.path}`, {
    headers: {
      authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      accept: 'application/json',
    },
    method: opts.method,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  const status = res.status;
  let body: T = status === HttpStatus.NO_CONTENT ? null : await res.json();

  console.debug(inspect({ headers: res.headers, uri: res.url, body }, undefined, null));

  if (status >= 400) {
    throw { context: 'zoom-request', status, error: body };
  }
  return body;
};

type Options = {
  path: string;
} & ({ method?: 'GET' | 'DELETE'; body?: never } | { method: 'POST' | 'PUT' | 'PATCH'; body: any });
