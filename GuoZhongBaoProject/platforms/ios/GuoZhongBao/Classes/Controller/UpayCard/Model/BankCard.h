//
//  BankCard.h
//  GuoZhongBao
//
//  Created by baolicheng on 15/7/2.
//  Copyright (c) 2015年 RenRenFenQi. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface BankCard : NSObject
@property(nonatomic, copy) NSString *card;
@property(nonatomic, copy) NSString *usrPayAgreementId;
@property(nonatomic, copy) NSString *payType;
@property(nonatomic, copy) NSString *gateId;
@property(nonatomic, copy) NSString *mediaId;
@property(nonatomic, copy) NSString *bankName;

-(void)setUpWithDictionary:(NSDictionary *)dic;
@end
