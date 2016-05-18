cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "plugins/cordova-plugin-umpay/www/umpay.js",
        "id": "cordova-plugin-umpay.UmPay",
        "clobbers": [
            "UmPay"
        ]
    },
    {
        "file": "plugins/cordova-plugin-userinfo/www/userinfo.js",
        "id": "cordova-plugin-userinfo.UserInfo",
        "clobbers": [
            "UserInfo"
        ]
    },
    {
        "file": "plugins/cordova-plugin-cookiestore/www/cookiestore.js",
        "id": "cordova-plugin-cookiestore.CookieStore",
        "clobbers": [
            "CookieStore"
        ]
    },
    {
        "file": "plugins/cordova-plugin-camera/www/CameraConstants.js",
        "id": "cordova-plugin-camera.Camera",
        "clobbers": [
            "Camera"
        ]
    },
    {
        "file": "plugins/cordova-plugin-camera/www/CameraPopoverOptions.js",
        "id": "cordova-plugin-camera.CameraPopoverOptions",
        "clobbers": [
            "CameraPopoverOptions"
        ]
    },
    {
        "file": "plugins/cordova-plugin-camera/www/Camera.js",
        "id": "cordova-plugin-camera.camera",
        "merges": [
            "Camera"
        ]
    },
    {
        "file": "plugins/cordova-plugin-camera/www/ios/CameraPopoverHandle.js",
        "id": "cordova-plugin-camera.CameraPopoverHandle",
        "clobbers": [
            "CameraPopoverHandle"
        ]
    },
    {
        "file": "plugins/cordova-plugin-addressbook/www/addressbook.js",
        "id": "cordova-plugin-addressbook.AddressBook",
        "clobbers": [
            "AddressBook"
        ]
    },
    {
        "file": "plugins/cordova-plugin-alipay/www/alipay.js",
        "id": "cordova-plugin-alipay.AliPay",
        "clobbers": [
            "AliPay"
        ]
    },
    {
        "file": "plugins/cordova-plugin-location/www/location.js",
        "id": "cordova-plugin-location.Location",
        "clobbers": [
            "Location"
        ]
    },
    {
        "file": "plugins/cordova-plugin-share/www/share.js",
        "id": "cordova-plugin-share.Share",
        "clobbers": [
            "Share"
        ]
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "cordova-plugin-umpay": "1.0.0-dev",
    "cordova-plugin-userinfo": "1.0.0-dev",
    "cordova-plugin-cookiestore": "1.0.0-dev",
    "cordova-plugin-camera": "1.2.0",
    "cordova-plugin-addressbook": "1.0.0-dev",
    "cordova-plugin-whitelist": "1.0.0",
    "cordova-plugin-alipay": "1.0.0",
    "cordova-plugin-location": "1.0.0-dev",
    "cordova-plugin-share": "1.0.0-dev"
}
// BOTTOM OF METADATA
});