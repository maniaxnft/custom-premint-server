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
          <a
            className="footer-social-link"
            href={process.env.REACT_APP_TWITTER_URL}
          >
            TWITTER
            <img
              src={Twitter}
              alt="twitter"
              className="footer-social-link-img"
            />
          </a>
          <a
            className="footer-social-link"
            href={process.env.REACT_APP_TELEGRAM_URL}
          >
            TELEGRAM
            <img
              src={Telegram}
              alt="telegram"
              className="footer-social-link-img"
            />
          </a>
          <a
            className="footer-social-link"
            href={process.env.REACT_APP_DISCORD_URL}
          >
            DISCORD
            <img
              src={Discord}
              alt="discord"
              className="footer-social-link-img"
            />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
