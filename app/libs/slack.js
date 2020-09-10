const { IncomingWebhook } = require('@slack/webhook');

module.exports = {
  sendNotification: function(webhook_url, text, orderUrl) {
    const webhook = new IncomingWebhook(webhook_url);
    (async () => {
      await webhook.send({
        attachments: [{
            text: text,
            color: '#CBEFFF',
            actions: [
              {
                type: 'button',
                text: 'View Order',
                url: orderUrl
              }
            ]
          }
        ]
      });
    })();
  }
}