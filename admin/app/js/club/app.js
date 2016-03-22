
var clubApp = angular.module('clubApp', [
  'ngRoute',
  'commonControllers',
  'clubControllers',
   'platFilters',
    'platDirective',
    'angularFileUpload'
]);
clubApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
    when('/coachList', {
      templateUrl: 'page/club/coachList.html',
      controller: 'coachListCtrl'
    }).
    when('/orderList', {
        templateUrl: 'page/club/orderList.html',
        controller: 'orderListCtrl'
    }).
    when('/clubSetting', {
        templateUrl: 'page/club/clubInfo.html',
        controller: 'clubSettingCtrl'
    }).
    when('/messageList', {
        templateUrl: 'page/club/messageList.html',
        controller: 'messageListCtrl'
    }).
    when('/financialList', {
        templateUrl: 'page/common/financialList.html',
        controller: 'financialListCtrl'
    }).
    when('/modifyPwd', {
        templateUrl: 'page/common/modifyPwd.html',
        controller: 'modifyPwdCtrl'
    }).
    otherwise({
      redirectTo: '/clubSetting'
    });
  }]);
