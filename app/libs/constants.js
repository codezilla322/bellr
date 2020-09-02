module.exports = {
  SUBSCRIPTION: {
    PLAN: { TRIAL: 0, BASIC: 1, PREMIUM: 2 },
    STATUS: { TRIAL: 0, ACTIVE: 1, CANCELLED: 2, DECLINED: 3, EXPIRED: 4 }
  },
  SLACK: { CONNECTED: 1, DISCONNECTED: 0 },
  SETTING: { DISABLED: 0, ENABLED: 1, LOCKED: 2 },
  NOTIFICATION: {
    KEYS: ['new_order', 'cancelled_order', 'paid_order', 'fulfilled_order', 'partially_fulfilled_order', 'sales_report'],
    NEW_ORDER: {
      TITLE: 'New order notification',
      DESCRIPTION: 'Automatically triggered when a new order is created. Includes order ID, customer\'s name and email, delivery location, cart total, discount code used (if any), tags (if any), UTM tracking (if any), and a link to access the order in Shopify.'
    },
    CANCELLED_ORDER: {
      TITLE: 'Cancelled order notification',
      DESCRIPTION: 'Automatically triggered when an order is cancelled. Includes order ID, customer\'s name and email, delivery location, refunded amount, and a link to access the order in Shopify.'
    },
    PAID_ORDER: {
      TITLE: 'Paid order notification',
      DESCRIPTION: 'Automatically triggered when an order\'s payment is completed. Includes order ID, customer\'s name and email, delivery location, cart total, and a link to access the order in Shopify.'
    },
    FULFILLED_ORDER: {
      TITLE: 'Fulfilled order notification',
      DESCRIPTION: 'Automatically triggered when an order\'s payment is fulfilled. Includes order ID, customer\'s name and email, delivery location, cart total, and a link to access the order in Shopify.'
    },
    PARTIALLY_FULFILLED_ORDER: {
      TITLE: 'Partially fulfilled order notification',
      DESCRIPTION: 'Automatically triggered when an order\'s payment is partially fulfilled. Includes order ID, customer\'s name and email, delivery location, cart total, and a link to access the order in Shopify.'
    },
    SALES_REPORT: {
      TITLE: 'Daily sales report',
      DESCRIPTION: 'A daily summary of total revenue.'
    },
  },
  TOAST: { HIDDEN: 0, SUCCESS: 1, FAILED: 2 }
}