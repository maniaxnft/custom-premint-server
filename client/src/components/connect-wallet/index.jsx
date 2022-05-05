import React from "react";
import "./index.css";

import useMetamaskLogin from "./useMetamaskLogin";
import MetamaskLogo from "../../assets/metamask.png";

const ConnectWallet = () => {
  const { isConnecting, signAndVerifyMessage, walletAddress } =
    useMetamaskLogin();

  const truncateEthAddress = (address) => {
    const truncateRegex = /^(0x[a-zA-Z0-9]{4})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$/;
    const match = String(address).match(truncateRegex);
    if (!match) return address;
    return `${match[1]}…${match[2]}`;
  };

  return (
    <div
      className={`metamask-button ${isConnecting ? "disabledbutton" : ""}`}
      onClick={signAndVerifyMessage}
    >
      <img className="metamask-button-img" src={MetamaskLogo} alt="metamask" />
      {walletAddress ? <span className="connectedDot"></span> : <></>}
      <div className="metamask-button-text unselectable">
        {!walletAddress && !isConnecting && "Connect Metamask"}
        {walletAddress && `Connected to ${truncateEthAddress(walletAddress)}`}
        {!walletAddress && isConnecting && "Connecting..."}
      </div>
    </div>
  );
};
export default ConnectWallet;
