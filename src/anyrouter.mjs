import { LOOK_ALIKE_HOSTS, OFFICIAL_BASE_URL } from "./config.mjs"

export { OFFICIAL_BASE_URL } from "./config.mjs"

export function findLookAlikes(text) {
  return LOOK_ALIKE_HOSTS.filter((host) => String(text).includes(host))
}

/** Throw unless the endpoint is the official AnyRouter API root. */
export function assertOfficialBaseUrl(baseUrl = OFFICIAL_BASE_URL) {
  if (baseUrl !== OFFICIAL_BASE_URL) {
    throw new Error(`refusing a non-official AnyRouter base URL: ${baseUrl}`)
  }
  const hits = findLookAlikes(baseUrl)
  if (hits.length > 0) {
    throw new Error(`non-official domain in base URL: ${hits.join(", ")}`)
  }
  return baseUrl
}

/**
 * Ask AnyRouter one prompt and return the assistant text.
 *
 * Data shape: `{ model, prompt, apiKey, signal }` in, `string` out. The request
 * is a plain OpenAI Chat Completions call, so the gateway routes it and fails
 * over like any other.
 */
export async function ask({
  model = "anyrouter/free",
  prompt,
  apiKey = process.env.ANYROUTER_API_KEY ?? "",
  signal,
}) {
  assertOfficialBaseUrl()
  if (typeof prompt !== "string" || prompt.trim() === "") {
    throw new Error("prompt is required")
  }
  const response = await fetch(`${OFFICIAL_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(apiKey ? { authorization: `Bearer ${apiKey}` } : {}),
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      stream: false,
    }),
    signal,
  })
  if (!response.ok) {
    throw new Error(`AnyRouter chat failed: HTTP ${response.status}`)
  }
  const body = await response.json()
  const text = body?.choices?.[0]?.message?.content
  if (typeof text !== "string") {
    throw new Error("AnyRouter returned no message content")
  }
  return text
}
