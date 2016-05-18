//
//  RFLocationServiceManager.m
//  CordovaDemo
//
//  Created by baolicheng on 15/8/5.
//
//

#import "RFLocationServiceManager.h"
#import "RFLocationEngine.h"
static RFLocationServiceManager *rfLocationServiceManager;
static RFLocationEngine *rfLocationEngine;
@implementation RFLocationServiceManager
+(id)defaultManager
{
    if (rfLocationServiceManager == nil) {
        rfLocationServiceManager = [[RFLocationServiceManager alloc] init];
    }
    return rfLocationServiceManager;
}

-(void)startServiceWithUid:(NSString *)uid WithToken:(NSString *)token
{
    NSString *sendUid = [NSString stringWithFormat:@"%@",uid];
    if (rfLocationEngine) {
        if ([sendUid isEqualToString:[rfLocationEngine getUserId]]) {
            return;
        }
        [rfLocationEngine stopEngineWithUpload:YES];
    }else{
        rfLocationEngine = [[RFLocationEngine alloc] init];
    }
    
    [rfLocationEngine startEngineWithUid:sendUid WithToken:token];
}

-(void)stopService
{
    if (rfLocationEngine) {
        [rfLocationEngine stopEngineWithUpload:YES];
        rfLocationEngine = nil;
    }
}
@end
