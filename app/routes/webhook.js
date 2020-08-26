const Router = require('koa-router');
const router = new Router({ prefix: '/webhook' });

module.exports = function(webhook) {

  router.post('/orders/create', webhook, async (ctx) => {
    console.log('> New order created!');
  });

  return router;
}