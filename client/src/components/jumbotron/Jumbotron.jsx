import React, { useEffect } from "react";
import "./Jumbotron.css";

import { useSelector, useDispatch } from "react-redux";
import detectEthereumProvider from "@metamask/detect-provider";
import toast from "react-hot-toast";

import { ACTIONS } from "../../state/actions";
import ConnectDiscord from "../connect-discord";
import ConnectTwitter from "../connect-twitter";

const Jumbotron = () => {
  const dispatch = useDispatch();
  const isMetamaskPresent = useSelector((state) => state.isMetamaskPresent);
  const walletAddress = useSelector((state) => state.walletAddress);

  const checkIfMetamaskPresent = async () => {
    const provider = await detectEthereumProvider();
    if (provider) {
      dispatch({
        type: ACTIONS.IS_METAMASK_PRESENT,
        payload: {
          data: true,
        },
      });
      startApp(provider);
    } else {
      dispatch({
        type: ACTIONS.IS_METAMASK_PRESENT,
        payload: {
          data: false,
        },
      });
    }
    function startApp(provider) {
      if (provider !== window.ethereum) {
        toast.error("Do you have multiple wallets installed?");
      }
    }
  };

  useEffect(() => {
    checkIfMetamaskPresent();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="jumbotron">
      <div className="jumbotron__content">
        <div className="jumbotron__content__title">
          {!isMetamaskPresent && <>You need to install Metamask to get </>}
          {isMetamaskPresent && (
            <>Connect your Metamask, Discord and Twitter to get </>
          )}
          <span className="jumbotron__content__title__highlight">
            Special Roles in {process.env.REACT_APP_PROJECT_NAME} Discord!
          </span>
        </div>
        <div className="jumbotron__content__connect">
        {
          walletAddress && <ConnectDiscord /> 
        }
          {
          walletAddress && <ConnectTwitter /> 
        }
        </div>
      </div>
    </div>
  );
};

export default Jumbotron;
