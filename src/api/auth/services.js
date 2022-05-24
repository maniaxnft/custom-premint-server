const axios = require("axios");

const userModel = require("./models");

const checkNftCount = async (walletAddress) => {
  try {
    const res = await axios.get(
      `${process.env.MORALIS_API_URL}/${walletAddress}/nft/${process.env.NFT_CONTRACT_ADDRESS}/?chain=${process.env.NFT_CHAIN}&format=decimal`,
      {
        headers: {
          "x-api-key": process.env.MORALIS_WEB3_API_KEY,
        },
      }
    );
    const result = res.data?.result;
    if (result) {
      await userModel.findOneAndUpdate(
        { walletAddress },
        { ownedNFTCount: result.length }
      );
    }
  } catch (e) {
    console.error("Error at checkNftCount", e);
    throw new Error(e);
  }
};

module.exports = {
  checkNftCount,
};
