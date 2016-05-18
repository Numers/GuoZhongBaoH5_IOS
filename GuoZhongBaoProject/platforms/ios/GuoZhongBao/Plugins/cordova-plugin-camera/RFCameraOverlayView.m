//
//  RFCameraOverlayView.m
//  CameraDemo
//
//  Created by feng on 15/7/28.
//  Copyright (c) 2015年 feng. All rights reserved.
//

#import "RFCameraOverlayView.h"

@implementation RFCameraOverlayView

- (instancetype)initWithFrame:(CGRect)frame
{
    if (![super initWithFrame:frame])
    {
        return nil;
    }
    
    //设置背景透明
    self.backgroundColor = [UIColor clearColor];
    
    //添加辅助对齐图片
    CGRect rect = [UIScreen mainScreen].bounds;
    if (rect.size.height < 568.0f) {
        self.overlayImage = [[OverLayerImageView alloc] initWithFrame:CGRectMake(0, 0, frame.size.width, frame.size.height)];
    }else{
        self.overlayImage = [[OverLayerImageView alloc] initWithFrame:CGRectMake(0, 0, self.frame.size.width, frame.size.height - 140)];
    }
    [self addSubview:self.overlayImage];
    
    //顶部控制条
    UIView *topBar = [[UIView alloc] initWithFrame:CGRectMake(0, 0, frame.size.width, 50)];
    topBar.backgroundColor = [UIColor colorWithWhite:0 alpha:0];
    [self addSubview:topBar];
    
    //闪光灯
    self.flashButton = [UIButton buttonWithType:UIButtonTypeCustom];
    self.flashButton.frame = CGRectMake(10, 10, 60, 30);
    [self.flashButton setBackgroundImage:[UIImage imageNamed:@"flashlight_off"] forState:UIControlStateNormal];
    [self.flashButton addTarget:self action:@selector(flashButtonAction:) forControlEvents:UIControlEventTouchUpInside];
    [topBar addSubview:self.flashButton];
    
    //切换摄像头
    self.cameraSwitchButton = [UIButton buttonWithType:UIButtonTypeCustom];
    self.cameraSwitchButton .frame = CGRectMake(frame.size.width - 70, 10, 60, 30);
    [self.cameraSwitchButton  setBackgroundImage:[UIImage imageNamed:@"camera_selector"] forState:UIControlStateNormal];
    [self.cameraSwitchButton  addTarget:self action:@selector(cameraSwitchButtonAction:) forControlEvents:UIControlEventTouchUpInside];
    [topBar addSubview:self.cameraSwitchButton];
    
    //底部控制条
    UIView *bottomBar = [[UIView alloc] initWithFrame:CGRectMake(0, frame.size.height - 120, frame.size.width, 120)];
    bottomBar.backgroundColor = [UIColor colorWithWhite:0 alpha:0];
    [self addSubview:bottomBar];
    
    //拍摄按钮
    UIButton *taskPicBtn = [UIButton buttonWithType:UIButtonTypeCustom];
    taskPicBtn.frame = CGRectMake((frame.size.width - 80) / 2, 10, 70, 70);
    [taskPicBtn setBackgroundImage:[UIImage imageNamed:@"task_picture_btn"] forState:UIControlStateNormal];
    [taskPicBtn addTarget:self action:@selector(takePhoto:) forControlEvents:UIControlEventTouchUpInside];
    [bottomBar addSubview:taskPicBtn];
    
    UIButton *leftBtn = [UIButton buttonWithType:UIButtonTypeCustom];
    leftBtn.frame = CGRectMake(28, 30, 75, 35);
    [leftBtn setBackgroundColor:[UIColor colorWithRed:0 green:0 blue:0 alpha:0.3]];
    [leftBtn.layer setCornerRadius:17.0f];
    [leftBtn setTitle:@"取消" forState:UIControlStateNormal];
    [leftBtn addTarget:self action:@selector(cancelButtonAction:) forControlEvents:UIControlEventTouchUpInside];
    [bottomBar addSubview:leftBtn];
    
    return self;
}

- (void)initOverlay:(OVERLAY_MODE)mode
{
    self.overlayMode = mode;
    
    if (self.overlayMode == OVERLAY_MODE_FACE)
    {
          [self.overlayImage.centerView setHidden:NO];
    }
    else
    {
          [self.overlayImage.centerView setHidden:YES];
    }
    [self.overlayImage setGuideText:mode];
    
    //初始化设置闪光灯按钮
    if (self.parentView.cameraFlashMode == UIImagePickerControllerCameraFlashModeOn) {
        [self.flashButton setBackgroundImage:[UIImage imageNamed:@"flashlight_on"] forState:UIControlStateNormal];
    } else {
        [self.flashButton setBackgroundImage:[UIImage imageNamed:@"flashlight_off"] forState:UIControlStateNormal];
    }
    
    if (self.parentView.cameraDevice == UIImagePickerControllerCameraDeviceRear) {
        self.flashButton.enabled = YES;
    } else {
        self.flashButton.enabled = NO;
        self.parentView.cameraFlashMode = UIImagePickerControllerCameraFlashModeOff;
        [self.flashButton setBackgroundImage:[UIImage imageNamed:@"flashlight_off.png"] forState:UIControlStateNormal];
    }
}

- (void)cancelButtonAction:(id)sender
{
    [self.parentView dismissViewControllerAnimated:YES completion:^{
        
    }];
}

- (void)flashButtonAction:(id)sender
{
    if (self.parentView.cameraFlashMode == UIImagePickerControllerCameraFlashModeOn) {
        self.parentView.cameraFlashMode = UIImagePickerControllerCameraFlashModeOff;
        [self.flashButton setBackgroundImage:[UIImage imageNamed:@"flashlight_off"] forState:UIControlStateNormal];
    } else {
        self.parentView.cameraFlashMode = UIImagePickerControllerCameraFlashModeOn;
        [self.flashButton setBackgroundImage:[UIImage imageNamed:@"flashlight_on"] forState:UIControlStateNormal];
    }
}

- (void)cameraSwitchButtonAction:(id)sender
{
    if (self.parentView.cameraDevice == UIImagePickerControllerCameraDeviceRear) {
        self.flashButton.enabled = NO;
        self.parentView.cameraFlashMode = UIImagePickerControllerCameraFlashModeOff;
        [self.flashButton setBackgroundImage:[UIImage imageNamed:@"flashlight_off.png"] forState:UIControlStateNormal];
        self.parentView.cameraDevice = UIImagePickerControllerCameraDeviceFront;
    } else {
        self.flashButton.enabled = YES;
        self.parentView.cameraDevice = UIImagePickerControllerCameraDeviceRear;
    }
}

- (void)takePhoto:(id)sender
{
    [self.parentView takePicture];
}

//-(void)drawRect:(CGRect)rect
//{
//    if (UIDeviceOrientationIsPortrait([[UIDevice currentDevice] orientation])) {
//        [self.overlayImage setViewFrame:CGRectMake(0, 0, self.frame.size.width, self.frame.size.height - 150)];
//        //        self.overlayImage.center = CGPointMake(self.frame.size.width / 2, self.frame.size.height / 2 - 40.0f);
//    }else{
//        [self.overlayImage setViewFrame:CGRectMake(0, 0, self.frame.size.width, self.frame.size.height - 150)];
//    }
//}

@end
