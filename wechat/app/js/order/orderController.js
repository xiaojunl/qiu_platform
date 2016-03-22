/**
 * Created by admin on 2015/9/24.
 */
wechatApp.controller('orderListCtrl', ['$scope','$http','$controller','$routeParams',
    function($scope,$http,$controller,$routeParams) {

        /**$(document).ready(function(){
            $('.one').click(function(){
                $('.alert_pj').show();
            });
            $('.alert_pj a').click(function(){
                $('.alert_pj').hide();
            });
            $('.box').easydrag();
        });**/

        var parentCtrl = $controller('baseCtrl', {$scope: $scope,$http:$http});
        $scope.imgServerPath=GlobalConstant.imgServerPath;

        $scope.loadOrderList=function(oId){
            var interfaceName="/order";
            var params={};
            if(oId!=null&&oId!=""){
                params["oId"]=oId;
            }
            $scope.getApi(interfaceName,params,function(data,status){
                if(oId!=null&&oId!=""){
                    $scope.orderList = $scope.orderList.concat(data.data);//将最新查询的结果拷贝到之前的数组里面
                }else{
                    $scope.orderList = data.data;
                }
                $scope.hasMore=data.more;//是否还有更多数据(true表示有)
            });
        }

        /**
         * 加载更多
         */
        $scope.loadMoreOrder=function(){
            if($scope.hasMore==false){
                return;
            }
            var lastId="";
            if($scope.orderList.length>0){
                lastId=$scope.orderList[$scope.orderList.length-1]._id;//最后一条数据的id
            }
            $scope.loadOrderList(lastId);
        }

        $scope.loadOrderList();
    }
]);

wechatApp.controller('orderDetailCtrl', ['$scope','$http','$controller','$routeParams','$location',
    function($scope,$http,$controller,$routeParams,$location) {
        var parentCtrl = $controller('baseCtrl', {$scope: $scope,$http:$http});
        $scope.imgServerPath=GlobalConstant.imgServerPath;
        $scope.orderId=$routeParams.orderId;

        $(function () {
            $(".jl_tab2").hide(), $(".jl_tab2:eq(0)").show(), $(".Routine2 h3 span").each(function (i) {
                $(this).click(function () {
                    $(".Routine2 h3 span").removeClass(), $(this).addClass("current"), $(".jl_tab2:visible").hide(), $(".jl_tab2:eq(" + i + ")").show();
                });
            });
        });

        $scope.loadOrderDetail=function(oId){
            var interfaceName="/order/details/"+$scope.orderId;
            $scope.getApi(interfaceName,{id:$scope.orderId},function(data,status){
                $scope.orderDetail=data;
                if(data.type==1){
                    $scope.typeName="场馆名称";
                    $scope.typeValue=$scope.orderDetail._venueId.name;
                }else{
                    $scope.typeName="俱乐部名称";
                    $scope.typeValue=$scope.orderDetail._clubId.name;
                }
                $scope.isCanPay=data.status[data.status.length-1]._id;

            });

            /**$scope.getApi("/user/sportBeans",'',function(data,status){
                if(data.sportBeans!=null&&data.sportBeans!=""){
                    $scope.sportBeans=data.sportBeans;
                }else{
                    $scope.sportBeans=0;
                }
            });**/
        }

        /**
         * 获取每个状态的样式
         * @param index
         * @returns {*}
         */
        $scope.getStatusClass=function(index){
            if(index==0){
                return "cur";
            }else{
                return "";
            }
        }


        /**
         * 撤销订单
         */
        $scope.cancelOrder=function(){
            if($scope.orderDetail.refundFlg==0){
                alert("此订单不接受退款,所以不能取消订单!!");
                return;
            }
            if (confirm("您确认要取消订单吗?")){
                $scope.putApi("/order/"+$scope.orderId,{id:$scope.orderId},function(data,status){
                    alert("取消成功!!");
                    history.go(-1);
                });
            }
        }

        /**
         * 支付订单
         */
        $scope.toPaymentOrder=function(){
            if (confirm("您确认要支付吗?")){
                //$scope.sendWxPay($scope.orderId,0.01,0);
                $location.path("/wxPay/"+$scope.orderId);
            }
        }

        $scope.getServicePhone();
        $scope.loadOrderDetail();
    }
]);

/**
 * 微信支付
 */
wechatApp.controller('wxPayCtrl', ['$scope','$http','$controller','$routeParams','$location',
    function($scope,$http,$controller,$routeParams,$location) {
        var parentCtrl = $controller('baseCtrl', {$scope: $scope,$http:$http});
        $scope.orderId=$routeParams.orderId;
        var interfaceName="/order/details/"+$scope.orderId;
        $scope.getApi(interfaceName,{id:$scope.orderId},function(data,status){
            $scope.price=data.price;
        });
        wx.ready(function(){
            //alert("签名成功");
            $scope.sendWxPay($scope.orderId,$scope.price,0);
        });
        wx.error(function(res){
            alert("签名失败,error="+res.errMsg);
        });
        $scope.wxSigna();
    }
]);