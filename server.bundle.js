!function(e){var t={};function o(n){if(t[n])return t[n].exports;var s=t[n]={i:n,l:!1,exports:{}};return e[n].call(s.exports,s,s.exports,o),s.l=!0,s.exports}o.m=e,o.c=t,o.d=function(e,t,n){o.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},o.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},o.t=function(e,t){if(1&t&&(e=o(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(o.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var s in e)o.d(n,s,function(t){return e[t]}.bind(null,s));return n},o.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return o.d(t,"a",t),t},o.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},o.p="",o(o.s=9)}([function(e,t){e.exports={SUBSCRIPTION:{PLAN:{TRIAL:0,BASIC:1,PREMIUM:2},PLAN_NAME:{BASIC:"BASIC",PREMIUM:"PREMIUM"},STATUS:{TRIAL:0,ACTIVE:1,CANCELLED:2,DECLINED:3,EXPIRED:4},SHOPIFY_STATUS:{ACTIVE:"ACTIVE",CANCELLED:"CANCELLED",EXPIRED:"EXPIRED"}},SLACK:{CONNECTED:1,DISCONNECTED:0},SETTING:{DISABLED:0,ENABLED:1,LOCKED:2},NOTIFICATION:{KEYS:["new_order","cancelled_order","paid_order","fulfilled_order","partially_fulfilled_order","sales_report"],NEW_ORDER:{TITLE:"New order notification",DESCRIPTION:"Automatically triggered when a new order is created. Includes order ID, customer's name and email, delivery location, cart total, discount code used(if any), tags(if any) and a link to access the order in Shopify."},CANCELLED_ORDER:{TITLE:"Cancelled order notification",DESCRIPTION:"Automatically triggered when an order is cancelled. Includes order ID, customer's name and email, delivery location, cart total, refunded amount, discount code used, tags and a link to access the order in Shopify."},PAID_ORDER:{TITLE:"Paid order notification",DESCRIPTION:"Automatically triggered when an order's payment is completed. Includes order ID, customer's name and email, delivery location, cart total, refunded amount, discount code used, tags and a link to access the order in Shopify."},FULFILLED_ORDER:{TITLE:"Fulfilled order notification",DESCRIPTION:"Automatically triggered when an order's payment is fulfilled. Includes order ID, customer's name and email, delivery location, cart total, refunded amount, discount code used, tags and a link to access the order in Shopify."},PARTIALLY_FULFILLED_ORDER:{TITLE:"Partially fulfilled order notification",DESCRIPTION:"Automatically triggered when an order's payment is partially fulfilled. Includes order ID, customer's name and email, delivery location, cart total, refunded amount, discount code used, tags, fulfilled items and a link to access the order in Shopify."},SALES_REPORT:{TITLE:"Daily sales report",DESCRIPTION:"A daily summary of total revenue from the day before automatic notification is sent."}},TOAST:{HIDDEN:0,SHOW:1},ORDER:{TITLE:{NEW_ORDER:"New Order",CANCELLED_ORDER:"Cancelled Order",PAID_ORDER:"Paid Order",FULFILLED_ORDER:"Fulfilled Order",PARTIALLY_FULFILLED_ORDER:"Partially Fulfilled Order"},FULFILLMENT:{SUCCESS:"SUCCESS",CANCELLED:"CANCELLED"}},STATUS:{SUCCESS:"success",FAILED:"failed",CANCELLED:"cancelled"}}},function(e,t,o){const{getCurrentTimestamp:n}=o(3);e.exports={getSettings:function(e,t){const o=JSON.stringify({query:"{\n        shop {\n          currencyFormats {\n            moneyFormat\n          }\n          timezoneOffset\n        }\n      }"});return new Promise((function(n,s){fetch(`https://${e}/admin/api/2020-07/graphql.json`,{method:"POST",headers:{"Content-Type":"application/json","X-Shopify-Access-Token":t},body:o}).then(e=>e.json()).then(e=>{n({access_token:t,money_format:e.data.shop.currencyFormats.moneyFormat,timezone:e.data.shop.timezoneOffset.slice(0,-2)})})}))},addShop:function(e,t){Promise.all([this.getSettings(e,t),this.getShopByName(e)]).then(o=>{const s=o[0];let r=o[1];if(r)return void this.updateShop(e,s);const i=process.env.APP_FREE_TRIAL_PERIOD;r={shop_origin:e,access_token:t,notifications:'{"new_order":true,"cancelled_order":true,"paid_order":true,"fulfilled_order":true,"partially_fulfilled_order":true,"sales_report":false}',first_installed_time:n(),trial_expiration_time:Math.floor((new Date).getTime()/1e3)+24*i*60*60,timezone:s.timezone,money_format:s.money_format};return new Promise((function(e,t){db.query("INSERT INTO shops SET ?",r,(function(o,n){return o?t(o):e(n)}))}))})},getShopByName:function(e){return new Promise((function(t,o){db.query("SELECT * FROM shops WHERE shop_origin = ?",e,(function(e,n){return e?o(e):n.length>0?t(n[0]):t(null)}))}))},updateShop:function(e,t){return new Promise((function(o,n){db.query("UPDATE shops SET ? WHERE shop_origin = ?",[t,e],(function(e,t){return e?n(e):o(t)}))}))},updateSubscriptionStatus:function(e,t){this.updateShop(e,{subscription_status:t})},updateSubscription:function(e,t){return new Promise((function(o,n){db.query("UPDATE shops SET ? WHERE subscription_id = ?",[t,e],(function(e,t){return e?n(e):o(t)}))}))},getShopsByTimezone:function(e=null,t=null){return new Promise((function(o,n){db.query("SELECT * FROM shops WHERE timezone = ? or timezone = ?",[e,t],(function(e,t){return e?n(e):o(t)}))}))}}},function(e,t){e.exports=require("koa-router")},function(e,t,o){const n=o(0);e.exports={getCurrentTimestamp:function(){const e=new Date;return`${e.getFullYear()}-${("0"+(e.getMonth()+1)).slice(-2)}-${("0"+e.getDate()).slice(-2)} ${("0"+e.getHours()).slice(-2)}:${("0"+e.getMinutes()).slice(-2)}:${("0"+e.getSeconds()).slice(-2)}`},getRemainingTimeInDay:function(e){const t=e-Math.floor((new Date).getTime()/1e3);return Math.ceil(t/86400)},isExpired:function(e){return Math.floor((new Date).getTime()/1e3)>e},isSendable:function(e,t){if(e.subscription_plan==n.SUBSCRIPTION.PLAN.TRIAL){if(this.isExpired(e.trial_expiration_time))return!1}else if(e.subscription_status!=n.SUBSCRIPTION.STATUS.ACTIVE)return!1;return e.notifications=JSON.parse(e.notifications),!!e.notifications[t]}}},function(e,t,o){const{IncomingWebhook:n}=o(24),{createNotification:s}=o(8);e.exports={sendHi:function(e){const t=new n(e);t.send({text:":wave: Hi from bellr!\nWe monitor your shopify stores pulse in slack with order notifications, daily sales reporting and low stock alerts.\nGot questions? Visit bellr.io or email support@bellr.io"}),t.send({blocks:[{type:"section",text:{type:"plain_text",text:":wave: Hi from bellr!"}},{type:"section",text:{type:"plain_text",text:"We monitor your shopify stores pulse in slack with order notifications, daily sales reporting and low stock alerts."}},{type:"section",text:{type:"plain_text",text:"Got questions? Visit bellr.io or email support@bellr.io"}}]})},sendNotification:function(e,t,o=" ",s=null,r=null){const i=new n(e);var a=[];s&&a.push({type:"button",text:"View Order",url:s}),r&&a.push({type:"button",text:"View Customer",url:r}),i.send({text:o,attachments:[{color:"#CBEFFF",fields:t,actions:a}]})},sendNotificationFromOrder:function(e,t,o,n){const r=`https://${o}/admin/orders/${e.id}`;var i=null;e.customer&&(i=`https://${o}/admin/customers/${e.customer.id}`),$fields=s(e,t,o,n.money_format),this.sendNotification(n.slack_webhook_url,fields," ",r,i)}}},function(e,t){e.exports=require("@shopify/koa-shopify-auth")},function(e,t){e.exports=require("@shopify/koa-shopify-graphql-proxy")},function(e,t){e.exports=require("moment")},function(e,t,o){const n=o(23),s=o(7),r=o(0);function i(e,t,o){const n=o.slice(0,1);let s=t.clone();"+"==n?s.hour(0).minute(0).second(0):"-"==n&&s.hour(23).minute(0).second(0),s.utcOffset(o+":00"),s.hour(0).minute(0).second(0);let r=s.format();s.add(1,"days");let i=s.format();return new Promise((async function(t,o){let n={created_at_min:r,created_at_max:i,status:"any",limit:250},s=[];do{const t=await e.order.list(n);s=s.concat(t),n=t.nextPageParameters}while(void 0!==n);let a=0,l=0,u=0,d=0,p=[],f={},m={},h={};for(const t of s){const o=parseFloat(t.total_price);d++,l+=o,t.customer&&(customerId=t.customer.id,p.includes(customerId)||p.push(customerId));let n="None";t.landing_site&&(n=t.landing_site.split("?")[0]),m[n]?m[n]+=o:m[n]=o;let s="None";if(t.referring_site){s=new URL(t.referring_site).host}if(h[s]?h[s]+=o:h[s]=o,"voided"==t.financial_status||"refunded"==t.financial_status)continue;let r=o;(await e.transaction.list(t.id)).forEach(e=>{if("void"==e.kind)return;if("success"!=e.status)return;const t=parseFloat(e.amount);if("refund"==e.kind)r-=t;else{u+=t;let n=e.gateway;n=(o=n).charAt(0).toUpperCase()+o.slice(1),f[n]?f[n]+=t:f[n]=t}var o}),a+=r}let y=0;d>0&&(y=parseFloat(l/d).toFixed(2)),h=c(h,l),m=c(m,l),f=c(f,u),t({sales:a,orders:d,aov:y,customers:p.length,referrings:h,landings:m,gateways:f})}))}function a(e,t){e=parseFloat(e),t=parseFloat(t);let o="";if(e>0&&t>0){let n=0;n=parseFloat((e-t)/t*100).toFixed(2),o=Math.abs(n)+"%` vs ",o=n>0?"`▲ "+o:n<0?"`▼ "+o:"`"+o}return o}function c(e,t){let o=[];for(key in e)if(e.hasOwnProperty(key)){let n=e[key],s=parseFloat(100*n/t).toFixed(2);o.push({key:key,value:n,percent:s})}return o.sort((function(e,t){return t.value-e.value})),o}e.exports={createNotification:function(e,t,o,n){let s=[];var i=new Object;const a=`https://${o}/admin/orders/${e.id}`;i.title=r.ORDER.TITLE[t]+":",i.value=`<${a}|${e.name}>`,s.push(i),i=new Object;const c=e.customer;i.title="Customer:",i.value=c?`${c.first_name} ${c.last_name} <${c.email}>`:"No customer info provided for this order",s.push(i),i=new Object;const l=e.shipping_address;if(i.title="Delivery Location:",l){let e="";l.address1&&(e=e+l.address1+", "),l.address2&&(e=e+l.address2+", "),l.city&&(e=e+l.city+", "),l.province&&(e=e+l.province+", "),l.country&&(e+=l.country),i.value=e}else i.value="No delivery location provided for this order";s.push(i),(i=new Object).title="Cart Total:";const u=n.replace("{{amount}}",e.total_price);if(i.value=u,s.push(i),i=new Object,e.refunds.length>0){let t=0;e.refunds.forEach(e=>{e.transactions.forEach(e=>{t+=parseFloat(e.amount)})}),t>0&&(i.title="Refunded Amount:",t=t.toFixed(2),t=n.replace("{{amount}}",t),i.value=t,s.push(i),i=new Object)}const d=e.discount_codes;if(d.length>0){let e="";i.title="Discount Codes:",d.forEach(t=>{e=e+t.code+", "}),i.value=e.slice(0,-2),s.push(i),i=new Object}e.tags&&(i.title="Tags:",i.value=e.tags,s.push(i),i=new Object);const p=e.line_items;return i.title="Line Items:",i.value="",p.forEach(e=>{i.value=i.value+`- ${e.quantity} x ${e.title}\n`}),s.push(i),i=new Object,"PARTIALLY_FULFILLED_ORDER"==t&&e.fulfillments.length>0&&(i.title="Fulfilled Items:",i.value="",e.fulfillments.forEach(e=>{e.status!=r.STATUS.CANCELLED&&(e.tracking_company&&(i.value=i.value+`- ${e.tracking_company}\n`),e.line_items.forEach(e=>{i.value=i.value+` • ${e.quantity} x ${e.title}\n`}))}),i.value||(i.value="No items fulfilled"),s.push(i),i=new Object),$fields},createReport:function(e){const t=parseInt(process.env.REPORT_TIME),o=s.utc().hour(),r=e.timezone.slice(0,1);let c=s.utc();t>o?"+"==r?c=c.subtract(1,"days"):"-"==r&&(c=c.subtract(2,"days")):t<o&&"-"==r&&(c=c.subtract(1,"days"));let l=c.clone();l=l.subtract(1,"days");let u=c.clone();u=u.subtract(7,"days");const d=new n({shopName:e.shop_origin,accessToken:e.access_token,apiVersion:"2020-07"});return new Promise((function(t,o){Promise.all([i(d,c,e.timezone),i(d,l,e.timezone),i(d,u,e.timezone)]).then(o=>{let n=[],s={},r=o[0],i=o[1],l=o[2],d="",p=e.money_format.replace("{{amount}}",r.sales.toFixed(2));s.title=`:moneybag: Total Sales \`${p}\``,s.value="",d=a(r.sales,i.sales),p=e.money_format.replace("{{amount}}",i.sales.toFixed(2)),s.value=s.value+`${d}Prev.Day: \`${p}\`\n`,d=a(r.sales,l.sales),p=e.money_format.replace("{{amount}}",l.sales),s.value=s.value+`${d}Last ${u.format("dddd")}: \`${p}\``,n.push(s),s=new Object,s.title=`:handshake: Orders \`${r.orders}\``,s.value="",d=a(r.orders,i.orders),s.value=s.value+`${d}Prev.Day: \`${i.orders}\`\n`,d=a(r.orders,l.orders),s.value=s.value+`${d}Last ${u.format("dddd")}: \`${l.orders}\``,n.push(s),s=new Object,s.title=`:male-office-worker: Customers \`${r.customers}\``,s.value="",d=a(r.customers,i.customers),s.value=s.value+`${d}Prev.Day: \`${i.customers}\`\n`,d=a(r.customers,l.customers),s.value=s.value+`${d}Last ${u.format("dddd")}: \`${l.customers}\``,n.push(s),s=new Object;let f=e.money_format.replace("{{amount}}",r.aov);s.title=`:shopping_bags: Average Order Value \`${f}\``,s.value="",d=a(r.aov,i.aov),f=e.money_format.replace("{{amount}}",i.aov),s.value=s.value+`${d}Prev.Day: \`${f}\`\n`,d=a(r.aov,l.aov),f=e.money_format.replace("{{amount}}",l.aov),s.value=s.value+`${d}Last ${u.format("dddd")}: \`${f}\``,n.push(s),s=new Object,s.title=":spider_web: Source (Top 3)",s.value="",r.referrings.forEach((t,o)=>{if(o>2)return;const n=e.money_format.replace("{{amount}}",t.value.toFixed(2));s.value=s.value+`• ${t.key}: \`${n}\` (${t.percent}%)\n`}),s.value||(s.value="No order source found"),n.push(s),s=new Object,s.title=":bookmark_tabs: Landing Pages (Top 3)",s.value="",r.landings.forEach((t,o)=>{if(o>2)return;const n=e.money_format.replace("{{amount}}",t.value.toFixed(2));s.value=s.value+`• ${t.key}: \`${n}\` (${t.percent}%)\n`}),s.value||(s.value="No landing pages found"),n.push(s),s=new Object,s.title=":bank: Payment Gateways (Top 3)",s.value="",r.gateways.forEach((t,o)=>{if(o>2)return;const n=e.money_format.replace("{{amount}}",t.value.toFixed(2));s.value=s.value+`• ${t.key}: \`${n}\` (${t.percent}%)\n`}),s.value||(s.value="No payment gateways found"),n.push(s),s=new Object,t({fields:n,title:`:chart_with_upwards_trend: Report (${c.format("YYYY-MM-DD")})`})})}))}}},function(e,t,o){o(10),o(11).config(),o(12);const n=o(13),s=o(14),r=o(15),{default:i}=o(5),{verifyRequest:a}=o(5),c=o(16),l=o(17),u=o(2),d=o(18),p=o(19),f=o(20).CronJob,{default:m}=o(6),{ApiVersion:h}=o(6),{receiveWebhook:y,registerWebhook:S}=o(21),{checkStores:E}=o(22);var _=r.createConnection({host:process.env.DB_HOST,user:process.env.DB_USER,password:process.env.DB_PASS,database:process.env.DB_NAME});_.connect((function(e){if(e)throw e;console.log("> Connected to mysql server")})),global.db=_;const I=parseInt(process.env.PORT,10)||3e3,T=s({dev:!1}),g=T.getRequestHandler(),{SHOPIFY_API_SECRET_KEY:v,SHOPIFY_API_KEY:O,HOST:L}=process.env;T.prepare().then(()=>{const e=new n;e.context.db=_,e.use(c({secure:!0,sameSite:"none"},e)),e.keys=[v],e.use(i({apiKey:O,secret:v,scopes:["read_orders","write_orders","read_customers"],accessMode:"offline",async afterAuth(e){const{shop:t,accessToken:n}=e.session;e.cookies.set("shopOrigin",t,{httpOnly:!1,secure:!0,sameSite:"none"}),console.log(`> Authenticated: ${t} - ${n}`);const s=o(1);Promise.all([S({address:L+"/webhook/orders/create",topic:"ORDERS_CREATE",accessToken:n,shop:t,apiVersion:h.July20}),S({address:L+"/webhook/orders/cancelled",topic:"ORDERS_CANCELLED",accessToken:n,shop:t,apiVersion:h.July20}),S({address:L+"/webhook/orders/paid",topic:"ORDERS_PAID",accessToken:n,shop:t,apiVersion:h.July20}),S({address:L+"/webhook/orders/fulfilled",topic:"ORDERS_FULFILLED",accessToken:n,shop:t,apiVersion:h.July20}),S({address:L+"/webhook/orders/partially_fulfilled",topic:"ORDERS_PARTIALLY_FULFILLED",accessToken:n,shop:t,apiVersion:h.July20}),S({address:L+"/webhook/subscriptions/update",topic:"APP_SUBSCRIPTIONS_UPDATE",accessToken:n,shop:t,apiVersion:h.July20}),S({address:L+"/webhook/shop/update",topic:"SHOP_UPDATE",accessToken:n,shop:t,apiVersion:h.July20}),S({address:L+"/webhook/app/uninstalled",topic:"APP_UNINSTALLED",accessToken:n,shop:t,apiVersion:h.July20}),s.addShop(t,n)]).then(e=>{e[0].success&&e[1].success&&e[2].success&&e[3].success&&e[4].success&&e[5].success&&e[6].success&&e[7].success?console.log("> Webhook Registered: "+t):console.log("> Webhook registration failed: "+t)}),e.redirect("https://"+t+"/admin/apps/"+process.env.APP_NAME)}})),e.use(m({version:h.July20})),e.use(d("./public")),e.use(l());const t=new u,s=y({secret:v}),r=o(25)(s),f=o(26)(a);t.all("/(.*)",a(),async e=>{await g(e.req,e.res),e.respond=!1,e.res.statusCode=200}),e.use(r.routes()),e.use(r.allowedMethods()),e.use(p()),e.use(f.routes()),e.use(f.allowedMethods()),e.use(t.routes()),e.use(t.allowedMethods()),e.listen(I,()=>{console.log("> Server started on port: "+I)})});new f("0 0 * * * *",(function(){console.log("> Check for report"),E()}),null,!0).start()},function(e,t){e.exports=require("isomorphic-fetch")},function(e,t){e.exports=require("dotenv")},function(e,t){e.exports=require("module-alias/register")},function(e,t){e.exports=require("koa")},function(e,t){e.exports=require("next")},function(e,t){e.exports=require("mysql")},function(e,t){e.exports=require("koa-session")},function(e,t){e.exports=require("@koa/cors")},function(e,t){e.exports=require("koa-static")},function(e,t){e.exports=require("koa-body")},function(e,t){e.exports=require("cron")},function(e,t){e.exports=require("@shopify/koa-shopify-webhooks")},function(e,t,o){const n=o(7),{getShopsByTimezone:s}=o(1),r=o(0),{createReport:i}=o(8),{sendNotification:a}=o(4);e.exports={checkStores:async function(){const e=parseInt(process.env.REPORT_TIME),t=n.utc().hour();let o=0,c=0;e>t?(o=e-t,c=e-t-24):e<t&&(o=e+24-t,c=e-t),o=o>=0&&o<=13?"+"+("0"+o).slice(-2):null,c<0&&c>=-12?(c=-c,c="-"+("0"+c).slice(-2)):c=null;(await s(o,c)).forEach(e=>{e.subscription_plan==r.SUBSCRIPTION.PLAN.PREMIUM&&e.subscription_status==r.SUBSCRIPTION.STATUS.ACTIVE&&(notifications=JSON.parse(e.notifications),notifications.sales_report&&i(e).then(t=>{a(e.slack_webhook_url,t.fields,t.title)}))})}}},function(e,t){e.exports=require("shopify-api-node")},function(e,t){e.exports=require("@slack/webhook")},function(e,t,o){const n=new(o(2))({prefix:"/webhook"}),s=o(1),r=o(0),{isSendable:i}=o(3),{sendNotificationFromOrder:a}=o(4);e.exports=function(e){return n.post("/orders/create",e,async e=>{const t=e.headers["x-shopify-shop-domain"],o=e.request.body;console.log(`> New order created: ${t} - ${o.id}`);const n=await s.getShopByName(t);i(n,"new_order")&&a(o,"NEW_ORDER",t,n)}),n.post("/orders/cancelled",e,async e=>{const t=e.headers["x-shopify-shop-domain"],o=e.request.body;console.log(`> Order cancelled: ${t} - ${o.id}`);const n=await s.getShopByName(t);i(n,"cancelled_order")&&a(o,"CANCELLED_ORDER",t,n)}),n.post("/orders/paid",e,async e=>{const t=e.headers["x-shopify-shop-domain"],o=e.request.body;console.log(`> Order paid: ${t} - ${o.id}`);const n=await s.getShopByName(t);i(n,"paid_order")&&a(o,"PAID_ORDER",t,n)}),n.post("/orders/fulfilled",e,async e=>{const t=e.headers["x-shopify-shop-domain"],o=e.request.body;console.log(`> Order fulfilled: ${t} - ${o.id}`);const n=await s.getShopByName(t);i(n,"fulfilled_order")&&a(o,"FULFILLED_ORDER",t,n)}),n.post("/orders/partially_fulfilled",e,async e=>{const t=e.headers["x-shopify-shop-domain"],o=e.request.body;console.log(`> Order partially fulfilled: ${t} - ${o.id}`);const n=await s.getShopByName(t);i(n,"partially_fulfilled_order")&&a(o,"PARTIALLY_FULFILLED_ORDER",t,n)}),n.post("/subscriptions/update",e,async e=>{const t=e.request.body.app_subscription;if(t.status!=r.SUBSCRIPTION.SHOPIFY_STATUS.ACTIVE&&t.status!=r.SUBSCRIPTION.SHOPIFY_STATUS.CANCELLED&&t.status!=r.SUBSCRIPTION.SHOPIFY_STATUS.EXPIRED)return;const o=t.admin_graphql_api_id.split("/")[4];var n=t.name;n=n.split(" ")[1].toUpperCase();var i=r.SUBSCRIPTION.PLAN.BASIC;n==r.SUBSCRIPTION.PLAN_NAME.PREMIUM&&(i=r.SUBSCRIPTION.PLAN.PREMIUM);const a=r.SUBSCRIPTION.STATUS[t.status];s.updateSubscription(o,{subscription_plan:i,subscription_status:a}),console.log(`> Subscription updated: ${o} - ${n} - ${t.status}`)}),n.post("/app/uninstalled",e,async e=>{const t=e.request.body.myshopify_domain;s.updateSubscriptionStatus(t,r.SUBSCRIPTION.STATUS.CANCELLED),console.log("> App uninstalled: "+t)}),n.post("/shop/update",e,async e=>{if(e.request.body.plan_name!=r.STATUS.CANCELLED)return;const t=e.request.body.myshopify_domain;s.updateSubscriptionStatus(t,r.SUBSCRIPTION.STATUS.CANCELLED),console.log("> Shop plan cancelled: "+t)}),n}},function(e,t,o){const n=new(o(2)),s=o(27),r=o(1),i=o(0),a=o(3),{sendHi:c,sendNotification:l}=o(4);e.exports=function(e){return n.get("/api/settings",e(),e=>{const t=e.session.shop;return new Promise((function(o,n){r.getShopByName(t).then(t=>{let n=!0,s=0,r=!1;t.subscription_plan!=i.SUBSCRIPTION.PLAN.TRIAL?(n=!1,r=t.subscription_status==i.SUBSCRIPTION.STATUS.ACTIVE):a.isExpired(t.trial_expiration_time)?n=!1:s=a.getRemainingTimeInDay(t.trial_expiration_time),e.body={trial:n,trialExpiration:s,paid:r,connected:!!t.slack_connected,plan:t.subscription_plan,settings:JSON.parse(t.notifications)},o()})}))}),n.post("/api/settings",e(),e=>{var t=e.request.body.settings;if(!t||Object.keys(t).length!=i.NOTIFICATION.KEYS.length)return void(e.body={result:i.STATUS.FAILED});for(var o=0;o<i.NOTIFICATION.KEYS.length;o++){var n=i.NOTIFICATION.KEYS[o];if(!t.hasOwnProperty(n))return void(e.body={result:i.STATUS.FAILED});t[n]?t[n]=!0:t[n]=!1}const s=e.session.shop;return new Promise((function(o,n){r.getShopByName(s).then(n=>{n.subscription_plan==i.SUBSCRIPTION.PLAN.PREMIUM&&n.subscription_status==i.SUBSCRIPTION.STATUS.ACTIVE||(t.sales_report=!1),r.updateShop(s,{notifications:JSON.stringify(t)}),e.body={result:i.STATUS.SUCCESS},o()})}))}),n.get("/test",e(),async e=>{const t=e.session.shop,o=await r.getShopByName(t),n=JSON.stringify({query:"{\n        shop {\n          currencyFormats {\n            moneyFormat\n          }\n        }\n        orders(first: 1, reverse: true)\t{\n          edges {\n            node {\n              legacyResourceId\n              displayFinancialStatus\n              displayFulfillmentStatus\n              name\n              customer {\n                legacyResourceId\n                displayName\n                email\n              }\n              shippingAddress {\n                address1\n                address2\n                city\n                province\n                country\n                phone\n              }\n              totalPriceSet {\n                shopMoney {\n                  amount\n                }\n              }\n              totalRefundedSet{\n                shopMoney {\n                  amount\n                }\n              }\n              tags\n              discountCode\n              lineItems(first: 50) {\n                edges {\n                  node {\n                    name\n                    quantity\n                  }\n                }\n              }\n              refunds {\n                refundLineItems(first: 50) {\n                  edges {\n                    node {\n                      lineItem {\n                        name\n                      }\n                      quantity\n                    }\n                  }\n                }\n              }\n              fulfillments {\n                status\n                trackingInfo {\n                  company\n                }\n                fulfillmentLineItems(first: 50) {\n                  edges {\n                    node {\n                      lineItem {\n                        name\n                      }\n                      quantity\n                    }\n                  }\n                }\n              }\n            }\n          }\n        }\n      }"});return new Promise((function(s,r){fetch(`https://${t}/admin/api/2020-07/graphql.json`,{method:"POST",headers:{"Content-Type":"application/json","X-Shopify-Access-Token":o.access_token},body:n}).then(e=>e.json()).then(n=>{const r=n.data.orders.edges;if(0==r.length)e.body={result:i.STATUS.FAILED};else{const s=n.data.shop.currencyFormats.moneyFormat,a=r[0].node;let c=[],u=new Object,d=a.displayFinancialStatus,p=a.displayFulfillmentStatus,f="";"FULFILLED"==p?f="FULFILLED_ORDER":"PARTIALLY_FULFILLED"==p?f="PARTIALLY_FULFILLED_ORDER":"PAID"==d||"PARTIALLY_REFUNDED"==d?f="PAID_ORDER":"PENDING"!=d&&"AUTHORIZED"!=d||(f="NEW_ORDER"),"VOIDED"!=d&&"REFUNDED"!=d||(f="CANCELLED_ORDER"),u.title=i.ORDER.TITLE[f]+":";const m=`https://${t}/admin/orders/${a.legacyResourceId}`;u.value=`<${m}|${a.name}>`,c.push(u),u=new Object,u.title="Customer:";const h=a.customer;u.value=h?`${h.displayName} <${h.email}>`:"No customer info provided for this order",c.push(u),u=new Object,u.title="Delivery Location:";const y=a.shippingAddress;if(y){let e="";y.address1&&(e=e+y.address1+", "),y.address2&&(e=e+y.address2+", "),y.city&&(e=e+y.city+", "),y.province&&(e=e+y.province+", "),y.country&&(e+=y.country),u.value=e}else u.value="No delivery location provided for this order";c.push(u),u=new Object,u.title="Cart Total:";let S=parseFloat(a.totalPriceSet.shopMoney.amount);S=S.toFixed(2);const E=s.replace("{{amount}}",S);u.value=E,c.push(u),u=new Object;let _=parseFloat(a.totalRefundedSet.shopMoney.amount);if(_){u.title="Refunded Amount:",_=_.toFixed(2);const e=s.replace("{{amount}}",_);u.value=e,c.push(u),u=new Object}if(a.discountCode&&(u.title="Discount Codes:",u.value=a.discountCode,c.push(u),u=new Object),a.tags.length){u.title="Tags:";let e="";a.tags.forEach(t=>{e=e+t+", "}),u.value=e.slice(0,-2),c.push(u),u=new Object}u.title="Line Items:",u.value="",a.lineItems.edges.forEach(e=>{u.value=u.value+`- ${e.node.quantity} x ${e.node.name}\n`}),c.push(u),u=new Object,"PARTIALLY_FULFILLED_ORDER"==f&&a.fulfillments.length>0&&(u.title="Fulfilled Items:",u.value="",a.fulfillments.forEach(e=>{e.status!=i.ORDER.FULFILLMENT.CANCELLED&&(e.trackingInfo.length>0&&(u.value=u.value+`- ${e.trackingInfo[0].company}\n`),e.fulfillmentLineItems.edges.forEach(e=>{u.value=u.value+`• ${e.node.quantity} x ${e.node.lineItem.name}\n`}))}),u.value||(u.value="No items fulfilled"),c.push(u),u=new Object);let I=null;I=h?`https://${t}/admin/customers/${h.legacyResourceId}`:null,l(o.slack_webhook_url,c," ",m,I),e.body={result:i.STATUS.SUCCESS}}s()})}))}),n.get("/api/subscription",e(),async e=>{const t=e.session.shop,o=await r.getShopByName(t),n=e.query.plan.toUpperCase();if(!i.SUBSCRIPTION.PLAN[n]||o.subscription_plan==i.SUBSCRIPTION.PLAN[n])return void e.redirect(`https://${t}/admin/apps/${process.env.APP_NAME}`);console.log(`> Chosen a plan: ${t} - ${n}`);var s=process.env.APP_BASIC_PLAN_FEE;n==i.SUBSCRIPTION.PLAN_NAME.PREMIUM&&(s=process.env.APP_PREMIUM_PLAN_FEE);const a=JSON.stringify({query:`mutation {\n        appSubscriptionCreate(\n          name: "Slackify ${n} plan fee"\n          returnUrl: "${process.env.HOST}/subscription/callback"\n          test: true\n          lineItems: [\n            {\n              plan: {\n                appRecurringPricingDetails: {\n                  price: { amount: ${s}, currencyCode: USD }\n                  interval: EVERY_30_DAYS\n                }\n              }\n            }\n          ]\n        ) {\n          userErrors {\n            field\n            message\n          }\n          confirmationUrl\n          appSubscription {\n            id\n          }\n        }\n      }`});return new Promise((function(n,s){fetch(`https://${t}/admin/api/2020-07/graphql.json`,{method:"POST",headers:{"Content-Type":"application/json","X-Shopify-Access-Token":o.access_token},body:a}).then(e=>e.json()).then(t=>{const o=t.data.appSubscriptionCreate.confirmationUrl;e.redirect(o),n()})}))}),n.get("/subscription/callback",e(),e=>{const t=e.session.shop,o=e.query.charge_id,n={subscription_id:o,subscription_status:i.SUBSCRIPTION.STATUS.ACTIVE,subscription_activated_time:a.getCurrentTimestamp()};r.updateShop(t,n),console.log(`> Subscription activated: ${t} - ${o}`),e.redirect(`https://${t}/admin/apps/${process.env.APP_NAME}`)}),n.get("/slack/oauth",e(),e=>{const t=e.session.shop;if(e.query.code)return new Promise((function(o,n){s({url:"https://slack.com/api/oauth.v2.access",qs:{code:e.query.code,client_id:process.env.SLACK_CLIENT_ID,client_secret:process.env.SLACK_CLIENT_SECRET},method:"GET"},(function(n,s,a){if(n)console.log("> Slack authentication error: "+n),e.response.status=500,e.response.body="Failed to add Slackify to a Slack channel.",o();else{const n=JSON.parse(a);n.ok?(r.updateShop(t,{slack_access:a,slack_webhook_url:n.incoming_webhook.url,slack_connected:i.SLACK.CONNECTED}),c(n.incoming_webhook.url),e.response.body="Connected to slack channel",e.redirect(`https://${t}/admin/apps/${process.env.APP_NAME}`)):(console.log("> Slack authentication failed: "+n.error),e.response.status=500,e.response.body="Failed to add Slackify to the Slack channel."),o()}}))}));console.log("> Invalid slack authentication code: "+t),e.response.status=500,e.response.body="Invalid slack authentication code."}),n}},function(e,t){e.exports=require("request")}]);