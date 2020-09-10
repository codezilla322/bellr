const Router = require('koa-router');
const router = new Router();
const request = require('request');
const shopModel = require('@models/shops');
const basefunc = require('@libs/basefunc');
const CONSTANTS = require('@libs/constants');
const { sendNotification } = require('@libs/slack');

module.exports = function(verifyRequest) {
  router.get('/api/settings', verifyRequest(), (ctx) => {
    const shop = ctx.session.shop;
    return new Promise(function(resolve, reject) {
      shopModel.findShopByName(shop)
        .then(shopData => {
          let trial = true, trialExpiration = 0, paid = false;
          if (shopData.subscription_plan != CONSTANTS.SUBSCRIPTION.PLAN.TRIAL) {
            trial = false;
            if (shopData.subscription_status == CONSTANTS.SUBSCRIPTION.STATUS.ACTIVE) {
              paid = true;
            } else {
              paid = false;
            }
          } else {
            if (basefunc.isExpired(shopData.trial_expiration_time)) {
              trial = false;
            } else {
              trialExpiration = basefunc.getRemainingTime(shopData.trial_expiration_time);
            }
          }
          ctx.body = {
            trial: trial,
            trialExpiration: trialExpiration,
            paid: paid,
            connected: shopData.is_slack_connected ? true : false,
            plan: shopData.subscription_plan,
            settings: JSON.parse(shopData.notifications)
          };
          resolve();
        });
    });
  });

  router.post('/api/settings', verifyRequest(), (ctx) => {
    var notifications = ctx.request.body.settings;
    if (!notifications || Object.keys(notifications).length != CONSTANTS.NOTIFICATION.KEYS.length) {
      console.log(Object.keys(notifications).length);
      console.log(CONSTANTS.NOTIFICATION.KEYS.length);
      ctx.body = { result: 'failed' };
      return;
    }

    for (var i=0;i<CONSTANTS.NOTIFICATION.KEYS.length;i++) {
      var key = CONSTANTS.NOTIFICATION.KEYS[i];
      if (!notifications.hasOwnProperty(key)) {
        ctx.body = { result: 'failed' };
        return;
      } else {
        if (!notifications[key])
          notifications[key] = false;
        else
          notifications[key] = true;
      }
    }

    const shop = ctx.session.shop;
    return new Promise(function(resolve, reject) {
      shopModel.findShopByName(shop)
        .then(shopData => {
          if (shopData.subscription_plan != CONSTANTS.SUBSCRIPTION.PLAN.PREMIUM ||
            shopData.subscription_status != CONSTANTS.SUBSCRIPTION.STATUS.ACTIVE)
            notifications.sales_report = false;

          shopModel.updateShop(shop, {'notifications': JSON.stringify(notifications)});
          ctx.body = { result: 'success' };
          resolve();
        });
    });
  });

  router.get('/test', verifyRequest(), async (ctx) => {
    const shop = ctx.session.shop;
    const shopData = await shopModel.findShopByName(shop);

    const query = JSON.stringify({
      query: `{
        shop {
          currencyFormats {
            moneyFormat
          }
        }
        orders(first: 1)	{
          edges {
            node {
              legacyResourceId
              displayFulfillmentStatus
              name
              customer {
                displayName
                email
              }
              shippingAddress {
                address1
                address2
                city
                province
                country
              }
              totalPriceSet {
                shopMoney {
                  amount
                }
              }
              totalRefundedSet{
                shopMoney {
                  amount
                }
              }
              tags
              discountCode
              lineItems(first: 50) {
                edges {
                  node {
                    name
                    quantity
                  }
                }
              }
            }
          }
        }
      }`
    });

    return new Promise(function(resolve, reject) {
      fetch(`https://${shop}/admin/api/2020-07/graphql.json`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': shopData['access_token']
          },
          body: query
        })
        .then(response => response.json())
        .then(responseJson => {
          const orders = responseJson.data.orders.edges;
          if (orders.length == 0) {
            ctx.body = { result: 'failed' };
          } else {
            const moneyFormat = responseJson.data.shop.currencyFormats.moneyFormat;
            const order = orders[0].node;
             
            let text = `*${CONSTANTS.ORDER[order.displayFulfillmentStatus]}:*\n`;
            const orderUrl = `https://${shop}/admin/orders/${order.legacyResourceId}`;
            text = text + `<${orderUrl}|${order.name}>\n`;
            text = text + `*Customer:*\n`;
            const customer = order.customer;
            text = text + `${customer.displayName} <${customer.email}>\n`;
            text = text + `*Delivery Location:*\n`;
            const shippingAddress = order.shippingAddress;
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
            text = text + shppingAddr + `\n`;
            text = text + `*Cart Total:*\n`;
            const total = moneyFormat.replace('{{amount}}', order.totalPriceSet.shopMoney.amount);
            text = text + total + `\n`;
            if (order.discountCode) {
              text = text + `*Discount Codes:*\n`;
              text = text + order.discountCode + `\n`;
            }
            if (order.tags.length) {
              text = text + `*Tags:*\n`;
              let tags = '';
              order.tags.forEach((tag, idx) => {
                if (idx != order.tags.length - 1) {
                  tags = tags + tag + ', ';
                } else {
                  tags = tags + tag;
                }
              });
              text = text + tags + `\n`;
            }
            text = text + `*Items:*\n`;
            order.lineItems.edges.forEach(item => {
              text = text + `- ${item.node.quantity} x ${item.node.name}\n`;
            });

            sendNotification(shopData['slack_webhook_url'], text, orderUrl);

            ctx.body = { result: 'success' };
          }
          resolve();
        });
    });
  });

  router.get('/api/subscription', verifyRequest(), async (ctx) => {
    const shop = ctx.session.shop;
    const shopData = await shopModel.findShopByName(shop);
    const plan = ctx.query.plan.toUpperCase();
    if (!CONSTANTS.SUBSCRIPTION.PLAN[plan] || shopData['subscription_plan'] == CONSTANTS.SUBSCRIPTION.PLAN[plan]) {
      ctx.redirect(`https://${shop}/admin/apps/${process.env.APP_NAME}`);
      return;
    }
    console.log(`> Chosen a plan: ${shop} - ${plan}`);
    var fee = process.env.APP_BASIC_PLAN_FEE;
    if (plan == 'premium')
      fee = process.env.APP_PREMIUM_PLAN_FEE;

    const query = JSON.stringify({
      query: `mutation {
        appSubscriptionCreate(
          name: "Slackify ${plan} plan fee"
          returnUrl: "${process.env.HOST}/subscription/callback"
          test: true
          lineItems: [
            {
              plan: {
                appRecurringPricingDetails: {
                  price: { amount: ${fee}, currencyCode: USD }
                  interval: EVERY_30_DAYS
                }
              }
            }
          ]
        ) {
          userErrors {
            field
            message
          }
          confirmationUrl
          appSubscription {
            id
          }
        }
      }`
    });

    return new Promise(function(resolve, reject) {
      fetch(`https://${shop}/admin/api/2020-07/graphql.json`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': shopData['access_token']
          },
          body: query
        })
        .then(response => response.json())
        .then(responseJson => {
          const confirmationUrl = responseJson.data.appSubscriptionCreate.confirmationUrl;
          ctx.redirect(confirmationUrl);
          resolve();
        });
    });
  });

  router.get('/subscription/callback', verifyRequest(), (ctx) => {
    const shop = ctx.session.shop;
    const subscriptionId = ctx.query.charge_id;
    const shopData = {
      subscription_id: subscriptionId,
      subscription_status: CONSTANTS.SUBSCRIPTION.STATUS.ACTIVE,
      subscription_activated_time: basefunc.getCurrentTimestamp()
    };
    shopModel.updateShop(shop, shopData);
    console.log(`> Subscription activated: ${shop} - ${subscriptionId}`);
    ctx.redirect(`https://${shop}/admin/apps/${process.env.APP_NAME}/subscription`);
  });

  router.get('/slack/oauth', verifyRequest(), (ctx) => {
    const shop = ctx.session.shop;
    // if (!shop) {
    //   ctx.response.status = 500;
    //   ctx.response.body = 'Try Slackify integration from your shop admin panel.';
    //   return;
    // }
    if (!ctx.query.code) {
      console.log(`> Invalid slack authentication code: ${shop}`);
      ctx.response.status = 500;
      ctx.response.body = 'Invalid slack authentication code.';
    } else {
      return new Promise(function(resolve, reject) {
        request({
          url: 'https://slack.com/api/oauth.v2.access',
          qs: {
            code: ctx.query.code,
            client_id: process.env.SLACK_CLIENT_ID,
            client_secret: process.env.SLACK_CLIENT_SECRET
          },
          method: 'GET'
        }, function (error, response, bodyJSON) {
          if (error) {
            console.log(`> Slack authentication error: ${error}`);
            ctx.response.status = 500;
            ctx.response.body = 'Failed to add Slackify to a Slack channel.';
            resolve();
          } else {
            const body = JSON.parse(bodyJSON);
            if (!body.ok) {
              console.log(`> Slack authentication failed: ${body.error}`);
              ctx.response.status = 500;
              ctx.response.body = 'Failed to add Slackify to the Slack channel.';
            } else {
              shopModel.updateShop(shop, {
                slack_access: bodyJSON,
                slack_webhook_url: body.incoming_webhook.url,
                is_slack_connected: CONSTANTS.SLACK.CONNECTED
              });
              ctx.redirect(`https://${shop}/admin/apps/${process.env.APP_NAME}`);
            }
            resolve();
          }
        });
      });
    }
  });

  return router;
};