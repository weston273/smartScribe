import React from "react";
import { Routes, Route} from 'react-router-dom'
import SplashScreen from '../src/pages/SplashScreen.jsx' ;
import NavBar from '../src/components/NavBar.jsx';
import Home from '../src/pages/Home.jsx'



function App() {
  
    return (
      
          <Routes>
            <Route path="/" element={<SplashScreen />} />
            <Route path="/home" element={<Home />} />
          </Routes>
      
      );
}

export default App;
