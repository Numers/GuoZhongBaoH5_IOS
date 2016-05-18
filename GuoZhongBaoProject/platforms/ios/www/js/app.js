'use strict';

angular.module('guozhongbao', ['ionic', 'guozhongbao.controllers', 'guozhongbao.services'])
    .config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
        $ionicConfigProvider.backButton.previousTitleText(false);
        $ionicConfigProvider.backButton.text('');
        $ionicConfigProvider.views.maxCache(0);
        $stateProvider.state('app_home', {
            url: '/home',
            views: {
                'content': {
                    templateUrl: 'templates/loan/home.html',
                    controller: 'HomeCtrl'
                }
            }
        })

            .state('app_repayment', {
                url: '/repayment',
                views: {
                    'content': {
                        templateUrl: 'templates/repayment/index.html',
                        controller: 'RepaymentCtrl'
                    }
                }
            })

            .state('app_repayment_repay', {
                url: '/repayment/repay',
                views: {
                    'content': {
                        templateUrl: 'templates/repayment/repay.html',
                        controller: 'RepayCtrl'
                    }
                }
            })

            .state('app_repayment_bank', {
                url: '/repayment/bank',
                views: {
                    'content': {
                        templateUrl: 'templates/repayment/bank.html',
                        controller: 'BankCtrl'
                    }
                }
            })

            .state('app_repayment_add', {
                url: '/repayment/add',
                views: {
                    'content': {
                        templateUrl: 'templates/repayment/add.html',
                        controller: 'AddBankCtrl'
                    }
                }
            })

            .state('app_agreement_bank', {
                url: '/agreement/bank',
                views: {
                    'content': {
                        templateUrl: 'templates/agreement/bank.html'
                    }
                }
            })

            .state('app_repayment_pay', {
                url: '/repayment/pay',
                views: {
                    'content': {
                        templateUrl: 'templates/repayment/pay.html',
                        controller: 'PayCtrl'
                    }
                }
            })

            .state('app_login', {
                url: '/user/login',
                views: {
                    'content': {
                        templateUrl: 'templates/user/login.html',
                        controller: 'LoginCtrl'
                    }
                }
            })

            .state('app_login_source', {
                url: '/user/login/from/:source',
                views: {
                    'content': {
                        templateUrl: 'templates/user/login.html',
                        controller: 'LoginCtrl'
                    }
                }
            })

            .state('app_register', {
                url: '/user/register',
                views: {
                    'content': {
                        templateUrl: 'templates/user/register.html',
                        controller: 'registerCtrl'
                    }
                }
            })

            .state('app_regist_agreement', {
                url: '/agreement/register',
                views: {
                    'content': {
                        templateUrl: 'templates/agreement/register.html'
                    }
                }
            })

            .state('app_loan_safyinfo', {
                url: '/:order/safyinfo',
                views: {
                    'content': {
                        templateUrl: 'templates/loan/safyinfo.html',
                        controller: 'SafyinfoCtrl'
                    }
                }
            })

            .state('app_loan_list', {
                url: '/loan/list',
                views: {
                    'content': {
                        templateUrl: 'templates/loan/loanlist.html',
                        controller: 'LoanlistCtrl'
                    }
                }
            })

            .state('app_loan_apply', {
                url: '/loan/apply',
                views: {
                    'content': {
                        templateUrl: 'templates/loan/apply.html',
                        controller: 'LoanApplyCtrl'
                    }
                }
            })

            .state('app_loan_assetinfo', {
                url: '/:order/assetinfo',
                views: {
                    'content': {
                        templateUrl: 'templates/loan/assetinfo.html',
                        controller: 'AssetinfoCtrl'
                    }
                }
            })

            .state('app_loan_insurance', {
                url: '/stage/insurance',
                views: {
                    'content': {
                        templateUrl: 'templates/loan/insurance.html',
                        controller: 'InsuranceCtrl'
                    }
                }
            })

            .state('app_loan_userinfo', {
                url: '/:order/userinfo',
                views: {
                    'content': {
                        templateUrl: 'templates/loan/userinfo.html',
                        controller: 'UserInfoCtrl'
                    }
                }
            })

            .state('app_loan_selectaddress', {
                url: '/:order/userinfo/address/:type',
                views: {
                    'content': {
                        templateUrl: 'templates/loan/address/address.html',
                        controller: 'SelectAddressCtrl'
                    }
                }
            })

            .state('app_loan_selectareaid', {
                url: '/:order/userinfo/address/:type/select',
                views: {
                    'content': {
                        templateUrl: 'templates/loan/address/setting.html',
                        controller: 'SelectAreaIdCtrl'
                    }
                }
            })

            .state('app_loan_agreement', {
                url: '/agreement/loan',
                views: {
                    'content': {
                        templateUrl: 'templates/agreement/loan.html'
                    }
                }
            })

            .state('app_loan_success', {
                url: '/loan/success',
                views: {
                    'content': {
                        templateUrl: 'templates/loan/success.html'
                    }
                }
            })


            .state('app_question_list', {
                url: '/questions',
                views: {
                    'content': {
                        templateUrl: 'templates/question/list.html',
                        controller: 'QuestionListCtrl'
                    }
                }
            })

            .state('app_question_detail', {
                url: '/question/:id',
                views: {
                    'content': {
                        templateUrl: 'templates/question/detail.html',
                        controller: 'QuestionDetailCtrl'
                    }
                }
            })

            .state('app_user_success', {
                url: '/user/regist/success',
                views: {
                    'content': {
                        templateUrl: 'templates/user/success.html'
                    }
                }
            })

            .state('app_user', {
                url: '/user',
                views: {
                    'content': {
                        templateUrl: 'templates/user/index.html',
                        controller: 'UserCtrl'
                    }
                }
            })

            .state('app_user_account', {
                url: '/user/account',
                views: {
                    'content': {
                        templateUrl: 'templates/user/account.html',
                        controller: 'AccountCtrl'
                    }
                }
            })

            .state('app_user_forget', {
                url: '/user/forget',
                views: {
                    'content': {
                        templateUrl: 'templates/user/forget.html',
                        controller: 'ForgetCtrl'
                    }
                }
            })

            .state('app_user_update', {
                url: '/user/update',
                views: {
                    'content': {
                        templateUrl: 'templates/user/update.html',
                        controller: 'UpdateCtrl'
                    }
                }
            })

            .state('app_user_wallet', {
                url: '/user/wallet',
                views: {
                    'content': {
                        templateUrl: 'templates/user/wallet.html',
                        controller: 'WalletCtrl'
                    }
                }
            })

            .state('app_user_about', {
                url: '/user/about',
                views: {
                    'content': {
                        templateUrl: 'templates/user/about.html',
                        controller: 'AboutCtrl'
                    }
                }
            })

            .state('app_user_feedback', {
                url: '/user/feedback',
                views: {
                    'content': {
                        templateUrl: 'templates/user/feedback.html',
                        controller: 'FeedbackCtrl'
                    }
                }
            })

            .state('app_activity', {
                url: '/activity',
                views: {
                    'content': {
                        templateUrl: 'templates/activity/index.html',
                        controller: 'ActivityCtrl'
                    }
                }
            })
        ;

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/home');
    });



