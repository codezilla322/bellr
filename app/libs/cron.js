const { createReport } = require('@libs/order');
const { sendNotification } = require('@libs/slack');

module.exports = {
  checkStores: async function() {
    const now = new Date();
    const curHour = now.getUTCHours();
    const targetHour = parseInt(process.env.REPORT_TIME);
    let offset1 = 0;
    let offset2 = 0;
    if (targetHour > curHour) {
      offset1 = targetHour - curHour;  // 9/13
      offset2 = targetHour - curHour - 24; // 9/12
    } else if (targetHour < curHour) {
      offset1 = targetHour + 24 - curHour; // 9/14
      offset2 = targetHour - curHour; // 9/13
    }

    // $slackFields = createReport(shopData);
    // sendNotification(shopData.slack_webhook_url, $slackFields);
  }
}