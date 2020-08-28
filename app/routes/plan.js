const Router = require('koa-router');
const router = new Router({ prefix: '/plan' });
const shopModel = require('@models/shops');

module.exports = function(verifyRequest) {
  router.get('/basic', verifyRequest(), async (ctx) => {
    const shop = ctx.session.shop;
    const shopData = await shopModel.findShopByName(shop);
    if (shopData['plan'] == 'basic') {
      ctx.redirect('https://'+shop+'/admin/apps/' + process.env.APP_NAME);
      return;
    }
    const confirmationUrl = await shopModel.getSubscriptionUrl(
      shop,
      shopData['access_token'],
      'basic',
      process.env.APP_BASIC_PLAN_FEE
    );
    console.log(confirmationUrl);
    ctx.redirect(confirmationUrl);
  });

  router.get('/callback', verifyRequest(), (ctx) => {
    console.log('callback-get');
    console.log(ctx.query);
  });

  router.post('/callback', verifyRequest(), (ctx) => {
    console.log('callback--post');
    console.log(ctx.query);
    console.log(ctx.request.body);
    console.log(ctx.params);
  });

  return router;
}