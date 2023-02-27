import { Link } from "react-router-dom";
import React from "react";

const GateKeeper: React.FC = () => {
  return (
    <div className="enter">
      <Link className="personalPortfolioLink" to="/personal-page">
        Personal Portfolio
      </Link>
      <span className="bar">|</span>
      <Link className="professionalServicesLink" to="/professional-services">
        Professional Services
      </Link>
    </div>
  );
};

export default GateKeeper;
