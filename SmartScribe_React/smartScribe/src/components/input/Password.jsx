import React from 'react'
import EyeLight from '../../assets/eye.png'
import EyeDark from '../../assets/eye_dark.png'
import './Password.css'

function Input({ theme }) {
    const Eye = theme === 'light' ? EyeLight : EyeDark


  return (
    <>
        <div className="password-wrapper">
            <input type="password" placeholder="Enter password" className='input-password'/>
            <img key={theme}src={Eye} alt="Lock" className="icon" />
        </div>
    </>
  )
}

export default Input