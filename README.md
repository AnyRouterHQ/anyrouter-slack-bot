# anyrouter-slack-bot

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A small Slack bot that answers a slash command through
[AnyRouter](https://anyrouter.dev). It shows the shortest useful path from a
Slack message to a routed model call: one `sk-ar-v1-` key, one base URL, and
AnyRouter handles routing and failover.

The only valid AnyRouter domain is `https://anyrouter.dev` (short link
`https://anyr.dev` for social posts). Any other domain using the AnyRouter name
is not affiliated with this project, and the client refuses one.

## Set up Slack

1. Create a Slack app at <https://api.slack.com/apps>.
2. Under **Slash Commands**, create `/anyr` with the request URL of your hosted
   app, or use a local tunnel for development.
3. Install the app to your workspace and copy the bot token and signing secret.

## Configure

```bash
cp .env.example .env
```

```bash
SLACK_BOT_TOKEN=xoxb-...
SLACK_SIGNING_SECRET=...
ANYROUTER_API_KEY=sk-ar-v1-...
PORT=3000
```

## Run

```bash
npm install
npm start
```

Then type `/anyr what is the cheapest way to use Claude Code?` in Slack.

## Test

```bash
npm test
```

The tests stub `fetch`, then assert the request goes to
`https://anyrouter.dev/api/v1/chat/completions`, that the assistant text comes
back, and that a look-alike base URL is refused.

## Notes

- The default model is `anyrouter/free`, which picks the best free model
  available. Free models are `$0` per token on Go and up, with no daily cap.
- To pin a model, change the `model` argument in `src/app.mjs`.
- Bring-your-own-key routes through your own provider keys at `$0` markup.
