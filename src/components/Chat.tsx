'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useRef, useEffect, useState, useMemo, FormEvent } from 'react';
import { AlbumGrid } from './AlbumCard';

interface Album {
  id: number;
  title: string;
  artist: string;
  year: number;
  genres: string[];
  styles: string[];
  formats: string[];
  labels: string[];
  thumb: string;
  coverImage: string;
}

interface ToolResult {
  albums?: Album[];
}

interface ToolPart {
  type: 'tool-invocation';
  toolInvocation: {
    state: string;
    result?: ToolResult;
  };
}

interface TextPart {
  type: 'text';
  text: string;
}

type MessagePart = ToolPart | TextPart | { type: string };

interface Message {
  id: string;
  role: string;
  parts?: MessagePart[];
}

// Extract albums from tool invocations in a message
function extractAlbumsFromMessage(message: Message): Album[] {
  if (!message.parts) return [];

  const albums: Album[] = [];
  for (const part of message.parts) {
    if (part.type === 'tool-invocation') {
      const toolPart = part as ToolPart;
      if (toolPart.toolInvocation?.state === 'result' && toolPart.toolInvocation.result?.albums) {
        albums.push(...toolPart.toolInvocation.result.albums);
      }
    }
  }
  return albums;
}

// Get text content from message
function getMessageText(message: Message): string {
  if (!message.parts) return '';

  return message.parts
    .filter((p): p is TextPart => p.type === 'text')
    .map(p => p.text)
    .join('');
}

export function Chat() {
  const [input, setInput] = useState('');

  const transport = useMemo(() => new DefaultChatTransport({ api: '/api/chat' }), []);

  const { messages, sendMessage, status, error } = useChat({
    transport,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isLoading = status === 'streaming' || status === 'submitted';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput('');
  };

  const suggestions = [
    "What jazz albums do I have?",
    "Show me something from the 90s",
    "What's on Blue Note?",
    "Surprise me with something random",
    "Give me my collection stats",
    "Any electronic music?",
  ];

  return (
    <div className="flex flex-col h-screen bg-black">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-zinc-800 px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-12.5c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5zm0 5.5c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Discogs RAG</h1>
            <p className="text-sm text-zinc-500">Chat with your vinyl collection</p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-white mb-2">
                What&apos;s spinning today?
              </h2>
              <p className="text-zinc-500 mb-8">
                Ask me anything about your record collection
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInput(suggestion)}
                    className="px-4 py-2 bg-zinc-900 text-zinc-300 rounded-full text-sm hover:bg-zinc-800 hover:text-white transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            (messages as Message[]).map((message) => {
              const albums = extractAlbumsFromMessage(message);
              const text = getMessageText(message);

              return (
                <div
                  key={message.id}
                  className={`${
                    message.role === 'user' ? 'flex justify-end' : ''
                  }`}
                >
                  {message.role === 'user' ? (
                    <div className="bg-orange-600 text-white px-4 py-2 rounded-2xl rounded-br-md max-w-[80%]">
                      {text}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {text && (
                        <div className="text-zinc-200 leading-relaxed whitespace-pre-wrap">
                          {text}
                        </div>
                      )}
                      {albums.length > 0 && <AlbumGrid albums={albums} />}
                    </div>
                  )}
                </div>
              );
            })
          )}

          {isLoading && (
            <div className="flex items-center gap-2 text-zinc-500">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span>Digging through crates...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
              Error: {error.message}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input */}
      <footer className="flex-shrink-0 border-t border-zinc-800 px-4 py-4">
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your collection..."
              className="flex-1 bg-zinc-900 text-white placeholder-zinc-500 px-4 py-3 rounded-xl border border-zinc-700 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-6 py-3 bg-orange-600 text-white font-medium rounded-xl hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </div>
        </form>
      </footer>
    </div>
  );
}
