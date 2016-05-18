//
//  RFUpayCardViewController.h
//  GuoZhongBao
//
//  Created by baolicheng on 15/7/2.
//  Copyright (c) 2015年 RenRenFenQi. All rights reserved.
//

#import <UIKit/UIKit.h>
@interface RFUpayCardViewController : UIViewController
-(id)initWithTradeNo:(NSString *)tradeno WithUid:(NSString *)myuid WithToken:(NSString *)mytoken WithBankCardArray:(NSArray *)bankCardArr;
@end
