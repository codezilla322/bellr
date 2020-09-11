const { OrdersMajorFilled } = require('@shopify/polaris-icons');
const { IncomingWebhook } = require('@slack/webhook');
const CONSTANTS = require('@libs/constants');

function sendNotification(webhook_url, fields, orderUrl, customerUrl = null) {
  const webhook = new IncomingWebhook(webhook_url);
  let actions = [{
    type: 'button',
    text: 'View Order',
    url: orderUrl
  }];
  if (customerUrl) {
    actions.push({
      type: 'button',
      text: 'View Customer',
      url: customerUrl
    });
  }
  (async () => {
    await webhook.send({
      text: ' ',
      attachments: [{
          color: '#CBEFFF',
          fields: fields,
          actions: actions
        }
      ]
    });
  })();
}

function sendFromOrder(order, orderType, shop, shopData) {
  const customer = order.customer;
  let customerUrl = null;
  if (customer) {
    customerUrl = `https://${shop}/admin/customers/${customer.id}`;
  }
  const shippingAddress = order.shipping_address;
  const discountCodes = order.discount_codes;
  const items = order.line_items;
  const orderUrl = `https://${shop}/admin/orders/${order.id}`;
  
  let fields = [];
  let field = new Object();
  
  field['title'] = `${CONSTANTS.ORDER.TITLE[orderType]}:`;
  field['value'] = `<${orderUrl}|${order.name}>`;
  fields.push(field);
  field = new Object();

  field['title'] = `Customer:`;
  if (customer) {
    field['value'] = `${customer.first_name} ${customer.last_name} <${customer.email}>`;
  } else {
    field['value'] = `No customer info provided for this order`;
  }
  fields.push(field);
  field = new Object();

  field['title'] = `Delivery Location:`;
  if (shippingAddress) {
    let shppingAddr = '';
    if (shippingAddress.address1)
      shppingAddr = shppingAddr + shippingAddress.address1 + `, `;
    if (shippingAddress.address2)
      shppingAddr = shppingAddr + shippingAddress.address2 + `, `;
    if (shippingAddress.city)
      shppingAddr = shppingAddr + shippingAddress.city + `, `;
    if (shippingAddress.province)
      shppingAddr = shppingAddr + shippingAddress.province + `, `;
    if (shippingAddress.country)
      shppingAddr = shppingAddr + shippingAddress.country;
    field['value'] = shppingAddr;
  } else {
    field['value'] = `No delivery location provided for this order`;
  }
  fields.push(field);
  field = new Object();

  field['title'] = `Cart Total:`;
  field['value'] = `${order.total_price} ${order.currency}`;
  fields.push(field);
  field = new Object();

  if (order.refunds.length > 0) {
    let refundedAmount = 0;
    order.refunds.forEach(refund => {
      refund.transactions.forEach(transaction => {
        refundedAmount = refundedAmount + parseFloat(transaction.amount);
      });
    });
    if (refundedAmount > 0) {
      field['title'] = `Refunded Amount:`;
      refundedAmount = refundedAmount.toFixed(2);
      field['value'] = `${refundedAmount} ${order.currency}`;
      fields.push(field);
      field = new Object();
    }
  }

  if (discountCodes.length > 0) {
    let codes = '';
    field['title'] = `Discount Codes:`;
    discountCodes.forEach(discountCode => {
      codes = codes + discountCode.code + `, `;
    });
    field['value'] = codes.slice(0, -2);
    fields.push(field);
    field = new Object();
  }
  if (order.tags) {
    field['title'] = `Tags:`;
    field['value'] = order.tags;
    fields.push(field);
    field = new Object();
  }

  field['title'] = `Line Items:`;
  field['value'] = ``;
  items.forEach(item => {
    field['value'] = field['value'] + `- ${item.quantity} x ${item.title}\n`;
  });
  fields.push(field);
  field = new Object();

  if (order.refunds.length > 0) {
    field['title'] = `Refunded Items:`;
    field['value'] = ``;
    order.refunds.forEach(refund => {
      refund.refund_line_items.forEach(refundedItem => {
        field['value'] = field['value'] + `- ${refundedItem.quantity} x ${refundedItem.line_item.name}\n`;
      });
    });
    if (field['value']) {
      fields.push(field);
      field = new Object();
    }
  }

  if (orderType == 'PARTIALLY_FULFILLED_ORDER' && order.fulfillments.length > 0) {
    field['title'] = `Fulfilled Items:`;
    field['value'] = ``;
    order.fulfillments.forEach(fulfillment => {
      if (fulfillment.status == CONSTANTS.ORDER.FULFILLMENT.CANCELLED)
        return;
      if (fulfillment.tracking_company)
        field['value'] = field['value'] + `- ${fulfillment.tracking_company}\n`
      fulfillment.line_items.forEach(fulfilledItem => {
        field['value'] = field['value'] + ` • ${fulfilledItem.quantity} x ${fulfilledItem.title}\n`;
      });
    });
    if (!field['value'])
      field['value'] = `No items fulfilled`;
    fields.push(field);
    field = new Object();
  }

  sendNotification(shopData['slack_webhook_url'], fields, orderUrl, customerUrl);
}

module.exports = {
  sendNotification: sendNotification,
  sendFromOrder: sendFromOrder
}