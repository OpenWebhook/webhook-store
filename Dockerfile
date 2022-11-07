# syntax=docker/dockerfile:1
FROM node:16 as builder
WORKDIR /tmp/build/app
RUN chown node:node /tmp/build/app
USER node
COPY package.json ./
COPY yarn.lock ./
RUN yarn install
COPY prisma ./prisma/
RUN yarn prisma generate
COPY tsconfig.json ./
COPY tsconfig.build.json ./
COPY src ./src
RUN yarn build
RUN yarn cache clean

FROM node:16 as ts-node-module-prod
WORKDIR /usr/src/app
COPY --from=builder /tmp/build/app/package.json ./
COPY --from=builder /tmp/build/app/yarn.lock ./
RUN yarn install --frozen-lockfile
RUN yarn cache clean

FROM --platform=linux/amd64 node:16
WORKDIR /usr/src/app
COPY --from=builder /tmp/build/app/package.json ./
COPY --from=ts-node-module-prod /usr/src/app/node_modules ./node_modules
COPY --from=builder /tmp/build/app/prisma ./prisma
RUN yarn prisma generate

COPY --from=builder /tmp/build/app/dist ./

RUN rm -rf /tmp/build/app

EXPOSE 3000
CMD ["node","main.js"]