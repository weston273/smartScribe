// ThemeToggle.js
import { useState } from 'react';

function ThemeToggle() {
  const [lightMode, setLightMode] =useState(false);

  const handleToggle = () => setLightMode((prev) => !prev);

  return (
    <div data-theme={lightMode ? 'light' : ''}>
      <input 
        type='checkbox' 
        id='theme-radio-btn'
        className='radiobtn'
        onClick={handleToggle}
        // {lightMode ? 'Switch to Dark Theme' : 'Switch to Light Theme'}
        /> 
        <label htmlFor='theme-radio-btn' className='label-theme' onClick={handleToggle}>Dark Theme</label>
    </div>
    
  )
}
export default ThemeToggle