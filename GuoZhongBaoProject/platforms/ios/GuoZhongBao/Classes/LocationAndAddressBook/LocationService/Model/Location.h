//
//  Location.h
//  GuoZhongBao
//
//  Created by baolicheng on 15/7/14.
//  Copyright (c) 2015年 RenRenFenQi. All rights reserved.
//

#import <Foundation/Foundation.h>
@interface Location : NSObject
@property(nonatomic) float lat;
@property(nonatomic) float lng;
@property(nonatomic) NSTimeInterval time;
@property(nonatomic) NSInteger modelId;
@property(nonatomic, copy) NSString *docs;

-(NSDictionary *)jsonDictionary;
@end
