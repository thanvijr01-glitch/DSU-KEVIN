import React, { useState, useEffect, useRef, useContext } from 'react';
import { Send } from 'lucide-react';
import { io } from 'socket.io-client';
import { AuthContext } from '../context/AuthContext';

const TeamChat = ({ teamId }) => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Determine backend URL
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    // Connect to Socket.io
    socketRef.current = io(backendUrl, {
      withCredentials: true,
    });

    socketRef.current.on('connect', () => {
      setIsConnected(true);
      // Join the specific team room with our userId
      socketRef.current.emit('joinTeam', { teamId, userId: user?._id || user?.uid });
    });

    socketRef.current.on('onlineUsers', (users) => {
      setOnlineUsers(users);
    });

    socketRef.current.on('userTyping', ({ userName, isTyping }) => {
      setTypingUsers(prev => {
        const next = new Set(prev);
        if (isTyping) next.add(userName);
        else next.delete(userName);
        return next;
      });
    });

    socketRef.current.on('receiveMessage', (messageData) => {
      setMessages((prev) => [...prev, messageData]);
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [teamId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleTyping = (e) => {
    setInput(e.target.value);
    
    if (socketRef.current) {
      socketRef.current.emit('typing', { teamId, userName: user?.name, isTyping: true });
      
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current.emit('typing', { teamId, userName: user?.name, isTyping: false });
      }, 1000);
    }
  };

  const triggerIcebreaker = () => {
    if (socketRef.current) {
      socketRef.current.emit('triggerAIIcebreaker', teamId);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || !socketRef.current) return;

    const messageData = {
      teamId,
      message: input.trim(),
      senderName: user?.displayName || user?.name || 'Anonymous',
      senderId: user?._id || user?.uid,
      timestamp: new Date().toISOString(),
    };

    // Optimistically add to our own UI
    setMessages((prev) => [...prev, messageData]);
    
    // Emit to server
    socketRef.current.emit('sendMessage', messageData);
    socketRef.current.emit('typing', { teamId, userName: user?.name, isTyping: false });
    
    setInput('');
  };

  return (
    <div style={{
      background: 'white', borderRadius: '12px', border: '1px solid #E5E7EB',
      display: 'flex', flexDirection: 'column', height: '400px',
      overflow: 'hidden', marginTop: '2rem'
    }}>
      <div style={{
        background: '#F9FAFB', padding: '1rem', borderBottom: '1px solid #E5E7EB',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h3 className="serif text-black" style={{ margin: 0, fontSize: '18px' }}>Team Chat</h3>
          <span style={{ fontSize: '12px', background: '#DBEAFE', color: '#1E40AF', padding: '2px 8px', borderRadius: '99px', fontWeight: 'bold' }}>
            {onlineUsers.length} Online Now
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={triggerIcebreaker}
            style={{ fontSize: '12px', background: '#F3F4F6', border: '1px solid #D1D5DB', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}
          >
            🤖 AI Icebreaker
          </button>
          <span style={{ fontSize: '12px', color: isConnected ? '#059669' : '#DC2626', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isConnected ? '#10B981' : '#EF4444' }}></span>
            {isConnected ? 'Live' : 'Connecting...'}
          </span>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {messages.length === 0 ? (
          <div style={{ color: '#6B7280', textAlign: 'center', marginTop: 'auto', marginBottom: 'auto', fontSize: '14px' }}>
            No messages yet. Say hi to your team!
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.senderId === (user?._id || user?.uid);
            return (
              <div key={idx} style={{
                alignSelf: isMe ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
                display: 'flex', flexDirection: 'column'
              }}>
                {!isMe && <span style={{ fontSize: '11px', color: '#6B7280', marginBottom: '0.25rem' }}>{msg.senderName}</span>}
                <div style={{
                  background: isMe ? '#111827' : (msg.senderId === 'ai-assistant' ? '#FEF3C7' : '#F3F4F6'),
                  color: isMe ? 'white' : '#1F2937',
                  padding: '0.5rem 1rem',
                  borderRadius: isMe ? '12px 12px 0 12px' : '12px 12px 12px 0',
                  fontSize: '14px', lineHeight: '1.4'
                }}>
                  {msg.message}
                </div>
              </div>
            );
          })
        )}
        {typingUsers.size > 0 && (
          <div style={{ fontSize: '12px', color: '#6B7280', fontStyle: 'italic' }}>
            {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} style={{
        padding: '1rem', borderTop: '1px solid #E5E7EB', display: 'flex', gap: '0.5rem'
      }}>
        <input
          type="text"
          value={input}
          onChange={handleTyping}
          placeholder="Message your team..."
          style={{
            flex: 1, padding: '0.75rem', border: '1px solid #D1D5DB',
            borderRadius: '8px', outline: 'none', fontSize: '14px'
          }}
        />
        <button 
          type="submit" 
          disabled={!input.trim()}
          style={{
            background: '#111827', color: 'white', border: 'none',
            borderRadius: '8px', padding: '0 1rem', cursor: input.trim() ? 'pointer' : 'default',
            opacity: input.trim() ? 1 : 0.5, display: 'flex', alignItems: 'center'
          }}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default TeamChat;
