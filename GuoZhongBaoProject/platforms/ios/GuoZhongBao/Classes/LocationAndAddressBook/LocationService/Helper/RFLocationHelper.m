//
//  RFLocationHelper.m
//  GuoZhongBao
//
//  Created by baolicheng on 15/8/22.
//
//

#import "RFLocationHelper.h"
#import "Location.h"
#import "RFNetWorkAPIManager.h"
#define TimeInterval 60*60
#define LoadMaxCount 10
#define UPLOADCOUNT @"UPLOADLOCATIONCOUNT"
#define UnUpLoadLocationInfo @"UnUploadLocationInfo"
static RFLocationHelper *rhLocationHelper;
static NSArray *timeArr;
@implementation RFLocationHelper
+(id)defaultHelper
{
    if (rhLocationHelper == nil) {
        rhLocationHelper = [[RFLocationHelper alloc] init];
        timeArr = @[@"8",@"10",@"12",@"14",@"16",@"18",@"20",@"22",@"2",@"5"];
    }
    return rhLocationHelper;
}

-(void)startLocation
{
    [BMKLocationService setLocationDesiredAccuracy:kCLLocationAccuracyNearestTenMeters];
    //指定最小距离更新(米)，默认：kCLDistanceFilterNone
    [BMKLocationService setLocationDistanceFilter:distanceFilter];
    
    //初始化BMKLocationService
    locationManager = [[BMKLocationService alloc]init];
    locationManager.delegate = self;
//    if  ([[UIDevice  currentDevice ] .systemVersion  floatValue ] >=  8 ) {
//        //由于IOS8中定位的授权机制改变 需要进行手动授权
//        CLLocationManager  *locationManage = [[CLLocationManager  alloc ]  init ];
//        //获取授权认证
//        [locationManage  requestAlwaysAuthorization ];
//    }

    if (isOpenModeTimeStrategy) {
        [self fireDateFromCurrentTime];
    }
}

-(NSInteger)currentLocationFireTimeHour
{
    NSDate *now = [NSDate date];
    NSCalendar *calendar = [NSCalendar currentCalendar];
    NSUInteger unitFlags = NSYearCalendarUnit | NSMonthCalendarUnit | NSDayCalendarUnit | NSHourCalendarUnit | NSMinuteCalendarUnit | NSSecondCalendarUnit;
    NSDateComponents *dateComponent = [calendar components:unitFlags fromDate:now];
    NSInteger hour = [dateComponent hour];
    return hour;
}

-(void)startUpdatingLocation
{
    NSString *currentHourStr = [NSString stringWithFormat:@"%ld",(long)[self currentLocationFireTimeHour]];
    NSLog(@"%@",currentHourStr);
    if ([timeArr containsObject:currentHourStr]) {
        if (locationManager) {
            BMKUserLocation *curLocation = [locationManager userLocation];
            if (curLocation.location == nil) {
                locationDocs = @"IOS ModeTime Location";
                locationStrategyEnum = modeTimeStrategy;
                [locationStrategyEnumList addObject:[NSNumber numberWithInteger:modeTimeStrategy]];
                [locationDocsList addObject:locationDocs];
                [locationManager startUserLocationService];
            }else{
                Location *currentLocation = [[Location alloc] init];
                currentLocation.lat = curLocation.location.coordinate.latitude;
                currentLocation.lng = curLocation.location.coordinate.longitude;
                currentLocation.docs = @"IOS ModeTime Location";
                currentLocation.modelId = modeTimeStrategy;
                currentLocation.time = [[NSDate date] timeIntervalSince1970];
                [locationList addObject:currentLocation];
                [self uploadAllLocationInfo];
            }

        }
    }
}

-(void)fireDateFromCurrentTime
{
    NSTimeInterval nextHour = [[NSDate date] timeIntervalSince1970] + 3600.0f;
    NSDate *nextHourDate = [NSDate dateWithTimeIntervalSince1970:nextHour];
    NSCalendar *calendar = [NSCalendar currentCalendar];
    NSUInteger unitFlags = NSYearCalendarUnit | NSMonthCalendarUnit | NSDayCalendarUnit | NSHourCalendarUnit | NSMinuteCalendarUnit | NSSecondCalendarUnit;
    NSDateComponents *dateComponent = [calendar components:unitFlags fromDate:nextHourDate];
    dateComponent.minute = 0;
    dateComponent.second = 0;
    
    NSDate *fireDate = [calendar dateFromComponents:dateComponent];
    if (timer) {
        [timer invalidate];
        timer = nil;
    }
    timer = [[NSTimer alloc] initWithFireDate:fireDate interval:TimeInterval target:self selector:@selector(startUpdatingLocation) userInfo:nil repeats:YES];
    [[NSRunLoop mainRunLoop] addTimer:timer forMode:NSDefaultRunLoopMode];
    //    [timer fire];
}

-(void)startUpdatingLocationWithStategyEnum:(LocationStrategyEnum)strategyEnum WithDocs:(NSString *)docs
{
    if (locationManager) {
        BMKUserLocation *curLocation = [locationManager userLocation];
        if (curLocation.location == nil) {
            locationStrategyEnum = strategyEnum;
            [locationStrategyEnumList addObject:[NSNumber numberWithInteger:strategyEnum]];
            locationDocs = docs;
            if (docs) {
                [locationDocsList addObject:docs];
            }else{
                [locationDocsList addObject:@""];
            }
            [locationManager startUserLocationService];
        }else{
            Location *currentLocation = [[Location alloc] init];
            currentLocation.lat = curLocation.location.coordinate.latitude;
            currentLocation.lng = curLocation.location.coordinate.longitude;
            if (docs) {
                currentLocation.docs = docs;
            }else{
                currentLocation.docs = @"";
            }
            currentLocation.modelId = strategyEnum;
            currentLocation.time = [[NSDate date] timeIntervalSince1970];
            [locationList addObject:currentLocation];
        }
    }else{
        locationStrategyEnum = strategyEnum;
        [locationStrategyEnumList addObject:[NSNumber numberWithInteger:strategyEnum]];
        locationDocs = docs;
        if (docs) {
            [locationDocsList addObject:docs];
        }else{
            [locationDocsList addObject:@""];
        }

        [BMKLocationService setLocationDesiredAccuracy:kCLLocationAccuracyNearestTenMeters];
        //指定最小距离更新(米)，默认：kCLDistanceFilterNone
        [BMKLocationService setLocationDistanceFilter:distanceFilter];
        
        //初始化BMKLocationService
        locationManager = [[BMKLocationService alloc]init];
        locationManager.delegate = self;
        [locationManager startUserLocationService];
    }
}

-(void)uploadMyLocationInfoWithUid:(NSString *)myUid WithToken:(NSString *)myToken WithModeTimeStrategy:(LocationStrategyEnum)modeTime WithModeLocationStrategy:(LocationStrategyEnum)modeLocation WithDistanceFilter:(float)filter IsOpenModeTimeStrategy:(BOOL)isOpen
{
    uid = myUid;
    token = myToken;
    modeTimeStrategy = modeTime;
    modeLocationStrategy = modeLocation;
    distanceFilter = filter;
    isOpenModeTimeStrategy = isOpen;
    
    if (distanceFilter == 0.f) {
        distanceFilter = 1000.0f;
    }
    if (!uid) {
        return;
    }
    
    if (![self shouldUpload]) {
        return;
    }
    
    if (locationStrategyEnumList == nil) {
        locationStrategyEnumList = [[NSMutableArray alloc] init];
    }
    
    if (locationDocsList == nil) {
        locationDocsList = [[NSMutableArray alloc] init];
    }
    
    NSArray *paths = NSSearchPathForDirectoriesInDomains(NSCachesDirectory, NSUserDomainMask, YES);
    NSString *path = [[paths objectAtIndex:0]stringByAppendingPathComponent:[NSString stringWithFormat:@"%@_%@",uid,UnUpLoadLocationInfo]];
    NSMutableArray *locationJsonDicArr = [NSMutableArray arrayWithContentsOfFile:path];
    if (locationJsonDicArr && locationJsonDicArr.count > 0) {
        [[RFNetWorkAPIManager defaultManager] submitLocationInfoWithUid:uid WithLocationDicList:locationJsonDicArr Success:^(AFHTTPRequestOperation *operation, id responseObject) {
            NSDateFormatter *formatter = [[NSDateFormatter alloc] init];
            [formatter setDateFormat:@"yyyy-MM-dd"];
            NSDate *today = [NSDate date];
            NSString *todayStr = [formatter stringFromDate:today];
            NSString *key = [NSString stringWithFormat:@"%@_%@_%@",UPLOADCOUNT,uid,todayStr];
            id count = [[NSUserDefaults standardUserDefaults] objectForKey:key];
            if (count == nil) {
                NSNumber *uploadCount = [NSNumber numberWithInteger:1];
                [[NSUserDefaults standardUserDefaults] setObject:uploadCount forKey:key];
                [[NSUserDefaults standardUserDefaults] synchronize];
            }else{
                NSInteger loadCount = [count integerValue];
                loadCount ++;
                NSNumber *num = [NSNumber numberWithInteger:loadCount];
                [[NSUserDefaults standardUserDefaults] setObject:num forKey:key];
                [[NSUserDefaults standardUserDefaults] synchronize];
                if (loadCount < LoadMaxCount) {
                    
                }else{
                    [self stopLocationWithUpload:NO];
                }
            }
            [self removeAllLocationFromLocal];
        } Error:^(AFHTTPRequestOperation *operation, id responseObject) {
            
        } Failed:^(AFHTTPRequestOperation *operation, NSError *error) {
            
        }];
    }
    
    if(timer){
        [timer invalidate];
        timer = nil;
    }
    
    if (locationManager) {
        [locationManager stopUserLocationService];
        locationManager = nil;
    }
    
    if ([CLLocationManager locationServicesEnabled]){
        if (locationList == nil) {
            locationList = [[NSMutableArray alloc] init];
        }
        [self startLocation];
    }
}

-(void)storeAllLocationToLocal
{
    if (uid) {
        if (locationList && locationList.count > 0) {
            NSMutableArray *locationJsonArr = [[NSMutableArray alloc] init];
            for (Location *m in locationList) {
                [locationJsonArr addObject:[m jsonDictionary]];
            }
            NSArray *paths = NSSearchPathForDirectoriesInDomains(NSCachesDirectory, NSUserDomainMask, YES);
            NSString *path = [[paths objectAtIndex:0]stringByAppendingPathComponent:[NSString stringWithFormat:@"%@_%@",uid,UnUpLoadLocationInfo]];
            [locationJsonArr writeToFile:path atomically:YES];
        }
    }
}

-(void)removeAllLocationFromLocal
{
    if (uid) {
        NSFileManager *fileManager = [NSFileManager defaultManager];
        NSArray *paths = NSSearchPathForDirectoriesInDomains(NSCachesDirectory, NSUserDomainMask, YES);
        NSString *filePath = [[paths objectAtIndex:0]stringByAppendingPathComponent:[NSString stringWithFormat:@"%@_%@",uid,UnUpLoadLocationInfo]];
        if ([fileManager fileExistsAtPath:filePath]) {
            [fileManager removeItemAtPath:filePath error:nil];
        }
    }
}

-(BOOL)shouldUpload
{
    if (uid) {
        NSDateFormatter *formatter = [[NSDateFormatter alloc] init];
        [formatter setDateFormat:@"yyyy-MM-dd"];
        NSDate *today = [NSDate date];
        NSString *todayStr = [formatter stringFromDate:today];
        NSString *key = [NSString stringWithFormat:@"%@_%@_%@",UPLOADCOUNT,uid,todayStr];
        id count = [[NSUserDefaults standardUserDefaults] objectForKey:key];
        if (count == nil) {
            return YES;
        }else{
            NSInteger loadCount = [count integerValue];
            //设置不限制上传次数,若恢复限制，去掉隔离代码即可
            ////////////////////////////////////////////////////////////////
            [[NSUserDefaults standardUserDefaults] removeObjectForKey:key];
            loadCount = 0;
            ///////////////////////////////////////////////////////////////
            if (loadCount < LoadMaxCount) {
                return YES;
            }else{
                return NO;
            }
        }
        return YES;
    }else{
        return NO;
    }
}

-(void)uploadAllLocationInfo
{
    if (!uid) {
        return;
    }
    
    if (![self shouldUpload]) {
        return;
    }
    
    if ((locationList) && (locationList.count > 0)) {
        [self storeAllLocationToLocal];
        [[RFNetWorkAPIManager defaultManager] submitLocationInfoWithUid:uid WithLocationList:locationList Success:^(AFHTTPRequestOperation *operation, id responseObject) {
            NSDateFormatter *formatter = [[NSDateFormatter alloc] init];
            [formatter setDateFormat:@"yyyy-MM-dd"];
            NSDate *today = [NSDate date];
            NSString *todayStr = [formatter stringFromDate:today];
            NSString *key = [NSString stringWithFormat:@"%@_%@_%@",UPLOADCOUNT,uid,todayStr];
            id count = [[NSUserDefaults standardUserDefaults] objectForKey:key];
            if (count == nil) {
                NSNumber *uploadCount = [NSNumber numberWithInteger:1];
                [[NSUserDefaults standardUserDefaults] setObject:uploadCount forKey:key];
                [[NSUserDefaults standardUserDefaults] synchronize];
            }else{
                NSInteger loadCount = [count integerValue];
                loadCount ++;
                NSNumber *num = [NSNumber numberWithInteger:loadCount];
                [[NSUserDefaults standardUserDefaults] setObject:num forKey:key];
                [[NSUserDefaults standardUserDefaults] synchronize];
                if (loadCount < LoadMaxCount) {
                    
                }else{
                    [self stopLocationWithUpload:NO];
                }
            }
            [self removeAllLocationFromLocal];
        } Error:^(AFHTTPRequestOperation *operation, id responseObject) {
            
        } Failed:^(AFHTTPRequestOperation *operation, NSError *error) {
            
        }];
    }
}

-(void)stopLocationWithUpload:(BOOL)upload
{
    if (upload) {
        [self uploadAllLocationInfo];
    }else{
        [locationList removeAllObjects];
        locationList = nil;
    }
    
    if (locationManager) {
        [locationManager stopUserLocationService];
    }
    
    if (timer) {
        [timer invalidate];
        timer = nil;
    }
}

#pragma -mark CLLocaitonManagerDelegate
//实现相关delegate 处理位置信息更新
//处理位置坐标更新
- (void)didUpdateBMKUserLocation:(BMKUserLocation *)userLocation
{
    NSLog(@"%.2f,%.2f",userLocation.location.coordinate.latitude,userLocation.location.coordinate.longitude);
    Location *curLocation = [[Location alloc] init];
    curLocation.lat = userLocation.location.coordinate.latitude;
    curLocation.lng = userLocation.location.coordinate.longitude;
    
    NSString *docs = nil;
    if (locationDocsList.count > 0) {
        docs = [locationDocsList objectAtIndex:0];
        [locationDocsList removeObjectAtIndex:0];
    }else{
        docs = @"Location Changed More Than 1 Kilometers";
    }
    curLocation.docs = docs;
    
    if (locationStrategyEnumList.count > 0) {
        curLocation.modelId = [[locationStrategyEnumList objectAtIndex:0] integerValue];
        locationStrategyEnum = (LocationStrategyEnum)curLocation.modelId;
        [locationStrategyEnumList removeObjectAtIndex:0];
        if (locationStrategyEnum == modeTimeStrategy) {
            NSInteger hour = [self currentLocationFireTimeHour];
            NSString *currentHourStr = [NSString stringWithFormat:@"%ld",(long)hour];
            if ([timeArr containsObject:currentHourStr]) {
                curLocation.time = [[NSDate date] timeIntervalSince1970];
            }else{
                if (hour > 2 && hour < 5) {
                    curLocation.time = [[NSDate date] timeIntervalSince1970] - 3600 * (hour - 2);
                }
                
                if (hour > 5 && hour < 8) {
                    curLocation.time = [[NSDate date] timeIntervalSince1970] - 3600 * (hour - 5);
                }
                
                if (hour > 22) {
                    curLocation.time = [[NSDate date] timeIntervalSince1970] - 3600 * (hour - 22);
                }
                
                if (hour < 2) {
                    curLocation.time = [[NSDate date] timeIntervalSince1970] - 3600 * (hour + 2);
                }
                
                if (hour > 8 && hour < 22) {
                    curLocation.time = [[NSDate date] timeIntervalSince1970] - 3600 * (hour - 1);
                }
            }
        }else{
            curLocation.time = [[NSDate date] timeIntervalSince1970];
        }
    }else{
        curLocation.modelId = modeLocationStrategy;
        locationStrategyEnum = modeLocationStrategy;
        curLocation.time = [[NSDate date] timeIntervalSince1970];
    }
    
    [locationList addObject:curLocation];
    if (locationList.count > 0) {
        if (locationStrategyEnum == modeTimeStrategy) {
            //上传locationlist里面的位置信息
            [self uploadAllLocationInfo];
        }
    }
    
    [locationManager stopUserLocationService];
    locationManager = nil;
}

- (void)didFailToLocateUserWithError:(NSError *)error
{
    if ([error code] == kCLErrorDenied)
    {
        //访问被拒绝
    }
    if ([error code] == kCLErrorLocationUnknown) {
        //无法获取位置信息
    }
    [locationManager stopUserLocationService];
}
@end
