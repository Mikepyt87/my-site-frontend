import React from "react";
import Navbar from "./Navbar";
import PersonalTop from "./PersonalTop";
import personalBackgroundTop from "../assets/personalBackgroundTop.jpg";
import "./PersonalPage.css";

const PersonalPage: React.FC = () => (
  <div className="personalPage">
    <Navbar />
    <div className="personalTopContainer">
      <PersonalTop />
    </div>
  </div>
);

export default PersonalPage;
