'use client';

import { useEffect, useRef, useState } from 'react';
import { useChat } from 'ai/react';

import { border, btn } from "@/app/const/styles";
import Relation from '@/app/components/Relation';
import EventHandler from './components/EventHandler';

const numLastMessagesForContext = 10;

export default function Page() {
  const chatboxRef = useRef<HTMLDivElement>(null);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [relations, setRelations] = useState<Map<number, boolean>>(new Map());
  const [nextRelationId, setNextRelationId] = useState(0);

  const [showToolInvocations, setShowToolInvocations] = useState(true);

  const [inputHistory, setInputHistory] = useState<string[]>([]);
  const [messageTimes, setMessageTimes] = useState<{[key: number]: Date}>({});

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
    setMessageTimes(prev => ({...prev, [messages.length]: new Date()}));
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
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      setMessageTimes(prev => ({...prev, [messages.length - 1]: lastMessage.createdAt || new Date()}));
    }
  }, [messages]);

  return (
    <div className="h-screen w-screen whitespace-pre-line flex flex-col lg:flex-row font-sans bg-gradient-to-br from-white to-blue-50">
      <div className="flex flex-col h-1/2 w-screen lg:h-full lg:w-1/3 p-2 font-geist-sans">
        <EventHandler />
        <div className="flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm h-[calc(100%-8rem)] mt-4">
          <div className="p-3 border-b border-gray-200 flex items-center gap-2">
            <div className="flex-grow font-medium text-gray-700">Chat</div>
            <button className="h-8 w-36 px-2 bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 rounded-lg text-sm transition-colors" onClick={() => setMessages([])}>New Thread</button>
            <button className="h-8 w-48 px-2 bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 rounded-lg text-sm transition-colors" onClick={() => setShowToolInvocations(!showToolInvocations)}>{
              showToolInvocations ? "Hide Tool Invocations" : "Show Tool Invocations"
            }</button>
          </div>
          <div ref={chatboxRef} className="flex-grow overflow-y-auto px-4 py-2">
            {messages.map((message, mid) => {
              let isUser = message.role === 'user';
              return <div key={mid}>
                {
                  message.content && <div className={`my-2 ${isUser ? 'text-right' : ''}`}>
                    <div>
                      <div className={`p-3 rounded-lg inline-block shadow-sm text-left max-w-[80%] ${isUser ? 'bg-blue-500 text-white rounded-br-none' : 'bg-white border border-gray-200 rounded-bl-none'}`}>
                        {message.content}
                      </div>
                      <div className="text-xs mt-1 text-gray-400">
                        {messageTimes[mid]?.toLocaleTimeString()}
                      </div>
                    </div>
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
                    return <div key={mid + ':' + tid} className="p-2 text-sm text-gray-500 break-all text-center">
                      <div >{"(" + tool.toolName + ") " + JSON.stringify(tool.args)}</div>
                      <div>{result}</div>
                    </div>
                  })
                }
              </div>
            })}
          </div>
          <div className="p-4 border-t border-gray-200">
            <form className="w-full flex flex-row" onSubmit={onSubmitMessage}>
              <textarea 
                ref={inputRef} 
                className={`h-24 w-full p-3 ${border} focus:ring-2 focus:ring-blue-200 focus:outline-none`} 
                rows={3}
                name="prompt" 
                value={input} 
                onChange={handleInputChange} 
                onKeyDown={e => { 
                  if (e.code === "ArrowUp") setLastMessage();
                  if (e.code === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    onSubmitMessage(e);
                  }
                }} 
              />
              <button className={btn + " mx-2"} type="submit">Send</button>
            </form>
          </div>
        </div>

      </div>
      <div className="flex flex-col p-2">
        <div className="flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-3 border-b border-gray-200 flex items-center gap-2">
            <div className="flex-grow font-medium text-gray-700">Relations</div>
            <button className={btn + " h-8 w-48"} onClick={() => {
              setRelations(new Map(relations.set(nextRelationId, true)));
              setNextRelationId(nextRelationId + 1);
            }}>Add New Relation</button>
          </div>
          <div className="p-2">
            <div className="gap-2 flex flex-col">
              {
                Array.from(relations.entries()).map(([id, _]) => (
                  <div key={id} className="flex flex-col">
                    <div className="flex justify-end mb-1">
                      <button className="text-gray-500 hover:text-red-500" onClick={() => {
                        const newRelations = new Map(relations);
                        newRelations.delete(id);
                        setRelations(newRelations);
                      }}>×</button>
                    </div>
                    <Relation />
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
