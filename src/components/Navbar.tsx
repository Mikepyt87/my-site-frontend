// Navbar.tsx
import React, { useState } from "react";
import "./Navbar.css";

interface NavbarProps {}

const Navbar: React.FC<NavbarProps> = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand"></div>
      <button className="hamburger-menu" onClick={toggleMenu}>
        {isMenuOpen ? "✖" : "☰"}
      </button>
      {isMenuOpen && (
        <div className="navbar-menu">
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
