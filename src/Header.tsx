import { Link } from "react-router-dom";
import "./Header.css";

const Header = () => {
  return (
    <header className="Header">
      <Link to="/">
        <h1>Hello World</h1>
      </Link>
    </header>
  );
};

export default Header;
