const checkIfFollowingSocials = require("./checkIfFollowingSocials");
const checkIfEligibleForRoles = require("./checkIfEligibleForRoles");
const updateUserInfo = require("./updateUserInfo");
const checkWhitelistEvents = require("./checkWhitelistEvents");

const initCrons = () => {
  checkIfFollowingSocials();
  checkIfEligibleForRoles();
  updateUserInfo();
  checkWhitelistEvents();
};

module.exports = initCrons;
