import { Link } from "react-router-dom";
import React from "react";

const GateKeeper: React.FC = () => {
  return (
    <div className="enter">
      {/* <h1 className="welcome">Welcome</h1> */}
      <h3 className="enterPersonalPortfolio">
        <Link className="personalPortfolioLink" to="/personal-page">
          Personal Portfolio
        </Link>
      </h3>
      <h3 className="bar">|</h3>
      <h3 className="enterProfessionalServices">
        <Link className="professionalServicesLink" to="/professional-services">
          Professional Services
        </Link>
      </h3>
    </div>
  );
};

export default GateKeeper;
