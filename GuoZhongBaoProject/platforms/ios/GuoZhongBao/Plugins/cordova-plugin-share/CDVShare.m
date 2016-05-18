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

#import "CDVShare.h"
#import <Cordova/CDV.h>
#import "ShareManage.h"
#import "GlobalAPI.h"

@implementation CDVShare
-(void)share:(CDVInvokedUrlCommand*)command
{
    currentCallBackId = command.callbackId;
    NSDictionary *dic = [command argumentAtIndex:0];
    if (dic) {
        NSString *para = [[dic objectForKey:@"type"] stringValue];
        NSString *code = [dic objectForKey:@"exchangeCode"];
        if(para == nil || code == nil){
            [self failWithCallbackID:currentCallBackId withMessage:@"Json字符串Key-value键值对有问题!"];
            return;
        }
        if ([para isEqualToString:@"0"]) {
            [[ShareManage GetInstance] shareVideoToWeixinPlatform:0 themeUrl:[NSString stringWithFormat:@"%@code=%@&native=true",ShareURL,code] thumbnail:[UIImage imageNamed:@"Icon.png"] title:@"5分钟不到，国众宝就送了我50元现金红包，   你也来试试呗！" descript:[NSString stringWithFormat:@"注册赚钱，邀请赚钱，100%%有钱拿！心动不如心动吧，别忘了填写邀请码：%@",code]];
        }
        
        if ([para isEqualToString:@"1"]) {
            [[ShareManage GetInstance] shareToQQZoneWithShareURL:[NSString stringWithFormat:@"%@code=%@&native=true",ShareURL,code] WithTitle:@"5分钟不到，国众宝就送了我50元现金红包，   你也来试试呗！" WithDescription:[NSString stringWithFormat:@"注册赚钱，邀请赚钱，100%%有钱拿！心动不如心动吧，别忘了填写邀请码：%@",code] WithPreviewImageUrl:@"Icon.png"];
        }
        
        if ([para isEqualToString:@"2"]) {
            [[ShareManage GetInstance] shareVideoToWeixinPlatform:1 themeUrl:[NSString stringWithFormat:@"%@code=%@&native=true",ShareURL,code] thumbnail:[UIImage imageNamed:@"Icon.png"] title:@"5分钟不到，国众宝就送了我50元现金红包，   你也来试试呗！" descript:[NSString stringWithFormat:@"注册赚钱，邀请赚钱，100%%有钱拿！心动不如心动吧，别忘了填写邀请码：%@",code]];
        }
    }
}

-(void)popToIndex:(CDVInvokedUrlCommand*)command
{
    currentCallBackId = command.callbackId;
    [[ShareManage GetInstance] popToIndex];
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
