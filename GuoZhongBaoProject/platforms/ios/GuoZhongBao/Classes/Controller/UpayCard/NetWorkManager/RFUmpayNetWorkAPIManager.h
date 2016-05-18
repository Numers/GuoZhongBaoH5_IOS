//
//  RFUmpayNetWorkAPIManager.h
//  GuoZhongBao
//
//  Created by baolicheng on 15/8/20.
//
//

#import <Foundation/Foundation.h>
#import "RFUmPayAPI.h"
@interface RFUmpayNetWorkAPIManager : NSObject
+(id)defaultManager;
-(void)getTradeNoWithTaskid:(NSString *)taskid WithUid:(NSString *)uid WithToken:(NSString *)token success:(ApiSuccessCallback)success error:(ApiErrorCallback)error failed:(ApiFailedCallback)failed;
-(void)requestUpayCardWithUid:(NSString *)uid WithToken:(NSString *)token Success:(ApiSuccessCallback)success Error:(ApiErrorCallback)error Failed:(ApiFailedCallback)failed;
-(void)checkSmsVerifyWithTradeNo:(NSString *)tradeNo WithUid:(NSString *)uid WithToken:(NSString *)token WithPayAgreementId:(NSString *)payAgreementId WithVerifyCode:(NSString *)code Success:(ApiSuccessCallback)success Error:(ApiErrorCallback)error Failed:(ApiFailedCallback)failed;

-(void)requestSmsVerifyWithTradeNo:(NSString *)tradeNo WithUid:(NSString *)uid WithToken:(NSString *)token WithPayAgreementId:(NSString *)payAgreementId Success:(ApiSuccessCallback)success Error:(ApiErrorCallback)error Failed:(ApiFailedCallback)failed;
@end
