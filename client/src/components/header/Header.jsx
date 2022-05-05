import React from "react";
import "./Header.css";

import { useSelector } from "react-redux";

import ConnectWallet from "../connect-wallet";

const Header = () => {
  const isMetamaskPresent = useSelector((state) => state.isMetamaskPresent);

  return (
    <nav className="header">
      <div className="header-content">
        <div className="header-logo unselectable">
          {process.env.REACT_APP_PROJECT_NAME}
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
