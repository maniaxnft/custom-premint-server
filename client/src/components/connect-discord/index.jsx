import React from "react";
import "./index.css";

import Logo from "../../assets/discord.svg";

const ConnectDiscord = () => {
  return (
    <div className="connect_discord">
      <img src={Logo} alt="discord" className="connect_discord__logo" />
      <div className="connect_discord__text">Connect Discord</div>
    </div>
  );
};

export default ConnectDiscord;
