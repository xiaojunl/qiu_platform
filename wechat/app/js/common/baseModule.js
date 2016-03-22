/**
 * Created by admin on 2015/9/14.
 */

var baseModule = angular.module('baseModule', []);
//拦截器
baseModule.factory('httpInterceptor', [function() {
        var httpInterceptor = {
            request: function(config) {
                config.headers['api_key'] ="spELZBoBVr6R9V_IFp-XAV7Uor-FtzXEmUKEapFh";
                return config;
            }
        }
        return httpInterceptor;
}])
baseModule.config(['$httpProvider', function($httpProvider) {
    $httpProvider.interceptors.push('httpInterceptor');
    //$httpProvider.defaults.withCredentials = true;//允许跨域请求
}]);

baseModule.controller('baseCtrl', ['$scope','$http',
    function($scope,$http) {

        /**
         * 分页插件
         * currentPage:当前页
         * totalPages:总页数
         * numberOfPages:分页组件上显示的页数
         * onPageChanged:点击分页后的回调函数
         */
        $scope.renderPaginator=function(currentPage, totalPages, numberOfPages,onPageChanged){
            if(typeof numberOfPages=='function'){
                onPageChanged = numberOfPages;
                numberOfPages = 5;
            }
            var options = {
                bootstrapMajorVersion : 3,
                size : 'small',
                alignment : 'right',
                currentPage : currentPage,
                totalPages : totalPages,
                numberOfPages : numberOfPages,
                tooltipTitles : function(type, page, current) {
                    switch (type) {
                        case "first":
                            return "首页";
                        case "prev":
                            return "上一页";
                        case "next":
                            return "下一页";
                        case "last":
                            return "尾页";
                        case "page":
                            return "第" + page + "页";
                    }
                },
                itemTexts: function (type, page, current) { // <<  < ... > >>
                    switch (type) {
                        case "first":
                            return "首页";
                        case "prev":
                            return "上一页";
                        case "next":
                            return "下一页";
                        case "last":
                            return "尾页";
                        case "page":
                            return page;
                    }
                },
                pageUrl : function(type, page, current) {
                    return "javascript:;";
                },
                onPageChanged : onPageChanged
            }
            $("#pagination").bootstrapPaginator(options);
        }

        /**
         * get请求服务端获取数据
         * @param interfaceName 服务端的接口名称
         * @param params    参数
         * @param callBackFunc  成功后的回调函数
         */
        $scope.getApi=function(interfaceName,params,callBackFunc){
            var interfaceUrlName=GlobalConstant.serverPath+interfaceName;
            $http.get(interfaceUrlName,{params:params}).success(function(data,status) {
                callBackFunc(data,status);
            }).error(function(data,status){
                if(status==401&&data.code==40101){
                    alert(angular.toJson(data));
                    //location.href="index.html";
                }else if(status==401&&data.code==40103){
                    alert("请验证您的手机号");
                    window.location.href="#/bindUser";
                }else{
                    alert("获取数据失败,error="+angular.toJson(data)+",status="+status);
                }
            });
        }

        /**
         * 分页从服务端查询数据
         * @param interfaceName 服务端的接口名称
         * @param pageNum   当前要查询的是第几页
         */
        $scope.queryData=function(interfaceName,pageNum,params){
            if(params==null||params==""){
                params={};
            }
            params["page"]=pageNum;
            params["limit"]=GlobalConstant.pageSize;
            params["searchField"]=$scope.searchField;
            $scope.getApi(interfaceName, params,function(data,status){
                $scope.datas = data.data;
                if($("#pagination").length>0) {
                    $scope.itemCount = data.paging.itemCount;
                    $scope.currentPage = pageNum;
                    $scope.pageCount = data.paging.pageCount;
                    $scope.renderPaginator(pageNum, data.paging.pageCount, 5, function (event, oldPage, currentPage) {
                        if (pageNum != currentPage) {
                            $scope.queryData(interfaceName, currentPage);
                        }
                    });
                }
            });
        }

        /**
         * post请求服务端获取数据
         * @param interfaceName 服务端的接口名称
         * @param params    参数
         * @param callBackFunc  成功后的回调函数
         */
        $scope.postApi=function(interfaceName,params,callBackFunc,errorCallBackFunc){
            var interfaceUrlName=GlobalConstant.serverPath+interfaceName;
            $http.post(interfaceUrlName,params).success(function(data,status) {
                callBackFunc(data,status);
            }).error(function(data,status){
                if(typeof errorCallBackFunc=='function'){
                    errorCallBackFunc(data,status);
                }else{
                    alert("提交数据失败,error="+data);
                }
            });
        }

        /**
         * put请求服务端获取数据
         * @param interfaceName 服务端的接口名称
         * @param params    参数
         * @param callBackFunc  成功后的回调函数
         */
        $scope.putApi=function(interfaceName,params,callBackFunc,errorCallBackFunc){
            var interfaceUrlName=GlobalConstant.serverPath+interfaceName;
            $http.put(interfaceUrlName,params).success(function(data,status) {
                callBackFunc(data,status);
            }).error(function(data,status){
                if(typeof errorCallBackFunc=='function'){
                    errorCallBackFunc(data,status);
                }else{
                    alert("提交数据失败,error="+angular.toJson(data));
                }
            });
        }

        /**
         * delete请求服务端获取数据
         * @param interfaceName 服务端的接口名称
         * @param params    参数
         * @param callBackFunc  成功后的回调函数
         */
        $scope.deleteApi=function(interfaceName,params,callBackFunc,errorCallBackFunc){
            var interfaceUrlName=GlobalConstant.serverPath+interfaceName;
            $http.delete(interfaceUrlName,params).success(function(data,status) {
                callBackFunc(data,status);
            }).error(function(data,status){
                if(typeof errorCallBackFunc=='function'){
                    errorCallBackFunc(data,status);
                }else{
                    alert("提交数据失败,error="+data);
                }
            });
        }


        /**
         * 添加数据到服务端
         * @param isValid 表单验证是否通过
         * @param interfaceName 请求的接口名称
         * @param params 参数对象
         * @param winModal 新增窗体对话框
         */
        $scope.addData=function(isValid,interfaceName,params,winModal,successFunc,errorFunc){
            $scope.submitted = false;
            if(isValid){//验证通过
                $scope.postApi(interfaceName,params,function(data,status){
                    if(typeof successFunc=='function'){
                        successFunc(data,status);
                    }else{
                        alert("保存成功!!");
                        $scope.reload();
                        if(winModal!=null){
                            winModal.modal('hide');
                        }
                    }

                },function(data,status){
                    if(typeof errorFunc=='function'){
                        errorFunc(data,status);
                    }else{
                        alert("保存失败!!");

                    }
                })
            }else{
                $scope.submitted=true;
                return false;
            }

        }

        /**
         * 修改数据到服务端
         * @param isValid 表单验证是否通过
         * @param interfaceName 请求的接口名称
         * @param params 参数对象
         * @param winModal 修改窗体对话框
         */
        $scope.updateData=function(isValid,interfaceName,params,winModal,successFunc,errorFunc){
            $scope.submitted = false;
            if(isValid){//验证通过
                $scope.putApi(interfaceName,params,function(data,status){
                    if(typeof successFunc=='function'){
                        successFunc(data,status);
                    }else{
                        alert("保存成功!!");
                        $scope.reload();
                        if(winModal!=null){
                            winModal.modal('hide');
                        }
                    }

                },function(data,status){
                    if(typeof errorFunc=='function'){
                        errorFunc(data,status);
                    }else{
                        alert("保存失败!!");
                    }
                })
            }else{
                $scope.submitted=true;
                return false;
            }

        }


        $scope.updateRecordData=function(interfaceName,params,successMessage,errorMessage){
                $scope.putApi(interfaceName,params,function(data,status){
                    toast(successMessage);
                    $scope.reload();
                },function(data,status){
                    toastError(errorMessage);
                })

        }

        /**
         * 删除服务端数据
         * @param interfaceName 接口名称
         * @param params    参数对象
         * @param successFunc   成功后回调函数
         * @param errorFunc 失败后回调函数
         */
        $scope.deleteData=function(interfaceName,params,successFunc,errorFunc){
            $scope.deleteApi(interfaceName,params,function(data,status){
                if(typeof successFunc=='function'){
                    successFunc(data,status);
                }else{
                    alert("删除成功!!");
                    $scope.reload();
                }

            },function(data,status){
                if(typeof errorFunc=='function'){
                    errorFunc(data,status);
                }else{
                    alert("删除失败!!");
                }

            });
        }

        /**
         * 获取N天内的所有日期数组对象(包含yyyyMMdd日期格式,MM-dd日期格式,星期)
         * @param n
         */
        $scope.getDateDayWeek=function(n){
            var weekArray=[];
            weekArray[0]="星期日";
            weekArray[1]="星期一";
            weekArray[2]="星期二";
            weekArray[3]="星期三";
            weekArray[4]="星期四";
            weekArray[5]="星期五";
            weekArray[6]="星期六";

            var dayWeekArray=[];
            var curDate=new Date();
            for(var i=0;i<=n;i++){
                var m_date=new Date();
                m_date.setDate(curDate.getDate()+i);
                var ymd=m_date.format("yyyy-MM-dd");
                var md=m_date.format("MM-dd");
                var week=weekArray[m_date.getDay()];
                var dayRecord={ymd:ymd,md:md,week:week};
                dayWeekArray[i]=dayRecord;
            }
            return dayWeekArray;
        }

        //获取服务电话号码
        $scope.getServicePhone=function(){
            $scope.getApi("/comm",null,function(data,status){
                $scope.serviceTelephone=data.serviceTelephone;
            });
        }

        /**
         * 微信签名
         */
        $scope.wxSigna=function(){
            $scope.getApi("/sign/sign4jssdk",'',function(data,status){
                var appId=data.appId;
                var timestamp=data.timestamp;
                var nonceStr=data.nonceStr;
                var signature=data.signature;
                wx.config({
                    debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                    appId:appId, // 必填，公众号的唯一标识
                    timestamp:timestamp , // 必填，生成签名的时间戳
                    nonceStr: nonceStr, // 必填，生成签名的随机串
                    signature: signature,// 必填，签名，见附录1
                    jsApiList: ['onMenuShareAppMessage','chooseWXPay','getLocation'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
                });
            });

        }

        /**
         * 发起微信支付
         */
        $scope.sendWxPay=function(orderId,price,sportBeans){
            $scope.postApi("/pay/sign4wx",{orderId:orderId,price:price,sportBeans:sportBeans},function(data,status){
                wx.chooseWXPay({
                    timestamp:String(data.timeStamp), // 支付签名时间戳，注意微信jssdk中的所有使用timestamp字段均为小写。但最新版的支付后台生成签名使用的timeStamp字段名需大写其中的S字符
                    nonceStr: data.nonceStr, // 支付签名随机串，不长于 32 位
                    package: data.package, // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=***）
                    signType: data.signType, // 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
                    paySign: data.paySign, // 支付签名
                    success: function (res) {
                        // 支付成功后的回调函数
                        //$location.path("/orderList");
                        window.location.href="#orderList";
                    },
                    fail:function(res){
                        alert(angular.toJson(res));
                    }
                });
            });
        }

        /**
         * 通过微信获取经纬度
         */
        $scope.wxGetLocation=function(){
            wx.getLocation({
                type: 'wgs84', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
                success: function (res) {
                    var latitude = res.latitude; // 纬度，浮点数，范围为90 ~ -90
                    var longitude = res.longitude; // 经度，浮点数，范围为180 ~ -180。
                    //var speed = res.speed; // 速度，以米/每秒计
                    //var accuracy = res.accuracy; // 位置精度
                    $scope.currentPoint=[latitude,longitude];
                    alert("currentPoint="+$scope.currentPoint);
                }
            });
        }
    }
]);