import OpenAI from "openai";

export const OPENAI_MODELS = {
  GPT4: "gpt-4",
  GPT41: "gpt-4.1",
  GPT4O: "gpt-4o",
  GPT4O_MINI: "gpt-4o-mini",
  GPT4O_SEARCH: "gpt-4o-search-preview",
  GPT35_TURBO: "gpt-3.5-turbo",
} as const;

let client: OpenAI | null = null;

/** Lazy OpenAI client — avoids build-time failure when OPENAI_API_KEY is unset */
export function getOpenAIClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      "The OPENAI_API_KEY environment variable is missing or empty; either provide it, or instantiate the OpenAI client with an apiKey option."
    );
  }
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}
