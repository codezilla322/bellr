const CONSTANTS = require('@libs/constants');

function getCurrentTimestamp() {
  const now = new Date();
  //return now.getFullYear() + '-' + ('0' + (now.getMonth() + 1)).slice(-2) + '-' + ('0' + now.getDate()).slice(-2) + ' ' + ('0' + now.getHours()).slice(-2) + ':' + ('0' + now.getMinutes()).slice(-2) + ':' + ('0' + now.getSeconds()).slice(-2);
  return `${now.getFullYear()}-${('0' + (now.getMonth() + 1)).slice(-2)}-${('0' + now.getDate()).slice(-2)} ${('0' + now.getHours()).slice(-2)}:${('0' + now.getMinutes()).slice(-2)}:${('0' + now.getSeconds()).slice(-2)}`;
}

function getRemainingTime(timestamp) {
  const currentTimestamp = Math.floor(new Date().getTime() / 1000);
  const remainingTimeInSec = timestamp - currentTimestamp;
  const remainingTimeInDay = Math.ceil(remainingTimeInSec / (24 * 60 * 60));
  return remainingTimeInDay;
}

function isExpired(timestamp) {
  const currentTimestamp = Math.floor(new Date().getTime() / 1000);
  if (currentTimestamp > timestamp)
    return true;
  return false;
}

function isSendable(shopData, orderType) {
  if (shopData.subscription_plan == CONSTANTS.SUBSCRIPTION.PLAN.TRIAL) {
    if (isExpired(shopData.trial_expiration_time)) {
      return false;
    }
  } else {
    if (shopData.subscription_status != CONSTANTS.SUBSCRIPTION.STATUS.ACTIVE) {
      return false;
    }
  }
  shopData.notifications = JSON.parse(shopData.notifications);
  if (!shopData.notifications[orderType])
    return false;
  return true;
}

module.exports = {
  getCurrentTimestamp: getCurrentTimestamp,
  getRemainingTime: getRemainingTime,
  isExpired: isExpired,
  isSendable: isSendable
};