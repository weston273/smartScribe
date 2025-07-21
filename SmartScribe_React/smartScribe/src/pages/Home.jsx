import React, { useState } from 'react';
import NavBar1 from '../components/NavBar1.jsx';
import Hero from '../components/Hero.jsx';
import Essentials from '../components/Essentials.jsx';
import Footer from '../components/Footer.jsx';
import SideBar from '../components/sidebar/SideBar.jsx';
import AccountDropDown from '../components/account/AccountDropDown.jsx';

const Home = ({ theme, toggleTheme }) => {
  const [showSideBar, setShowSideBar] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [summary, setSummary] = useState(''); // NEW: PDF summary

  const toggleSideBar = () => setShowSideBar(prev => !prev);
  const toggleAccountDropdown = () => setShowAccountDropdown(prev => !prev);
  const toggleInput = () => setShowInput(prev => !prev);
  const handleCloseDropdown = () => setShowAccountDropdown(false);

  return (
    <div className="home-wrapper">
      <NavBar1
        theme={theme}
        onSideBarToggle={toggleSideBar}
        onProfileClick={toggleAccountDropdown}
      />

      {showSideBar && <SideBar theme={theme} onClose={toggleSideBar} />}

      <main className="main-content">
        <Hero showInput={showInput} summary={summary} /> {/* ✅ pass summary */}
        <Essentials onNotesClick={toggleInput} onSummaryGenerated={setSummary} /> {/* ✅ pass setter */}
      </main>

      <Footer theme={theme} toggleTheme={toggleTheme} />

      {showAccountDropdown && (
        <AccountDropDown theme={theme} onClose={handleCloseDropdown} />
      )}
    </div>
  );
};

export default Home;
