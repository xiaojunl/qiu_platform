/**
 * Created by admin on 2015/9/24.
 */

var wechatApp = angular.module('wechatApp', ['ngRoute','baseModule','platFilters']);
wechatApp.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
        when('/main', {templateUrl: 'main.html'}).
        when('/reservVenue', {templateUrl: 'page/venue/reservVenue.html',controller: 'reservVenueCtrl'}).
        when('/placeList/:venueId', {templateUrl: 'page/venue/placeList.html',controller: 'placeListCtrl'}).
        when('/venueDetail/:venueId', {templateUrl: 'page/venue/venueDetail.html',controller: 'venueDetailCtrl'}).
        when('/submitOrder/:orderId', {templateUrl: 'page/order/submitOrder.html',controller: 'submitOrderCtrl'}).
        when('/orderList', {templateUrl: 'page/order/orderList.html',controller: 'orderListCtrl'}).
        when('/orderDetail/:orderId', {templateUrl: 'page/order/orderDetail.html',controller: 'orderDetailCtrl'}).
        when('/bindUser', {templateUrl: 'page/user/bindUser.html',controller: 'bindUserCtrl'}).
        when('/account', {templateUrl: 'page/user/account.html',controller: 'accountCtrl'}).
        when('/getSportBeans', {templateUrl: 'page/user/getSportBeans.html',controller: 'getSportBeansCtrl'}).
        when('/reservClub', {templateUrl: 'page/club/reservClub.html',controller: 'reservClubCtrl'}).
        when('/coachList/:clubId', {templateUrl: 'page/club/coachList.html',controller: 'coachListCtrl'}).
        when('/clubDetail/:clubId', {templateUrl: 'page/club/clubDetail.html',controller: 'clubDetailCtrl'}).
        when('/coachDetail/:coachId', {templateUrl: 'page/club/coachDetail.html',controller: 'coachDetailCtrl'}).
        when('/wxPay/:orderId', {templateUrl: 'page/order/wxPay.html',controller: 'wxPayCtrl'}).
        otherwise({redirectTo: '/main'});
    }]);
wechatApp.directive('onFinishRenderFilters',function($timeout) {
    return {
                restrict: 'A',
                link: function(scope,element,attr) {
                if (scope.$last === true) {
                        //$timeout(function() {
                                scope.$emit('ngRepeatFinished');
                        //});
                }
                }
        };
});
