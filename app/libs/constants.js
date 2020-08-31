module.exports = {
  subscription: {
    plan: { TRIAL: 0, BASIC: 1, PREMIUM: 2 },
    status: { TRIAL: 0, ACTIVE: 1, CANCELLED: 2, DECLINED: 3, EXPIRED: 4 }
  },
  slack: { CONNECTED: 1, DISCONNECTED: 0 }
}