module.exports = {
  getCurrentTimestamp: function() {
    const now = new Date();
    //return now.getFullYear() + '-' + ('0' + (now.getMonth() + 1)).slice(-2) + '-' + ('0' + now.getDate()).slice(-2) + ' ' + ('0' + now.getHours()).slice(-2) + ':' + ('0' + now.getMinutes()).slice(-2) + ':' + ('0' + now.getSeconds()).slice(-2);
    return `${now.getFullYear()}-${('0' + (now.getMonth() + 1)).slice(-2)}-${('0' + now.getDate()).slice(-2)} ${('0' + now.getHours()).slice(-2)}:${('0' + now.getMinutes()).slice(-2)}:${('0' + now.getSeconds()).slice(-2)}`;
  },
  getRemainingTime: function(timestamp) {
    const currentTimestamp = Math.floor(new Date().getTime() / 1000);
    const remainingTimeInSec = timestamp - currentTimestamp;
    const remainingTimeInDay = Math.ceil(remainingTimeInSec / (24 * 60 * 60));
    return remainingTimeInDay;
  },
  isExpired: function(timestamp) {
    const currentTimestamp = Math.floor(new Date().getTime() / 1000);
    if (currentTimestamp > timestamp)
      return true;
    return false;
  }
};