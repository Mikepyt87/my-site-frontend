import "./PersonalPage.css";
import React from "react";
import Navbar from "./Navbar";
import PersonalTop from "./PersonalTop";
import personalBackgroundTop from "../assets/personalBackgroundTop.jpg";

const Landing: React.FC = () => {
  return (
    <div className="personalPage">
      <Navbar />
      <div className="personalTopContainer">
        <PersonalTop imageUrl={personalBackgroundTop} />
      </div>
    </div>
  );
};

export default Landing;
