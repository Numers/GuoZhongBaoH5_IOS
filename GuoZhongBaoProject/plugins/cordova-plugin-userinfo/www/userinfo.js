
var exec = require('cordova/exec');

module.exports = {
   get:function(SuccessCallBack,ErrorCallBack) {
       exec(SuccessCallBack, ErrorCallBack, "UserInfo", "get", []);
   },
   put:function(SuccessCallBack,ErrorCallBack,value) {
       exec(SuccessCallBack, ErrorCallBack, "UserInfo", "put", [value]);
   },
   update:function(SuccessCallBack,ErrorCallBack,value) {
       exec(SuccessCallBack, ErrorCallBack, "UserInfo", "update", [value]);
   },
   del:function(SuccessCallBack,ErrorCallBack) {
       exec(SuccessCallBack, ErrorCallBack, "UserInfo", "del", []);
   }
};