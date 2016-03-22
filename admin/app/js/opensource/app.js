
var opensourceApp = angular.module('opensourceApp', [
  'ngRoute',
  'opensourceControllers'
]);


opensourceApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
    when('/share/:type/:id', {
      templateUrl: 'page/opensource/share.html',
      controller: 'shareCtrl'
    }).
    when('/shareTest/:type/:id', {
      templateUrl: 'page/opensource/share.html',
      controller: 'shareTestCtrl'
    }).otherwise({
      redirectTo: '/share'
    });
  }]);