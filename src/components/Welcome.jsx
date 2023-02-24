import "./Welcome.css";
import { Link } from "react-router-dom";
import welcomePageVideo from "../assets/welcomePageVideo3.mp4";
import name from "../assets/name-01.svg";

const Main = () => {
  return (
    <div className="Main">
      <video
        className="welcomePageVideo"
        src={welcomePageVideo}
        autoPlay
        loop
        muted
      />

      <section className="content">
        <img src={name} alt="name" className="name" />
        <div className="enter">
          {/* <h1 className="welcome">Welcome</h1> */}
          <h3 className="enterPersonalPortfolio">
            <Link className="personalPortfolioLink" to="/personal-portfolio">
              Personal Portfolio
            </Link>
          </h3>
          <h3 className="bar">|</h3>
          <h3 className="enterProfessionalServices">
            <Link
              className="professionalServicesLink"
              to="/professional-services"
            >
              Professional Services
            </Link>
          </h3>
        </div>
      </section>
    </div>
  );
};

export default Main;
