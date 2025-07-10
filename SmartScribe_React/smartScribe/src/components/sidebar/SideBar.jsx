import React from 'react';
import './SideBar.css'

import Sidebar from '../../assets/sidebar.png';
import LogoNav from '../../assets/logo-nav.png';

export default function SideBar({ onClose }) {
    return (
        <div className='sidebar'>
            <div className='top-sidebar'>
                <span className='logo-container'>
                    <img src={LogoNav} alt="logo" />
                </span>
                <span className='close-btn-container'>
                    <button className='close-btn' onClick={onClose}>
                        <img src={Sidebar} alt="sidebar" />
                    </button>
                </span>
            </div>
            <div className='horizontal-line'>
                <hr />
            </div>
        <div className='sidebar-content'>
            <ul>
                <li>
                    Home
                </li>
            </ul>
        </div>
        </div>
    )
}
