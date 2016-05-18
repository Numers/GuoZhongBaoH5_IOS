/**
 * Created by 00 on 2015/7/7.
 */
if ($config) {
    var _config = $config;
    $config = null;
}
var $config = function () {
    var offline = false,
        _location = window.location.search;
    offline = (_location.indexOf('?offline') >= 0);
    var api_base_url = offline ? 'http://api.gzb.renrenfenqi.com/v1.3.1' : 'http://api.guozhongbao.com/v1.3.1';

    function getArgs() {
        var args = {};
        var query = location.search.substring(1);
        var pairs = query.split("&");
        for (var i = 0; i < pairs.length; i++) {
            var pos = pairs[i].indexOf('=');
            // Look for "name=value"
            if (pos == -1) continue;
            // If not found, skip
            var argname = pairs[i].substring(0, pos);// Extract the name
            var value = pairs[i].substring(pos + 1);// Extract the value
            value = decodeURIComponent(value);// Decode it, if needed
            args[argname] = value;
        }
        return args;
    }

    //内建函数
    var _getUserInfo = function (callback) {
        //验证登入是否有效
        return getArgs();
    };

    var _alert = function (c, t, callback) {
        $(".popup-title").text(c);
        $(".popup-body span").text(t);
        $(".popup-container").show();
        $('.backdrop').show();

        $(".popup-buttons button").on('touchend', function (e) {
            e.preventDefault();
            e.stopPropagation();
            _alertHide();
        });
    };

    var _alertHide = function (callback) {
        $('.popup-container').hide();
        $('.backdrop').hide();
        if (callback) {
            callback();
        }
    };

    var _loadingHide = function (callback) {
        $('.loading-container').hide();
        $('.backdrop').hide();
        if (callback) {
            callback();
        }
    };

    var _loadingShow = function (callback) {
        $('.loading-container').show();
        $('.backdrop').show();
        if (callback) {
            callback();
        }
    };

    _loadingHide();
    _alertHide(function () {
        $('.popup-container').removeClass('visiblehide');
    });

    return {
        API: {
            get_red_packet: api_base_url + "/redpacket/get_redpacket_info",
            get_money: api_base_url + "/redpacket/withdraw",
            put_code: api_base_url + "/redpacket/store_code",
            checkout_status: api_base_url + "/redpacket/redpacket_status",
            get_support_bank: api_base_url + '/redpacket/get_support_bank',
            store_withdraw_info: api_base_url + '/redpacket/store_withdraw_info',
            is_share: api_base_url + '/redpacket/can_you_share',

            area_list: offline ? 'http://api.gzb.renrenfenqi.com/area/list' : 'http://api.guozhongbao.com/area/list',

            redpacket_login_url: offline ? '/?offline#/user/login?from=redpacket' : '/#/user/login?from=redpacket',
            re_login: offline ? "/?offline#/user/login?relogin=true" : "/#/user/login?relogin=true",
            home_url: offline ? "/?offline#/home" : "/#/home",
            share_url: offline ? "/activity/redpacket/share.html?offline" : "/activity/redpacket/share.html?online",
            login_url: offline ? '/?offline#/user/login' : '/#/user/login'
        },
        MESSAGE: {
            net_error: "网络连接失败",
            activity_end: "活动已经结束",
            code_error: "请输入正确的5位兑换码"
        },
        FUNC: {
            alert: _alert,
            alertHide: _alertHide,
            loadingHide: _loadingHide,
            loadingShow: _loadingShow,
            getUserInfo: _getUserInfo
        },
        TEMP: {
            red_href: '',
            withdraw_info_status: 0,
            withdraw_recode: '',
            isRed: 0,
            code: 0,
            isWithdraw: 0,
            address_type: '',
            company_county: '',
            home_county: '',
            company_address: '',
            home_address: '',
            company_cid: '',
            home_cid: '',
            user_info: ''
        }
    }
};

var config = $config();