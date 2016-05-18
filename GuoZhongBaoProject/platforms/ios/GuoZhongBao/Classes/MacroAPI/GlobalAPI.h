//
//  GlobalAPI.h
//  GuoZhongBao
//
//  Created by baolicheng on 15/8/20.
//
//

#ifndef GuoZhongBao_GlobalAPI_h
#define GuoZhongBao_GlobalAPI_h
#import "AFNetworking.h"
#define TimeOut 10.0f
#define ISTEST 1
//test switch 0:production 1:test

#if ISTEST
//test
//#define API_GZB                         @"http://api.gzb.renrenfenqi.com/"
//#define API_REDPACKET                   @"http://test.h5.guozhongbao.com/activity/redpacket/display.html"
//#define ShareURL   @"http://test.activity.guozhongbao.com/redpacket/share?offline&"

#define API_GZB                         @"http://stage.api.guozhongbao.com/"
#define API_REDPACKET                   @"http://stage.h5.guozhongbao.com/activity/redpacket/display.html"
#define ShareURL   @"http://stage.activity.guozhongbao.com/redpacket/share?stage&"
#else
//production
#define API_GZB                         @"http://api.guozhongbao.com/"
#define API_REDPACKET                   @"http://h5.guozhongbao.com/activity/redpacket/display.html"
#define ShareURL   @"http://activity.guozhongbao.com/redpacket/share?online&"
//#define API_GZB                         @"http://api.gzb.renrenfenqi.com/"
#endif

typedef void (^ApiSuccessCallback)(AFHTTPRequestOperation*operation, id responseObject);
typedef void (^ApiErrorCallback)(AFHTTPRequestOperation*operation, id responseObject);
typedef void (^ApiFailedCallback)(AFHTTPRequestOperation*operation, NSError *error);
#endif
