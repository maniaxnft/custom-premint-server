import React from "react";
import "./Header.css";

const Header = () => {
  return (
    <nav className="header">
      <div className="header-content">
        <div className="header-logo unselectable"> SOLMANIACS </div>
        <div className="header-connect-wallet-button unselectable">Connect Wallet</div>
      </div>
    </nav>
  );
};

export default Header;
