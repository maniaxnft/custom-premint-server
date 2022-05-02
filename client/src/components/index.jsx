import React from "react";
import "./App.css";

import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

import Header from "./header/Header";
import Body from "./body/Body";
import Footer from "./footer/Footer";


const App = () => {
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
      
      <div>
        <Header />
        <Body />
        <Footer />
      </div>
    </GoogleReCaptchaProvider>
  );
};

export default App;
