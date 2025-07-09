import React, { useEffect, useState } from "react";
// import useLocalStorage from "use-local-storage";
import { useNavigate } from "react-router-dom";
import "./SplashScreen.css";
import logo from "../assets/logo-nav.png";
import NavBar  from "../components/NavBar";


const SplashScreen = () => {
  
  // const [isDark, setIsDark] = useLocalStorage("isDark", preference)

  const [feature, setFeature] = useState("Loading SmartScribe features...");
  const navigate = useNavigate();

  useEffect(() => {

    const fetchFeatures = async () => {
      try {
        const res = await fetch(
          "https://mocki.io/v1/f7bfa7b7-8a11-4f7a-bbde-2df2a01b4c8b"
        );
        if (!res.ok) throw new Error("Network response not ok");
        const data = await res.json();

        const randomFeature =
          data.features[Math.floor(Math.random() * data.features.length)];
        setFeature(randomFeature);

        setTimeout(() => {
          navigate("/home");
        }, 5000);
      } catch (error) {
        console.error("Failed to fetch features:", error);
        setFeature("Welcome to SmartScribe!");
        setTimeout(() => {
          navigate("/home");
        }, 3000);
      }
    };

    fetchFeatures();
  }, [navigate]);

  return (
    <>
      {/* <NavBar /> */}
      <div className="splash-container" data-theme={"light"}>
      <img src={logo} alt="Smart Logo" className="splash-logo" />
      {/* <p className="loading-text">loading...</p> */}
      {feature && <p className="feature-text">{feature}</p>}
      </div>
    </>
    
  );
};

export default SplashScreen;
