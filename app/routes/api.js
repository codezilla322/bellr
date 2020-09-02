const Router = require('koa-router');
const router = new Router();
const request = require('request');
const shopModel = require('@models/shops');
const basefunc = require('@libs/basefunc');
const CONSTANTS = require('@libs/constants');

module.exports = function(verifyRequest) {
  router.get('/api/settings', verifyRequest(), async (ctx) => {
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

  router.post('/api/settings', verifyRequest(), async (ctx) => {
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
      }
    }

    shopModel.updateShop('notifications', notifications);
    ctx.body = { result: 'success' };
  });

  router.get('/test', verifyRequest(), async (ctx) => {

  });

  router.get('/api/subscription', verifyRequest(), async(ctx) => {
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

    const response = await fetch(`https://${shop}/admin/api/2020-07/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': shopData['access_token']
      },
      body: query
    });

    const responseJson = await response.json();
    const confirmationUrl = responseJson.data.appSubscriptionCreate.confirmationUrl;
    ctx.redirect(confirmationUrl);
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

  router.get('/slack/oauth', verifyRequest(), async (ctx) => {
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