# syntax=docker/dockerfile:1
FROM --platform=linux/amd64 node:18.15.0-alpine as builder
RUN apk add --update --no-cache openssl
WORKDIR /tmp/build/app

COPY package.json ./
COPY yarn.lock ./
RUN yarn install
COPY prisma ./prisma/
RUN yarn prisma generate
COPY tsconfig.json ./
COPY tsconfig.build.json ./
COPY src ./src
RUN yarn build

FROM --platform=linux/amd64 node:18.15.0-alpine as ts-node-module-prod
RUN apk add --update --no-cache openssl
WORKDIR /usr/src/app

COPY --from=builder /tmp/build/app/package.json ./
COPY --from=builder /tmp/build/app/yarn.lock ./
RUN yarn install --frozen-lockfile --production
COPY --from=builder /tmp/build/app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /tmp/build/app/node_modules/.prisma ./node_modules/.prisma

FROM --platform=linux/amd64 node:18.15.0-alpine
RUN apk add --update --no-cache openssl
WORKDIR /usr/src/app
COPY --from=builder /tmp/build/app/package.json ./
COPY --from=ts-node-module-prod /usr/src/app/node_modules ./node_modules
COPY --from=builder /tmp/build/app/prisma ./prisma

COPY --from=builder /tmp/build/app/dist ./

EXPOSE 3000
CMD ["main.js"]
