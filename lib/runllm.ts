import fetch from "./proxidFetch";

const runllmPrompt = `You are a helpful and professional SQL developer. Help users with the following question: \n`

interface RunLLMResponse {
  content: string
}

async function runllm(question: string): Promise<string> {
  try {
    let res = await fetch("https://api.runllm.com/api/v1/pipeline/29/chat/non-streaming", {
      method: "POST",
      body: JSON.stringify({
        message: runllmPrompt + question,
        source: "api",
      }),
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': 'llm_9hCX6QmyTvOYbZL0GYiSHA=='
      }
    })
    let { content }: RunLLMResponse = await res.json();
    return content
  } catch (e) {
    return `Query RunLLM error: ${e}`
  }
}

export default runllm;
