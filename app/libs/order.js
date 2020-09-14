const Shopify = require('shopify-api-node');
const CONSTANTS = require('@libs/constants');

function createNotification(order, orderType, shop, moneyFormat) {
  var fields = [];
  var field = new Object();

  const orderUrl = `https://${shop}/admin/orders/${order.id}`;
  field['title'] = `${CONSTANTS.ORDER.TITLE[orderType]}:`;
  field['value'] = `<${orderUrl}|${order.name}>`;
  fields.push(field);
  field = new Object();

  const customer = order.customer;
  field['title'] = `Customer:`;
  if (customer) {
    field['value'] = `${customer.first_name} ${customer.last_name} <${customer.email}>`;
  } else {
    field['value'] = `No customer info provided for this order`;
  }
  fields.push(field);
  field = new Object();

  const shippingAddress = order.shipping_address;
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
  const cartTotal = moneyFormat.replace('{{amount}}', order.total_price);
  field['value'] = cartTotal;
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
      refundedAmount = moneyFormat.replace('{{amount}}', refundedAmount);
      field['value'] = refundedAmount;
      fields.push(field);
      field = new Object();
    }
  }

  const discountCodes = order.discount_codes;
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

  const items = order.line_items;
  field['title'] = `Line Items:`;
  field['value'] = ``;
  items.forEach(item => {
    field.value = field.value + `- ${item.quantity} x ${item.title}\n`;
  });
  fields.push(field);
  field = new Object();

  // if (order.refunds.length > 0) {
  //   field['title'] = `Refunded Items:`;
  //   field['value'] = ``;
  //   order.refunds.forEach(refund => {
  //     refund.refund_line_items.forEach(refundedItem => {
  //       field.value = field.value + `- ${refundedItem.quantity} x ${refundedItem.line_item.name}\n`;
  //     });
  //   });
  //   if (field.value) {
  //     fields.push(field);
  //     field = new Object();
  //   }
  // }

  if (orderType == 'PARTIALLY_FULFILLED_ORDER' && order.fulfillments.length > 0) {
    field['title'] = `Fulfilled Items:`;
    field['value'] = ``;
    order.fulfillments.forEach(fulfillment => {
      if (fulfillment.status == CONSTANTS.STATUS.CANCELLED)
        return;
      if (fulfillment.tracking_company)
        field.value = field.value + `- ${fulfillment.tracking_company}\n`
      fulfillment.line_items.forEach(fulfilledItem => {
        field.value = field.value + ` • ${fulfilledItem.quantity} x ${fulfilledItem.title}\n`;
      });
    });
    if (!field.value)
      field.value = `No items fulfilled`;
    fields.push(field);
    field = new Object();
  }

  return $fields;
}

function createReport(shopData) {
  const shopify = new Shopify({
    shopName: shopData.shop_origin,
    accessToken: shopData.access_token,
    apiVersion: '2020-07'
  });
  return new Promise(async function(resolve, reject) {
    let params = { limit: 250 };
    let orders = [];
    let fields = [];
    do {
      const ordersResult = await shopify.order.list(params);
      orders = orders.concat(ordersResult);
      params = ordersResult.nextPageParameters;
    } while (params !== undefined);
    console.log(orders);

    resolve(fields);
  });
}

module.exports = {
  createNotification: createNotification,
  createReport: createReport
}