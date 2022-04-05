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
curl -X POST https://webhook-store-YOURORG.herokuapp.com/webhook -d 'yolo=croute'
```

### See your webhooks

Go to to https://openwebhook.github.io/client/ and update the webhook store URL.
