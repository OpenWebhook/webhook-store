# OpenWebhook

[Openwebhook.io](https://www.openwebhook.io/) is an open source project for developpers working with webhooks.

Checkout the [demo](https://demo.openwebhook.io/).

Join the beta-tester list by sending an email to contact@openwebhook.io.

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
