import React from "react";
import "./NavBar1.css";
import Logo from './../assets/logo-nav.png';
import Sidebar from './../assets/sidebar.png';
import Profile from '../assets/profile.png';
import {Link} from 'react-router-dom';

export default function NavBar1() {
    return(
      <>
      {/* the navbar */}
        <nav className="navbar">
        {/* left side of the navbar */}
          <div className="left-side-navbar">
            <span className="toggle-sidebar">
              <img src={Sidebar} alt="sidebar" />
            </span>
            <span className="logo-navbar">
              <img src={Logo} alt="logo" />
            </span>
          </div>
        {/* right side of the navbar */}
          <div className='profile-icon-container'>
            <Link to='#' className='profile-icon'>
              <img src={Profile} alt="profile-icon" />
            </Link>
            
          </div>
        </nav>
      </>
    )

}