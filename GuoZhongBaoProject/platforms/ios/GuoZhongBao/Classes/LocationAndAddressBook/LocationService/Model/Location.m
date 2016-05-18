//
//  Location.m
//  GuoZhongBao
//
//  Created by baolicheng on 15/7/14.
//  Copyright (c) 2015年 RenRenFenQi. All rights reserved.
//

#import "Location.h"

@implementation Location
-(NSDictionary *)jsonDictionary
{
    NSMutableDictionary *dic = [[NSMutableDictionary alloc] init];
    [dic setObject:[NSString stringWithFormat:@"%f,%f",_lat,_lng] forKey:@"location"];
    [dic setObject:[NSString stringWithFormat:@"%.0f",_time] forKey:@"time"];
    [dic setObject:[NSString stringWithFormat:@"%ld",(long)_modelId] forKey:@"mode_id"];
    [dic setObject:_docs forKey:@"docs"];
    return [NSDictionary dictionaryWithDictionary:dic];
}
@end
