const basefunc = require('@libs/basefunc');

module.exports = {
  addShop: function(shop, accessToken) {
    const free_trial_period = process.env.APP_FREE_TRIAL_PERIOD;
    this.findShopByName(shop)
      .then((shopData) => {
        if (shopData) {
          this.updateShop(shop, { access_token: accessToken });
          return;
        }
        shopData = {
          shop_origin: shop,
          access_token: accessToken,
          first_installed_time: basefunc.getCurrentTimestamp(),
          trial_expire_time: Math.floor(new Date().getTime() / 1000) + free_trial_period * 24 * 60 * 60,
        };
        var query = "INSERT INTO shops SET ?";
        return new Promise(function(resolve, reject) {
          db.query(query, shopData, function(err, result) {
            if (err)
              return reject(err);
            return resolve(result);
          });
        });
      });
  },
  findShopByName: function(shop) {
    var query = "SELECT * FROM shops WHERE shop_origin = ?";
    return new Promise(function(resolve, reject) {
      db.query(query, shop, function(err, result) {
        if (err)
          return reject(err);
        if (result.length > 0)
          return resolve(result[0]);
        else
          return resolve(null);
      });
    });
  },
  updateShop: function(shop, shopData) {
    var query = "UPDATE shops SET ? WHERE shop_origin = ?";
    return new Promise(function(resolve, reject) {
      db.query(query, [shopData, shop], function(err, result) {
        if (err)
          return reject(err);
        return resolve(result);
      });
    });
  },
  updateSubscriptionPlan: function(shop, subscriptionPlan) {
    this.updateShop(shop, { subscription_plan: subscriptionPlan });
  },
  updateSubscriptionStatus: function(shop, subscriptionStatus) {
    this.updateShop(shop, { subscription_status: subscriptionStatus });
  }
};