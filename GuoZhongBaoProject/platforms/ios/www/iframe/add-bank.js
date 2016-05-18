(function(){
    var nextButton = document.getElementById('nextBtn'),
        backButton = document.getElementById('backBtn');
    nextButton.addEventListener('click', _validate, false);

    backButton.addEventListener('click', _back, false);

    function _back() {
        if (_getDeviceInfo.deviceType === 'android') {
            guozhongbaoAct.goHome()
        } else {
            _iosBack();
        }
    }

    function _iosBack() {
        var request = new XMLHttpRequest(),
            backUrl = '/!gap_exec?' + (new Date());
        request.open('GET', backUrl, true);
        request.setRequestHeader('cmds', '[["123456", "Share", "popToIndex", []]]');
        request.setRequestHeader('rc', '12345');
        request.send();
        request.addEventListener('readystatechange', function(e) {
            if(request.readyState === 4) {
                if(request.status === 200) {

                } else {

                }
            }
        })
    }

    function _validate() {
        var uid = _getUserInfo.uid,
            token = _getUserInfo.token;

        var phone = document.getElementById('phone'),
            bank = document.getElementById('bank'),
            agreement = document.getElementById('agreement');
        if (!phone.value || !phone.value.trim()) {
            alert('请填写手机号');
            return false;
        } else if (!_checkPhone(phone.value.trim())) {
            alert('手机号格式不正确');
            return false;
        } else if (!bank.value || !bank.value.trim()) {
            alert('请填写银行卡号');
            return false;
        } else if (!agreement.checked) {
            alert('请同意用户协议');
            return false;
        } else {
            var addParams = {
                uid: uid,
                token: token,
                phone: phone.value.trim(),
                bank: bank.value.trim()
            };
            _submit(addParams);
        }
    }

    function _submit(addParams) {
        var fd = new FormData();

        fd.append("uid", addParams.uid);
        fd.append("token", addParams.token);
        fd.append('customphone', addParams.phone);
        fd.append('customcardno', addParams.bank);

        var interfaceUrl = getApi().add_bank;
        var request = new XMLHttpRequest();
        request.open('POST', interfaceUrl, true);
        request.send(fd);
        request.addEventListener('readystatechange', function(e) {
            if(request.readyState === 4) {
                if(request.status === 200) {
                    var responseText = request.responseText,
                        data = JSON.parse(responseText);
                    if (data.status === 200) {
                        var url = data.data.action + '?' + 'charset=' + data.data.charset + '&customcardno=' + data.data.customcardno
                            + '&custominfo=' + data.data.custominfo + '&customphone=' + data.data.customphone + '&insertID='
                            + data.data.insertID + '&msgseqno=' + data.data.msgseqno + '&receiveurl=' + data.data.receiveurl
                            + '&reserved=' + data.data.reserved + '&signmsg=' + data.data.signmsg + '&systemid='
                            + data.data.systemid + '&version=' + data.data.version;
                        location.href = url;
                    } else {
                        alert(data.message);
                    }
                } else {
                    alert('网络异常，请重试');
                }
            }
        })
    }

    function _checkPhone(p) {
        return /^1[3|4|5|7|8][0-9]\d{8}$/.test(p);
    }

    var _getUserInfo = (function () {
        var args = {};
        var src = document.location.href;
        console.log('src = ' + src);
        var query = src.substr(src.lastIndexOf('?') + 1, src.length);
        var pairs = query.split("&");
        for (var i = 0; i < pairs.length; i++) {
            var pos = pairs[i].indexOf('=');
            if (pos == -1) continue;
            var argname = pairs[i].substring(0, pos);// Extract the name
            var value = pairs[i].substring(pos + 1);// Extract the value
            value = decodeURIComponent(value);// Decode it, if needed
            args[argname] = value;
        }
        return args;
    })();

    var _getDeviceInfo = (function () {
        var deviceType = '', deviceCode = '';
        var ua = navigator.userAgent;
        if (/iPhone|iPad|iPod/i.test(ua)) {
            deviceType = 'ios';
            deviceCode = 1;
        } else if (/Android/i.test(ua)) {
            deviceType = 'android';
            deviceCode = 2;
        } else if (/IEMobile/i.test(ua)) {
            deviceType = 'windowsphone';
            deviceCode = 3;
        } else if (/MicroMessenger/i.test(ua)) {
            deviceType = 'wechat';
            deviceCode = 4;
        } else {
            deviceType = 'unknown';
            deviceCode = 0;
        }
        return {
            deviceType: deviceType,
            deviceCode: deviceCode
        };
    })();

    function getApi() {
        var offline = location.href.indexOf('?') > 0;
        var api_base_url = offline ? 'http://api.gzb.renrenfenqi.com' : 'http://api.guozhongbao.com';
        return {
            add_bank: api_base_url + '/pay/slbinding'
        }
    }


})();