//
//  RFNetWorkManager.m
//  renrenfenqi
//
//  Created by baolicheng on 15/6/29.
//  Copyright (c) 2015年 RenRenFenQi. All rights reserved.
//

#import "RFNetWorkManager.h"
#import "UIView+Toast.h"
static AFHTTPRequestOperationManager *requestManager;
static RFNetWorkManager *rfNetWorkManager;
@implementation RFNetWorkManager
+(id)defaultManager
{
    if (rfNetWorkManager == nil) {
        rfNetWorkManager = [[RFNetWorkManager alloc] init];
        requestManager = [AFHTTPRequestOperationManager manager];
        [requestManager.requestSerializer setTimeoutInterval:TimeOut];
    }
    return rfNetWorkManager;
}
-(void)post:(NSString *)url parameters:(id)parameters success:(ApiSuccessCallback)success error:(ApiErrorCallback)error failed:(ApiFailedCallback)failed
{
    NSString *encodeUrl = [url stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
    [requestManager POST:encodeUrl parameters:parameters success:^(AFHTTPRequestOperation *operation, id responseObject) {
        NSDictionary* jsonData = [operation.responseString objectFromJSONString];
        NSInteger status = [[jsonData objectForKey:@"status"] integerValue];
        if (status == 200) {
            success(operation,responseObject);
        }else{
            error(operation,responseObject);
        }
    } failure:^(AFHTTPRequestOperation *operation, NSError *error) {
        failed(operation, error);
    }];
}

-(void)get:(NSString *)url parameters:(id)parameters success:(ApiSuccessCallback)success error:(ApiErrorCallback)error failed:(ApiFailedCallback)failed
{
    NSString *encodeUrl = [url stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
    [requestManager GET:encodeUrl parameters:parameters success:^(AFHTTPRequestOperation *operation, id responseObject) {
        NSDictionary* jsonData = [operation.responseString objectFromJSONString];
        NSInteger status = [[jsonData objectForKey:@"status"] integerValue];
        if (status == 200) {
            success(operation,responseObject);
        }else{
            error(operation,responseObject);
        }
    } failure:^(AFHTTPRequestOperation *operation, NSError *error) {
        failed(operation, error);
    }];

}

-(void)showMessage:(NSString*)message
{
    UIWindow *window = [UIApplication sharedApplication].keyWindow;
    [window makeToast:message duration:2.5 position:CSToastPositionCenter];
}
@end
