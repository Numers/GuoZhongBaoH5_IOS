//
//  CDVAlipay.m
//  X5
//
//  Created by 007slm on 12/8/14.
//
//

#import "CDVAlipay.h"
#import <CommonCrypto/CommonDigest.h>
#import <AlipaySDK/AlipaySDK.h>
#import "CDVAlipayDefine.h"
#import "CDVAlipayOrder.h"

@implementation CDVAlipay
-(void)handleOpenURL:(NSNotification *)notification{
    NSURL* url = [notification object];
    //跳转支付宝钱包进行支付，需要将支付宝钱包的支付结果回传给SDK
    if (url!=nil && [url.host isEqualToString:@"safepay"]) {
        [[AlipaySDK defaultService]
         processOrderWithPaymentResult:url
         standbyCallback:^(NSDictionary *resultDic) {
             NSLog(@"%@", resultDic);
             if (resultDic)
             {
                 NSString *jsonString = [self jsonStringWithDictionary:resultDic];
                 if ([[resultDic objectForKey:@"resultStatus"] intValue] == 9000)
                 {
                     [self successWithCallbackID:self.currentCallbackId withMessage:jsonString];
                 }
                 else
                 {
                     [self failWithCallbackID:self.currentCallbackId withMessage:jsonString];
                 }
             }
             else
             {
                  [self failWithCallbackID:self.currentCallbackId withMessage:@"还款失败"];
             }
         }];
    }
}


- (void)payment:(CDVInvokedUrlCommand*)command{
    
    self.currentCallbackId = command.callbackId;

    [self.commandDelegate runInBackground:^{
        // check arguments
         NSDictionary *params  = [command.arguments objectAtIndex:0];
        
        if (!params)
        {
            [self failWithCallbackID:self.currentCallbackId withMessage:@"参数格式错误"];
            return ;
        }
        
        /*
         *生成订单信息及签名
         */
        CDVAlipayOrder *order = [[CDVAlipayOrder alloc] init];
        order.partner = PartnerID;
        order.seller = SellerID;
        order.tradeNO = [params objectForKey:@"repaybusinessno"]; //订单ID（由商家自行制定）
        order.productName = [params objectForKey:@"name"]; //商品标题
        order.productDescription = [params objectForKey:@"desc"]; //商品描述
        order.amount = params[@"money"] ; //商品价格
        order.notifyURL = params[@"alipay_notifyurl"]; //回调URL
        
        order.service = @"mobile.securitypay.pay";
        order.paymentType = @"1";
        order.inputCharset = @"utf-8";
        order.itBPay = @"30m";
        order.showUrl = @"m.alipay.com";
        
        NSString *orderString = [order descriptionWithSign:@"RSA"];

        //应用注册scheme,在AlixPayDemo-Info.plist定义URL types
        CDVViewController *viewController = (CDVViewController *)self.viewController;
        self.alipayScheme = APP_SCHEME;
       
       [[AlipaySDK defaultService] payOrder:orderString fromScheme:self.alipayScheme callback:^(NSDictionary *resultDic) {
           if (resultDic)
           {
               NSString *jsonString = [self jsonStringWithDictionary:resultDic];
               if ([[resultDic objectForKey:@"resultStatus"] intValue] == 9000)
               {
                   [self successWithCallbackID:self.currentCallbackId withMessage:jsonString];
               }
               else
               {
                   [self failWithCallbackID:self.currentCallbackId withMessage:jsonString];
               }
           }
           else
           {
               [self failWithCallbackID:self.currentCallbackId withMessage:@"还款失败"];
           }
       }];
    }];
}

- (NSString *) jsonStringWithDictionary:(NSDictionary *) dictionary {
    
    NSString *jsonString = nil;
    
    NSError *error;
    NSData *jsonData = [NSJSONSerialization dataWithJSONObject:dictionary options:NSJSONWritingPrettyPrinted error:&error];
    if (error) {
        NSLog(@"Get an error: %@", error);
        jsonString = nil;
    } else {
        jsonString = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
    }
    
    return jsonString;
}

- (void)successWithCallbackID:(NSString *)callbackID withMessage:(NSString *)message
{
    CDVPluginResult *commandResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:message];
    [self.commandDelegate sendPluginResult:commandResult callbackId:callbackID];
}

- (void)failWithCallbackID:(NSString *)callbackID withMessage:(NSString *)message
{
    CDVPluginResult *commandResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:message];
    [self.commandDelegate sendPluginResult:commandResult callbackId:callbackID];
}
@end
