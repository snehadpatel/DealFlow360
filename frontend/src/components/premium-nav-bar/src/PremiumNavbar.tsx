import React from "react";
import "./PremiumNavbar.css";

const PremiumNavbar: React.FC = () => {
  const navItems = ["Home", "About", "Services", "Contact"];

  return (
    <div className="navbar-wrapper">
      <nav className="premium-navbar">
        {navItems.map((item) => (
          <a href={`#${item.toLowerCase()}`} key={item} className="nav-item">
            <span>{item}</span>
            {/* The <i> tag acts as the container for our liquid wave effect */}
            <i></i>
          </a>
        ))}
      </nav>
    </div>
  );
};

export default PremiumNavbar;
