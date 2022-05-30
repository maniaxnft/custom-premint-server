# Custom Premint Server

Custom Premint is an app where users connect their Metamask, Discord and Twitter to get special roles in relative Discord server.
There is already Premint existing but this app allows you to customize it, add special roles based on what logic you want.

## Technologies
- Used oauth 2.0 flow of [Twitter](https://developer.twitter.com/en/docs/authentication/oauth-2-0/bearer-tokens) and [Discord](https://discord.com/developers/docs/topics/oauth2) to get user id's and user name's 
- Used Sign-in with Ethereum so people do not need to provide their email or username and keep their personal data
- When you sign a message with Metamask, I verify it at the server side, only by then I set the jwt token to browser's cookies
- Used invisible Recapthca to prevent bot's    

## Step 1
- Create `.env` file, copy and paste the variables from `.env.example`
- Create Discord app and get `client_id` and `client_secret` and add them to the `DISCORD_CLIENT_ID` and `DISCORD_CLIENT_SECRET` env vars
- Create Twitter app and get bearer token, consumer token, consumer token secret, access token and access token secret and place them in env vars as `TWITTER_BEARER_TOKEN` `TWITTER_CONSUMER_KEY` `TWITTER_CONSUMER_SECRET` `TWITTER_ACCESS_TOKEN_KEY` `TWITTER_ACCESS_TOKEN_SECRET` 


## Step 2
- Other environment variables are mostly self explanatory and project specific, feel free to ask them if you do not get what is it about
- Enter relevant env vars within `.env` file by checking `.env.example`

## Step 3

- Install npm packages & Run the app

```bat
yarn && node src/index.js

```

## Future Development
- Add Typescript
