import path from 'path';
import dotenv from 'dotenv';
import http, { RequestListener } from 'http';

import { RequestBody } from './types';
import root from './root';

dotenv.config({
  path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV || 'development'}`)
});

const httpHandler: RequestListener = async function httpHandler(request, response) {
  response.setHeader('Content-Type', 'application/json');

  response.setHeader('Access-Control-Allow-Credentials', 'true');

  response.setHeader('Access-Control-Allow-Origin', `http://${process.env.CLIENT_DOMAIN}`);

  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  response.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');

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

http.createServer(httpHandler).listen(process.env.HTTP_PORT);

console.log(`API: http://${process.env.API_DOMAIN}:${process.env.HTTP_PORT}`);
