const Shopify = require('shopify-api-node');
const moment = require('moment');
const CONSTANTS = require('@libs/constants');

function createNotification(order, orderType, shop, moneyFormat) {
  let fields = [];
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
  const targetHour = parseInt(process.env.REPORT_TIME);
  /***********************************/
  const curHour = moment.utc.hour();
  // const curHour = moment.utc().second();
  /***********************************/
  const sign = shopData.timezone.slice(0, 1);
  let today = moment.utc();

  if (targetHour > curHour) {
    if (sign == '+') {
      today = today.subtract(1, 'days');
    } else if (sign == '-') {
      today = today.subtract(2, 'days');
    }
  } else if (targetHour < curHour) {
    if (sign == '-') {
      today = today.subtract(1, 'days');
    }
  }

  /********************************/
  // today = today.subtract(4, 'days');
  /********************************/

  let yesterday = today.clone();
  yesterday = yesterday.subtract(1, 'days');
  let dayOfLastweek = today.clone();
  dayOfLastweek = dayOfLastweek.subtract(7, 'days');

  const shopify = new Shopify({
    shopName: shopData.shop_origin,
    accessToken: shopData.access_token,
    apiVersion: '2020-07'
  });

  return new Promise(function(resolve, reject) {
    Promise.all([
      getReportOfDay(shopify, today, shopData.timezone),
      getReportOfDay(shopify, yesterday, shopData.timezone),
      getReportOfDay(shopify, dayOfLastweek, shopData.timezone)
    ])
    .then((result) => {
      let fields = [];
      let field = {};
      let reportToday = result[0];
      let reportYesterday = result[1];
      let reportLastweek = result[2];

      // Sales
      let formattedPercent = '';
      let formattedSales = shopData.money_format.replace('{{amount}}', reportToday.sales.toFixed(2));
      field['title'] = `:moneybag: Total Sales \`${formattedSales}\``;
      field['value'] = '';
      formattedPercent = getFormattedPercent(reportToday.sales, reportYesterday.sales);
      formattedSales = shopData.money_format.replace('{{amount}}', reportYesterday.sales.toFixed(2));
      field.value = field.value + `${formattedPercent}Prev.Day: \`${formattedSales}\`\n`;
      formattedPercent = getFormattedPercent(reportToday.sales, reportLastweek.sales);
      formattedSales = shopData.money_format.replace('{{amount}}', reportLastweek.sales);
      field.value = field.value + `${formattedPercent}Last ${dayOfLastweek.format('dddd')}: \`${formattedSales}\``;
      fields.push(field);
      field = new Object();

      // orders
      field['title'] = `:handshake: Orders \`${reportToday.orders}\``;
      field['value'] = '';
      formattedPercent = getFormattedPercent(reportToday.orders, reportYesterday.orders);
      field.value = field.value + `${formattedPercent}Prev.Day: \`${reportYesterday.orders}\`\n`;
      formattedPercent = getFormattedPercent(reportToday.orders, reportLastweek.orders);
      field.value = field.value + `${formattedPercent}Last ${dayOfLastweek.format('dddd')}: \`${reportLastweek.orders}\``;
      fields.push(field);
      field = new Object();

      // customers
      field['title'] = `:male-office-worker: Customers \`${reportToday.customers}\``;
      field['value'] = '';
      formattedPercent = getFormattedPercent(reportToday.customers, reportYesterday.customers);
      field.value = field.value + `${formattedPercent}Prev.Day: \`${reportYesterday.customers}\`\n`;
      formattedPercent = getFormattedPercent(reportToday.customers, reportLastweek.customers);
      field.value = field.value + `${formattedPercent}Last ${dayOfLastweek.format('dddd')}: \`${reportLastweek.customers}\``;
      fields.push(field);
      field = new Object();

      // aov
      let formattedAov = shopData.money_format.replace('{{amount}}', reportToday.aov);
      field['title'] = `:shopping_bags: Average Order Value \`${formattedAov}\``;
      field['value'] = '';
      formattedPercent = getFormattedPercent(reportToday.aov, reportYesterday.aov);
      formattedAov = shopData.money_format.replace('{{amount}}', reportYesterday.aov);
      field.value = field.value + `${formattedPercent}Prev.Day: \`${formattedAov}\`\n`;
      formattedPercent = getFormattedPercent(reportToday.aov, reportLastweek.aov);
      formattedAov = shopData.money_format.replace('{{amount}}', reportLastweek.aov);
      field.value = field.value + `${formattedPercent}Last ${dayOfLastweek.format('dddd')}: \`${formattedAov}\``;
      fields.push(field);
      field = new Object();

      // Source
      field['title'] = ':spider_web: Source (Top 3)';
      field['value'] = '';
      reportToday.referrings.forEach((referring, idx) => {
        if (idx > 2)
          return;
        const sale = shopData.money_format.replace('{{amount}}', referring.value.toFixed(2));
        field.value = field.value + `• ${referring.key}: \`${sale}\` (${referring.percent}%)\n`;
      });
      if (!field.value)
        field.value = 'No order source found';
      fields.push(field);
      field = new Object();

      // Landing page
      field['title'] = ':bookmark_tabs: Landing Pages (Top 3)';
      field['value'] = '';
      reportToday.landings.forEach((landing, idx) => {
        if (idx > 2)
          return;
        const sale = shopData.money_format.replace('{{amount}}', landing.value.toFixed(2));
        field.value = field.value + `• ${landing.key}: \`${sale}\` (${landing.percent}%)\n`;
      });
      if (!field.value)
        field.value = 'No landing pages found';
      fields.push(field);
      field = new Object();

      // Payment gateway
      field['title'] = ':bank: Payment Gateways (Top 3)';
      field['value'] = '';
      reportToday.gateways.forEach((gateway, idx) => {
        if (idx > 2)
          return;
        const sale = shopData.money_format.replace('{{amount}}', gateway.value.toFixed(2));
        field.value = field.value + `• ${gateway.key}: \`${sale}\` (${gateway.percent}%)\n`;
      });
      if (!field.value)
        field.value = 'No payment gateways found';
      fields.push(field);
      field = new Object();

      resolve({
        fields: fields,
        title: `:chart_with_upwards_trend: Report (${today.format('YYYY-MM-DD')})`
      });
    });
  });
}

function getReportOfDay(shopify, date, timezone) {
  const sign = timezone.slice(0, 1);
  let targetDate = date.clone();
  if (sign == '+') {
    targetDate.hour(0).minute(0).second(0);
  } else if (sign == '-') {
    targetDate.hour(23).minute(0).second(0);
  }
  targetDate.utcOffset(timezone + ':00');
  targetDate.hour(0).minute(0).second(0);

  let createdAtMin = targetDate.format();
  targetDate.add(1, 'days');
  let createdAtMax = targetDate.format();
  return new Promise(async function(resolve, reject) {
    let params = {
      created_at_min: createdAtMin,
      created_at_max: createdAtMax,
      status: 'any',
      limit: 250
    };
    let orders = [];
    do {
      const ordersResult = await shopify.order.list(params);
      orders = orders.concat(ordersResult);
      params = ordersResult.nextPageParameters;
    } while (params !== undefined);
    
    let totalSales = 0;
    let totalOrders = 0;
    let totalTransactions = 0;
    let orderCount = 0;
    let customers = [];
    let gateways = {};
    let landings = {};
    let referrings = {};
    for (const order of orders) {
      const totalPrice = parseFloat(order.total_price);

      // Order count
      orderCount++;
      totalOrders += totalPrice;

      // Customer count
      if(order.customer) {
        customerId = order.customer.id;
        if (!customers.includes(customerId))
          customers.push(customerId);
      }

      // order.landing_site
      let landingSite = 'None';
      if (order.landing_site)
        landingSite = order.landing_site.split('?')[0];
      if (!landings[landingSite]) {
        landings[landingSite] = totalPrice;
      } else {
        landings[landingSite] += totalPrice;
      }

      // order.s_site
      let referringSite = 'None';
      if (order.referring_site) {
        const referringURL = new URL(order.referring_site);
        referringSite = referringURL.host;
      }
      if (!referrings[referringSite]) {
        referrings[referringSite] = totalPrice;
      } else {
        referrings[referringSite] += totalPrice;
      }

      // Total, gateway
      if (order.financial_status == 'voided' || order.financial_status == 'refunded')
        continue;
      let orderTotal = totalPrice;
      const transactions = await shopify.transaction.list(order.id);
      transactions.forEach(transaction => {
        if (transaction.kind == 'void')
          return;
        if (transaction.status != 'success')
          return;

        const transactionAmount = parseFloat(transaction.amount);
        if (transaction.kind == 'refund') {
          orderTotal -= transactionAmount;
        } else {
          totalTransactions += transactionAmount;
          let gateway = transaction.gateway;
          gateway = uppercaseFirst(gateway);
          if (!gateways[gateway]) {
            gateways[gateway] = transactionAmount;
          } else {
            gateways[gateway] += transactionAmount;
          }
        }
      });
      totalSales += orderTotal;
    }

    let aov = 0;
    if (orderCount > 0)
      aov = parseFloat(totalOrders / orderCount).toFixed(2);

    referrings = sortByValue(referrings, totalOrders);
    landings = sortByValue(landings, totalOrders);
    gateways = sortByValue(gateways, totalTransactions);

    let result = {
      sales: totalSales,
      orders: orderCount,
      aov: aov,
      customers: customers.length,
      referrings: referrings,
      landings: landings,
      gateways: gateways
    }
    resolve(result);
  });
}

function getFormattedPercent(num1, num2) {
  num1 = parseFloat(num1);
  num2 = parseFloat(num2);
  let formattedPercent = '';
  if (num1 > 0 && num2 > 0) {
    let percent = 0;
    percent = parseFloat((num1 - num2) / num2 * 100).toFixed(2);
    formattedPercent = `${Math.abs(percent)}%\` vs `;
    if (percent > 0) {
      formattedPercent = `\`▲ ` + formattedPercent;
    } else if (percent < 0) {
      formattedPercent = `\`▼ ` + formattedPercent;
    } else {
      formattedPercent = `\`` + formattedPercent;
    }
  }
  return formattedPercent;
}

function sortByValue(obj, sum) {
  let arr = [];
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      let val = obj[key];
      let percent = parseFloat(100 * val / sum).toFixed(2);
      arr.push({
        key: key,
        value: val,
        percent: percent
      });
    }
  }
  arr.sort(function(a, b) {
    return b.value - a.value;
  });
  return arr;
}

function uppercaseFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

module.exports = {
  createNotification: createNotification,
  createReport: createReport
}