cordova.define("cordova-plugin-addressbook.AddressBook", function(require, exports, module) { 
var exec = require('cordova/exec');

module.exports = {
    upload:function(SuccessCallBack,ErrorCallBack,value) {
        exec(SuccessCallBack, ErrorCallBack, "AddressBook", "uploadAddressBook", [value]);
    }
};
});
