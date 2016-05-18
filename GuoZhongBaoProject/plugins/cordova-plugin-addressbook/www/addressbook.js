
var exec = require('cordova/exec');

module.exports = {
    upload:function(SuccessCallBack,ErrorCallBack,value) {
        exec(SuccessCallBack, ErrorCallBack, "AddressBook", "uploadAddressBook", [value]);
    }
};