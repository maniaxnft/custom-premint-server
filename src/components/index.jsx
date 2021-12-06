import React, { useMemo } from "react";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  getLedgerWallet,
  getPhantomWallet,
  getSlopeWallet,
  getSolflareWallet,
  getSolletExtensionWallet,
  getSolletWallet,
  getTorusWallet,
} from "@solana/wallet-adapter-wallets";
import {
  WalletModalProvider,
} from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";

import Header from "./header/Header";
import Body from "./body/Body";
import Footer from "./footer/Footer";
import "./App.css";


const network = process.env.REACT_APP_SOLANA_NETWORK;
const rpcHost = process.env.REACT_APP_SOLANA_RPC_HOST;
const startDateSeed = parseInt(process.env.REACT_APP_CANDY_START_DATE, 10);
const txTimeout = 30000;

const App = () => {
  const endpoint = useMemo(() => clusterApiUrl(network), []);
  const wallets = useMemo(
    () => [
      getPhantomWallet(),
      getSlopeWallet(),
      getSolflareWallet(),
      getTorusWallet({
        options: { clientId: "Get a client ID @ https://developer.tor.us" },
      }),
      getLedgerWallet(),
      getSolletWallet({ network }),
      getSolletExtensionWallet({ network }),
    ],
    []
  );
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
        <ConnectionProvider endpoint={endpoint}>
          <WalletProvider wallets={wallets} autoConnect>
            <WalletModalProvider>
              <Header
                startDate={startDateSeed}
                txTimeout={txTimeout}
              />
              <Body />
              <Footer />
            </WalletModalProvider>
          </WalletProvider>
        </ConnectionProvider>
      </div>
    </GoogleReCaptchaProvider>
  );
};

export default App;
