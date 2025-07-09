import React from 'react'
import './Footer.css'
import {Link} from 'react-router-dom'


export default function Footer() {
  return (
    <>
        <footer className='footer' data-theme='light'>
         <div className='footer-left-container'>
            <div className="toggle-container">
                <input type='checkbox' id='theme-radio-btn' className='radiobtn'  name={'theme'} />
                 <label htmlFor='theme-radio-btn' className='label-theme'>Dark Theme</label>
            </div>
        </div>


            <div className='footer-right-container'>
                <div className='footer-text-container'>
                    <Link to="#" className='footer-text-container' >powered by NYANZVI</Link>
                </div>
                 
                <div className='footer-text-container'>
                    <Link to="#" className='footer-text-container' >version 1.0.0</Link>
                </div>
            </div>
        </footer>
    </>
  )
}
