import React from "react";
import "./Jumbotron.css";

const Jumbotron = () => {
  return (
    <div className="jumbotron">
      <div className="jumbotron-content">
        <div className="jumbotron-title">
          BRINGING ORIGINAL MANIAC NFTS TO THE
          <span className="jumbotron-title-sol"> SOLANA COMMUNITY</span>
        </div>
        <div className="jumbotron-explanation">
          Solmaniacs is a collection of randomly created NFTs by our engineers
          genetic algortihm. These 1111 Maniacs live and breathe in Solana blockchain.
        </div>
      </div>
    </div>
  );
};

export default Jumbotron;
