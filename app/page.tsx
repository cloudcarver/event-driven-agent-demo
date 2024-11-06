'use client';

import { useEffect, useRef, useState } from 'react';
import { useChat } from 'ai/react';
import { border, btn } from "@/app/const/styles";
import Relation from '@/app/components/Relation';
import EventHandler from './components/EventHandler';

const numLastMessagesForContext = 10;

export default function Page() {
  const chatboxRef = useRef<HTMLDivElement>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const [numRelations, setNumRelations] = useState(0);

  const [showToolInvocations, setShowToolInvocations] = useState(true);

  const [inputHistory, setInputHistory] = useState<string[]>([]);

  const { messages, input, setInput, handleInputChange, handleSubmit, setMessages } = useChat({
    keepLastMessageOnError: true,
    onToolCall: ({ toolCall }) => {
      console.log(toolCall.toolCallId, toolCall.toolName, toolCall.args);
    },
    // @ts-ignore
    experimental_prepareRequestBody: ({ messages }) => {
      let lastFewMessages = messages.slice(-numLastMessagesForContext);
      console.log(lastFewMessages)
      return { messages: lastFewMessages };
    },
  });

  const onSubmitMessage = (e: any) => {
    setInputHistory([...inputHistory, input]);
    handleSubmit(e);
  }

  const setLastMessage = () => {
    if (inputHistory.length === 0) {
      return;
    }
    setInput(inputHistory[inputHistory.length - 1]);
  }

  useEffect(() => {
    if (chatboxRef.current) {
      chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
    }
  }, [messages])

  return (
    <div className="h-screen w-screen whitespace-pre-line flex flex-col lg:flex-row font-mono">
      <div className="flex flex-col justify-between h-1/2 w-screen lg:h-full lg:w-1/3 p-2">
        <div className="w-full flex flex-row my-2 gap-2">
          <button className={btn + " w-36"} onClick={() => setMessages([])}>New Thread</button>
          <button className={btn + " w-48"} onClick={() => setShowToolInvocations(!showToolInvocations)}>{
            showToolInvocations ? "Hide Tool Invocations" : "Show Tool Invocations"
          }</button>
        </div>
        <div ref={chatboxRef} className="overflow-y-auto">
          {messages.map((message, mid) => {
            let isUser = message.role === 'user';
            return <div key={mid}>
              {
                message.content && <div className="my-2">
                  {isUser ? 'Me: ' : 'AI: '} {message.content}
                </div>
              }
              {
                showToolInvocations && message.toolInvocations?.map((tool, tid) => {
                  let result;
                  if (tool.state === "result") {
                    result = tool.result
                  } else {
                    result = "<pending for result>";
                  }
                  return <div key={mid + ':' + tid} className="p-2 text-sm text-gray-500 break-all">
                    <div >{"(" + tool.toolName + ") " + JSON.stringify(tool.args)}</div>
                    <div>{result}</div>
                  </div>
                })
              }
            </div>
          })}
        </div>
        <div className="my-8 w-full">
          <form className="w-full flex flex-row" onSubmit={onSubmitMessage}>
            <input ref={inputRef} className={`h-8 w-full ${border}`} name="prompt" value={input} onChange={handleInputChange} onKeyDown={e => { e.code === "ArrowUp" && setLastMessage() }} />
            <button className={btn + " mx-2"} type="submit">Send</button>
          </form>
        </div>
      </div>
      <div className="flex flex-col p-2">
        <EventHandler />
        <div className="flex flex-row gap-2 my-2">
          <button className={btn + " h-8 w-48"} onClick={() => setNumRelations(numRelations + 1)}>Add New Relation</button>
          <button className={btn + " h-8 w-48"} onClick={() => numRelations > 0 && setNumRelations(numRelations - 1)}>Remove Relation</button>
        </div>
        <div className="gap-2 flex flex-col">
          {
            numRelations !== 0 && Array.from(Array(numRelations).keys()).map((_, idx) => <Relation key={idx} />)
          }
        </div>
      </div>
    </div>
  );
}
