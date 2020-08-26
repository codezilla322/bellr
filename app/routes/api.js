const Router = require('koa-router');
const router = new Router({ prefix: '/api' });
const shop = require('@libs/shop');

router.get('/settings', async (ctx) => {
  
  ctx.body = '';
});

router.post('/settings', async (ctx) => {

});

module.exports = router;