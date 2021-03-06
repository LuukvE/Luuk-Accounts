import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import http, { RequestListener } from 'http';
import https from 'https';

import file from './file';
import root from './root';
import { RequestBody } from './types';

dotenv.config({
  path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV || 'development'}`)
});

const httpHandler: RequestListener = async function httpHandler(request, response) {
  if (request.url.indexOf('/api/') !== 0) return file(request, response);

  let chunks = '';

  request.on('data', (chunk: Buffer | string) => {
    chunks += chunk;
  });

  request.on('end', () => {
    let body: RequestBody = null;

    try {
      body = chunks.length ? JSON.parse(chunks) : null;

      root(request, response, body);
    } catch (error) {
      console.log(error);

      response.writeHead(500);

      response.end();
    }
  });
};

if (!process.env.HTTPS_PORT) {
  http.createServer(httpHandler).listen(process.env.PORT);
} else {
  http
    .createServer((request, response) => {
      response.writeHead(302, { Location: `${process.env.API_URL}${request.url}` });
      response.end();
    })
    .listen(process.env.PORT);

  // Host the API using SSL certificates from the ./ssl folder, ignored by Git
  const creds = {
    key: fs.readFileSync(`./ssl/privkey.pem`, 'utf8'),
    cert: fs.readFileSync(`./ssl/cert.pem`, 'utf8')
  } as any;

  try {
    creds.ca = fs.readFileSync(`./ssl/chain.pem`, 'utf8');
  } catch (e) {}

  https.createServer(creds, httpHandler).listen(process.env.HTTPS_PORT);
}

console.log(`API: ${process.env.API_URL}`);
