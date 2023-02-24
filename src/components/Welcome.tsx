import "./Welcome.css";
import BackgroundVideo from "./BackgroundVideo";
import Name from "./Name";
import GateKeeper from "./GateKeeper";
import React from "react";

const Main: React.FC = () => {
  return (
    <div className="Main">
      <BackgroundVideo />
      <section className="content">
        <Name />
        <GateKeeper />
      </section>
    </div>
  );
};

export default Main;