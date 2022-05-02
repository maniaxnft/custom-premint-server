import { useState } from "react";
import detectEthereumProvider from "@metamask/detect-provider";
import { ethers } from "ethers";
import toast from "react-hot-toast";

import { getNonce, logout, validateSignature } from "../../../services";

const useMetamaskLogin = () => {
  const [isConnecting, setIsConnecting] = useState(false);

  const checkIfMetamaskPresent = async () => {
    const provider = await detectEthereumProvider();
    if (provider) {
      startApp(provider);
    } else {
      throw new Error("Please install MetaMask!");
    }
    function startApp(provider) {
      if (provider !== window.ethereum) {
        throw new Error("Do you have multiple wallets installed?");
      }
    }
  };

  const signAndVerifyMessage = async () => {
    try {
      await checkIfMetamaskPresent();
      setIsConnecting(true);

      // Connect Metamask
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const evmWalletAddresses = await provider.send("eth_requestAccounts", []);

      // Sign Message
      const signer = provider.getSigner();
      const nonce = await getNonce({ evmAddress: evmWalletAddresses[0] });
      const signature = await signer.signMessage(nonce);
      const evmAddress = await signer.getAddress();

      // Verify  Message
      const signerAddress = ethers.utils.verifyMessage(nonce, signature);
      if (signerAddress !== evmAddress) {
        setIsConnecting(false);
        throw new Error("Your message could not be verified!");
      }
      await validateSignature({
        evmAddress,
        nonce,
        signature,
      });
      setIsConnecting(false);
    } catch (error) {
      if (error?.code !== 4001) {
        toast.error(error.message);
      }
      setIsConnecting(false);
    }
  };

  const disconnectMetamask = () => {
    logout();
  };

  return {
    isConnecting,
    signAndVerifyMessage,
    disconnectMetamask,
  };
};

export default useMetamaskLogin;
