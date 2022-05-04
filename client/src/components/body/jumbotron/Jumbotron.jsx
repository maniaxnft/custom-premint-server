import React, { useEffect } from "react";
import "./Jumbotron.css";

import { useSelector, useDispatch } from "react-redux";
import detectEthereumProvider from "@metamask/detect-provider";

import { ACTIONS } from "../../../state/actions";

const Jumbotron = () => {
  const dispatch = useDispatch();
  const isMetamaskPresent = useSelector((state) => state.isMetamaskPresent);

  const checkIfMetamaskPresent = async () => {
    const provider = await detectEthereumProvider();
    console.log(provider);
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
        throw new Error("Do you have multiple wallets installed?");
      }
    }
  };

  useEffect(() => {
    checkIfMetamaskPresent();
  }, []);

  return (
    <div className="jumbotron">
      <div className="jumbotron-content">
        <div className="jumbotron-title">
          {!isMetamaskPresent && <>You need to install Metamask to get </>}
          {isMetamaskPresent && (
            <>Connect your Metamask, Discord and Twitter to get </>
          )}
          <span className="jumbotron-title-sol">
            Special Roles in {process.env.REACT_APP_PROJECT_NAME} Discord!
          </span>
        </div>
      </div>
    </div>
  );
};

export default Jumbotron;
