import React from 'react';
import { FaMicrophone, FaPaperPlane } from 'react-icons/fa';

export default function ChatInput({
  input,
  onChange,
  onSend,
  onVoice,
  isListening,
  suggestions,
  onSelectSuggestion
}) {
  return (
    <div className="relative px-4 py-2 border-t border-gray-300">
      <input
        type="text"
        value={input}
        onChange={onChange}
        onKeyDown={(e) => e.key === 'Enter' && onSend()}
        placeholder="Ask a question..."
        className="w-full text-sm pl-10 pr-10 py-2 rounded-md border border-gray-300 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring focus:border-blue-400"
      />

      {/* 🎤 Microphone Button */}
      <button
        onClick={onVoice}
        disabled={isListening}
        className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors ${
          isListening ? 'text-red-500 animate-pulse' : 'text-gray-500 hover:text-blue-600'
        }`}
        title={isListening ? 'Listening...' : 'Speak your question'}
      >
        <FaMicrophone />
      </button>

      {/* 🔍 Suggestions Dropdown */}
      {Array.isArray(suggestions) && suggestions.length > 0 && (
        <ul className="absolute bottom-full mb-1 bg-white border border-gray-300 rounded-md w-full z-50 max-h-40 overflow-y-auto text-sm shadow-lg">
          {suggestions.map((s, i) => (
            <li
              key={i}
              className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              onClick={() => onSelectSuggestion(s)}
            >
              {s}
            </li>
          ))}
        </ul>
      )}

      {/* 📤 Send Button */}
      <button
        onClick={onSend}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-800 transition-colors"
      >
        <FaPaperPlane />
      </button>
    </div>
  );
}
