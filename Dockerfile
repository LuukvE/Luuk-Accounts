FROM node:14
ENV NODE_ENV production
WORKDIR /usr/src/client
COPY client/package*.json ./
RUN npm ci --only=production
WORKDIR /usr/src/server
COPY server/package*.json ./
RUN npm ci --only=production
WORKDIR /usr/src/client
COPY client .
RUN npx react-scripts build
WORKDIR /usr/src/server
COPY server .
WORKDIR /usr/src/server
EXPOSE 80 443
CMD [ "npx", "ts-node", "src" ]
