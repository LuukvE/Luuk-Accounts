FROM node:14
ENV NODE_ENV production
WORKDIR /usr/src/client
COPY client/package*.json ./
RUN npm ci --only=production
WORKDIR /usr/src/api
COPY api/package*.json ./
RUN npm ci --only=production
WORKDIR /usr/src/client
COPY client .
WORKDIR /usr/src/api
COPY api .
EXPOSE 8080
CMD [ "npx", "ts-node", "src" ]
