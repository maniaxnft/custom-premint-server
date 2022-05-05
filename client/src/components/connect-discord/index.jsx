import React from "react";
import "./index.css";

import { useSelector } from "react-redux";

import Logo from "../../assets/discord.svg";

const ConnectDiscord = () => {
  const discordName = useSelector((state) => state.discordName);

  return (
    <div className="connect_discord">
      <img src={Logo} alt="discord" className="connect_discord__logo" />
      <div className="connect_discord__text">{discordName ? `Connected to ${discordName}` : 'Connect Discord'}</div>
    </div>
  );
};

export default ConnectDiscord;
