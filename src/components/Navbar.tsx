import React, { Component, createRef } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

interface NavbarState {
  activeLink: string;
}

class Navbar extends Component<{}, NavbarState> {
  private aboutRef = createRef<HTMLDivElement>();
  private socialMediaRef = createRef<HTMLDivElement>();

  constructor(props: {}) {
    super(props);
    this.state = {
      activeLink: "Home",
    };
  }

  handleLinkClick = (link: string) => {
    this.setState({ activeLink: link });
  };

  handleScroll = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" });
      this.setState({ activeLink: "About" });
    }
  };

  render() {
    return (
      <header className="navbar">
        <nav>
          <ul className="navbar-links">
            <li>
              <Link
                to="/"
                className={this.state.activeLink === "Home" ? "active" : ""}
                onClick={() => this.handleLinkClick("Home")}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to=""
                className={this.state.activeLink === "About" ? "active" : ""}
                onClick={() => this.handleScroll(this.aboutRef)}
              >
                About
              </Link>
            </li>
            <li>
              <Link
                to="/portfolio"
                className={
                  this.state.activeLink === "Portfolio" ? "active" : ""
                }
                onClick={() => this.handleLinkClick("Portfolio")}
              >
                Portfolio
              </Link>
            </li>
            <li>
              <Link
                to=""
                className={
                  this.state.activeLink === "socialMedia" ? "active" : ""
                }
                onClick={() => this.handleScroll(this.socialMediaRef)}
              >
                Social Media
              </Link>
            </li>
          </ul>
        </nav>
        <div className="references">
          <div ref={this.aboutRef} id="about" />
          <div ref={this.socialMediaRef} id="socialMedia" />
        </div>
      </header>
    );
  }
}

export default React.memo(Navbar);
