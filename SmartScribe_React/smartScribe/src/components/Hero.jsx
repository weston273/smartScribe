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
              <div className='message-content'>{message.text}</div>
              <div className='message-time'>{message.timestamp}</div>
            </div>
          ))}
        </div>
      )}

      {/* This button always shows (as per your request), at the bottom left of hero section */}
      <button className='new-chat-btn' onClick={onNewChat} title="Start New Chat">
        <MessageSquarePlus size={20} />
        <span>New Chat</span>
      </button>
    </div>
  );
}
