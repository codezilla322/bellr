const basefunc = require('@libs/basefunc');

module.exports = {
  addShop: function(shop, accessToken, webhookRegistered = 1) {
    const free_trial_period = process.env.APP_FREE_TRIAL_PERIOD;
    this.findShopByName(shop)
      .then((shopData) => {
        if (shopData) {
          this.updateShop(shop, accessToken, webhookRegistered);
          return;
        }
        shopData = {
          shop_origin: shop,
          access_token: accessToken,
          added_time: basefunc.getCurrentTimestamp(),
          trial_expire_time: Math.floor(new Date().getTime() / 1000) + free_trial_period * 24 * 60 * 60,
          is_webhook_registered: webhookRegistered
        };
        var query = "INSERT INTO shops SET ?";
        return new Promise(function(resolve, reject) {
          db.query(query, shopData, function(err, result) {
            if (err)
              return reject(err);
            return resolve(result);
          });
        });
      });
  },
  findShopByName: function(shop) {
    var query = "SELECT * FROM shops WHERE shop_origin = ?";
    return new Promise(function(resolve, reject) {
      db.query(query, shop, function(err, result) {
        if (err)
          return reject(err);
        if (result.length > 0)
          return resolve(result[0]);
        else
          return resolve(null);
      });
    });
  },
  updateShop: function(shop, accessToken, webhookRegistered = 1) {
    var query = "UPDATE shops SET access_token = ?, is_webhook_registered = ? WHERE shop_origin = ?";
    return new Promise(function(resolve, reject) {
      db.query(query, [accessToken, webhookRegistered, shop], function(err, result) {
        if (err)
          return reject(err);
        return resolve(result);
      });
    });
  },
  updateShopSlack: function(shop, slackAccess, slackWebhookUrl) {
    var query = "UPDATE shops SET slack_access = ?, slack_webhook_url = ? WHERE shop_origin = ?";
    return new Promise(function(resolve, reject) {
      db.query(query, [slackAccess, slackWebhookUrl, shop], function(err, result) {
        if (err)
          return reject(err);
        return resolve(result);
      });
    });
  },
  getSubscriptionUrl: async function(shop, accessToken, plan, fee) {
    const query = JSON.stringify({
      query: `mutation {
        appSubscriptionCreate(
          name: "Slackify ${plan} plan fee"
          returnUrl: "${process.env.HOST}/plan/callback"
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
        'X-Shopify-Access-Token': accessToken
      },
      body: query
    })

    const responseJson = await response.json();
    const confirmationUrl = responseJson.data.appSubscriptionCreate.confirmationUrl;
    return confirmationUrl;
  }
};