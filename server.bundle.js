!function(e){var n={};function o(t){if(n[t])return n[t].exports;var s=n[t]={i:t,l:!1,exports:{}};return e[t].call(s.exports,s,s.exports,o),s.l=!0,s.exports}o.m=e,o.c=n,o.d=function(e,n,t){o.o(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:t})},o.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},o.t=function(e,n){if(1&n&&(e=o(e)),8&n)return e;if(4&n&&"object"==typeof e&&e&&e.__esModule)return e;var t=Object.create(null);if(o.r(t),Object.defineProperty(t,"default",{enumerable:!0,value:e}),2&n&&"string"!=typeof e)for(var s in e)o.d(t,s,function(n){return e[n]}.bind(null,s));return t},o.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return o.d(n,"a",n),n},o.o=function(e,n){return Object.prototype.hasOwnProperty.call(e,n)},o.p="",o(o.s=6)}([function(e,n){e.exports=require("koa-router")},function(e,n,o){const t=o(5);e.exports={addShop:function(e,n){const o=process.env.APP_FREE_TRIAL_PERIOD;this.findShopByName(e).then(s=>{if(!s){s={shop_origin:e,access_token:n,notifications:'{"new_order":true,"cancelled_order":true,"paid_order":true,"fulfilled_order":true,"partially_fulfilled_order":true,"sales_report":false}',first_installed_time:t.getCurrentTimestamp(),trial_expiration_time:Math.floor((new Date).getTime()/1e3)+24*o*60*60};return new Promise((function(e,n){db.query("INSERT INTO shops SET ?",s,(function(o,t){return o?n(o):e(t)}))}))}this.updateShop(e,{access_token:n})})},findShopByName:function(e){return new Promise((function(n,o){db.query("SELECT * FROM shops WHERE shop_origin = ?",e,(function(e,t){return e?o(e):t.length>0?n(t[0]):n(null)}))}))},updateShop:function(e,n){return new Promise((function(o,t){db.query("UPDATE shops SET ? WHERE shop_origin = ?",[n,e],(function(e,n){return e?t(e):o(n)}))}))},updateSubscriptionStatus:function(e,n){this.updateShop(e,{subscription_status:n})},updateSubscription:function(e,n){return new Promise((function(o,t){db.query("UPDATE shops SET ? WHERE subscription_id = ?",[n,e],(function(e,n){return e?t(e):o(n)}))}))}}},function(e,n){e.exports={SUBSCRIPTION:{PLAN:{TRIAL:0,BASIC:1,PREMIUM:2},STATUS:{TRIAL:0,ACTIVE:1,CANCELLED:2,DECLINED:3,EXPIRED:4}},SLACK:{CONNECTED:1,DISCONNECTED:0},SETTING:{DISABLED:0,ENABLED:1,LOCKED:2},NOTIFICATION:{KEYS:["new_order","cancelled_order","paid_order","fulfilled_order","partially_fulfilled_order","sales_report"],NEW_ORDER:{TITLE:"New order notification",DESCRIPTION:"Automatically triggered when a new order is created. Includes order ID, customer's name and email, delivery location, cart total, discount code used (if any), tags (if any), UTM tracking (if any), and a link to access the order in Shopify."},CANCELLED_ORDER:{TITLE:"Cancelled order notification",DESCRIPTION:"Automatically triggered when an order is cancelled. Includes order ID, customer's name and email, delivery location, refunded amount, and a link to access the order in Shopify."},PAID_ORDER:{TITLE:"Paid order notification",DESCRIPTION:"Automatically triggered when an order's payment is completed. Includes order ID, customer's name and email, delivery location, cart total, and a link to access the order in Shopify."},FULFILLED_ORDER:{TITLE:"Fulfilled order notification",DESCRIPTION:"Automatically triggered when an order's payment is fulfilled. Includes order ID, customer's name and email, delivery location, cart total, and a link to access the order in Shopify."},PARTIALLY_FULFILLED_ORDER:{TITLE:"Partially fulfilled order notification",DESCRIPTION:"Automatically triggered when an order's payment is partially fulfilled. Includes order ID, customer's name and email, delivery location, cart total, and a link to access the order in Shopify."},SALES_REPORT:{TITLE:"Daily sales report",DESCRIPTION:"A daily summary of total revenue."}},TOAST:{HIDDEN:0,SHOW:1},ORDER:{STATUS:{UNFULFILLED:"New Order"}}}},function(e,n){e.exports=require("@shopify/koa-shopify-auth")},function(e,n){e.exports=require("@shopify/koa-shopify-graphql-proxy")},function(e,n){e.exports={getCurrentTimestamp:function(){const e=new Date;return`${e.getFullYear()}-${("0"+(e.getMonth()+1)).slice(-2)}-${("0"+e.getDate()).slice(-2)} ${("0"+e.getHours()).slice(-2)}:${("0"+e.getMinutes()).slice(-2)}:${("0"+e.getSeconds()).slice(-2)}`},getRemainingTime:function(e){const n=e-Math.floor((new Date).getTime()/1e3);return Math.ceil(n/86400)},isExpired:function(e){return Math.floor((new Date).getTime()/1e3)>e}}},function(e,n,o){o(7),o(8).config(),o(9);const t=o(10),s=o(11),r=o(12),{default:i}=o(3),{verifyRequest:a}=o(3),c=o(13),u=o(14),l=o(0),p=o(15),d=o(16),{default:f}=o(4),{ApiVersion:S}=o(4),{receiveWebhook:h,registerWebhook:y}=o(17);var T=r.createConnection({host:process.env.DB_HOST,user:process.env.DB_USER,password:process.env.DB_PASS,database:process.env.DB_NAME});T.connect((function(e){if(e)throw e;console.log("> Connected to mysql server")})),global.db=T;const E=parseInt(process.env.PORT,10)||3e3,I=s({dev:!1}),m=I.getRequestHandler(),{SHOPIFY_API_SECRET_KEY:_,SHOPIFY_API_KEY:g,HOST:A}=process.env;I.prepare().then(()=>{const e=new t;e.context.db=T,e.use(c({secure:!0,sameSite:"none"},e)),e.keys=[_],e.use(i({apiKey:g,secret:_,scopes:["read_orders","write_orders"],accessMode:"offline",async afterAuth(e){const{shop:n,accessToken:t}=e.session;e.cookies.set("shopOrigin",n,{httpOnly:!1,secure:!0,sameSite:"none"}),console.log(`> Authenticated: ${n} - ${t}`);const s=o(1);Promise.all([y({address:A+"/webhook/orders/create",topic:"ORDERS_CREATE",accessToken:t,shop:n,apiVersion:S.July20}),y({address:A+"/webhook/orders/cancelled",topic:"ORDERS_CANCELLED",accessToken:t,shop:n,apiVersion:S.July20}),y({address:A+"/webhook/orders/paid",topic:"ORDERS_PAID",accessToken:t,shop:n,apiVersion:S.July20}),y({address:A+"/webhook/orders/fulfilled",topic:"ORDERS_FULFILLED",accessToken:t,shop:n,apiVersion:S.July20}),y({address:A+"/webhook/orders/partially_fulfilled",topic:"ORDERS_PARTIALLY_FULFILLED",accessToken:t,shop:n,apiVersion:S.July20}),y({address:A+"/webhook/subscriptions/update",topic:"APP_SUBSCRIPTIONS_UPDATE",accessToken:t,shop:n,apiVersion:S.July20}),y({address:A+"/webhook/shop/update",topic:"SHOP_UPDATE",accessToken:t,shop:n,apiVersion:S.July20}),y({address:A+"/webhook/app/uninstalled",topic:"APP_UNINSTALLED",accessToken:t,shop:n,apiVersion:S.July20}),s.addShop(n,t)]).then(e=>{e[0].success&&e[1].success&&e[2].success&&e[3].success&&e[4].success&&e[5].success&&e[6].success&&e[7].success?console.log("> Webhook Registered: "+n):console.log("> Webhook registration failed: "+n)}),e.redirect("https://"+n+"/admin/apps/"+process.env.APP_NAME)}})),e.use(f({version:S.July20})),e.use(p("./public")),e.use(u());const n=new l,s=h({secret:_}),r=o(18)(s),I=o(19)(a);n.all("/(.*)",a(),async e=>{await m(e.req,e.res),e.respond=!1,e.res.statusCode=200}),e.use(r.routes()),e.use(r.allowedMethods()),e.use(d()),e.use(I.routes()),e.use(I.allowedMethods()),e.use(n.routes()),e.use(n.allowedMethods()),e.listen(E,()=>{console.log("> Server started on port: "+E)})})},function(e,n){e.exports=require("isomorphic-fetch")},function(e,n){e.exports=require("dotenv")},function(e,n){e.exports=require("module-alias/register")},function(e,n){e.exports=require("koa")},function(e,n){e.exports=require("next")},function(e,n){e.exports=require("mysql")},function(e,n){e.exports=require("koa-session")},function(e,n){e.exports=require("@koa/cors")},function(e,n){e.exports=require("koa-static")},function(e,n){e.exports=require("koa-body")},function(e,n){e.exports=require("@shopify/koa-shopify-webhooks")},function(e,n,o){const t=new(o(0))({prefix:"/webhook"}),s=o(1),r=o(2);e.exports=function(e){return t.post("/orders/create",e,async e=>{console.log("> New order created: "),console.log(e.request.body)}),t.post("/subscriptions/update",e,async e=>{e.body="ok";const n=e.request.body.app_subscription;if("ACTIVE"!=n.status&&"CANCELLED"!=n.status&&"EXPIRED"!=n.status)return;const o=n.admin_graphql_api_id.split("/")[4];let t=n.name;t=t.split(" ")[1];let i=r.SUBSCRIPTION.PLAN.BASIC;"premium"==t&&(i=r.SUBSCRIPTION.PLAN.PREMIUM);const a=r.SUBSCRIPTION.STATUS[n.status];s.updateSubscription(o,{subscription_plan:i,subscription_status:a}),console.log(`> Subscription updated: ${o} - ${t} - ${n.status}`)}),t.post("/app/uninstalled",e,async e=>{const n=e.request.body.myshopify_domain;s.updateSubscriptionStatus(n,r.SUBSCRIPTION.STATUS.CANCELLED),console.log("> App uninstalled: "+n)}),t.post("/shop/update",e,async e=>{if("cancelled"!=e.request.body.plan_name)return;const n=e.request.body.myshopify_domain;s.updateSubscriptionStatus(n,r.SUBSCRIPTION.STATUS.CANCELLED),console.log("> Shop plan cancelled: "+n)}),t}},function(e,n,o){const t=new(o(0)),s=o(20),r=o(1),i=o(5),a=o(2),c=o(2);e.exports=function(e){return t.get("/api/settings",e(),e=>{const n=e.session.shop;return new Promise((function(o,t){r.findShopByName(n).then(n=>{let t=!0,s=0,r=!1;n.subscription_plan!=a.SUBSCRIPTION.PLAN.TRIAL?(t=!1,r=n.subscription_status==a.SUBSCRIPTION.STATUS.ACTIVE):i.isExpired(n.trial_expiration_time)?t=!1:s=i.getRemainingTime(n.trial_expiration_time),e.body={trial:t,trialExpiration:s,paid:r,connected:!!n.is_slack_connected,plan:n.subscription_plan,settings:JSON.parse(n.notifications)},o()})}))}),t.post("/api/settings",e(),e=>{var n=e.request.body.settings;if(!n||Object.keys(n).length!=a.NOTIFICATION.KEYS.length)return console.log(Object.keys(n).length),console.log(a.NOTIFICATION.KEYS.length),void(e.body={result:"failed"});for(var o=0;o<a.NOTIFICATION.KEYS.length;o++){var t=a.NOTIFICATION.KEYS[o];if(!n.hasOwnProperty(t))return void(e.body={result:"failed"});n[t]?n[t]=!0:n[t]=!1}const s=e.session.shop;return new Promise((function(o,t){r.findShopByName(s).then(t=>{t.subscription_plan==a.SUBSCRIPTION.PLAN.PREMIUM&&t.subscription_status==a.SUBSCRIPTION.STATUS.ACTIVE||(n.sales_report=!1),r.updateShop(s,{notifications:JSON.stringify(n)}),e.body={result:"success"},o()})}))}),t.get("/test",e(),async e=>{const n=e.session.shop,o=await r.findShopByName(n),t=JSON.stringify({query:"{\n        orders(first: 1)\t{\n          edges {\n            node {\n              legacyResourceId\n              displayFulfillmentStatus\n              name\n              customer {\n                id\n              }\n              shippingAddress {\n                address1\n                address2\n                city\n                province\n                country\n                phone\n              }\n              totalPriceSet {\n                shopMoney {\n                  amount\n                }\n              }\n              tags\n              discountCode\n              lineItems(first: 50) {\n                edges {\n                  node {\n                    name\n                    quantity\n                  }\n                }\n              }\n            }\n          }\n        }\n      }"});return console.log(t),console.log(o.access_token),new Promise((function(s,r){fetch(`https://${n}/admin/api/2020-07/graphql.json`,{method:"POST",headers:{"Content-Type":"application/json","X-Shopify-Access-Token":o.access_token},body:t}).then(e=>e.json()).then(o=>{const t=o.data.orders.edges;if(0==t.length)e.body={result:"failed"};else{const o=t[0].node;console.log(o);let s=`*${c.ORDER.STATUS[o.displayFulfillmentStatus]}:*\n`;s+=`<https://${n}/admin/orders/${o.legacyResourceId}|${o.name}>\n`,s+="*Customer:*\n",s+=`${o.customer.firstName} ${o.customer.lastName} <${o.customer.email}>\n`,s+="*Delivery Location:*\n",s+="\n",s+="*Cart Total:*\n",s+="\n",s+="*Discount Codes:*\n",s=s+o.discountCode+"\n",s+="*Tags:*\n";let r="";o.tags.forEach((e,n)=>{n!=o.tags.length-1?r=r+e+", ":r+=e}),s=s+r+"\n",s+="*Items:*\n",o.lineItems.edges.forEach(e=>{s+=`- ${e.node.quantity} x ${e.node.name}\n`}),e.body={result:"success"}}s()})}))}),t.get("/api/subscription",e(),async e=>{const n=e.session.shop,o=await r.findShopByName(n),t=e.query.plan.toUpperCase();if(!a.SUBSCRIPTION.PLAN[t]||o.subscription_plan==a.SUBSCRIPTION.PLAN[t])return void e.redirect(`https://${n}/admin/apps/${process.env.APP_NAME}`);console.log(`> Chosen a plan: ${n} - ${t}`);var s=process.env.APP_BASIC_PLAN_FEE;"premium"==t&&(s=process.env.APP_PREMIUM_PLAN_FEE);const i=JSON.stringify({query:`mutation {\n        appSubscriptionCreate(\n          name: "Slackify ${t} plan fee"\n          returnUrl: "${process.env.HOST}/subscription/callback"\n          test: true\n          lineItems: [\n            {\n              plan: {\n                appRecurringPricingDetails: {\n                  price: { amount: ${s}, currencyCode: USD }\n                  interval: EVERY_30_DAYS\n                }\n              }\n            }\n          ]\n        ) {\n          userErrors {\n            field\n            message\n          }\n          confirmationUrl\n          appSubscription {\n            id\n          }\n        }\n      }`});return new Promise((function(t,s){fetch(`https://${n}/admin/api/2020-07/graphql.json`,{method:"POST",headers:{"Content-Type":"application/json","X-Shopify-Access-Token":o.access_token},body:i}).then(e=>e.json()).then(n=>{const o=n.data.appSubscriptionCreate.confirmationUrl;e.redirect(o),t()})}))}),t.get("/subscription/callback",e(),e=>{const n=e.session.shop,o=e.query.charge_id,t={subscription_id:o,subscription_status:a.SUBSCRIPTION.STATUS.ACTIVE,subscription_activated_time:i.getCurrentTimestamp()};r.updateShop(n,t),console.log(`> Subscription activated: ${n} - ${o}`),e.redirect(`https://${n}/admin/apps/${process.env.APP_NAME}/subscription`)}),t.get("/slack/oauth",e(),e=>{const n=e.session.shop;if(e.query.code)return new Promise((function(o,t){s({url:"https://slack.com/api/oauth.v2.access",qs:{code:e.query.code,client_id:process.env.SLACK_CLIENT_ID,client_secret:process.env.SLACK_CLIENT_SECRET},method:"GET"},(function(t,s,i){if(t)console.log("> Slack authentication error: "+t),e.response.status=500,e.response.body="Failed to add Slackify to a Slack channel.",o();else{const t=JSON.parse(i);t.ok?(r.updateShop(n,{slack_access:i,slack_webhook_url:t.incoming_webhook.url,is_slack_connected:a.SLACK.CONNECTED}),e.redirect(`https://${n}/admin/apps/${process.env.APP_NAME}`)):(console.log("> Slack authentication failed: "+t.error),e.response.status=500,e.response.body="Failed to add Slackify to the Slack channel."),o()}}))}));console.log("> Invalid slack authentication code: "+n),e.response.status=500,e.response.body="Invalid slack authentication code."}),t}},function(e,n){e.exports=require("request")}]);