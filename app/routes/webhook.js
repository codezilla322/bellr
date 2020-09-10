const Router = require('koa-router');
const router = new Router({ prefix: '/webhook' });
const shopModel = require('@models/shops');
const CONSTANTS = require('@libs/constants');

module.exports = function(webhook) {

  router.post('/orders/create', webhook, async (ctx) => {
    console.log('> New order created: ');
    console.log(ctx.request.body);
  });

  router.post('/subscriptions/update', webhook, async (ctx) => {
    ctx.body = 'ok';
    const appSubscription = ctx.request.body.app_subscription;
    if (appSubscription.status != 'ACTIVE' &&
      appSubscription.status != 'CANCELLED' &&
      appSubscription.status != 'EXPIRED')
      return;
    const graphqlApiId = appSubscription.admin_graphql_api_id;
    const subscriptionId = graphqlApiId.split('/')[4];
    let plan = appSubscription.name;
    plan = plan.split(' ')[1];
    let subscriptionPlan = CONSTANTS.SUBSCRIPTION.PLAN.BASIC;
    if (plan == 'premium')
      subscriptionPlan = CONSTANTS.SUBSCRIPTION.PLAN.PREMIUM;
    const subscriptionStatus = CONSTANTS.SUBSCRIPTION.STATUS[appSubscription.status];
    shopModel.updateSubscription(subscriptionId, {
      subscription_plan: subscriptionPlan,
      subscription_status: subscriptionStatus
    });
    console.log(`> Subscription updated: ${subscriptionId} - ${plan} - ${appSubscription.status}`);
  });

  router.post('/app/uninstalled', webhook, async (ctx) => {
    const shop = ctx.request.body.myshopify_domain;
    shopModel.updateSubscriptionStatus(shop, CONSTANTS.SUBSCRIPTION.STATUS.CANCELLED);
    console.log(`> App uninstalled: ${shop}`);
  });

  router.post('/shop/update', webhook, async (ctx) => {
    const plan = ctx.request.body.plan_name;
    if (plan != 'cancelled')
      return;
    const shop = ctx.request.body.myshopify_domain;
    shopModel.updateSubscriptionStatus(shop, CONSTANTS.SUBSCRIPTION.STATUS.CANCELLED);
    console.log(`> Shop plan cancelled: ${shop}`);
  });

  return router;
}