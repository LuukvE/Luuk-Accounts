import { URL } from 'url';
import path from 'path';
import dotenv from 'dotenv';
import Cookies from 'cookies';
import querystring from 'querystring';
import http, { RequestListener, IncomingMessage } from 'http';

import file from './file';
import { ErrorResponse } from './types';
import {
  missingFields,
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
} from './endpoints';

dotenv.config({
  path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV || 'development'}`)
});

const httpHandler: RequestListener = async function httpHandler(request, response) {
  // If the request is not made to the API domain, handle it like a static request for a client file
  if (!request.headers.host || request.headers.host.indexOf(process.env.API_DOMAIN) !== 0) {
    return file(request, response);
  }

  // All API responses are always CORS-enabled with JSON content type
  response.setHeader('Content-Type', 'application/json');

  response.setHeader('Access-Control-Allow-Credentials', 'true');

  response.setHeader('Access-Control-Allow-Origin', `http://${process.env.CLIENT_DOMAIN}`);

  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  response.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');

  // Pre-flight requests do not need to be processed any further, they only need the CORS headers
  if (request.method === 'OPTIONS') {
    response.writeHead(200);

    return response.end();
  }

  // Load any data sent in the request body
  let chunks = '';

  request.on('data', (chunk: Buffer | string) => {
    chunks += chunk;
  });

  request.on('end', () => {
    const cookies = new Cookies(request, response, { keys: ['abc', 'def'] });

    let body: any = null;

    try {
      body = chunks.length ? JSON.parse(chunks) : null;
    } catch (e) {
      console.log('JSON parse error of request body', chunks);
    }

    const result = getResult(request, cookies, body);

    if (result === null) {
      response.writeHead(204);

      return response.end();
    }

    if (result.type === 'redirect') {
      response.writeHead(302, { Location: result.location });
    }

    response.writeHead(result.type === 'error' ? result.status : 200);

    response.end(JSON.stringify(result));
  });
};

const getResult = (request: IncomingMessage, cookies: Cookies, body: any) => {
  if (request.method === 'GET') {
    if (request.url === '/public-key') return publicKey();

    const url = new URL(request.url, `http://${process.env.API_DOMAIN}`);

    const params = querystring.parse(url.search);

    if (request.url === '/google-redirect') {
      if (typeof params.redirect !== 'string') return missingFields();

      return googleRedirect(params.redirect);
    }

    if (request.url.indexOf('/sign-in-link?') === 0) {
      if (typeof params.id !== 'string') return missingFields();

      return signInLink(params.id);
    }

    if (request.url.indexOf('/google-sign-in?') === 0) {
      if (typeof params.code !== 'string' || typeof params.redirect !== 'string') {
        return missingFields();
      }

      return googleSignIn(params.code, params.redirect);
    }
  }

  if (request.method === 'POST') {
    if (request.url === '/auto-sign-in') return autoSignIn(cookies);

    if (request.url === '/sign-in') {
      const { email, password } = body;

      if (typeof email !== 'string' || typeof password !== 'string') return missingFields();

      return manualSignIn(email, password);
    }

    if (request.url === '/sign-up') {
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

    if (request.url === '/forgot-password') {
      const { email, redirect } = body;

      if (typeof email !== 'string' || typeof redirect !== 'string') return missingFields();

      return forgotPassword(email, redirect);
    }
  }

  if (request.url === '/sign-out') return signOut(cookies);

  if (request.url === '/load') return load(cookies);

  if (request.url === '/set-user') {
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

  if (request.url === '/set-config') {
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

http.createServer(httpHandler).listen(process.env.HTTP_PORT);

console.log(`API: http://${process.env.API_DOMAIN}:${process.env.HTTP_PORT}`);
