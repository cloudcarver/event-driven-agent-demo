'use client';

import { useEffect, useRef, useState } from 'react';
import { useChat } from 'ai/react';

import { border, btn } from "@/app/const/styles";
import Relation from '@/app/components/Relation';
import EventHandler from './components/EventHandler';

import { Provider } from "@/lib/models/types";

import { toast, Toaster } from "react-hot-toast";

const numLastMessagesForContext = 10;

interface ModelOption {
  display: string;
  value: string;
}

export default function Page() {
  const chatboxRef = useRef<HTMLDivElement>(null);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [relations, setRelations] = useState<Map<number, boolean>>(new Map());
  const [nextRelationId, setNextRelationId] = useState(0);

  const [showToolInvocations, setShowToolInvocations] = useState(true);

  const [inputHistory, setInputHistory] = useState<string[]>([]);
  const [messageTimes, setMessageTimes] = useState<{ [key: number]: Date }>({});

  const [modelNameOptions, setModelNameOptions] = useState<ModelOption[]>([]);

  const [provider, setProvider] = useState<Provider>('fireworks');
  const [modelName, setModelName] = useState('accounts/fireworks/models/llama-v3p1-405b-instruct');

  const { messages, input, setInput, handleInputChange, handleSubmit, setMessages } = useChat({
    keepLastMessageOnError: true,
    onToolCall: ({ toolCall }) => {
      console.log(toolCall.toolCallId, toolCall.toolName, toolCall.args);
    },
    // @ts-ignore
    experimental_prepareRequestBody: ({ messages }) => {
      let lastFewMessages = messages.slice(-numLastMessagesForContext);
      console.log(lastFewMessages, "lastFewMessages")
      return { messages: lastFewMessages, provider, modelName };
    },
    onError: async (error) => {
      toast.error(`${error}`);
    }
  });

  const onSubmitMessage = (e: any) => {
    setInputHistory([...inputHistory, input]);
    setMessageTimes(prev => ({ ...prev, [messages.length]: new Date() }));
    handleSubmit(e);
  }

  const setLastMessage = () => {
    if (inputHistory.length === 0) {
      return;
    }
    setInput(inputHistory[inputHistory.length - 1]);
  }

  useEffect(() => {
    let options = {
      "openai": [
        { display: "GPT-4o", value: "gpt-4o" },
        { display: "GPT-3.5", value: "gpt-3.5-turbo" },
      ],
      "groq": [
        { display: "llama-3-8B", value: "llama3-8b-8192" },
        { display: "llama-3-70B", value: "llama3-70b-8192" },
      ],
      "fireworks": [
        { display: "llama-405B-instruct", value: "accounts/fireworks/models/llama-v3p1-405b-instruct" },
        { display: "llama-70B-instruct", value: "accounts/fireworks/models/llama-v3p1-70b-instruct" }
      ],
      "mistral": [
        { display: "Mistral Large", value: "mistral-large-latest" },
      ],
      "cohere": [
        { display: "Command-R", value: "command-r" },
      ],
      "xai": [
        { display: "Grok Beta", value: "grok-beta" },
      ]
    }[provider];
    setModelNameOptions(options)
    setModelName(options[0].value)
  }, [provider])

  useEffect(() => {
    if (chatboxRef.current) {
      chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      setMessageTimes(prev => ({ ...prev, [messages.length - 1]: lastMessage.createdAt || new Date() }));
    }
  }, [messages]);

  return (

    <div className="h-screen w-screen whitespace-pre-line flex flex-col lg:flex-row font-sans bg-gradient-to-br from-white to-blue-50">
      <Toaster
        position="top-center"
        reverseOrder={false}
      />
      <div className="flex flex-col h-1/2 w-screen lg:h-full lg:w-2/5 p-2 font-geist-sans">
        <EventHandler modelName={modelName} provider={provider} />
        <div className="flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm h-[calc(100%-8rem)] mt-4">
          <div className="p-3 border-b border-gray-200 flex items-center gap-2">
            {/* <div className="flex-grow font-medium text-gray-700">Chat</div> */}
            <select
              className="h-8 px-2 bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 rounded-lg text-sm transition-colors"
              value={provider}
              onChange={(e) => {
                const newProvider = e.target.value as Provider;
                setProvider(newProvider);
              }}
            >
              <option value="openai">OpenAI</option>
              <option value="groq">Groq</option>
              <option value="fireworks">Fireworks</option>
              <option value="mistral">Mistral</option>
              <option value="cohere">Cohere</option>
              <option value="xai">xAI</option>
            </select>
            <select
              className="h-8 px-2 bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 rounded-lg text-sm transition-colors"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
            >
              {
                modelNameOptions.map((option, idx) => {
                  return <option key={idx} value={option.value}>{option.display}</option>
                })
              }
            </select>
            <button className="h-8 w-48 px-2 bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 rounded-lg text-sm transition-colors" onClick={
              () => setShowToolInvocations(!showToolInvocations)}>{showToolInvocations ? "Hide Tools" : "Show Tools"
              }
            </button>
            <button className="h-8 w-36 px-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm transition-colors" onClick={() => setMessages([])}>Clear</button>
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
            }}>Add</button>
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
                      }}>{"×"}</button>
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
