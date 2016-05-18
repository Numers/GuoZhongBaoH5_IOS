//
//  CDVAlipayOrder.m
//  AlixPayDemo
//
//  Created by 方彬 on 11/2/13.
//
//

#import "CDVAlipayOrder.h"
#import "CDVAlipayDefine.h"
#import "DataSigner.h"

@implementation CDVAlipayOrder

- (NSString *)description {
	NSMutableString * discription = [NSMutableString string];
    if (self.partner) {
        [discription appendFormat:@"partner=\"%@\"", self.partner];
    }
	
    if (self.seller) {
        [discription appendFormat:@"&seller_id=\"%@\"", self.seller];
    }
	if (self.tradeNO) {
        [discription appendFormat:@"&out_trade_no=\"%@\"", self.tradeNO];
    }
	if (self.productName) {
        [discription appendFormat:@"&subject=\"%@\"", self.productName];
    }
	
	if (self.productDescription) {
        [discription appendFormat:@"&body=\"%@\"", self.productDescription];
    }
	if (self.amount) {
        [discription appendFormat:@"&total_fee=\"%@\"", self.amount];
    }
    if (self.notifyURL) {
        [discription appendFormat:@"&notify_url=\"%@\"", self.notifyURL];
    }
	
    if (self.service) {
        [discription appendFormat:@"&service=\"%@\"",self.service];//mobile.securitypay.pay
    }
    if (self.paymentType) {
        [discription appendFormat:@"&payment_type=\"%@\"",self.paymentType];//1
    }
    
    if (self.inputCharset) {
        [discription appendFormat:@"&_input_charset=\"%@\"",self.inputCharset];//utf-8
    }
    if (self.itBPay) {
        [discription appendFormat:@"&it_b_pay=\"%@\"",self.itBPay];//30m
    }
    if (self.showUrl) {
        [discription appendFormat:@"&show_url=\"%@\"",self.showUrl];//m.alipay.com
    }
    if (self.rsaDate) {
        [discription appendFormat:@"&sign_date=\"%@\"",self.rsaDate];
    }
    if (self.appID) {
        [discription appendFormat:@"&app_id=\"%@\"",self.appID];
    }
	for (NSString * key in [self.extraParams allKeys]) {
		[discription appendFormat:@"&%@=\"%@\"", key, [self.extraParams objectForKey:key]];
	}
	return discription;
}

//获取MD5签名
-(NSString *)getMD5Sign
{
    NSString *orderSpec = [self description];
    
    id<DataSigner> signer = CreateMD5DataSigner();
    NSString *signedString = [signer signString:orderSpec];
    return signedString;
}


//获取RSA签名
-(NSString *)getRSASign
{
    //获取私钥并将商户信息签名,外部商户可以根据情况存放私钥和签名,只需要遵循RSA签名规范,并将签名字符串base64编码和UrlEncode
    NSString *orderSpec = [self description];
    
    id<DataSigner> signer = CreateRSADataSigner(PartnerPrivKey);
    NSString *signedString = [signer signString:orderSpec];
    return signedString;
}

- (NSString *)descriptionWithSign:(NSString *)signType
{
    NSString *orderSpec = [self description];
    NSString *sign = @"";
    if ([signType isEqualToString:@"RSA"])
    {
        sign = [self getRSASign];
        NSString *orderString = [NSString stringWithFormat:@"%@&sign=\"%@\"&sign_type=\"%@\"",
                       orderSpec, sign, @"RSA"];
        return orderString;
    }
    else if ([signType isEqualToString:@"MD5"])
    {
        sign = [self getMD5Sign];
        NSString *orderString = [NSString stringWithFormat:@"%@&sign=\"%@\"&sign_type=\"%@\"",
                                 orderSpec, sign, @"MD5"];
        return orderString;
    }
    else
    {
        NSLog(@"wrong sign type");
    }
    return @"";
}


@end
