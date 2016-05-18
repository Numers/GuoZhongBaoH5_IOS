//
//  PHLocationHelper.h
//  PocketHealth
//
//  Created by macmini on 15-1-16.
//  Copyright (c) 2015年 YiLiao. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <CoreLocation/CoreLocation.h>
#import <MapKit/MapKit.h>
typedef enum{
    Mode_Time
}LocationStrategyEnum;
@interface PHLocationHelper : NSObject<CLLocationManagerDelegate,MKMapViewDelegate>
{
    CLLocationManager *locationManager;
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
