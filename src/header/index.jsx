import React from "react";
import "./header.css";

const Header = () => {
  return (
    <nav className="header">
      <div className="header-content">
        <div className="header-logo not-selectable"> SOLMANIACS </div>
        <div className="header-connect-wallet-button not-selectable">Connect Wallet</div>
      </div>
    </nav>
  );
};

export default Header;
