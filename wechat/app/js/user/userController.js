/**
 * Created by admin on 2015/9/24.
 */
wechatApp.controller('accountCtrl', ['$scope','$http','$controller','$routeParams',
    function($scope,$http,$controller,$routeParams) {
        var parentCtrl = $controller('baseCtrl', {$scope: $scope,$http:$http});
        $scope.imgServerPath=GlobalConstant.imgServerPath;

        $scope.loadInfo=function(){
            var interfaceName="/user";
            $scope.getApi(interfaceName,'',function(data,status){
                $scope.user=data;
            });
        }

        $scope.loadInfo();
    }
]);

//绑定手机号
wechatApp.controller('bindUserCtrl', ['$scope','$http','$controller','$routeParams','$location',
    function($scope,$http,$controller,$routeParams,$location) {
        var parentCtrl = $controller('baseCtrl', {$scope: $scope,$http:$http});

        //60秒
        $(function() {
            //获取验证码
            $("#checkBtn2").on("click", function(e) {
                e.preventDefault();
                if($scope.mobile==null||$scope.mobile==""){
                    return;
                }else{
                    var MOBILE_REGEXP =/^1[3,4,5,7,8][0-9]{9}$/;
                    if (!MOBILE_REGEXP.test($scope.mobile)) {
                        return;
                    }
                }
                $btn = $(this);
                $btn.val("重新获取(60)").prop("disabled",true).addClass("btn-disabled2");
                var s = 60; //倒计时60秒
                var intervalId = window.setInterval(function() {
                    if(s==0) {
                        $btn.val("重新获取").prop("disabled",false).removeClass("btn-disabled2");
                        window.clearInterval(intervalId);
                    }else {
                        $btn.val("重新获取("+s+")")
                        s = s-1;
                    }
                }, 1000);
            });
        });

        //提交绑定手机号信息
        $scope.submitUserInfo=function(){
            if($scope.mobile==null||$scope.mobile==""){
                alert("手机号码不能为空!!");
                return;
            }else{
                var MOBILE_REGEXP =/^1[3,4,5,7,8][0-9]{9}$/;
                if (!MOBILE_REGEXP.test($scope.mobile)) {
                    alert("手机号格式不正确!!");
                    return;
                }
            }
            if($scope.validCode==null||$scope.validCode==""){
                alert("验证码不能为空!!");
                return;
            }
            var interfaceName="/user/sportBeans";
            $scope.postApi(interfaceName,{mobile:$scope.mobile,sportBeans:20,captcha:$scope.validCode},function(data,status){
                alert("恭喜您,绑定成功!!");
                $location.path("/account");
                //window.location.href="#account";
            },function(data,status){
                if(status==400){
                    if(data.code==40001){
                        alert("无效手机号");
                    }else if(data.code==40003){
                        alert("验证码过期");
                    }else if(data.code==40004){
                        alert("验证码错误");
                    }
                }else if(status==460){
                    alert("您已经绑定,不能重复绑定!!");
                }else{
                    alert("绑定失败!!");
                }
            });
        }

        //获取验证码
        $scope.getValidCode=function(){
            if($scope.mobile==null||$scope.mobile==""){
                alert("手机号码不能为空!!");
                return;
            }else{
                var MOBILE_REGEXP =/^1[3,4,5,7,8][0-9]{9}$/;
                if (!MOBILE_REGEXP.test($scope.mobile)) {
                    alert("手机号格式不正确!!");
                    return;
                }
            }
            var interfaceName="/captcha/bd/"+$scope.mobile;
            $scope.getApi(interfaceName,{type:'bd',mobile:$scope.mobile},function(data,status){
                alert("验证码已发送到您手机,请注意查收!!");
            });
        }
    }
]);



//获取运动豆
wechatApp.controller('getSportBeansCtrl', ['$scope','$http','$controller','$routeParams','$location',
    function($scope,$http,$controller,$routeParams,$location) {
        var parentCtrl = $controller('baseCtrl', {$scope: $scope,$http:$http});
        $(function(){
            var oHeight = $(".sub_head").outerHeight();
            var oTop =$(window).height();
            var oDa =oTop-oHeight;
            $(".dodo").height(oDa)
        })
        //60秒
        $(function() {
            //获取验证码
            $("#checkBtn").on("click", function(e) {
                e.preventDefault();
                if($scope.mobile==null||$scope.mobile==""){
                    return;
                }else{
                    var MOBILE_REGEXP =/^1[3,4,5,7,8][0-9]{9}$/;
                    if (!MOBILE_REGEXP.test($scope.mobile)) {
                        return;
                    }
                }
                $btn = $(this);
                $btn.val("重新获取(60)").prop("disabled",true).addClass("btn-disabled");
                var s = 60; //倒计时60秒
                var intervalId = window.setInterval(function() {
                    if(s==0) {
                        $btn.val("重新获取").prop("disabled",false).removeClass("btn-disabled");
                        window.clearInterval(intervalId);
                    }else {
                        $btn.val("重新获取("+s+")")
                        s = s-1;
                    }
                }, 1000);
            });
        });

        //提交绑定手机号信息
        $scope.submitUserSportBean=function(){
            if($scope.mobile==null||$scope.mobile==""){
                alert("手机号码不能为空!!");
                return;
            }else{
                var MOBILE_REGEXP =/^1[3,4,5,7,8][0-9]{9}$/;
                if (!MOBILE_REGEXP.test($scope.mobile)) {
                    alert("手机号格式不正确!!");
                    return;
                }
            }
            if($scope.validCode==null||$scope.validCode==""){
                alert("验证码不能为空!!");
                return;
            }
            var interfaceName="/user/sportBeans";
            $scope.postApi(interfaceName,{mobile:$scope.mobile,sportBeans:20,captcha:$scope.validCode},function(data,status){
                alert("恭喜您,领取运动豆成功!!");
                //window.location.href="#account";
                $location.path("/account");
            },function(data,status){
                if(status==400){
                    if(data.code==40001){
                        alert("无效手机号");
                    }else if(data.code==40003){
                        alert("验证码过期");
                    }else if(data.code==40004){
                        alert("验证码错误");
                    }
                }else if(status==460){
                    alert("您已经领取,不能重复领取!!");
                }else{
                    alert("领取失败!!");
                }
            });
        }

        //获取验证码
        $scope.getValidCode=function(){
            if($scope.mobile==null||$scope.mobile==""){
                alert("手机号码不能为空!!");
                return;
            }else{
                var MOBILE_REGEXP =/^1[3,4,5,7,8][0-9]{9}$/;
                if (!MOBILE_REGEXP.test($scope.mobile)) {
                    alert("手机号格式不正确!!");
                    return;
                }
            }
            var interfaceName="/captcha/bd/"+$scope.mobile;
            $scope.getApi(interfaceName,{type:'ydd',mobile:$scope.mobile},function(data,status){
                alert("验证码已发送到您手机,请注意查收!!");
            });
        }
    }
]);
