
import { createGroq } from '@ai-sdk/groq';
import { createCohere } from '@ai-sdk/cohere';
import { createMistral } from '@ai-sdk/mistral';
import { createOpenAI } from '@ai-sdk/openai';
import fetch from "./proxidFetch";

const mistral = createMistral({
  apiKey: process.env.MISTRAL_API_KEY,
  fetch: fetch,
})

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
  fetch: fetch,
})

const cohere = createCohere({
  apiKey: process.env.COHEREL_API_KEY,
  fetch: fetch,
})

const xai = createOpenAI({
  name: "xai",
  apiKey: process.env.XAI_API_KEY,
  baseURL: "https://api.x.ai/v1",
})

const perplexity = createOpenAI({
  name: "perplexity",
  apiKey: process.env.PERPLEXITY_API_KEY,
  baseURL: "https://api.perplexity.ai/",
  fetch: fetch,
})

const fireworks = createOpenAI({
  name: "fireworks",
  apiKey: process.env.FIREWORKS_API_KEY,
  baseURL: "https://api.fireworks.ai/inference/v1",
  fetch: fetch,
})

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  fetch: fetch,
})


const models = {
  mistral,
  groq,
  cohere,
  xai,
  perplexity,
  fireworks,
  openai,
}

// const model = groq('llama3-70b-8192')
// const model = groq('llama3-groq-70b-8192-tool-use-preview')
// const model = cohere('command-r')
// const model = mistral('mistral-large-latest')
// const model = xai('grok-beta')
// const model = perplexity('llama-3.1-sonar-large-128k-online')
// const model = fireworks('accounts/fireworks/models/llama-v3p1-70b-instruct')
// const model = fireworks('accounts/fireworks/models/llama-v3p1-405b-instruct-long')
// let model = fireworks('accounts/fireworks/models/llama-v3p1-405b-instruct')

export {
  models,
};
