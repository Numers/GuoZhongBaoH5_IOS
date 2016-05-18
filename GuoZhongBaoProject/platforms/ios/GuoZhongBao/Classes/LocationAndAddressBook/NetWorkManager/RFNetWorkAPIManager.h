//
//  RFNetWorkAPIManager.h
//  GuoZhongBao
//
//  Created by baolicheng on 15/7/2.
//  Copyright (c) 2015年 RenRenFenQi. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "RFNetWorkHelper.h"
#import "JSONKit.h"
@interface RFNetWorkAPIManager : NSObject
+(id)defaultManager;
//地理位置统计上报
-(void)submitLocationInfoWithUid:(NSString *)uid WithLocationList:(NSMutableArray *)locationList Success:(ApiSuccessCallback)success Error:(ApiErrorCallback)error Failed:(ApiFailedCallback)failed;

-(void)submitLocationInfoWithUid:(NSString *)uid WithLocationDicList:(NSMutableArray *)locationDicList Success:(ApiSuccessCallback)success Error:(ApiErrorCallback)error Failed:(ApiFailedCallback)failed;

//获取地理位置上报策略
-(void)requestLocationModeSuccess:(ApiSuccessCallback)success Error:(ApiErrorCallback)error Failed:(ApiFailedCallback)failed;

//通讯录信息上报
-(void)submitAddressBookWithUid:(NSString *)uid WithContactList:(NSMutableArray *)contactList Success:(ApiSuccessCallback)success Error:(ApiErrorCallback)error Failed:(ApiFailedCallback)failed;

//客户端上报clientId
-(void)submitPushInfoSuccess:(ApiSuccessCallback)success Error:(ApiErrorCallback)error Failed:(ApiFailedCallback)failed;
@end
