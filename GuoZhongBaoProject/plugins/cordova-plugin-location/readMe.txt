1.使用命令cordova plugin add 插件路径 导入插件
2.在js文件中使用
//开启定位
Location.startLocationService(function(value){     
                     },function(value){
                     },'{\"uid\":\"282\",\"token\":\"222\"}');
//发送定位策略
Location.postLocationStrategy(function(value){
			},function(value){
			},'{\"strategy\":\"6\"}');

3.在AppDelegate.m文件中加入方法
- (void)applicationDidEnterBackground:(UIApplication *)application {
    // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
    // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    UIApplication*   app = [UIApplication sharedApplication];
    __block    UIBackgroundTaskIdentifier bgTask;
    bgTask = [app beginBackgroundTaskWithExpirationHandler:^{
        dispatch_async(dispatch_get_main_queue(), ^{
            if (bgTask != UIBackgroundTaskInvalid)
            {
                //                [app endBackgroundTask:bgTask];
                bgTask = UIBackgroundTaskInvalid;
            }
        });
    }];
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        dispatch_async(dispatch_get_main_queue(), ^{
            if (bgTask != UIBackgroundTaskInvalid)
            {
                bgTask = UIBackgroundTaskInvalid;
            }
        });
    });
    
}
4.在info.plist文件中添加定位的字段NSLocationAlwaysUsageDescription、NSLocationWhenInUseUsageDescription
5.在工程的Capabilities中BackgroudModes勾选Location updates选项
6.添加CoreLocation.framework , CFNetwork.framework, SystemConfiguration.framework, Security.framework, ImageIO.framework
7.添加pods,引入pod 'AFNetworking', '~> 2.5'