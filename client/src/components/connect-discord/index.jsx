import React, { useEffect, useState } from "react";
import "./index.css";

import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import classNames from "classnames";

import Logo from "../../assets/discord.svg";
import { authenticateDiscord } from "../../services";
import { ACTIONS } from "../../state/actions";

const ConnectDiscord = () => {
  const discordName = useSelector((state) => state.discordName);
  const dispatch = useDispatch();
  const [success, setSuccess] = useState(false);

  const onClick = () => {
    if (!discordName) {
      window.location.replace(process.env.REACT_APP_DISCORD_AUTH_URL);
    }
  };

  const clearUrlParams = () => {
    const currURL = window.location.href;
    const url = currURL.split(window.location.host)[1].split("?")[0];
    window.history.pushState({}, document.title, url);
  };

  useEffect(() => {
    const authenticate = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      if (code) {
        try {
          const discordName = await authenticateDiscord(code);
          dispatch({
            type: ACTIONS.SET_DISCORD_NAME,
            payload: {
              data: discordName,
            },
          });
          clearUrlParams();
          setSuccess(true);
          toast.success(`Discord successfully connected, ${discordName}`);
          const canvas = document.getElementById("confetti");
          const myConfetti = window.confetti.create(canvas, {
            resize: true,
            useWorker: true,
          });
          myConfetti({
            particleCount: 300,
            spread: 400,
          });
          setTimeout(() => {
            window.confetti.reset();
            setSuccess(false);
          }, 1500);
        } catch (e) {
          dispatch({
            type: ACTIONS.SET_DISCORD_NAME,
            payload: {
              data: "",
            },
          });
          toast.error(e.message);
          clearUrlParams();
        }
      }
    };
    authenticate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div
        className={classNames({
          connect_discord: true,
          connect_discord__disabled: discordName,
        })}
        onClick={onClick}
      >
        <img src={Logo} alt="discord" className="connect_discord__logo" />
        <div className="connect_discord__text">
          {discordName
            ? `You are successfully connected, ${discordName}!`
            : "Connect Discord"}
        </div>
      </div>
      {success && <canvas id="confetti"></canvas>}
    </>
  );
};

export default ConnectDiscord;
