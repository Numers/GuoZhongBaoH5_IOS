
var exec = require('cordova/exec');

module.exports = {
get:function(SuccessCallBack,ErrorCallBack,key) {
    exec(SuccessCallBack, ErrorCallBack, "CookieStore", "get", [key]);
},
put:function(SuccessCallBack,ErrorCallBack,key,value) {
    exec(SuccessCallBack, ErrorCallBack, "CookieStore", "put", [key,value]);
},
update:function(SuccessCallBack,ErrorCallBack,key,value) {
    exec(SuccessCallBack, ErrorCallBack, "CookieStore", "update", [key,value]);
},
remove:function(SuccessCallBack,ErrorCallBack,key) {
    exec(SuccessCallBack, ErrorCallBack, "CookieStore", "remove", [key]);
}
};