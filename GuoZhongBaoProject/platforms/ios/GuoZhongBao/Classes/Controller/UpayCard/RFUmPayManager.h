//
//  RFUmPayManager.h
//  GuoZhongBao
//
//  Created by baolicheng on 15/8/20.
//
//

#import <Foundation/Foundation.h>

@interface RFUmPayManager : NSObject
+(id)defaultManager;
-(void)umpayWithTaskId:(NSString *)taskId WithUid:(NSString *)uid WithToken:(NSString *)token;
@end
