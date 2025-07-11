import React from 'react'
import './Essentials.css';
import AI from './../assets/AI.webp'
import Pdf from './../assets/pdf.webp'
import Cloud from '../assets/cloud.webp'
import {Link} from 'react-router-dom'

export default function Essentials({ onNotesClick}) {
  return (
    
        <section className='essentials-container' >
        
        <span className='essentials'>
          <Link to='/' aria-label="Artificial Intelligence features">
            <img src={AI} alt="ai icon" />
          </Link>
          </span>

        <span className="essentials" >
          <Link to='/'aria-label="PDF features" >
            <img src={Pdf} alt="pdf icon" />
          </Link>
        </span>

        <span className="essentials-notes" onClick={onNotesClick} >
          <Link to='' aria-label="Take Notes">
            <h1>+</h1>
          </Link>
        </span>

        <span className='essentials' >
          <Link to='/' aria-label="Recording features">
            <p>record</p>
          </Link>
        </span>

        <span className="essentials" >
          <Link to='/'>
            <img src={Cloud} alt="cloud icon" aria-label="Cloud features"/>
          </Link>
        </span>
    </section>
  
    
  )
}
