/*
 Licensed to the Apache Software Foundation (ASF) under one
 or more contributor license agreements.  See the NOTICE file
 distributed with this work for additional information
 regarding copyright ownership.  The ASF licenses this file
 to you under the Apache License, Version 2.0 (the
 "License"); you may not use this file except in compliance
 with the License.  You may obtain a copy of the License at
 
 http://www.apache.org/licenses/LICENSE-2.0
 
 Unless required by applicable law or agreed to in writing,
 software distributed under the License is distributed on an
 "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 KIND, either express or implied.  See the License for the
 specific language governing permissions and limitations
 under the License.
 */

#import "CDVUserInfo.h"
#import <Cordova/CDV.h>

#define APPUSERINFODICTIONARY @"AppUserInfoDictionary"
@implementation CDVUserInfo
-(void)get:(CDVInvokedUrlCommand*)command
{
    currentCallBackId = command.callbackId;
    NSDictionary *userInfoDic = [[NSUserDefaults standardUserDefaults] objectForKey:APPUSERINFODICTIONARY];
    if (userInfoDic) {
        [self successWithCallbackID:currentCallBackId withMessageDictionary:userInfoDic];
    }else{
        [self failWithCallbackID:currentCallBackId withMessage:@"本地无用户信息存储"];
    }
}

-(void)put:(CDVInvokedUrlCommand*)command
{
    currentCallBackId = command.callbackId;
    NSDictionary *userInfoDic = [command argumentAtIndex:0];
    if (userInfoDic) {
        [self.commandDelegate runInBackground:^{
            [[NSUserDefaults standardUserDefaults] setObject:userInfoDic forKey:APPUSERINFODICTIONARY];
            [[NSUserDefaults standardUserDefaults] synchronize];
        }];
        [self successWithCallbackID:currentCallBackId withMessageDictionary:userInfoDic];
    }
}

-(void)update:(CDVInvokedUrlCommand*)command
{
    [self put:command];
}

-(void)del:(CDVInvokedUrlCommand*)command
{
    currentCallBackId = command.callbackId;
    [self.commandDelegate runInBackground:^{
        [[NSUserDefaults standardUserDefaults] removeObjectForKey:APPUSERINFODICTIONARY];
    }];
    [self successWithCallbackID:currentCallBackId withMessage:nil];
}

-(id)objectFromJsonString:(NSString *)jsonString
{
    if (!jsonString)
    {
        [self failWithCallbackID:currentCallBackId withMessage:@"参数格式错误"];
        return nil;
    }
    
    NSData *jsonData = [jsonString dataUsingEncoding:NSUTF8StringEncoding];
    NSError *err;
    id params = [NSJSONSerialization JSONObjectWithData:jsonData
                                                options:NSJSONReadingMutableContainers
                                                  error:&err];
    
    if (err)
    {
        [self failWithCallbackID:currentCallBackId withMessage:@"参数格式错误"];
        return nil;
    }
    return params;
}

- (void)successWithCallbackID:(NSString *)callbackID withMessageDictionary:(NSDictionary *)messageDic
{
    CDVPluginResult *commandResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:messageDic];
    [commandResult setKeepCallback:[NSNumber numberWithInteger:1]];
    [self.commandDelegate sendPluginResult:commandResult callbackId:callbackID];
}

- (void)successWithCallbackID:(NSString *)callbackID withMessage:(NSString *)message
{
    CDVPluginResult *commandResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:message];
    [commandResult setKeepCallback:[NSNumber numberWithInteger:1]];
    [self.commandDelegate sendPluginResult:commandResult callbackId:callbackID];
}

- (void)failWithCallbackID:(NSString *)callbackID withMessage:(NSString *)message
{
    CDVPluginResult *commandResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:message];
    [commandResult setKeepCallback:[NSNumber numberWithInteger:1]];
    [self.commandDelegate sendPluginResult:commandResult callbackId:callbackID];
}
@end
