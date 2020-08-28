const Router = require('koa-router');
const router = new Router({ prefix: '/slack' });
const shopModel = require('@models/shops');
const request = require('request');

router.get('/oauth', async (ctx) => {
  const shop = ctx.session.shop;
  if (!shop) {
    ctx.response.status = 500;
    ctx.response.body = 'Try Slackify integration from Shopify Admin panel.';
    return;
  }
  if (!ctx.query.code) {
    console.log('> Invalid slack authentication code - ' + shop);
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
          console.log('> Slack authentication error: ' + error);
          ctx.response.status = 500;
          ctx.response.body = 'Failed to add Slackify to a Slack channel.';
          resolve();
        } else {
          const body = JSON.parse(bodyJSON);
          if (!body.ok) {
            console.log('> Slack authentication failed: ' + body.error);
            ctx.response.status = 500;
            ctx.response.body = 'Failed to add Slackify to the Slack channel.';
          } else {
            shopModel.updateShopSlack(shop, bodyJSON, body.incoming_webhook.url);
            ctx.redirect('https://'+shop+'/admin/apps/' + process.env.APP_NAME);
          }
          resolve();
        }
      });
    });
  }
});

module.exports = router;