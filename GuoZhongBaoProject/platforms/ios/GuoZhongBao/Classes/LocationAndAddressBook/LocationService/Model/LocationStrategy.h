//
//  LocationStrategy.h
//  GuoZhongBao
//
//  Created by baolicheng on 15/7/27.
//  Copyright (c) 2015年 RenRenFenQi. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface LocationStrategy : NSObject
@property(nonatomic) NSInteger modeId;
@property(nonatomic, copy) NSString *code;
@property(nonatomic, copy) NSString *cName;
@property(nonatomic) NSInteger isState;
@property(nonatomic, strong) NSMutableArray *subStrategyList;

-(id)initWithDic:(NSDictionary *)dic;
@end
