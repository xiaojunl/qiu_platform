
var venueApp = angular.module('venueApp', [
  'ngRoute',
  'commonControllers',
  'venueControllers',
   'platFilters',
    'platDirective',
    'angularFileUpload'
]);
venueApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
    when('/spaceList', {
      templateUrl: 'page/venue/spaceList.html',
      controller: 'spaceListCtrl'
    }).
    when('/orderList', {
        templateUrl: 'page/venue/orderList.html',
        controller: 'orderListCtrl'
    }).
    when('/financialList', {
        templateUrl: 'page/common/financialList.html',
        controller: 'financialListCtrl'
    }).
    when('/venueSetting', {
        templateUrl: 'page/venue/venueInfo.html',
        controller: 'venueSettingCtrl'
    }).
    when('/modifyPwd', {
        templateUrl: 'page/common/modifyPwd.html',
        controller: 'modifyPwdCtrl'
    }).
    when('/messageList', {
        templateUrl: 'page/club/messageList.html',
        controller: 'messageListCtrl'
    }).
    otherwise({
      redirectTo: '/venueSetting'
    });
  }]);
