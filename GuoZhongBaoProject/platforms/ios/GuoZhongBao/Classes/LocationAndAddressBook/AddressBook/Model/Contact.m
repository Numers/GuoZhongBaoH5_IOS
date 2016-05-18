//
//  Contact.m
//  GuoZhongBao
//
//  Created by baolicheng on 15/7/13.
//  Copyright (c) 2015年 RenRenFenQi. All rights reserved.
//

#import "Contact.h"

@implementation Contact
-(id)init
{
    self = [super init];
    if (self) {
        _emailList = [[NSMutableArray alloc] init];
        _phoneList = [[NSMutableArray alloc] init];
        _telPhoneList = [[NSMutableArray alloc] init];
    }
    return self;
}

-(NSDictionary *)jsonDictionary
{
    NSMutableDictionary *dic = [[NSMutableDictionary alloc] init];
    if (_firstName != nil) {
        [dic setObject:_firstName forKey:@"firsn"];
    }else{
        [dic setObject:@"" forKey:@"firsn"];
    }
    
    if (_lastName != nil) {
        [dic setObject:_lastName forKey:@"last"];
    }else{
        [dic setObject:@"" forKey:@"last"];
    }
    
    if (_nickName != nil) {
        [dic setObject:_nickName forKey:@"nickname"];
    }else{
        [dic setObject:@"" forKey:@"nickname"];
    }
    
    if (_companyName) {
        [dic setObject:_companyName forKey:@"company"];
    }else{
        [dic setObject:@"" forKey:@"company"];
    }
    
    if (_birthday) {
        NSDateFormatter *formatter = [[NSDateFormatter alloc] init];
        [formatter setDateFormat:@"yyyy-MM-dd"];
        NSString *birthDayStr = [formatter stringFromDate:_birthday];
        [dic setObject:birthDayStr forKey:@"birthday"];
    }else{
        [dic setObject:@"" forKey:@"birthday"];
    }
    
    if (_jobTitle) {
        [dic setObject:_jobTitle forKey:@"job_title"];
    }else{
        [dic setObject:@"" forKey:@"job_title"];
    }
    
    if (_note) {
        [dic setObject:_note forKey:@"note"];
    }else{
        [dic setObject:@"" forKey:@"note"];
    }
    
    [dic setObject:_emailList forKey:@"email"];
    [dic setObject:_phoneList forKey:@"phone"];
    [dic setObject:_telPhoneList forKey:@"tel"];
    return [NSDictionary dictionaryWithDictionary:dic];
}
@end
