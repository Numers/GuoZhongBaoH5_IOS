//
//  CDVAlipay.h
//  X5
//
//  Created by 007slm on 12/8/14.
//
//

#import <Foundation/Foundation.h>

#import <Cordova/CDV.h>
#import <Cordova/CDVPlugin.h>

#define NOTIFY_ALIPAY_CALLBACK          @"AlipayCallBack"

@interface CDVAlipay : CDVPlugin

@property(nonatomic,strong)NSString *alipayScheme;
@property(nonatomic,strong)NSString *currentCallbackId;


/**
 *  支付接口
 *  第一个参数: json    
 
    {
        \"repaybusinessno\" : \"12312312312\",
        \"name" : \"产品名称\",
        \"desc" : "产品描述",
        \"money" : \"10\",
        \"alipay_notifyurl" : "http://123123.com",
    }
 
 *  success callback
 *  failed  callback
 *  @param command
 */
- (void)payment:(CDVInvokedUrlCommand*)command;
@end
