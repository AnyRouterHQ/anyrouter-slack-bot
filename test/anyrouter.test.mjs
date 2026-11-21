import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import {
  OFFICIAL_BASE_URL,
  findLookAlikes,
  assertOfficialBaseUrl,
  ask,
} from "../src/anyrouter.mjs"

test("the demo targets the official AnyRouter API root", () => {
  assert.equal(OFFICIAL_BASE_URL, "https://anyrouter.dev/api/v1")
  assert.equal(assertOfficialBaseUrl(), OFFICIAL_BASE_URL)
})

test("a look-alike base URL is refused", () => {
  assert.throws(() => assertOfficialBaseUrl("https://anyrouter.top/api/v1"), /non-official/)
})

test("ask posts to the official endpoint and returns the assistant text", async () => {
  const calls = []
  const original = globalThis.fetch
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), init })
    return {
      ok: true,
      json: async () => ({ choices: [{ message: { content: "pong" } }] }),
    }
  }
  try {
    const text = await ask({ model: "anyrouter/free", prompt: "ping", apiKey: "sk-ar-v1-test" })
    assert.equal(text, "pong")
    assert.equal(calls.length, 1)
    assert.equal(calls[0].url, `${OFFICIAL_BASE_URL}/chat/completions`)
    const body = JSON.parse(calls[0].init.body)
    assert.equal(body.model, "anyrouter/free")
    assert.equal(body.messages[0].content, "ping")
    assert.equal(calls[0].init.headers.authorization, "Bearer sk-ar-v1-test")
  } finally {
    globalThis.fetch = original
  }
})

test("an empty prompt is rejected before any request", async () => {
  await assert.rejects(() => ask({ prompt: "   " }), /prompt is required/)
})

test("the source never names a look-alike domain", () => {
  for (const file of ["src/app.mjs", "src/anyrouter.mjs", "README.md", "package.json"]) {
    const text = readFileSync(new URL(`../${file}`, import.meta.url), "utf8")
    assert.deepEqual(findLookAlikes(text), [], `${file} mentions a look-alike domain`)
  }
})
