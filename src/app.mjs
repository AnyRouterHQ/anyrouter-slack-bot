import { App } from "@slack/bolt"
import { ask } from "./anyrouter.mjs"

/**
 * Wire the `/anyr` slash command to AnyRouter. Exported so a test or a hosting
 * wrapper can build the app without starting it.
 */
export function createApp({ token, signingSecret, apiKey }) {
  const app = new App({ token, signingSecret })

  app.command("/anyr", async ({ command, ack, say }) => {
    await ack()
    const prompt = command.text?.trim()
    if (!prompt) {
      await say("Usage: /anyr <your question>")
      return
    }
    try {
      await say(await ask({ prompt, apiKey }))
    } catch (error) {
      await say(`AnyRouter error: ${error.message}`)
    }
  })

  return app
}

const token = process.env.SLACK_BOT_TOKEN
const signingSecret = process.env.SLACK_SIGNING_SECRET
if (token && signingSecret) {
  const app = createApp({ token, signingSecret, apiKey: process.env.ANYROUTER_API_KEY })
  await app.start(Number(process.env.PORT ?? 3000))
  console.log(`Slack bot listening on ${process.env.PORT ?? 3000}`)
}
