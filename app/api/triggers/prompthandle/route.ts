import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Provider } from "@/lib/models/types";
import { models } from "@/lib/models";

export async function POST(req: NextRequest): Promise<NextResponse<any>> {
  const { messages, prompt, provider, modelName }: { messages: any, prompt: string, provider: Provider, modelName: string } = await req.json();
  
  if (!models[provider]) {
    return new NextResponse(JSON.stringify({ error: `Invalid provider ${provider}` }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  let result = await generateText({
    model: models[provider](modelName),
    system: prompt,
    tools: {
      sendMessageToUser: {
        description: "",
        parameters: z.object({ message: z.string() }),
      }
    },
    messages,
    toolChoice: "required",
  })

  return NextResponse.json(result)
}
