import React from "react";
import "./Header.css";

import { useSelector } from "react-redux";

import Logo from "../../assets/logo.jpg";
import ConnectWallet from "../connect-wallet";

const Header = () => {
  const isMetamaskPresent = useSelector((state) => state.isMetamaskPresent);

  return (
    <nav className="header">
      <div className="header-content">
        <div className="header-logo">
          <img className="header-logo-image" src={Logo} alt="logo" />
          <div className="header-logo-text unselectable">
            {process.env.REACT_APP_PROJECT_NAME}{" "}
          </div>
        </div>
        {isMetamaskPresent && (
          <div className="header-wallets">
            <ConnectWallet />
          </div>
        )}
      </div>
    </nav>
  );
};

export default Header;
