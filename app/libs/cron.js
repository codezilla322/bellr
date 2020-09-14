const moment = require('moment');
const { getShopsByTimezone } = require('@models/shops');
const CONSTANTS = require('@libs/constants');
const { createReport } = require('@libs/order');
const { sendNotification } = require('@libs/slack');

module.exports = {
  checkStores: async function() {
    const targetHour = parseInt(process.env.REPORT_TIME);
    /*************************************/
    // const curHour = moment.utc().hour();
    const curHour = moment.utc().second();
    /*************************************/
    if (curHour > 23)
      return;

    let tzOffsetPlus = 0;
    let tzOffsetMinus = 0;
    if (targetHour > curHour) {
      tzOffsetPlus = targetHour - curHour;
      tzOffsetMinus = targetHour - curHour - 24;
    } else if (targetHour < curHour) {
      tzOffsetPlus = targetHour + 24 - curHour;
      tzOffsetMinus = targetHour - curHour;
    }
    if (tzOffsetPlus >= 0 && tzOffsetPlus <= 13) {
      tzOffsetPlus = '+' + ('0' + tzOffsetPlus).slice(-2);
    } else {
      tzOffsetPlus = null;
    }
    if (tzOffsetMinus < 0 && tzOffsetMinus >= -12) {
      tzOffsetMinus = -tzOffsetMinus;
      tzOffsetMinus = '-' + ('0' + tzOffsetMinus).slice(-2);
    } else {
      tzOffsetMinus = null;
    }

    const shops = await getShopsByTimezone(tzOffsetPlus, tzOffsetMinus);
    shops.forEach(shopData => {
      // if (shopData.subscription_plan != CONSTANTS.SUBSCRIPTION.PLAN.PREMIUM ||
      //   shopData.subscription_status != CONSTANTS.SUBSCRIPTION.STATUS.ACTIVE)
      //   return;
      // notifications = JSON.parse(shopData.notifications);
      // if (!notifications.sales_report)
      //   return;
      createReport(shopData)
        // .then(slackFields => {
        //   sendNotification(shopData.slack_webhook_url, slackFields);
        // });
    });
  }
}