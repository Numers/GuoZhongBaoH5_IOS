'use strict';

angular.module('guozhongbao.services', [])

    .factory('Common', ['$ionicPopup', '$ionicHistory', '$cacheFactory', '$ionicLoading', '$http', function ($ionicPopup, $ionicHistory, $cacheFactory, $ionicLoading, $http) {
        var offline = true,
            location = window.location.search, api_base_url, env_query;

//        api_base_url = offline ? 'http://api.gzb.renrenfenqi.com' : 'http://api.guozhongbao.com';
//        env_query = offline ? '?offline' : '&online';
        api_base_url = offline ? 'http://stage.api.guozhongbao.com' : 'http://api.guozhongbao.com';
        env_query = offline ? '?stage' : '&online';

        Date.prototype.format = function (fmt) {
            var o = {
                "M+": this.getMonth() + 1,                 //月份
                "d+": this.getDate(),                    //日
                "h+": this.getHours(),                   //小时
                "m+": this.getMinutes(),                 //分
                "s+": this.getSeconds(),                 //秒
                "q+": Math.floor((this.getMonth() + 3) / 3), //季度
                "S": this.getMilliseconds()             //毫秒
            };
            if (/(y+)/.test(fmt))
                fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
            for (var k in o)
                if (new RegExp("(" + k + ")").test(fmt))
                    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            return fmt;
        };
        
        var u = window.navigator.userAgent,loadingTemplate='';
        if (u.match(/(iPhone|iPod|ios|iPad)/i)) {
            loadingTemplate = '<ion-spinner icon="bubbles" style="fill:#fff"></ion-spinner>';
        } else{
            loadingTemplate='<img src="img/loan/pic_loading.gif" style="width:30px;height:30px;">';
        }


        //添加外部的方法可以获取的函数
        window.angularResource = function () {
            function _redirect (s) {
                $location.path(s);
            }

            function _getUserInfo() {
                return _cookieStore.get('uinfo');
            }

            return {
                redirect: _redirect,
                getUserInfo: _getUserInfo
            };
        }();

        var _checkLogin = function () {
                var uinfo = _cookieStore.get('uinfo');
                if (uinfo) {
                    return uinfo;
                } else {
                    return false;
                }
            },
            _alert = function (t, c) {
                var a = c || t;
                var myAlert = $ionicPopup.alert({
                    title: t,
                    template: a
                });
                return myAlert;
            },
            _checkID = function (id) {
                return /^(\d{6})(18|19|20)?(\d{2})([01]\d)([0123]\d)(\d{3}) (\d|X)?$/.test(id);
            },
            _formatTime = function (time) {
                var separator = ' ';
                return time.split(separator)[0];
            },
            _loadingShow = function () {
                $ionicLoading.show({
                    template: loadingTemplate
                });
            },
            _loadingHide = function () {
                $ionicLoading.hide();
            },
            _removeCookie = function (name) {
                if (_cookieStore.get(name)) {
                    _cookieStore.remove(name);
                }
            },
            _fraudmetrix = function (userId, strategyType) {
                $http({
                    method: 'post',
                    url: api_base_url + '/eagleeye/fraudmetrix/getuserfin',
                    data: {
                        uid: userId,
                        from_type: 1,
                        strategy_type: strategyType,
                        mobile_code: USER_TOKEN,
                        finger_print: UUID,
                        canvas: SIMPLE_CANVAS
                    }
                }).success(function (data) {
                    console.log(data);
                }).error(function () {
                    console.log('eagleeye error.');
                });
            },
            _cookieStore = function (){
                var thisTip = '提示', thisMsg = '无痕模式下，无法使用该功能，请关闭Safari无痕模式。';
                return {
                    get: function (key) {
                        try {
                            return JSON.parse(window.localStorage.getItem(key));
                        } catch (e) {
                            _alert(thisTip, thisMsg);
                        }
                    },
                    put: function (key, value) {
                        try {
                            window.localStorage.setItem(key, JSON.stringify(value));
                        } catch (e) {
                            _alert(thisTip, thisMsg);
                        }
                    },
                    remove: function (key) {
                        try {
                            window.localStorage.removeItem(key);
                        } catch (e) {
                            _alert(thisTip, thisMsg);
                        }
                    }
                }
            }(),
            _getDeviceInfo = function () {
                var deviceType = '', deviceCode = '', ua = navigator.userAgent;
                if (/MicroMessenger/i.test(ua)) {
                    deviceType = 'wechat';
                    deviceCode = 4;
                } else if (/IEMobile/i.test(ua)) {
                    deviceType = 'windowsphone';
                    deviceCode = 3;
                } else if (/iPhone|iPad|iPod/i.test(ua)) {
                    deviceType = 'ios';
                    deviceCode = 1;
                } else if (/Android/i.test(ua)) {
                    deviceType = 'android';
                    deviceCode = 2;
                } else {
                    deviceType = 'unknown';
                    deviceCode = 0;
                }

                return {
                    deviceType: deviceType,
                    deviceCode: deviceCode
                }
            },
            _datePicker = function (cb) {
                return {
                    titleLabel: '请选择日期',  //Optional
                    todayLabel: '今天',  //Optional
                    closeLabel: '关闭',  //Optional
                    setLabel: '确定',  //Optional
                    setButtonType: 'button-positive',  //Optional
                    todayButtonType: 'button-positive',  //Optional
                    closeButtonType: 'button-positive',  //Optional
                    inputDate: new Date(),    //Optional
                    mondayFirst: true,    //Optional
                    // disabledDates: disabledDates, //Optional
                    weekDaysList: ['日', '一', '二', '三', '四', '五', '六'],   //Optional
                    templateType: 'popup', //Optional
                    modalHeaderColor: 'bar-positive', //Optional
                    modalFooterColor: 'bar-positive', //Optional
                    callback: function (val) {    //Mandatory
                        cb(val);
                    }
                };
            },

            _getAppVersion = function () {
                return 'v2.0.0.0';
            },

            /**
             * 压缩照片
             * @param blob 照片的url
             * @returns {string}
             */
            _compressPicture = function (blob, type, callback) {
                var quality = 0.5, image = new Image();
                image.src = blob;
                image.onload = function () {
                    var that = this;
                    // 生成比例
                    var width = that.width, height = that.height;
                    width = width / 2;
                    height = height / 2;
                    // 生成canvas画板
                    var canvas = document.createElement('canvas');
                    var ctx = canvas.getContext('2d');
                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(that, 0, 0, width, height);
                    // 生成base64,兼容修复移动设备需要引入mobileBUGFix.js
                    var imgurl = canvas.toDataURL('image/jpeg', quality);
                    // 修复IOS兼容问题
                    if (navigator.userAgent.match(/iphone/i)) {
                        var mpImg = new MegaPixImage(image);
                        mpImg.render(canvas, {
                            maxWidth: width,
                            maxHeight: height,
                            quality: quality
                        });
                        imgurl = canvas.toDataURL('image/jpeg', quality);
                    }
                    if (callback) {
                        callback(type, imgurl);
                    }
                };
            };
        return {
            API: {
                get_create_code: api_base_url + '/user/get_create_code',
                create: api_base_url + '/user/create',
                find_password_code: api_base_url + '/user/get_findpass_code',
                find_password: api_base_url + '/user/find_password',
                user_flag: api_base_url + '/v1.3.1/redpacket/is_user_registered',
                get_pay_list_b: api_base_url + '/lend/che_audit_order',
                get_credit_list_b: api_base_url + '/lend/che_audit_credit_order_task',

                get_credit: api_base_url + '/user/get_credit',
                get_orderlist: api_base_url + '/order/get_orderlist',
                area_list: api_base_url + '/area/list',
                check_bankcard: api_base_url + '/lend/get_bank',

                check_double: api_base_url + '/user/check_double',
                get_credit_task: api_base_url + '/user/get_credit_task',
                put_credit: api_base_url + '/order/put_credit',
                limit_credit: api_base_url + '/user/put_credit',

                put_credit_order: api_base_url + '/user/put_credit_order',

                get_user_code: api_base_url + '/redpacket/get_user_code',
                registred: api_base_url + '/v1.3.1/redpacket/register',
                get_red_packet_status: api_base_url + '/redpacket/redpacket_status',
                red_packet: offline ? "activity/redpacket/wechat.html?offline" : "activity/redpacket/wechat.html?online",
                red_packet_share: offline ? "activity/redpacket/share.html?offline" : "activity/redpacket/share.html?online",

                get_unbind_code: api_base_url + '/user/get_unbind_code',
                get_rebind_code: api_base_url + '/user/get_rebind_code',
                get_img_code: api_base_url + '/lend/verify',
                check_verify: api_base_url + '/lend/check_verify',

                rebind_phone: api_base_url + '/user/rebind_phone',
                req_change_phone: api_base_url + '/user/req_change_phone',
                report_location: api_base_url + '/location/Reported',
                get_location_mode: api_base_url + '/location/mode',

                get_red_packet_config: api_base_url + '/v1.3.1/redpacket/get_redpacket_config',

                /*--------2.0版本接口---------*/

                'v2.0': {
                    get_banner: api_base_url + '/lend/get_banner',
                    get_products: api_base_url + '/v2.0/user/get_products',
                    put_credit: api_base_url + '/v2.0/order/put_credit',

                    login: api_base_url + '/v2.0/user/login',
                    get_wallet_info: api_base_url + '/v2.0/user/get_wallet_info',
                    get_pay_list: api_base_url + '/v2.0/order/getPayList',
                    get_pay_task: api_base_url + '/v2.0/order/get_pay_task',

                    // 基本资料页面
                    get_banktype: api_base_url + '/lend/get_support_bank',      // 获取支持的银行卡类型v2.0
                    get_user_info: api_base_url + '/v2.0/user/get_user_info',   // 获取用户信息v2.0
                    create_userinfo: api_base_url + '/v2.0/user/create_userinfo', // 提交用户资料v2.0
                    verify_user_info: api_base_url + '/v2.0/user/verifyUserInfo',    // 校验身份证银行卡信息
                    // 安全信息页面
                    create_user_pic: api_base_url + '/user/create_user_pic',    // 提交用户照片
                    // 银行流水页面
                    delete_user_pic: api_base_url + '/v2.0/user/delete_user_pic'   // 删除银行流水
                },

                get_questions: api_base_url + '/my/question',
                feedback: api_base_url + '/my/feedback',
                che_audit_credit_order_task: api_base_url + '/lend/che_audit_credit_order_task',
                get_bank_list: api_base_url + '/pay/getslbindlist',
                add_bank: api_base_url + '/pay/slbinding',
                get_pay_code: api_base_url + '/pay/getslverifycode',
                alipay_return_url: api_base_url + '/order/repayment',
                pay_slpay: api_base_url + '/pay/slpay',
                env_query: env_query
            },
            SOURCE: {
                'home': '/home',
                'loan_userinfo': '/loan/userinfo',
                'loan_list': '/loan/loanlist',
                'loan_apply': '/loan/apply',
                'repayment_limit': '/limit',
                'repayment_index': '/repayment',
                'repayment_bank': '/repayment/bank',
                'repayment_add': '/repayment/add',
                'repayment_pay': '/repayment/pay',
                'update': '/user/update',
                'user': '/user/index',
                'account': '/user/account',
                'wallet': '/user/wallet',
                'forget': '/user/forget',
                'feedback': '/user/feedback'
            },
            CUSTOM_CONFIG: {
                default: {
                    tabsClass: '',
                    navBarClass: ''
                },
                home: {
                    tabsClass: '',
                    navBarClass: 'bar-home'
                },
                repayment: {
                    tabsClass: '',
                    navBarClass: 'bar-repayment'
                },
                repay: {
                    tabsClass: '',
                    navBarClass: 'bar-repay'
                },
                pay: {
                    tabsClass: '',
                    navBarClass: 'bar-pay'
                },
                bank: {
                    tabsClass: 'hidden',
                    navBarClass: 'bar-bank'
                },
                login: {
                    tabsClass: 'hidden',
                    navBarClass: 'bar-login'
                },
                loan: {
                    tabsClass: 'hidden',
                    navBarClass: 'bar-loan'
                },
                loansuccess: {
                    tabsClass: '',
                    navBarClass: 'bar-loan'
                },
                loanlist: {
                    tabsClass: '',
                    navBarClass: 'bar-loan'
                },
                userinfo: {
                    tabsClass: 'hidden',
                    navBarClass: 'bar-userinfo'
                },
                register: {
                    tabsClass: 'hidden',
                    navBarClass: 'bar-register'
                },
                user: {
                    tabsClass: '',
                    navBarClass: 'bar-user'
                },
                account: {
                    tabsClass: 'hidden',
                    navBarClass: 'bar-account'
                },
                forget: {
                    tabsClass: 'hidden',
                    navBarClass: 'bar-forget'
                },
                update: {
                    tabsClass: 'hidden',
                    navBarClass: 'bar-update'
                },
                question: {
                    tabsClass: 'hidden',
                    navBarClass: 'bar-question'
                },
                about: {
                    tabsClass: '',
                    navBarClass: 'bar-about'
                },
                feedback: {
                    tabsClass: '',
                    navBarClass: 'bar-feedback'
                },
                wallet: {
                    tabsClass: 'hidden',
                    navBarClass: 'bar-wallet'
                },
                activity: {
                    tabsClass: 'hidden',
                    navBarClass: 'bar-user'
                }
            },
            MESSAGE: {
                'title': {
                    'error': '错误',
                    'hint': '提示',
                    'warn': '警告'
                },
                'network_error': '网络异常，请重新尝试。',
                'home': {
                    'rest_credit': '剩余额度不足！',
                    'no_credit': '请选择借款金额',
                    'wrong_credit': '借款金额不正确'
                },
                'login': {
                    'empty_phone': '请填写手机号',
                    'invalid_phone': '无效手机号',
                    'empty_password': '请填写密码',
                    'invalid_password': '无效密码'
                },
                'register': {
                    'empty_password': '请填写密码',
                    'invalid_password': '无效密码',
                    'empty_captcha': '请填写验证码',
                    'invalid_agreement': '请同意用户协议',
                    'empty_code': '请填写图形验证码'
                },
                'forget': {
                    'invalid_phone': '无效手机号',
                    'invalid_password': '无效密码',
                    'invalid_captcha': '无效验证码',
                    'invalid_code': '无效的图形验证码'
                },
                'userinfo': {
                    'not_full': '资料填写不完整 , 请补全',
                    'address': '省市区没有选择',
                    'detail': '详细地址没有填写',
                    'error': '请修改错误信息'
                },
                'safyinfo': {
                    'type0': '身份证正面照没有上传成功，请检查！',
                    'type1': '身份证反面照没有上传成功，请检查！',
                    'type2': '手持身份证件照没上传成功，请检查！',
                    'type3': '工牌照片没有上传成功，请检查！',
                    'bankcard': '银行卡信息不正确！',
                    'success': '提交成功',
                    'replay': '您的照片已经审核通过，不需要再拍摄',
                    'noType': '出现错误了，请重新尝试',
                    'comArea': '公司地址出现错误，请尝试重新选择',
                    'homeArea': '家庭地址出现错误，请尝试重新选择',
                    'error': '拍照失败,请联系客服或尝试更换手机再试!'
                },
                'assetinfo': {
                    'bankfull': '银行流水照片数已达到上限',
                    'info_full': '资料已完善，可以去借款了',
                    'uploading': '银行流水正在上传,请稍候'
                },
                'insuranceInfo': {
                    picture_full: '社保记录照片数已达到上限',
                    info_full: '资料已完善，可以去借款了',
                    picture_upload: '社保记录照片正在上传，请稍候',
                    error: '拍照失败,请联系客服或尝试更换手机再试!'
                },
                'set_address': {
                    'no_area': '请选择省市区域信息',
                    'no_address': '请输入详细地址'
                },
                'limit': {
                    has_order_error: "你有正在审核的订单",
                    download_alert: "尊敬的用户，为了您的资金安全，请下载国众宝app还款。点击确定下载客户端"
                },
                'user': {
                    loan: '资料已完善，可以去借款了'
                },
                'update': {
                    empty_phone: '手机号没有填写',
                    invalid_phone: '手机号格式不正确',
                    empty_unbind_code: '请填写解绑验证码',
                    empty_rebind_code: '请填写重新绑定验证码',
                    update_success: '手机号码修改成功',
                    empty_img_code: '请填写附加码'
                },
                'geolocation': {
                    invalid_permission: '您还未正确开启定位，为了您的借款安全，请在手机设置里打开位置权限'
                },
                feedback: {
                    empty_text: '请填写反馈意见'
                },
                repayment: {
                    download: '尊敬的用户，为了您的资金安全，请下载国众宝app还款。点击确定下载客户端',
                    pay_success: '支付成功',
                    pay_fail: '支付失败'
                },
                bank: {
                    'empty_phone': '请填写手机号',
                    'invalid_phone': '无效手机号',
                    'empty_bank': '请填写银行卡号',
                    'invalid_agreement': '请同意用户协议'
                },
                pay: {
                    'empty_protocol_id': '请选择银行卡',
                    'empty_code': '请填写验证码'
                },
                loanlist: {
                    'exist_progress_loan': '有正在审核中的订单',
                    'exist_not_pay_loan': '有未还款的订单',
                    'unsupported_order': '当前订单不支持重新下单'
                }
            },
            utility: {
                'check_phone': function (p) {
                    return /^1[3|4|5|7|8][0-9]\d{8}$/.test(p);
                },
                'check_password': function (p) {
                    return p.trim().length >= 6;
                },
                'getCache': function (name) {
                    return $cacheFactory(name);
                },
                'alert': _alert,
                'checkLogin': _checkLogin,
                'formatTime': _formatTime,
                'checkID': _checkID,
                'loadingShow': _loadingShow,
                'loadingHide': _loadingHide,
                'removeCookie': _removeCookie,
                'fraudMetrix': _fraudmetrix,
                'cookieStore': _cookieStore,
                'getDeviceInfo': _getDeviceInfo,
                'datePicker': _datePicker,
                'getAppVersion': _getAppVersion,
                'compressPicture': _compressPicture
            },
            tempData: {
                registerInfo: {},
                bankInfo: {},
                payInfo: {},
                user_credit: {},
                orderinfo: {},
                red_phone: {},
                user_info: {
                    auditStatus: '',   // 存放用户资料的状态位 *
                    userInfo: '',      // 存放用户填写的个人资料数据 *
                    companyAddress: '',// 存放公司地址及id数据 *
                    homeAddress: '',   // 存放现居地址及id数据 *
                    infoRefund: '',    // 用于存放服务端储存的错误定位数据 *
                    errorInfo: '',     // 用于存放用户修改后的错误定位信息 *
                    picInfo: ''        // 用于存放服务端的用户照片数据 *
                },
                loan_data: {},
                viewOrder: [],
                assetPictures: [],
                first_complate: false  // 用于存放第一次完善资料状态完善资料
            },
            CONSTANTS: {
                deviceType: 4
            }
        };
    }]);