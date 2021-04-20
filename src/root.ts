import { URL } from 'url';
import Cookies from 'cookies';
import querystring from 'querystring';
import { IncomingMessage, ServerResponse } from 'http';

import { RequestBody } from './types';
import { methodNotAllowed, missingFields } from './constants';
import {
  load,
  setMe,
  setUser,
  signOut,
  publicKey,
  autoSignIn,
  signInLink,
  manualSignIn,
  googleSignIn,
  manualSignUp,
  forgotPassword,
  googleRedirect
} from './handlers';

import { getConfiguration } from './database';

const origins = [];

getConfiguration('allowed-origins').then((config) => {
  config.value.split(',').forEach((origin) => origins.push(origin));
});

const keys = [];

getConfiguration('cookie-signature-keys').then((config) => {
  config.value.split(',').forEach((key) => keys.push(key));
});

const root = async (request: IncomingMessage, response: ServerResponse, body: RequestBody) => {
  if (!keys.length) return response.end();

  const cookies = new Cookies(request, response, { keys });

  const { url, method, headers } = request;

  if (headers.origin && !origins.includes(headers.origin)) {
    response.writeHead(403);

    return response.end();
  }

  response.setHeader('Content-Type', 'application/json');

  if (headers.origin) {
    response.setHeader('Access-Control-Allow-Credentials', 'true');

    response.setHeader('Access-Control-Allow-Origin', headers.origin);

    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    response.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  }

  if (request.method === 'OPTIONS') {
    response.writeHead(200);

    return response.end();
  }

  if (!['POST', 'GET'].includes(method)) return methodNotAllowed;

  const handler = method === 'GET' ? get : post;

  const result = await handler(url, cookies, body);

  if (result === null) {
    response.writeHead(200);

    return response.end(JSON.stringify(result));
  }

  if (!result) {
    response.writeHead(404);

    return response.end();
  }

  if (result.type === 'key') {
    response.writeHead(200);

    return response.end(result.key);
  }

  if (result.type === 'redirect') {
    response.writeHead(302, { Location: result.location });

    return response.end();
  }

  response.writeHead(result.type === 'error' ? result.status : 200);

  response.end(JSON.stringify(result));
};

const get = (url: string, cookies: Cookies) => {
  const uri = new URL(url, process.env.API_URL);
  const params = querystring.parse(uri.search.substring(1));

  if (url === '/') return null;

  if (url === '/public-key.json') return publicKey();

  if (url.indexOf('/google-redirect?') === 0) {
    if (typeof params.redirect !== 'string') return missingFields;

    return googleRedirect(params.redirect);
  }

  if (url.indexOf('/sign-in-link?') === 0) {
    if (typeof params.id !== 'string') return missingFields;

    return signInLink(cookies, params.id);
  }

  if (url.indexOf('/google-sign-in?') === 0) {
    if (typeof params.code !== 'string' || typeof params.state !== 'string') {
      return missingFields;
    }

    return googleSignIn(cookies, params.code, params.state);
  }
};

const post = (url: string, cookies: Cookies, body: RequestBody) => {
  if (url === '/auto-sign-in') return autoSignIn(cookies);

  if (url === '/sign-in') {
    const { email, password } = body;

    if (typeof email !== 'string' || typeof password !== 'string') return missingFields;

    return manualSignIn(cookies, email, password);
  }

  if (url === '/sign-up') {
    const { email, password, redirect, name } = body;

    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      typeof redirect !== 'string' ||
      (typeof name !== 'undefined' && typeof name === 'string')
    ) {
      return missingFields;
    }

    return manualSignUp(email, password, redirect, name);
  }

  if (url === '/forgot-password') {
    const { email, redirect } = body;

    if (typeof email !== 'string' || typeof redirect !== 'string') return missingFields;

    return forgotPassword(email, redirect);
  }

  if (url === '/sign-out') return signOut(cookies);

  if (url === '/load') return load(cookies);

  if (url === '/set-me') {
    const { name, password } = body;

    if ((name && typeof name !== 'string') || (password && typeof password !== 'string')) {
      return missingFields;
    }

    return setMe(cookies, name, password);
  }

  if (url === '/set-user') {
    const { email, sendEmail, groups, name, redirect } = body;

    if ([email, name, sendEmail, redirect].find((prop) => typeof prop !== 'string')) {
      return missingFields;
    }

    if (!(groups instanceof Array) || groups.find((group) => typeof group !== 'string')) {
      return missingFields;
    }

    return setUser(cookies, email, groups, name, sendEmail, redirect);
  }
};

export default root;
