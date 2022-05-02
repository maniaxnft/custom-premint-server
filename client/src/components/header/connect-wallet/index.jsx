import React from "react";

import useMetamaskLogin from "./useMetamaskLogin";

const ConnectWallet = () => {
  const { isConnecting, signAndVerifyMessage, disconnectMetamask } =
    useMetamaskLogin();

  return (
    <div>
      <button>Disconnect</button>
    </div>
  );
};
export default ConnectWallet;
