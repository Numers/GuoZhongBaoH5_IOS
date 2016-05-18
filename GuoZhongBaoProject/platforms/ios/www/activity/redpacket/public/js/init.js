/**
 * Created by 00 on 2015/7/7.
 */
App.controller('home', function (page) {

    //init
    getRedPacket();
    if(config.TEMP.isRed == 1){
        config.TEMP.isRed = 0;
        getMoney(function(){
            GetMoneySuccess()
        });
    }

    //获取红包列表信息
    function getRedPacket(callback) {
        config.FUNC.loadingShow();
        $.ajax({
            type: 'POST',
            url: config.API.get_red_packet ,
            data: config.FUNC.getUserInfo() ,
            success: function (data){
                config.FUNC.loadingHide();
               if(data.status == 200){
                   updateRed(data.data);
                   if(callback){
                       callback();
                   }
               }else if(data.status == 600){
                   reLogin();
               }else{
                   config.FUNC.alert('警告', data.message);
               }
            } ,
            error: function(){
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
        _data.exchange_code  = code;
        $.ajax({
            type: 'POST',
            url: config.API.put_code,
            data: _data ,
            success: function (data){
                if(data.status == 200){
                    getRedPacket();
                    callback();
                }else {
                    $(".red-modal-money-error").text( data.message);
                }
            } ,
            error: function(){
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
            data: config.FUNC.getUserInfo() ,
            success: function (data){
                console.log(config.API.get_money)
                console.log(data)
                if(data.status == 200){
                    getRedPacket(callback);
                }else {
                    config.FUNC.alert('警告', data.message);
                }
            } ,
            error: function(){
                config.FUNC.alert('警告', config.MESSAGE.net_error, getMoney);
            }
        });
    }


    //分享判断
    function checkoutStatus(type) {
        config.FUNC.loadingShow();
        $.ajax({
            type: 'GET',
            url: config.API.checkout_status ,
            success: function (data){
                config.FUNC.loadingHide();
                if(data.status == 200){
                    //调用分享接口
                    if(data.data.redpacket_status == 1){
                        activity.share(type)
                    }else {
                        config.FUNC.alert('警告', config.MESSAGE.activity_end);
                    }
                }else {
                    config.FUNC.alert('警告', data.message);
                }
            } ,
            error: function(){
                config.FUNC.loadingHide();
                config.FUNC.alert('警告', config.MESSAGE.net_error, checkoutStatus);
            }
        });
    }

    //更新红包页面资料
    function updateRed(data) {
        //记录填写资料状态
        config.TEMP.withdraw_info_status = data.withdraw_info_status;

        //更新验证码
        $(page).find('.red-my-code').text(data.my_code);

        //更新红包未提现额度
        $(page).find('.red-title-red').text(data.amount_unwithdraw);

        //更新推广红包额度
        $(page).find('.red-my-info span').text(data.amount_promotion);

        //更新记录
        if(data.withdraw_recode){
            var _times = data.withdraw_recode.updated_at;
            var _getMoneyStatus;
            console.log(data.withdraw_recode)
            if(data.withdraw_recode.status == 0 || data.withdraw_recode.status == 3){
                _getMoneyStatus = "申请提款中";
            }else if(data.withdraw_recode.status == 1){
                _getMoneyStatus = "申请提款成功";
            }else if(data.withdraw_recode.status == 2){
                _getMoneyStatus = "申请提款失败";
            }else {
                _getMoneyStatus = "申请提款失败2";
            }
            $(page).find('#red-list').html('<ul class="red-list"><li class="col-40"><span class="title-red">'+_times.substring(0, 4)+'</span>年<span class="title-red">'+_times.substring(5, 7)+'</span>月<span class="title-red">'+_times.substring(8, 10)+'</span>号</li><li class="col-25 left"><span class="title-red">'+ data.withdraw_recode.amount +'</span>元</li><li class="col-10"></li> <li class="col-25 right"><span class="title-red">'+ _getMoneyStatus +'</span></li></ul>');
        }
    }

    function reLogin(){
        var u = navigator.userAgent;
        var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
        if(isiOS){
            window.activity.reLogin()
        }
    }

    //输入兑换码
    $(page).find('.get-code').on('click', function(){
        $(".red-modal-money-input input").val('');
        $(".red-modal-money-error").text('');

        $('.backdrop').show();
        $('.red-modal-money').show();
    });

    $(".red-modal-money-btn-sure").on('click', function(){
        var _inputData = $(".red-modal-money-input input").val();
        putCode(_inputData,  hideCode);
    });

    $(".red-modal-money-btn-cancel").on('click', function(){
        hideCode();
    });

    //分享处理
    $(page).find('.red-share-list img').on('click', function(){
        var _index = $('.red-share-list img').index($(this)).toString();
        checkoutStatus(_index);
    });

    //提额处理
    $(page).find('.btn-red').on('click', function(){
        console.log(config.TEMP.withdraw_info_status )
        if(config.TEMP.withdraw_info_status == 1){
            getMoney(function(){
                GetMoneySuccess()
            });
        }else {
            if($(page).find(".red-title-red").text() == "0"){
                config.FUNC.alert('警告', '提现余额不能为0')
            }else {
                App.load('bankset')
            }
            //处理没有填写的情况
        }
    });

    //关闭提现成功弹层
    $(".red-modal-share-close").on('click', function(){
        hideGetMoneySuccess();
    });

    //提现成功后调用app分享
    $(".red-modal-share-btn").on("click", function(){
        hideGetMoneySuccess();
        config.FUNC.loadingShow();
        $.ajax({
            type: 'GET',
            url: config.API.checkout_status ,
            success: function (data){
                config.FUNC.loadingHide();
                if(data.status == 200){
                    if(data.data.redpacket_status == 1){
                        activity.shareAll();
                    }else {
                        config.FUNC.alert('警告', config.MESSAGE.activity_end);
                    }
                }else {
                    config.FUNC.alert('警告', data.message);
                }
            } ,
            error: function(){
                config.FUNC.loadingHide();
                config.FUNC.alert('警告', config.MESSAGE.net_error, checkoutStatus);
            }
        });
    });

    //返回按钮
    $(page).find("#Back").on('click', function(){
        window.activity.back();
    });

    function hideCode(){
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
    }

});
//Object {uid: 343, token: "pKrOSZ@spH", phone: "18510011004"}
App.controller('bankset', function (page) {
    var bankList = $(page).find('#bank_list');
    var bankItem = $(page).find('#bank_list option');

    //init
    getBankList();

    function getBankList (){
        config.FUNC.loadingShow();
        $.ajax({
            type: 'GET',
            url: config.API.get_support_bank,
            dataType: 'json',
            async:false,
            success: function(data) {
                config.FUNC.loadingHide();
                if (data.status === 200) {
                    _fillBankInfo(data.data);
                }
            },
            error: function(data) {
                config.FUNC.loadingHide();
                console.log(data);
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
        bankList.on('change', function() {
            if ($(this).val() === '-1') {
                $(this).addClass('empty-select');
            } else {
                $(this).removeClass('empty-select');
            }
        });
        bankList.trigger('change');
    }

    var button = $(page).find('.control-button');
    button.on('click', function() {
        _validateForm();
    });

    function _validateForm() {
        var name = $(page).find('#name');
        var identity = $(page).find('#identity');
        var accountType = $(page).find('#bank_list');
        var account = $(page).find('#account');
        if (!name.val()) {
            config.FUNC.alert('警告', '请输入姓名');
        } else if (!identity.val()) {
            config.FUNC.alert('警告', '请输入身份证号');
        } else if (!accountType.val()) {
            config.FUNC.alert('警告', '请选择银行');
        } else if (!account.val()) {
            config.FUNC.alert('警告', '请输入银行卡号');
        } else {
            var withDrawParams = {
                uid: config.FUNC.getUserInfo().uid,
                token: config.FUNC.getUserInfo().token,
                truename: name.val(),
                identity: identity.val(),
                account_type: accountType.val(),
                account: account.val()
            };
            _saveWithdrawInfo(withDrawParams)
        }
    }

    function _saveWithdrawInfo(withDrawParams) {
        $.ajax({
            type: 'POST',
            url: config.API.store_withdraw_info,
            data: $.param(withDrawParams),
            async:false,
            success: function(data) {
                if (data.status === 200) {
                    config.TEMP.isRed = 1;
                    App.load('home');
                } else {
                    config.FUNC.alert('警告', data.message);
                }
            },
            error: function(data) {
                console.log(data);
            }
        });
    }
});

App.load('home');

//try {
//    App.restore({ maxAge: 5*60*1000 });
//} catch (err) {
//    App.load('home');
//}