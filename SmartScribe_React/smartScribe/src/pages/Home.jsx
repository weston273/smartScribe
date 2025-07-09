import React from 'react';
import NavBar1 from '../components/NavBar1.jsx'
import Hero from '../components/Hero.jsx'
import Essentials from '../components/Essentials.jsx';
import Footer from '../components/Footer.jsx';
const Home = ({ theme, toggleTheme }) => {
  return (
    <>
      < NavBar1 theme ={theme} />
      <Hero />
      <Essentials />
      {/* Pass theme and toggleTheme to Footer */}
      <Footer theme={theme} toggleTheme={toggleTheme} />
    </>
    
  );
};

export default Home;
