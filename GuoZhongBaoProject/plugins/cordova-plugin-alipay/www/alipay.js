var exec = require('cordova/exec');

var AliPay = {
  pay: function(SuccessCallBack, ErrorCallBack, JsonString) {
    exec(SuccessCallBack, ErrorCallBack, 'AliPay', 'payment', [JsonString]);
  }
}

module.exports = AliPay;
