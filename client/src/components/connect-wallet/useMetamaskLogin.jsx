import { useCallback, useEffect, useState } from "react";

import { ethers } from "ethers";
import toast from "react-hot-toast";

import {
  getNonce,
  logout,
  validateSignature,
  isAuthenticated,
} from "../../services";
import { useDispatch, useSelector } from "react-redux";
import { ACTIONS } from "../../state/actions";

const useMetamaskLogin = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const dispatch = useDispatch();
  const address = useSelector((state) => state.walletAddress);

  const checkIsAuthenticated = useCallback(async () => {
    try {
      const walletAddress = await isAuthenticated();
      if (walletAddress) {
        dispatch({
          type: ACTIONS.SET_WALLET_ADDRESS,
          payload: {
            data: walletAddress,
          },
        });
      } else {
        dispatch({
          type: ACTIONS.SET_WALLET_ADDRESS,
          payload: {
            data: "",
          },
        });
      }
    } catch (e) {
      dispatch({
        type: ACTIONS.SET_WALLET_ADDRESS,
        payload: {
          data: "",
        },
      });
    }
  }, [dispatch]);

  useEffect(() => {
    checkIsAuthenticated();
  }, [checkIsAuthenticated]);

  const signAndVerifyMessage = async () => {
    if (!address) {
      try {
        setIsConnecting(true);
        await switchNetworkToAvalanche();

        // Connect Metamask
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const evmWalletAddresses = await provider.send(
          "eth_requestAccounts",
          []
        );
        const walletAddress = evmWalletAddresses[0];

        // Sign Message
        const signer = provider.getSigner();
        const nonce = await getNonce({ walletAddress });

        const signature = await signer.signMessage(nonce);
        const evmAddress = await signer.getAddress();

        // Verify  Message
        const signerAddress = ethers.utils.verifyMessage(nonce, signature);
        if (signerAddress !== evmAddress) {
          setIsConnecting(false);
          throw new Error("Your message could not be verified!");
        }
        await validateSignature({
          walletAddress,
          nonce,
          signature,
        });
        setIsConnecting(false);
        dispatch({
          type: ACTIONS.SET_WALLET_ADDRESS,
          payload: {
            data: walletAddress,
          },
        });
      } catch (error) {
        if (error?.code !== 4001) {
          toast.error(error.message);
        }
        dispatch({
          type: ACTIONS.SET_WALLET_ADDRESS,
          payload: {
            data: "",
          },
        });
        setIsConnecting(false);
      }
    }
  };

  const disconnect = () => {
    logout();
  };

  const switchNetworkToAvalanche = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xa86a" }],
      });
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0xa86a",
                chainName: "Avalanche Network",
                rpcUrls: ["https://api.avax.network/ext/bc/C/rpc"],
              },
            ],
          });
        } catch (addError) {
          throw new Error(addError);
        }
      } else {
        throw new Error("Please switch to Avalanche Network");
      }
      // handle other "switch" errors
    }
  };

  return {
    isConnecting,
    signAndVerifyMessage,
    disconnect,
    walletAddress: address,
  };
};

export default useMetamaskLogin;
