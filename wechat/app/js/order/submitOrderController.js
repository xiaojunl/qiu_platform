/**
 * Created by admin on 2015/9/24.
 */
wechatApp.controller('submitOrderCtrl', ['$scope','$http','$routeParams','$controller','$location',

    function($scope,$http,$routeParams,$controller,$location) {
        var parentCtrl = $controller('baseCtrl', {$scope: $scope,$http:$http});

        $scope.orderId=$routeParams.orderId;

        /**
         * 加载订单信息
         */
        $scope.loadOrderDetail=function(){
            $scope.getApi("/order/"+$scope.orderId,{id:$scope.orderId},function(data,status){
                $scope.orderDetail=data;
                if(data.type==1){
                    $scope.typeName="场馆名称";
                    $scope.typeValue=$scope.orderDetail._venueId.name;
                }else{
                    $scope.typeName="俱乐部名称";
                    $scope.typeValue=$scope.orderDetail._clubId.name;
                }
                $scope.isCanPay=data.status[0]._id;

            });

            $scope.getApi("/user/sportBeans",'',function(data,status){
                if(data.sportBeans!=null&&data.sportBeans!=""){
                    $scope.sportBeans=data.sportBeans;
                }else{
                    $scope.sportBeans=0;
                }
            });
        }

        /**
         * 撤销订单
         */
        $scope.cancelOrder=function(){
            if (confirm("您确认要取消订单吗?")){
                $scope.deleteApi("/order/"+$scope.orderId,{id:$scope.orderId},function(data,status){
                    alert("取消成功!!");
                    history.go(-1);
                });
            }
        }

        /**
         * 支付订单
         */
        $scope.paymentOrder=function(){
            if (confirm("您确认要支付吗?")){
                $location.path("/wxPay/"+$scope.orderId);
            }
        }

        $scope.loadOrderDetail();

    }
]);
