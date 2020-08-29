const Router = require('koa-router');
const router = new Router({ prefix: '/webhook' });

module.exports = function(webhook) {

  router.post('/orders/create', webhook, async (ctx) => {
    console.log('> New order created: ');
  });

  router.post('/subscriptions/update', webhook, async (ctx) => {
    console.log('> -------Subscription update---------');
    console.log(ctx.query);
    console.log(ctx.request.body);
    console.log(ctx.params);
    console.log(ctx.body);
    console.log('> -------Subscription update---------');
  });

  return router;
}