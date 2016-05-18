//
//  Contact.h
//  GuoZhongBao
//
//  Created by baolicheng on 15/7/13.
//  Copyright (c) 2015年 RenRenFenQi. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface Contact : NSObject
@property(nonatomic, copy) NSString *firstName;//姓
@property(nonatomic, copy) NSString *lastName;//名字
@property(nonatomic, copy) NSString *nickName;//昵称
@property(nonatomic, copy) NSString *companyName;//公司名
@property(nonatomic, copy) NSString *jobTitle;//职位
@property(nonatomic, copy) NSString *departmentName;//部分
@property(nonatomic, strong) NSMutableArray *emailList;//邮箱列表
@property(nonatomic, strong) NSDate *birthday;//生日
@property(nonatomic, copy) NSString *note;//备注
@property(nonatomic, strong) NSMutableArray *phoneList;//电话列表
@property(nonatomic, strong) NSMutableArray *telPhoneList;//座机电话列表

-(NSDictionary *)jsonDictionary;
@end
