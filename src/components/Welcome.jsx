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
          <h3 className="clickToEnter">
            <Link className="enterLink" to="/landing">
              Click to enter
            </Link>
          </h3>
        </div>
      </section>
    </div>
  );
};

export default Main;
