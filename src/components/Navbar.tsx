import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const [activeLink, setActiveLink] = useState<string>("Home");
  const aboutRef = useRef<HTMLDivElement>(null);
  const socialMediaRef = useRef<HTMLDivElement>(null);

  const handleLinkClick = (link: string) => {
    setActiveLink(link);
  };

  const handleScroll = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" });
      setActiveLink("About");
    }
  };

  return (
    <header className="glass-navbar">
      <nav>
        <ul className="glass-navbar-links">
          <li>
            <Link
              to="/"
              className={activeLink === "Home" ? "active" : ""}
              onClick={() => handleLinkClick("Home")}
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              to=""
              className={activeLink === "About" ? "active" : ""}
              onClick={() => handleScroll(aboutRef)}
            >
              About
            </Link>
          </li>
          <li>
            <Link
              to="/portfolio"
              className={activeLink === "Portfolio" ? "active" : ""}
              onClick={() => handleLinkClick("Portfolio")}
            >
              Portfolio
            </Link>
          </li>
          <li>
            <Link
              to=""
              className={activeLink === "socialMedia" ? "active" : ""}
              onClick={() => handleScroll(socialMediaRef)}
            >
              Social Media
            </Link>
          </li>
        </ul>
      </nav>
      <div className="references">
        <div ref={aboutRef} id="about" />
        <div ref={socialMediaRef} id="socialMedia" />
      </div>
    </header>
  );
}

export default React.memo(Navbar);
