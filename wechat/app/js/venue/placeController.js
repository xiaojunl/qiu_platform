/**
 * Created by admin on 2015/9/23.
 */

wechatApp.controller('placeListCtrl', ['$scope','$http','$routeParams','$controller','$location',
    function($scope,$http,$routeParams,$controller,$location) {
        var parentCtrl = $controller('baseCtrl', {$scope: $scope,$http:$http});

        $(function () {
            $(".time_cd table").hide(), $(".time_cd table:eq(0)").show(), $(".time_cd h4 p").each(function (i) {
                $(this).click(function () {
                    $(".time_cd h4 p").removeClass(), $(this).addClass("current"), $(".time_cd table:visible").hide(), $(".time_cd table:eq(" + i + ")").show();
                });
            });
        });

        $(".scroll").on("click",'li',function(){
            $(this).addClass("current").siblings(".current").removeClass("current");

           // $("#day-range p").removeClass("current");
           // $("#day-range p:first").addClass("current");
            $("#day-range p:first").trigger("click");
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

        $scope.morningRange=["06:00","07:00","08:00","09:00","10:00","11:00"];
        $scope.afternoonRange=["12:00","13:00","14:00","15:00","16:00","17:00"];
        $scope.eveningRange=["18:00","19:00","20:00","21:00","22:00","23:00"];
        $scope.imgServerPath=GlobalConstant.imgServerPath;
        $scope.venueId=$routeParams.venueId;
        $scope.nowTime=new Date().format("hh:mm");
        var interfaceName="/venue/"+$scope.venueId;
        $scope.getApi(interfaceName,{id:$scope.venueId},function(data,status){
            $scope.venue=data;
        });
        /**
         * 判断是否有场地属性
         * @param id
         * @returns {boolean}
         */
        $scope.hasProps=function(id){
            if($scope.venue.props.indexOf(id)>-1){
                return true;
            }else{
                return false;
            }
        }

        /**
         * 获取每天场地的价格信息
         * @param day
         */
        $scope.getPlacePriceByDay=function(day){
            $scope.clickDay=day;//记录选择的日期
            $scope.selectPlaceTime={};//记录点击的场次
            $scope.timesCount=0;//记录点击的总场次
            $scope.timesPriceTotal=0;//记录总价格
            var interfaceName="/venue/"+$scope.venueId+"/"+day;
            $scope.getApi(interfaceName,{id:$scope.venueId},function(data,status){
                $scope.PlaceDayPrice=data;
                $scope.orderTimes={};
                for(var orderIndex in data.orderTimes){
                    var orderRecord=data.orderTimes[orderIndex];
                    var orderKey="key"+orderRecord._id;
                    $scope.orderTimes[orderKey]=orderRecord.times;
                }
            });

        }

        /**
         * 获取是否能够预订的状态
         * @param placeId
         * @param timeStr
         * @returns {number}
         */
        $scope.getTimeReservStatus=function(placeId,timeStr){
            if($scope.PlaceDayPrice.time.beginTime>timeStr||$scope.PlaceDayPrice.time.endTime<timeStr){
                //alert($scope.PlaceDayPrice.time.beginTime+","+$scope.PlaceDayPrice.time.endTime+","+timeStr);
                return 2;//超过营业时间
            }
            if(timeStr<$scope.PlaceDayPrice.time.startTime){
                return 3;//已过期不能预订
            }
            var orderKey="key"+placeId;
            var orderTimesRecord=$scope.orderTimes[orderKey];
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
        $scope.totalByTdClick=function(timeReservStatus,placeId,timeValue,price,placeName){
            if(timeReservStatus!=1){
                return;
            }
            var selKey=placeId+"_"+timeValue;
            if($scope.selectPlaceTime[selKey]==null){
                $scope.selectPlaceTime[selKey]=placeName;
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
                alert("您没有选择场地时间段,不能提交订单!!");
                return;
            }
            var orderItems=[];
            for(var selIndex in $scope.selectPlaceTime){
                var placeId=selIndex.split("_")[0];
                var timesel=selIndex.split("_")[1];
                var item=_.findWhere(orderItems,{_id:placeId});
                if(item==null){
                    orderItems.push({_id:placeId,name:$scope.selectPlaceTime[selIndex],times:[timesel]});
                }else{
                    item.times.push(timesel);
                }
            }
            var saveOrder={type:1,_venueId:$scope.venueId,date:$scope.clickDay,price:$scope.timesPriceTotal,orderTimes:orderItems};
            var interfaceName="/order";
            $scope.postApi(interfaceName,saveOrder,function(data,status){
                var orderId=data._id;
                //window.location.href="#submitOrder/"+orderId;
                $location.path("/submitOrder/"+orderId);
            },function(data,status){
                if(status==460){
                    alert("您所选的场地时间段已经被其他人抢先预订了,请重新选择!!");
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