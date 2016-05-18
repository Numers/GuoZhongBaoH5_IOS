//
//  RFCameraOverlayView.h
//  CameraDemo
//
//  Created by feng on 15/7/28.
//  Copyright (c) 2015年 feng. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "OverLayerDefine.h"
#import "OverLayerImageView.h"

@interface RFCameraOverlayView : UIView
{
    
}

@property (nonatomic, strong) UIButton *flashButton;
@property (nonatomic, strong) UIButton *cameraSwitchButton;
@property (nonatomic, strong) OverLayerImageView *overlayImage;
@property (nonatomic, weak)   UIImagePickerController *parentView;
@property (nonatomic, assign) OVERLAY_MODE overlayMode;

- (void)initOverlay:(OVERLAY_MODE) mode;
- (void)flashButtonAction:(id)sender;
- (void)cameraSwitchButtonAction:(id)sender;
- (void)cancelButtonAction:(id)sender;

@end
