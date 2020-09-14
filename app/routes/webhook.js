const Router = require('koa-router');
const router = new Router({ prefix: '/webhook' });
const shopModel = require('@models/shops');
const CONSTANTS = require('@libs/constants');
const { isSendable } = require('@libs/basefunc');
const { sendNotificationFromOrder } = require('@libs/slack');

module.exports = function(webhook) {

  router.post('/orders/create', webhook, async (ctx) => {
    const shop = ctx.headers['x-shopify-shop-domain'];
    const order = ctx.request.body;
    console.log(`> New order created: ${shop} - ${order.id}`);
    const shopData = await shopModel.findShopByName(shop);

    if (isSendable(shopData, 'new_order'))
      sendNotificationFromOrder(order, 'NEW_ORDER', shop, shopData);
  });

  router.post('/orders/cancelled', webhook, async (ctx) => {
    const shop = ctx.headers['x-shopify-shop-domain'];
    const order = ctx.request.body;
    console.log(`> Order cancelled: ${shop} - ${order.id}`);
    const shopData = await shopModel.findShopByName(shop);
    
    if (isSendable(shopData, 'cancelled_order'))
      sendNotificationFromOrder(order, 'CANCELLED_ORDER', shop, shopData);
  });

  router.post('/orders/paid', webhook, async (ctx) => {
    const shop = ctx.headers['x-shopify-shop-domain'];
    const order = ctx.request.body;
    console.log(`> Order paid: ${shop} - ${order.id}`);
    const shopData = await shopModel.findShopByName(shop);

    if (isSendable(shopData, 'paid_order'))
      sendNotificationFromOrder(order, 'PAID_ORDER', shop, shopData);
  });

  router.post('/orders/fulfilled', webhook, async (ctx) => {
    const shop = ctx.headers['x-shopify-shop-domain'];
    const order = ctx.request.body;
    console.log(`> Order fulfilled: ${shop} - ${order.id}`);
    const shopData = await shopModel.findShopByName(shop);

    if (isSendable(shopData, 'fulfilled_order'))
      sendNotificationFromOrder(order, 'FULFILLED_ORDER', shop, shopData);
  });

  router.post('/orders/partially_fulfilled', webhook, async (ctx) => {
    const shop = ctx.headers['x-shopify-shop-domain'];
    const order = ctx.request.body;
    console.log(`> Order partially fulfilled: ${shop} - ${order.id}`);
    const shopData = await shopModel.findShopByName(shop);

    if (isSendable(shopData, 'partially_fulfilled_order'))
      sendNotificationFromOrder(order, 'PARTIALLY_FULFILLED_ORDER', shop, shopData);
  });

  router.post('/subscriptions/update', webhook, async (ctx) => {
    const appSubscription = ctx.request.body.app_subscription;
    if (appSubscription.status != CONSTANTS.SUBSCRIPTION.SHOPIFY_STATUS.ACTIVE &&
      appSubscription.status != CONSTANTS.SUBSCRIPTION.SHOPIFY_STATUS.CANCELLED &&
      appSubscription.status != CONSTANTS.SUBSCRIPTION.SHOPIFY_STATUS.EXPIRED)
      return;
    const graphqlApiId = appSubscription.admin_graphql_api_id;
    const subscriptionId = graphqlApiId.split('/')[4];
    var plan = appSubscription.name;
    plan = plan.split(' ')[1];
    var subscriptionPlan = CONSTANTS.SUBSCRIPTION.PLAN.BASIC;
    if (plan == CONSTANTS.SUBSCRIPTION.PLAN_NAME.PREMIUM)
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
    if (plan != CONSTANTS.STATUS.CANCELLED)
      return;
    const shop = ctx.request.body.myshopify_domain;
    shopModel.updateSubscriptionStatus(shop, CONSTANTS.SUBSCRIPTION.STATUS.CANCELLED);
    console.log(`> Shop plan cancelled: ${shop}`);
  });

  return router;
}