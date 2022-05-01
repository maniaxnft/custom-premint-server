import React from "react";
import {
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";

import "./Header.css";
require("@solana/wallet-adapter-react-ui/styles.css");

const Header = ({
  candyMachineId,
  config,
  connection,
  startDate,
  treasury,
  txTimeout,
}) => {
  return (
    <nav className="header">
      <div className="header-content">
        <div className="header-logo unselectable"> {process.env.REACT_APP_PROJECT_NAME} </div>
        <div className="header-wallets">
          <WalletMultiButton className="header-wallets-connect-wallet" />
        </div>
      </div>
    </nav>
  );
};

export default Header;
