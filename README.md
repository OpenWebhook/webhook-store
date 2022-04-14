# Description

Webhook store is an open source projects that aims at improving DX when working with webhook, by creating a webhooks store with a fixed URL, and allowing the user to sends those webhooks to the localhost.

# Deployment

## Heroku (free)

### Deploy the service

Clone the repo, then create a heroku app with a database

```sh
heroku create webhook-store-YOURORG
heroku addons:create heroku-postgresql:hobby-dev
git push heroku
```

### Test your deployment

```sh
curl -X POST https://webhook-store-YOURORG.herokuapp.com/webhook/some-url -d 'yolo=croute'
```

### See and replay your webhooks

Start a local proxy:

```sh
npx local-cors-proxy --proxyUrl=http://localhost:MY_DEV_PORT
```

Go to to https://www.openwebhook.io and update the webhook store URL.
