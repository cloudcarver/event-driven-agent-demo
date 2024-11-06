import { model } from "../../../lib/models";
import { z } from 'zod';
import { streamText } from "ai";
import { NextRequest } from "next/server";
import rw from "@/lib/rw";
import { nanoid } from "nanoid";
import { systemPrompt } from "./prompt";
import runllm from "@/lib/runllm";

async function runSQL(sql: string) {
  try {
    let res = await rw.query(sql);
    return JSON.stringify({
      "command": res.command,
      "rows": res.rows,
      "rowCount": res.rowCount,
    })
  } catch (e) {
    return `Error: ${e}`
  }
}

export async function POST(req: NextRequest) {
  const { messages } = await req.json();
  let result = await streamText({
    model: model,
    system: systemPrompt,
    messages,
    tools: {
      executeRisingWaveSQL: {
        description: 'Execute SQL statement on the RisingWave database, make sure the SQL statement is complete and correct',
        parameters: z.object({ sql: z.string() }),
        execute: async ({ sql }) => {
          let res = await runSQL(sql);
          return res;
        },
      },
      generateNanoID: {
        description: 'Generate a list of NanoIDs, which are unique string IDs globally',
        parameters: z.object({ num: z.number() }),
        execute: async ({ num }) => {
          let result = [];
          for (let i = 0; i < num; i++) {
            result.push(nanoid());
          }
          return result;
        }
      },
      currentTime: {
        description: 'Get the current time',
        parameters: z.object({}),
        execute: async () => {
          return new Date().toISOString();
        }
      },
      askRisingwaveExpert: {
        description: "Ask the RisingWave expert for help if you encounter issue. Attach the full context, including the intention, sql, error message, and any other relevant information.",
        parameters: z.object({
          question: z.string(),
        }),
        execute: async ({ question }) => {
          return await runllm(question);
        }
      }
    },
    maxSteps: 10,
    maxRetries: 2,
    toolChoice: "auto",
  });

  return result.toDataStreamResponse()
}
