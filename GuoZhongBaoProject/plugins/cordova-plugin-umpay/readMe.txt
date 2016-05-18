1.使用命令cordova plugin add 插件路径 导入插件
2.在js文件中使用UmPay.pay(function(value){
                  alert(value);
                  },function(value){
                  alert(value);
                  },'{\"tradeNo\":\"adjfkdjkd\",\"uid\":\"123\"}');
