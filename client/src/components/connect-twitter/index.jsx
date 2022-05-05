import React, { useEffect, useState } from "react";
import "./index.css";

import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import classNames from "classnames";

import Logo from "../../assets/twitter.svg";
import { ACTIONS } from "../../state/actions";
import { authenticateTwitter, requestTwitterToken } from "../../services";

const ConnectTwitter = () => {
  const twitterName = useSelector((state) => state.twitterName);

  const dispatch = useDispatch();
  const [success, setSuccess] = useState(false);

  const onClick = async () => {
    if (!twitterName) {
      try {
        const oauth_token = await requestTwitterToken();
        window.location.href = `https://api.twitter.com/oauth/authenticate?oauth_token=${oauth_token}`;
      } catch (e) {
        toast.error(e.message);
      }
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
          const twitterName = await authenticateTwitter(code);
          dispatch({
            type: ACTIONS.SET_TWITTER_NAME,
            payload: {
              data: twitterName,
            },
          });
          clearUrlParams();
          setSuccess(true);
          toast.success(`Twitter successfully connected, ${twitterName}`);
          const canvas = document.getElementById("confetti_twitter");
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
            type: ACTIONS.SET_TWITTER_NAME,
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
          connect_twitter: true,
          connect_twitter__disabled: twitterName,
        })}
        onClick={onClick}
      >
        <img src={Logo} alt="twitter" className="connect_twitter__logo" />
        <div className="connect_twitter__text">
          {twitterName ? `Connected to ${twitterName}` : "Connect Twitter"}
        </div>
      </div>
      {success && <canvas id="confetti_twitter"></canvas>}
    </>
  );
};

export default ConnectTwitter;
