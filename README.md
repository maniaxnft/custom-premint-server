# custom-premint

Custom Premint is an app where users connect their Metamask, Discord and Twitter to get special roles in relative Discord server.
There is already Premint existing but this app allows you to customize it, add special roles based on what logic you want.

## Step 1

- Create Discord app and get `client_id` and `client_secret` and add them to the `DISCORD_CLIENT_ID` and `DISCORD_CLIENT_SECRET` env vars
- Create Twitter app and get consumer token, consumer token secret, access token and access token secret and place them in env vars as `TWITTER_CONSUMER_KEY` `TWITTER_CONSUMER_SECRET` `TWITTER_ACCESS_TOKEN_KEY` `TWITTER_ACCESS_TOKEN_SECRET`  

## Step 2

Enter relevant env vars within `.env` file

## Step 3

1. Install npm packages & Run the app

```bat
yarn && node src/index.js

```
