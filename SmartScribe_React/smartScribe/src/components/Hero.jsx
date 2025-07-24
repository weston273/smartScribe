import React from 'react';
import { MessageSquarePlus } from 'lucide-react';
import './Hero.css';

export default function Hero({ conversation, onNewChat }) {
  return (
    <div className='hero-container'>
      {conversation.length === 0 ? (
        <div className='placeholder-text'>SmartScribe</div>
      ) : (
        <div className='chat-messages'>
          {conversation.map((message, index) => (
            <div key={index} className={`message ${message.sender}`}>
              <div className='message-content'>
                {message.text.split('\n').map((line, lineIndex) => {
                  // Enhanced text rendering with better formatting
                  if (line.startsWith('# ')) {
                    return <h1 key={lineIndex} className="hero-h1">{line.substring(2)}</h1>;
                  } else if (line.startsWith('## ')) {
                    return <h2 key={lineIndex} className="hero-h2">{line.substring(3)}</h2>;
                  } else if (line.startsWith('### ')) {
                    return <h3 key={lineIndex} className="hero-h3">{line.substring(4)}</h3>;
                  } else if (line.startsWith('**') && line.endsWith('**')) {
                    return <strong key={lineIndex} className="hero-bold">{line.slice(2, -2)}</strong>;
                  } else if (line.startsWith('- ') || line.startsWith('* ')) {
                    return <div key={lineIndex} className="hero-bullet">• {line.substring(2)}</div>;
                  } else if (line.includes('```')) {
                    return <code key={lineIndex} className="hero-code">{line.replace(/```/g, '')}</code>;
                  } else if (line.trim() === '') {
                    return <br key={lineIndex} />;
                  } else {
                    return <div key={lineIndex} className="hero-text">{line}</div>;
                  }
                })}
              </div>
              <div className='message-time'>{message.timestamp}</div>
            </div>
          ))}
        </div>
      )}

      <button className='new-chat-btn' onClick={onNewChat} title="Start New Chat">
        <MessageSquarePlus size={20} />
        <span>New Chat</span>
      </button>
    </div>
  );
}