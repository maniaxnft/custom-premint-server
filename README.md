# custom-premint

Custom Premint is an app where users connect their Metamask, Discord and Twitter to get special roles in relative Discord server.
There is already Premint existing but this app allows you to customize it, add special roles based on what logic you want.

## Step 1

Create Discord app and get `client_id` and `client_secret` and add them to the `DISCORD_CLIENT_ID` and `DISCORD_CLIENT_SECRET` env vars

## Step 2

Enter relevant env vars within `.env` file

## Step 3

1. Install npm packages

```bat
yarn  && cd client && yarn

```

2. Run the app

```bat
yarn start &&  node src/index.js

```
