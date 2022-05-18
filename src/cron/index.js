const checkIfFollowingSocials = require("./checkIfFollowingSocials");
const checkIfEligibleForRoles = require("./checkIfEligibleForRoles");
const updateUserInfo = require("./updateUserInfo");
const whitelistEvents = require("./whitelistEvents");

const initCrons = () => {
  checkIfFollowingSocials();
  checkIfEligibleForRoles();
  updateUserInfo();
  whitelistEvents();
};

module.exports = initCrons;
