/**
 * 俱乐部方相关controller
 * Created by admin on 2015/9/13.
 */
var clubControllers = angular.module('clubControllers', ['baseModule']);

/**
 * 教练管理
 */
clubControllers.controller('coachListCtrl', ['$scope','$http','$controller','$upload',
  function($scope,$http,$controller,$upload) {
      $scope.imgServerPath=GlobalConstant.imgServerPath;
      var parentCtrl = $controller('baseCtrl', {$scope: $scope,$http:$http});
      /**
       * 从后台查询场地数据
       */
      $scope.querySpace=function(){
          var interfaceName='/club/coach';
          $scope.queryData(interfaceName,1);
      }


      /**
       * 重新加载表格中的数据
       */
      $scope.reload = function () {
          $scope.querySpace();
      }

      /**
       * 打开新增窗体
       */
      $scope.showAddModalSpace = function () {
          $scope.coach={};
          $scope.sexOptions=[
              {name:'男',id:0},
              {name:'女',id:1}
          ];
          $scope.coach.sex=0;

          $scope.levelOptions=[
              {name:'暂无等级',id:'暂无等级'},
              {name:'国家一级',id:'国家一级'},
              {name:'国家二级',id:'国家二级'},
              {name:'国家三级',id:'国家三级'}
          ];
          $scope.coach.level='暂无等级';

          $scope.spacePriceOptions=[
              {name:'不包含',id:0},
              {name:'包含',id:1}
          ];
          $scope.coach.spacePriceFlg=0;

          $scope.deleteOptions=[
              {name:'启用',id:0},
              {name:'停用',id:1}
          ];
          $scope.coach.deleteFlg=0;

          $("#addModalSpace").modal("show");
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
       * 添加教练数据
       */
      $scope.addSpace = function (isValid) {
          if(isValid) {//验证通过
              $scope.submitted = false;
          }else{
              $scope.submitted = true;
              return;
          }
          if($scope.imgLength==null||$scope.imgLength<1){
              alert("请必须上传教练头像!!");
              return;
          }
          var interfaceName="/club/coach";
          var dataId=$scope.coach.id;
          var params={id:dataId ,name: $scope.coach.name,spacePriceFlg: $scope.coach.spacePriceFlg,sex:$scope.coach.sex,level:$scope.coach.level,price:$scope.coach.price,age:$scope.coach.age,introduce:$scope.coach.introduce,deleteFlg:$scope.coach.deleteFlg};
          var httpMethod="put";
          if(dataId==null||dataId==""){
              httpMethod="post";
          }
          $scope.submitFileForm($upload,$scope.imgFile,httpMethod,interfaceName,params,$('#addModalSpace'),'',function(data,status){
              if(data.code==40002){
                  toastError("该教练名已经存在!!");
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
      $scope.showUpdateModalSpace = function (index) {
          $scope.sexOptions=[
              {name:'男',id:0},
              {name:'女',id:1}
          ];
          $scope.levelOptions=[
              {name:'暂无等级',id:'暂无等级'},
              {name:'国家一级',id:'国家一级'},
              {name:'国家二级',id:'国家二级'},
              {name:'国家三级',id:'国家三级'}
          ];

          $scope.spacePriceOptions=[
              {name:'不包含',id:0},
              {name:'包含',id:1}
          ];
          $scope.deleteOptions=[
              {name:'启用',id:0},
              {name:'停用',id:1}
          ];

          var coachId=$scope.datas[index]._id;
          $scope.coach={};
          $scope.coach.id=coachId;
          var interfaceName="/club/coach/"+coachId;
          $scope.getApi(interfaceName,"",function(data,status){
            var spaceData=data;
             $scope.coach.uploadImg="";
             $scope.coach.name=spaceData.name;
             $scope.coach.sex=spaceData.sex;
             $scope.coach.level=spaceData.level;
             $scope.coach.price=spaceData.price;
             $scope.coach.age=spaceData.age;
             $scope.coach.introduce=spaceData.introduce;
             $scope.coach.spacePriceFlg=spaceData.spacePriceFlg;
             $scope.coach.deleteFlg=spaceData.deleteFlg;
             $scope.coach.imgUrl=GlobalConstant.imgServerPath+spaceData.imgUrl;
             $scope.imgLength=1;
             $("#addModalSpace").modal("show");
         });
      }

      /**
       *  删除场地
       * @param id
       */
      $scope.deleteSpace = function (index) {
          var id=$scope.datas[index]._id;
          alertMsg("提示信息","确定删除您所选的记录?","删除该教练过后数据不能恢复",function() {
              var interfaceName = "/club/coach/" + id;
              var params = {id: id};
              $scope.deleteData(interfaceName, params);
          })
      }


      /**
       * 打开教练详情窗体
       * @param index   行记录下标
       */
      $scope.showCoachDetail = function (index) {

          var coachId=$scope.datas[index]._id;
          $scope.coachDetail={}
          var interfaceName="/club/coach/extra/"+coachId;
          $scope.getApi(interfaceName,{id:coachId},function(data,status){
              $scope.coachDetail=data;
              if($scope.coachDetail.manCount!=0){
                  $scope.coachDetail.avgPrice=$scope.coachDetail.priceTotal/$scope.coachDetail.manCount;
              }
              $("#coachDetailModal").modal("show");
          });
      }


      //页面初始化
      $scope.searchField="";
      $scope.querySpace();
  }]);


/**
 * 俱乐部信息维护
 */
clubControllers.controller('clubSettingCtrl', ['$scope','$http','$controller','$upload',
    function($scope,$http,$controller,$upload) {
        var parentCtrl = $controller('baseCtrl', {$scope: $scope, $http: $http});

        //初始化时间选择插件
        $('.clockpicker').clockpicker();

        //初始化地区选择插件
        //addressInit("cmbProvince", "cmbCity", "cmbArea", "上海", "", "长宁区");

        //删除标签
        $scope.delTag = function (index) {
            $scope.flagsArray.splice(index, 1);
        }

        $scope.showAddTagForm = function () {
            $scope.tagName="";
            $("#tagModal").modal("show");
        }

        //添加标签
        $scope.addTag = function (isValid) {
            if(isValid){
                $scope.flagsArray.push($scope.tagName);
                $("#tagModal").modal("hide");
            }

        }

        $scope.initClubValue = function () {
            var interfaceName="/club";
            $scope.getApi(interfaceName,"",function(data,status){
                $scope._id=data._id;
                $scope.name=data.name;
                $scope.contactName=data.contactName;
                $scope.mobile=data.mobile;
                if(data.telephone==null){
                    $scope.telephone="";
                }else{
                    $scope.telephone=data.telephone;
                }
                if(data.address!=null){
                    //初始化地区选择插件
                    addressInit("cmbProvince", "cmbCity", "cmbArea", data.address.province, data.address.city, data.address.area);
                    //document.getElementById("cmbProvince").value=data.address.province;
                    //document.getElementById("cmbCity").value=data.address.city;
                    //document.getElementById("cmbArea").value=data.address.area;
                    $scope.street=data.address.street;
                }else{
                    //初始化地区选择插件
                    addressInit("cmbProvince", "cmbCity", "cmbArea", "上海", "上海市", "长宁区");
                }
                $scope.beginTime=data.beginTime;
                $scope.endTime=data.endTime;
                $scope.weekBeginTime=data.weekBeginTime;
                $scope.weekEndTime=data.weekEndTime;
                $scope.flagsArray=data.flags;
                $scope.scheduleFlg=data.scheduleFlg;
                $scope.refundFlg=data.refundFlg;
                $scope.introduce=data.introduce;
                $scope.trafficRoute=data.trafficRoute;
                $scope.imgServerPath=GlobalConstant.imgServerPath;
                $scope.imgUrls=data.imgUrls;
                $scope.imgLength=0;
                if(data.imgUrls!=""){
                    $scope.imgLength=data.imgUrls.length;
                }
            });

        }

        //判断场馆属性的选项是否选中
        $scope.isSelected = function(id){
            return $scope.propsSelected.indexOf(id)>=0;
        }

        //选中或取消选中场馆属性
        $scope.updateSelection=function($event, id){
            var checkbox = $event.target;
            var action = (checkbox.checked?'add':'remove');
            var checkIndex=$scope.propsSelected.indexOf(id);
            if(action == 'add' &&checkIndex  == -1){
                $scope.propsSelected.push(id);
            }
            if(action == 'remove' && checkIndex!=-1){
                $scope.propsSelected.splice(checkIndex,1);
            }
        }

        //选择图片的时候数量和格式控制
        $scope.onFileSelects = function ($files) {
            $scope.imgLength=$files.length;
            if ($files.length > 5) {
                alert("不能超过5个图片");
                return;
            }
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

        }

        /**
         * 保存俱乐部信息到后台
         */
        $scope.saveClub = function (isValid) {
            if(isValid) {//验证通过
                $scope.submitted = false;
            }else{
                $scope.submitted = true;
                return;
            }
            if($scope.imgLength<1){
                alert("必须提供场馆图片");
                return;
            }
            if($scope.imgLength>5){
                alert("最多只能提供5张场馆图片");
                return;
            }
            var interfaceName="/club";
            var street=$scope.street;
            var provinceInfo=document.getElementById("cmbProvince").value;
            var cityInfo=document.getElementById("cmbCity").value;
            var areaInfo=document.getElementById("cmbArea").value;
            var addressInfo=provinceInfo;
            if(cityInfo!="市辖区"&&cityInfo!="县"){
                addressInfo=addressInfo+cityInfo;
            }
            addressInfo=addressInfo+areaInfo+street;
            var loc="";
            var myGeo = new BMap.Geocoder();// 将地址解析结果显示在地图上,并调整地图视野
            myGeo.getPoint(addressInfo, function(point){
                if (point) {
                    var jd= point.lng;
                    var wd=point.lat;
                    loc=[jd,wd];
                    var flags=$scope.flagsArray;
                    var address={province:provinceInfo,city:cityInfo,area:areaInfo,street:street};
                    var params={_id: $scope._id,name: $scope.name,contactName: $scope.contactName,mobile: $scope.mobile, telephone: $scope.telephone,beginTime:$scope.beginTime,endTime:$scope.endTime,weekBeginTime:$scope.weekBeginTime,weekEndTime:$scope.weekEndTime,cmbProvince:$scope.cmbProvince,trafficRoute:$scope.trafficRoute,introduce:$scope.introduce,scheduleFlg:$scope.scheduleFlg,refundFlg:$scope.refundFlg,address:address,extra:{loc:loc,flags:flags}};
                    $scope.submitFileForm($upload,$scope.files,'put',interfaceName,params);
                }
            }, provinceInfo);

        }


        //初始化
        $scope.initClubValue();
    }
]);



/**
 * 订单维护
 */
clubControllers.controller('orderListCtrl', ['$scope','$http','$controller',
    function($scope,$http,$controller) {
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

        $("body").on("click", function() {
            $("#userBox").slideUp();
            $("#placeBox").slideUp();
            $("#statusBox").slideUp();
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
            var interfaceName='/club/order';
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
            var params={};

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
