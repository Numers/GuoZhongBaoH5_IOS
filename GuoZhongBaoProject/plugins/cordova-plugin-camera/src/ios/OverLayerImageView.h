//
//  OverLayerImageView.h
//  CordovaDemo
//
//  Created by baolicheng on 15/8/5.
//
//

#import <UIKit/UIKit.h>
#import "OverLayerDefine.h"

@interface OverLayerImageView : UIView
{

}

@property(nonatomic, strong) UIImageView *borderView;
@property(nonatomic, strong) UIImageView *centerView;
@property(nonatomic, strong) UIImageView *titleLabel;
@property(nonatomic, strong) UIImageView *bottomLabel;

- (void)setViewFrame:(CGRect)frame;
- (void)setGuideText:(OVERLAY_MODE)mode;
@end
