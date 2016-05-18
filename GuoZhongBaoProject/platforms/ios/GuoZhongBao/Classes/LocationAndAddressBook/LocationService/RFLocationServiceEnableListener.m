//
//  RFLocationServiceEnableListener.m
//  GuoZhongBao
//
//  Created by baolicheng on 15/7/23.
//  Copyright (c) 2015年 RenRenFenQi. All rights reserved.
//

#import "RFLocationServiceEnableListener.h"
#import <CoreLocation/CoreLocation.h>
#define TimeInterval 20.0f
static RFLocationServiceEnableListener *rfLocationServiceEnableListener;
@implementation RFLocationServiceEnableListener
+(id)defaultManager
{
    if (rfLocationServiceEnableListener == nil) {
        rfLocationServiceEnableListener = [[RFLocationServiceEnableListener alloc] init];
    }
    return rfLocationServiceEnableListener;
}

-(void)startListenWithUid:(NSString *)myUid WithToken:(NSString *)myToken
{
    uid = myUid;
    token = myToken;
    if (timer) {
        [timer invalidate];
        timer = nil;
    }
    
    if (uid) {
        currentIsEnable = YES;
        lastIsEnable = NO;
        timer = [NSTimer scheduledTimerWithTimeInterval:TimeInterval target:self selector:@selector(locationServiceEnableState) userInfo:nil repeats:YES];
        [timer fire];
    }
}

-(void)stopListen
{
    if (timer) {
        [timer invalidate];
        timer = nil;
    }
}

-(void)locationServiceEnableState
{
    if ([CLLocationManager locationServicesEnabled]) {
        if (!lastIsEnable) {
            currentIsEnable = YES;
            lastIsEnable = YES;
            [self uploadLocationServiceState:YES];
        }
    }else{
        if (currentIsEnable != lastIsEnable) {
            //第一次开启app
            currentIsEnable = NO;
            lastIsEnable = NO;
            [self uploadLocationServiceState:NO];
        }
        
        if ((currentIsEnable == lastIsEnable) && (lastIsEnable)) {
            //主动关闭定位
            currentIsEnable = NO;
            lastIsEnable = NO;
            [self uploadLocationServiceState:NO];
        }
    }
}

-(void)uploadLocationServiceState:(BOOL)enable
{
    
}
@end
