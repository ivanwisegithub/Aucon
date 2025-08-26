import React, { useState, useEffect } from 'react';
import { FaCommentDots, FaPaperPlane, FaTimes, FaMicrophone, FaTrash } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import ChatMessage from './ChatMessage';

export default function LiveChatWidget() {
  const { currentUser } = useSelector((state) => state.user);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Got any questions? I'm happy to help.", fromUser: false },
    { text: "Quick intro - I'm your assistant. What brings you here today?", fromUser: false }
  ]);
  const [input, setInput] = useState('');
  const [faqQuestions, setFaqQuestions] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isListening, setIsListening] = useState(false);

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  // 🎤 Voice input
  const startListening = () => {
    if (!recognition) return alert('Speech recognition is not supported in this browser.');
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsListening(true);
    recognition.start();

    recognition.onresult = (event) => {
      setInput(event.results[0][0].transcript);
      setIsListening(false);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
  };

  // 💾 Load chat history
  useEffect(() => {
    const saved = localStorage.getItem('chatMessages');
    if (saved) setMessages(JSON.parse(saved));
  }, []);

  // 💾 Save chat history
  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  // 📚 Load FAQs
  useEffect(() => {
    fetch('/api/chat/faqs', { method: 'GET', credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setFaqQuestions(data);
        } else {
          console.warn('Unexpected FAQ response:', data);
          setFaqQuestions([]);
        }
      })
      .catch(err => {
        console.error('Failed to load FAQs:', err);
        setFaqQuestions([]);
      });
  }, []);

  const toggleChat = () => setIsOpen(!isOpen);

  const sendMessage = (customMessage = null) => {
    const userMessage = customMessage || input.trim();
    if (!userMessage) return;

    const context = messages.filter(m => m.fromUser).slice(-3).map(m => m.text);
    const newMessage = { text: userMessage, fromUser: true, timestamp: new Date().toISOString() };

    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setSuggestions([]);

    fetch('/api/chat/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ message: userMessage, userId: currentUser?._id || null, context })
    })
      .then(res => res.json())
      .then(data => {
        setMessages(prev => [
          ...prev,
          {
            text: data.reply,
            fromUser: false,
            category: data.category || null,
            feedbackPending: true,
            originalQuestion: userMessage,
            timestamp: new Date().toISOString()
          },
          ...(data.suggestions?.length
            ? [{
                text: `💡 You might also try:`,
                fromUser: false,
                suggestions: data.suggestions,
                timestamp: new Date().toISOString()
              }]
            : [])
        ]);
      })
      .catch(() => {
        setMessages(prev => [...prev, {
          text: "Sorry, something went wrong.",
          fromUser: false,
          timestamp: new Date().toISOString()
        }]);
      });
  };

  const sendFeedback = (question, wasHelpful) => {
    fetch('/api/chat/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, wasHelpful, userId: currentUser?._id || null })
    }).catch(err => console.error('Failed to send feedback:', err));

    setMessages(prev =>
      prev.map(msg =>
        msg.originalQuestion === question
          ? { ...msg, feedbackPending: false }
          : msg
      )
    );
  };

  const clearChat = () => {
    if (window.confirm('Clear all chat messages?')) {
      const initial = [
        { text: "Got any questions? I'm happy to help.", fromUser: false },
        { text: "Quick intro - I'm your assistant. What brings you here today?", fromUser: false }
      ];
      setMessages(initial);
      localStorage.setItem('chatMessages', JSON.stringify(initial));
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);

    if (Array.isArray(faqQuestions)) {
      const filtered = faqQuestions
        .filter(q => typeof q === 'string' && q.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 5);
      setSuggestions(filtered);
    } else {
      console.warn('faqQuestions is not an array:', faqQuestions);
      setSuggestions([]);
    }
  };

  return (
    <>
      {/* 💬 Floating Chat Button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition z-50"
      >
        <FaCommentDots size={20} />
      </button>

      {/* 🧠 Chat Window */}
      <div className={`fixed bottom-20 right-6 w-[350px] max-w-[90%] bg-white rounded-xl shadow-2xl transition-all duration-300 z-50 ${
        isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
      }`}>
        {/* Header */}
        <div className="bg-blue-600 text-white px-4 py-3 rounded-t-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="https://cdn-icons-png.flaticon.com/512/4712/4712027.png"
              alt="bot"
              className="w-8 h-8 rounded-full border-2 border-white"
            />
            <h4 className="font-semibold">Coco</h4>
          </div>
          <div className="flex gap-2">
            <button onClick={clearChat} title="Clear chat"><FaTrash /></button>
            <button onClick={toggleChat}><FaTimes /></button>
          </div>
        </div>

        {/* Messages */}
        <div className="p-4 h-64 overflow-y-auto space-y-2 bg-gray-50">
          {messages.map((msg, i) => (
            <ChatMessage
              key={i}
              msg={msg}
              onSend={sendMessage}
              onFeedback={sendFeedback}
            />
          ))}
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap gap-2 px-4 pb-2">
          {[
            'How do I reset my password?',
            'Can I submit feedback anonymously?',
            'What is this platform for?',
            'How do I track my feedback status?'
          ].map((label, i) => (
            <button
              key={i}
              className="border border-blue-600 text-blue-600 rounded-full px-4 py-1 text-sm hover:bg-blue-50"
              onClick={() => {
                setInput(label);
                setSuggestions([]);
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Input Field */}
        <div className="relative px-4 py-2 border-t border-gray-300">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask a question..."
            className="w-full text-sm pl-10 pr-10 py-2 rounded-md border border-gray-300 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring focus:border-blue-400"
          />

          {/* Microphone Button */}
          <button
            onClick={startListening}
            disabled={isListening}
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors ${
              isListening ? 'text-red-500 animate-pulse' : 'text-gray-500 hover:text-blue-600'
            }`}
            title={isListening ? 'Listening...' : 'Speak your question'}
          >
            <FaMicrophone />
          </button>

          {/* Suggestions Dropdown */}
          {Array.isArray(suggestions) && suggestions.length > 0 && (
                        <ul className="absolute bottom-full mb-1 bg-white border border-gray-300 rounded-md w-full z-50 max-h-40 overflow-y-auto text-sm shadow-lg">
              {suggestions.map((s, i) => (
                <li
                  key={i}
                  className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  onClick={() => {
                    setInput(s);
                    setSuggestions([]);
                  }}
                >
                  {s}
                </li>
              ))}
            </ul>
          )}

          {/* Send Button */}
          <button
            onClick={() => sendMessage()}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <FaPaperPlane />
          </button>
        </div>
      </div>
    </>
  );
}
