const { IncomingWebhook } = require('@slack/webhook');

module.exports = {
  sendOrderNotification: function(webhook_url, order) {
    const webhook = new IncomingWebhook(webhook_url);

    (async () => {
      await webhook.send({
        text: 'I\'ve got news for you...',
      });
    })();
  }
}