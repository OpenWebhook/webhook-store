# syntax=docker/dockerfile:1
FROM node:16 as builder
WORKDIR /usr/build/app
COPY package.json ./
COPY yarn.lock ./
RUN yarn install
COPY prisma ./prisma/
RUN yarn prisma generate
COPY tsconfig.json ./
COPY tsconfig.build.json ./
COPY src ./src
RUN yarn build

FROM node:16 as ts-node-module-prod
WORKDIR /usr/src/app
COPY --from=builder /usr/build/app/package.json ./
COPY --from=builder /usr/build/app/yarn.lock ./
RUN yarn install --frozen-lockfile

FROM --platform=linux/amd64 node:16
WORKDIR /usr/src/app
COPY --from=builder /usr/build/app/package.json ./
COPY --from=ts-node-module-prod /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/build/app/prisma ./prisma
RUN yarn prisma generate

COPY --from=builder /usr/build/app/dist ./

EXPOSE 3000
CMD ["node","main.js"]
