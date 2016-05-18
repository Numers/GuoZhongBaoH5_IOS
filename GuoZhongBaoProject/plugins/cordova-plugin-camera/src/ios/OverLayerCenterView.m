//
//  OverLayerCenterView.m
//  CordovaDemo
//
//  Created by baolicheng on 15/8/5.
//
//

#import "OverLayerCenterView.h"

@implementation OverLayerCenterView
-(id)init
{
    self = [super init];
    if (self) {
        [self setBackgroundColor:[UIColor clearColor]];
        headImageView = [[UIImageView alloc] initWithImage:[UIImage imageNamed:@"task_picture_head"]];
        [self addSubview:headImageView];
        
        cardImageView = [[UIImageView alloc] initWithImage:[UIImage imageNamed:@"task_picture_card"]];
        [self addSubview:cardImageView];
    }
    return self;
}

-(void)setViewWidth:(float)width
{
    CGRect frame = CGRectMake(self.frame.origin.x, self.frame.origin.y, width, width*(HeadImageHeight + CardImageHeight)/CardImageWidth);
    [self setFrame:frame];
    [self setNeedsDisplay];
}
// Only override drawRect: if you perform custom drawing.
// An empty implementation adversely affects performance during animation.
- (void)drawRect:(CGRect)rect {
    // Drawing code
    [headImageView setFrame:CGRectMake(0, 0, HeadImageWidth * self.frame.size.width / CardImageWidth, HeadImageHeight * self.frame.size.height / (HeadImageHeight + CardImageHeight))];
    [headImageView setCenter:CGPointMake(self.frame.size.width / 2, (HeadImageHeight / 2) * self.frame.size.height / (HeadImageHeight + CardImageHeight))];
    
    [cardImageView setFrame:CGRectMake(0, 0, self.frame.size.width, CardImageHeight * self.frame.size.height / (HeadImageHeight + CardImageHeight))];
    [cardImageView setCenter:CGPointMake(self.frame.size.width / 2, (CardImageHeight/2 + HeadImageHeight) * self.frame.size.height / ((HeadImageHeight + CardImageHeight)))];
}
@end
