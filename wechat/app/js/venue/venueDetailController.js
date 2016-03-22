/**
 * Created by admin on 2015/9/24.
 */
wechatApp.controller('venueDetailCtrl', ['$scope','$http','$controller','$routeParams',
    function($scope,$http,$controller,$routeParams) {
        $(function () {
            $(".jl_tab").hide(), $(".jl_tab:eq(0)").show(), $(".Routine h3 span").each(function (i) {
                $(this).click(function () {
                    $(".Routine h3 span").removeClass(), $(this).addClass("current"), $(".jl_tab:visible").hide(), $(".jl_tab:eq(" + i + ")").show();
                });
            });
        });

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

        var parentCtrl = $controller('baseCtrl', {$scope: $scope,$http:$http});
        $scope.imgServerPath=GlobalConstant.imgServerPath;
        var venueId=$routeParams.venueId;
        var interfaceName="/venue/detail/"+venueId;
        $scope.getApi(interfaceName,{id:venueId},function(data,status){
            $scope.venueDetail=data;
            $scope.imgUrls=$scope.venueDetail.imgUrls;
            $scope.imgUrlsScrollLength=[];
            for(var i=0;i<$scope.imgUrls.length-1;i++){
                $scope.imgUrlsScrollLength[i]=i;
            }
        });

        /**
         * 判断是否有场地属性
         * @param id
         * @returns {boolean}
         */
        $scope.hasProps=function(id){
            if($scope.venueDetail.props.indexOf(id)>-1){
                return true;
            }else{
                return false;
            }
        }

        //切换常规信息，客户评价的标签操作
        $scope.spanType=1;
        $scope.onRoutineSpanClick=function(type){
            $scope.spanType=type;
        }


        //默认调用的
        $scope.getServicePhone();
    }
]);