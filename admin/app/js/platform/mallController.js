/**
 * Created by admin on 2015/10/17.
 * 商城管理相关的controller
 */

var mallControllers = angular.module('mallControllers', ['baseModule']);

/**
 * 商品管理
 */
mallControllers.controller('goodsListCtrl', ['$scope','$http','$controller',
    function($scope,$http,$controller) {
        var parentCtrl = $controller('baseCtrl', {$scope: $scope,$http:$http});
        $scope.imgServerPath=GlobalConstant.imgServerPath;
        /**
         * 从后台查询商品数据
         */
        $scope.queryGoods=function(){
            var interfaceName='/product';
            $scope.queryData(interfaceName,1);
        }


        /**
         * 重新加载表格中的数据
         */
        $scope.reload = function () {
            $scope.queryGoods();
        }


        //页面初始化
        $scope.searchField="";
        $scope.queryGoods();


        /**
         * 查看评论
         */
        $scope.showComments=function(id){
            var interfaceName='/plat/complain/'+id;
            $scope.getApi(interfaceName,{productId:id},function(data,status){
                $scope.productComments=data.comments;
                $("#goodsCommentsModal").modal("show");
            });
        }
    }]);


/**
 * 活动管理
 */
mallControllers.controller('activityListCtrl', ['$scope','$http','$controller',
    function($scope,$http,$controller) {
        var parentCtrl = $controller('baseCtrl', {$scope: $scope,$http:$http});
        /**
         * 从后台查询数据
         */
        $scope.queryActivity=function(){
            var interfaceName='/activity';
            $scope.queryData(interfaceName,1);
        }


        /**
         * 重新加载表格中的数据
         */
        $scope.reload = function () {
            $scope.queryActivity();
        }

        $scope.getActivityStatus=function(index){
            var rowRecord=$scope.datas[index];
            var curDate=new Date().format("yyyy-MM-dd");
            var curStatus=0;
            if(rowRecord.beginDate>curDate){
                curStatus=0;
            }else if(rowRecord.beginDate<=curDate&&rowRecord.endDate>=curDate){
                curStatus=1;
            }else if(rowRecord.endDate<curDate){
                curStatus=2;
            }
            $scope.datas[index]["status"]=curStatus;
        }

        /**
         *  删除活动
         * @param id
         */
        $scope.deleteActivity = function (index) {
            var id=$scope.datas[index]._id;
            var status=$scope.datas[index].status;
            if(status>0){
                toastError("只有未开始的活动才能够删除!!");
                return;
            }
            alertMsg("提示信息","确定删除您所选的记录?","删除该活动过后数据不能恢复",function() {
                var interfaceName = "/activity/" + id;
                var params = {id: id};
                $scope.deleteData(interfaceName, params,'',function(data,status){
                    if(status==406){
                        toastError("只有未开始的活动可以删除!!");
                    }
                });
            })
        }


        //页面初始化
        $scope.searchField="";
        $scope.queryActivity();
    }]);

/**
 * 订单维护
 */
mallControllers.controller('goodsOrderListCtrl', ['$scope','$http','$controller','$routeParams',
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

        $scope.sendBoxClick=function($event,index){
            $scope.logistics=$scope.datas[index].logistics;
            $event.preventDefault();
            $event.stopPropagation();
            var offset = $($event.currentTarget).offset();
            $("#sendBox").css({"left":(offset.left-280)+"px", "top":(offset.top+22)+"px"}).slideToggle();
        }
        $("#sendBox").on("click", function(e) {
            e.stopPropagation();
        });
        $scope.receivBoxClick=function($event,index){
            $scope.address=$scope.datas[index].address;
            $event.preventDefault();
            $event.stopPropagation();
            var offset = $($event.currentTarget).offset();
            $("#receivBox").css({"left":(offset.left-280)+"px", "top":(offset.top+22)+"px"}).slideToggle();
        }
        $("#receivBox").on("click", function(e) {
            e.stopPropagation();
        });

        $scope.activityBoxClick=function($event,index){
            $scope.activity=$scope.datas[index]._actId;
            $event.preventDefault();
            $event.stopPropagation();
            var offset = $($event.currentTarget).offset();
            $("#activityBox").css({"left":offset.left+"px", "top":(offset.top+22)+"px"}).slideToggle();
        }
        $("#activityBox").on("click", function(e) {
            e.stopPropagation();
        });

        $scope.goodsBoxClick=function($event,index){
            $scope.products=$scope.datas[index].products;
            $event.preventDefault();
            $event.stopPropagation();
            var offset = $($event.currentTarget).offset();
            $("#goodsBox").css({"left":(offset.left-280)+"px", "top":(offset.top+22)+"px"}).slideToggle();
        }
        $("#goodsBox").on("click", function(e) {
            e.stopPropagation();
        });

        $("body").on("click", function() {
            $("#sendBox").slideUp();
            $("#receivBox").slideUp();
            $("#statusBox").slideUp();
            $("#userBox").slideUp();
            $("#activityBox").slideUp();
            $("#goodsBox").slideUp();
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
            {name:'未付款',id:'0'},
            {name:'已付款',id:'1'},
            {name:'已发货',id:'2'},
            {name:'交易成功',id:'3'},
            {name:'用户取消订单',id:'4'},
            {name:'商家取消订单',id:'5'},
            {name:'超时自动关闭',id:'6'},
            {name:'退款中',id:'7'},
            {name:'已退款',id:'8'},
            {name:'确认收货',id:'9'},
            {name:'申述',id:'10'}
        ];
        $scope.timeFlg='0';
        $scope.orderStatus='';

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
            params["type"]=3;
            $scope.queryData(interfaceName,1,params);
        }


        /**
         * 重新加载表格中的数据
         */
        $scope.reload = function () {
            $scope.queryOrderList();
        }

        /**
         * 打开发货窗口
         * @param index
         */
        $scope.showSendOrderModal = function (index) {
            $scope.submitted = false;
            $scope.sendId=index;
            $scope.logistics={};
            $("#sendOrderModal").modal("show");
        }

        /**
         * 确认发货
         */
        $scope.confirmOrder=function(isValid){
            $scope.submitted = false;
            if(isValid==false) {//验证通过
                $scope.submitted=true;
                return false;
            }
            var interfaceName = "/order/confirm";
            var id=$scope.sendId;
            var curTimestamp=new Date().getTime();
            var params = {id: id,status:2,logistics:{_id:$scope.logistics._id,name:$scope.logistics.name,time:curTimestamp}};
            $scope.updateRecordData(interfaceName,params,"发货成功!!","发货失败!!");
            $("#sendOrderModal").modal('hide');
        }

        $scope.showRefuseOrderModal = function (index) {
            $scope.submitted = false;
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
            $scope.updateRecordData(interfaceName,params,"取消成功!!","取消失败!!");
            $("#refuseOrderModal").modal("hide");
            // })
        }



        /**
         * 打开拒绝申述窗口
         * @param index
         */
        $scope.showRefuseAppealModal = function (index) {
            $scope.submitted = false;
            var selRecord=$scope.datas[index];
            $scope.appealId=selRecord._id;
            $scope.complaintReason=selRecord.status[selRecord.status.length-1].reason;
            $scope.refuseReason="";
            $("#refuseAppealModal").modal("show");
        }

        /**
         * 确认拒绝申述
         */
        $scope.confirmRefuseAppeal=function(isValid){
            $scope.submitted = false;
            if(isValid==false) {//验证通过
                $scope.submitted=true;
                return false;
            }
            var interfaceName = "/order/complain";
            var id=$scope.appealId;
            var params = {id: id,accept:0,reason:$scope.refuseReason};
            $scope.updateRecordData(interfaceName,params,"拒绝申述成功!!","拒绝申述失败!!");
            $("#refuseAppealModal").modal('hide');
        }

        /**
         * 同意申述
         */
        $scope.agreeAppeal=function(index){
            var selRecord=$scope.datas[index];
            var id=selRecord._id;
            var complaintReason="申述理由: "+selRecord.status[selRecord.status.length-1].reason;
            alertMsg("提示信息","确定要接受申述吗?",complaintReason,function() {
                var interfaceName = "/order/complain";
                var params = {id:id,accept:1};
                $scope.updateRecordData(interfaceName,params,"操作成功!!","操作失败!!");
            })
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
 * 添加修改商品
 */
mallControllers.controller('saveGoodsCtrl', ['$scope','$http','$controller','$upload','$routeParams','$location',
    function($scope,$http,$controller,$upload,$routeParams,$location) {
        $scope.id=$routeParams.id;
        var parentCtrl = $controller('baseCtrl', {$scope: $scope, $http: $http});

        $scope.product={};
        $scope.product.mulitiProps=[];//记录添加的所有属性
        $scope.product.propIndex=0;
        $scope.product.combProps=[];//记录库存卡列表信息
        $scope.product.combValues={};//记录所设置的库存，上下架状态

        $scope.showAddProperTagForm = function () {
            $scope.properTagName="";
            $("#properTagModal").modal("show");
        }
        //添加属性类型标签
        $scope.addProperTag = function (isValid) {
            if(isValid){
                $scope.product.mulitiProps.push({prop:$scope.properTagName,values:[]});
                $("#properTagModal").modal("hide");
            }

        }
        $scope.delProperTag = function (index) {
            $scope.product.mulitiProps.splice(index, 1);
            $scope.renderCombProps();
        }

        //删除标签
        $scope.delTag = function (parentIndex,index) {
            $scope.product.mulitiProps[parentIndex].values.splice(index, 1);
            $scope.renderCombProps();
        }
        $scope.showAddTagForm = function (index) {
            $scope.product.propIndex=index;
            $scope.tagName="";
            $("#tagModal").modal("show");
        }
        //添加标签
        $scope.addTag = function (isValid) {
            if(isValid){
                $scope.product.mulitiProps[$scope.product.propIndex].values.push($scope.tagName);
                $("#tagModal").modal("hide");
                $scope.renderCombProps();
            }

        }

        $scope.renderCombProps = function () {
            $scope.getCombValues();
            var combProps = [];
            for (var i in $scope.product.mulitiProps) {
                $scope.repeat(combProps, $scope.product.mulitiProps[i]);
            }
            //设置库存,上下架状态
            for(combIndex in combProps){
                var combProRecord=combProps[combIndex];
                var combValueKey="";
                for(propIndex in combProRecord.props){
                    combValueKey=combValueKey+"_"+combProRecord.props[propIndex].prop+"-"+combProRecord.props[propIndex].value;
                }
                var combValueRecord=$scope.product.combValues[combValueKey];
                if(combValueRecord!=null){
                    combProRecord.inventory=combValueRecord.inventory;
                    combProRecord.status=combValueRecord.status;
                }
            }
            $scope.product.combProps = combProps;
        }

        $scope.repeat=function(comProps, prop) {
            if (comProps.length === 0) {
                for (var j in prop.values) {
                    var props = [{prop: prop.prop, value: prop.values[j]}];
                    comProps.push({
                        props: props,
                        inventory:0,
                        status:0
                    });
                }
            } else {
                for (var i in comProps) {
                    var curProps = $scope.clone(comProps[i].props);
                    for (var j in prop.values) {
                        var array = $scope.clone(curProps);
                        if (j == 0) {
                            comProps[i].props.push({prop: prop.prop, value: prop.values[j]});
                        } else {
                            array.push({prop: prop.prop, value: prop.values[j]});
                            comProps.push({
                                props: array,
                                inventory:0,
                                status:0
                            });
                        }
                    }
                }
            }
        }

        $scope.clone=function(props) {
            var newArrs = [];
            for (var i in props) {
                newArrs.push(props[i]);
            }
            return newArrs;
        }

        /**
         * 改变上下架操作
         * @param index
         * @param status    0:下架,1:上架
         */
        $scope.changeStatus=function(index,status) {
            $scope.product.combProps[index].status=status;
        }

        $scope.initGoodsValue = function () {
            $scope.imgLength=0;
            $scope._inActivity=0;
            $scope.imgServerPath=GlobalConstant.imgServerPath;
            $scope.deleteOptions=[
                {name:'启用',id:0},
                {name:'停用',id:1}
            ];
            if($scope.id!=-1){
                var interfaceName="/product/"+$scope.id;
                $scope.getApi(interfaceName,{id:$scope.id},function(data,status){
                    $scope._id=data._id;
                    $scope._inActivity=data._inActivity;
                    $scope.name=data.name;
                    $scope.no=data.no;
                    $scope.brand=data.brand;
                    $scope.price=data.price;
                    $scope.deleteFlg=data.deleteFlg;
                    $scope.imgUrls=data.imgUrls;
                    if(data.imgUrls!=""){
                        $scope.imgLength=data.imgUrls.length;
                    }
                    $scope.product.mulitiProps=data.mulitiProps;//记录添加的所有属性
                    $scope.product.combProps=data.combProps;//记录库存卡列表信息
                    $scope.getCombValues();
                    ue.ready(function() {
                        ue.setContent(data.desc);
                    });
                });
            }

        }

        $scope.getCombValues = function () {
            for(combIndex in $scope.product.combProps){
                var combProRecord=$scope.product.combProps[combIndex];
                var combValueKey="";
                for(propIndex in combProRecord.props){
                    combValueKey=combValueKey+"_"+combProRecord.props[propIndex].prop+"-"+combProRecord.props[propIndex].value;
                }
                $scope.product.combValues[combValueKey]={"inventory":combProRecord.inventory,"status":combProRecord.status};
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

        $scope.uploadPicToServer = function (isValid) {
            $scope.uploadPic(isValid,$upload);
        }

        /**
         * 保存信息到后台
         */
        $scope.saveGoods = function (isValid) {
            if(isValid) {//验证通过
                $scope.submitted = false;
            }else{
                $scope.submitted = true;
                return;
            }
            if($scope.product.mulitiProps.length<1){
                alert("必须添加属性类型!!");
                return;
            }
            if($scope.product.combProps.length<1){
                alert("必须设置库存!!");
                return;
            }
            if($scope.imgLength<1){
                alert("必须提供商品图片");
                return;
            }
            if($scope.imgLength>5){
                alert("最多只能提供5张商品图片");
                return;
            }

            var interfaceName="/product";

            var content=ue.getContent();
            var params={no: $scope.no,name: $scope.name,brand: $scope.brand,price: $scope.price,desc:content,mulitiProps:$scope.product.mulitiProps,combProps:$scope.product.combProps,deleteFlg:$scope.deleteFlg};
            var method="post";
            if($scope.id!=-1){
                method="put";
                params["id"]=$scope.id;
            }
            $scope.submitFileForm($upload,$scope.files,method,interfaceName,params,'',function(data,status){
                toast("保存成功!!");
                $location.path("/goodsList");
            },function(data,status){
                if(status==460){
                    toastError("编号或商品名已存在!!");
                }
            });
        }


        //初始化
        $scope.initGoodsValue();
    }
]);

/**
 * 添加修改活动
 */
mallControllers.controller('saveActivityCtrl', ['$scope','$http','$controller','$upload','$routeParams','$location',
    function($scope,$http,$controller,$upload,$routeParams,$location) {
        $scope.id=$routeParams.id;
        var parentCtrl = $controller('baseCtrl', {$scope: $scope, $http: $http});

        //选择日期
        $(".dpicker").datepicker({
            format: 'yyyy-mm-dd',
            language: 'zh-CN',
            todayHighlight: true
        });

        $scope.initActivityValue = function () {
            $scope.imgLength=0;
            $scope.selectedGoodsArray=[];
            $scope.selectedGoodsId=[];

            if($scope.id!=-1){
                var interfaceName="/activity/"+$scope.id;
                $scope.getApi(interfaceName,{id:$scope.id},function(data,status){
                    $scope._id=data._id;
                    $scope.name=data.name;
                    $scope.beginDate=data.beginDate;
                    $scope.endDate=data.endDate;
                    $scope.rebate=data.rebate;
                    $scope.selectedGoodsArray=data.products;
                    for(proIndex in $scope.selectedGoodsArray){
                        $scope.selectedGoodsId.push($scope.selectedGoodsArray[proIndex]._id);
                    }
                    $scope.imgUrl=GlobalConstant.imgServerPath+data.imgUrl;
                    if(data.imgUrl!=""){
                        $scope.imgLength=1;
                    }

                });
            }

        }


        //选择图片的时候数量和格式控制
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

        }

        /**
         * 打开商品列表窗体
         * @param index   行记录下标
         */
        $scope.showGoodsModalWindow = function () {
            var interfaceName='/activity/product';
            $scope.choosedGoodsArray=[];//记录选择的商品对象
            $scope.choosedGoodsId=[];//记录选择的商品id
            $scope.queryDataUnPage(interfaceName,1);
            $("#showGoodsModal").modal("show");
        }

        /**
         * 复选框选择或取消选择商品
         */
        $scope.chooseGoods = function ($event,index) {
            var chooseRecord=$scope.datas[index];
            var goodsNum=chooseRecord._id;
            var checkbox = $event.target;
            var action = (checkbox.checked?'add':'remove');
            var checkIndex=0;
            if(action == 'add'){
                var item=_.findWhere($scope.selectedGoodsArray,{_id:goodsNum});
                if(item==null){
                    $scope.choosedGoodsArray.push(chooseRecord);
                    $scope.choosedGoodsId.push(goodsNum);
                }
                return;
            }
            var checkIndex=$scope.choosedGoodsId.indexOf(goodsNum);
            if(action == 'remove' && checkIndex!=-1){
                $scope.choosedGoodsArray.splice(checkIndex,1);
                $scope.choosedGoodsId.splice(checkIndex,1);
            }
        }

        /**
         * 保存选择的商品
         */
        $scope.saveChooseGoods = function () {
            $scope.selectedGoodsArray=$scope.selectedGoodsArray.concat($scope.choosedGoodsArray);
            $scope.selectedGoodsId=$scope.selectedGoodsId.concat($scope.choosedGoodsId);
            $("#showGoodsModal").modal("hide");
        }

        $scope.deleteShop = function (index) {
            $scope.selectedGoodsArray.splice(index,1);
            $scope.selectedGoodsId.splice(index,1);
        }

        /**
         * 保存信息到后台
         */
        $scope.saveActivity = function (isValid) {
            if(isValid) {//验证通过
                $scope.submitted = false;
            }else{
                $scope.submitted = true;
                return;
            }
            if($scope.imgLength<1){
                alert("必须提供主题图片");
                return;
            }

            var interfaceName="/activity";
            var params={name: $scope.name,beginDate:$scope.beginDate,endDate:$scope.endDate,rebate:$scope.rebate,extra:{products:$scope.selectedGoodsId}};
            var method="post";
            if($scope.id!=-1){
                method="put";
                params["id"]=$scope.id;
            }
            $scope.submitFileForm($upload,$scope.files,method,interfaceName,params,'',function(data,status){
                toast("保存成功!!");
                $location.path("/activityList");
            },function(data,status){
                if(status==406){
                    toastError("只有未开始的活动可以修改!!");
                }else{
                    toastError(status+":"+angular.toJson(data));
                }
            });
        }


        //初始化
        $scope.initActivityValue();
    }
]);