const Router = require('koa-router');
const router = new Router({ prefix: '/slack' });
const shopModel = require('@models/shops');
const request = require('request');

router.get('/oauth', async (ctx) => {
  console.log(ctx.session.shop);
  shop = ctx.session.shop;
  if (!ctx.query.code) {
    console.log('> Slack authentication error - ' + shop);
    ctx.response.status = 500;
    ctx.response.body = 'Slack authentication is failed.';
  } else {
    return new Promise(function(resolve, reject) {
      request({
        url: 'https://slack.com/api/oauth.access',
        qs: {
          code: ctx.query.code,
          client_id: process.env.SLACK_CLIENT_ID,
          client_secret: process.env.SLACK_CLIENT_SECRET
        },
        method: 'GET'
      }, function (error, response, body) {
        console.log(error);
        console.log(response);
        console.log(body);
        if (error) {
          console.log('> Slack authentication failed: ' + error);
          ctx.response.status = 500;
          ctx.response.body = 'Failed to add Slackify to a Slack channel.';
          resolve();
        } else {
          shopModel.updateShopSlack(shop, JSON.stringify(body), body.incoming_webhook.url);
          ctx.redirect('https://'+shop+'/admin/apps/slackify-4');
          resolve();
        }
      });
    });
  }
});

module.exports = router;