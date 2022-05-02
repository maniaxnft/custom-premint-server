import React from "react";
import "./Jumbotron.css";

const Jumbotron = () => {
  return (
    <div className="jumbotron">
      <div className="jumbotron-content">
        <div className="jumbotron-title">
          Connect your Metamask, Discord and Twitter to get
          <span className="jumbotron-title-sol"> Special Roles in {process.env.REACT_APP_PROJECT_NAME} Discord!</span>
        </div>
      </div>
    </div>
  );
};

export default Jumbotron;
