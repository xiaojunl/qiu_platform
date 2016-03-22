/**
 * Created by admin on 2015/9/13.
 */
var loginApp = angular.module('loginApp', []);
loginApp.config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.withCredentials = true;//允许跨域请求
}]);

loginApp.controller('loginCtrl', ['$scope','$http',
    function($scope,$http) {
        $scope.isCanSubmit=function(){
            if($scope.username==null||$scope.username==""){
                return false;
            }else if($scope.password==null||$scope.password==""){
                return false;
            }else if($scope.type==null||$scope.type==""){
                return false;
            }else{
                return true;
            }
        }
        $scope.submit = function () {
            if($scope.isCanSubmit()==false){
                alert("登陆信息填写不完整!!");
                return;
            }
            var interfaceName=GlobalConstant.serverPath+"/user/login";
            $http.post(interfaceName, {username: $scope.username, password: $scope.password,type:$scope.type}).success(function (data,status) {
                if (data.type===2) {
                    //进入场馆方主页面
                    window.location = "venueMain.html";
                }else if (data.type===3) {
                    //进入俱乐部主页面
                    window.location = "clubMain.html";
                }else if (data.type===4) {
                    //进入平台方主页面
                    window.location = "platformMain.html";
                } else {
                    alert("无权限登陆");
                }
            }).error(function(data,status){
                if(status==401){
                    //angular.toJson(data)
                    alert("用户名或密码错误!!");
                }else{
                    alert("未知异常");
                }
            });
        }
    }]);