//
//  RFUmPayManager.m
//  GuoZhongBao
//
//  Created by baolicheng on 15/8/20.
//
//

#import "RFUmPayManager.h"
#import "RFUmpayNetWorkAPIManager.h"
#import "BankCard.h"
#import "Umpay.h"
#import "RFUpayCardViewController.h"
static RFUmPayManager *rfUmPayManager;
@implementation RFUmPayManager
+(id)defaultManager
{
    if (rfUmPayManager == nil) {
        rfUmPayManager = [[RFUmPayManager alloc] init];
    }
    return rfUmPayManager;
}

-(void)umpayWithTaskId:(NSString *)taskId WithUid:(NSString *)uid WithToken:(NSString *)token
{
    NSString *sendUid = [NSString stringWithFormat:@"%@",uid];
    [[RFUmpayNetWorkAPIManager defaultManager] getTradeNoWithTaskid:taskId WithUid:sendUid WithToken:token success:^(AFHTTPRequestOperation *operation, id responseObject) {
        NSDictionary *resultDic = (NSDictionary *)responseObject;
        if (resultDic) {
            NSDictionary *dataDic = [resultDic objectForKey:@"data"];
            if (dataDic) {
                NSString *tradeNo = [dataDic objectForKey:@"trade_no"];
                [self requestUpayCardWithTradeNo:tradeNo WithUid:sendUid WithToken:token];
            }
        }
    } error:^(AFHTTPRequestOperation *operation, id responseObject) {
        
    } failed:^(AFHTTPRequestOperation *operation, NSError *error) {
        
    }];
}

/*
 获取用户绑定的银行卡号
 */

-(void)requestUpayCardWithTradeNo:(NSString *)tradeNo WithUid:(NSString *)uid WithToken:(NSString *)token
{
    [[RFUmpayNetWorkAPIManager defaultManager] requestUpayCardWithUid:uid WithToken:token Success:^(AFHTTPRequestOperation *operation, id responseObject) {
        NSDictionary *resultDic = (NSDictionary *)responseObject;
        if (resultDic) {
            NSArray *dataArr = [resultDic objectForKey:@"data"];
            if (dataArr) {
                NSMutableArray *arr = [[NSMutableArray alloc] init];
                for (NSDictionary *m in dataArr) {
                    BankCard *bankCard = [[BankCard alloc] init];
                    [bankCard setUpWithDictionary:m];
                    [arr addObject:bankCard];
                }
                
                if (arr.count > 0) {
                    RFUpayCardViewController *rfUpayCardVC = [[RFUpayCardViewController alloc] initWithTradeNo:tradeNo WithUid:uid WithToken:token WithBankCardArray:arr];
                    UINavigationController *nav = [[UINavigationController alloc] initWithRootViewController:rfUpayCardVC];
                    [[UIApplication sharedApplication].keyWindow.rootViewController presentViewController:nav animated:YES completion:nil];
                }else{
                    NSString *myUid = nil;
                    if ([uid isKindOfClass:[NSNumber class]]) {
                        myUid = [NSString stringWithFormat:@"%@",uid];
                    }else{
                        myUid = uid;
                    }
                    [Umpay pay:tradeNo merCustId:myUid shortBankName:nil cardType:@"0" payDic:nil rootViewController:[UIApplication sharedApplication].keyWindow.rootViewController];
                }
            }
        }
    } Error:^(AFHTTPRequestOperation *operation, id responseObject) {
        
    } Failed:^(AFHTTPRequestOperation *operation, NSError *error) {
        
    }];
}
@end
