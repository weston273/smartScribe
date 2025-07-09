import React, {useState} from 'react'
import './Hero.css'

export default function Hero() {
    const [text, setText] = useState('');

  return (
    
      <div className='hero-container' >
        <div className={text ? 'output-text' : 'placeholder-text'}>
        {text || 'SmartScribe'}
        </div>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type here..."
      />
     
        </div>
    
  )
}
