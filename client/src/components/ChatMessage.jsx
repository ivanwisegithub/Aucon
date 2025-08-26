import React from 'react';
import ReactMarkdown from 'react-markdown';

export default function ChatMessage({ msg, onSend, onFeedback }) {
  return (
    <div className={`flex ${msg.fromUser ? 'justify-end' : 'justify-start'} flex-col`}>
      <div className={`px-4 py-2 rounded-lg text-sm max-w-[80%] ${
        msg.fromUser ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
      }`}>
        {!msg.fromUser && msg.category && (
          <div className="text-xs text-blue-500 font-medium mb-1">
            📂 Category: {msg.category}
          </div>
        )}
        <ReactMarkdown
          components={{
            p: ({ children }) => <p className="text-sm leading-relaxed">{children}</p>,
            strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
            ul: ({ children }) => <ul className="list-disc ml-5">{children}</ul>,
            li: ({ children }) => <li className="mb-1">{children}</li>,
            a: ({ href, children }) => (
              <a href={href} className="text-blue-600 underline hover:text-blue-800" target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            )
          }}
        >
          {msg.text}
        </ReactMarkdown>
        {msg.timestamp && (
          <div className="text-[10px] text-gray-500 mt-1">
            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>

      {/* Suggestions */}
      {msg.suggestions?.length > 0 && (
        <div className="mt-1 ml-2 space-y-1">
          {msg.suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => onSend(s)}
              className="text-sm text-blue-600 hover:underline block text-left"
            >
              👉 {s}
            </button>
          ))}
        </div>
      )}

      {/* Feedback */}
      {msg.feedbackPending && (
        <div className="flex gap-2 mt-1 ml-2 text-sm">
          <button onClick={() => onFeedback(msg.originalQuestion, true)} className="text-green-600 hover:underline">
            👍 Helpful
          </button>
          <button onClick={() => onFeedback(msg.originalQuestion, false)} className="text-red-600 hover:underline">
            👎 Not Helpful
          </button>
        </div>
      )}
    </div>
  );
}
