const { IncomingWebhook } = require('@slack/webhook');
const { createNotification } = require('@libs/order');

module.exports = {
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
    (async () => {
      await webhook.send({
        text: text,
        attachments: [{
            color: '#CBEFFF',
            fields: fields,
            actions: actions
          }
        ]
      });
    })();
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