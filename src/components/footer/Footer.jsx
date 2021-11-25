import React from "react";
import "./Footer.css";

import Twitter from "../../assets/twitter.svg";
import Telegram from "../../assets/telegram.svg";
import Discord from "../../assets/discord.svg";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-social">
          <div className="footer-social-link unselectable">
            TWITTER
            <img src={Twitter} alt="twitter" className="footer-social-link-img"/>
          </div>
          <div className="footer-social-link unselectable">
            TELEGRAM
            <img src={Telegram} alt="telegram" className="footer-social-link-img"/>
          </div>
          <div className="footer-social-link unselectable">
            DISCORD
            <img src={Discord} alt="discord" className="footer-social-link-img"/>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
