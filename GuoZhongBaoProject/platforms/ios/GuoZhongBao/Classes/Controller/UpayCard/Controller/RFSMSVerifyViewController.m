//
//  RFSMSVerifyViewController.m
//  GuoZhongBao
//
//  Created by baolicheng on 15/7/2.
//  Copyright (c) 2015年 RenRenFenQi. All rights reserved.
//

#import "RFSMSVerifyViewController.h"
#import "RFUmpayNetWorkAPIManager.h"
#import "BankCard.h"

@interface RFSMSVerifyViewController ()<UITextFieldDelegate>
{
    NSTimer *timer;
    NSInteger seconds;
    
    NSString *uid;
    NSString *token;
    NSString *tradeno;
    BankCard *currentBank;
}
@property (strong, nonatomic) IBOutlet UITextField *txtValidateCode;
@property (strong, nonatomic) IBOutlet UIButton *btnValidateCode;
@end

@implementation RFSMSVerifyViewController
-(id)initWithTradeNo:(NSString *)tradeNo WithUid:(NSString *)myuid WithToken:(NSString *)mytoken WithBank:(BankCard *)bank
{
    self = [super init];
    if (self) {
        uid = myuid;
        token = mytoken;
        tradeno = tradeNo;
        currentBank = bank;
    }
    return self;
}

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view from its nib.
    [_btnValidateCode setAdjustsImageWhenHighlighted:NO];
    [_btnValidateCode.layer setCornerRadius:5.0f];
    [_btnValidateCode.layer setMasksToBounds:YES];
    _txtValidateCode.leftView = [[UIView alloc] initWithFrame:CGRectMake(0, 0, 6, _txtValidateCode.frame.size.height)];
    _txtValidateCode.leftViewMode = UITextFieldViewModeAlways;
}

-(void)viewWillAppear:(BOOL)animated
{
    [super viewWillAppear:animated];
    [self setTitle:@"短信验证"];
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (BOOL)textFieldShouldReturn:(UITextField *)textField
{
    return [textField resignFirstResponder];
}

-(void)touchesBegan:(NSSet *)touches withEvent:(UIEvent *)event
{
    
    if ([_txtValidateCode isFirstResponder]) {
        [_txtValidateCode resignFirstResponder];
    }
}

- (IBAction)clickValidateCodeBtn:(id)sender {
    [self sendPhoneCodeWithTradeNo:tradeno WithPayAgreementId:currentBank.usrPayAgreementId];
}

-(void)sendPhoneCodeWithTradeNo:(NSString *)tradeNo WithPayAgreementId:(NSString *)payAgreementId
{
    [[RFUmpayNetWorkAPIManager defaultManager] requestSmsVerifyWithTradeNo:tradeNo WithUid:uid WithToken:token WithPayAgreementId:payAgreementId Success:^(AFHTTPRequestOperation *operation, id responseObject) {
        seconds = 60;
        timer = [NSTimer scheduledTimerWithTimeInterval:1 target:self selector:@selector(validateBtnSetting) userInfo:nil repeats:YES];
        [timer fire];
    } Error:^(AFHTTPRequestOperation *operation, id responseObject) {
        
    } Failed:^(AFHTTPRequestOperation *operation, NSError *error) {
        
    }];
}

-(void)validateBtnSetting
{
    --seconds;
    if (seconds>0) {
        [_btnValidateCode setTitle:[NSString stringWithFormat:@"还剩(%ld)秒",(long)seconds] forState:UIControlStateNormal];
        [_btnValidateCode setEnabled:NO];
    }else{
        [timer invalidate];
        timer = nil;
        [_btnValidateCode setTitle:@"获取验证码" forState:UIControlStateNormal];
        [_btnValidateCode setEnabled:YES];
    }
}

-(IBAction)clickVerifyBtn:(id)sender
{
    if (_txtValidateCode.text != nil && _txtValidateCode.text.length > 0) {
        [[RFUmpayNetWorkAPIManager defaultManager] checkSmsVerifyWithTradeNo:tradeno WithUid:uid WithToken:token WithPayAgreementId:currentBank.usrPayAgreementId WithVerifyCode:_txtValidateCode.text Success:^(AFHTTPRequestOperation *operation, id responseObject) {
            [[NSNotificationCenter defaultCenter] postNotificationName:@"payResult" object:nil userInfo:@{@"retCode":@"0000",@"retMsg":@"支付成功"}];
            [self.navigationController popViewControllerAnimated:NO];
            if ([self.delegate respondsToSelector:@selector(dismiss)]) {
                [self.delegate dismiss];
            }
        } Error:^(AFHTTPRequestOperation *operation, id responseObject) {
            
        } Failed:^(AFHTTPRequestOperation *operation, NSError *error) {
            
        }];
    }
}

-(IBAction)clickBackBtn:(id)sender;
{
    [self.navigationController popViewControllerAnimated:YES];
}


/*
#pragma mark - Navigation

// In a storyboard-based application, you will often want to do a little preparation before navigation
- (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender {
    // Get the new view controller using [segue destinationViewController].
    // Pass the selected object to the new view controller.
}
*/

@end
