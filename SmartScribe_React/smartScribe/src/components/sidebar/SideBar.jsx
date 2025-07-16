import React from 'react';
import './SideBar.css'
import {Link} from 'react-router-dom'

import Sidebar from '../../assets/sidebar.png';
import LogoNav from '../../assets/logo-nav.png';
// nav items
import HomeDark from  '../../assets/home_sideBar_icon.png'
import HomeLight from '../../assets/home_sideBar_icon_light.png'
import NotesLight from '../../assets/note_side_bar_icon_light.png'
import NotesDark from '../../assets/note_side_bar_icon.png'
import AILight from '../../assets/AI_icon_sideBar_light.png'
import AIDark from '../../assets/AI_icon_sideBar.png'
import QuizzLight from '../../assets/quizz_icon_side_bar_light.png'
import QuizzDark from '../../assets/quizz_icon_side_bar.png'
// account image
import profileLight from '../../assets/profile_dark.png'
import profileDark from '../../assets/profile.png'

export default function SideBar({ theme, onClose }) {
    const HomeIcon = theme === 'dark' ? HomeDark : HomeLight;
    const NotesIcon = theme === 'dark' ? NotesDark : NotesLight;
    const Quizz = theme === 'light' ? QuizzLight : QuizzDark;
    const Profile = theme === 'dark' ? profileDark : profileLight

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
                {/* Home Nav item */}
                <li className='nav-item'>
                    <Link to='/home' className='nav-link'>
                        <div className='icon-text icon-home' >
                        <div className='icon-box'>
                            <img src={HomeIcon} alt="DashBoard" className='icon'/>
                        </div>
                        <span className='link-container'>
                            <p>Dashboard</p>
                        </span>
                    </div>
                    </Link>
                    
                </li>
                {/* Notes Nav Item */}
                <li className='nav-item'>
                    <Link to='#' className='nav-link'>                   
                        <div className='icon-text'>
                            <div className='icon-box'>
                                <img src={NotesIcon} alt="Notes" className='notes-icon'/>
                            </div>
                            <span className='link-container'>
                                <p>Notes</p>
                            </span>
                        </div>
                    </Link>
                </li>
                {/* Quizz section */}
                <li className='nav-item'>
                    <Link to='/quiz' className='nav-link'>  
                        <div className='icon-text'>
                        <div className='icon-box'>
                            <img src={Quizz} alt="AI Chat" className='icon'/>
                        </div>
                             <span className='link-container'>
                                 <p>Quizz</p>
                             </span>
                        </div>
                    </Link>
                    
                </li>
            </ul>
        </div>
            <div className='horizontal-line btm-line'>
                <hr />
            </div>

            <div className='account-container'>
                <Link className='account Link' to='/login'>
                    <div className='image-container'>
                        <img src={Profile} alt="account image" />
                    </div>
                    <div className='account-link-container'>
                            <p>
                               Account 
                            </p>
                    </div>
                    
                </Link>
            </div>
        </div>
    )
}
