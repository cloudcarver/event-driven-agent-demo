import { useEffect, useRef, useState } from "react";
import { GenerateTextResult } from "ai";
import { runAndSleep } from "@/lib/utils";
import { border } from "../const/styles";
import { Provider } from "@/lib/models/types";
import toast, { Toaster } from "react-hot-toast";

interface PollResponse {
  event?: Event
}

interface Event {
  id: string
  event: string
  prompt: string
}

async function promptHandle({ message, prompt, provider, modelName }: any): Promise<GenerateTextResult<any>> {
  let res = await fetch("/api/triggers/prompthandle", {
    method: "POST",
    body: JSON.stringify({
      messages: [{ role: "user", content: message }],
      prompt,
      provider,
      modelName,
    }),
    headers: { "Content-Type": "application/json" }
  })

  return await res.json()
}

interface EventHandlerProps {
  modelName: string
  provider: Provider
}

export default function EventHandler(props: EventHandlerProps) {

  const pollRef = useRef<string | null>(null);

  const [handlingPrompt, setHandlingPrompt] = useState<string>("");
  const [lastRefreshAt, setLastRefreshAt] = useState<Date | null>(null);

  const poll = async (): Promise<PollResponse> => {
    setLastRefreshAt(new Date());
    let res = await fetch('/api/triggers');
    let r: PollResponse = await res.json();
    return r;
  }

  const handle = async (id: string) => {
    let res = await fetch('/api/triggers', {
      method: 'POST',
      body: JSON.stringify({ id }),
      headers: { 'Content-Type': 'application/json' }
    })
    console.log(await res.json())
  }

  const epoch = async () => {
    let r = await poll();
    let e: Event;
    if (r.event) {
      e = r.event;
    } else {
      setHandlingPrompt("")
      return
    }

    setHandlingPrompt(e.prompt)

    let res = await promptHandle({
      prompt: "You're a helpful assistant, you can handle user's request by calling the proper tools.",
      message: e.prompt,
      provider: props.provider,
      modelName: props.modelName,
    })

    res.toolCalls.forEach(async (tc) => {
      if (tc.toolName === "sendMessageToUser") {
        toast.success(tc.args.message)
      }
    })

    await handle(e.id);
  }

  useEffect(() => {
    if (!pollRef.current) {
      pollRef.current = "set"
      runAndSleep(epoch, 1000)
    }

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    }
  }, [])

  return (
    <div className={border + " p-2"}>
      <div className="font-semibold mb-2">Event Handler</div>
      {
        handlingPrompt
          ? <div>
            <h1 className="text-blue-600 font-medium">Handling Prompt</h1>
            <p className="mt-1 text-gray-700">{handlingPrompt}</p>
          </div>
          : <div className="flex items-center gap-2 text-gray-600">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            <span>Last poll: {lastRefreshAt?.toLocaleTimeString()}</span>
          </div>
      }
    </div>
  );
}
