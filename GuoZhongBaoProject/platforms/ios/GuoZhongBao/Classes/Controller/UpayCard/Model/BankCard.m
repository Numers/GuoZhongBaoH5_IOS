//
//  BankCard.m
//  GuoZhongBao
//
//  Created by baolicheng on 15/7/2.
//  Copyright (c) 2015年 RenRenFenQi. All rights reserved.
//

#import "BankCard.h"

@implementation BankCard
-(void)setUpWithDictionary:(NSDictionary *)dic
{
    if (dic) {
        _card = [dic objectForKey:@"card"];
        _usrPayAgreementId = [dic objectForKey:@"usr_pay_agreement_id"];
        _payType = [dic objectForKey:@"pay_type"];
        _gateId = [dic objectForKey:@"gate_id"];
        _mediaId = [dic objectForKey:@"media_id"];
        _bankName = [dic objectForKey:@"bankname"];
    }
}
@end
