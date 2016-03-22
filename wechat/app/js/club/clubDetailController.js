/**
 * Created by admin on 2015/9/28.
 */

wechatApp.controller('clubDetailCtrl', ['$scope','$http','$controller','$routeParams',
    function($scope,$http,$controller,$routeParams) {


        $scope.clubId=$routeParams.clubId;
        var parentCtrl = $controller('baseCtrl', {$scope: $scope,$http:$http});
        $scope.imgServerPath=GlobalConstant.imgServerPath;

        $scope.$on('ngRepeatFinished',function(ngRepeatFinishedEvent) {
            //angularjs加载完成后需要做的一些事情
            var slider = Swipe(document.getElementById('scroll_img'), {
                auto: 3000,
                continuous: true,
                callback: function(pos) {
                    var i = bullets.length;
                    while (i--) {
                        bullets[i].className = '';
                    }
                    bullets[pos].className = 'on';
                }
            });
            var bullets = document.getElementById('scroll_position').getElementsByTagName('li');
            $(function(){
                $('.scroll_position_bg').css({
                    width:$('#scroll_position').width()
                });
            });
        });

        var interfaceName="/club/details/"+$scope.clubId;
        $scope.clubDetail={};
        $scope.getApi(interfaceName,{id:$scope.clubId},function(data,status){
            $scope.clubDetail=data;
            $scope.imgUrls=$scope.clubDetail.imgUrls;
            $scope.imgUrlsScrollLength=[];
            for(var i=0;i<$scope.imgUrls.length-1;i++){
                $scope.imgUrlsScrollLength[i]=i;
            }
        });


        //默认调用的
        $scope.getServicePhone();
    }
]);