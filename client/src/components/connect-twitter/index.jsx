import React from "react";
import "./index.css";

import Logo from "../../assets/twitter.svg";

const ConnectTwitter = () => {
  return (
    <div className="connect_twitter">
      <img src={Logo} alt="twitter" className="connect_twitter__logo" />
      <div className="connect_twitter__text">Connect Twitter</div>
    </div>
  );
};

export default ConnectTwitter;
