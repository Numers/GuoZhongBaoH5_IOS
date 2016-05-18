//
//  RFUpayCardViewController.m
//  GuoZhongBao
//
//  Created by baolicheng on 15/7/2.
//  Copyright (c) 2015年 RenRenFenQi. All rights reserved.
//

#import "RFUpayCardViewController.h"
#import "RFSMSVerifyViewController.h"
#import "BankCard.h"
#import "Umpay.h"
#import "AppDelegate.h"

static NSString *cellIdentify = @"cellIdentify";
@interface RFUpayCardViewController ()<UITableViewDelegate,UITableViewDataSource,RFUpayCardViewProtocol>
{
    NSString *uid;
    NSString *token;
    NSString *tradeNo;
    NSArray *upayCardList;
}
@property(nonatomic, strong) IBOutlet UITableView *tableview;
@end

@implementation RFUpayCardViewController
-(id)initWithTradeNo:(NSString *)tradeno WithUid:(NSString *)myuid WithToken:(NSString *)mytoken WithBankCardArray:(NSArray *)bankCardArr
{
    self = [super init];
    if (self) {
        uid = myuid;
        token = mytoken;
        tradeNo = tradeno;
        upayCardList = [NSArray arrayWithArray:bankCardArr];
    }
    return self;
}

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view from its nib.
    UIView *headView = [[UIView alloc] initWithFrame:CGRectMake(0, 0, self.tableview.frame.size.width, 0.5)];
    [headView setBackgroundColor:[UIColor colorWithRed:199/255.f green:200/255.f blue:204/255.f alpha:1.f]];
    if ([self.tableview respondsToSelector:@selector(setSeparatorInset:)]) {
        
        [self.tableview setSeparatorInset:UIEdgeInsetsZero];
        
    }
    
    if ([self.tableview respondsToSelector:@selector(setLayoutMargins:)]) {
        
        [self.tableview setLayoutMargins:UIEdgeInsetsZero];
        
    }

    self.tableview.tableHeaderView = headView;
    self.tableview.tableFooterView = [[UIView alloc] initWithFrame:CGRectZero];
    [self.tableview setSeparatorStyle:UITableViewCellSeparatorStyleSingleLine];
    
    UIBarButtonItem *rightBarItem = [[UIBarButtonItem alloc] initWithTitle:@"关闭" style:UIBarButtonItemStyleDone target:self action:@selector(closeView)];
    [self.navigationItem setRightBarButtonItem:rightBarItem];
    [self setTitle:@"银行卡列表"];
}

-(void)viewWillAppear:(BOOL)animated
{
    [super viewWillAppear:animated];
    [self.tableview reloadData];
}

-(void)viewWillDisappear:(BOOL)animated
{
    [super viewWillDisappear:animated];
//    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

-(void)closeView
{
    [self dismissViewControllerAnimated:YES completion:nil];
}

-(NSMutableAttributedString *)generateCellTextWithBankName:(NSString *)bankName WithCardNumber:(NSString *)card WithColor:(UIColor *)color WithFont:(UIFont *)font
{
    if (bankName == nil || card == nil) {
        return nil;
    }
    NSMutableAttributedString *attrString = [[NSMutableAttributedString alloc] initWithString:[NSString stringWithFormat:@"%@(尾号%@)",bankName,card]];
    NSRange range;
    range.location = bankName.length + 3;
    range.length = card.length;
    [attrString beginEditing];
    [attrString addAttributes:[NSDictionary dictionaryWithObjectsAndKeys:color,NSForegroundColorAttributeName,font,NSFontAttributeName, nil] range:range];
    [attrString endEditing];
    return attrString;
}

/*
#pragma mark - Navigation

// In a storyboard-based application, you will often want to do a little preparation before navigation
- (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender {
    // Get the new view controller using [segue destinationViewController].
    // Pass the selected object to the new view controller.
}
*/

#pragma mark - tableview delegate and datasoucre
- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section{
    return upayCardList.count + 1;
}

-(NSInteger)numberOfSectionsInTableView:(UITableView *)tableView
{
    return 1;
}

-(CGFloat)tableView:(UITableView *)tableView heightForHeaderInSection:(NSInteger)section
{
    return 0.1f;
}

- (CGFloat)tableView:(UITableView *)tableView heightForRowAtIndexPath:(NSIndexPath *)indexPath
{
    return 44.0f;
}

- (void)tableView:(UITableView *)tableView willDisplayCell:(UITableViewCell *)cell forRowAtIndexPath:(NSIndexPath *)indexPath

{
    if (indexPath.row == upayCardList.count) {
        if ([cell respondsToSelector:@selector(setSeparatorInset:)]) {
            
            [cell setSeparatorInset:UIEdgeInsetsZero];
            
        }
        
        if ([cell respondsToSelector:@selector(setLayoutMargins:)]) {
            
            [cell setLayoutMargins:UIEdgeInsetsZero];
            
        }
    }
}


- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath{
    UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:cellIdentify];
    if (cell == nil) {
        cell = [[UITableViewCell alloc] initWithStyle:UITableViewCellStyleDefault reuseIdentifier:cellIdentify];
        
    }
    
    if (indexPath.row < upayCardList.count) {
        BankCard *bankCard = [upayCardList objectAtIndex:indexPath.row];
        [cell.textLabel setAttributedText:[self generateCellTextWithBankName:bankCard.bankName WithCardNumber:bankCard.card WithColor:[UIColor lightGrayColor] WithFont:[UIFont systemFontOfSize:15.0f]]];
        [cell setAccessoryType:UITableViewCellAccessoryDisclosureIndicator];
    }else{
        [cell.textLabel setText:@"请添加银行卡..."];
        [cell.textLabel setTextAlignment:NSTextAlignmentCenter];
        [cell setAccessoryType:UITableViewCellAccessoryNone];
    }
    
    return cell;
}
#pragma mark - tableview点击cell
-(void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath
{
    [tableView deselectRowAtIndexPath:indexPath animated:YES];
    if (indexPath.row < upayCardList.count) {
        BankCard *bankCard = [upayCardList objectAtIndex:indexPath.row];
        RFSMSVerifyViewController *rfSmsVerifyVC = [[RFSMSVerifyViewController alloc] initWithTradeNo:tradeNo WithUid:uid WithToken:token WithBank:bankCard];
        rfSmsVerifyVC.delegate = self;
        [self.navigationController pushViewController:rfSmsVerifyVC animated:YES];
    }else{
        [Umpay pay:tradeNo merCustId:uid shortBankName:nil cardType:@"0" payDic:nil rootViewController:self];
    }
}

#pragma -mark RFUpayCardViewProtocol
-(void)dismiss
{
    [self dismissViewControllerAnimated:YES completion:nil];
}
@end
