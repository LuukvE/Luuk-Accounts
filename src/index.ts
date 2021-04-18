import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import http, { RequestListener } from 'http';
import https from 'https';

import { RequestBody } from './types';
import root from './root';

dotenv.config({
  path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV || 'development'}`)
});

const httpHandler: RequestListener = async function httpHandler(request, response) {
  const { url, headers } = request;

  response.setHeader('Content-Type', 'application/json');

  if (['/auto-sign-in', '/sign-out'].includes(url)) {
    response.setHeader('Access-Control-Allow-Credentials', 'true');

    response.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_URL);

    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    response.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  }

  if (headers.origin && ![process.env.API_URL, process.env.CLIENT_URL].includes(headers.origin)) {
    response.writeHead(403);

    return response.end();
  }

  if (request.method === 'OPTIONS') {
    response.writeHead(200);

    return response.end();
  }

  let chunks = '';

  request.on('data', (chunk: Buffer | string) => {
    chunks += chunk;
  });

  request.on('end', () => {
    let body: RequestBody = null;

    try {
      body = chunks.length ? JSON.parse(chunks) : null;

      root(request, response, body);
    } catch (e) {
      console.log(e);

      response.writeHead(500);

      response.end();
    }
  });
};

http
  .createServer((request, response) => {
    response.writeHead(302, { Location: `${process.env.API_URL}${request.url}` });
    response.end();
  })
  .listen(process.env.HTTP_PORT);

// Host the API using SSL certificates from the ./ssl folder, ignored by Git
const certPath = './ssl';

https
  .createServer(
    {
      key: fs.readFileSync(`${certPath}/key.pem`, 'utf8'),
      cert: fs.readFileSync(`${certPath}/cert.pem`, 'utf8')
    },
    httpHandler
  )
  .listen(process.env.HTTPS_PORT);

console.log(`API: ${process.env.API_URL}`);
