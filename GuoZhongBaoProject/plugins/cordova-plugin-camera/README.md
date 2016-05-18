###1、添加Cordova overlay camera 插件 
	Cordova plugin add /XXX/xxxx

###2、在js中调用方法
    //第三个要用数组而不是json

    window.Camera.takePicture(onSuccess, onFail,
    {
        type : 3
    });

    function onSuccess(imageData) {
        alert('type:'+ imageData.type);
        var image = document.getElementById('myImage');
        image.src = "data:image/jpeg;base64," + imageData.pic;
    }

    function onFail(message) {
        alert('Failed because: ' + message);
    }

###3、在html中添加<img>标签
    <div>
        <img id="myImage" src=""  width="240" height="280px"/>
    </div>

###4、多了控制遮罩层的参数
    
    type: 
        //身份证正面
        Camera.OverLayerMode.ID_FRONT 0
        //身份证反面
        Camera.OverLayerMode.ID_BACK  1
        //人脸+证件
        Camera.OverLayerMode.FACE     2
        //证件 
        Camera.OverLayerMode.PASSPORT  3