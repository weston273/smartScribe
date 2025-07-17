import React, { useState } from 'react';
import NavBar1 from '../components/NavBar1.jsx'
import Hero from '../components/Hero.jsx'
import Essentials from '../components/Essentials.jsx';
import Footer from '../components/Footer.jsx';
import SideBar from '../components/sidebar/SideBar.jsx' // Have to create don't forget
import AccountDropDown from '../components/account/AccountDropDown.jsx';

const Home = ({ theme, toggleTheme }) => {
  const [showSideBar, setShowSideBar] = useState(false);
  // Account dropdown function
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  
  // Toggle Function
  const toggleSideBar =() => setShowSideBar(prev => !prev);
  const toggleAccountDropdown = () => setShowAccountDropdown(prev => !prev);

  // Visibility state for the input box
  const [showInput, setShowInput] = useState(false);

  // Function to toggle input visibility
  const toggleInput = () => setShowInput(prev => !prev);

  // For detecting clicks outside dropdown
  const handleCloseDropdown = () => setShowAccountDropdown(false);

  

  return (
    <div className="home-wrapper">
      <NavBar1 theme={theme} onSideBarToggle={toggleSideBar} onProfileClick={toggleAccountDropdown} />
    {showSideBar && <SideBar theme={theme} onClose={toggleSideBar} />}
    
    <main className="main-content">
      <Hero showInput={showInput} />
      <Essentials onNotesClick={toggleInput} />
    </main>

    <Footer theme={theme} toggleTheme={toggleTheme} />

    {showAccountDropdown && (
      <AccountDropDown
        theme={theme}
        onClose={handleCloseDropdown}
      />
    )}
  </div>
);

};

export default Home;
