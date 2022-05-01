import React from "react";
import "./Jumbotron.css";

const Jumbotron = () => {
  return (
    <div className="jumbotron">
      <div className="jumbotron-content">
        <div className="jumbotron-title">
          Connect your Metamask, Discrod and Twitter to get
          <span className="jumbotron-title-sol"> Special Roles in {process.env.REACT_APP_PROJECT_NAME} Discord!</span>
        </div>
        <div className="jumbotron-explanation">
          Please connect your Metamask Wallet where you are going to mint your {process.env.REACT_APP_PROJECT_NAME} 
        </div>
        <div className="jumbotron-explanation">
          Please connect your Discord where you are the member of {process.env.REACT_APP_PROJECT_NAME} Server
        </div>
        <div className="jumbotron-explanation">
          Please connect your Twitter where you are following {process.env.REACT_APP_PROJECT_NAME} Official Account 
        </div>
      </div>
    </div>
  );
};

export default Jumbotron;
