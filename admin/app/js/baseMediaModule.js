/**
 * Created by admin on 2015/11/17.
 */

var baseMediaModule = angular.module('baseMediaModule', []);

baseMediaModule.config(['$httpProvider', function($httpProvider) {
    //$httpProvider.interceptors.push('httpInterceptor');
   // $httpProvider.defaults.withCredentials = false;//允许跨域请求
}]);

baseModule.controller('baseMediaCtrl', ['$scope','$http',
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
        $scope.getApi=function(interfaceName,params,callBackFunc,errorCallBackFunc){
            var interfaceUrlName=GlobalConstant.javaServerPath+interfaceName;
            $scope.showLoading=true;
            $http.get(interfaceUrlName,{params:params,withCredentials:false}).success(function(data,status) {
                $scope.showLoading=false;
                callBackFunc(data,status);
            }).error(function(data,status){
                $scope.showLoading=false;
                if(typeof errorCallBackFunc=='function'){
                    errorCallBackFunc(data,status);
                }else {
                    if (status == 401 && data.code == 40101) {
                        //alert(angular.toJson(data));
                        location.href = "index.html";
                    } else {
                        alert("获取数据失败,error=" + angular.toJson(data)+",status="+status);
                    }
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
            if(params["limit"]==null){
                params["limit"]=GlobalConstant.pageSize;
            }
            var searchFieldValue=$scope.searchField;
            if(searchFieldValue!=null&&searchFieldValue!=""){
                params["searchField"]=searchFieldValue;
            }
            $scope.getApi(interfaceName, params,function(data,status){
                $scope.datas = data.data;
                if($("#pagination").length>0) {
                    $scope.itemCount = data.paging.itemCount;
                    $scope.currentPage = pageNum;
                    $scope.pageCount = data.paging.pageCount;
                    if($scope.pageCount==0){
                        $scope.pageCount=1;
                    }
                    $scope.renderPaginator(pageNum, data.paging.pageCount, 5, function (event, oldPage, currentPage) {
                        if (pageNum != currentPage) {
                            $scope.queryData(interfaceName, currentPage,params);
                        }
                    });
                }
            });
        }

        /**
         * 从服务端查询数据(没有分页)
         * @param interfaceName 服务端的接口名称
         */
        $scope.queryDataUnPage=function(interfaceName,params){
            if(params==null||params==""){
                params={};
            }
            params["searchField"]=$scope.searchField;
            $scope.getApi(interfaceName, params,function(data,status){
                $scope.datas = data;
            });
        }

        /**
         * post请求服务端获取数据
         * @param interfaceName 服务端的接口名称
         * @param params    参数
         * @param callBackFunc  成功后的回调函数
         */
        $scope.postApi=function(interfaceName,params,callBackFunc,errorCallBackFunc){
            $scope.showLoading=true;
            var interfaceUrlName=GlobalConstant.javaServerPath+interfaceName;
            var transFn = function(data) {
                return $.param(data);
            }
            var postCfg = {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                withCredentials:false,
                transformRequest: transFn
            };
            $http.post(interfaceUrlName,params,postCfg).success(function(data,status) {
                $scope.showLoading=false;
                callBackFunc(data,status);
            }).error(function(data,status){
                $scope.showLoading=false;
                if(typeof errorCallBackFunc=='function'){
                    errorCallBackFunc(data,status);
                }else{
                    alert("提交数据失败,error="+data+",status="+status);
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
                        toast("保存成功!!");
                        $scope.reload();
                        if(winModal!=null){
                            winModal.modal('hide');
                        }
                    }

                },function(data,status){
                    if(typeof errorFunc=='function'){
                        errorFunc(data,status);
                    }else{
                        toastError("保存失败!!");

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
                $scope.postApi(interfaceName,params,function(data,status){
                    if(typeof successFunc=='function'){
                        successFunc(data,status);
                    }else{
                        toast("保存成功!!");
                        $scope.reload();
                        if(winModal!=null){
                            winModal.modal('hide');
                        }
                    }

                },function(data,status){
                    if(typeof errorFunc=='function'){
                        errorFunc(data,status);
                    }else{
                        toastError("保存失败!!"+angular.toJson(data));
                    }
                })
            }else{
                $scope.submitted=true;
                return false;
            }

        }


        $scope.updateRecordData=function(interfaceName,params,successMessage,errorMessage){
            $scope.postApi(interfaceName,params,function(data,status){
                toast(successMessage);
                $scope.reload();
            },function(data,status){
                toastError(errorMessage+":"+angular.toJson(data));
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
            $scope.postApi(interfaceName,params,function(data,status){
                if(typeof successFunc=='function'){
                    successFunc(data,status);
                }else{
                    toast("删除成功!!");
                    $scope.reload();
                }

            },function(data,status){
                if(typeof errorFunc=='function'){
                    errorFunc(data,status);
                }else{
                    toastError("删除失败!!");
                }

            });
        }

        /**
         * 提交带文件的表单
         * @param $upload   上传组件
         * @param file  上传的文件对象
         * @param method    请求类型(post,put)
         * @param interfaceName 请求接口路径
         * @param params    参数对象
         * @param winModal
         * @param successFunc
         * @param errorFunc
         * @returns {boolean}
         */
        $scope.submitFileForm=function($upload,file,method,interfaceName,params,winModal,successFunc,errorFunc){
            $scope.submitted = false;
            $scope.showLoading=true;
            $upload.upload({
                url: GlobalConstant.javaServerPath+interfaceName, //upload.php script, node.js route, or servlet url
                method: method,
                data: params,
                withCredentials:false,
                file: file
            }).progress(function (evt) {
                console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
            }).success(function (data, status, headers, config) {
                $scope.showLoading=false;
                if(typeof successFunc=='function'){
                    successFunc(data,status);
                }else{
                    toast("保存成功!!");
                    $scope.reload();
                    if(winModal!=null){
                        winModal.modal('hide');
                    }
                }
            }).error(function(data,status){
                $scope.showLoading=false;
                if(typeof errorFunc=='function'){
                    errorFunc(data,status);
                }else{
                    toastError("保存失败!!"+angular.toJson(data));
                }
            });
        }

        $scope.submitPicFileForm=function($upload,file,method,interfaceName,params,winModal,successFunc,errorFunc){
            $scope.submitted = false;
            $scope.showLoading=true;
            $upload.upload({
                url: GlobalConstant.serverPath+interfaceName, //upload.php script, node.js route, or servlet url
                method: method,
                data: params,
                file: file
            }).progress(function (evt) {
                console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
            }).success(function (data, status, headers, config) {
                $scope.showLoading=false;
                if(typeof successFunc=='function'){
                    successFunc(data,status);
                }else{
                    toast("保存成功!!");
                    $scope.reload();
                    if(winModal!=null){
                        winModal.modal('hide');
                    }
                }
            }).error(function(data,status){
                $scope.showLoading=false;
                if(typeof errorFunc=='function'){
                    errorFunc(data,status);
                }else{
                    toastError("保存失败!!"+angular.toJson(data));
                }
            });
        }

        //上传图片
        $scope.uploadPic = function (isValid,$upload) {
            if(isValid) {//验证通过
                $scope.submitted = false;
            }else{
                $scope.submitted = true;
                return;
            }
            if($scope.uploadPicLength==null||$scope.uploadPicLength<1){
                alert("请必须上传图片!!");
                return;
            }
            //var picWidth = $scope.pic.width; //图片宽度
            //var picHeight = $scope.pic.height; //图片高度
            var interfaceName="/plat/upload";
            $scope.submitPicFileForm($upload,$scope.uploadPicFile,'post',interfaceName,'','',function(data,status){
                if(status==200){
                    var picUrl = GlobalConstant.imgServerPath+data.filename; //图片路径
                    //插入图片
                    //ue.execCommand("insertHtml", "<img src='"+picUrl+"' width='"+picWidth+"' height='"+picHeight+"'style='max-width: 100%;' />");
                    ue.execCommand("insertHtml", "<img src='"+picUrl+"' style='max-width: 100%;' />");
                    //关闭弹出框
                    $("#uploadModal").modal("hide");
                }else{
                    toastError("上传图片失败!!");
                }

            },function(data,status){
                toastError("上传失败!!"+angular.toJson(data));
            });
        }

        $scope.onUploadPicSelect = function ($files) {
            $scope.uploadPicLength=$files.length;
            for (var i = 0; i < $files.length; i++) {
                if ($files[i].type!=""&&'|image/jpeg|image/png|image/jpg|image/bmp|image/gif|'.indexOf($files[i].type) > -1) {
                    $scope.filemessage = "";
                } else {
                    alert("只能选择图片");
                    $scope.uploadPicLength=0;
                    break;
                }
            }
            $scope.uploadPicFile = $files;
        }
    }
]);