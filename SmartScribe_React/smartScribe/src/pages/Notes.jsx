import React, { useState } from 'react';
import './Notes.css';
import NavBar1 from '../components/NavBar1.jsx';
import SideBar from '../components/sidebar/SideBar.jsx';
import Footer from '../components/Footer.jsx';
import AccountDropDown from '../components/account/AccountDropDown.jsx';

export default function Notes({ theme, toggleTheme }) {
  const [showSideBar, setShowSideBar] = useState(true);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [customCategories, setCustomCategories] = useState([]);


  const toggleSideBar = () => setShowSideBar(prev => !prev);
  const toggleAccountDropdown = () => setShowAccountDropdown(prev => !prev);
  const handleCloseDropdown = () => setShowAccountDropdown(false);

  return (
    <div className="notes-wrapper">
      <NavBar1 theme={theme} onSideBarToggle={toggleSideBar} onProfileClick={toggleAccountDropdown} />

      <div className="notes-body">
        {showSideBar && <SideBar theme={theme} onClose={toggleSideBar} />}
        
        <main className="notes-main">
          {/* Tab filters */}
          <div className="note-tabs">
            <button className="tab active">All</button>
            <button className="tab">Personal</button>
            <button className="tab">Projects</button>
            <button className="tab">Business</button>
          </div>

          {/* Note Actions */}
<div className="note-actions">
  <div className="category-toggle-wrapper">
    <button className="category-toggle" onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}>
      + Add to Category
    </button>
            {showCategoryDropdown && (
              <div className="category-dropdown">
                {['Personal', 'Projects', 'Business'].map(cat => (
                  <div key={cat} className="dropdown-item">{cat}</div>
                ))}
                <button className="create-category-btn" onClick={() => {
                  const newCat = prompt('Enter new category name:');
                  if (newCat) setCustomCategories([...customCategories, newCat]);
                }}>
                  + Create Category
                </button>
              </div>
            )}
            </div>
        </div>


          {/* Note Cards */}
          <div className="note-grid">
            {Array(6).fill().map((_, index) => (
              <div key={index} className="note-card">
                <div className="note-tag">Personal</div>
                <h3 className="note-title">Meeting with Alice</h3>
                <p className="note-snippet">
                  I have interesting project for Josh. And we need to review all details of this project...
                </p>
                <div className="note-footer">
                  <div className="note-avatars">
                    <img src="/avatar1.png" alt="User" />
                    <img src="/avatar2.png" alt="User" />
                  </div>
                  <div className="note-time">12:00, Friday</div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {showAccountDropdown && (
        <AccountDropDown theme={theme} onClose={handleCloseDropdown} />
      )}

      <Footer theme={theme} toggleTheme={toggleTheme} />
    </div>
  );
}
