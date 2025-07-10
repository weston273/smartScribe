import React, { useState } from 'react';
import NavBar1 from '../components/NavBar1.jsx'
import Hero from '../components/Hero.jsx'
import Essentials from '../components/Essentials.jsx';
import Footer from '../components/Footer.jsx';
import SideBar from '../components/sidebar/SideBar.jsx' // Have to create don't forget


const Home = ({ theme, toggleTheme }) => {
  const [showSideBar, setShowSideBar] = useState(false);
  // Toggle Function
  const toggleSideBar =() => setShowSideBar(prev => !prev);

  // Visibility state for the input box
  const [showInput, setShowInput] = useState(false);

  // Function to toggle input visibility
  const toggleInput = () => setShowInput(prev => !prev);

  

  return (
    <>
      < NavBar1 theme ={theme} onSideBarToggle={toggleSideBar} />
      {showSideBar && <SideBar onClose={toggleSideBar} />}  {/* Conditionally render */}
      <Hero showInput={showInput} />
      <Essentials onNotesClick={toggleInput} />
      {/* Pass theme and toggleTheme to Footer */}
      <Footer theme={theme} toggleTheme={toggleTheme} />
    </>
  );
};

export default Home;
