import React from "react";
import Calculator from "./Calculator/Calculator";
import Navbar from "./Navbar";
import "./PersonalPage.css";
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
    label: "3DP Step-Calc",
    content: (
      <div className="step-calc-wrapper">{/* <StepCalculator /> */}</div>
    ),
  },
  {
    label: "Tab 3",
    content: <div>Content for Tab 3</div>,
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
