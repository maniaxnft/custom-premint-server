const checkIfFollowingSocials = require("./checkIfFollowingSocials");
const checkIfEligibleForRoles = require("./checkIfEligibleForRoles");
const updateUserInfo = require("./updateUserInfo");

const initCrons = () => {
  checkIfFollowingSocials();
  checkIfEligibleForRoles();
  updateUserInfo();
};

module.exports = initCrons;
