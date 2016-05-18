/**
 * Created by 00 on 2015/7/14.
 */
App.controller('home', function (page) {

    //验证登入
    function getCookie(name) {
        var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");

        if (arr = document.cookie.match(reg)) {
            return unescape(arr[2]);

        } else {
            return null;
        }
    }

    if (!getCookie('uinfo')) {
        location.href = config.API.redpacket_login_url;
    }

    //init
    getRedPacket();

    getRegisterSuccess();

    // 注册成功跳至 wechat.html，显示 modal layer
    function getRegisterSuccess() {
        var registerSuccess = config.FUNC.getUserInfo().registerSuccessFlag;
        if (registerSuccess === 'true') {
            showRegisterModal();
        }
    }

    //获取红包列表信息
    function getRedPacket(callback) {
        config.FUNC.loadingShow();
        $.ajax({
            type: 'POST',
            url: config.API.get_red_packet,
            data: config.FUNC.getUserInfo(),
            success: function (data) {
                config.FUNC.loadingHide();
                if (data.status == 200) {
                    updateRed(data.data);
                    if (callback) {
                        callback();
                    }
                } else if (data.status == 600) {
                    reLogin();
                } else {
                    config.FUNC.alert('警告', data.message);
                }
            },
            error: function () {
                config.FUNC.loadingHide();
                config.FUNC.alert('警告', config.MESSAGE.net_error, getRedPacket);
            }
        });
    }

    //兑换码请求
    function putCode(code, callback) {
        var _data = {};
        _data.uid = config.FUNC.getUserInfo().uid;
        _data.token = config.FUNC.getUserInfo().token;
        _data.exchange_code = code;
        $.ajax({
            type: 'POST',
            url: config.API.put_code,
            data: _data,
            success: function (data) {
                if (data.status == 200) {
                    getRedPacket();
                    callback();
                } else {
                    $(".red-modal-money-error").text(data.message);
                }
            },
            error: function () {
                callback();
                config.FUNC.alert('警告', config.MESSAGE.net_error, putCode(code, callback));
            }
        });
    }

    //提现请求
    function getMoney(callback) {
        $.ajax({
            type: 'POST',
            url: config.API.get_money,
            data: config.FUNC.getUserInfo(),
            success: function (data) {
                if (data.status == 200) {
                    getRedPacket(callback);
                } else {
                    config.FUNC.alert('警告', data.message);
                }
            },
            error: function () {
                config.FUNC.alert('警告', config.MESSAGE.net_error, getMoney);
            }
        });
    }


    //分享判断
    function checkoutStatus() {
        config.FUNC.loadingShow();
        $.ajax({
            type: "POST",
            url: config.API.is_share,
            data: {
                uid: config.FUNC.getUserInfo().uid,
                token: config.FUNC.getUserInfo().token
            }, success: function (data) {
                config.FUNC.loadingHide();
                if (data.status == 200) {
                    if (data.data.can_you_share) {
                        location.href = config.API.share_url + '&code=' + data.data.share_code + '&popflag=true';
                    } else {
                        config.FUNC.alert('警告', config.MESSAGE.activity_end);
                    }
                } else {
                    config.FUNC.alert('警告', data.message);
                }
            }, error: function (data) {
                config.FUNC.loadingHide();
                config.FUNC.alert('警告', config.MESSAGE.net_error, checkoutStatus);
            }
        });
    }

    //更新红包页面资料
    function updateRed(data) {
        //记录填写资料状态
        config.TEMP.withdraw_info_status = data.withdraw_info_status;
        if (data.withdraw_info_status == 2) {
            config.TEMP.userData = data.withdraw_info;
        }
        config.TEMP.withdraw_recode = data.withdraw_recode;
        config.TEMP.red_href = location.href;
        //更新提现记录
        if (data.withdraw_recode) {
            var _times = data.withdraw_recode.updated_at;
            var _getMoneyStatus;
            if (data.withdraw_recode.status == 0 || data.withdraw_recode.status == 3) {
                _getMoneyStatus = "申请提款中";
            } else if (data.withdraw_recode.status == 1) {
                _getMoneyStatus = "申请提款成功";
            } else if (data.withdraw_recode.status == 2) {
                _getMoneyStatus = "申请提款失败";
            } else {
                _getMoneyStatus = "申请提款失败2";
            }
            $(page).find('#red-list').html('<ul class="red-list"><li class="col-40"><span class="title-red">' + _times.substring(0, 4) + '</span>年<span class="title-red">' + _times.substring(5, 7) + '</span>月<span class="title-red">' + _times.substring(8, 10) + '</span>号</li><li class="col-25 left"><span class="title-red">' + data.withdraw_recode.amount + '</span>元</li><li class="col-10"></li> <li class="col-25 right"><span class="title-red">' + _getMoneyStatus + '</span></li></ul>');
        }

        //更新红包未提现额度
        $(page).find('.red-title-red').text(data.amount_unwithdraw);

        if (data.is_blue_angel) {
            //更新验证码
            $(page).find('.red-my-code').text(data.blue_code);
            config.TEMP.code = data.blue_code;

            //更新推广红包额度
            $(page).find('.red-my-info span').text(data.amount_promotion);

        } else {
            $(page).find('#red-body').css({
                'visibility': 'hidden'
            });
        }

        if (config.TEMP.isRed == 1) {
            config.TEMP.isRed = 0;
            getMoney(function () {
                GetMoneySuccess()
            });
        }

        if (config.FUNC.getUserInfo().fromBlueAngel && !config.TEMP.isWithdraw) {
            $('.backdrop').show();
            $('.red-blue-share').show();
            var money = config.FUNC.getUserInfo().amount;
            (Number(money) < 10) ?
                $('#blue-money').css('left', '10.1rem').text(money) :
                $('#blue-money').css('left', '9.1rem').text(money);
        }
    }

    function reLogin() {
        location.href = config.API.re_login
    }

    //输入兑换码
    $(page).find('.get-code').on('click', function () {
        $(".red-modal-money-input input").val('');
        $(".red-modal-money-error").text('');

        $('.backdrop').show();
        $('.red-modal-money').show();
    });

    $(".red-modal-money-btn-sure").on('click', function () {
        var _inputData = $(".red-modal-money-input input").val();
        putCode(_inputData, hideCode);
    });

    $(".red-modal-money-btn-cancel").on('click', function () {
        hideCode();
    });

    //分享处理
    $(page).find('.red-share-all-btn').on('click', function () {
        checkoutStatus();
    });

    // 提现
    $('.red-blue-share-btn').on('click', function () {
        $('.backdrop').hide();
        $('.red-blue-share').hide();
        if (config.TEMP.withdraw_info_status == 1) {
            getMoney(function () {
                GetMoneySuccess()
            });
        } else if (config.TEMP.withdraw_recode) {
            config.FUNC.alert('提示', '每天只能提现一次!');
        } else {
            if ($(page).find(".red-title-red").text() == "0") {
                config.FUNC.alert('警告', '提现余额不能为0')
            } else {
                App.load('bankset')
            }
        }
    });

    //提现
    $(page).find('.btn-red').on('click', function () {
        App.load('bankset');
        //if (config.TEMP.withdraw_info_status == 1) {
        //    getMoney(function () {
        //        GetMoneySuccess()
        //    });
        //} else if (config.TEMP.withdraw_recode) {
        //    config.FUNC.alert('提示', '每天只能提现一次!');
        //} else {
        //    if ($(page).find(".red-title-red").text() == "0") {
        //        config.FUNC.alert('警告', '提现余额不能为0')
        //    } else {
        //        App.load('bankset');
        //    }
        //}
    });

    //关闭提现成功弹层
    $(".red-modal-share-close").on('click', function () {
        hideGetMoneySuccess();
    });

    //关闭领取现金弹层
    $(".suzhou-register-content").on('click', function () {
        hideRegisterModal();
        changeUrl();
    });

    function changeUrl() {
        if (history.pushState) {
            var newUrl = '',
                flagPosition = window.location.search.indexOf('&registerSuccessFlag');
            if (flagPosition > -1) {
                newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + window.location.search.substring(0, flagPosition);
            } else {
                newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + window.location.search;
            }
            console.log(newUrl);
            window.history.pushState({path: newUrl}, '', newUrl);
        }
    }

    //提现成功后调用app分享
    $(".red-modal-share-btn").on("click", function () {
        hideGetMoneySuccess();
        checkoutStatus();
    });

    //返回按钮
    $(page).find("#Back").on('click', function () {
        location.href = config.API.home_url;
    });

    function hideCode() {
        $('.red-modal-money').hide();
        $('.backdrop').hide();
    }

    function GetMoneySuccess() {
        $(".red-modal-share").show();
        $('.backdrop').show();
    }

    function hideGetMoneySuccess() {
        $(".red-modal-share").hide();
        $('.backdrop').hide();
        $('.red-blue-share').hide();
    }

    function showRegisterModal() {
        $(".suzhou-register-modal").show();
        $('.suzhou-register-overlay').css('display', 'block');
    }

    function hideRegisterModal() {
        $(".suzhou-register-modal").hide();
        $('.suzhou-register-overlay').hide();
    }

});

App.controller('bankset', function (page) {
    var bankList = $(page).find('#bank_list');
    var bankItem = $(page).find('#bank_list option');

    $(page).find('#back_btn').on('click', function () {
        location.href = config.TEMP.red_href;
    });

    //init
    getBankList();

    function getBankList() {
        config.FUNC.loadingShow();
        $.ajax({
            type: 'GET',
            url: config.API.get_support_bank,
            dataType: 'json',
            async: false,
            success: function (data) {
                config.FUNC.loadingHide();
                if (data.status === 200) {
                    _fillBankInfo(data.data);
                }
            },
            error: function (data) {
                config.FUNC.loadingHide();
            }
        });
    }

    function _fillBankInfo(bankData) {
        for (var i = 0, len = bankData.length; i < len; i++) {
            var cloneNode = bankItem.clone();
            cloneNode.text(bankData[i].name).val(bankData[i].id);
            bankList.append(cloneNode);
        }
        bankList.children().first().attr('selected', true).val('-1').hide();
        bankList.on('change', function () {
            if ($(this).val() === '-1') {
                $(this).addClass('empty-select');
            } else {
                $(this).removeClass('empty-select');
            }
        });
        bankList.trigger('change');
    }

    var button = $(page).find('.control-button');
    button.on('click', function () {
        _validateForm();
    });

    function _validateForm() {
        var name = $(page).find('#name');
        var identity = $(page).find('#identity');
        var accountType = $(page).find('#bank_list');
        var account = $(page).find('#account');
        var company = $(page).find("#companyName");
        var tel = $(page).find("#company_number");
        var address_com = $(page).find("#compayAddress");
        var address_home = $(page).find("#homeAddress");
        if (!name.val()) {
            config.FUNC.alert('警告', '请输入姓名');
        } else if (!identity.val()) {
            config.FUNC.alert('警告', '请输入身份证号');
        } else if (!accountType.val()) {
            config.FUNC.alert('警告', '请选择银行');
        } else if (!account.val()) {
            config.FUNC.alert('警告', '请输入银行卡号');
        } else if (!company.val()) {
            config.FUNC.alert('警告', '请输入公司名称');
        } else if (!tel.val()) {
            config.FUNC.alert('警告', '请输入公司固话');
        } else if (!address_com.val()) {
            config.FUNC.alert('警告', '请输入公司地址');
        } else if (!address_home.val()) {
            config.FUNC.alert('警告', '请输入现居地址');
        } else {
            var withDrawParams = {
                uid: config.FUNC.getUserInfo().uid,
                token: config.FUNC.getUserInfo().token,
                truename: name.val(),
                identity: identity.val(),
                account_type: accountType.val(),
                account: account.val(),
                company: company.val(),
                tel: tel.val(),
                area_id: config.TEMP.company_cid,
                home_area_id: config.TEMP.home_cid,
                address_com: address_com.val(),
                address_home: address_home.val()
            };
            _saveWithdrawInfo(withDrawParams)
        }
    }

    function _saveWithdrawInfo(withDrawParams) {
        $.ajax({
            type: 'POST',
            url: config.API.store_withdraw_info,
            data: $.param(withDrawParams),
            async: false,
            success: function (data) {
                if (data.status === 200) {
                    config.TEMP.isRed = config.TEMP.isWithdraw = 1;
                    App.load('home');
                } else {
                    config.FUNC.alert('警告', data.message);
                }
            },
            error: function (data) {
            }
        });
    }

    var initAddress = function () {
        var $companyAddress = $(page).find('#compayAddress'),
            $homeAddress = $(page).find('#homeAddress'),
            $name = $(page).find('#name'),
            $identity = $(page).find('#identity'),
            $bank_list = $(page).find('#bank_list'),
            $account = $(page).find('#account'),
            $companyName = $(page).find('#companyName'),
            $company_number = $(page).find('#company_number');
        if (config.TEMP.company_address) {
            $companyAddress.val(config.TEMP.company_address);
            $companyAddress.parent().find('span').hide();
        } else if (config.TEMP.userData) {
            $companyAddress.val(config.TEMP.userData.address_com);
            $companyAddress.parent().find('span').hide();
        }
        if (config.TEMP.home_address) {
            $homeAddress.val(config.TEMP.home_address);
            $homeAddress.parent().find('span').hide();
        } else if (config.TEMP.userData) {
            $homeAddress.val(config.TEMP.userData.address_home);
            $homeAddress.parent().find('span').hide();
        }
        if (config.TEMP.user_info) {
            $name.val(config.TEMP.user_info.name);
            $identity.val(config.TEMP.user_info.identity);
            $bank_list.val(config.TEMP.user_info.accountType);
            $account.val(config.TEMP.user_info.account);
            $companyName.val(config.TEMP.user_info.company);
            $company_number.val(config.TEMP.user_info.tel);
        } else if (config.TEMP.userData) {
            config.TEMP.home_cid = config.TEMP.userData.home_area_id;
            config.TEMP.company_cid = config.TEMP.userData.area_id;
            $companyAddress.parent().find('span').hide();
            $homeAddress.parent().find('span').hide();
            $name.val(config.TEMP.userData.name);
            $identity.val(config.TEMP.userData.identity);
            $bank_list.val(config.TEMP.userData.type);
            $companyName.val(config.TEMP.userData.company);
            $company_number.val(config.TEMP.userData.tel);
            $account.val(config.TEMP.userData.card);
        }
    }();

    $(page).find('.set-company').on('click', function () {
        savePageInfo();
        config.TEMP.address_type = 0;
        App.load('address');
    });

    $(page).find('.set-home').on('click', function () {
        savePageInfo();
        config.TEMP.address_type = 1;
        App.load('address');
    });

    function savePageInfo() {
        config.TEMP.user_info = {
            name: $(page).find('#name').val(),
            identity: $(page).find('#identity').val(),
            accountType: $(page).find('#bank_list').val(),
            account: $(page).find('#account').val(),
            company: $(page).find("#companyName").val(),
            tel: $(page).find("#company_number").val(),
            address_com: $(page).find("compayAddress").val(),
            address_home: $(page).find("homeAddress").val()
        };
    }
});

App.controller('address', function (page) {
    if (config.TEMP.address_type) {
        if (config.TEMP.home_county) {
            config.TEMP.home_county = config.TEMP.home_county.replace(/null /g, '');
            $(page).find('#county').val(config.TEMP.home_county);
            $(page).find('#county').parent().find('span').hide();
        }
    } else {
        if (config.TEMP.company_county) {
            config.TEMP.company_county = config.TEMP.company_county.replace(/null /g, '');
            $(page).find('#county').val(config.TEMP.company_county);
            $(page).find('#county').parent().find('span').hide();
        }
    }

    $(page).find(".set-address").on("click", function () {
        config.TEMP.company_county = config.TEMP.home_county = '';
        App.load('address-setting');
    });

    $(page).find("#submit").on("click", function () {
        var pass = true;
        if ($('#county').val() == '') {
            pass = false;
            var message = "省市区没有填写";
        } else if ($("#detailed").val() == '') {
            pass = false;
            message = "详细地址没有填写";
        }
        if (pass) {
            if (config.TEMP.address_type) {
                config.TEMP.home_address = config.TEMP.home_county + $(page).find('#detailed').val();
            } else {
                config.TEMP.company_address = config.TEMP.company_county + $(page).find('#detailed').val();
            }
            App.load('bankset');
        } else {
            config.FUNC.alert('提示', message)
        }
    });
});

App.controller('address-setting', function (page) {
    setCounty(0);

    $(page).on('click', function (e) {
        if (e.target.tagName == 'DIV') {
            var cid = $(e.target).attr('data-sign'),
                type = $(e.target).attr('data-type');

            if (config.TEMP.address_type) {
                config.TEMP.home_county += $(e.target).find('.control-label').text() + " ";
            } else {
                config.TEMP.company_county += $(e.target).find('.control-label').text() + " ";
            }

            if (type) {
                if (type < 3) {
                    setCounty(cid);
                    $(page).find(".addressSetting").empty();
                } else {
                    if (config.TEMP.address_type) {
                        config.TEMP.home_cid = cid;
                    } else {
                        config.TEMP.company_cid = cid;
                    }
                    App.load('address');
                }
            }
        } else {
            $(e.target).parent().trigger('click');
        }
    });

    function setCounty(cid) {
        config.FUNC.loadingShow();
        $.ajax({
            type: 'GET',
            url: config.API.area_list,
            data: {cid: cid},
            success: function (data) {
                config.FUNC.loadingHide();
                if (data.status == 200) {
                    for (var i = 0, len = data.data.length; i < len; i++) {
                        var template = "<div class='county-list form-address' data-type='" + data.data[i].type + "' data-sign='" + data.data[i].cid + "'><label class='control-label'>" + data.data[i].name + "</label><img src='public/img/more.png'/></div>";
                        $(page).find(".addressSetting").append(template);
                    }
                }
            }, error: function (data) {
                config.FUNC.loadingHide();
            }
        });
    }

});

App.load('home');
