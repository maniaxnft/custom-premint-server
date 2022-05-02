import React from "react";
import "./Header.css";

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
        </div>
      </div>
    </nav>
  );
};

export default Header;
