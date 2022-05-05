import React from "react";
import "./index.css";

import { useSelector } from "react-redux";

import Logo from "../../assets/twitter.svg";

const ConnectTwitter = () => {
  const twitterName = useSelector((state) => state.twitterName);

  return (
    <div className="connect_twitter">
      <img src={Logo} alt="twitter" className="connect_twitter__logo" />
      <div className="connect_twitter__text">{twitterName ? `Connected to ${twitterName}` : 'Connect Twitter'}</div>
    </div>
  );
};

export default ConnectTwitter;
