
//  RFNetWorkAPIManager.m
//  GuoZhongBao
//
//  Created by baolicheng on 15/7/2.
//  Copyright (c) 2015年 RenRenFenQi. All rights reserved.
//

#import "RFNetWorkAPIManager.h"
#import "Location.h"
#import "Contact.h"

#import "OpenUDID.h"
#import "APService.h"
static RFNetWorkAPIManager *rfNetWorkAPIManager;
static AFHTTPRequestOperationManager *requestManager;
@implementation RFNetWorkAPIManager
+(id)defaultManager
{
    if (rfNetWorkAPIManager == nil) {
        rfNetWorkAPIManager = [[RFNetWorkAPIManager alloc] init];
        requestManager = [AFHTTPRequestOperationManager manager];
        requestManager.requestSerializer.timeoutInterval = TimeOut;
    }
    return rfNetWorkAPIManager;
}

-(void)submitLocationInfoWithUid:(NSString *)uid WithLocationList:(NSMutableArray *)locationList Success:(ApiSuccessCallback)success Error:(ApiErrorCallback)error Failed:(ApiFailedCallback)failed;
{
    NSMutableArray *jsonArr = [[NSMutableArray alloc] init];
    for (Location *m in locationList) {
        NSDictionary *locationDic = [m jsonDictionary];
        [jsonArr addObject:locationDic];
    }
    [locationList removeAllObjects];
    NSDictionary *para = [NSDictionary dictionaryWithObjectsAndKeys:uid,@"user_id",[jsonArr JSONString],@"json_data",nil];
    NSString *url = [NSString stringWithFormat:@"%@%@",API_GZB,API_LocationInfoUpload];
    NSString *encodeUrl = [url stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
    [requestManager POST:encodeUrl parameters:para success:^(AFHTTPRequestOperation *operation, id responseObject) {
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

-(void)submitLocationInfoWithUid:(NSString *)uid WithLocationDicList:(NSMutableArray *)locationDicList Success:(ApiSuccessCallback)success Error:(ApiErrorCallback)error Failed:(ApiFailedCallback)failed
{
    NSDictionary *para = [NSDictionary dictionaryWithObjectsAndKeys:uid,@"user_id",[locationDicList JSONString],@"json_data",nil];
    NSString *url = [NSString stringWithFormat:@"%@%@",API_GZB,API_LocationInfoUpload];
    NSString *encodeUrl = [url stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
    [requestManager POST:encodeUrl parameters:para success:^(AFHTTPRequestOperation *operation, id responseObject) {
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

-(void)requestLocationModeSuccess:(ApiSuccessCallback)success Error:(ApiErrorCallback)error Failed:(ApiFailedCallback)failed
{
    NSString *url = [NSString stringWithFormat:@"%@%@",API_GZB,API_LocationModeRequest];
    NSString *encodeUrl = [url stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
    NSDictionary *para = [NSDictionary dictionaryWithObjectsAndKeys:@"ios",@"client", nil];
    [requestManager GET:encodeUrl parameters:para success:^(AFHTTPRequestOperation *operation, id responseObject) {
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

-(void)submitAddressBookWithUid:(NSString *)uid WithContactList:(NSMutableArray *)contactList Success:(ApiSuccessCallback)success Error:(ApiErrorCallback)error Failed:(ApiFailedCallback)failed
{
    NSMutableArray *jsonArr = [[NSMutableArray alloc] init];
    for (Contact *m in contactList) {
        NSDictionary *contactDic = [m jsonDictionary];
        [jsonArr addObject:contactDic];
    }
    NSDictionary *para = [NSDictionary dictionaryWithObjectsAndKeys:uid,@"user_id",[jsonArr JSONString],@"json_data",nil];
    NSString *url = [NSString stringWithFormat:@"%@%@",API_GZB,API_ContactInfoUpload];
    NSString *encodeUrl = [url stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
    AFHTTPRequestOperationManager *requestManager;
    requestManager = [AFHTTPRequestOperationManager manager];
    requestManager.requestSerializer.timeoutInterval = TimeOut;
    [requestManager POST:encodeUrl parameters:para success:^(AFHTTPRequestOperation *operation, id responseObject) {
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

-(void)submitPushInfoSuccess:(ApiSuccessCallback)success Error:(ApiErrorCallback)error Failed:(ApiFailedCallback)failed
{
    NSDictionary *userInfoDic = [[NSUserDefaults standardUserDefaults] objectForKey:@"AppUserInfoDictionary"];
    if (!userInfoDic) {
        return;
    }
    NSString *uid = [userInfoDic objectForKey:@"uid"];
    if (!uid) {
        return;
    }
    NSString *url = [NSString stringWithFormat:@"%@%@",API_GZB,API_PushInfo];
    NSString *encodeUrl = [url stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
    NSString *appid = [OpenUDID valueWithError:nil];
    NSString *clientId = [APService registrationID];
    NSDictionary *para = nil;
    if (uid) {
        para = [NSDictionary dictionaryWithObjectsAndKeys:clientId,@"client_id",appid,@"appid",@"2",@"client",uid,@"uid", nil];
    }else{
        para = [NSDictionary dictionaryWithObjectsAndKeys:clientId,@"client_id",appid,@"appid",@"2",@"client", nil];
    }
    AFHTTPRequestOperationManager *requestManager;
    requestManager = [AFHTTPRequestOperationManager manager];
    requestManager.requestSerializer.timeoutInterval = TimeOut;
    [requestManager GET:encodeUrl parameters:para success:^(AFHTTPRequestOperation *operation, id responseObject) {
        NSDictionary *resultDic = (NSDictionary *)responseObject;
        if (resultDic) {
            NSInteger code = [[resultDic objectForKey:@"code"] integerValue];
            if (code == 200) {
                success(operation, responseObject);
            }else{
                error(operation, responseObject);
            }
        }
    } failure:^(AFHTTPRequestOperation *operation, NSError *error) {
        failed(operation, error);
    }];
}
@end
