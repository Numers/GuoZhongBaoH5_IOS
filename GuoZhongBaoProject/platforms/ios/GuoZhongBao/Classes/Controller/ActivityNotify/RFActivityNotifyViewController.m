//
//  RFActivityNotifyViewController.m
//  GuoZhongBao
//
//  Created by baolicheng on 15/8/10.
//  Copyright (c) 2015年 RenRenFenQi. All rights reserved.
//

#import "RFActivityNotifyViewController.h"

@interface RFActivityNotifyViewController ()<UIWebViewDelegate>
{
    NSString *loadUrl;
    NSString *navTitle;
    UIActivityIndicatorView *activityView;
}
@property(nonatomic, strong) UIWebView *webView;
@end

@implementation RFActivityNotifyViewController
-(id)initWithTitle:(NSString *)title WithLoadUrl:(NSString *)url
{
    self = [super init];
    if (self) {
        loadUrl = url;
        navTitle = title;
    }
    return self;
}

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view.
    _webView = [[UIWebView alloc] initWithFrame:self.view.frame];
    _webView.delegate = self;
    [self.view addSubview:_webView];
    
    activityView = [[UIActivityIndicatorView alloc] initWithActivityIndicatorStyle:UIActivityIndicatorViewStyleGray];
    [activityView setOpaque:NO];
    [activityView setCenter:_webView.center];
    [_webView addSubview:activityView];
}

-(void)viewDidAppear:(BOOL)animated
{
    [super viewDidAppear:animated];
    [_webView loadRequest:[NSURLRequest requestWithURL:[NSURL URLWithString:loadUrl]]];
}

-(void)viewWillAppear:(BOOL)animated
{
    [super viewWillAppear:animated];
    [self.navigationItem setTitle:navTitle];
    UIBarButtonItem *closeBarItem = [[UIBarButtonItem alloc] initWithTitle:@"关闭" style:UIBarButtonItemStyleDone target:self action:@selector(closeView)];
    [self.navigationItem setRightBarButtonItem:closeBarItem];
}

-(void)closeView
{
    [self dismissViewControllerAnimated:YES completion:^{
        
    }];
}

-(void)viewWillDisappear:(BOOL)animated
{
    [super viewWillDisappear:animated];
    [self.navigationController setNavigationBarHidden:YES];
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

#pragma -mark  WebViewDelegate
//-(BOOL)webView:(UIWebView *)webView shouldStartLoadWithRequest:(NSURLRequest *)request navigationType:(UIWebViewNavigationType)navigationType
//{
//    NSHTTPURLResponse *response = nil;
//    [NSURLConnection sendSynchronousRequest:request returningResponse:&response error:nil];
//    if (response.statusCode == 404) {
//        // code for 404
//        return NO;
//    } else if (response.statusCode == 403) {
//        // code for 403
//        return NO;
//    }
//    return YES;
//}

- (void)webViewDidStartLoad:(UIWebView *)webView
{
    [activityView setOpaque:YES];
    [activityView startAnimating];
}

- (void)webViewDidFinishLoad:(UIWebView *)webView
{
    NSString *title = [webView stringByEvaluatingJavaScriptFromString:@"document.title"];
    if ((title != nil) && (title.length > 0)) {
        [self.navigationItem setTitle:title];
    }
    [activityView setOpaque:NO];
    [activityView stopAnimating];
}

- (void)webView:(UIWebView *)webView didFailLoadWithError:(NSError *)error
{
    [activityView setOpaque:NO];
    [activityView stopAnimating];
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
