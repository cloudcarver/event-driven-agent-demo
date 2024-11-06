import { generateText } from "ai";
import { model } from "../../../../lib/models";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function POST(req: NextRequest): Promise<NextResponse<any>> {
  const { messages, prompt } = await req.json();
  let result = await generateText({
    model: model,
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
