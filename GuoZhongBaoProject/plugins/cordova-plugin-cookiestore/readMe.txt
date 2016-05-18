1.使用命令cordova plugin add 插件路径 导入插件
2.在js文件中使用
_json = @{“uid”:uid,”token”:token}
CookieStore.get(successFunction, errorFunction,key)
CookieStore.put(successFunction, errorFunction,key, _json)
CookieStore.update(successFunction, errorFunction,key, _json)
CookieStore.remove(function(){
		alert("delete success");
	}, function(){
		alert("delete error");
	},key)