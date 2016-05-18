//
//  RFLocationServiceEnableListener.h
//  GuoZhongBao
//
//  Created by baolicheng on 15/7/23.
//  Copyright (c) 2015年 RenRenFenQi. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface RFLocationServiceEnableListener : NSObject
{
    BOOL currentIsEnable;
    BOOL lastIsEnable;
    NSTimer *timer;
    
    NSString *uid;
    NSString *token;
}
+(id)defaultManager;
-(void)startListenWithUid:(NSString *)myUid WithToken:(NSString *)myToken;
-(void)stopListen;
@end
