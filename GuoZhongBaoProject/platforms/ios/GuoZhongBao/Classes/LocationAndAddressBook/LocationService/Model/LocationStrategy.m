//
//  LocationStrategy.m
//  GuoZhongBao
//
//  Created by baolicheng on 15/7/27.
//  Copyright (c) 2015年 RenRenFenQi. All rights reserved.
//

#import "LocationStrategy.h"

@implementation LocationStrategy
-(id)initWithDic:(NSDictionary *)dic
{
    self = [super init];
    if (self) {
        _subStrategyList = [[NSMutableArray alloc] init];
        if (dic) {
            id objModeId = [dic objectForKey:@"mode_id"];
            if (objModeId) {
                _modeId = [objModeId integerValue];
            }
            
            id objCode = [dic objectForKey:@"code"];
            if (objCode) {
                _code = [objCode copy];
            }
            
            id objCname = [dic objectForKey:@"cname"];
            if (objCname) {
                _cName = [objCname copy];
            }
            
            id objState = [dic objectForKey:@"is_state"];
            if (objState) {
                _isState = [objState integerValue];
            }
            
            id objSub = [dic objectForKey:@"sub"];
            if (objSub) {
                NSArray *subArr = (NSArray *)objSub;
                if (subArr && subArr.count > 0) {
                    for (NSDictionary *m in subArr) {
                        LocationStrategy *sub = [[LocationStrategy alloc] initWithDic:m];
                        if ([sub.code isEqualToString:@"ios"]) {
                            [_subStrategyList addObject:sub];
                        }
                    }
                }
            }
        }
    }
    return self;
}
@end
