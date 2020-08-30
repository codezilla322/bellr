const Router = require('koa-router');
const router = new Router({ prefix: '/webhook' });
const shopModel = require('@models/shops');
const constants = require('@libs/constants');

module.exports = function(webhook) {

  router.post('/orders/create', webhook, async (ctx) => {
    console.log('> New order created: ');
  });

  router.post('/subscriptions/update', webhook, async (ctx) => {
    console.log(ctx.request.body);

    let subscriptionPlan = constants.subscription.plan.BASIC;
    let plan = 'basic';
    if (plan == 'premium')
      subscriptionPlan = constants.subscription.plan.PREMIUM;
    shopModel.updateSubscriptionPlan(shop, subscriptionPlan);
    console.log(`> Subscription activated: ${shop} - ${plan}`);
  });

  router.post('/app/uninstalled', webhook, async (ctx) => {
    const shop = ctx.request.body.myshopify_domain;
    shopModel.updateSubscriptionStatus(shop, constants.subscription.status.CANCELLED);
    console.log(`> App uninstalled: ${shop}`);
  });

  router.post('/shop/update', webhook, async (ctx) => {
    const plan = ctx.request.body.plan_name;
    if (plan != 'cancelled')
      return;
    const shop = ctx.request.body.myshopify_domain;
    shopModel.updateSubscriptionStatus(shop, constants.subscription.status.CANCELLED);
    console.log(`> Shop plan cancelled: ${shop}`);
  });

  return router;
}