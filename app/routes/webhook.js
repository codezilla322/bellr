const Router = require('koa-router');
const router = new Router({ prefix: '/webhook' });
const shopModel = require('@models/shops');
const { isSendable } = require('@libs/basefunc');
const CONSTANTS = require('@libs/constants');
const { sendFromOrder } = require('@libs/slack');

module.exports = function(webhook) {

  router.post('/orders/create', webhook, async (ctx) => {
    const shop = ctx.headers['x-shopify-shop-domain'];
    const order = ctx.request.body;
    console.log(`> New order created: ${shop} - ${order.id}`);
    const shopData = await shopModel.findShopByName(shop);

    if (isSendable(shopData, 'new_order'))
      sendFromOrder(order, 'NEW_ORDER', shop, shopData);
  });

  router.post('/orders/cancelled', webhook, async (ctx) => {
    console.log(ctx.request.body.refunds);
    const shop = ctx.headers['x-shopify-shop-domain'];
    const order = ctx.request.body;
    console.log(`> Order cancelled: ${shop} - ${order.id}`);
    const shopData = await shopModel.findShopByName(shop);
    
    if (isSendable(shopData, 'cancelled_order'))
      sendFromOrder(order, 'CANCELLED_ORDER', shop, shopData);
  });

  router.post('/orders/paid', webhook, async (ctx) => {
    const shop = ctx.headers['x-shopify-shop-domain'];
    const order = ctx.request.body;
    console.log(`> Order paid: ${shop} - ${order.id}`);
    const shopData = await shopModel.findShopByName(shop);

    if (isSendable(shopData, 'paid_order'))
      sendFromOrder(order, 'PAID_ORDER', shop, shopData);
  });

  router.post('/orders/fulfilled', webhook, async (ctx) => {
    console.log(ctx.request.body.fulfillments);
    const shop = ctx.headers['x-shopify-shop-domain'];
    const order = ctx.request.body;
    console.log(`> Order fulfilled: ${shop} - ${order.id}`);
    const shopData = await shopModel.findShopByName(shop);

    if (isSendable(shopData, 'fulfilled_order'))
      sendFromOrder(order, 'FULFILLED_ORDER', shop, shopData);
  });

  router.post('/orders/partially_fulfilled', webhook, async (ctx) => {
    console.log(ctx.request.body.fulfillments);
    const shop = ctx.headers['x-shopify-shop-domain'];
    const order = ctx.request.body;
    console.log(`> Order partially fulfilled: ${shop} - ${order.id}`);
    const shopData = await shopModel.findShopByName(shop);

    if (isSendable(shopData, 'partially_fulfilled_order'))
      sendFromOrder(order, 'PARTIALLY_FULFILLED_ORDER', shop, shopData);
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