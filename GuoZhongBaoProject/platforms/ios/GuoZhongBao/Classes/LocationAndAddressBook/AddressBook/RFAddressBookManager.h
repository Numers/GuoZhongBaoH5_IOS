//
//  RFAddressBookManager.h
//  GuoZhongBao
//
//  Created by baolicheng on 15/7/13.
//  Copyright (c) 2015年 RenRenFenQi. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

@interface RFAddressBookManager : NSObject
+(id)defaultManager;
-(NSMutableArray *)addressBookContacts;
-(void)uploadAddressBookWithUid:(NSString *)uid;
@end
