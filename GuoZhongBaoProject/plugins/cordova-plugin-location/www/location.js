
var exec = require('cordova/exec');

module.exports = {
startLocationService:function(SuccessCallBack,ErrorCallBack,value) {
    exec(SuccessCallBack, ErrorCallBack, "Location", "startLocationService", [value]);
},
stopLocationService:function(SuccessCallBack,ErrorCallBack) {
    exec(SuccessCallBack, ErrorCallBack, "Location", "stopLocationService", []);
},
postLocationStrategy:function(SuccessCallBack,ErrorCallBack,value) {
    exec(SuccessCallBack, ErrorCallBack, "Location", "postLocationStrategy", [value]);
},
getLocationAuthetication:function(SuccessCallBack,ErrorCallBack) {
    exec(SuccessCallBack, ErrorCallBack, "Location", "getLocationAuthetication", []);
}
};