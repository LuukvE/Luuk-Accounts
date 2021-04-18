import { URL } from 'url';
import Cookies from 'cookies';
import querystring from 'querystring';
import { IncomingMessage, ServerResponse } from 'http';

import { RequestBody, ErrorResponse } from './types';
import {
  publicKey,
  autoSignIn,
  manualSignIn,
  manualSignUp,
  forgotPassword,
  signInLink,
  googleSignIn,
  googleRedirect,
  signOut,
  load,
  setUser,
  setConfig
} from './handlers';

const missingFields = (): ErrorResponse => ({
  type: 'error',
  status: 400,
  message: 'missing-fields'
});

const methodNotAllowed = (): ErrorResponse => ({
  type: 'error',
  status: 405,
  message: 'method-not-allowed'
});

const root = async (request: IncomingMessage, response: ServerResponse, body: RequestBody) => {
  const cookies = new Cookies(request, response, { keys: ['abc', 'def'] });
  const { url, method, headers } = request;

  response.setHeader('Content-Type', 'application/json');

  if (['/auto-sign-in', '/sign-out'].includes(url)) {
    response.setHeader('Access-Control-Allow-Credentials', 'true');

    response.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_URL);

    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    response.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  }

  if (request.method === 'OPTIONS') {
    response.writeHead(200);

    return response.end();
  }

  if (headers.origin && ![process.env.API_URL, process.env.CLIENT_URL].includes(headers.origin)) {
    response.writeHead(403);

    return response.end();
  }

  if (!['POST', 'GET'].includes(method)) return methodNotAllowed();

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

  if (url === '/public-key') return publicKey();

  if (url.indexOf('/google-redirect?') === 0) {
    if (typeof params.redirect !== 'string') return missingFields();

    return googleRedirect(params.redirect);
  }

  if (url.indexOf('/sign-in-link?') === 0) {
    if (typeof params.id !== 'string') return missingFields();

    return signInLink(params.id);
  }

  if (url.indexOf('/google-sign-in?') === 0) {
    if (typeof params.code !== 'string' || typeof params.state !== 'string') {
      return missingFields();
    }

    return googleSignIn(cookies, params.code, params.state);
  }
};

const post = (url: string, cookies: Cookies, body: RequestBody) => {
  if (url === '/auto-sign-in') return autoSignIn(cookies);

  if (url === '/sign-in') {
    const { email, password } = body;

    if (typeof email !== 'string' || typeof password !== 'string') return missingFields();

    return manualSignIn(email, password);
  }

  if (url === '/sign-up') {
    const { email, password, redirect, name } = body;

    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      typeof redirect !== 'string' ||
      (typeof name !== 'undefined' && typeof name === 'string')
    ) {
      return missingFields();
    }

    return manualSignUp(email, password, redirect, name);
  }

  if (url === '/forgot-password') {
    const { email, redirect } = body;

    if (typeof email !== 'string' || typeof redirect !== 'string') return missingFields();

    return forgotPassword(email, redirect);
  }

  if (url === '/sign-out') return signOut(cookies);

  if (url === '/load') return load(cookies);

  if (url === '/set-user') {
    const { id, email, sendEmail, groups, name, password } = body;

    if (
      [id, email, sendEmail, name, password].find(
        (prop) => !['string', 'undefined'].includes(typeof prop)
      )
    ) {
      return missingFields();
    }

    if (
      typeof groups !== 'undefined' &&
      (!(groups instanceof Array) || groups.find((group) => typeof group !== 'string'))
    ) {
      return missingFields();
    }

    return setUser(cookies, id, email, sendEmail, groups, name, password);
  }

  if (url === '/set-config') {
    const { permissions, sessions, links, logs, emails, configurations } = body;

    if (
      [permissions, sessions, links, logs, emails, configurations].find(
        (prop) => !(prop instanceof Array)
      )
    ) {
      return missingFields();
    }

    return setConfig(cookies, permissions, sessions, links, logs, emails, configurations);
  }
};

export default root;
