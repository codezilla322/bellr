const shopModel = require('@models/shops');

module.exports = {
  isExpired: (shop) => {
    shopModel.findShopByName(shop)
      .then((shopData) => {
        if(shopData) {
          
          return;
        }
      });
  },
  getSubscriptionUrl: async (ctx, accessToken, shop) => {
    const fee = process.env.APP_FEE;
    const query = JSON.stringify({
      query: `mutation {
        appSubscriptionCreate(
          name: "Slackify Fee"
          returnUrl: "${process.env.HOST}"
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
    const confirmationUrl = responseJson.data.appSubscriptionCreate.confirmationUrl
    return ctx.redirect(confirmationUrl)
  }
};
