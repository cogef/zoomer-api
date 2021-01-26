import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';

export const zoomRequest = async (opts: Options) => {
  const apiKey = process.env.ZOOM_API_KEY!;
  const apiSecret = process.env.ZOOM_API_SECRET!;

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

  let body = opts.noResponse ? {} : await res.json();
  if (status >= 400) {
    throw { context: 'zoom-request', status, error: body };
  }
  return body;
};

type Options = {
  path: string;
  noResponse?: boolean;
} & ({ method?: 'GET' | 'DELETE'; body?: never } | { method: 'POST' | 'PUT' | 'PATCH'; body: any });
