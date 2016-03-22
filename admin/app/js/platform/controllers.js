/**
 * 平台方相关controller
 * Created by admin on 2015/9/13.
 */
var platformControllers = angular.module('platformControllers', ['baseModule']);

/**
 * 场馆管理
 */
platformControllers.controller('venueListCtrl', ['$scope','$http','$controller',
  function($scope,$http,$controller) {
      var parentCtrl = $controller('baseCtrl', {$scope: $scope,$http:$http});
      /**
       * 从后台查询场馆数据
       */
      $scope.queryVenue=function(){
          var interfaceName='/plat/venue';
          $scope.queryData(interfaceName,1);
      }


      /**
       * 重新加载表格中的数据
       */
      $scope.reload = function () {
          $scope.queryVenue();
      }

      /**
       * 添加场馆数据
       */
      $scope.addVenue = function (isValid) {
              var interfaceName="/plat/venue";
              var params={username: $scope.username, password: $scope.password,name:$scope.name,contactName:$scope.contactName,mobile:$scope.mobile};
              $scope.addData(isValid,interfaceName,params,$('#addModal'),'',function(data,status){
                  if(data.code==40002){
                      toastError("该登陆账户已经存在!!");
                      return false;
                  }else{
                      toastError("保存失败!!");
                  }
              });
        }

      /**
       * 打开修改窗体
       * @param index   行记录下标
       */
      $scope.showUpdateModal = function (index) {
         $scope.venue={};
         $scope.venue.id=$scope.datas[index]._venueId._id;
         $scope.deleteOptions=[
             {name:'启用',id:0},
             {name:'停用',id:1}
         ];
         $scope.venue.deleteFlg=$scope.datas[index]._venueId.deleteFlg;
         $("#updateModal").modal("show");
      }

      /**
       * 修改场馆数据
       */
      $scope.updateVenue = function (isValid) {
          var interfaceName="/plat/venue";
          var params={id: $scope.venue.id, deleteFlg: $scope.venue.deleteFlg};
          $scope.updateData(isValid,interfaceName,params,$('#updateModal'));
      }

      /**
       *  删除场馆
       * @param id
       */
      $scope.deleteVenue = function (index) {
          var id=$scope.datas[index]._venueId._id;
          var deleteFlg=$scope.datas[index]._venueId.deleteFlg;
          if(deleteFlg==0){
              toastError("启用状态不能删除!!");
              return;
          }
          alertMsg("提示信息","确定删除您所选的记录?","删除该场馆过后数据不能恢复",function() {
              var interfaceName = "/plat/venue/" + id;
              var params = {id: id};
              $scope.deleteData(interfaceName, params);
          })
      }


      //页面初始化
      $scope.searchField="";
      $scope.queryVenue();
  }]);




/**
 * 俱乐部管理
 */
platformControllers.controller('clubListCtrl', ['$scope','$http','$controller',
    function($scope,$http,$controller) {
        var parentCtrl = $controller('baseCtrl', {$scope: $scope,$http:$http});
        /**
         * 从后台查询俱乐部数据
         */
        $scope.queryClub=function(){
            var interfaceName='/plat/club';
            $scope.queryData(interfaceName,1);
        }


        /**
         * 重新加载表格中的数据
         */
        $scope.reload = function () {
            $scope.queryClub();
        }

        /**
         * 打开新增窗体
         */
        $scope.showAddModalClub = function () {
            $("#addModalClub").modal("show");
        }

        /**
         * 添加俱乐部数据
         */
        $scope.addClub = function (isValid) {
            var interfaceName="/plat/club";
            var params={username: $scope.username, password: $scope.password,name:$scope.name,contactName:$scope.contactName,mobile:$scope.mobile};
            $scope.addData(isValid,interfaceName,params,$('#addModalClub'),'',function(data,status){
                if(data.code==40002){
                    toastError("该登陆账户已经存在!!");
                    return false;
                }else{
                    toastError("保存失败!!");
                }
            });
        }

        /**
         * 打开修改窗体
         * @param index   行记录下标
         */
        $scope.showUpdateModalClub = function (index) {
            $scope.club={};
            $scope.club.id=$scope.datas[index]._clubId._id;
            $scope.deleteOptions=[
                {name:'启用',id:0},
                {name:'停用',id:1}
            ];
            $scope.club.deleteFlg=$scope.datas[index]._clubId.deleteFlg;
            $("#updateModalClub").modal("show");
        }

        /**
         * 修改俱乐部数据
         */
        $scope.updateClub = function (isValid) {
            var interfaceName="/plat/club";
            var params={id: $scope.club.id, deleteFlg: $scope.club.deleteFlg};
            $scope.updateData(isValid,interfaceName,params,$('#updateModalClub'));
        }

        /**
         *  删除俱乐部
         * @param id
         */
        $scope.deleteClub = function (index) {
            var id=$scope.datas[index]._clubId._id;
            var deleteFlg=$scope.datas[index]._clubId.deleteFlg;
            if(deleteFlg==0){
                toastError("启用状态不能删除!!");
                return;
            }
            alertMsg("确认信息","确定删除您所选的记录?","删除该俱乐部过后数据不能恢复",function(){
                var interfaceName="/plat/club/"+id;
                var params={id:id};
                $scope.deleteData(interfaceName,params);
            })

        }


        //页面初始化
        $scope.searchField="";
        $scope.queryClub();
    }]);


/**
 * 订单维护
 */
platformControllers.controller('orderListCtrl', ['$scope','$http','$controller','$routeParams',
    function($scope,$http,$controller,$routeParams) {
        var parentCtrl = $controller('baseCtrl', {$scope: $scope, $http: $http});
        $scope.type=$routeParams.type;
        //点击查看&关闭详情
        $scope.userBoxClick=function($event,index){
            $scope.curOrderUser=$scope.datas[index]._userId;
            $event.preventDefault();
            $event.stopPropagation();
            var offset = $($event.currentTarget).offset();
            //$("#userBox").css({"left":offset.left+"px", "top":(offset.top+22)+"px"}).slideDown();
            $("#userBox").css({"left":offset.left+"px", "top":(offset.top+22)+"px"}).slideToggle();
        }
        $("#userBox").on("click", function(e) {
            e.stopPropagation();
        });
        $scope.placeBoxClick=function($event,index){
            $scope.curOrderTime=$scope.datas[index].orderTimes;
            $event.preventDefault();
            $event.stopPropagation();
            var offset = $($event.currentTarget).offset();
            $("#placeBox").css({"left":offset.left+"px", "top":(offset.top+22)+"px"}).slideToggle();
        }
        $("#placeBox").on("click", function(e) {
            e.stopPropagation();
        });
        $scope.statusBoxClick=function($event,index){
            $scope.curOrderStatus=$scope.datas[index].status;
            $event.preventDefault();
            $event.stopPropagation();
            var offset = $($event.currentTarget).offset();
            $("#statusBox").css({"left":offset.left+"px", "top":(offset.top+22)+"px"}).slideToggle();
        }
        $("#statusBox").on("click", function(e) {
            e.stopPropagation();
        });
        $scope.buyerBoxClick=function($event,index){
            $scope.buyer=$scope.datas[index]._venueId;
            if($scope.type==2){
                $scope.buyer=$scope.datas[index]._clubId;
            }
            $event.preventDefault();
            $event.stopPropagation();
            var offset = $($event.currentTarget).offset();
            $("#buyerBox").css({"left":offset.left+"px", "top":(offset.top+22)+"px"}).slideToggle();
        }
        $("#buyerBox").on("click", function(e) {
            e.stopPropagation();
        });

        $("body").on("click", function() {
            $("#userBox").slideUp();
            $("#placeBox").slideUp();
            $("#statusBox").slideUp();
            $("#buyerBox").slideUp();
        });
        //选择日期
        $(".dpicker").datepicker({
            format: 'yyyy-mm-dd',
            language: 'zh-CN',
            todayHighlight: true
        });

        $scope.timeOptions=[
            {name:'全部',id:'0'},
            {name:'今天',id:'1'},
            {name:'最近一个月',id:'2'},
            {name:'最近三个月',id:'3'}
        ];

        $scope.orderStatusOptions=[
            {name:'全部',id:''},
            {name:'未支付',id:'0'},
            {name:'已支付',id:'1'},
            {name:'已接单',id:'2'},
            {name:'交易成功',id:'3'},
            {name:'退款中',id:'7'},
            {name:'交易失败',id:'99'}
        ];
        $scope.timeFlg='0';
        $scope.orderStatus='1';

        /**
         * 从后台查询订单数据
         */
        $scope.queryOrderList=function(){
            var interfaceName='/plat/order';
            var timeFlg=$scope.timeFlg;
            if(timeFlg==0){
                $scope.search.beginTime="";
                $scope.search.endTime="";
            }else if(timeFlg==1){
                $scope.search.beginTime=new Date().format("yyyy-MM-dd");
                $scope.search.endTime=$scope.search.beginTime;
            }else if(timeFlg==2){
                $scope.search.endTime=new Date().format("yyyy-MM-dd");
                var m_date=new Date();
                m_date.setDate(new Date().getDate()-30);
                $scope.search.beginTime=m_date.format("yyyy-MM-dd");
            }else if(timeFlg==3){
                $scope.search.endTime=new Date().format("yyyy-MM-dd");
                var m_date=new Date();
                m_date.setDate(new Date().getDate()-90);
                $scope.search.beginTime=m_date.format("yyyy-MM-dd");
            }
            var beginTime=$scope.search.beginTime;
            var endTime=$scope.search.endTime;
            var orderNum=$scope.search.orderNum;
            var userNum=$scope.search.userNum;
            var orderStatus=$scope.orderStatus;
            var shopId=$scope.search.shopId;
            var params={};

            params["type"]=$scope.type;
            if(beginTime!=null&&beginTime!=""){
                params["beginTime"]=beginTime;
            }
            if(endTime!=null&&endTime!=""){
                params["endTime"]=endTime;
            }
            if(orderNum!=null&&orderNum!=""){
                params["oId"]=orderNum;
            }
            if(userNum!=null&&userNum!=""){
                params["userId"]=userNum;
            }
            if(orderStatus!=null&&orderStatus!=""){
                params["status"]=orderStatus;
            }
            if(shopId!=null&&shopId!=""){
                params["shopId"]=shopId;
            }
            $scope.queryData(interfaceName,1,params);
        }


        /**
         * 重新加载表格中的数据
         */
        $scope.reload = function () {
            $scope.queryOrderList();
        }

        /**
         * 确认订单
         */
        $scope.confirmOrder=function(id){
            alertMsg("提示信息","确定要接此订单吗?","",function() {
                var interfaceName = "/order/confirm";
                var params = {id: id,status:2};
                $scope.updateRecordData(interfaceName,params,"接单成功!!","接单失败!!");
            })
        }

        $scope.showRefuseOrderModal = function (index) {
            $scope.refuseId=index;
            $scope.refuseContent="";
            $("#refuseOrderModal").modal("show");
        }

        /**
         * 拒绝订单
         */
        $scope.refuseOrder=function(isValid){
            $scope.submitted = false;
            if(isValid==false) {//验证通过
                $scope.submitted=true;
                return false;
            }
            //alertMsg("提示信息","确定要拒绝此订单吗?","",function() {
            var id=$scope.refuseId;
            var interfaceName = "/order/confirm";
            var params = {id:id,reason:$scope.refuseContent,status:5};
            $scope.updateRecordData(interfaceName,params,"拒绝成功!!","拒绝失败!!");
            $("#refuseOrderModal").modal("hide");
            // })
        }

        $scope.search={};
        $scope.search.beginTime="";
        $scope.search.endTime="";
        $scope.search.timeFlg=0;
        $scope.search.orderNum="";
        $scope.search.userNum="";
        $scope.search.orderStatus=0;
        $scope.searchField="";
        $scope.queryOrderList();
    }
]);


/**
 * 用户统计
 */
platformControllers.controller('userCntsCtrl', ['$scope','$http','$controller','$routeParams',
    function($scope,$http,$controller,$routeParams) {
        var parentCtrl = $controller('baseCtrl', {$scope: $scope,$http:$http});
        /**
         * 从后台查询数据
         */
        $scope.queryUserCnts=function(){
            var interfaceName='/plat/user';

            $scope.getApi(interfaceName, '',function(data,status){
                $scope.userCnts = data;
            });
        }


        $scope.searchResult=false;
        $scope.search={};
        $scope.queryUserCnts();

        /**
         * 查询用户信息
         */
        $scope.searchUserInfo = function () {
            var user=$scope.search.user;
            if(user==null||user==""){
                alert("请输入手机号!!");
                return;
            }
            var MOBILE_REGEXP =/^1[3,4,5,7,8][0-9]{9}$/;
            if (!MOBILE_REGEXP.test(user)) {
                alert("手机号格式不正确!!");
                return;
            }
            var interfaceName="/plat/user/"+user;
            var params={};
            params["mobile"]=user;
            $scope.getApi(interfaceName,params,function(data,status){
                $scope.searchUser = data;
                $scope.searchResult=true;
            },function(data,status){
                $scope.searchResult=false;
                if(status==404){
                    alert("不存在该用户!!");
                }
            });
        }
    }]);



/**
 * 系统参数管理
 */
platformControllers.controller('sysParamListCtrl', ['$scope','$http','$controller',
    function($scope,$http,$controller) {
        var parentCtrl = $controller('baseCtrl', {$scope: $scope,$http:$http});
        /**
         * 从后台查询数据
         */
        $scope.queryParams=function(){
            var interfaceName='/plat/venue';
            $scope.queryData(interfaceName,1);
        }


        /**
         * 重新加载表格中的数据
         */
        $scope.reload = function () {
            $scope.queryParams();
        }

        /**
         * 打开修改窗体
         * @param index   行记录下标
         */
        $scope.showUpdateModal = function (index) {
            $scope.sysParam={};
            $scope.sysParam.id=$scope.datas[index]._id;
            $scope.sysParam.content=$scope.datas[index].content;
            $("#updateModal").modal("show");
        }

        /**
         * 修改模板信息数据
         */
        $scope.updateSysParam = function (isValid) {
            var interfaceName="/plat/venue";
            var params={id: $scope.sysParam.id,content:$scope.sysParam.content};
            $scope.updateData(isValid,interfaceName,params,$('#updateModal'));
        }


        //页面初始化
        $scope.searchField="";
        $scope.queryParams();
    }]);



/**
 * 系统消息管理
 */
platformControllers.controller('sysMessageListCtrl', ['$scope','$http','$controller',
    function($scope,$http,$controller) {
        var parentCtrl = $controller('baseCtrl', {$scope: $scope,$http:$http});
        /**
         * 从后台查询数据
         */
        $scope.queryMessage=function(){
            var interfaceName='/message';
            $scope.queryData(interfaceName,1);
        }


        /**
         * 重新加载表格中的数据
         */
        $scope.reload = function () {
            $scope.queryMessage();
        }

        /**
         * 打开发送消息窗体
         * @param index   行记录下标
         */
        $scope.showSendModal = function () {
            $scope.content="";
            $("#updateModal").modal("show");
        }

        /**
         * 发送消息
         */
        $scope.doSendMessage = function (isValid) {
            var interfaceName="/message";
            if($scope.sendType==null||$scope.sendType==""){
                alert("推送方式不能为空!!");
                return;
            }
            if($scope.sendObj==null||$scope.sendObj==""){
                alert("推送对象不能为空!!");
                return;
            }
            var params={content:$scope.content,type:$scope.sendType,to:$scope.sendObj};
            $scope.addData(isValid,interfaceName,params,$('#updateModal'));
        }


        //页面初始化
        $scope.searchField="";
        $scope.queryMessage();
    }]);


/**
 * banner管理
 */
platformControllers.controller('bannerListCtrl', ['$scope','$http','$controller','$upload',
    function($scope,$http,$controller,$upload) {
        $scope.imgServerPath=GlobalConstant.imgServerPath;
        var parentCtrl = $controller('baseCtrl', {$scope: $scope,$http:$http});

        /**
         * 从后台查询数据
         */
        $scope.queryBanners=function(){
            var interfaceName='/banner';
            $scope.queryDataUnPage(interfaceName);
        }


        /**
         * 重新加载表格中的数据
         */
        $scope.reload = function () {
            $scope.queryBanners();
        }


        /**
         *  删除baaner
         * @param id
         */
        $scope.deleteBanner = function (index) {
            var id=$scope.datas[index]._id;
            alertMsg("提示信息","确定删除您所选的记录?","删除该banner过后数据不能恢复",function() {
                var interfaceName = "/banner/" + id;
                var params = {id: id};
                $scope.deleteData(interfaceName, params);
            })
        }


        //页面初始化
        $scope.searchField="";
        $scope.queryBanners();
    }]);


platformControllers.controller('bannerUploadCtrl', ['$scope','$http','$controller','$upload','$routeParams','$location',
    function($scope,$http,$controller,$upload,$routeParams,$location) {
        $scope.imgServerPath=GlobalConstant.imgServerPath;
        var parentCtrl = $controller('baseCtrl', {$scope: $scope,$http:$http});

        $scope.bannerId=$routeParams.bannerId;
        $("#ueDiv").hide();
        $("#urlDiv").hide();
        $("#newsDiv").hide();

        $("input[name=type]").click(function(){
            $("#ueDiv").hide();
            $("#urlDiv").hide();
            $("#newsDiv").hide();
            switch($("input[name=type]:checked").attr("id")){
                case "type1":
                    $("#newsDiv").show();
                    break;
                case "type2":
                    $("#ueDiv").show();
                    break;
                case "type4":
                    $("#urlDiv").show();
                    break;
                default:
                    $("#ueDiv").hide();
                    $("#urlDiv").hide();
                    $("#newsDiv").hide();
                    break;
            }
        });

        $scope.uploadPicToServer = function (isValid) {
            $scope.uploadPic(isValid,$upload);
        }

        /**
         * 打开新增窗体
         */
        $scope.showAddModalBanner = function () {
            $scope.banner={};
            $scope.banner.type=3;
            $scope.deleteOptions=[
                {name:'启用',id:0},
                {name:'停用',id:1}
            ];
            $("#ueDiv").hide();
        }

        $scope.onImgSelect = function ($files) {
            $scope.imgLength=$files.length;
            $scope.files = $files;
            for (var i = 0; i < $files.length; i++) {
                if ($files[i].type!=""&&'|image/jpeg|image/png|image/jpg|image/bmp|image/gif|'.indexOf($files[i].type) > -1) {
                    $scope.filemessage = "";
                } else {
                    alert("只能选择图片");
                    $scope.imgLength=0;
                    break;
                }
            }
            $scope.imgFile = $files;
        }

        /**
         * 打开新闻列表
         */
        $scope.showNewsList = function () {
            $("#showNewsListModal").modal("show");
            $scope.searchField="";
            $scope.reloadNewsList();
        }

        $scope.findNewsList=function(pageNum,params){
            $scope.showLoading=true;
            if(params==null||params==""){
                params={};
            }
            params["page"]=pageNum;
            params["limit"]=GlobalConstant.pageSize;
            params["enableStatus"]=0;
            params["searchField"]=$scope.searchField;
            var interfaceUrlName=GlobalConstant.javaServerPath+"/medianew/findlist.do";
            $http.get(interfaceUrlName,{params:params,withCredentials:false}).success(function(data,status) {
                $scope.showLoading=false;
                $scope.newsDatas = data.data;
                if($("#pagination").length>0) {
                    $scope.itemCount = data.paging.itemCount;
                    $scope.currentPage = pageNum;
                    $scope.pageCount = data.paging.pageCount;
                    if($scope.pageCount==0){
                        $scope.pageCount=1;
                    }
                    $scope.renderPaginator(pageNum, data.paging.pageCount, 5, function (event, oldPage, currentPage) {
                        if (pageNum != currentPage) {
                            $scope.findNewsList(currentPage,params);
                        }
                    });
                }
            }).error(function(data,status){
                $scope.showLoading=false;
                alert("获取数据失败,error=" + angular.toJson(data)+",status="+status);
            });
        }

        $scope.reloadNewsList=function(){
            var params={};
            $scope.findNewsList(1,params);
        }

        /**
         * 选中一条新闻记录
         */
        $scope.chooseNews = function (id,title) {
            $scope.banner.newsId=id;
            $scope.banner.newsContent=title;
            $("#showNewsListModal").modal("hide");
        }

        /**
         * 保存数据
         */
        $scope.saveBanner = function (isValid) {
            if(isValid) {//验证通过
                $scope.submitted = false;
            }else{
                $scope.submitted = true;
                return;
            }
            if($scope.imgLength==null||$scope.imgLength<1){
                alert("请必须上传BANNER图片!!");
                return;
            }
            var dataId=$scope.banner.id;
            var params={id:dataId ,name: $scope.banner.name,type:$scope.banner.type,deleteFlg:$scope.banner.deleteFlg,sort:$scope.banner.sort};
            if($scope.banner.type==2){
                if(ue.getContentTxt()==""){
                    alert("网页内容不能为空!!");
                    return;
                }
                params["content"]=ue.getContent();
            }else if($scope.banner.type==4){
                if($scope.banner.urlAddress==null||$scope.banner.urlAddress==""){
                    alert("URL跳转地址不能为空!!");
                    return;
                }
                params["content"]=$scope.banner.urlAddress;
            }else if($scope.banner.type==1){
                if($scope.banner.newsId==null||$scope.banner.newsId==""){
                    alert("必须选择一条新闻!!");
                    return;
                }
                params["content"]=$scope.banner.newsId;
            }
            var interfaceName="/banner";
            var httpMethod="put";
            if(dataId==null||dataId==""){
                httpMethod="post";
            }
            $scope.submitFileForm($upload,$scope.imgFile,httpMethod,interfaceName,params,'',function(data,status){
                toast("保存成功!!");
                $location.path("/bannerList");
            },function(data,status){
                toastError("保存失败!!"+angular.toJson(data));
            });
        }

        /**
         * 打开修改窗体
         * @param index   行记录下标
         */
        $scope.showUpdateModalBanner = function (index) {

            var bannerId=$scope.bannerId;
            $scope.banner={};
            $scope.deleteOptions=[
                {name:'启用',id:0},
                {name:'停用',id:1}
            ];
            var interfaceName="/banner/"+bannerId;
            $scope.getApi(interfaceName,{id:bannerId},function(data,status){
                $scope.banner=data;
                $scope.banner.id=bannerId;
                $scope.imgLength=1;
                if($scope.banner.type==2){
                    $("#ueDiv").show();
                    ue.ready(function() {
                        ue.setContent(data.content);
                    });
                }else if($scope.banner.type==4){
                    $("#urlDiv").show();
                    $scope.banner.urlAddress=data.content;
                }else if($scope.banner.type==1){
                    $("#newsDiv").show();
                    $scope.banner.newsId=data.content;
                    $scope.showLoading=true;
                    var interfaceUrlName=GlobalConstant.javaServerPath+"/medianew/findById.do";
                    $http.get(interfaceUrlName,{params:{id:data.content},withCredentials:false}).success(function(data,status) {
                        $scope.showLoading=false;
                        $scope.banner.newsContent=data.data.title;
                    }).error(function(data,status){
                        $scope.showLoading=false;
                        alert("获取新闻标题失败,error=" + angular.toJson(data)+",status="+status);
                    });
                }
            });
        }


        if($scope.bannerId==""||$scope.bannerId==-1){
            $scope.showAddModalBanner();
        }else{
            $scope.showUpdateModalBanner();
        }
    }]);

/**
 * 系统单页管理
 */
platformControllers.controller('pageConfigListCtrl', ['$scope','$http','$controller',
    function($scope,$http,$controller) {
        var parentCtrl = $controller('baseCtrl', {$scope: $scope,$http:$http});
        /**
         * 从后台查询数据
         */
        $scope.queryParams=function(){
            var interfaceName='/onepage/list';
            $scope.queryDataUnPage(interfaceName);
        }


        /**
         * 重新加载表格中的数据
         */
        $scope.reload = function () {
            $scope.queryParams();
        }

        //页面初始化
        $scope.searchField="";
        $scope.queryParams();
    }]);


/**
 * 系统单页设置
 */
platformControllers.controller('pageConfigCtrl', ['$scope','$http','$controller','$routeParams','$location','$upload',
    function($scope,$http,$controller,$routeParams,$location,$upload) {

        var type=$routeParams.id;
        var parentCtrl = $controller('baseCtrl', {$scope: $scope,$http:$http});
        var interfaceName="/onepage/"+type;
        $scope.getApi(interfaceName,{type:type},function(data,status){
            ue.ready(function() {
                ue.setContent(data);
            });
        });

        /**
         * 修改信息数据
         */
        $scope.updatePageConfig = function (isValid) {
            var interfaceName="/onepage/"+type;
            if(ue.getContentTxt()==""){
                alert("页面内容不能为空!!");
                return;
            }
            var params={type:type,content:ue.getContent()};
            $scope.updateData(isValid,interfaceName,params,'',function(data,status){
                toast("保存成功!!");
                $location.path("/pageConfigList");
            });
        }

        $scope.uploadPicToServer = function (isValid) {
            $scope.uploadPic(isValid,$upload);
        }


        //页面初始化
        $scope.searchField="";

    }]);



/**
 * 约战
 */
platformControllers.controller('arrangeListCtrl', ['$scope','$http','$controller','$routeParams',
    function($scope,$http,$controller,$routeParams) {
        var parentCtrl = $controller('baseCtrl', {$scope: $scope, $http: $http});

        //点击查看&关闭详情
        $scope.userBoxClick=function($event,index){
            $scope.curOrderUser=$scope.datas[index]._userId;
            $event.preventDefault();
            $event.stopPropagation();
            var offset = $($event.currentTarget).offset();
            //$("#userBox").css({"left":offset.left+"px", "top":(offset.top+22)+"px"}).slideDown();
            $("#userBox").css({"left":offset.left+"px", "top":(offset.top+22)+"px"}).slideToggle();
        }
        $("#userBox").on("click", function(e) {
            e.stopPropagation();
        });
        $scope.placeBoxClick=function($event,index){
            $scope.curOrderId=$scope.datas[index]._orderId;
            $scope.address=$scope.datas[index].address;
            $event.preventDefault();
            $event.stopPropagation();
            var offset = $($event.currentTarget).offset();
            $("#placeBox").css({"left":offset.left+"px", "top":(offset.top+22)+"px"}).slideToggle();
        }
        $("#placeBox").on("click", function(e) {
            e.stopPropagation();
        });

        $("body").on("click", function() {
            $("#userBox").slideUp();
            $("#placeBox").slideUp();
        });
        //选择日期
        $(".dpicker").datepicker({
            format: 'yyyy-mm-dd',
            language: 'zh-CN',
            todayHighlight: true
        });

        $scope.timeOptions=[
            {name:'全部',id:'0'},
            {name:'今天',id:'1'},
            {name:'最近一个月',id:'2'},
            {name:'最近三个月',id:'3'}
        ];

        $scope.statusOptions=[
            {name:'全部',id:''},
            {name:'取消约战',id:'0'},
            {name:'报名中',id:'1'},
            {name:'已结束',id:'2'}
        ];
        $scope.timeFlg='0';
        $scope.status='';

        /**
         * 从后台查询订单数据
         */
        $scope.queryArrangeList=function(){
            var interfaceName='/plat/arrange';
            var timeFlg=$scope.timeFlg;
            if(timeFlg==0){
                $scope.search.beginTime="";
                $scope.search.endTime="";
            }else if(timeFlg==1){
                $scope.search.beginTime=new Date().format("yyyy-MM-dd");
                $scope.search.endTime=$scope.search.beginTime;
            }else if(timeFlg==2){
                $scope.search.endTime=new Date().format("yyyy-MM-dd");
                var m_date=new Date();
                m_date.setDate(new Date().getDate()-30);
                $scope.search.beginTime=m_date.format("yyyy-MM-dd");
            }else if(timeFlg==3){
                $scope.search.endTime=new Date().format("yyyy-MM-dd");
                var m_date=new Date();
                m_date.setDate(new Date().getDate()-90);
                $scope.search.beginTime=m_date.format("yyyy-MM-dd");
            }
            var beginTime=$scope.search.beginTime;
            var endTime=$scope.search.endTime;
            var status=$scope.status;
            var params={};

            params["type"]=$scope.type;
            if(beginTime!=null&&beginTime!=""){
                params["beginTime"]=beginTime;
            }
            if(endTime!=null&&endTime!=""){
                params["endTime"]=endTime;
            }
            if(status!=null&&status!=""){
                params["status"]=status;
            }
            $scope.queryData(interfaceName,1,params);
        }


        /**
         * 重新加载表格中的数据
         */
        $scope.reload = function () {
            $scope.queryArrangeList();
        }

        $scope.showRefuseOrderModal = function (index) {
            $scope.refuseId=index;
            $scope.refuseContent="";
            $("#refuseOrderModal").modal("show");
        }

        $scope.search={};
        $scope.search.beginTime="";
        $scope.search.endTime="";
        $scope.searchField="";
        $scope.queryArrangeList();
    }
]);