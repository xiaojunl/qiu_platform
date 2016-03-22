/**
 * Created by admin on 2015/9/21.
 * 俱乐部相关的controller
 */

/**
 * 预定俱乐部
 */
wechatApp.controller('reservClubCtrl', ['$scope','$http','$controller',
    function($scope,$http,$controller) {
        var parentCtrl = $controller('baseCtrl', {$scope: $scope,$http:$http});
        $scope.imgServerPath=GlobalConstant.imgServerPath;
        //$scope.$on('ngRepeatFinished',function(ngRepeatFinishedEvent) {
            var Scroll = new iScroll('scroll',{hScrollbar:false,hScroll:false,vScroll:true,checkDOMChanges:true});
            var Scroll = new iScroll('scroll2',{hScrollbar:false,hScroll:false,vScroll:true,checkDOMChanges:true});
            $(".accordion-desc").fadeOut(0);
            $(".accordion").click(function() {
                $(".accordion-desc").not($(this).next()).slideUp('fast');
                $(this).next().slideToggle(400);
            });
        //});

        /**
         * 定位获取当前坐标
         */
        $scope.getPoint=function(){
            if($scope.currentPoint==null){
                //定位
                navigator.geolocation.getCurrentPosition($scope.translatepoint,$scope.onError,{ maximumAge: 3000, timeout: 50000, enableHighAccuracy: true });
            }
        }
        // onError回调函数
        $scope.onError=function(error) {
            alert('获取当前地址信息失败,code: '    + error.code    + '\n' +'message: ' + error.message + '\n');
            $scope.initClubData("上海市");
        }
        $scope.translatepoint=function(position){
            var currentlat = position.coords.latitude;
            var currentlon = position.coords.longitude;
            var gpspoint = new BMap.Point(currentlon, currentlat);
            BMap.Convertor.translate(gpspoint, 0, $scope.initmap); //转换坐标
        }

        $scope.initmap=function(point){
            $scope.currentPoint=[point.lng,point.lat];//当前经纬度
            var gc = new BMap.Geocoder();
            gc.getLocation(point, function(rs){
                var addComp = rs.addressComponents;
                $scope.initClubData(addComp.city);
                //$scope.initClubData("上海市");
            });
        }

        /**
         * 获取区域信息
         * @param city
         */
        $scope.loadAreaList=function(){
            var interfaceName="/area/"+$scope.currentCity;
            $scope.getApi(interfaceName,{city:$scope.currentCity},function(data,status){
                $scope.areaArray=data;
            });
        }

        /**
         * 获取俱乐部信息
         * @param city
         */
        $scope.loadClubList=function(vId){
            var interfaceName="/club/near";
            var params={city:$scope.currentCity,sortBy:$scope.sortBy,loc:$scope.currentPoint};
            if($scope.currentArea!=""){
                params["area"]=$scope.currentArea;
            }
            if(vId!=null&&vId!=""){
                params["vId"]=vId;
            }
            $scope.getApi(interfaceName,params,function(data,status){
                if(vId!=null&&vId!=""){
                    $scope.venueList = $scope.venueList.concat(data.data);//将最新查询的结果拷贝到之前的数组里面
                }else{
                    $scope.venueList = data.data;
                }
                $scope.hasMore=data.more;//是否还有更多数据(true表示有)
            });
        }

        $scope.initClubData=function(city){
            $scope.cityTip="全城";
            $scope.currentCity=city;
            $scope.currentArea='';
            $scope.sortBy=0;
            $scope.hasMore=false;//是否有更多数据
            $scope.venueList=[];
            $scope.putApi("/user/loc",{loc:$scope.currentPoint,city:$scope.currentCity},function(data,status){
            });
            $scope.loadAreaList();
            $scope.loadClubList();
        }

        /**
         * 当选择区域时的事件操作
         * @param area
         */
        $scope.areaClick=function(area){
            $scope.currentArea=area;
            $(".accordion-desc").not($(this).next()).slideUp('fast');
            $(this).next().slideToggle(400);
            if(area==""){
                $scope.cityTip="全城";
            }else{
                $scope.cityTip=area;
            }
            $scope.loadClubList();
        }

        /**
         * 智能排序的事件操作
         * @param sort
         */
        $scope.sortClick=function(sort){
            $scope.sortBy=sort;
            $(".accordion-desc").not($(this).next()).slideUp('fast');
            $(this).next().slideToggle(400);
            $scope.loadClubList();
        }

        /**
         * 加载更多
         */
        $scope.loadMoreClub=function(){
            if($scope.hasMore==false){
                return;
            }
            var lastId="";
            if($scope.venueList.length>0){
                lastId=$scope.venueList[$scope.venueList.length-1]._id;//最后一条数据的id
            }
            $scope.loadClubList(lastId);
        }

        $scope.getPoint();
        //$scope.currentPoint=[121.47,31.23];
        //$scope.initClubData("上海市");
    }]);