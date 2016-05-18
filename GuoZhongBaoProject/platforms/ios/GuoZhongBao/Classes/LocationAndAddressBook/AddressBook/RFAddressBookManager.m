//
//  RFAddressBookManager.m
//  GuoZhongBao
//
//  Created by baolicheng on 15/7/13.
//  Copyright (c) 2015年 RenRenFenQi. All rights reserved.
//

#import "RFAddressBookManager.h"
#import <AddressBook/AddressBook.h>
#import "Contact.h"
#import "RFNetWorkAPIManager.h"
#define ShouldUploadAddressBook @"ShouldUploadAddressBook"
static RFAddressBookManager *rfAddressBookManager;
@implementation RFAddressBookManager
+(id)defaultManager
{
    if (rfAddressBookManager == nil) {
        rfAddressBookManager = [[RFAddressBookManager alloc] init];
    }
    return rfAddressBookManager;
}

-(void)uploadAddressBookWithUid:(NSString *)uid
{
    if (!uid) {
        return;
    }
    
    if (![self shouldUploadAddressBookWithUid:uid]) {
        return;
    }
    
    NSMutableArray *contactList = [self addressBookContacts];
    if (contactList.count == 0) {
        return;
    }
    
    [[RFNetWorkAPIManager defaultManager] submitAddressBookWithUid:uid WithContactList:contactList Success:^(AFHTTPRequestOperation *operation, id responseObject) {
        NSNumber *num = [NSNumber numberWithBool:NO];
        NSString *key = [NSString stringWithFormat:@"%@_%@",ShouldUploadAddressBook,uid];
        [[NSUserDefaults standardUserDefaults] setObject:num forKey:key];
        [[NSUserDefaults standardUserDefaults] synchronize];
    } Error:^(AFHTTPRequestOperation *operation, id responseObject) {
        NSDictionary *resultDic = (NSDictionary *)responseObject;
        if (resultDic) {
            NSInteger statusCode = [[resultDic objectForKey:@"status"] integerValue];
            if (statusCode == 206) {
                NSNumber *num = [NSNumber numberWithBool:NO];
                NSString *key = [NSString stringWithFormat:@"%@_%@",ShouldUploadAddressBook,uid];
                [[NSUserDefaults standardUserDefaults] setObject:num forKey:key];
                [[NSUserDefaults standardUserDefaults] synchronize];
            }
        }
    } Failed:^(AFHTTPRequestOperation *operation, NSError *error) {
        
    }];
}

-(BOOL)shouldUploadAddressBookWithUid:(NSString *)uid
{
    if (uid) {
        NSString *key = [NSString stringWithFormat:@"%@_%@",ShouldUploadAddressBook,uid];
        id objShouldUpload = [[NSUserDefaults standardUserDefaults] objectForKey:key];
        if (objShouldUpload == nil) {
            return YES;
        }else{
            BOOL result = [objShouldUpload boolValue];
            return result;
        }
        return YES;
    }else{
        return NO;
    }
}

-(NSMutableArray *)addressBookContacts
{
    NSMutableArray *arr = [[NSMutableArray alloc] init];
    ABAddressBookRef tmpAddressBook = nil;
    
    if ([[UIDevice currentDevice].systemVersion floatValue]>=6.0) {
        tmpAddressBook=ABAddressBookCreateWithOptions(NULL, NULL);
        dispatch_semaphore_t sema=dispatch_semaphore_create(0);
        ABAddressBookRequestAccessWithCompletion(tmpAddressBook, ^(bool greanted, CFErrorRef error){
            dispatch_semaphore_signal(sema);
        });
        
        dispatch_semaphore_wait(sema, DISPATCH_TIME_FOREVER);
    }
    else
    {
        tmpAddressBook =ABAddressBookCreate();
    }
    //取得本地所有联系人记录
    
    
    if (tmpAddressBook==nil) {
        return arr;
    };
    NSArray* tmpPeoples = (__bridge NSArray*)ABAddressBookCopyArrayOfAllPeople(tmpAddressBook);
    
    for(id tmpPerson in tmpPeoples)
        
    {
        
        Contact *contact = [[Contact alloc] init];
        //获取的联系人单一属性:First name
        
        NSString* tmpFirstName = (__bridge NSString*)ABRecordCopyValue((__bridge ABRecordRef)(tmpPerson), kABPersonFirstNameProperty);
        
        contact.firstName = tmpFirstName;
        
        
        //获取的联系人单一属性:Last name
        
        NSString* tmpLastName = (__bridge NSString*)ABRecordCopyValue((__bridge ABRecordRef)(tmpPerson), kABPersonLastNameProperty);
        
        contact.lastName = tmpLastName;
        
        
        //获取的联系人单一属性:Nickname
        
        NSString* tmpNickname = (__bridge NSString*)ABRecordCopyValue((__bridge ABRecordRef)(tmpPerson), kABPersonNicknameProperty);
        
        contact.nickName = tmpNickname;
        
        
        //获取的联系人单一属性:Company name
        
        NSString* tmpCompanyname = (__bridge NSString*)ABRecordCopyValue((__bridge ABRecordRef)(tmpPerson), kABPersonOrganizationProperty);
        
        contact.companyName = tmpCompanyname;
        
        
        //获取的联系人单一属性:Job Title
        
        NSString* tmpJobTitle= (__bridge NSString*)ABRecordCopyValue((__bridge ABRecordRef)(tmpPerson), kABPersonJobTitleProperty);
        
        contact.jobTitle = tmpJobTitle;
        
        
        //获取的联系人单一属性:Department name
        
        NSString* tmpDepartmentName = (__bridge NSString*)ABRecordCopyValue((__bridge ABRecordRef)(tmpPerson), kABPersonDepartmentProperty);
        
        contact.departmentName = tmpDepartmentName;
        
        
        //获取的联系人单一属性:Email(s)
        
        ABMultiValueRef tmpEmails = ABRecordCopyValue((__bridge ABRecordRef)(tmpPerson), kABPersonEmailProperty);
        
        for(NSInteger j = 0;j < ABMultiValueGetCount(tmpEmails); j++)
            
        {
            
            NSString* tmpEmailIndex = (__bridge NSString*)ABMultiValueCopyValueAtIndex(tmpEmails, j);
            if (tmpEmailIndex) {
                [contact.emailList addObject:tmpEmailIndex];
            }
        }
        
        CFRelease(tmpEmails);
        
        //获取的联系人单一属性:Birthday
        
        NSDate* tmpBirthday = (__bridge NSDate*)ABRecordCopyValue((__bridge ABRecordRef)(tmpPerson), kABPersonBirthdayProperty);
        
        contact.birthday = tmpBirthday;
        
        
        //获取的联系人单一属性:Note
        
        NSString* tmpNote = (__bridge NSString*)ABRecordCopyValue((__bridge ABRecordRef)(tmpPerson), kABPersonNoteProperty);
        contact.note = tmpNote;
        
        
        //获取的联系人单一属性:Generic phone number
        
        ABMultiValueRef tmpPhones = ABRecordCopyValue((__bridge ABRecordRef)(tmpPerson), kABPersonPhoneProperty);
        
        for(NSInteger j = 0; j < ABMultiValueGetCount(tmpPhones); j++)
            
        {
            NSString* tmpPhoneIndex = (__bridge NSString*)ABMultiValueCopyValueAtIndex(tmpPhones, j);
            if ([self isMobileNumber:tmpPhoneIndex]) {
                [contact.phoneList addObject:tmpPhoneIndex];
            }else{
                [contact.telPhoneList addObject:tmpPhoneIndex];
            }
        }
        
        CFRelease(tmpPhones);
        [arr addObject:contact];
        
    }
    
    //释放内存
    CFRelease(tmpAddressBook);
    return arr;
}

- (BOOL)isMobileNumber:(NSString *)mobileNumString
{
    /**
     * 手机号码
     * 移动：134[0-8],135,136,137,138,139,150,151,157,158,159,182,187,188
     * 联通：130,131,132,152,155,156,185,186
     * 电信：133,1349,153,180,189
     */
    //    NSString *MOBILEString = @"^1(3[0-9]|5[0-35-9]|8[025-9])\\d{8}$";
    NSString *MOBILEString = @"^1([3-9][0-9])\\d{8}$";
    
    /**
     * 中国移动：China Mobile
     * 134[0-8],135,136,137,138,139,150,151,157,158,159,182,187,188
     */
    
    NSString *CMString = @"^1(34[0-8]|(3[5-9]|5[017-9]|8[278])\\d)\\d{7}$";
    
    /**
     * 中国联通：China Unicom
     * 130,131,132,152,155,156,185,186
     */
    
    NSString * CUString = @"^1(3[0-2]|5[256]|8[56])\\d{8}$";
    
    
    /**
     * 中国电信：China Telecom
     * 133,1349,153,180,189
     */
    
    NSString * CTString = @"^1((33|53|8[09])[0-9]|349)\\d{7}$";
    
    
    /**
     * 大陆地区固话及小灵通
     * 区号：010,020,021,022,023,024,025,027,028,029
     * 号码：七位或八位
     */
    
    // NSString * PHSString = @"^0(10|2[0-5789]|\\d{3})\\d{7,8}$";
    
    NSPredicate *regextestmobile = [NSPredicate predicateWithFormat:@"SELF MATCHES %@", MOBILEString];
    NSPredicate *regextestcm = [NSPredicate predicateWithFormat:@"SELF MATCHES %@", CMString];
    NSPredicate *regextestcu = [NSPredicate predicateWithFormat:@"SELF MATCHES %@", CUString];
    NSPredicate *regextestct = [NSPredicate predicateWithFormat:@"SELF MATCHES %@", CTString];
    
    if (([regextestmobile evaluateWithObject:mobileNumString] == YES)
        || ([regextestcm evaluateWithObject:mobileNumString] == YES)
        || ([regextestct evaluateWithObject:mobileNumString] == YES)
        || ([regextestcu evaluateWithObject:mobileNumString] == YES))
    {
        return YES;
    }
    else
    {
        return NO;
    }
}

@end
