import {
  DefaultAzureCredential,
  getBearerTokenProvider,
} from "@azure/identity";
import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { AzureOpenAI } from "openai";

const app = new Hono();

const endpoint = process.env.AOAI_ENDPOINT;
const apiKey = process.env.AOAI_KEY;
const deployment = process.env.AOAI_DEPLOYMENT_NAME;
const apiVersion = process.env.AOAI_DEPLOYMENT_VERSION;

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/chat", async (c) => {
  const scope = "https://cognitiveservices.azure.com/.default";
  const azureADTokenProvider = getBearerTokenProvider(
    new DefaultAzureCredential(),
    scope
  );
  const client = new AzureOpenAI({
    endpoint,
    apiKey,
    deployment,
    apiVersion,
  });

  const base64img = "";
  const result = await client.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant. You will talk like a pirate.",
      },
      { role: "user", content: "Can you help me?" },
      {
        role: "assistant",
        content: "Arrrr! Of course, me hearty! What can I do for ye?",
      },
      {
        role: "user",
        content: [
          { type: "text", text: "What is this?" },
          {
            type: "image_url",
            image_url: {
              url: `data:image/png;base64,${base64img}`,
            },
          },
        ],
      },
    ],
    model: "",
  });

  for (const choice of result.choices) {
    console.log(choice.message);
  }
  return c.text(result.choices[0]?.message.content ?? "No response");
});

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
