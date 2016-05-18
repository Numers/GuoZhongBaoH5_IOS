//
//  RFUmpayNetWorkAPIManager.m
//  GuoZhongBao
//
//  Created by baolicheng on 15/8/20.
//
//

#import "RFUmpayNetWorkAPIManager.h"
static RFUmpayNetWorkAPIManager *rfUmpayNetWorkAPIManager;
@implementation RFUmpayNetWorkAPIManager
+(id)defaultManager
{
    if (rfUmpayNetWorkAPIManager == nil) {
        rfUmpayNetWorkAPIManager = [[RFUmpayNetWorkAPIManager alloc] init];
    }
    return rfUmpayNetWorkAPIManager;
}

-(void)getTradeNoWithTaskid:(NSString *)taskid WithUid:(NSString *)uid WithToken:(NSString *)token success:(ApiSuccessCallback)success error:(ApiErrorCallback)error failed:(ApiFailedCallback)failed
{
    if (uid && token && taskid) {
        NSString *url = [NSString stringWithFormat:@"%@%@", API_GZB, API_REQUESTTRADENO];
        NSDictionary *parameters = [NSDictionary dictionaryWithObjectsAndKeys:uid,@"uid",token,@"token",taskid,@"taskid", nil];
        [[RFNetWorkManager defaultManager] post:url parameters:parameters success:^(AFHTTPRequestOperation *operation, id responseObject) {
            success(operation,responseObject);
        } error:^(AFHTTPRequestOperation *operation, id responseObject) {
            [[RFNetWorkManager defaultManager] showMessage:[responseObject objectForKey:@"message"]];
            error(operation,responseObject);
        } failed:^(AFHTTPRequestOperation *operation, NSError *error) {
            [[RFNetWorkManager defaultManager] showMessage:error.description];
            failed(operation,error);
        }];
    }
}

-(void)requestUpayCardWithUid:(NSString *)uid WithToken:(NSString *)token Success:(ApiSuccessCallback)success Error:(ApiErrorCallback)error Failed:(ApiFailedCallback)failed
{
    if (uid && token) {
        NSString *url = [NSString stringWithFormat:@"%@%@", API_GZB, API_GETUPAYCARD];
        NSDictionary *parameters = [NSDictionary dictionaryWithObjectsAndKeys:uid,@"uid",token,@"token", nil];
        [[RFNetWorkManager defaultManager] post:url parameters:parameters success:^(AFHTTPRequestOperation *operation, id responseObject) {
            success(operation,responseObject);
        } error:^(AFHTTPRequestOperation *operation, id responseObject) {
            [[RFNetWorkManager defaultManager] showMessage:[responseObject objectForKey:@"message"]];
            error(operation,responseObject);
            
        } failed:^(AFHTTPRequestOperation *operation, NSError *error) {
            [[RFNetWorkManager defaultManager] showMessage:error.description];
            failed(operation,error);
        }];
    }
}

-(void)checkSmsVerifyWithTradeNo:(NSString *)tradeNo WithUid:(NSString *)uid WithToken:(NSString *)token WithPayAgreementId:(NSString *)payAgreementId WithVerifyCode:(NSString *)code Success:(ApiSuccessCallback)success Error:(ApiErrorCallback)error Failed:(ApiFailedCallback)failed
{
    if (tradeNo && uid && token && payAgreementId && code) {
        NSString *url = [NSString stringWithFormat:@"%@%@",API_GZB,API_COMFIRMSHORTCUT];
        NSDictionary *para = [NSDictionary dictionaryWithObjectsAndKeys:uid,@"uid",token,@"token",tradeNo,@"trade_no",payAgreementId,@"usr_pay_agreement_id",code,@"verify_code",uid,@"mer_cust_id", nil];
        [[RFNetWorkManager defaultManager] post:url parameters:para success:^(AFHTTPRequestOperation *operation, id responseObject) {
            [[RFNetWorkManager defaultManager] showMessage:@"支付成功"];
            success(operation,responseObject);
        } error:^(AFHTTPRequestOperation *operation, id responseObject) {
            [[RFNetWorkManager defaultManager] showMessage:[responseObject objectForKey:@"message"]];
            error(operation,responseObject);
        } failed:^(AFHTTPRequestOperation *operation, NSError *error) {
            [[RFNetWorkManager defaultManager] showMessage:error.description];
            failed(operation,error);
        }];
    }
}

-(void)requestSmsVerifyWithTradeNo:(NSString *)tradeNo WithUid:(NSString *)uid WithToken:(NSString *)token WithPayAgreementId:(NSString *)payAgreementId Success:(ApiSuccessCallback)success Error:(ApiErrorCallback)error Failed:(ApiFailedCallback)failed
{
    if (tradeNo && uid && token && payAgreementId) {
        NSString *url = [NSString stringWithFormat:@"%@%@",API_GZB,API_SMSVERIFY];
        NSDictionary *para = [NSDictionary dictionaryWithObjectsAndKeys:uid,@"uid",token,@"token",tradeNo,@"trade_no",payAgreementId,@"usr_pay_agreement_id", nil];
        [[RFNetWorkManager defaultManager] post:url parameters:para success:^(AFHTTPRequestOperation *operation, id responseObject) {
            success(operation,responseObject);
        } error:^(AFHTTPRequestOperation *operation, id responseObject) {
            [[RFNetWorkManager defaultManager] showMessage:[responseObject objectForKey:@"message"]];
            error(operation,responseObject);
        } failed:^(AFHTTPRequestOperation *operation, NSError *error) {
            [[RFNetWorkManager defaultManager] showMessage:error.description];
            failed(operation,error);
        }];
    }
}
@end
