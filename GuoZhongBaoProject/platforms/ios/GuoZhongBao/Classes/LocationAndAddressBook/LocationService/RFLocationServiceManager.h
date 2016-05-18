//
//  RFLocationServiceManager.h
//  CordovaDemo
//
//  Created by baolicheng on 15/8/5.
//
//

#import <Foundation/Foundation.h>

@interface RFLocationServiceManager : NSObject
+(id)defaultManager;
-(void)startServiceWithUid:(NSString *)uid WithToken:(NSString *)token;
-(void)stopService;
@end
