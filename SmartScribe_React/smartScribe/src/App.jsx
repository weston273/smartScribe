import React from "react";
import { Routes, Route} from 'react-router-dom'
import SplashScreen from '../src/pages/SplashScreen.jsx' ;
import NavBar from '../src/components/NavBar.jsx';
import Home from '../src/pages/Home.jsx'
import { ThemeProvider } from '../src/components/theme/ThemeProvide.jsx';
import ThemeToggle from '../src/components/theme/ThemeToggle.jsx';
import { ThemeContext } from './components/theme/ThemeContext.jsx'; // if needed


function App() {
  
    return (
      <ThemeProvider>
        <ThemeToggle />
          <Routes>
            <Route path="/" element={<SplashScreen />} />
            <Route path="/home" element={<Home />} />
          </Routes>
      </ThemeProvider>
      
      
      
      
      );
}

export default App;
