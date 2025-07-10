import React, { useState } from 'react';
import NavBar1 from '../components/NavBar1.jsx'
import Hero from '../components/Hero.jsx'
import Essentials from '../components/Essentials.jsx';
import Footer from '../components/Footer.jsx';


const Home = ({ theme, toggleTheme }) => {
  // Visibility state for the input box
  const [showInput, setShowInput] = useState(false);

  // Function to toggle input visibility
  const toggleInput = () => setShowInput(prev => !prev);

  

  return (
    <>
      < NavBar1 theme ={theme} />
      <Hero showInput={showInput} />
      <Essentials onNotesClick={toggleInput} />
      {/* Pass theme and toggleTheme to Footer */}
      <Footer theme={theme} toggleTheme={toggleTheme} />
    </>
  );
};

export default Home;
