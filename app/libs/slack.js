const { IncomingWebhook } = require('@slack/webhook');
const { createNotification } = require('@libs/order');

module.exports = {
  sendHi: function(webhook_url) {
    const webhook = new IncomingWebhook(webhook_url);
    webhook.send({
      text: `:wave: Hi from bellr!\nWe monitor your shopify stores pulse in slack with order notifications, daily sales reporting and low stock alerts.\nGot questions? Visit bellr.io or email support@bellr.io`
    });
    webhook.send({
      "blocks": [
        {
          "type": "section",
          "text": {
            "type": "plain_text",
            "text": ":wave: Hi from bellr!"
          }
        },
        {
          "type": "section",
          "text": {
            "type": "plain_text",
            "text": "We monitor your shopify stores pulse in slack with order notifications, daily sales reporting and low stock alerts."
          }
        },
        {
          "type": "section",
          "text": {
            "type": "plain_text",
            "text": "Got questions? Visit bellr.io or email support@bellr.io"
          }
        }
      ]
    });
  },
  sendNotification: function(webhook_url, fields, text = ' ', orderUrl = null, customerUrl = null) {
    const webhook = new IncomingWebhook(webhook_url);
    var actions = [];
    if (orderUrl) {
      actions.push({
        type: 'button',
        text: 'View Order',
        url: orderUrl
      });
    }
    if (customerUrl) {
      actions.push({
        type: 'button',
        text: 'View Customer',
        url: customerUrl
      });
    }
    webhook.send({
      text: text,
      attachments: [{
          color: '#CBEFFF',
          fields: fields,
          actions: actions
        }
      ]
    });
  },
  sendNotificationFromOrder: function(order, orderType, shop, shopData) {
    const orderUrl = `https://${shop}/admin/orders/${order.id}`;
    var customerUrl = null;
    if (order.customer)
      customerUrl = `https://${shop}/admin/customers/${order.customer.id}`;
    $fields = createNotification(order, orderType, shop, shopData.money_format);
    this.sendNotification(shopData.slack_webhook_url, fields, ' ', orderUrl, customerUrl);
  }
}