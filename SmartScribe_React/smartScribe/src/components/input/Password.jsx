import React from 'react'
import EyeLight from '../../assets/eye.png'
import EyeDark from '../../assets/eye_dark.png'
import './Password.css'

function Input({theme}) {
    const Eye = theme === 'light' ? EyeDark : EyeLight


  return (
    <>
        <div class="password-wrapper">
            
            <input type="password" placeholder="Enter password" />
            <img src={Eye} alt="Lock" class="icon" />
        </div>
    </>
  )
}

export default Input