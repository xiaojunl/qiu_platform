
var platformApp = angular.module('platformApp', [
  'ngRoute',
  'commonControllers',
  'platformControllers',
  'mallControllers',
  'mediaControllers',
   'platFilters',
    'platDirective',
    'angularFileUpload'
]);


platformApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
    when('/userCnts', {
      templateUrl: 'page/platform/user/userCnts.html',
      controller: 'userCntsCtrl'
    }).
    when('/venueList', {
      templateUrl: 'page/platform/venue/venueList.html',
      controller: 'venueListCtrl'
    }).
    when('/clubList', {
        templateUrl: 'page/platform/club/clubList.html',
        controller: 'clubListCtrl'
    }).
    when('/userinfo', {
      templateUrl: 'page/platform/user/info.html'
    }).
    when('/userchange', {
      templateUrl: 'page/platform/user/change.html'
    }).
    when('/financialList/:type', {
        templateUrl: 'page/common/financialList.html',
        controller: 'financialListCtrl'
    }).
    when('/mallFinancial/:type', {
        templateUrl: 'page/platform/mall/financialList.html',
        controller: 'financialListCtrl'
    }).
    when('/orderList/:type', {
        templateUrl: 'page/platform/order/orderList.html',
        controller: 'orderListCtrl'
    }).
    when('/sysParamList', {
        templateUrl: 'page/platform/sys/sysParams.html',
        controller: 'sysParamListCtrl'
    }).
    when('/sysMessageList', {
        templateUrl: 'page/platform/sys/sendMessage.html',
        controller: 'sysMessageListCtrl'
    }).
    when('/bannerList', {
        templateUrl: 'page/platform/sys/bannerList.html',
        controller: 'bannerListCtrl'
    }).
    when('/bannerUpload/:bannerId', {
        templateUrl: 'page/platform/sys/bannerUpload.html',
        controller: 'bannerUploadCtrl'
    }).
    when('/pageConfigList', {
        templateUrl: 'page/platform/sys/pageConfigList.html',
        controller: 'pageConfigListCtrl'
    }).
    when('/pageConfig/:id', {
        templateUrl: 'page/platform/sys/pageConfig.html',
        controller: 'pageConfigCtrl'
    }).
    when('/arrangeList', {
        templateUrl: 'page/platform/arrange/arrangeList.html',
        controller: 'arrangeListCtrl'
    }).
    when('/goodsList', {
        templateUrl: 'page/platform/mall/goodsList.html',
        controller: 'goodsListCtrl'
    }).
    when('/saveGoods/:id', {
        templateUrl: 'page/platform/mall/goods.html',
        controller: 'saveGoodsCtrl'
    }).
    when('/activityList', {
        templateUrl: 'page/platform/mall/activityList.html',
        controller: 'activityListCtrl'
    }).
    when('/goodsOrderList', {
        templateUrl: 'page/platform/mall/orderList.html',
        controller: 'goodsOrderListCtrl'
    }).
    when('/saveActivity/:id', {
        templateUrl: 'page/platform/mall/activity.html',
        controller: 'saveActivityCtrl'
    }).
    when('/mediaBackGround', {
        templateUrl: 'page/platform/media/mediaBackGround.html',
        controller: 'mediaBackGroundCtrl'
    }).
    when('/publicTagList', {
        templateUrl: 'page/platform/media/publicTagList.html',
        controller: 'publicTagCtrl'
    }).
    when('/publicGameList', {
        templateUrl: 'page/platform/media/publicGameList.html',
        controller: 'publicGameCtrl'
    }).
    when('/publicPlayerList', {
        templateUrl: 'page/platform/media/publicPlayerList.html',
        controller: 'publicPlayerCtrl'
    }).
    when('/publicSpecialList', {
        templateUrl: 'page/platform/media/publicSpecialList.html',
        controller: 'publicSpecialCtrl'
    }).
    when('/savePublicGame/:type/:id', {
        templateUrl: 'page/platform/media/savePublicGame.html',
        controller: 'mediaPublicCtrl'
    }).
    when('/savePublicPlayer/:type/:id', {
        templateUrl: 'page/platform/media/savePublicPlayer.html',
        controller: 'mediaPublicCtrl'
    }).
    when('/savePublicSpecial/:type/:id', {
        templateUrl: 'page/platform/media/savePublicSpecial.html',
        controller: 'mediaPublicCtrl'
    }).
    when('/savePublicTag/:type/:id', {
        templateUrl: 'page/platform/media/savePublicTag.html',
        controller: 'mediaPublicCtrl'
    }).
    when('/newstypeList', {
        templateUrl: 'page/platform/media/newstypeList.html',
        controller: 'newstypeCtrl'
    }).
    when('/mediaNewsList', {
        templateUrl: 'page/platform/media/mediaNewsList.html',
        controller: 'mediaNewsListCtrl'
    }).
    when('/saveMediaNews/:id', {
        templateUrl: 'page/platform/media/saveMediaNews.html',
        controller: 'saveMediaNewsCtrl'
    }).
    when('/videotypeList', {
        templateUrl: 'page/platform/media/videotypeList.html',
        controller: 'videotypeCtrl'
    }).
    when('/mediaVideoList', {
        templateUrl: 'page/platform/media/mediaVideoList.html',
        controller: 'mediaVideoListCtrl'
    }).
    when('/saveMediaVideo/:id', {
        templateUrl: 'page/platform/media/saveMediaVideo.html',
        controller: 'saveMediaVideoCtrl'
    }).
    when('/rankingWay', {
        templateUrl: 'page/platform/media/playerRankingWayList.html',
        controller: 'rankingWayCtrl'
    }).
    when('/rankingPhase', {
        templateUrl: 'page/platform/media/rankingPhaseList.html',
        controller: 'rankingPhaseCtrl'
    }).
    when('/autoRankingDetail/:rangkingWayId/:num', {
        templateUrl: 'page/platform/media/autoRankingDetailList.html',
        controller: 'rankingDetailCtrl'
    }).
    when('/doubleRankingDetail/:rangkingWayId/:num', {
        templateUrl: 'page/platform/media/doubleRankingDetailList.html',
        controller: 'rankingDetailCtrl'
    }).
    when('/saveDoubleWayRank', {
        templateUrl: 'page/platform/media/doubleWayRanking.html',
        controller: 'saveDoubleWayRankCtrl'
    }).
    when('/keyWorldList', {
        templateUrl: 'page/platform/media/keyworldList.html',
        controller: 'keyWorldCtrl'
    }).
    when('/mediaStat', {
        templateUrl: 'page/platform/media/mediaStat.html',
        controller: 'mediaStatCtrl'
    }).
    otherwise({
      redirectTo: '/venueList'
    });
  }]);

platformApp.directive('onFinishRenderFilters',function($timeout) {
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