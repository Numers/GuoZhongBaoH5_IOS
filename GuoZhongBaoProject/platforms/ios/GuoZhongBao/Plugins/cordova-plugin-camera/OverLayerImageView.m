//
//  OverLayerImageView.m
//  CordovaDemo
//
//  Created by baolicheng on 15/8/5.
//
//

#import "OverLayerImageView.h"
#define MarginTopOrBottom 55.0f

@implementation OverLayerImageView
-(id)initWithFrame:(CGRect)frame
{
    self = [super initWithFrame:frame];
    if (self) {
        [self setBackgroundColor:[UIColor clearColor]];
        
        self.borderView = [[UIImageView alloc] initWithFrame:CGRectMake(0, 0, frame.size.width, frame.size.height)];
        [self.borderView setImage:[UIImage imageNamed:@"task_picture_frame"]];
        [self addSubview:self.borderView];
        
        self.centerView = [[UIImageView alloc] initWithImage:[UIImage imageNamed:@"task_picture_head"]];
        [self addSubview: self.centerView];
        
    }
    return self;
}

-(void)setViewFrame:(CGRect)frame
{
    [self setFrame:frame];
    [self setNeedsDisplay];
}

// Only override drawRect: if you perform custom drawing.
// An empty implementation adversely affects performance during animation.
- (void)drawRect:(CGRect)rect {
    // Drawing code
    [self.borderView setFrame:CGRectMake(0, 0, self.frame.size.width, self.frame.size.height)];
    
    float width = self.frame.size.width - 2 * MarginTopOrBottom;
    [self.centerView setFrame: CGRectMake(self.centerView.frame.origin.x, self.centerView.frame.origin.y, width, width * (HeadImageHeight)/HeadImageWidth)];
    [self.centerView setCenter:CGPointMake(self.frame.size.width / 2, self.frame.size.height / 2)];
}

- (void)setGuideText:(OVERLAY_MODE)mode
{
    if (mode != OVERLAY_MODE_FACE)
    {
        self.titleLabel = [[UIImageView alloc] initWithImage:[UIImage imageNamed:@"overlay_title_text_1"]];
        [self.titleLabel setFrame:CGRectMake(0, 0, 23, 248)];
        self.titleLabel.center = CGPointMake(self.frame.size.width - 10, self.frame.size.height / 2);
        [self addSubview: self.titleLabel];
        
        NSString *bottomImageName = [NSString stringWithFormat:@"overlay_bottom_text_%d", mode];
        self.bottomLabel = [[UIImageView alloc] initWithImage:[UIImage imageNamed:bottomImageName]];
        [self.bottomLabel setFrame:CGRectMake(0, 0, 21, 290)];
        self.bottomLabel.center = CGPointMake(self.frame.size.width / 2, self.frame.size.height / 2);
        [self addSubview: self.bottomLabel];
    }
    
}
@end
