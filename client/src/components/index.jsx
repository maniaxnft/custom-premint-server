import React, { useEffect } from "react";
import "./App.css";

import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import { Toaster } from "react-hot-toast";
import { useDispatch } from "react-redux";

import Header from "./header/Header";
import Body from "./body/Body";
import Footer from "./footer/Footer";
import { getUserInfo } from "../services";
import { ACTIONS } from "../state/actions";

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const initUser = async () => {
      try {
        const user = await getUserInfo();
        if (user?.discordName) {
          dispatch({
            type: ACTIONS.SET_DISCORD_NAME,
            payload: {
              data: user.discordName,
            },
          });
        }
        if (user?.twitterName) {
            dispatch({
              type: ACTIONS.SET_TWITTER_NAME,
              payload: {
                data: user.twitterName,
              },
            });
        }
      } catch (e) {
        console.log(e);
      }
    };
    initUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={process.env.REACT_APP_PUBLIC_RECAPTCHA_KEY}
      scriptProps={{
        async: false,
        defer: false,
        appendTo: "head",
        nonce: undefined,
      }}
    >
      <Toaster />
      <div>
        <Header />
        <Body />
        <Footer />
      </div>
    </GoogleReCaptchaProvider>
  );
};

export default App;
