import React from "react";
import "./Header.css";

import ConnectWallet from "./connect-wallet";

const Header = () => {
  return (
    <nav className="header">
      <div className="header-content">
        <div className="header-logo unselectable">
          {process.env.REACT_APP_PROJECT_NAME}
        </div>
        <div className="header-wallets">
          <ConnectWallet />
        </div>
      </div>
    </nav>
  );
};

export default Header;
