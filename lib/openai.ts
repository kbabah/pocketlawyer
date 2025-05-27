import OpenAI from 'openai';

// Define model constants for easy reference throughout the application
export const OPENAI_MODELS = {
  GPT4: "gpt-4",
  GPT41: "gpt-4.1", // Updated to use gpt-4.1 directly
  GPT4O_SEARCH: "gpt-4o-search-preview", // New search-optimized model
  GPT35_TURBO: "gpt-3.5-turbo",
};

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});