//
//  OverLayerCenterView.h
//  CordovaDemo
//
//  Created by baolicheng on 15/8/5.
//
//

#import <UIKit/UIKit.h>
#define HeadImageWidth 304.0f
#define HeadImageHeight 272.0f
#define CardImageWidth 371.0f
#define CardImageHeight 213.0f

@interface OverLayerCenterView : UIView
{
    UIImageView *headImageView;
    UIImageView *cardImageView;
}

-(void)setViewWidth:(float)width;
@end
