//
//  RFSMSVerifyViewController.h
//  GuoZhongBao
//
//  Created by baolicheng on 15/7/2.
//  Copyright (c) 2015年 RenRenFenQi. All rights reserved.
//

#import <UIKit/UIKit.h>
@protocol RFUpayCardViewProtocol <NSObject>
-(void)dismiss;
@end
@class BankCard;
@interface RFSMSVerifyViewController : UIViewController
@property(nonatomic, assign) id<RFUpayCardViewProtocol> delegate;
-(id)initWithTradeNo:(NSString *)tradeNo WithUid:(NSString *)myuid WithToken:(NSString *)mytoken WithBank:(BankCard *)bank;
@end
