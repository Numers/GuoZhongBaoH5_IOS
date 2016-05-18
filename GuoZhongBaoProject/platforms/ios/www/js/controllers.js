'use strict';

angular.module('guozhongbao.controllers', ['ionic-datepicker'])
.config(function($sceDelegateProvider){
    $sceDelegateProvider.resourceUrlWhitelist([
        'self',
        'http://m.renrenfenqi.com/**',
        'http://test.m.renrenfenqi.com/**',
        'http://mo.renrenfenqi.com/**',
        'http://test.mo.renrenfenqi.com/**',
        'http://activity.guozhongbao.com/**',
        'http://test.activity.guozhongbao.com/**',
        'http://stage.activity.guozhongbao.com/**',
        'http://h5.guozhongbao.com/**',
        'http://test.h5.guozhongbao.com/**',
        'http://stage.h5.guozhongbao.com/**',
        'http://localhost:1337/**'
    ]);
}).controller('HomeCtrl', ['$scope', '$http', 'Common', '$location', '$ionicSlideBoxDelegate', '$rootScope', function ($scope, $http, common, $location, $ionicSlideBoxDelegate, $rootScope) {
    var _drawChart, _init, _setLoanText, periods = [], userInfo;

    userInfo = common.utility.checkLogin();

    $rootScope.customConfig = common.CUSTOM_CONFIG.user;
    $scope.menuClass = {
        period: 'selected',
        stage: '',
        menu: 'home-menu-period'
    };
    $scope.shortLoan = true; //是否是短期周转
    $scope.realLoan = 0; //实际到账金额
    $scope.loanData = {}; //借款数据
    $scope.innerText = ''; //滑动条下面的文字
    $scope.innerTextPeriod = 0; //滑动条下面的文字分期数
    $scope.innerTextMoney = 0; //滑动条下面的文字金额
    $scope.periods = []; //滑动条数据
    $scope.percentChart = {}; //仪表盘数据
    $scope.slider = {}; //滑动条
    $scope.span = 1;

    _init = function () {
        if (!userInfo) {
            $location.path('/user/login/from/home');
        } else {
            common.utility.loadingShow();

            var client = common.utility.getDeviceInfo().deviceType,
                strategyInfo = {
                    strategy: '',
                    docs: 'load index page'
                };
            $http({
                method: 'GET',
                url: common.API.get_location_mode + '?client=' + client
            }).success(function (data) {
                if (data.status === 200) {
                    var strategyDatas = data.data;
                    for (var i = 0, len = strategyDatas.length; i < len; i++) {
                        if (strategyDatas[i].code === 'event_env') {
                            var eventDatas = strategyDatas[i].sub;
                            for (var j = 0, length = eventDatas.length; j < length; j++) {
                                if (eventDatas[j].code === client) {
                                    strategyInfo.strategy = eventDatas[j].mode_id;
                                }
                            }
                        }
                    }
                    document.addEventListener("deviceready", (function() {
                        Location.postLocationStrategy(function (value) {
                        }, function (value) {
                        }, strategyInfo);
                    }), false);
                }
            }).error(function () {
                common.utility.alert(common.MESSAGE.title.hint, common.MESSAGE.network_error);
            });

            $http({
                method: 'get',
                url: common.API['v2.0'].get_banner
            }).success(function (bannerData) {
                $scope.banners = bannerData.data;
                $ionicSlideBoxDelegate.update();
            }).error(function () {
                alert(common.MESSAGE.network_error);
            });

            $http({
                method: 'post',
                url: common.API['v2.0'].get_products,
                data: {
                    uid: userInfo.uid,
                    token: userInfo.token
                }
            }).success(function (productsData) {
                if (productsData.status === 200) {
                    $scope.loanData = productsData.data;
                    _drawChart();
                } else {
                    common.utility.alert(common.MESSAGE.title.hint, productsData.message).then(function(){
                        $location.path('/user/account');
                    });
                }
                common.utility.loadingHide();
            }).error(function () {
                alert(common.MESSAGE.network_error);
                common.utility.loadingHide();
            });
        }
    }();

    $scope.safeApply = function (fn) {
        var phase = this.$root.$$phase;
        if (phase == '$apply' || phase == '$digest') {
            if (fn && (typeof(fn) === 'function')) {
                fn();
            }
        } else {
            this.$apply(fn);
        }
    };

    $scope.switchMenu = function (tag) {
        $scope.shortLoan = tag === 0;
        if (tag === 0) {
            $scope.menuClass = {
                period: 'selected', //短期周转
                stage: '', //分期借款
                menu: 'home-menu-period' //头部样式
            };
        } else {
            $scope.menuClass = {
                period: '',
                stage: 'selected',
                menu: 'home-menu'
            };
        }
        $scope.percentChart = {};
        _drawChart();
    };

    $scope.loan = function () {
        var theCredit = $scope.percentChart.getCredit(),
            theInterest = $scope.percentChart.getInterest(),
            canApply = false,
            thePeriod, theSpan, credits;
        if ($scope.shortLoan) {
            thePeriod = 1;
            theSpan = $scope.innerTextPeriod;
        } else {
            thePeriod = $scope.innerTextPeriod;
            theSpan = 30;
        }
        if (theCredit === 0) {
            common.utility.alert(common.MESSAGE.title.hint, common.MESSAGE.home.no_credit);
        } else {
            credits = $scope.shortLoan ? $scope.loanData.short : $scope.loanData.long;
            credits.map(function (c) {
                if (c.credit === theCredit) {
                    canApply = true;
                }
            });
            if (canApply) {
                common.tempData.loan_data = {
                    shortLoan: $scope.shortLoan, //是否为短期周转
                    credit: theCredit, //借款金额
                    time: (new Date()).format('yyyy-MM-dd'), //借款时间
                    interest: theInterest, //手续费
                    realLoan: $scope.realLoan.toFixed(2), //实际到账金额
                    period: thePeriod,
                    span: theSpan
                };
                $location.path('/loan/apply');
            } else {
                common.utility.alert(common.MESSAGE.title.hint, common.MESSAGE.home.wrong_credit);
            }
        }
    };

    _setLoanText = function (p, m, r) {
        $scope.innerTextPeriod = p || $scope.innerTextPeriod;
        $scope.innerTextMoney = m || $scope.innerTextMoney;
        $scope.realLoan = r || $scope.realLoan;
        if (!$scope.shortLoan) {
            $scope.innerTextMoney = m || ($scope.percentChart.getCredit() / p).toFixed(2);
        }
        $scope.innerText = $scope.shortLoan ? ('从借款发放日开始计算，<label>'
            + $scope.innerTextPeriod + '天</label>内还款<label>'
            + $scope.innerTextMoney + '</label>元') : ('从借款发放日开始计算，<label>30天</label>为一期，共<label>'
            + $scope.innerTextPeriod + '</label>期，每期应还<label>'
            + $scope.innerTextMoney + '</label>元');
    };

    _drawChart = function () {
        var sliderObj, chartObj, tempData, chartWidth, base, key, text, max, periods = [];

        sliderObj = $('#chart_slider');
        chartObj = $('#topLoader');
        if ($scope.shortLoan) {
            tempData = $scope.loanData.short;
            key = 'span';
            text = '天';
        } else {
            tempData = $scope.loanData.long;
            key = 'period';
            text = '期';
        }
        chartWidth = window.innerWidth * 0.7;
        base = 1000;
        if (tempData.length > 0) {
            max = tempData[0].credit;
            tempData.map(function (t) {
                if (t.credit > max) {
                    max = t.credit;
                }
            });
            base = max;

            tempData[0].periods.map(function (t) {
                periods.push(t[key] + text);
            });
        }

        $scope.periods = periods;
        $scope.percentChart = chartObj.html('').percentageLoader({
            width: chartWidth,
            height: chartWidth,
            controllable: true,
            progress: 0,
            data: tempData,
            periods: $scope.periods,
            base: base,
            key: $scope.shortLoan ? 'span' : 'period',
            onProgressUpdate: function (val) {
                _setLoanText(val[$scope.shortLoan ? 'span' : 'period'], val.repayment, val.realloan);
                $scope.$apply();
            }
        });
        // $scope.percentChart.setProgress(tempData[0].credit / tempData[tempData.length - 1].credit);

        $scope.percentChart.setProgress(1);

        sliderObj.val('').next().remove();
        sliderObj.removeData('plugin_jRange');
        $scope.slider = sliderObj.jRange({
            from: 1,
            to: $scope.periods.length,
            step: 1,
            scale: $scope.periods,
            width: window.innerWidth * 0.4,
            showLabels: true,
            showScale: true,
            onstatechange: function (val) {
                var reg = /\d+/g, value = $scope.periods[val - 1], p, r, l;
                p = parseInt(value.match(reg)[0]);
                $scope.percentChart.setInnerText(p);
                r = $scope.percentChart.getRepayment();
                l = $scope.percentChart.getRealLoan();
                _setLoanText(p, r, l);
                $scope.safeApply();
            }
        });
    };

        $scope.preGo = function(url, title) {
            var deviceType = common.utility.getDeviceInfo().deviceType;
            if (deviceType === 'android') {
                var params = {
                    title: '5分钟不到，国众宝就送我了50元现金红包，你也来试试呗！',
                    url: url + '&title=' + encodeURI(title) + '&uid=' + encodeURI(userInfo.uid) + '&token=' + encodeURI(userInfo.token)
                };
                Activity.show(function(data) {

                }, function(error) {

                }, params);
            } else {
                var path = '/activity?from='+ encodeURI(url) +'&title=' + encodeURI(title) + '&uid=' + encodeURI(userInfo.uid) + '&token=' + encodeURI(userInfo.token);
                $location.url(path);
            }
        }
}])

    .controller('RepaymentCtrl', ['$scope', 'Common', '$http', '$timeout', '$location', '$rootScope', '$window', function ($scope, common, $http, $timeout, $location, $rootScope, $window) {
        $rootScope.customConfig = common.CUSTOM_CONFIG.repayment;

        if (common.utility.checkLogin()) {
            var userInfo = common.utility.checkLogin();
        } else {
            $location.path('/user/login/from/repayment_index');
        }

        $scope.repaymentModel = {
            empty: false,
            id: '',
            status: true,
            total: '',
            date: '',
            unpaid: '',
            lateFees: '',
            currentPeriod: '',
            redPacket: '',
            payCurrent: '',
            payTotal: '',
            payOverdue: '',
            overdueShow: true
        };

        function _getPayList() {
            var promise = $http({
                method: 'POST',
                url: common.API['v2.0'].get_pay_list,
                data: {
                    uid: userInfo.uid,
                    token: userInfo.token
                }
            });

            promise.success(function (data) {
                if (data.status === 200) {
                    $scope.repaymentModel.id = data.data.orderid;
                    $scope.repaymentModel.status = data.data.pay_status ? true : false;
                    $scope.repaymentModel.total = data.data.pay_price;
                    $scope.repaymentModel.date = data.data.pay_date;
                    $scope.repaymentModel.unpaid = data.data.unpayed_price;
                    $scope.repaymentModel.lateFees = data.data.late_price;
                    $scope.repaymentModel.currentPeriod = data.data.period_price;
                    $scope.repaymentModel.redPacket = data.data.deduction_price;
                    if (data.data.pay_status === 1) {
                        $scope.repaymentModel.payCurrent = 0;
                        $scope.repaymentModel.payTotal = 0;
                        $scope.repaymentModel.payOverdue = 0;
                    } else {
                        $scope.repaymentModel.payCurrent = data.data.payment.pay_period;
                        $scope.repaymentModel.payTotal = data.data.payment.pay_all;
                        $scope.repaymentModel.payOverdue = data.data.payment.pay_overdue;
                    }
                    if (($scope.repaymentModel.payOverdue == 0) || ($scope.repaymentModel.payOverdue != 0) && ($scope.repaymentModel.payOverdue == $scope.repaymentModel.payCurrent)) {
                        $scope.repaymentModel.overdueShow = false;
                    }
                } else {
                    $scope.repaymentModel.empty = true;
                }
            });
            promise.error(function () {
                common.utility.alert(common.MESSAGE.title.error, common.MESSAGE.network_error);
            });
        }

        _getPayList();

        $scope.repay = function (type, moneyTotal) {
            var deviceType = common.utility.getDeviceInfo().deviceType;
            if (deviceType === 'wechat') {
                common.utility.alert(common.MESSAGE.title.hint, common.MESSAGE.repayment.download).then(function () {
                    $window.location.href = 'http://m.guozhongbao.com';
                });
            } else {
                common.tempData.payInfo.orderID = $scope.repaymentModel.id;
                common.tempData.payInfo.type = type;
                common.tempData.payInfo.moneyTotal = moneyTotal;
                $location.path('/repayment/repay');
            }
        };
    }])

    .controller('RepayCtrl', ['$scope', '$rootScope', '$http', '$location', 'Common', function ($scope, $rootScope, $http, $location, common) {
        $rootScope.customConfig = common.CUSTOM_CONFIG.repay;

        var userInfo = common.utility.checkLogin();
        if (!userInfo) {
            $location.path('/user/login/from/repayment_index');
        }

        var payInfo = common.tempData.payInfo;
        if (!Object.keys(payInfo).length) {
            $location.path('/repayment')
        }

        $scope.repayModel = {
            money: payInfo.moneyTotal,
            taskID: '',
            returnUrl: common.API.alipay_return_url
        };

        function _getPayTask() {
            var promise = $http({
                method: 'POST',
                url: common.API['v2.0'].get_pay_task,
                data: {
                    uid: userInfo.uid,
                    token: userInfo.token,
                    orderid: payInfo.orderID,
                    type: payInfo.type
                }
            });
            promise.success(function (data) {
                if (data.status === 200) {
                    common.tempData.payInfo.taskID = data.data.taskid;
                    $scope.repayModel.taskID = data.data.taskid;
                } else {
                    common.utility.alert(common.MESSAGE.title.hint, data.message);
                }
            });
            promise.error(function () {
                common.utility.alert(common.MESSAGE.title.error, common.MESSAGE.network_error);
            })
        }

        _getPayTask();

        $scope.alipay = function() {
            common.utility.loadingShow();
            var alipayInfo = {
                name: '国众宝还款',
                desc: '支付宝国众宝还款',
                money: $scope.repayModel.money,
                repaybusinessno: $scope.repayModel.taskID,
                alipay_notifyurl: $scope.repayModel.returnUrl
            };
            AliPay.pay(function() {
                common.utility.loadingHide();
                common.utility.alert(common.MESSAGE.title.hint, common.MESSAGE.repayment.pay_success);
                $location.path('/repayment');
            }, function() {
                common.utility.loadingHide();
                common.utility.alert(common.MESSAGE.title.hint, common.MESSAGE.repayment.pay_fail);
            }, alipayInfo)
        };

        $scope.umpay = function() {
            var umpayInfo = {};
            var u = navigator.userAgent;
            if (u.indexOf('Android') > -1 || u.indexOf('Linux') > -1) {
                umpayInfo = {
                    uid: userInfo.uid,
                    repaybusinessno: $scope.repayModel.taskID
                }
            } else {
                umpayInfo = {
                    repaybusinessno: $scope.repayModel.taskID,
                    uid: userInfo.uid,
                    token: userInfo.token
                }
            }
            UmPay.pay(function() {
                common.utility.alert(common.MESSAGE.title.hint, common.MESSAGE.repayment.pay_success);
                $location.path('/repayment');
            }, function() {
                common.utility.alert(common.MESSAGE.title.hint, common.MESSAGE.repayment.pay_fail);
            }, umpayInfo);
        };
    }])

    .controller('BankCtrl', ['$scope', '$rootScope', '$http', '$location', '$window', 'Common', function ($scope, $rootScope, $http, $location, $window, common) {
        $rootScope.customConfig = common.CUSTOM_CONFIG.bank;

        var userInfo = common.utility.checkLogin();
        if (!userInfo) {
            $location('/user/login/from/repayment_bank');
        }

        $scope.bankListModel = {
            empty: true,
            list: []
        };

        function _getBankList() {
            var promise = $http({
                method: 'POST',
                url: common.API.get_bank_list,
                data: {
                    uid: userInfo.uid,
                    token: userInfo.token
                }
            });
            promise.success(function (data) {
                console.log(data);
                if (data.status === 200) {
                    if (data.data.length) {
                        $scope.bankListModel.empty = false;
                        $scope.bankListModel.list = data.data;
                        console.log($scope.bankListModel);
                    }
                } else {
                    common.utility.alert(common.MESSAGE.title.hint, data.message);
                }
            });
            promise.error(function () {
                common.utility.alert(common.MESSAGE.title.error, common.MESSAGE.network_error);
            })
        }
        _getBankList();

        $scope.goPay = function(protocolID, bank) {
            common.tempData.payInfo.protocolID = protocolID;
            common.tempData.payInfo.bank = bank;
            $location.path('/repayment/pay');
        };

        $scope.addBankCard = function() {
            var deviceType = common.utility.getDeviceInfo().deviceType,
                url = 'http://test.h5.guozhongbao.com/iframe/form.html' + common.API.env_query + '&uid=' + userInfo.uid + '&token=' + userInfo.token;
            if (deviceType === 'android') {
                var params = {
                    title: '银行卡绑定',
                    url: url
                };
                SLPay.pay(function(data) {
                    if (data.code == 200) {
                        window.location.href = '#/home';
                    } else if (data.code == 100) {
                        window.location.href = '#/repayment/repay';
                    }
                }, function(error) {

                }, params);
            } else {
                $location.path('/repayment/add');
            }
        };
    }])

    .controller('AddBankCtrl', ['$scope', '$rootScope', '$http', '$location', '$window', 'Common', function ($scope, $rootScope, $http, $location, $window, common) {
        console.log('add bank');
        $rootScope.customConfig = common.CUSTOM_CONFIG.bank;

        var userInfo = common.utility.checkLogin();
        if (!userInfo) {
            $location.path('/user/login/from/repayment_add');
        }

        $scope.bankModel = {
            iframeUrl: 'http://test.h5.guozhongbao.com/iframe/form.html' + common.API.env_query + '&uid=' + userInfo.uid + '&token=' + userInfo.token
        };

        var domain = 'http://test.h5.guozhongbao.com/',
            iframe = document.getElementById('bankIframe').contentWindow,
            message = 'hello world';

        function _sendMessage() {
            iframe.postMessage(message, '*');
        }
        setTimeout(_sendMessage, 2000);

        window.addEventListener('message', function(e) {
            $location.path('/repayment');
            //$window.location.href = 'http://www.baidu.com';
            //if (e.data === '/repayment') {
            //    $location.path('/repayment')
            //}
        }, false);
    }])

    .controller('PayCtrl', ['$scope', '$rootScope', '$http', '$location', '$timeout', 'Common', function ($scope, $rootScope, $http, $location, $timeout, common) {
        $rootScope.customConfig = common.CUSTOM_CONFIG.pay;

        var userInfo = common.utility.checkLogin();
        if (!userInfo) {
            $location.path('/user/login/from/repayment_pay');
        }

        var payInfo = common.tempData.payInfo;
        console.log(common.tempData.payInfo);
        if (!Object.keys(payInfo).length) {
            $location.path('/repayment')
        }

        $scope.payModel = {
            bank: common.tempData.payInfo.bank,
            code: ''
        };

        $scope.buttonModel = {
            text: '确认支付',
            load: false
        };

        $scope.countdownModel = {
            counter: 60,
            text: '发送验证码',
            disabled: false
        };

        function _getPayTask() {
            var promise = $http({
                method: 'POST',
                url: common.API['v2.0'].get_pay_task,
                data: {
                    uid: userInfo.uid,
                    token: userInfo.token,
                    orderid: payInfo.orderID,
                    type: payInfo.type
                }
            });
            promise.success(function (data) {
                if (data.status === 200) {
                    common.tempData.payInfo.taskID = data.data.taskid;
                } else {
                    common.utility.alert(common.MESSAGE.title.hint, data.message);
                }
            });
            promise.error(function () {
                common.utility.alert(common.MESSAGE.title.error, common.MESSAGE.network_error);
            })
        }
        _getPayTask();

        $scope.onTimeout = function () {
            $scope.countdownModel.counter--;
            if ($scope.countdownModel.counter > 0) {
                $scope.countdownModel.disabled = true;
                $scope.countdownModel.text = '获取验证码(' + $scope.countdownModel.counter + ')';
                var mytimeout = $timeout($scope.onTimeout, 1000);
            } else {
                $scope.countdownModel = {
                    counter: 60,
                    text: '发送验证码',
                    disabled: false
                };
                $timeout.cancel(mytimeout);
            }
        };

        $scope.getCode = function () {
            var promise = $http({
                method: 'POST',
                url: common.API.get_pay_code,
                data: {
                    uid: userInfo.uid,
                    token: userInfo.token,
                    orderid: payInfo.orderID,
                    protocolid: payInfo.protocolID
                }
            });
            promise.success(function (data) {
                if (data.status === 200) {
                    common.utility.alert(common.MESSAGE.title.hint, data.message);
                    $scope.countdownModel.disabled = true;
                    var mytimeout = $timeout($scope.onTimeout, 1000);
                } else {
                    common.utility.alert(common.MESSAGE.title.hint, data.message);
                }
            });
            promise.error(function () {
                common.utility.alert(common.MESSAGE.title.error, common.MESSAGE.network_error);
            })
        };

        $scope.checkForm = function () {
            if (!$scope.payModel.code.trim()) {
                common.utility.alert(common.MESSAGE.title.hint, common.MESSAGE.pay.empty_code);
            } else {
                common.utility.loadingShow();
                _pay();
            }
        };

        function _pay() {
            var promise = $http({
                method: 'POST',
                url: common.API.pay_slpay,
                data: {
                    uid: userInfo.uid,
                    token: userInfo.token,
                    taskid: payInfo.taskID,
                    orderfee: payInfo.moneyTotal,
                    protocolid: payInfo.protocolID,
                    verifycode: $scope.payModel.code
                }
            });
            promise.success(function (data) {
                common.utility.loadingHide();
                if (data.status === 200) {
                    common.utility.alert(common.MESSAGE.title.hint, data.message);
                    // TODO
                    $location.path('/repayment');
                } else {
                    common.utility.alert(common.MESSAGE.title.hint, data.message);
                }
            });
            promise.error(function() {
                common.utility.loadingHide();
                common.utility.alert(common.MESSAGE.title.error, common.MESSAGE.network_error);
            })
        }
    }])

    .controller('UserCtrl', ['$scope', '$http', 'Common', '$rootScope', '$location', function ($scope, $http, common, $rootScope, $location) {
        $rootScope.customConfig = common.CUSTOM_CONFIG.user;

        if (common.utility.checkLogin()) {
            var userInfo = common.utility.checkLogin();
        } else {
            $location.path('/user/login/from/user');
        }

        $scope.userModel = {
            phone: userInfo.phone
        };

        function _getInfoComplete() {
            var firstComplete = common.tempData.first_complate;
            if (firstComplete === true) {
                common.tempData.first_complate = false;
                common.utility.alert(common.MESSAGE.title.hint, common.MESSAGE.user.loan);
            }
        }

        _getInfoComplete();

        $scope.checkCompleteInfo = function () {
            var promise = $http({
                method: 'POST',
                url: common.API.che_audit_credit_order_task,
                data: {
                    uid: userInfo.uid,
                    token: userInfo.token
                }
            });
            promise.success(function (data) {
                if (data.status === 200) {
                    $location.path('/user/userinfo');
                } else {
                    common.utility.alert(common.MESSAGE.title.hint, data.message);
                }
            });
            promise.error(function () {
                common.utility.alert(common.MESSAGE.title.error, common.MESSAGE.network_error);
            });
        };
    }])

    .controller('LoginCtrl', ['$scope', '$http', 'Common', '$location', '$rootScope', '$stateParams', '$window', function ($scope, $http, common, $location, $rootScope, $stateParams, $window) {
        $rootScope.customConfig = common.CUSTOM_CONFIG.login;
        $scope.loginModel = {
            phone: '',
            password: '',
            topPicUrl: '',
            passwordShow: false
        };
        $scope.buttonModel = {
            text: '下一步',
            load: false
        };
        var route = $stateParams.source,
            path = '';
        if (route) {
            path = common.SOURCE[route];
        } else {
            path = '/home';
        }

        function _initConfig() {
            var promise = $http({
                method: 'GET',
                url: common.API.get_red_packet_config
            });
            promise.success(function (data) {
                if (data.status === 200) {
                    $scope.loginModel.topPicUrl = data.data.login_toppic;
                } else {
                    common.utility.alert(common.MESSAGE.title.hint, data.message);
                }
            });
            promise.error(function () {
                common.utility.alert(common.MESSAGE.title.error, common.MESSAGE.network_error)
            })
        }

        _initConfig();

        $scope.checkPhone = function () {
            var phone = $scope.loginModel.phone;
            if (!phone.trim()) {
                common.utility.alert(common.MESSAGE.title.warn, common.MESSAGE.login.empty_phone);
            } else if (!common.utility.check_phone(phone)) {
                common.utility.alert(common.MESSAGE.title.warn, common.MESSAGE.login.invalid_phone);
            } else {
                $scope.buttonModel = {
                    text: '下一步...',
                    load: true
                };
                var promise = $http({
                    method: 'GET',
                    url: common.API.user_flag + "?phone=" + phone
                });
                promise.success(function (data) {
                    if (data.status === 200) {
                        if (data.data.is_user_registered === 1) {
                            $scope.loginModel.passwordShow = true;
                            $scope.buttonModel = {
                                text: '登录',
                                load: false
                            };
                        } else {
                            common.tempData.red_phone.phone = phone;
                            $location.path('/user/register');
                        }
                    } else {
                        common.utility.alert(common.MESSAGE.title.hint, data.message);
                        $scope.buttonModel = {
                            text: '下一步',
                            load: false
                        };
                    }
                });
                promise.error(function () {
                    $scope.buttonModel = {
                        text: '下一步',
                        load: false
                    };
                    common.utility.alert(common.MESSAGE.title.error, common.MESSAGE.network_error);
                });
            }
        };

        $scope.checkForm = function () {
            var phone = $scope.loginModel.phone,
                password = $scope.loginModel.password;
            if (!phone.trim()) {
                common.utility.alert(common.MESSAGE.title.hint, common.MESSAGE.login.empty_phone);
            } else if (!common.utility.check_phone(phone)) {
                common.utility.alert(common.MESSAGE.title.hint, common.MESSAGE.login.invalid_phone);
            } else if (!password.trim()) {
                common.utility.alert(common.MESSAGE.title.hint, common.MESSAGE.login.empty_password);
            } else {
                $scope.buttonModel = {
                    text: '登录...',
                    load: true
                };
                _login();
            }
        };

        function _login() {
            var deviceCode = common.utility.getDeviceInfo().deviceCode,
                appVersion = common.utility.getAppVersion();
            var promise = $http({
                method: 'POST',
                url: common.API['v2.0'].login,
                data: {
                    'phone': $scope.loginModel.phone,
                    'password': $scope.loginModel.password,
                    'devicetype': deviceCode,
                    'version': appVersion
                }
            });
            promise.success(function (data) {
                $scope.buttonModel = {
                    text: '登录',
                    load: false
                };
                if (data.status === 200) {
                    common.utility.cookieStore.remove('uinfo');
                    var userInfo = {
                        'uid': data.data.account.uid,
                        'token': data.data.token,
                        'phone': $scope.loginModel.phone
                    };
                    common.utility.cookieStore.put('uinfo', userInfo);
                    UserInfo.put(function (data) {
                        Location.startLocationService(function (value) {

                        }, function (value) {

                        }, userInfo);
                    }, function (data) {

                    }, userInfo);
                    common.utility.fraudMetrix(userInfo.uid, 2);
                    $location.path(path);
                } else {
                    common.utility.alert(common.MESSAGE.title.hint, data.message);
                }
            });
            promise.error(function () {
                $scope.buttonModel = {
                    text: '登录',
                    load: false
                };
                common.utility.alert(common.MESSAGE.title.error, common.MESSAGE.network_error);
            });
        }
    }])

    .controller('registerCtrl', ['$scope', '$http', '$location', '$rootScope', '$timeout', 'Common', function ($scope, $http, $location, $rootScope, $timeout, common) {
        $rootScope.customConfig = common.CUSTOM_CONFIG.register;

        $scope.registerModel = {
            topPicUrl: '',
            phone: '',
            captcha: '',
            password: '',
            redeem: '',
            redeemShow: false,
            agree: true
        };

        // if registerInfo is not an empty object, assign it to register model
        function _initRegisterModel() {
            var registerInfo = common.tempData.registerInfo;
            if (!!Object.keys(registerInfo).length) {
                $scope.registerModel = registerInfo;
            }
        }

        _initRegisterModel();


        $scope.countdownModel = {
            counter: 60,
            text: '发送验证码',
            disabled: false
        };

        $scope.buttonModel = {
            text: '注册',
            load: false
        };

        function _initConfig() {
            var promise = $http({
                method: 'GET',
                url: common.API.get_red_packet_config
            });
            promise.success(function (data) {
                if (data.status === 200) {
                    $scope.registerModel.topPicUrl = data.data.registe_toppic;
                    if (data.data.show_code_input === '1') {
                        $scope.registerModel.redeemShow = true;
                        var queryString = $location.search();
                        if (queryString.code && queryString.code != 'undefined') {
                            $scope.registerModel.redeem = queryString.code;
                        }
                    }
                } else {
                    common.utility.alert(common.MESSAGE.title.hint, data.message);
                }
            });
            promise.error(function () {
                common.utility.alert(common.MESSAGE.title.error, common.MESSAGE.network_error)
            })
        }

        _initConfig();

        if (common.tempData.red_phone && common.tempData.red_phone.phone) {
            $scope.registerModel.phone = common.tempData.red_phone.phone;
        }

        // store user input data before go register agreement page
        $scope.showAgreement = function () {
            common.tempData.registerInfo = $scope.registerModel;
            $location.path('/agreement/register');
        };

        $scope.checkForm = function () {
            var password = $scope.registerModel.password,
                captcha = $scope.registerModel.captcha,
                agree = $scope.registerModel.agree;
            if (!password.trim()) {
                common.utility.alert(common.MESSAGE.title.hint, common.MESSAGE.register.empty_password);
            } else if (!common.utility.check_password(password)) {
                common.utility.alert(common.MESSAGE.title.hint, common.MESSAGE.register.invalid_password);
            } else if (!captcha.trim()) {
                common.utility.alert(common.MESSAGE.title.hint, common.MESSAGE.register.empty_captcha);
            } else if (!agree) {
                common.utility.alert(common.MESSAGE.title.warn, common.MESSAGE.register.invalid_agreement);
            } else {
                common.utility.loadingShow();
                _register();
            }
        };

        $scope.onTimeout = function () {
            $scope.countdownModel.counter--;
            if ($scope.countdownModel.counter > 0) {
                $scope.countdownModel.disabled = true;
                $scope.countdownModel.text = '获取验证码(' + $scope.countdownModel.counter + ')';
                var mytimeout = $timeout($scope.onTimeout, 1000);
            } else {
                $scope.countdownModel = {
                    counter: 60,
                    text: '发送验证码',
                    disabled: false
                };
                $timeout.cancel(mytimeout);
            }
        };

        $scope.getSmsCode = function () {
            $http({
                method: 'POST',
                url: common.API.get_create_code,
                data: {
                    phone: $scope.registerModel.phone
                }
            }).success(function (data) {
                if (data.status === 200) {
                    common.utility.alert(common.MESSAGE.title.hint, data.message);
                    $scope.countdownModel.disabled = true;
                    var mytimeout = $timeout($scope.onTimeout, 1000);
                } else {
                    common.utility.alert(common.MESSAGE.title.hint, data.message);
                }
            }).error(function () {
                common.utility.alert(common.MESSAGE.title.error, common.MESSAGE.network_error);
            });
        };

        function _register() {
            var deviceCode = common.utility.getDeviceInfo().deviceCode,
                appVersion = common.utility.getAppVersion();
            $http({
                method: 'POST',
                url: common.API.registred,
                data: {
                    phone: $scope.registerModel.phone,
                    code: $scope.registerModel.captcha,
                    password: $scope.registerModel.password,
                    exchange_code: $scope.registerModel.redeem,
                    devicetype: deviceCode,
                    version: appVersion
                }
            }).success(function (data) {
                common.utility.loadingHide();
                if (data.status === 200) {
                    var userInfo = {
                        'uid': data.data.account.uid,
                        'token': data.data.token,
                        'phone': $scope.registerModel.phone
                    };
                    common.utility.cookieStore.put('uinfo', userInfo);
                    UserInfo.put(function (data) {
                        Location.startLocationService(function (value) {

                        }, function (value) {

                        }, userInfo);
                    }, function (data) {

                    }, userInfo);
                    // add fingerprint data
                    common.utility.fraudMetrix(userInfo.uid, 1);
                    if (data.data.redpacket) {
                        if (data.data.redpacket.gain === 0) {
                            $location.path('/home');
                        }
                    } else {
                        $location.path('/home');
                    }
                } else {
                    common.utility.alert(common.MESSAGE.title.hint, data.message);
                }
            }).error(function () {
                common.utility.loadingHide();
                common.utility.alert(common.MESSAGE.title.error, common.MESSAGE.network_error);
            });
        }
    }])

    .controller('UserInfoCtrl', [
        '$rootScope',
        '$scope',
        '$http',
        '$location',
        '$stateParams',
        'Common',
        function ($rootScope, $scope, $http, $location, $stateParams, common) {
            $rootScope.customConfig = common.CUSTOM_CONFIG.userinfo;
            $scope.userInfo = {};
            $scope.errorInfo = {};
            $scope.disabledInfo = {};
            $scope.showErrorInfo = {};

            var company_address = common.tempData.user_info.companyAddress,
                home_address = common.tempData.user_info.homeAddress;
            var userInfo = '';

            // 校验是否登录
            $scope.checkLogin = function () {
                if (common.utility.checkLogin()) {
                    userInfo = common.utility.cookieStore.get('uinfo');
                } else {
                    $location.path('/user/login');
                }
            }();

            // 获取银行类型
            $scope.getBankType = function () {
                $http({
                    method: 'get',
                    url: common.API['v2.0'].get_banktype
                }).success(function (bankData) {
                    if (bankData.status == 200) {
                        $scope.bankData = bankData.data;
                    }
                }).error(function () {
                    common.utility.alert(common.MESSAGE.title.error, common.MESSAGE.network_error);
                });
            }();

            // 设置入职时间
            $scope.datepickerObject = common.utility.datePicker(function (val) {
                console.log(val);
                if (val) {
                    $scope.userInfo.join_at = val.format('yyyy-MM-dd');
                    $scope.hideWarning('join_at');
                }
            });

            // 获取用户信息
            $scope.getUserInfo = function () {
                common.utility.loadingShow();
                $http({
                    method: 'post',
                    url: common.API['v2.0'].get_user_info,
                    params: {
                        uid: userInfo.uid,
                        token: userInfo.token
                    }
                }).success(function (userData) {
                    common.utility.loadingHide();
                    if (userData.status == 200) {
                        $scope.initUserInfo(userData)
                    } else if (userData.status == 206) {
                        common.tempData.first_complate = 'none';
                    } else if (userData.status == 600) {
                        $location.path('/user/login');
                    }
                }).error(function () {
                    common.utility.loadingHide();
                    common.utility.alert(common.MESSAGE.title.error, common.MESSAGE.network_error);
                });
            };

            // 初始化页面用户数据
            $scope.initUserInfo = function (userData) {
                $scope.userInfo.name = userData.data.name;
                $scope.userInfo.identity = userData.data.identity;
                $scope.userInfo.card = userData.data.payway[0].card;
                $scope.userInfo.company = userData.data.company;
                $scope.userInfo.qq = userData.data.qq;
                $scope.userInfo.bankType = userData.data.payway[0].cardtype;
                $scope.userInfo.emergency_contact = userData.data.emergency_contact;
                $scope.userInfo.join_at = userData.data.join_at;
                // 设置地址信息
                if (userData.data.address.length > 0) {
                    userData.data.address.forEach(function (data) {
                        if (data.type == 0) {
                            $scope.userInfo.homeAddress = data.address;
                            $scope.userInfo.home_id = data.area_id;
                        }
                        if (data.type == 1) {
                            $scope.userInfo.companyAddress = data.address;
                            $scope.userInfo.company_id = data.area_id;
                            $scope.userInfo.telphone = data.tel;
                        }
                    });
                }
                // 控制银行类型选择后演示更改
                ($scope.userInfo.bankType) ?
                    $scope.banktype = {color: '#000'} : $scope.banktype = {color: '#999'};
                // 储存照片信息
                common.tempData.user_info.picInfo = userData.data.data;
                // 设置资料状态位
                common.tempData.user_info.auditStatus = userData.data.audit_status;
                // 设置资料通过
                if (userData.data.audit_status == 2) {
                    var disableData = {
                        name: null,
                        identity: null,
                        card: null,
                        bank: null,
                        comaddress: null,
                        company: null,
                        comtel: null,
                        qq: null,
                        homeaddress: null,
                        emergency_contact: null,
                        join_at: null
                    };
                    $scope.initDisabledInfo(disableData);
                }
                // 设置错误定位
                if (userData.data.audit_status == 3 && userData.data.info_refund) {
                    common.tempData.user_info.infoRefund = userData.data.info_refund;
                    $scope.initErrorInfo(userData.data.info_refund);
                    $scope.initDisabledInfo(userData.data.info_refund);
                }
            };

            // 更新页面错误信息
            $scope.initErrorInfo = function (errorData) {
                var errorInfo = common.tempData.user_info.errorInfo;
                // 初始化服务端返回的错误定位信息
                if (errorData.toString() !== '') {
                    for (var error in errorData) {
                        if (errorData[error]) {
                            $scope.errorInfo[error] = errorData[error];
                        }
                    }
                }
                // 初始化本地修改后的错误定位信息
                if (errorInfo) {
                    for (var e in errorInfo) {
                        $scope.errorInfo[e] = errorInfo[e];
                    }
                }
                for (e in $scope.errorInfo) {
                    if ($scope.errorInfo[e]) {
                        $scope.showErrorInfo[e] = 'show';
                    }
                }
            };

            // 初始化disabled信息
            $scope.initDisabledInfo = function (errorData) {
                $scope.disabledInfo = {
                    name: true,
                    identity: true,
                    card: true,
                    comaddress: true,
                    company: true,
                    join_at: true,
                    comtel: true,
                    qq: true,
                    homeaddress: true,
                    emergency_contact: true
                };
                if (errorData.toString() !== '') {
                    // 有错误定位信息,放开有错表单
                    for (var dis in errorData) {
                        if (errorData[dis]) {
                            $scope.disabledInfo[dis] = !errorData[dis];
                        }
                    }
                } else {
                    // 没有错误定位信息,放开所有表单
                    for (var k in $scope.disabledInfo) {
                        $scope.disabledInfo[k] = null;
                    }
                }
            };

            // 设置地址
            $scope.setAddress = function (type) {
                var pass = true;
                (type == 'company' && $scope.disabledInfo.comaddress) ? pass = false : 0;
                (type == 'home' && $scope.disabledInfo.homeaddress) ? pass = false : 0;
                if (pass) {
                    // 保存userInfo到缓存变量中
                    common.tempData.user_info.userInfo = $scope.userInfo;
                    $location.path('/' + $stateParams.order + '/userinfo/address/' + type);
                }
            };

            // 修改错误信息后隐藏错误提示
            $scope.hideWarning = function (error) {
                // 控制银行类型选择后演示更改
                ($scope.userInfo.bankType) ?
                    $scope.banktype = {color: '#000'} : $scope.banktype = {color: '#999'};
                // 错误信息被修改后隐藏错误提示
                if ($scope.errorInfo[error]) {
                    $scope.errorInfo[error] = '';
                    $scope.showErrorInfo[error] = 'hide';
                    common.tempData.user_info.errorInfo = $scope.errorInfo;
                }
            };

            // 基础资料点击下一步
            $scope.submit = function (isValid) {
                Location.getLocationAuthetication(function (data) {
                    var client = common.utility.getDeviceInfo().deviceType;
                    var strategyInfo = {
                        strategy: '',
                        docs: 'click finish button in userinfo page'
                    };

                    $http({
                        method: 'GET',
                        url: common.API.get_location_mode + '?client=' + client
                    }).success(function (data) {
                        if (data.status === 200) {
                            var strategyDatas = data.data;
                            for (var i = 0, len = strategyDatas.length; i < len; i++) {
                                if (strategyDatas[i].code === 'position_env') {
                                    var eventDatas = strategyDatas[i].sub;
                                    for (var j = 0, length = eventDatas.length; j < length; j++) {
                                        if (eventDatas[j].code === client && eventDatas[j].cname === '下单位置') {
                                            strategyInfo.strategy = eventDatas[j].mode_id;
                                        }
                                    }
                                }
                            }

                            Location.startLocationService(function (value) {
                            }, function (value) {
                            }, userInfo);

                            Location.postLocationStrategy(function (value) {
                            }, function (value) {
                            }, strategyInfo);
                        }
                    }).error(function () {
                        common.utility.alert(common.MESSAGE.title.hint, common.MESSAGE.network_error);
                    });

                    // 设置入职时间
                    if (common.tempData.user_info.auditStatus == 2) {
                        $location.path('/' + $stateParams.order + '/safyinfo');
                    } else {
                        if (isValid) {
                            $scope.verifyUserinfo();
                        } else {
                            common.utility.alert(common.MESSAGE.title.hint, common.MESSAGE.userinfo.not_full);
                        }
                    }
                }, function (error) {
                    common.utility.alert(common.MESSAGE.title.hint, error);
                });
            };

            // 校验身份证/银行卡
            $scope.verifyUserinfo = function () {
                common.utility.loadingShow();
                $http({
                    method: 'POST',
                    url: common.API['v2.0'].verify_user_info,
                    data: {
                        uid: userInfo.uid,
                        token: userInfo.token,
                        card: $scope.userInfo.card,
                        identity: $scope.userInfo.identity
                    }
                }).success(function (data) {
                    common.utility.loadingHide();
                    if (data.status == 200) {
                        common.tempData.user_info.userInfo = $scope.userInfo;
                        $location.path('/' + $stateParams.order + '/safyinfo');
                    } else {
                        common.utility.alert(common.MESSAGE.title.warn, data.message);
                    }
                }).error(function () {
                    common.utility.loadingHide();
                    common.utility.alert(common.MESSAGE.title.error, common.MESSAGE.network_error);
                });
            };

            // 初始化页面数据及地址信息
            $scope.initPageInfo = function () {
                // 判断是否存在本地缓存数据
                if (common.tempData.user_info.userInfo) {
                    // 将缓存变量赋值到页面userInfo中
                    $scope.userInfo = common.tempData.user_info.userInfo;
                    // 初始化错误信息
                    if (common.tempData.user_info.infoRefund) {
                        $scope.initErrorInfo(common.tempData.user_info.infoRefund);
                        $scope.initDisabledInfo(common.tempData.user_info.infoRefund);
                    }
                    // 初始化公司地址
                    if (company_address) {
                        $scope.userInfo.companyAddress = company_address.area + company_address.detail;
                        $scope.userInfo.company_id = company_address.cid;
                        $scope.hideWarning('comaddress');
                    }
                    // 初始化现居地址
                    if (home_address) {
                        $scope.userInfo.homeAddress = home_address.area + home_address.detail;
                        $scope.userInfo.home_id = home_address.cid;
                        $scope.hideWarning("homeaddress");
                    }
                    // 控制银行类型选择后演示更改
                    $scope.banktype = ($scope.userInfo.bankType) ? {color: '#000'} : {color: '#999'};
                } else {
                    // 获取用户信息
                    $scope.getUserInfo();
                }
            }();

            // 获取地理位置
            function _getLocationAuth () {
                Location.getLocationAuthetication(function (data) {
                    var client = common.utility.getDeviceInfo().deviceType;
                    var strategyInfo = {
                        strategy: '',
                        docs: 'load add userinfo page'
                    };

                    $http({
                        method: 'GET',
                        url: common.API.get_location_mode + '?client=' + client
                    }).success(function (data) {
                        if (data.status === 200) {
                            var strategyDatas = data.data;
                            for (var i = 0, len = strategyDatas.length; i < len; i++) {
                                if (strategyDatas[i].code === 'position_env') {
                                    var eventDatas = strategyDatas[i].sub;
                                    for (var j = 0, length = eventDatas.length; j < length; j++) {
                                        if (eventDatas[j].code === client && eventDatas[j].cname === '下单位置') {
                                            strategyInfo.strategy = eventDatas[j].mode_id;
                                        }
                                    }
                                }
                            }

                            Location.postLocationStrategy(function (value) {
                            }, function (value) {
                            }, strategyInfo);
                        }
                    }).error(function () {
                        common.utility.alert(common.MESSAGE.title.hint, common.MESSAGE.network_error);
                    });
                }, function (error) {
                    common.utility.alert(common.MESSAGE.title.hint, error);
                    Location.startLocationService(function (value) {

                    }, function (value) {

                    }, userInfo);
                });
            }
            _getLocationAuth();

        }])

    .controller('SelectAddressCtrl', [
        '$rootScope',
        '$scope',
        '$http',
        '$location',
        '$stateParams',
        'Common',
        function ($rootScope, $scope, $http, $location, $stateParams, common) {
            $rootScope.customConfig = common.CUSTOM_CONFIG.userinfo;
            var company = common.tempData.user_info.companyAddress,
                home = common.tempData.user_info.homeAddress;

            // 记录返回操作
            $scope.isback = false;

            // 初始化页面地址信息
            $scope.initPageAddress = function () {
                ($stateParams.type == 'company') ?
                    (company) ?
                        $scope.address = company :
                        0 :
                    (home) ?
                        $scope.address = home :
                        0;

                // 如果是选择公司区域，则不需要填写详细地址
                $scope.hideDetail = $stateParams.type === 'company';
            }();

            // 处理银行流水页面离开事件
            $scope.$on('$locationChangeStart', function () {
                // 判断是否是返回操作
                if (!$scope.isback) {
                    // 清空缓存的地址信息
                    ($stateParams.type == 'company') ?
                        common.tempData.user_info.companyAddress = "" : common.tempData.user_info.homeAddress = "";
                    $location.path('/' + $stateParams.order + '/userinfo');
                }
            });

            // 初始化页面标题
            ($stateParams.type == 'company') ?
                $scope.title = '公司地址' : $scope.title = '现居地址';

            // 选择省市区地址
            $scope.selectArea = function () {
                $scope.isback = true;
                $location.path('/' + $stateParams.order + '/userinfo/address/' + $stateParams.type + '/select');
            };

            // 校验是否填写
            $scope.checkout = function (detail) {
                var pass = true, message = '';
                if ($stateParams.type == 'company') {
                    if (common.tempData.user_info.companyAddress) {
                        if (detail) {
                            company.detail = detail;
                        } else {
                            company.detail = '';
                            // pass = false;
                            // message = common.MESSAGE.userinfo.detail;
                        }
                    } else {
                        pass = false;
                        message = common.MESSAGE.userinfo.address;
                    }
                } else {
                    if (common.tempData.user_info.homeAddress) {
                        if (detail) {
                            home.detail = detail;
                        } else {
                            pass = false;
                            message = common.MESSAGE.userinfo.detail;
                        }
                    } else {
                        pass = false;
                        message = common.MESSAGE.userinfo.address;
                    }
                }
                !pass ? common.utility.alert(common.MESSAGE.title.hint, message) : 0;
                return pass;
            };

            // 提交地址
            $scope.saveAddress = function (detail) {
                if ($scope.checkout(detail)) {
                    $scope.isback = true;
                    $location.path('/' + $stateParams.order + '/userinfo');
                }
            };

        }])

    .controller('SelectAreaIdCtrl', [
        '$scope',
        '$location',
        '$stateParams',
        'Common',
        '$rootScope',
        '$http',
        '$ionicScrollDelegate',
        function ($scope, $location, $stateParams, common, $rootScope, $http, $ionicScrollDelegate) {
            $rootScope.customConfig = common.CUSTOM_CONFIG.userinfo;

            var address = '';

            // 获取城市列表
            $scope.getList = function (cid) {
                common.utility.loadingShow();
                $http({
                    type: 'GET',
                    url: common.API.area_list,
                    params: {cid: cid}
                }).success(function (areaData) {
                    common.utility.loadingHide();
                    $scope.areaData = areaData.data;
                    $ionicScrollDelegate.$getByHandle('mainScroll').scrollTop();
                }).error(function (errorData) {
                    common.utility.loadingHide();
                });
            };

            // 默认进来获取所有省市列表
            $scope.getList(0);

            // 获取详细信息
            $scope.goDetail = function (data) {
                address += data.name + ' ';
                if (data.type < 3) {
                    $scope.getList(data.cid);
                } else {
                    if ($stateParams.type == 'company') {
                        common.tempData.user_info.companyAddress = {
                            area: address,
                            cid: data.cid
                        };
                    } else {
                        common.tempData.user_info.homeAddress = {
                            area: address,
                            cid: data.cid
                        };
                    }
                    $location.path('/' + $stateParams.order + '/userinfo/address/' + $stateParams.type);
                }
            };

        }])

    .controller('SafyinfoCtrl', [
        '$scope',
        '$http',
        '$location',
        '$rootScope',
        'Common',
        '$stateParams',
        function ($scope, $http, $location, $rootScope, common, $stateParams) {
            $rootScope.customConfig = common.CUSTOM_CONFIG.userinfo;
            $scope.picType = 0;
            $scope.pictureObj = {};
            $scope.errorInfo = {};
            $scope.userInfo = {};

            var userInfo = common.utility.cookieStore.get('uinfo');
            // 监听照片拍摄,并获取照片流
            var takePicture = document.getElementById('takepicture');
            //var takePictureUrl = function () {
            //    takePicture.onchange = function (event) {
            //        var files = event.target.files, file;
            //        if (files && files.length > 0) {
            //            file = files[0];
            //            try {
            //                var URL = window.URL || window.webkitURL;
            //                var blob = URL.createObjectURL(file);
            //                $scope.compressPicture(blob);
            //            }
            //            catch (e) {
            //                try {
            //                    var fileReader = new FileReader();
            //                    fileReader.onload = function (event) {
            //                        $scope.compressPicture(event.target.result);
            //                    };
            //                    fileReader.readAsDataURL(file);
            //                }
            //                catch (e) {
            //                    common.utility.alert(common.MESSAGE.title.error, '拍照失败,请联系客服或尝试更换手机再试!');
            //                }
            //            }
            //        }
            //        $scope.$digest();
            //    }
            //}();

            /**
             * 更新用户数据
             * @param userData 用户数据
             */
            $scope.initUserInfo = function (userData) {

                $scope.userInfo.name = userData.name;
                $scope.userInfo.identity = userData.identity;
                $scope.userInfo.card = Number(userData.payway[0].card);
                $scope.userInfo.company = userData.company;
                $scope.userInfo.emergency_contact = userData.emergency_contact;
                $scope.userInfo.bankType = userData.payway[0].cardtype;
                $scope.userInfo.join_at = userData.join_at;

                // 设置地址信息
                if (userData.address.length > 0) {
                    userData.address.forEach(function (data) {
                        if (data.type == 0) {
                            $scope.userInfo.homeAddress = data.address;
                            $scope.userInfo.home_id = data.area_id;
                        }
                        if (data.type == 1) {
                            $scope.userInfo.companyAddress = data.address;
                            $scope.userInfo.company_id = data.area_id;
                            $scope.userInfo.telphone = data.tel;
                        }
                    });
                }

                // 缓存错误定位信息
                if (userData.audit_status == 3 && userData.info_refund) {
                    common.tempData.user_info.infoRefund = userData.info_refund;
                }

                // 缓存用户填写的数据
                if (userData.audit_status !== 2) {
                    common.tempData.user_info.userInfo = $scope.userInfo;
                }

                if (userData.audit_status !== 2) {
                    $scope.submitText = '提交';
                } else {
                    $scope.submitText = '确定';
                }

                // 保存用户资料状态位
                common.tempData.user_info.auditStatus = userData.audit_status;
            };

            /**
             * 初始化页面照片信息
             * @param picInfo 照片数据
             * @param errorPicInfo 照片错误定位信息
             */
            $scope.initPagePicInfo = function (picInfo, errorPicInfo) {
                // 初始化照片默认样式/属性
                for (var i = 0; i < 4; i++) {
                    $scope.pictureObj['pic' + i] = {
                        title: 'picture-title-untake',
                        type: i,
                        btn: '拍照',
                        src: 'img/loan/pic_' + i + '.jpg',
                        sign: 0
                    };
                }
                // 是否提交过照片
                if (picInfo && picInfo.length > 0) {
                    // 显示服务端的照片
                    for (var j = 0; j < 4; j++) {
                        for (var k = 0, len = picInfo.length; k < len; k++) {
                            if (picInfo[k].type == j) {
                                $scope.pictureObj['pic' + j].src = picInfo[k].thumb;
                                $scope.pictureObj['pic' + j].title = 'picture-title-take';
                                $scope.pictureObj['pic' + j].sign = 1;
                                $scope.pictureObj['pic' + j].btn = '重拍';
                            }
                        }
                    }
                    // 是否存在照片错误定位信息
                    if (errorPicInfo && errorPicInfo.toString() !== '') {
                        if (errorPicInfo.pic) {
                            // 遍历错误定位信息
                            for (var m = 0; m < 4; m++) {
                                if (errorPicInfo.pic[m]) {
                                    $scope.errorInfo['pic' + m] = errorPicInfo.pic[m];
                                    $scope.pictureObj['pic' + m].mask = {display: 'inline'};
                                    $scope.pictureObj['pic' + m].title = 'picture-title-untake';
                                    $scope.pictureObj['pic' + m].sign = 0;
                                } else {
                                    $scope.pictureObj['pic' + m].title = 'picture-title-take';
                                    $scope.pictureObj['pic' + m].sign = 1;
                                    $scope.pictureObj['pic' + m].btnStyle = {'background-color': '#cccccc'};
                                    $scope.pictureObj['pic' + m].isOk = true;
                                }
                            }
                        } else {
                            // 遍历错误定位信息
                            for (var m = 0; m < 4; m++) {
                                $scope.pictureObj['pic' + m].title = 'picture-title-take';
                                $scope.pictureObj['pic' + m].sign = 1;
                                $scope.pictureObj['pic' + m].btnStyle = {'background-color': '#cccccc'};
                                $scope.pictureObj['pic' + m].isOk = true;
                            }
                        }
                    }
                    // 是否存在正在审核的订单（照片不可编辑）
                    if (common.tempData.user_info.auditStatus == 2) {
                        for (var n = 0; n < 4; n++) {
                            $scope.pictureObj['pic' + n].title = 'picture-title-take';
                            $scope.pictureObj['pic' + n].sign = 1;
                            $scope.pictureObj['pic' + n].btnStyle = {'background-color': '#cccccc'};
                            $scope.pictureObj['pic' + n].btn = '拍照';
                            $scope.pictureObj['pic' + n].isOk = true;
                        }
                    }
                }
            };

            // 获取用户信息
            $scope.getUserInfo = function () {
                common.utility.loadingShow();
                $http({
                    method: 'post',
                    url: common.API['v2.0'].get_user_info,
                    params: {
                        uid: userInfo.uid,
                        token: userInfo.token
                    }
                }).success(function (userData) {
                    common.utility.loadingHide();
                    if (userData.status == 200) {
                        $scope.initUserInfo(userData.data);
                        $scope.initPagePicInfo(userData.data.data, userData.data.info_refund);
                    } else if (userData.status == 600) {
                        $location.path('/user/login');
                    }
                }).error(function () {
                    common.utility.loadingHide();
                    common.utility.alert(common.MESSAGE.title.error, common.MESSAGE.network_error);
                });
            };

            /**
             * 用户点击拍照事件
             * @param type 照片类型
             */
            $scope.takePicture = function (type) {
                var pass = true;
                for (var i = 0; i < 4; i++) {
                    if ($scope.pictureObj['pic' + type].isOk) {
                        pass = false;
                    }
                }
                if (pass) {
                    $scope.picType = type;
                    window.Camera.takePicture(function (data) {
                        $scope.uploadPicture($scope.picType, data.pic);
                    }, function () {
                        common.utility.alert(common.MESSAGE.title.error, common.MESSAGE.safyinfo.error);
                    }, {"type": $scope.picType});
                } else {
                    // 判断资料是否审核通过
                    if (common.tempData.user_info.auditStatus !== 2) {
                        common.utility.alert(common.MESSAGE.title.hint, common.MESSAGE.safyinfo.replay);
                    }
                }
            };

            /**
             * 压缩照片
             * @param blob 照片的url
             */
            $scope.compressPicture = function (blob) {
                var quality = 0.5,
                    image = new Image();
                image.src = blob;
                image.onload = function () {
                    var that = this;

                    // 生成比例
                    var width = that.width,
                        height = that.height;

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
                    $scope.uploadPicture($scope.picType, imgurl);
                };
            };

            /**
             * 上传照片
             * @param type 类型
             * @param imgurl 照片链接
             */
            $scope.uploadPicture = function (type, imgurl) {
                $scope.setLoadingAnimation(type, 1);
                $http({
                    method: 'POST',
                    url: common.API['v2.0'].create_user_pic,
                    data: {
                        uid: userInfo.uid,
                        token: userInfo.token,
                        type: type,
                        pic: imgurl.substr(22)
                    }
                }).success(function (data) {
                    $scope.setLoadingAnimation(type, 0);
                    (data.status == 200) ?
                        $scope.setPictureUrl(type, imgurl) :
                        common.utility.alert(common.MESSAGE.title.warnning, data.message);
                }).error(function () {
                    $scope.setLoadingAnimation(type, 0);
                    common.utility.alert(common.MESSAGE.title.error, common.MESSAGE.network_error);
                });
            };

            /**
             * 控制照片加载动画显示和隐藏
             * @param type 照片类型
             * @param show 显示/隐藏
             */
            $scope.setLoadingAnimation = function (type, show) {
                for (var i = 0; i < 4; i++) {
                    if ($scope.pictureObj['pic' + i].type == type) {
                        $scope.pictureObj['pic' + i].mask = show ? {display: 'inline'} : {display: 'none'};
                        $scope.pictureObj['pic' + i].loading = show;
                        $scope.errorInfo['pic' + i] = null;
                    }
                }
            };

            /**
             * 设置照片地址
             * @param type 照片类型
             * @param imgurl 照片地址
             */
            $scope.setPictureUrl = function (type, imgurl) {
                for (var i = 0; i < 4; i++) {
                    if ($scope.pictureObj['pic' + i].type == type) {
                        $scope.pictureObj['pic' + i] = {
                            type: type,
                            src: imgurl,
                            btn: '重拍',
                            title: 'picture-title-take',
                            sign: 1
                        }
                    }
                }
            };

            // 校验照片是否都拍摄
            $scope.checkout = function () {
                var type = 0;
                var pass = true;
                angular.forEach($scope.pictureObj, function (data) {
                    if (pass) {
                        if (data.sign == 0) {
                            type = data.type;
                            pass = false;
                        }
                    }
                });
                (!pass) ?
                    common.utility.alert(common.MESSAGE.title.hint, common.MESSAGE.safyinfo['type' + type]) : 0;
                return pass;
            };

            // 安全信息提交基本资料
            $scope.submit = function () {
                // 判断资料审核状态
                if (common.tempData.user_info.auditStatus == 2) {
                    $location.path('/user');
                } else {
                    if ($scope.checkout()) {
                        common.utility.loadingShow();
                        $http({
                            method: 'POST',
                            url: common.API['v2.0'].create_userinfo,
                            data: {
                                uid: userInfo.uid,
                                token: userInfo.token,
                                name: $scope.userInfo.name,
                                identity: $scope.userInfo.identity,
                                card_type: $scope.userInfo.bankType,
                                card: $scope.userInfo.card,
                                comname: $scope.userInfo.company,
                                join_at: $scope.userInfo.join_at,
                                comarea_id: $scope.userInfo.company_id,
                                comaddress: $scope.userInfo.companyAddress,
                                qq: $scope.userInfo.qq,
                                emergency_contact: $scope.userInfo.emergency_contact,
                                homearea_id: $scope.userInfo.home_id,
                                homeaddress: $scope.userInfo.homeAddress
                            }
                        }).success(function (data) {
                            common.utility.loadingHide();
                            if (data.status == 200) {
                                if ($stateParams.order == 'user') {
                                    if (common.tempData.first_complate == 'none') {
                                        common.tempData.first_complate = true;
                                    }
                                    $location.path('/user');
                                    $scope.cleanTempData();
                                } else if ($stateParams.order == 'period') {
                                    $scope.cleanTempData();
                                    if (common.tempData.viewOrder[2] === '0') {
                                        $location.path('/loan/apply');
                                    } else if (common.tempData.viewOrder[2] === '1') {
                                        $location.path('/stage/insurance');
                                    }
                                } else if ($stateParams.order == 'stage') {
                                    $location.path('/' + $stateParams.order + '/assetinfo');
                                }
                            } else {
                                common.utility.alert(common.MESSAGE.title.warn, data.message);
                            }
                        }).error(function () {
                            common.utility.loadingHide();
                            common.utility.alert(common.MESSAGE.title.error, common.MESSAGE.network_error);
                        });
                    }
                }
            };

            // 清除缓存
            $scope.cleanTempData = function () {
                common.tempData.user_info.userInfo =
                    common.tempData.user_info.infoRefund =
                        common.tempData.user_info.errorInfo =
                            common.tempData.user_info.picInfo =
                                common.tempData.user_info.companyAddress =
                                    common.tempData.user_info.homeAddress = "";
            };

            // 初始化页面信息
            $scope.init = function () {
                // 是否存在用户填写的数据
                if (common.tempData.user_info.userInfo) {
                    $scope.submitText = (common.tempData.user_info.auditStatus == 2) ? '确定' : '提交';
                    $scope.initPagePicInfo(common.tempData.user_info.picInfo, common.tempData.user_info.infoRefund);
                    $scope.userInfo = common.tempData.user_info.userInfo;
                } else {
                    $scope.getUserInfo();
                }
            }();

        }])

    .controller('AssetinfoCtrl', [
        '$scope',
        '$http',
        '$location',
        '$rootScope',
        'Common',
        '$ionicScrollDelegate',
        '$ionicPopup',
        '$window',
        function ($scope, $http, $location, $rootScope, common, $ionicScrollDelegate, $ionicPopup, $window) {
            $rootScope.customConfig = common.CUSTOM_CONFIG.userinfo;

            // 银行流水号
            $scope.submitBtn = true;
            $scope.picType = 0;
            $scope.isback = false;
            var userInfo = common.utility.cookieStore.get('uinfo');
            var picObj = [], typeArray = new Array(0), uploadArray = new Array(0);

            if (common.tempData.assetPictures.length) {
                picObj = common.tempData.assetPictures;
                $scope.pictures = picObj;
            }

            // 监听照片拍摄,并获取照片流
            var takePicture = document.getElementById('takepicture');
            var image = document.getElementById("cachepicture");

            // 初始化银行流水type栈
            $scope.initTypeArray = function () {
                for (var i = 30; i < 39; i++) {
                    var typeObj = {
                        type: i,
                        isValue: false
                    };
                    typeArray.push(typeObj);
                }

                for (var j = 0, len = picObj.length; j < len; j++) {
                    typeArray[j].isValue = true;
                    $scope.submitBtn = false;
                }
            }();

            // 处理页面离开事件(Android下返回事件处理)
            $scope.$on('$locationChangeStart', function () {
                // 判断是否可以返回
                if (!$scope.isback) {
                    var pass = true;
                    for (var i = 0; i < 9; i++) {
                        if (typeArray[i].isValue == true) {
                            pass = false;
                        }
                    }
                    !pass ? $scope.delAllBankWater() : 0;
                    $scope.isback = true;
                }
            });

            // 处理页面返回事件
            $scope.assetinfoback = function () {
                var pass = true;
                for (var i = 0; i < 9; i++) {
                    if (typeArray[i].isValue == true) {
                        pass = false;
                    }
                }
                !pass ? $scope.delAllBankWater() : 0;
                $scope.isback = true;
                $window.history.back();
            };

            /**
             * 切换type队列的占用和释放
             * @param type 照片类型
             * @param isValue true为已拍摄,false为未拍摄
             */
            $scope.typeToggle = function (type, isValue) {
                for (var i = 0; i < 9; i++) {
                    if (typeArray[i].type == type) {
                        typeArray[i].isValue = isValue;
                    }
                }
            };

            // 点击拍照事件
            $scope.takePicture = function () {
                var pass = true, type = -1;
                // 从type栈中取出可用的type值
                for (var i = 0; i < 9; i++) {
                    if (pass) {
                        if (!typeArray[i].isValue) {
                            type = typeArray[i].type;
                            pass = false;
                        }
                    }
                }
                if (type > 0) {
                    $scope.picType = type;
                    window.Camera.takePicture(function (data) {
                        $scope.setPictureUrl($scope.picType, data.pic);
                    }, function () {
                        common.utility.alert(common.MESSAGE.title.error, common.MESSAGE.safyinfo.error);
                    }, {"type": $scope.picType});
                } else {
                    common.utility.alert(common.MESSAGE.title.hint, common.MESSAGE.assetinfo.bankfull);
                }
            };

            /**
             * 压缩照片
             * @param blob 照片的url
             * @returns {string}
             */
            $scope.compressPicture = function (blob) {
                var quality = 0.5,
                    image = new Image();
                image.src = blob;
                image.onload = function () {
                    var that = this;

                    // 生成比例
                    var width = that.width,
                        height = that.height;
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
                    $scope.setPictureUrl($scope.picType, imgurl);
                };
            };

            /**
             * 设置照片地址
             * @param type 照片类型
             * @param imgurl 照片地址
             */
            $scope.setPictureUrl = function (type, imgurl) {
                $scope.picBtn = {float: 'left'};
                $scope.submitBtn = false;
                // 设置type占用
                $scope.typeToggle(type, true);
                var picarray = {
                    type: type,
                    src: imgurl,
                    isShow: false
                };
                picObj.push(picarray);
                common.tempData.assetPictures = picObj;
                $scope.pictures = picObj;
                $scope.uploadPicture(type, imgurl);
                $ionicScrollDelegate.$getByHandle('mainScroll').scrollBottom();
            };

            /**
             * 设置显示和隐藏过度动画
             * @param type
             * @param isShow
             */
            $scope.setLoadingAnimation = function (type, isShow) {
                var pass = true;
                angular.forEach($scope.pictures, function (data) {
                    if (pass) {
                        if (data.type == type) {
                            data.isShow = isShow;
                            pass = false;
                        }
                    }
                });
            };

            /**
             * 上传照片
             * @param type 类型
             * @param imgurl 照片链接
             */
            $scope.uploadPicture = function (type, imgurl) {
                $scope.setLoadingAnimation(type, true);
                uploadArray.push(type);
                $http({
                    method: 'POST',
                    url: common.API['v2.0'].create_user_pic,
                    data: {
                        uid: userInfo.uid,
                        token: userInfo.token,
                        type: type,
                        pic: imgurl.substr(22)
                    }
                }).success(function (data) {
                    $scope.setLoadingAnimation(type, false);
                    if (data.status == 200) {
                        for (var i = 0, len = uploadArray.length; i < len; i++) {
                            if (uploadArray[i] == type) {
                                uploadArray.splice(i, 1);
                            }
                        }
                    } else {
                        common.utility.alert(common.MESSAGE.title.warnning, data.message);
                    }
                }).error(function () {
                    $scope.setLoadingAnimation(type, false);
                    common.utility.alert(common.MESSAGE.title.error, common.MESSAGE.network_error);
                });
            };

            // 删除银行流水
            $scope.delBankWater = function (type) {
                var pass = true;
                common.utility.loadingShow();
                $http({
                    url: common.API['v2.0'].delete_user_pic,
                    method: 'POST',
                    data: {
                        uid: userInfo.uid,
                        token: userInfo.token,
                        type: type
                    }
                }).success(function (data) {
                    common.utility.loadingHide();
                    if (data.status == 200) {
                        for (var i = 0, len = picObj.length; i < len; i++) {
                            if (pass) {
                                if (picObj[i].type == type) {
                                    $scope.pictures.splice(i, 1);
                                    pass = false;
                                }
                            }
                        }
                        if (!picObj.length) {
                            $scope.submitBtn = true;
                        }
                        // 释放type的占用
                        $scope.typeToggle(type, false);
                        // 移动滚动条
                        $ionicScrollDelegate.$getByHandle('mainScroll').scrollBottom();
                    } else {
                        common.utility.alert(common.MESSAGE.title.warn, data.message);
                    }
                }).error(function () {
                    common.utility.loadingHide();
                    common.utility.alert(common.MESSAGE.title.error, common.MESSAGE.network_error);
                });
            };

            // 删除所有银行流水
            $scope.delAllBankWater = function () {
                var type = '';
                for (var i = 0; i < 9; i++) {
                    if (typeArray[i].isValue == true) {
                        type += ',' + typeArray[i].type;
                    }
                }
                type = type.substr(1);
                $http({
                    url: common.API['v2.0'].delete_user_pic,
                    method: 'POST',
                    data: {
                        uid: userInfo.uid,
                        token: userInfo.token,
                        type: type
                    }
                }).success(function (data) {
                    common.tempData.assetPictures = [];
                    if (data.status !== 200) {
                        common.utility.alert(common.MESSAGE.title.warn, data.message);
                    }
                }).error(function () {
                    common.utility.alert(common.MESSAGE.title.error, common.MESSAGE.network_error);
                });
            };

            //判断是否有正在上传的流水
            $scope.checkUplading = function () {
                var pass = true;
                for (var i = 0, len = uploadArray.length; i < len; i++) {
                    if (uploadArray[i]) {
                        pass = false;
                    }
                }
                return !pass;
            };

            // 提交银行流水
            $scope.submit = function () {
                // 判断是否有正在上传的流水
                if ($scope.checkUplading()) {
                    common.utility.alert(common.MESSAGE.title.hint, common.MESSAGE.assetinfo.uploading);
                } else {
                    $scope.isback = true;
                    if (common.tempData.viewOrder[2] === '1') {
                        // 跳转到社保图片页面
                        $location.path('/stage/insurance');
                    } else if (common.tempData.viewOrder[2] === '0') {
                        // 跳转到借款页面
                        common.utility.alert(common.MESSAGE.title.hint, common.MESSAGE.assetinfo.info_full);
                        $scope.cleanTempData();
                        $location.path('/loan/apply');
                    }
                }
            };

            // 清除缓存
            $scope.cleanTempData = function () {
                common.tempData.user_info.userInfo =
                    common.tempData.user_info.infoRefund =
                        common.tempData.user_info.errorInfo =
                            common.tempData.user_info.picInfo =
                                common.tempData.user_info.companyAddress =
                                    common.tempData.user_info.homeAddress = "";
                common.tempData.assetPictures = [];
            };

        }])

    .controller('InsuranceCtrl', [
        '$scope',
        '$http',
        '$location',
        'Common',
        '$ionicScrollDelegate',
        '$ionicPopup',
        '$window',
        function ($scope, $http, $location, common, $ionicScrollDelegate, $ionicPopup, $window) {
            // 社保图片号
            $scope.submitBtn = true;
            $scope.picType = 0;
            $scope.isback = false;
            var userInfo = common.utility.cookieStore.get('uinfo');
            var picObj = [], typeArray = new Array(0), uploadArray = new Array(0);
            // 监听照片拍摄,并获取照片流
            var takePicture = document.getElementById('takepicture');
            var image = document.getElementById('cachepicture');
            var takePictureUrl = function () {
                takePicture.onchange = function (event) {
                    var files = event.target.files, file;
                    if (files && files.length > 0) {
                        file = files[0];
                        try {
                            var URL = window.URL || window.webkitURL;
                            var blob = URL.createObjectURL(file);
                            common.utility.compressPicture(blob, $scope.picType, _setPictureUrl);
                        } catch (e) {
                            try {
                                var fileReader = new FileReader();
                                fileReader.onload = function (event) {
                                    common.utility.compressPicture(event.target.result, $scope.picType, _setPictureUrl);
                                };
                                fileReader.readAsDataURL(file);
                            } catch (e) {
                                common.utility.alert(common.MESSAGE.title.error, '\u62cd\u7167\u5931\u8d25,\u8bf7\u8054\u7cfb\u5ba2\u670d\u6216\u5c1d\u8bd5\u66f4\u6362\u624b\u673a\u518d\u8bd5!');
                            }
                        }
                    }
                    $scope.$digest();
                };
            }();
            // 初始化社保图片type栈
            // type 的范围为 40 - 49
            var _initTypeArray = function () {
                for (var i = 40; i < 49; i++) {
                    var typeObj = {
                        type: i,
                        isValue: false
                    };
                    typeArray.push(typeObj);
                }
            }();
            // 处理页面离开事件(Android下返回事件处理)
            $scope.$on('$locationChangeStart', function () {
                // 判断是否可以返回
                if (!$scope.isback) {
                    var pass = true;
                    for (var i = 0; i < 9; i++) {
                        if (typeArray[i].isValue == true) {
                            pass = false;
                        }
                    }
                    !pass ? _deleteAllInsurance() : 0;
                    $scope.isback = true;
                }
            });
            // 处理页面返回事件
            $scope.insuranceBack = function () {
                var pass = true;
                for (var i = 0; i < 9; i++) {
                    if (typeArray[i].isValue == true) {
                        pass = false;
                    }
                }
                !pass ? _deleteAllInsurance() : 0;
                $scope.isback = true;
                $window.history.back();
            };
            /**
             * 切换type队列的占用和释放
             * @param type 照片类型
             * @param isValue true为已拍摄,false为未拍摄
             */
            var _typeToggle = function (type, isValue) {
                for (var i = 0; i < 9; i++) {
                    if (typeArray[i].type == type) {
                        typeArray[i].isValue = isValue;
                    }
                }
            };
            // 点击拍照事件
            $scope.takePicture = function () {
                var pass = true, type = -1;
                // 从type栈中取出可用的type值
                for (var i = 0; i < 9; i++) {
                    if (pass) {
                        if (!typeArray[i].isValue) {
                            type = typeArray[i].type;
                            pass = false;
                        }
                    }
                }
                if (type > 0) {
                    $scope.picType = type;
                    window.Camera.takePicture(function (data) {
                        _setPictureUrl($scope.picType, data.pic);
                    }, function () {
                        common.utility.alert(common.MESSAGE.title.error, common.MESSAGE.insuranceInfo.error);
                    }, {"type": $scope.picType});
                } else {
                    common.utility.alert(common.MESSAGE.title.hint, common.MESSAGE.insuranceInfo.picture_full);
                }
            };
            /**
             * 设置照片地址
             * @param type 照片类型
             * @param imgurl 照片地址
             */
            var _setPictureUrl = function (type, imgurl) {
                $scope.picBtn = { float: 'left' };
                $scope.submitBtn = false;
                // 设置type占用
                _typeToggle(type, true);
                var picarray = {
                    type: type,
                    src: imgurl,
                    isShow: false
                };
                picObj.push(picarray);
                $scope.pictures = picObj;
                _uploadPicture(type, imgurl);
                $ionicScrollDelegate.$getByHandle('mainScroll').scrollBottom();
            };
            /**
             * 设置显示和隐藏过度动画
             * @param type
             * @param isShow
             */
            var _setLoadingAnimation = function (type, isShow) {
                var pass = true;
                angular.forEach($scope.pictures, function (data) {
                    if (pass) {
                        if (data.type == type) {
                            data.isShow = isShow;
                            pass = false;
                        }
                    }
                });
            };
            /**
             * 上传照片
             * @param type 类型
             * @param imgurl 照片链接
             */
            var _uploadPicture = function (type, imgurl) {
                _setLoadingAnimation(type, true);
                uploadArray.push(type);
                $http({
                    method: 'POST',
                    url: common.API['v2.0'].create_user_pic,
                    data: {
                        uid: userInfo.uid,
                        token: userInfo.token,
                        type: type,
                        pic: imgurl.substr(22)
                    }
                }).success(function (data) {
                    _setLoadingAnimation(type, false);
                    if (data.status == 200) {
                        for (var i = 0, len = uploadArray.length; i < len; i++) {
                            if (uploadArray[i] == type) {
                                uploadArray.splice(i, 1);
                            }
                        }
                    } else {
                        common.utility.alert(common.MESSAGE.title.warnning, data.message);
                    }
                }).error(function () {
                    _setLoadingAnimation(type, false);
                    common.utility.alert(common.MESSAGE.title.error, common.MESSAGE.network_error);
                });
            };
            // 删除社保图片
            $scope.deleteInsurance = function (type) {
                var pass = true;
                common.utility.loadingShow();
                $http({
                    url: common.API['v2.0'].delete_user_pic,
                    method: 'POST',
                    data: {
                        uid: userInfo.uid,
                        token: userInfo.token,
                        type: type
                    }
                }).success(function (data) {
                    common.utility.loadingHide();
                    if (data.status == 200) {
                        for (var i = 0, len = picObj.length; i < len; i++) {
                            if (pass) {
                                if (picObj[i].type == type) {
                                    $scope.pictures.splice(i, 1);
                                    pass = false;
                                }
                            }
                        }
                        if (!picObj.length) {
                            $scope.submitBtn = true;
                        }
                        // 释放type的占用
                        _typeToggle(type, false);
                        // 移动滚动条
                        $ionicScrollDelegate.$getByHandle('mainScroll').scrollBottom();
                    } else {
                        common.utility.alert(common.MESSAGE.title.warn, data.message);
                    }
                }).error(function () {
                    common.utility.loadingHide();
                    common.utility.alert(common.MESSAGE.title.error, common.MESSAGE.network_error);
                });
            };
            // 删除所有社保图片
            var _deleteAllInsurance = function () {
                var type = '';
                for (var i = 0; i < 9; i++) {
                    if (typeArray[i].isValue == true) {
                        type += ',' + typeArray[i].type;
                    }
                }
                type = type.substr(1);
                $http({
                    url: common.API['v2.0'].delete_user_pic,
                    method: 'POST',
                    data: {
                        uid: userInfo.uid,
                        token: userInfo.token,
                        type: type
                    }
                }).success(function (data) {
                    if (data.status !== 200) {
                        common.utility.alert(common.MESSAGE.title.warn, data.message);
                    }
                }).error(function () {
                    common.utility.alert(common.MESSAGE.title.error, common.MESSAGE.network_error);
                });
            };
            //判断是否有正在上传的社保图片
            var _checkUplading = function () {
                var pass = true;
                for (var i = 0, len = uploadArray.length; i < len; i++) {
                    if (uploadArray[i]) {
                        pass = false;
                    }
                }
                return !pass;
            };
            // 提交社保图片
            $scope.submit = function () {
                if (_checkUplading()) {
                    common.utility.alert(common.MESSAGE.title.hint, common.MESSAGE.insuranceInfo.picture_upload);
                } else {
                    $scope.isback = true;
                    $location.path('/loan/apply');
                    common.utility.alert(common.MESSAGE.title.hint, common.MESSAGE.insuranceInfo.info_full);
                    _cleanTempData();
                }
            };
            // 清除缓存
            var _cleanTempData = function () {
                common.tempData.user_info.userInfo = common.tempData.user_info.infoRefund = common.tempData.user_info.errorInfo = common.tempData.user_info.picInfo = common.tempData.user_info.companyAddress = common.tempData.user_info.homeAddress = '';
                common.tempData.assetPictures = [];
            };
        }
    ])

    .controller('LoanlistCtrl', ['$scope', '$http', '$location', 'Common', '$rootScope', function ($scope, $http, $location, common, $rootScope) {
        $rootScope.customConfig = common.CUSTOM_CONFIG.loanlist;

        $scope.loanlistModel = {
            empty: false,
            list: [],
            loanProgress: false,
            loanOKNotPay: false
        };

        if (common.utility.checkLogin()) {
            var userInfo = common.utility.cookieStore.get('uinfo');
        } else {
            $location.path('/user/login/from/loan_list');
        }

        function _getLoanlist() {
            var promise = $http({
                method: 'POST',
                url: common.API.get_orderlist,
                data: {
                    'uid': userInfo.uid,
                    'token': userInfo.token,
                    'status': '[0, 1, 2, 3, 4, 5, 6]'
                }
            });
            promise.success(function (data) {
                if (data.status === 200) {
                    $scope.loanlistModel.empty = false;
                    $scope.loanlistModel.list = data.data;
                    for (var i = 0, len = $scope.loanlistModel.list.length; i < len; i++) {
                        if ($scope.loanlistModel.list[i].status === 0) {
                            $scope.loanlistModel.loanProgress = true;
                        } else if ($scope.loanlistModel.list[i].status === 1 || $scope.loanlistModel.list[i].status === 2) {
                            $scope.loanlistModel.loanOKNotPay = true;
                        }
                    }
                } else {
                    $scope.loanlistModel.empty = true;
                }
            });
            promise.error(function () {
                common.utility.alert(common.MESSAGE.title.error, common.MESSAGE.network_error);
            });
        }

        _getLoanlist();

        $scope.handleLoanInfo = function (status) {
            var result = {
                text: '',
                className: ''
            };

            if (status === 1 || status === 2 || status === 3) {
                result.text = '审核成功';
                result.className = 'loan-success';
            } else if (status === 0) {
                result.text = '审核中';
                result.className = 'loan-progress';
            } else {
                result.text = '审核失败';
                result.className = 'loan-fail';
            }
            return result;
        };

        $scope.checkLoanInfo = function (item) {
            // 判断订单版本
            if (item.order_version == 2) {
                common.tempData.loan_data = {
                    shortLoan: (Number(item.loan_info.amount) < 2000), //是否为短期周转
                    credit: item.loan_info.amount, //借款金额
                    time: (new Date()).format('yyyy-MM-dd'), //借款时间
                    interest: item.loan_info.interest, //手续费
                    realLoan: (item.loan_info.amount - item.loan_info.interest).toFixed(2), //实际到账金额
                    period: item.loan_info.periods,
                    span: item.loan_info.span
                };
                common.utility.loadingShow();
                $http({
                    method: 'post',
                    url: common.API['v2.0'].put_credit,
                    data: {
                        uid: userInfo.uid,
                        token: userInfo.token,
                        devicetype: common.utility.getDeviceInfo().deviceCode,
                        credit: item.loan_info.amount,
                        periods: item.loan_info.periods,
                        span: item.loan_info.span,
                        version: '2.0',
                        info: ''
                    }
                }).success(function (data) {
                    common.utility.loadingHide();
                    if (data && data.status === 200) {
                        common.utility.alert('成功', data.message).then(function (res) {
                            _getLoanlist();
                        });
                    } else if (data.status === 211) {
                        common.utility.alert('提示', data.message).then(function (res) {
                            // 判断是否是短期周转（是）
                            if (Number(item.price) < 2000) {
                                common.tempData.viewOrder[0] = '1';
                                common.tempData.viewOrder[1] = '0';
                                common.tempData.viewOrder[2] = '0';
                                // 跳转基础资料页面
                                $location.path('/period/userinfo');
                            } else {
                                if (data.data.needUserInfo) {
                                    common.tempData.viewOrder[0] = '1';         // 需要填写基础资料
                                } else {
                                    common.tempData.viewOrder[0] = '0';         // 不需要填写基础资料
                                }

                                if (data.data.needBankBill) {
                                    common.tempData.viewOrder[1] = '1';         // 需要填写银行流水
                                } else {
                                    common.tempData.viewOrder[1] = '0';         // 不需要填写银行流水
                                }

                                if (data.data.needSocialSecurity) {
                                    common.tempData.viewOrder[2] = '1';         // 需要填写社保图片
                                } else {
                                    common.tempData.viewOrder[2] = '0';         // 不需要填写社保图片
                                }

                                var viewOrder = common.tempData.viewOrder;
                                if (viewOrder[0] === '1' && viewOrder[1] === '1') {
                                    $location.path('/stage/userinfo');
                                } else if (viewOrder[0] === '1' && viewOrder[1] === '0') {
                                    $location.path('/period/userinfo');
                                } else if (viewOrder[0] === '0' && viewOrder[1] === '1' && viewOrder[2] === '1') {
                                    $location.path('/period/assetinfo');
                                } else if (viewOrder[0] === '0' && viewOrder[1] === '1' && viewOrder[2] === '0') {
                                    $location.path('/stage/assetinfo');
                                } else if (viewOrder[0] === '0' && viewOrder[1] === '0' && viewOrder[2] === '1') {
                                    $location.path('/stage/insurance');
                                }


                                //// 判断是否需要填基础资料（需要）
                                //if (data.data.needUserInfo) {
                                //    // 判断是否需要填银行流水
                                //    $location.path(data.data.needBankBill ? '/stage/userinfo' : '/period/userinfo');
                                //} else {
                                //    if (data.data.needSocialSecurity) {
                                //        // 不需要基础资料和银行流水,直接填写社保图片
                                //        $location.path('/stage/insurance');
                                //    } else {
                                //        // 不需要基础资料,直接补填银行流水,不需要社保图片
                                //        $location.path('/stage/assetinfo');
                                //    }
                                //}
                            }
                        });
                    } else {
                        common.utility.alert('提示', data.message);
                    }
                }).error(function (data) {
                    common.utility.alert(angular.toJson(data));
                });
            } else {
                common.utility.alert(common.MESSAGE.title.hint, common.MESSAGE.loanlist.unsupported_order);
            }
        }
    }])

    .controller('LoanApplyCtrl', ['$scope', '$http', 'Common', '$location', '$rootScope', function ($scope, $http, common, $location, $rootScope) {
        var repayment = [],
            i = 0,
            userInfo = common.utility.cookieStore.get('uinfo'),
            loanData = common.tempData.loan_data,
            loanTime = new Date(loanData.time), monthRepayment;

        $rootScope.customConfig = common.CUSTOM_CONFIG.user;
        $scope.applyData = loanData;
        $scope.applyModel = {agree: false};

        if (loanData.credit) {
            if (loanData.shortLoan) {
                repayment.push({
                    credit: loanData.credit + loanData.interest,
                    time: new Date(loanTime.setDate(loanTime.getDate() + loanData.span)).format('yyyy-MM-dd')
                });
            } else {
                monthRepayment = ((loanData.credit + loanData.interest) / loanData.period).toFixed(2);
                for (i = 0; i < loanData.period; i++) {
                    repayment.push({
                        credit: monthRepayment,
                        time: new Date(loanTime.setDate(loanTime.getDate() + 30)).format('yyyy-MM-dd')
                    });
                }
                repayment[repayment.length - 1].credit = (loanData.credit + loanData.interest - monthRepayment * (loanData.period - 1)).toFixed(2);
            }
            $scope.repaymentData = repayment;
        } else {
            $location.path('/home');
        }

        $scope.apply = function () {
            if ($scope.applyModel.agree) {
                if (userInfo) {
                    common.utility.loadingShow();
                    $http({
                        method: 'post',
                        url: common.API['v2.0'].put_credit,
                        data: {
                            uid: userInfo.uid,
                            token: userInfo.token,
                            devicetype: common.utility.getDeviceInfo().deviceCode,
                            credit: loanData.credit,
                            periods: loanData.period,
                            span: loanData.span,
                            version: '2.0',
                            info: ''
                        }
                    }).success(function (data) {
                        common.utility.loadingHide();
                        if (data && data.status === 200) {
                            var client = common.utility.getDeviceInfo().deviceType;
                            var strategyInfo = {
                                strategy: '',
                                docs: data.data.orderid
                            };

                            $http({
                                method: 'GET',
                                url: common.API.get_location_mode + '?client=' + client
                            }).success(function (data) {
                                if (data.status === 200) {
                                    var strategyDatas = data.data;
                                    for (var i = 0, len = strategyDatas.length; i < len; i++) {
                                        if (strategyDatas[i].code === 'position_env') {
                                            var eventDatas = strategyDatas[i].sub;
                                            for (var j = 0, length = eventDatas.length; j < length; j++) {
                                                if (eventDatas[j].code === client && eventDatas[j].cname === '下单位置') {
                                                    strategyInfo.strategy = eventDatas[j].mode_id;
                                                }
                                            }
                                        }
                                    }

                                    Location.postLocationStrategy(function (value) {

                                    }, function (value) {

                                    }, strategyInfo);
                                }
                            }).error(function () {
                                common.utility.alert(common.MESSAGE.title.hint, common.MESSAGE.network_error);
                            });

                            common.utility.alert('成功', data.message).then(function (res) {
                                $location.path('/loan/list');
                            });
                        } else if (data.status === 211) {
                            common.utility.alert('提示', data.message).then(function (res) {
                                // 判断是否是短期周转（是）
                                if ($scope.applyData.shortLoan) {
                                    common.tempData.viewOrder[0] = '1';
                                    common.tempData.viewOrder[1] = '0';
                                    common.tempData.viewOrder[2] = '0';
                                    // 跳转基础资料页面
                                    $location.path('/period/userinfo');
                                } else {
                                    if (data.data.needUserInfo) {
                                        common.tempData.viewOrder[0] = '1';         // 需要填写基础资料
                                    } else {
                                        common.tempData.viewOrder[0] = '0';         // 不需要填写基础资料
                                    }

                                    if (data.data.needBankBill) {
                                        common.tempData.viewOrder[1] = '1';         // 需要填写银行流水
                                    } else {
                                        common.tempData.viewOrder[1] = '0';         // 不需要填写银行流水
                                    }

                                    if (data.data.needSocialSecurity) {
                                        common.tempData.viewOrder[2] = '1';         // 需要填写社保图片
                                    } else {
                                        common.tempData.viewOrder[2] = '0';         // 不需要填写社保图片
                                    }

                                    var viewOrder = common.tempData.viewOrder;
                                    if (viewOrder[0] === '1' && viewOrder[1] === '1') {
                                        $location.path('/stage/userinfo');
                                    } else if (viewOrder[0] === '1' && viewOrder[1] === '0') {
                                        $location.path('/period/userinfo');
                                    } else if (viewOrder[0] === '0' && viewOrder[1] === '1' && viewOrder[2] === '1') {
                                        $location.path('/period/assetinfo');
                                    } else if (viewOrder[0] === '0' && viewOrder[1] === '1' && viewOrder[2] === '0') {
                                        $location.path('/stage/assetinfo');
                                    } else if (viewOrder[0] === '0' && viewOrder[1] === '0' && viewOrder[2] === '1') {
                                        $location.path('/stage/insurance');
                                    }
                                }
                            });
                        } else {
                            common.utility.alert('提示', data.message);
                        }
                    }).error(function (data) {
                        common.utility.alert(angular.toJson(data));
                    });
                } else {
                    $location.path('/user/login/from/loan_apply');
                }
            } else {
                common.utility.alert('提示', '请同意借款协议');
            }
        };

        $scope.showAgreement = function () {
            $location.path('/agreement/loan');
        };
    }])

    .controller('QuestionListCtrl', ['$scope', '$rootScope', '$http', 'Common', function ($scope, $rootScope, $http, common) {
        $rootScope.customConfig = common.CUSTOM_CONFIG.question;
        $scope.questionModel = {
            lists: {}
        };
        var promise = $http({
            method: 'GET',
            url: common.API.get_questions
        });
        promise.success(function (data) {
            if (data.status === 200) {
                $scope.questionModel.lists = data.data;
            }
        });
        promise.error(function () {
            common.utility.alert(common.MESSAGE.title.error, common.MESSAGE.network_error);
        });
    }])

    .controller('ForgetCtrl', ['$scope', '$rootScope', '$http', '$location', '$timeout', 'Common', function ($scope, $rootScope, $http, $location, $timeout, common) {
        $rootScope.customConfig = common.CUSTOM_CONFIG.forget;

        if (common.utility.checkLogin()) {
            var userInfo = common.utility.cookieStore.get('uinfo'),
                phone = userInfo.phone;
        }

        $scope.forgetModel = {
            phone: phone || '',
            captcha: '',
            password: ''
        };

        $scope.countdownModel = {
            counter: 60,
            text: '发送验证码',
            disabled: false
        };

        $scope.buttonModel = {
            text: '提交',
            load: false
        };

        function _onTimeout() {
            $scope.countdownModel.counter--;
            if ($scope.countdownModel.counter > 0) {
                $scope.countdownModel.disabled = true;
                $scope.countdownModel.text = '获取验证码(' + $scope.countdownModel.counter + ')';
                var mytimeout = $timeout(_onTimeout, 1000);
            } else {
                $scope.countdownModel = {
                    counter: 60,
                    text: '发送验证码',
                    disabled: false
                };
                $timeout.cancel(mytimeout);
            }
        }

        $scope.getSmsCode = function () {
            var promise = $http({
                method: 'POST',
                url: common.API.find_password_code,
                data: {
                    phone: $scope.forgetModel.phone
                }
            });
            promise.success(function (data) {
                if (data.status === 200) {
                    common.utility.alert(common.MESSAGE.title.hint, data.message);
                    $scope.countdownModel.disabled = true;
                    $timeout(_onTimeout, 1000);
                } else {
                    common.utility.alert(common.MESSAGE.title.hint, data.message);
                }
            });
            promise.error(function () {
                common.utility.alert(common.MESSAGE.title.error, common.MESSAGE.network_error);
            });
        };

        $scope.checkForm = function () {
            var phone = $scope.forgetModel.phone,
                password = $scope.forgetModel.password;
            if (!common.utility.check_phone(phone)) {
                common.utility.alert(common.MESSAGE.title.warn, common.MESSAGE.forget.invalid_phone);
            } else if (!common.utility.check_password(password)) {
                common.utility.alert(common.MESSAGE.title.hint, common.MESSAGE.forget.invalid_password);
            } else if (!$scope.forgetModel.captcha) {
                common.utility.alert(common.MESSAGE.title.hint, common.MESSAGE.forget.invalid_captcha);
            } else {
                common.utility.loadingShow();
                _forget();
            }
        };

        function _forget() {
            $http({
                method: 'POST',
                url: common.API.find_password,
                data: {
                    phone: $scope.forgetModel.phone,
                    code: $scope.forgetModel.captcha,
                    password: $scope.forgetModel.password
                }
            }).success(function (data) {
                common.utility.loadingHide();
                if (data.status === 200) {
                    common.utility.alert(common.MESSAGE.title.hint, data.message);
                    if (userInfo) {
                        $location.path('/user');
                    } else {
                        $location.path('/user/login');
                    }
                } else {
                    common.utility.alert(common.MESSAGE.title.hint, data.message);
                }
            }).error(function () {
                common.utility.loadingHide();
                common.utility.alert(common.MESSAGE.title.error, common.MESSAGE.network_error);
            });
        }
    }])

    .controller('UpdateCtrl', ['$scope', '$rootScope', '$http', '$location', '$timeout', 'Common', function ($scope, $rootScope, $http, $location, $timeout, common) {
        $rootScope.customConfig = common.CUSTOM_CONFIG.update;

        if (common.utility.checkLogin()) {
            var userInfo = common.utility.cookieStore.get('uinfo'),
                oldPhone = userInfo.phone;
        } else {
            $location.path('/user/login/from/update');
        }

        $scope.updateModel = {
            oldPhone: oldPhone,
            newPhone: '',
            oldCaptcha: '',
            newCaptcha: '',
            type: ''
        };

        $scope.buttonModel = {
            text: '提交',
            load: false
        };

        $scope.unbindCountdownModel = {
            counter: 60,
            text: '发送验证码',
            disabled: false
        };

        $scope.rebindCountdownModel = {
            counter: 60,
            text: '发送验证码',
            disabled: false
        };

        $scope.onUnbindTimeout = function () {
            $scope.unbindCountdownModel.counter--;
            if ($scope.unbindCountdownModel.counter > 0) {
                $scope.unbindCountdownModel.disabled = true;
                $scope.unbindCountdownModel.text = '获取验证码(' + $scope.unbindCountdownModel.counter + ')';
                var mytimeout = $timeout($scope.onUnbindTimeout, 1000);
            } else {
                $scope.unbindCountdownModel = {
                    counter: 60,
                    text: '发送验证码',
                    disabled: false
                };
                $timeout.cancel(mytimeout);
            }
        };

        $scope.onRebindTimeout = function () {
            $scope.rebindCountdownModel.counter--;
            if ($scope.rebindCountdownModel.counter > 0) {
                $scope.rebindCountdownModel.disabled = true;
                $scope.rebindCountdownModel.text = '获取验证码(' + $scope.rebindCountdownModel.counter + ')';
                var mytimeout = $timeout($scope.onRebindTimeout, 1000);
            } else {
                $scope.rebindCountdownModel = {
                    counter: 60,
                    text: '发送验证码',
                    disabled: false
                };
                $timeout.cancel(mytimeout);
            }
        };

        $scope.getSmsCode = function (type) {
            var url = '',
                data = {
                    uid: userInfo.uid,
                    token: userInfo.token
                };
            if (type === 'unbind') {
                url = common.API.get_unbind_code;
                _getCode();
            } else {
                if (!$scope.updateModel.newPhone.trim()) {
                    common.utility.alert(common.MESSAGE.title.hint, common.MESSAGE.update.empty_phone);
                } else if (!common.utility.check_phone($scope.updateModel.newPhone)) {
                    common.utility.alert(common.MESSAGE.title.hint, common.MESSAGE.update.invalid_phone);
                } else {
                    url = common.API.get_rebind_code;
                    data.phone = $scope.updateModel.newPhone;
                    _getCode();
                }
            }

            function _getCode() {
                var promise = $http({
                    method: 'POST',
                    url: url,
                    data: data
                });
                promise.success(function (data) {
                    if (data.status === 200) {
                        common.utility.alert(common.MESSAGE.title.hint, data.message);
                        if (type === 'unbind') {
                            $scope.unbindCountdownModel.disabled = true;
                            var mytimeout = $timeout($scope.onUnbindTimeout, 1000);
                        } else {
                            $scope.rebindCountdownModel.disabled = true;
                            var mytimeout = $timeout($scope.onRebindTimeout, 1000);
                        }
                    } else {
                        common.utility.alert(common.MESSAGE.title.hint, data.message);
                    }
                });
                promise.error(function (err) {
                    common.utility.alert(common.MESSAGE.title.error, common.MESSAGE.network_error);
                });
            }
        };

        $scope.checkForm = function () {
            var newphone = $scope.updateModel.newPhone,
                oldCaptcha = $scope.updateModel.oldCaptcha.trim(),
                newCaptcha = $scope.updateModel.newCaptcha.trim();
            if (!common.utility.check_phone(newphone)) {
                common.utility.alert(common.MESSAGE.title.warn, common.MESSAGE.update.invalid_phone);
            } else if (!oldCaptcha) {
                common.utility.alert(common.MESSAGE.title.hint, common.MESSAGE.update.empty_unbind_code);
            } else if (!newCaptcha) {
                common.utility.alert(common.MESSAGE.title.hint, common.MESSAGE.update.empty_rebind_code);
            } else {
                common.utility.loadingShow();
                _update();
            }
        };

        function _update() {
            var promise = $http({
                method: 'POST',
                url: common.API.rebind_phone,
                data: {
                    uid: userInfo.uid,
                    token: userInfo.token,
                    phone: $scope.updateModel.newPhone,
                    unbind_code: $scope.updateModel.oldCaptcha,
                    rebind_code: $scope.updateModel.newCaptcha
                }
            });
            promise.success(function (data) {
                common.utility.loadingHide();
                if (data.status === 200) {
                    var newUserInfo = {
                        uid: userInfo.uid,
                        token: userInfo.token,
                        phone: $scope.updateModel.newPhone
                    };
                    common.utility.cookieStore.put('uinfo', newUserInfo);
                    common.utility.alert(common.MESSAGE.title.hint, data.message);
                    $location.path('/home');
                } else {
                    common.utility.alert(common.MESSAGE.title.hint, data.message);
                }
            });
            promise.error(function () {
                common.utility.loadingHide();
                common.utility.alert(common.MESSAGE.title.error, common.MESSAGE.network_error);
            })
        }
    }])

    .controller('AboutCtrl', ['$scope', '$rootScope', '$window', 'Common', function ($scope, $rootScope, $window, common) {
        $rootScope.customConfig = common.CUSTOM_CONFIG.about;

        $scope.aboutModel = {
            version: ''
        };

        var deviceType = common.utility.getDeviceInfo().deviceType;

        if (deviceType === 'android') {
            var appVersion = common.utility.getAppVersion();
            $scope.aboutModel.version = appVersion;
        }

        $scope.reviewApp = function() {
            var deviceType = common.utility.getDeviceInfo().deviceType;
            console.log(deviceType);
            if (deviceType === 'ios') {
                var iosUrl = 'https://itunes.apple.com/us/app/guo-zhong-bao/id1012264699?mt=8';
                console.log(iosUrl);
                $window.location.href = iosUrl;
            } else if (deviceType === 'android') {
                // TODO
            }
        };
    }])

    .controller('FeedbackCtrl', ['$scope', '$rootScope', '$http', '$location', 'Common', function ($scope, $rootScope, $http, $location, common) {
        $rootScope.customConfig = common.CUSTOM_CONFIG.feedback;

        if (common.utility.checkLogin()) {
            var userInfo = common.utility.cookieStore.get('uinfo');
        } else {
            $location.path('/user/login/from/feedback');
        }

        $scope.feedbackModel = {
            text: ''
        };

        $scope.buttonModel = {
            text: '提交',
            load: false
        };

        function _toggleButtonModel(load) {
            if (load) {
                $scope.buttonModel = {
                    text: '提交...',
                    load: true
                };
            } else {
                $scope.buttonModel = {
                    text: '提交',
                    load: false
                };
            }
        }

        $scope.checkForm = function () {
            if (!$scope.feedbackModel.text.trim()) {
                common.utility.alert(common.MESSAGE.title.hint, common.MESSAGE.feedback.empty_text);
            } else {
                _toggleButtonModel(true);
                _feedback();
            }
        };

        function _feedback() {
            var deviceCode = common.utility.getDeviceInfo().deviceCode,
                appVersion = common.utility.getAppVersion();
            var promise = $http({
                method: 'POST',
                url: common.API.feedback,
                data: {
                    uid: userInfo.uid,
                    token: userInfo.token,
                    info: $scope.feedbackModel.text,
                    devicetype: deviceCode,
                    version: appVersion
                }
            });
            promise.success(function (data) {
                _toggleButtonModel(false);
                if (data.status === 200) {
                    common.utility.alert(common.MESSAGE.title.hint, data.message);
                    $location.path('/home');
                } else {
                    common.utility.alert(common.MESSAGE.title.hint, data.message);
                }
            });
            promise.error(function () {
                _toggleButtonModel(false);
                common.utility.alert(common.MESSAGE.title.error, common.MESSAGE.network_error);
            });
        }
    }])

    .controller('WalletCtrl', ['$scope', '$rootScope', '$location', '$http', 'Common', function ($scope, $rootScope, $location, $http, common) {
        $rootScope.customConfig = common.CUSTOM_CONFIG.wallet;
        var userInfo = common.utility.checkLogin();
        if (!userInfo) {
            $location.path('/user/login/from/wallet');
        }

        $scope.walletModel = {
            cash: '',
            couponList: []
        };

        function _getWalletInfo() {
            var promise = $http({
                method: 'POST',
                url: common.API['v2.0'].get_wallet_info,
                data: {
                    uid: userInfo.uid,
                    token: userInfo.token
                }
            });
            promise.success(function (data) {
                if (data.status === 200) {
                    $scope.walletModel.cash = data.data.restcash;
                    $scope.walletModel.couponList = data.data.couponlist;
                } else {
                    common.utility.alert(common.MESSAGE.title.hint, data.message);
                }
            });
            promise.error(function () {
                common.utility.alert(common.MESSAGE.title.error, common.MESSAGE.network_error);
            })
        }

        _getWalletInfo();
    }])

    .controller('AccountCtrl', ['$scope', '$location', '$rootScope', '$http', 'Common', function ($scope, $location, $rootScope, $http, common) {
        $rootScope.customConfig = common.CUSTOM_CONFIG.account;

        if (common.utility.checkLogin()) {
            var userInfo = common.utility.cookieStore.get('uinfo');
        } else {
            $location.path('/user/login/from/account');
        }

        $scope.checkUpdate = function () {
            var promise = $http({
                method: 'POST',
                url: common.API.req_change_phone,
                data: {
                    uid: userInfo.uid,
                    token: userInfo.token
                }
            });
            promise.success(function (data) {
                if (data.status === 200) {
                    $location.path('/user/update');
                } else {
                    common.utility.alert(common.MESSAGE.title.hint, data.message);
                }
            });
            promise.error(function () {
                common.utility.alert(common.MESSAGE.title.error, common.MESSAGE.network_error);
            })
        };

        $scope.logout = function () {
            common.utility.cookieStore.remove('uinfo');
            Location.stopLocationService(function (value) {
                UserInfo.del(function (value) {
                }, function (value) {
                });
            }, function (value) {

            });
            // 清空缓存
            for (var k in common.tempData) {
                if (common.tempData[k]) {
                    if (k == 'user_info') {
                        for (var u in common.tempData.user_info) {
                            common.tempData.user_info[u] = '';
                        }
                    } else {
                        common.tempData[k] = {};
                    }
                }
                if (k === "first_complate") {
                    common.tempData.first_complate = false;
                }
            }
            $location.path('/user/login');
        }
    }])

    .controller('ActivityCtrl', ['$scope', '$location', '$rootScope', 'Common', function($scope, $location, $rootScope, common) {
        var sourceObj = $location.search();
        $rootScope.customConfig = common.CUSTOM_CONFIG.activity;
        if (sourceObj && sourceObj.from && sourceObj.title) {
            $scope.activityModel = sourceObj;
        }

        var userInfo = common.utility.checkLogin();
        if (userInfo) {
            $scope.activityModel.uid = userInfo.uid;
            $scope.activityModel.token = userInfo.token;
        }
    }])
;
