import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Minimize2, Maximize2 } from 'lucide-react';
import api from '../services/api';

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi there! I am your KEVIN assistant. Ask me anything about the platform, AI Matcher, or GitHub integrations!' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isMinimized]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    
    // Add user message to state
    const newMessages = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await api.post('/ai/chat', {
        message: userMsg,
        history: messages
      });

      if (response.data.success) {
        setMessages([...newMessages, { role: 'assistant', content: response.data.data.reply }]);
      }
    } catch (error) {
      setMessages([...newMessages, { role: 'assistant', content: 'Oops! I am having trouble connecting to the server. Please try again later.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000,
          background: 'var(--accent-orange, #f97316)', color: 'white',
          border: 'none', borderRadius: '50%', width: '60px', height: '60px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)', cursor: 'pointer',
          transition: 'transform 0.2s ease',
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <MessageSquare size={24} />
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000,
      width: '350px', height: isMinimized ? '60px' : '500px',
      background: 'white', borderRadius: '12px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden', transition: 'height 0.3s ease',
      border: '1px solid #e5e7eb'
    }}>
      {/* Header */}
      <div style={{
        background: 'var(--accent-orange, #f97316)', color: 'white', padding: '1rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        cursor: 'pointer'
      }} onClick={() => setIsMinimized(!isMinimized)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
          <MessageSquare size={18} /> KEVIN Assistant
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 0 }}>
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 0 }}>
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Chat Body */}
      {!isMinimized && (
        <>
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: '#f9fafb' }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                background: msg.role === 'user' ? '#111827' : 'white',
                color: msg.role === 'user' ? 'white' : '#1f2937',
                padding: '0.75rem 1rem',
                borderRadius: msg.role === 'user' ? '12px 12px 0 12px' : '12px 12px 12px 0',
                border: msg.role === 'assistant' ? '1px solid #e5e7eb' : 'none',
                fontSize: '14px', lineHeight: '1.5'
              }}>
                {msg.content}
              </div>
            ))}
            {isLoading && (
              <div style={{ alignSelf: 'flex-start', background: 'white', color: '#6b7280', padding: '0.5rem 1rem', borderRadius: '12px 12px 12px 0', border: '1px solid #e5e7eb', fontSize: '13px' }}>
                Typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} style={{
            padding: '1rem', background: 'white', borderTop: '1px solid #e5e7eb',
            display: 'flex', gap: '0.5rem'
          }}>
            <input
              type="text"
              placeholder="Ask about KEVIN..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              style={{
                flex: 1, padding: '0.75rem', border: '1px solid #d1d5db',
                borderRadius: '8px', outline: 'none', fontSize: '14px'
              }}
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              style={{
                background: 'var(--accent-orange, #f97316)', color: 'white',
                border: 'none', borderRadius: '8px', padding: '0 1rem',
                cursor: (isLoading || !input.trim()) ? 'default' : 'pointer',
                opacity: (isLoading || !input.trim()) ? 0.7 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <Send size={18} />
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default ChatbotWidget;
