import React from 'react';
import './Login.css'
import { Link } from 'react-router-dom';
import Input from '../components/input/Input'
import Password from '../components/input/Password'

export default function Login() {
    return(
      <div className='login-container'>
        <div className='first-half'>
            <div className='first-half-top'>
                <h1 className='h1-first-half-top'>
                    Welcome back! 
                </h1>
                <p> 
                    Smarter notes. Sharper focus. <br />
                Greater impact - with SmartScribe
                </p>

                <div className='input-boxes'>
                    <Input />
                    <Password />
                </div>
                
            </div>
        </div>
        <div className='second-half'>
            <div className='card-container'>
                <p>Smarter Notes Start Here. Note it. Know it. Nail it.</p>
            </div>
        </div>
      </div>
    )
}