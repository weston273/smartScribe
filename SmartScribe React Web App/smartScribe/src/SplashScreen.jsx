import React from "react";
import "./SplashScreen.css";
import logo from "../src/assets/logo.png"; 

const SplashScreen = () => {
  return (
    <div className="splash-container">
      <img src={logo} alt="Smart Logo" className="splash-logo" /> 
      <p className="loading-text">loading...</p>
    </div>
  );
};

export default SplashScreen;
