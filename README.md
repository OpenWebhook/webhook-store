[![webhook-store](https://github.com/OpenWebhook/webhook-store/actions/workflows/main.yml/badge.svg)](https://github.com/OpenWebhook/webhook-store/actions/workflows/main.yml) [![Maintainability](https://api.codeclimate.com/v1/badges/bc33884e66ac77707905/maintainability)](https://codeclimate.com/github/OpenWebhook/webhook-store/maintainability) [![Test Coverage](https://api.codeclimate.com/v1/badges/bc33884e66ac77707905/test_coverage)](https://codeclimate.com/github/OpenWebhook/webhook-store/test_coverage)

# OpenWebhook

[Openwebhook.io](https://www.openwebhook.io/) is an open source project for developpers working with webhooks.

Checkout the [demo](https://demo.openwebhook.io/).

Join the beta-tester list by sending an email to contact@openwebhook.io.

## Usage

```
npx webhook-store-cli --port 9000
```

![Demo with cli](demo.gif)

```mermaid
sequenceDiagram
    Third party API->>OpenWebhook Store: Sends webhook
    OpenWebhook Store->>OpenWebhook Client (browser): Sends stored webhook
    OpenWebhook Client (browser)->>Localhost: Replays webhook

```

# Deployment

Documentation for self [hosted webhook store](https://www.openwebhook.io/docs/install-webhook-store).

# Develop

## Install dependencies

```
$ yarn
```

## Create DB and set env

### Using postgresql

```
createdb webhook-store
```

Add env file and configure `DATABASE_URL`:

```
cp .env.test .env
```

Configure `DATABASE_URL`, replace `USER`.

```
DATABASE_URL="postgresql://USER[:PASSWORD]@localhost:5432/webhook-store?schema=public"
```

### Run migrations

```
yarn prisma migrate dev
```

## Start server

```
yarn start:dev
```
