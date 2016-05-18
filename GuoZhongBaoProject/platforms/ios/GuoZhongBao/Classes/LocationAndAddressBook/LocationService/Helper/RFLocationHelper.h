//
//  RFLocationHelper.h
//  GuoZhongBao
//
//  Created by baolicheng on 15/8/22.
//
//

#import <Foundation/Foundation.h>
#import <CoreLocation/CoreLocation.h>
#import <BaiduMapAPI/BMapKit.h>
#import <BaiduMapAPI/BMKLocationService.h>
typedef enum{
    Mode_Time
}LocationStrategyEnum;
@interface RFLocationHelper : NSObject<BMKLocationServiceDelegate>
{
    BMKLocationService *locationManager;
    NSMutableArray *locationList;
    NSTimer *timer;
    LocationStrategyEnum locationStrategyEnum;
    NSMutableArray *locationStrategyEnumList;
    NSString *locationDocs;
    NSMutableArray *locationDocsList;
    
    NSString *uid;
    NSString *token;
    LocationStrategyEnum modeTimeStrategy;
    LocationStrategyEnum modeLocationStrategy;
    float distanceFilter;
    BOOL isOpenModeTimeStrategy;
}
+(id)defaultHelper;
-(void)startUpdatingLocationWithStategyEnum:(LocationStrategyEnum)strategyEnum WithDocs:(NSString *)docs;
-(void)stopLocationWithUpload:(BOOL)upload;
-(void)uploadMyLocationInfoWithUid:(NSString *)myUid WithToken:(NSString *)myToken WithModeTimeStrategy:(LocationStrategyEnum)modeTime WithModeLocationStrategy:(LocationStrategyEnum)modeLocation WithDistanceFilter:(float)filter IsOpenModeTimeStrategy:(BOOL)isOpen;
-(void)uploadAllLocationInfo;

-(void)storeAllLocationToLocal;
-(void)removeAllLocationFromLocal;
@end
