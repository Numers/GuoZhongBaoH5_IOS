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

#import "CDVCookieStore.h"
#import <Cordova/CDV.h>

@implementation CDVCookieStore
-(void)get:(CDVInvokedUrlCommand*)command
{
    currentCallBackId = command.callbackId;
    NSString *key = [command argumentAtIndex:0];
    if (key) {
        NSDictionary *userInfoDic = [[NSUserDefaults standardUserDefaults] objectForKey:key];
        if (userInfoDic) {
            [self successWithCallbackID:currentCallBackId withMessageDictionary:userInfoDic];
        }else{
            [self failWithCallbackID:currentCallBackId withMessage:@"本地无信息存储"];
        }
    }else{
        [self failWithCallbackID:currentCallBackId withMessage:@"key为空"];
    }
}

-(void)put:(CDVInvokedUrlCommand*)command
{
    currentCallBackId = command.callbackId;
    NSString *key = [command argumentAtIndex:0];
    NSDictionary *userInfoDic = [command argumentAtIndex:1];
    if (userInfoDic && key) {
        [self.commandDelegate runInBackground:^{
            [[NSUserDefaults standardUserDefaults] setObject:userInfoDic forKey:key];
            [[NSUserDefaults standardUserDefaults] synchronize];
        }];
        [self successWithCallbackID:currentCallBackId withMessageDictionary:userInfoDic];
    }else{
        if (!key) {
            [self failWithCallbackID:currentCallBackId withMessage:@"key-value参数格式错误"];
        }
    }
}

-(void)update:(CDVInvokedUrlCommand*)command
{
    [self put:command];
}

-(void)remove:(CDVInvokedUrlCommand*)command
{
    currentCallBackId = command.callbackId;
    NSString *key = [command argumentAtIndex:0];
    if (key) {
        [self.commandDelegate runInBackground:^{
             [[NSUserDefaults standardUserDefaults] removeObjectForKey:key];
        }];
        [self successWithCallbackID:currentCallBackId withMessage:nil];
    }else{
        [self failWithCallbackID:currentCallBackId withMessage:@"key为空"];
    }
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
