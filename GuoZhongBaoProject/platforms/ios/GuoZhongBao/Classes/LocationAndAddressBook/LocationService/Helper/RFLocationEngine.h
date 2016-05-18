//
//  RFLocationEngine.h
//  GuoZhongBao
//
//  Created by baolicheng on 15/7/27.
//  Copyright (c) 2015年 RenRenFenQi. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface RFLocationEngine : NSObject
{
    BOOL isCheckComplete;
    NSArray *strategyList;
    NSMutableArray *notificationList;
    
    NSString *uid;
    NSString *token;
}
-(NSString *)getUserId;
-(void)startEngineWithUid:(NSString *)myUid WithToken:(NSString *)myToken;
-(void)stopEngineWithUpload:(BOOL)upload;
@end
