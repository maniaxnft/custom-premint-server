import { useState } from "react";

import { ethers } from "ethers";
import { SiweMessage } from "siwe";
import toast from "react-hot-toast";

import { getNonce, logout, validateSignature } from "../../../services";

const useMetamaskLogin = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [evmAddress, setEvmAddress] = useState("");

  const signAndVerifyMessage = async () => {
    try {
      setIsConnecting(true);

      // Connect Metamask
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const evmWalletAddresses = await provider.send("eth_requestAccounts", []);
      const walletAddress = evmWalletAddresses[0]

      // Sign Message
      const signer = provider.getSigner();
      const nonce = await getNonce({ walletAddress });
      const messageToSign = new SiweMessage({
        domain: window.location.host,
        address: walletAddress,
        statement: 'Sign in with Metamask to the app.',
        uri: window.location.origin,
        version: 1,
        nonce
      })
      const signature = await signer.signMessage(messageToSign);
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
      setEvmAddress(walletAddress)
    } catch (error) {
      if (error?.code !== 4001) {
        toast.error(error.message);
      }
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    logout();
  };

  return {
    isConnecting,
    signAndVerifyMessage,
    disconnect,
    evmAddress
  };
};

export default useMetamaskLogin;
