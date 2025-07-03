import React from 'react'
import './Essentials.css';
import AI from './../assets/AI.webp'
import Pdf from './../assets/pdf.webp'
import Cloud from '../assets/cloud.webp'
import {Link} from 'react-router-dom'

export default function Essentials() {
  return (
    <>
        <div className='essentials-container'>
        <span className='essentials'><img src={AI} alt="ai icon" /></span>
        <span className="essentials"><img src={Pdf} alt="pdf icon" /></span>
        <span className="notes-container"><h1>+</h1></span>
        <span className='essentials'><p>record</p></span>
        <span className="essentials"><img src={Cloud} alt="cloud icon" /></span>
    </div>
    </>
    
  )
}
