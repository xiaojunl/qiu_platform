/**
 * Created by admin on 2015/9/28.
 */

wechatApp.controller('coachDetailCtrl', ['$scope','$http','$controller','$routeParams','$location',
    function($scope,$http,$controller,$routeParams,$location) {


        var parentCtrl = $controller('baseCtrl', {$scope: $scope,$http:$http});
        $scope.imgServerPath=GlobalConstant.imgServerPath;

        $scope.coachId=$routeParams.coachId;


        $(function () {
            $(".jl_tab").hide(), $(".jl_tab:eq(0)").show(), $(".jl_jj h3 span").each(function (i) {
                $(this).click(function () {
                    $(".jl_jj h3 span").removeClass(), $(this).addClass("current"), $(".jl_tab:visible").hide(), $(".jl_tab:eq(" + i + ")").show();
                });
            });
        });
        $(".scroll").on("click",'li',function(){
            $(this).addClass("current").siblings(".current").removeClass("current");
        });

        $(".book-t").on("click", "td", function() {
            if(!($(this).hasClass("nobr") || $(this).hasClass("no"))) {
                $(this).toggleClass("current");
            }
        });


        $scope.dayWeekArray=$scope.getDateDayWeek(30);//计算最近30天的日期星期数据
        $scope.$on('ngRepeatFinished',function(ngRepeatFinishedEvent) {
            //angularjs加载完成后需要做的一些事情
            var Scroll = new iScroll('wrapper',{hScrollbar:false,hScroll: true,vScroll: false,});
            $(".scroll li:first").attr("class","current");
        });

        /**
         * 获取教练详情
         */
        $scope.loadCoachDetail=function(){
            var interfaceName="/club/coach/detail/"+$scope.coachId;
            $scope.getApi(interfaceName,{id:$scope.coachId},function(data,status){
                $scope.coachDetail=data;
                //$scope.getApi("/club/details/"+data._clubId,{id:data._clubId},function(data,status){
                //    $scope.clubObj=data;
                //});
            });
        }

        $scope.loadCoachDetail();


        /**
         * 获取每天场地的价格信息
         * @param day
         */
        $scope.getPlacePriceByDay=function(day){
            $scope.clickDay=day;//记录选择的日期
            $scope.selectPlaceTime={};//记录点击的场次
            $scope.timesCount=0;//记录点击的总场次
            $scope.timesPriceTotal=0;//记录总价格
            var interfaceName="/club/coach/"+$scope.coachId+"/"+day;
            $scope.morningRange=[];
            $scope.afternoonRange=[];
            $scope.eveningRange=[];
            $scope.getApi(interfaceName,{id:$scope.coachId,date:day},function(data,status){
                $scope.PlaceDayPrice=data;
                $scope.orderTimes=data.orderTimes;
                $scope.morningRange=["07:00","08:00","09:00","10:00","11:00"];
                $scope.afternoonRange=["12:00","13:00","14:00","15:00","16:00"];
                $scope.eveningRange=["17:00","18:00","19:00","20:00","21:00"];
            });

        }

        /**
         * 获取是否能够预订的状态
         * @param placeId
         * @param timeStr
         * @returns {number}
         */
        $scope.getTimeReservStatus=function(timeStr){
            if($scope.PlaceDayPrice.time.beginTime>timeStr||$scope.PlaceDayPrice.time.endTime<timeStr){
                //alert($scope.PlaceDayPrice.time.beginTime+","+$scope.PlaceDayPrice.time.endTime+","+timeStr);
                return 2;//超过营业时间
            }
            if(timeStr<$scope.PlaceDayPrice.time.startTime){
                return 3;//已过期不能预订
            }
            var orderTimesRecord=$scope.orderTimes;
            if(orderTimesRecord!=null&&orderTimesRecord.indexOf(timeStr)>-1){
                return 4;//已预订
            }
            return 1;//能够预订
        }

        /**
         * 获取td样式
         * @param timeReservStatus
         * @returns {*}
         */
        $scope.getTimeTdClass=function(timeReservStatus){
            if(timeReservStatus==1){
                return "brr brt";//能预订的样式
            }else{
                return "no";
            }
        }

        /**
         * 点击td的时候统计价格信息
         * @param timeReservStatus
         */
        $scope.totalByTdClick=function(timeReservStatus,timeValue){
            if(timeReservStatus!=1){
                return;
            }
            var selKey=timeValue;
            var price=$scope.coachDetail.price;
            if($scope.selectPlaceTime[selKey]==null){
                $scope.selectPlaceTime[selKey]=$scope.coachDetail.name;
                $scope.timesCount++;
                $scope.timesPriceTotal=(Number($scope.timesPriceTotal)+Number(price)).toFixed(2);
            }else{
                delete $scope.selectPlaceTime[selKey];
                $scope.timesCount--;
                $scope.timesPriceTotal=(Number($scope.timesPriceTotal)-Number(price)).toFixed(2);
            }
        }

        /**
         * 提交订单
         */
        $scope.submitOrder=function(){
            if($scope.timesCount==0){
                alert("您没有选择时间段,不能提交订单!!");
                return;
            }
            var orderItems=[];
            var placeId=$scope.coachDetail._id;
            for(var selIndex in $scope.selectPlaceTime){
                var timesel=selIndex;
                var item=_.findWhere(orderItems,{_id:placeId});
                if(item==null){
                    orderItems.push({_id:placeId,name:$scope.selectPlaceTime[selIndex],times:[timesel]});
                }else{
                    item.times.push(timesel);
                }
            }
            var saveOrder={type:2,_clubId:$scope.coachDetail._clubId._id,date:$scope.clickDay,price:$scope.timesPriceTotal,orderTimes:orderItems};
            var interfaceName="/order";
            $scope.postApi(interfaceName,saveOrder,function(data,status){
                var orderId=data._id;
                $location.path("/submitOrder/"+orderId);
            },function(data,status){
                if(status==460){
                    alert("您所选的时间段已经被其他人抢先预订了,请重新选择!!");
                    $scope.getPlacePriceByDay($scope.clickDay);
                }else if(status==401&&data.code==40103){
                    alert("请验证您的手机号!!");
                    window.location.href="#/bindUser";
                }else{
                    alert("提交订单失败!!"+angular.toJson(data));
                }
            });
        }


        $scope.getPlacePriceByDay(new Date().format("yyyy-MM-dd"));


    }
]);