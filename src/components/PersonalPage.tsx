import React from "react";
import Calculator from "./Calculator/Calculator";
import Navbar from "./Navbar";
import "./PersonalPage.css";
import Quiz from "./Quiz/Quiz";

import ResponsiveTabNavigation from "./ResponsiveTabNavigation";
// import StepCalculator from "./StepCalculator/StepCalculator";

const tabs = [
  {
    label: "Simple Calculator",
    content: (
      <div className="calc-wrapper">
        <Calculator />
      </div>
    ),
  },
  {
    label: "Quiz App",
    content: (
      <div className="quiz-app-wrapper">
        <Quiz />
      </div>
    ),
  },
  {
    label: "tomorrow",
    content: <div>tomorrow works</div>,
  },
];

const PersonalPage: React.FC = () => {
  return (
    <div className="personal-page">
      <Navbar />
      <ResponsiveTabNavigation tabs={tabs} />
    </div>
  );
};

export default PersonalPage;
