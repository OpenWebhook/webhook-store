[![webhook-store](https://github.com/OpenWebhook/webhook-store/actions/workflows/main.yml/badge.svg)](https://github.com/OpenWebhook/webhook-store/actions/workflows/main.yml) [![Maintainability](https://api.codeclimate.com/v1/badges/bc33884e66ac77707905/maintainability)](https://codeclimate.com/github/OpenWebhook/webhook-store/maintainability) [![Test Coverage](https://api.codeclimate.com/v1/badges/bc33884e66ac77707905/test_coverage)](https://codeclimate.com/github/OpenWebhook/webhook-store/test_coverage)

# OpenWebhook

[Openwebhook.io](https://www.openwebhook.io/) is an open source project for developpers working with webhooks.

## WebhookStore

> "Is the tunnel still up ?" "Did the third party send the webhook ?" "Where do I update the webhook url on this beautiful developer portal ?"

WebhookStore is a solution to debug webhooks on localhost.

### Some handy features:

- Permanent URLs: there are no generated urls, only user defined urls
- Available: Webhook store is **not a tunnel**, you don't have to run anything on your computer for the webhooks to be received
- Persistent: Webhooks are stored, and forwarded on localhost on demand. Meaning you can reuse a webhook from a dev session to another, instead of spending 2 minutes triggering the update webhook you need.

|                    | Ngrok / Ultra hook    | RequestBIn       | WebhookStore                                                |
| ------------------ | --------------------- | ---------------- | ----------------------------------------------------------- |
| Permanent Url      | Upon Inscription      | Upon Inscription | Yes                                                         |
| Availability       | When tunnel is Up     | All the time     | All the time                                                |
| Persistency        | During tunnel session | All the time     | All the time                                                |
| Debug on localhost | With the cli          | Not possible     | With the cli                                                |
| Inspect webhooks   | Yes                   | Yes              | Yes                                                         |
| Authentication     | Yes                   | Yes              | [Yes](https://www.openwebhook.io/docs/intro#authentication) |

The project is inspired from [Yopmail](https://yopmail.com/en/): a Disposable Email Address - Temporary and anonymous inbox.

### How to use it

Way 1:

- Choose a webhook store url matching **`*.webhook.store`**: like `ilovewebhooks.webhook.store`.
- Use it as a webhook address `ilovewebhooks.webhook.store/send/me-the-webhook`, or send a POST request with a curl
- Visit the store website `ilovewebhooks.webhook.store` and see your webhook
- Send that webhook to your localhost by clicking on "Send" (and running the local proxy server)
- All new webhooks will be forwarded to your localhost automatically

Way 2:

- run `npx webhook-store-cli --port 9000` and it will prompt you a webhook store based on your username.

### Debugging on localhost

```
npx webhook-store-cli --port 9000
```

Here is a video of the proxy server receiving the webhooks.

![Demo with cli](demo.gif)

```mermaid
sequenceDiagram
    Third party API->>OpenWebhook Store: Sends webhook
    OpenWebhook Store->>OpenWebhook Client (browser): Sends stored webhook
    OpenWebhook Client (browser)->>Localhost: Replays webhook

```

# Deployment

Documentation for self [hosted webhook store](https://www.openwebhook.io/docs/self-hosting/install-store-heroku).

# Development

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

# Configuration

## Hosts

Webhook-store is designed to work for multiple hosts. For instance all `*.webhook.store` requests go to the same infrastructure. The webhook-store will associate all the webhooks to a host making it easy to gather all the webhooks for an host.
You can have the same infrastructure for all your team and envs. If you use \*.sandbox.org.com, then your dev team-a can work on team-a.sandbox.org.com and another team on team-b.sandbox.org.com without the need to configure or manage multiple webhook-stores.

## Targets

Webhook-store is designed as a proxy, all the incoming webhooks can be sent to targets. For instance you want a third party to send webhooks to all your sandbox environments:

payment-sandbox-webhooks => staging.org.com
payment-sandbox-webhooks => sandbox.org.com
payment-sandbox-webhooks => sandbox-2.org.com

## Env

```
# Configuration
MAX_STORED_WEBHOOKS_PER_HOST=100                            # Will keep only 100 webhooks (per hosts)
DEFAULT_TARGETS=production.org.com, preproduction.org.com   # Will send all the webhooks to these urls
```

# Using docker

Edit the docker.env

```
docker run --env-file ./docker.env -p 9000:9000 openwebhook/webhook-store:latest
```


