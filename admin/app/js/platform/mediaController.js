/**
 * 新媒体
 * Created by admin on 2015/11/17.
 */

var mediaControllers = angular.module('mediaControllers', ['baseMediaModule']);

/**
 * 公众号添加修改管理
 */
platformControllers.controller('mediaPublicCtrl', ['$scope','$http','$controller','$upload','$routeParams','$location',
    function($scope,$http,$controller,$upload,$routeParams,$location) {
        var parentCtrl = $controller('baseMediaCtrl', {$scope: $scope,$http:$http});
        $scope.id=$routeParams.id;
        $scope.type=$routeParams.type;

        /**
         * 初始化数据
         * @param index   行记录下标
         */
        $scope.initData = function () {
            $scope.deleteOptions=[
                {name:'启用',id:0},
                {name:'停用',id:1}
            ];
            $scope.isFlagOptions=[
                {name:'是',id:0},
                {name:'否',id:1}
            ];
            if($scope.type==2){
                //选择日期
                $(".dpicker").datepicker({
                    format: 'yyyy-mm-dd',
                    language: 'zh-CN',
                    todayHighlight: true
                });
                $scope.sexOptions=[
                    {name:'男',id:0},
                    {name:'女',id:1}
                ];
            }

            //$("#selCountry").select2().select2("val","中国");
            //国家选项
            $scope.countryOptions=countryList;

            $scope.public={};
            if($scope.id!=-1){
                $scope.imgServerPath=GlobalConstant.imgServerPath;
                var interfaceName="/mediaPublic/findById.do";
                $scope.getApi(interfaceName,{id:$scope.id},function(data,status){
                    $scope.public=data.data;
                    $scope.imgLength=1;
                    if($scope.type==3||$scope.type==4){
                        $scope.specialCoverLength=1;
                    }else{
                        ue.ready(function() {
                            ue.setContent(data.data.remark);
                        });
                    }
                    if($scope.type==1||$scope.type==2) {
                        setTimeout(function () {
                            $("#selCountry").select2().select2("val", $scope.public.country);
                        }, 300);
                    }
                });
            }
        }

        $scope.uploadPicToServer = function (isValid) {
            $scope.uploadPic(isValid,$upload);
        }

        /**
         * 添加数据
         */
        $scope.saveMediaPublic = function (isValid) {
            var id=$scope.public.id;
            if($scope.imgLength==null||$scope.imgLength<1){
                if($scope.type==1){
                    alert("请必须上传赛事Logo!!");
                }else if($scope.type==2){
                    alert("请必须上传头像!!");
                }else if($scope.type==3){
                    alert("请必须上传专题Logo!!");
                }else if($scope.type==4){
                    alert("请必须上传标签Logo!!");
                }
                return;
            }
            if($scope.specialCoverLength==null||$scope.specialCoverLength<1){
                if($scope.type==3){
                    alert("请必须上传专题封面图片!!");
                    return;
                }
                if($scope.type==4){
                    alert("请必须上传标签背景图片!!");
                    return;
                }
            }
            if(isValid) {//验证通过
                $scope.submitted = false;
            }else{
                $scope.submitted = true;
                return;
            }
            var params={type:$scope.type,name: $scope.public.name,intro: $scope.public.intro ,sortNum: $scope.public.sortNum,enableStatus: $scope.public.enableStatus,recommend: $scope.public.recommend,logoUrl:$scope.public.logoUrl,tagBackUrl:$scope.public.tagBackUrl,specialCoverUrl:$scope.public.specialCoverUrl};
            if($scope.type==1){
                params["country"]=$scope.public.country;
                params["remark"]=ue.getContent();
            }else if($scope.type==2){
                params["country"]=$scope.public.country;
                params["sex"]=$scope.public.sex;
                params["birthday"]=$scope.public.birthday;
                params["major"]=$scope.public.major;
                params["singlesIntegral"]=$scope.public.singlesIntegral;
                params["singlesNum"]=$scope.public.singlesNum;
                params["doublesIntegral"]=$scope.public.doublesIntegral;
                params["doublesNum"]=$scope.public.doublesNum;
                params["remark"]=ue.getContent();
            }
            var interfaceName="/mediaPublic/save.do";
            if(id!=null&&id!=""){
                interfaceName="/mediaPublic/update.do";
                params["id"]=id;
            }
            var fileFieldSequence="";
            var selFiles=null;
            if($scope.files!=null){
                selFiles=$scope.files;
                fileFieldSequence="logoUrl";
            }
            if($scope.specialCoverFile!=null){
                if(selFiles!=null){
                    selFiles.push($scope.specialCoverFile[0]);
                    if($scope.type==3){
                        fileFieldSequence=fileFieldSequence+","+"specialCoverUrl";
                    }else{
                        fileFieldSequence=fileFieldSequence+","+"tagBackUrl";
                    }
                }else{
                    selFiles=$scope.specialCoverFile;
                    if($scope.type==3){
                        fileFieldSequence="specialCoverUrl";
                    }else{
                        fileFieldSequence="tagBackUrl";
                    }
                }
            }
            params["fileFieldSequence"]=fileFieldSequence;
            $scope.submitFileForm($upload,selFiles,'post',interfaceName,params,'',function(data,status){
                toast("保存成功!!");
                if($scope.type==1){
                    //赛事
                    $location.path("/publicGameList");
                }else if($scope.type==2){
                    //球星
                    $location.path("/publicPlayerList");
                }else if($scope.type==3){
                    //专题
                    $location.path("/publicSpecialList");
                }else if($scope.type==4){
                    //自定义标签
                    $location.path("/publicTagList");
                }

            },function(data,status){
                toastError("保存失败!! status="+status+","+angular.toJson(data));
            });
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

        //专题封面图片
        $scope.onSpecialCoverSelect = function ($files) {
            $scope.specialCoverLength=$files.length;
            $scope.specialCoverFile = $files;
            for (var i = 0; i < $files.length; i++) {
                if ($files[i].type!=""&&'|image/jpeg|image/png|image/jpg|image/bmp|image/gif|'.indexOf($files[i].type) > -1) {
                    $scope.filemessage = "";
                } else {
                    alert("只能选择图片");
                    $scope.specialCoverLength=0;
                    break;
                }
            }

        }

        $scope.initData();
    }]);



/**
 * 背景图管理
 */
platformControllers.controller('mediaBackGroundCtrl', ['$scope','$http','$controller','$upload',
    function($scope,$http,$controller,$upload) {
        var parentCtrl = $controller('baseMediaCtrl', {$scope: $scope,$http:$http});

        $scope.imgServerPath=GlobalConstant.imgServerPath;
        $scope.gameBackGroundUrl="";//赛事背景图
        $scope.playerBackGroundUrl="";//球星背景图
        $scope.specialBackGroundUrl="";//专题背景图

        //显示背景图
        $scope.loadBackGround=function(type) {
            var interfaceName = '/mediaBackground/getFilePath';
            $scope.getApi(interfaceName, {type: type}, function (data, status) {
                var imgUrl=data.data.imgUrl;
                if(imgUrl==null){
                    imgUrl="";
                }
                if(type==1){
                    $scope.gameBackGroundUrl=imgUrl;
                }else if(type==2){
                    $scope.playerBackGroundUrl=imgUrl;
                }else if(type==3){
                    $scope.specialBackGroundUrl=imgUrl;
                }
            })
        }

        $scope.onUploadGroundPicSelect = function ($files,type) {
            if(type==1){
                $scope.gameBackLength=$files.length;
            }else if(type==2){
                $scope.playerBackLength=$files.length;
            }else if(type==3){
                $scope.specialBackLength=$files.length;
            }
            for (var i = 0; i < $files.length; i++) {
                if ($files[i].type!=""&&'|image/jpeg|image/png|image/jpg|image/bmp|image/gif|'.indexOf($files[i].type) > -1) {
                    $scope.filemessage = "";
                } else {
                    alert("只能选择图片");
                    if(type==1){
                        $scope.gameBackLength=0;
                    }else if(type==2){
                        $scope.playerBackLength=0;
                    }else if(type==3){
                        $scope.specialBackLength=0;
                    }
                    break;
                }
            }
            if(type==1){
                $scope.gameBackFile = $files;
            }else if(type==2){
                $scope.playerBackFile = $files;
            }else if(type==3){
                $scope.specialBackFile = $files;
            }

        }

        //上传背景图
        $scope.uploadBackGround=function(type){
            var selFile;
            if(type==1){
                if($scope.gameBackLength==null||$scope.gameBackLength<1){
                    alert("请必须上传赛事背景图片!!");
                    return;
                }
                selFile=$scope.gameBackFile;
            }else if(type==2){
                if($scope.playerBackLength==null||$scope.playerBackLength<1){
                    alert("请必须上传球星背景图片!!");
                    return;
                }
                selFile=$scope.playerBackFile;
            }else if(type==3){
                if($scope.specialBackLength==null||$scope.specialBackLength<1){
                    alert("请必须上传专题图片!!");
                    return;
                }
                selFile=$scope.specialBackFile;
            }

            var interfaceName='/mediaBackground/uploadFile';
            $scope.submitFileForm($upload,selFile,'post',interfaceName,{type:type},'',function(data,status){
                toast("上传成功!!");
                $scope.loadBackGround(type);
            },function(data,status){
                toastError("上传失败!! status="+status+","+angular.toJson(data));
            });
        }

        $scope.switchBackGround=function(type){
            var imgUrl="";
            if(type==1){
                $scope.gameBackGroundUrl=imgUrl;
            }else if(type==2){
                $scope.playerBackGroundUrl=imgUrl;
            }else if(type==3){
                $scope.specialBackGroundUrl=imgUrl;
            }
        }

        $scope.loadBackGround(1);
        $scope.loadBackGround(2);
        $scope.loadBackGround(3);
    }]);



/**
 * 赛事管理
 */
platformControllers.controller('publicGameCtrl', ['$scope','$http','$controller','$upload',
    function($scope,$http,$controller,$upload) {
        var parentCtrl = $controller('baseMediaCtrl', {$scope: $scope,$http:$http});

        /**
         * 从后台查询数据
         */
        $scope.queryMediaPublic=function(){
            var interfaceName='/mediaPublic/findlist.do';
            $scope.queryData(interfaceName,1,{type:1});
        }


        /**
         * 重新加载表格中的数据
         */
        $scope.reload = function () {
            $scope.queryMediaPublic();
        }

        /**
         *  删除
         * @param id
         */
        $scope.deleteMediaPublic = function (index) {
            var id=$scope.datas[index].id;
            var enableStatus=$scope.datas[index].enableStatus;
            if(enableStatus==0){
                toastError("启用状态不能删除!!");
                return;
            }
            alertMsg("提示信息","确定删除您所选的记录?","删除该数据不能恢复",function() {
                var interfaceName = "/mediaPublic/delete.do";
                var params = {id: id};
                $scope.deleteData(interfaceName, params);
            })
        }

        //页面初始化
        $scope.searchField="";
        $scope.queryMediaPublic();
    }]);

/**
 * 球星管理
 */
platformControllers.controller('publicPlayerCtrl', ['$scope','$http','$controller','$upload',
    function($scope,$http,$controller,$upload) {
        var parentCtrl = $controller('baseMediaCtrl', {$scope: $scope,$http:$http});

        /**
         * 从后台查询数据
         */
        $scope.queryMediaPublic=function(){
            var interfaceName='/mediaPublic/findlist.do';
            $scope.queryData(interfaceName,1,{type:2});
        }


        /**
         * 重新加载表格中的数据
         */
        $scope.reload = function () {
            $scope.queryMediaPublic();
        }

        /**
         *  删除
         * @param id
         */
        $scope.deleteMediaPublic = function (index) {
            var id=$scope.datas[index].id;
            var enableStatus=$scope.datas[index].enableStatus;
            if(enableStatus==0){
                toastError("启用状态不能删除!!");
                return;
            }
            alertMsg("提示信息","确定删除您所选的记录?","删除该数据不能恢复",function() {
                var interfaceName = "/mediaPublic/delete.do";
                var params = {id: id};
                $scope.deleteData(interfaceName, params);
            })
        }

        //页面初始化
        $scope.searchField="";
        $scope.queryMediaPublic();
    }]);

/**
 * 专题管理
 */
platformControllers.controller('publicSpecialCtrl', ['$scope','$http','$controller','$upload',
    function($scope,$http,$controller,$upload) {
        var parentCtrl = $controller('baseMediaCtrl', {$scope: $scope,$http:$http});

        /**
         * 从后台查询数据
         */
        $scope.queryMediaPublic=function(){
            var interfaceName='/mediaPublic/findlist.do';
            $scope.queryData(interfaceName,1,{type:3});
        }


        /**
         * 重新加载表格中的数据
         */
        $scope.reload = function () {
            $scope.queryMediaPublic();
        }

        /**
         *  删除
         * @param id
         */
        $scope.deleteMediaPublic = function (index) {
            var id=$scope.datas[index].id;
            var enableStatus=$scope.datas[index].enableStatus;
            if(enableStatus==0){
                toastError("启用状态不能删除!!");
                return;
            }
            alertMsg("提示信息","确定删除您所选的记录?","删除该数据不能恢复",function() {
                var interfaceName = "/mediaPublic/delete.do";
                var params = {id: id};
                $scope.deleteData(interfaceName, params);
            })
        }

        //页面初始化
        $scope.searchField="";
        $scope.queryMediaPublic();
    }]);

/**
 * 自定义标签管理
 */
platformControllers.controller('publicTagCtrl', ['$scope','$http','$controller','$upload',
    function($scope,$http,$controller,$upload) {
        var parentCtrl = $controller('baseMediaCtrl', {$scope: $scope,$http:$http});

        $scope.typeOptions=[
            {name:'所有公众号',id:''},
            {name:'赛事',id:'1'},
            {name:'球星',id:'2'},
            {name:'专题',id:'3'},
            {name:'自定义标签',id:'4'}
        ];
        $scope.typeId='';

        /**
         * 从后台查询数据
         */
        $scope.queryMediaPublic=function(){
            var interfaceName='/mediaPublic/findlist.do';
            if($scope.typeId!=null&&$scope.typeId!=""){
                $scope.queryData(interfaceName,1,{type:$scope.typeId});
            }else{
                $scope.queryData(interfaceName,1);
            }

        }


        /**
         * 重新加载表格中的数据
         */
        $scope.reload = function () {
            $scope.queryMediaPublic();
        }

        $scope.typeChange=function($event){
            $scope.reload();
        }

        /**
         *  删除
         * @param id
         */
        $scope.deleteMediaPublic = function (index) {
            var id=$scope.datas[index].id;
            var enableStatus=$scope.datas[index].enableStatus;
            if(enableStatus==0){
                toastError("启用状态不能删除!!");
                return;
            }
            alertMsg("提示信息","确定删除您所选的记录?","删除该数据不能恢复",function() {
                var interfaceName = "/mediaPublic/delete.do";
                var params = {id: id};
                $scope.deleteData(interfaceName, params);
            })
        }

        //页面初始化
        $scope.searchField="";
        $scope.queryMediaPublic();
    }]);


/**
 * 新闻分类管理
 */
platformControllers.controller('newstypeCtrl', ['$scope','$http','$controller','$upload',
    function($scope,$http,$controller,$upload) {
        var parentCtrl = $controller('baseMediaCtrl', {$scope: $scope,$http:$http});

        /**
         * 从后台查询数据
         */
        $scope.queryNewstype=function(){
            var interfaceName='/newstype/findlist.do';
            $scope.queryData(interfaceName,1);
        }


        /**
         * 重新加载表格中的数据
         */
        $scope.reload = function () {
            $scope.queryNewstype();
        }


        /**
         * 初始化数据
         * @param index   行记录下标
         */
        $scope.showModalWindow = function (id) {
            $scope.submitted = false;
            $scope.deleteOptions=[
                {name:'启用',id:0},
                {name:'停用',id:1}
            ];

            $scope.newstype={};
            if(id!=null&&id!=""){
                var interfaceName="/newstype/findById.do";
                $scope.getApi(interfaceName,{id:id},function(data,status){
                    $scope.newstype=data.data;
                    $("#modalWin").modal("show");
                });
            }else{
                $("#modalWin").modal("show");
            }
        }

        /**
         * 保存数据
         * @param isValid
         */
        $scope.saveNewsType=function(isValid){
            var id=$scope.newstype.id;
            var params={name: $scope.newstype.name,sortNum: $scope.newstype.sortNum,enableStatus: $scope.newstype.enableStatus};
            var interfaceName="/newstype/save.do";
            if(id!=null&&id!=""){
                interfaceName="/newstype/update.do";
                params["id"]=id;
            }
            $scope.addData(isValid,interfaceName,params,$('#modalWin'),'',function(data,status){
                toastError("保存失败!!"+status);
                return false;
            });
        }

        /**
         *  删除
         * @param id
         */
        $scope.deleteNewstype = function (index) {
            var id=$scope.datas[index].id;
            var enableStatus=$scope.datas[index].enableStatus;
            if(enableStatus==0){
                toastError("启用状态不能删除!!");
                return;
            }
            alertMsg("提示信息","确定删除您所选的记录?","删除该数据不能恢复",function() {
                var interfaceName = "/newstype/delete.do";
                var params = {id: id};
                $scope.deleteData(interfaceName, params);
            })
        }

        //页面初始化
        $scope.searchField="";
        $scope.queryNewstype();
    }]);


/**
 * 新闻管理
 */
platformControllers.controller('mediaNewsListCtrl', ['$scope','$http','$controller','$upload',
    function($scope,$http,$controller,$upload) {
        var parentCtrl = $controller('baseMediaCtrl', {$scope: $scope,$http:$http});

        $scope.search={};
        //选择日期
        $(".dpicker").datepicker({
            format: 'yyyy-mm-dd',
            language: 'zh-CN',
            todayHighlight: true
        });

        $scope.timeOptions=[
            {name:'',id:''},
            {name:'全部',id:'0'},
            {name:'今天',id:'1'},
            {name:'最近一个月',id:'2'},
            {name:'最近三个月',id:'3'}
        ];
        $scope.typeOptions=[
            {name:'所有分类',id:''},
            {name:'普通新闻',id:'0'},
            {name:'专题新闻',id:'1'}
        ];
        $scope.timeFlg='';
        $scope.type='';

        /**
         * 从后台查询数据
         */
        $scope.queryMediaNewsList=function(){
            var interfaceName='/medianew/findlist.do';
            var timeFlg=$scope.timeFlg;
            if(timeFlg=='0'){
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
            var type=$scope.type;
            var params={};

            if(beginTime!=null&&beginTime!=""){
                params["beginTime"]=beginTime;
            }
            if(endTime!=null&&endTime!=""){
                params["endTime"]=endTime;
            }
            if(type!=null&&type!=""){
                params["type"]=type;
            }
            $scope.queryData(interfaceName,1,params);
        }


        /**
         * 重新加载表格中的数据
         */
        $scope.reload = function () {
            $scope.queryMediaNewsList();
        }

        /**
         *  删除
         * @param id
         */
        $scope.deleteMediaNews = function (index) {
            var id=$scope.datas[index].id;
            var enableStatus=$scope.datas[index].enableStatus;
            if(enableStatus==0){
                toastError("启用状态不能删除!!");
                return;
            }
            alertMsg("提示信息","确定删除您所选的记录?","删除该数据不能恢复",function() {
                var interfaceName = "/medianew/delete.do";
                var params = {id: id};
                $scope.deleteData(interfaceName, params);
            })
        }

        //页面初始化
        $scope.searchField="";
        $scope.queryMediaNewsList();
    }]);


/**
 * 新闻的新增修改管理
 */
platformControllers.controller('saveMediaNewsCtrl', ['$scope','$http','$controller','$upload','$routeParams','$location',
    function($scope,$http,$controller,$upload,$routeParams,$location) {
        var parentCtrl = $controller('baseMediaCtrl', {$scope: $scope,$http:$http});
        $scope.id=$routeParams.id;

        /**
         * 初始化数据
         * @param index   行记录下标
         */
        $scope.initData = function () {
            $scope.public={};
            $scope.typeOptions=[
                {name:'普通新闻',id:'0'},
                {name:'专题新闻',id:'1'}
            ];
            $scope.public.type='0';

            $scope.deleteOptions=[
                {name:'启用',id:0},
                {name:'停用',id:1}
            ];
            $scope.isFlagOptions=[
                {name:'是',id:0},
                {name:'否',id:1}
            ];
            $scope.typeIdOptions=[];
            $scope.tagsArray=[];

            if($scope.id!=-1){
                $scope.imgServerPath=GlobalConstant.imgServerPath;
                var interfaceName="/medianew/findById.do";
                $scope.getApi(interfaceName,{id:$scope.id},function(data,status){
                    $scope.public=data.data;
                    if($scope.public.tags==null||$scope.public.tags==""){
                        $scope.tagsArray=[];
                    }else{
                        $scope.tagsArray=$scope.public.tags[0];
                    }
                    $scope.imgLength=1;
                    ue.ready(function() {
                        ue.setContent(data.data.content);
                    });
                    $scope.typeChange();
                });
            }else{
                $scope.typeChange();
            }
        }

        $scope.typeChange = function ($event) {
            var typeValue=$scope.public.type;
            var selParmas={limit:10000,page:0};
            var interfaceName="/newstype/findlist.do";
            if(typeValue==1){
                interfaceName="/mediaPublic/findlist.do";
                selParmas["type"]=3;
            }
            selParmas["enableStatus"]=0;
            $scope.getApi(interfaceName,selParmas,function(data,status){
                $scope.typeIdOptions=data.data;
            });
        }

        $scope.uploadPicToServer = function (isValid) {
            $scope.uploadPic(isValid,$upload);
        }

        $scope.showAddTagForm = function () {
            $scope.tagName="";
            var interfaceName="/mediaPublic/findlist.do";
            var selParmas={limit:10000,page:0,enableStatus:0};
            $scope.getApi(interfaceName,selParmas,function(data,status){
                $scope.tagOptions=data.data;
            });
            $("#tagModal").modal("show");
        }

        //添加标签
        $scope.addTag = function (isValid) {
            if(isValid){
                var name=$("#tagId option:selected").text();
                var id=$scope.tagName;
                $scope.tagsArray.push({id:id,name:name});
                $("#tagModal").modal("hide");
            }

        }

        //删除标签
        $scope.delTag = function (index) {
            $scope.tagsArray.splice(index, 1);
        }

        /**
         * 添加数据
         */
        $scope.saveMediaPublic = function (isValid) {
            var id=$scope.public.id;
            if($scope.imgLength==null||$scope.imgLength<1){
                alert("请必须上传缩略图!!");
                return;
            }
            if(isValid) {//验证通过
                $scope.submitted = false;
            }else{
                $scope.submitted = true;
                return;
            }

            var content=ue.getContent();
            var tags=[];
            for(var i=0;i<$scope.tagsArray.length;i++) {
                tags.push($scope.tagsArray[i].id);
            }
            var params={title: $scope.public.title,type:$scope.public.type,typeId:$scope.public.typeId,intro: $scope.public.intro,author: $scope.public.author,source: $scope.public.source,enableStatus: $scope.public.enableStatus,isTop: $scope.public.isTop,isFirst: $scope.public.isFirst,content:content,thumbnailUrl:$scope.public.thumbnailUrl,tags:tags.join(",")};
            var interfaceName="/medianew/save.do";
            if(id!=null&&id!=""){
                interfaceName="/medianew/update.do";
                params["id"]=id;
            }
            $scope.submitFileForm($upload,$scope.files,'post',interfaceName,params,'',function(data,status){
                toast("保存成功!!");
                $location.path("/mediaNewsList");
            },function(data,status){
                toastError("保存失败!! status="+status+","+angular.toJson(data));
            });
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

        $scope.initData();
    }]);

/**
 * 视频类型管理
 */
platformControllers.controller('videotypeCtrl', ['$scope','$http','$controller','$upload',
    function($scope,$http,$controller,$upload) {
        var parentCtrl = $controller('baseMediaCtrl', {$scope: $scope,$http:$http});

        /**
         * 从后台查询数据
         */
        $scope.queryVideotype=function(){
            var interfaceName='/videotype/findlist.do';
            $scope.queryData(interfaceName,1);
        }


        /**
         * 重新加载表格中的数据
         */
        $scope.reload = function () {
            $scope.queryVideotype();
        }


        /**
         * 初始化数据
         * @param index   行记录下标
         */
        $scope.showModalWindow = function (id) {
            $scope.submitted = false;
            $scope.deleteOptions=[
                {name:'启用',id:0},
                {name:'停用',id:1}
            ];

            $scope.newstype={};
            if(id!=null&&id!=""){
                var interfaceName="/videotype/findById.do";
                $scope.getApi(interfaceName,{id:id},function(data,status){
                    $scope.newstype=data.data;
                    $("#modalWin").modal("show");
                });
            }else{
                $("#modalWin").modal("show");
            }
        }

        /**
         * 保存数据
         * @param isValid
         */
        $scope.saveVideoType=function(isValid){
            var id=$scope.newstype.id;
            var params={name: $scope.newstype.name,sortNum: $scope.newstype.sortNum,enableStatus: $scope.newstype.enableStatus};
            var interfaceName="/videotype/save.do";
            if(id!=null&&id!=""){
                interfaceName="/videotype/update.do";
                params["id"]=id;
            }
            $scope.addData(isValid,interfaceName,params,$('#modalWin'),'',function(data,status){
                toastError("保存失败!!"+status);
                return false;
            });
        }

        /**
         *  删除
         * @param id
         */
        $scope.deleteVideotype = function (index) {
            var id=$scope.datas[index].id;
            var enableStatus=$scope.datas[index].enableStatus;
            if(enableStatus==0){
                toastError("启用状态不能删除!!");
                return;
            }
            alertMsg("提示信息","确定删除您所选的记录?","删除该数据不能恢复",function() {
                var interfaceName = "/videotype/delete.do";
                var params = {id: id};
                $scope.deleteData(interfaceName, params);
            })
        }

        //页面初始化
        $scope.searchField="";
        $scope.queryVideotype();
    }]);

/**
 * 视频管理
 */
platformControllers.controller('mediaVideoListCtrl', ['$scope','$http','$controller','$upload',
    function($scope,$http,$controller,$upload) {
        var parentCtrl = $controller('baseMediaCtrl', {$scope: $scope,$http:$http});

        $scope.search={};
        //选择日期
        $(".dpicker").datepicker({
            format: 'yyyy-mm-dd',
            language: 'zh-CN',
            todayHighlight: true
        });

        $scope.timeOptions=[
            {name:'',id:''},
            {name:'全部',id:'0'},
            {name:'今天',id:'1'},
            {name:'最近一个月',id:'2'},
            {name:'最近三个月',id:'3'}
        ];
        $scope.typeOptions=[
            {name:'全部',id:''}
        ];
        var interfaceName="/videotype/findlist.do";
        $scope.getApi(interfaceName,{enableStatus:0},function(data,status){
            for(var i=0;i<data.data.length;i++) {
                var record=data.data[i];
                $scope.typeOptions.push({name:record.name,id:record.id});
            }
        });
        $scope.timeFlg='';
        $scope.typeId='';

        /**
         * 从后台查询数据
         */
        $scope.queryMediaVideoList=function(){
            var interfaceName='/mediavideo/findlist.do';
            var timeFlg=$scope.timeFlg;
            if(timeFlg=='0'){
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
            var typeId=$scope.typeId;
            var params={};

            if(beginTime!=null&&beginTime!=""){
                params["beginTime"]=beginTime;
            }
            if(endTime!=null&&endTime!=""){
                params["endTime"]=endTime;
            }
            if(typeId!=null&&typeId!=""){
                params["typeId"]=typeId;
            }
            $scope.queryData(interfaceName,1,params);
        }


        /**
         * 重新加载表格中的数据
         */
        $scope.reload = function () {
            $scope.queryMediaVideoList();
        }

        /**
         *  删除
         * @param id
         */
        $scope.deleteMediaVideo = function (index) {
            var id=$scope.datas[index].id;
            var enableStatus=$scope.datas[index].enableStatus;
            if(enableStatus==0){
                toastError("启用状态不能删除!!");
                return;
            }
            alertMsg("提示信息","确定删除您所选的记录?","删除该数据不能恢复",function() {
                var interfaceName = "/mediavideo/delete.do";
                var params = {id: id};
                $scope.deleteData(interfaceName, params);
            })
        }

        //页面初始化
        $scope.searchField="";
        $scope.queryMediaVideoList();
    }]);


/**
 * 视频的新增修改管理
 */
platformControllers.controller('saveMediaVideoCtrl', ['$scope','$http','$controller','$upload','$routeParams','$location',
    function($scope,$http,$controller,$upload,$routeParams,$location) {
        var parentCtrl = $controller('baseMediaCtrl', {$scope: $scope,$http:$http});
        $scope.id=$routeParams.id;

        /**
         * 初始化数据
         * @param index   行记录下标
         */
        $scope.initData = function () {
            $scope.public={};
            $scope.typeOptions=[
                {name:'普通视频',id:'0'},
                {name:'直播视频',id:'1'}
            ];
            $scope.public.type='0';

            $scope.deleteOptions=[
                {name:'启用',id:0},
                {name:'停用',id:1}
            ];
            $scope.isFlagOptions=[
                {name:'是',id:0},
                {name:'否',id:1}
            ];
            $scope.typeIdOptions=[];
            $scope.tagsArray=[];

            var selParmas={limit:10000,page:0,enableStatus:0};
            var interfaceName="/videotype/findlist.do";
            $scope.getApi(interfaceName,selParmas,function(data,status){
                $scope.typeIdOptions=data.data;
            });

            $scope.videoFileArray=[];
            if($scope.id!=-1){
                $scope.imgServerPath=GlobalConstant.imgServerPath;
                var interfaceName="/mediavideo/findById.do";
                $scope.getApi(interfaceName,{id:$scope.id},function(data,status){
                    $scope.public=data.data;
                    if($scope.public.tags==null||$scope.public.tags==""){
                        $scope.tagsArray=[];
                    }else{
                        $scope.tagsArray=$scope.public.tags[0];
                    }
                    $scope.videoFileArray=$scope.public.videoFiles;
                    if($scope.videoFileArray==null||$scope.videoFileArray==""){
                        $scope.videoFileArray=[];
                    }
                    $scope.imgLength=1;
                    ue.ready(function() {
                        ue.setContent(data.data.content);
                    });
                    $scope.typeChange();
                });
            }else{
                $scope.typeChange();
            }
        }

        $scope.typeChange = function ($event) {
            var typeValue=$scope.public.type;

        }

        $scope.uploadPicToServer = function (isValid) {
            $scope.uploadPic(isValid,$upload);
        }

        //打开添加标签窗口
        $scope.showAddTagForm = function () {
            $scope.tagName="";
            var interfaceName="/mediaPublic/findlist.do";
            var selParmas={limit:10000,page:0,enableStatus:0};
            $scope.getApi(interfaceName,selParmas,function(data,status){
                $scope.tagOptions=data.data;
            });
            $("#tagModal").modal("show");
        }

        //添加标签
        $scope.addTag = function (isValid) {
            if(isValid){
                var name=$("#tagId option:selected").text();
                var id=$scope.tagName;
                $scope.tagsArray.push({id:id,name:name});
                $("#tagModal").modal("hide");
            }

        }

        //删除标签
        $scope.delTag = function (index) {
            $scope.tagsArray.splice(index, 1);
        }

        //打开添加直播视频窗口
        $scope.showAddVideoForm = function () {
            $scope.video={};
            $("#videoModal").modal("show");
        }

        //添加直播视频
        $scope.addVideo = function (isValid) {
            if(isValid){
                $scope.videoFileArray.push($scope.video);
                $("#videoModal").modal("hide");
            }

        }

        //删除直播视频
        $scope.delVideo = function (index) {
            $scope.videoFileArray.splice(index, 1);
        }

        /**
         * 添加数据
         */
        $scope.saveMediaPublic = function (isValid) {
            var id=$scope.public.id;
            if($scope.imgLength==null||$scope.imgLength<1){
                alert("请必须上传缩略图!!");
                return;
            }
            if(isValid) {//验证通过
                $scope.submitted = false;
            }else{
                $scope.submitted = true;
                return;
            }

            var content=ue.getContent();
            var tags=[];
            for(var i=0;i<$scope.tagsArray.length;i++) {
                tags.push($scope.tagsArray[i].id);
            }
            var params={title: $scope.public.title,type:$scope.public.type,typeId:$scope.public.typeId,intro: $scope.public.intro,author: $scope.public.author,minutes:$scope.public.minutes,source: $scope.public.source,enableStatus: $scope.public.enableStatus,isTop: $scope.public.isTop,isFirst: $scope.public.isFirst,content:content,thumbnailUrl:$scope.public.thumbnailUrl,tags:tags.join(","),videoFiles:angular.toJson($scope.videoFileArray)};
            var interfaceName="/mediavideo/save.do";
            if(id!=null&&id!=""){
                interfaceName="/mediavideo/update.do";
                params["id"]=id;
            }
            $scope.submitFileForm($upload,$scope.files,'post',interfaceName,params,'',function(data,status){
                toast("保存成功!!");
                $location.path("/mediaVideoList");
            },function(data,status){
                toastError("保存失败!! status="+status+","+angular.toJson(data));
            });
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

        //从优酷获取视频列表信息
        $scope.getVideoList=function(){
            $("#videoFileRow").on("click",'.video-wrapper', function() {
                $(this).toggleClass("video-selected");
            });
            $scope.selectedVideoList=[];
            var interfaceName='/atpyk/getmeVideo.do';
            $scope.queryData(interfaceName,1,{limit:8});
        }

        $scope.saveVideoToUE=function(){
            //var videoWidth=$scope.videoWidth;
           // var videoHeight=$scope.videoHeight;
           // if(videoWidth==""||videoWidth==null){
           //     videoWidth=305;
           // }
          //  if(videoHeight==""||videoHeight==null){
          var videoHeight=225;
          //  }
            for(var i=0;i<$scope.selectedVideoList.length;i++){
                var vid=$scope.selectedVideoList[i].id;
                //var thumbnail=$scope.selectedVideoList[i].thumbnail;
                var thumbnail=GlobalConstant.managerServerPath+'img/video.jpg';
                var videoInfo="<a href='vid:"+vid+"'><img class='playerimg' src='"+thumbnail+"' style='max-width:100%;display:block;margin:0 auto;' height='"+videoHeight+"' data-vid='"+vid+"'/></a>";
                ue.execCommand("insertHtml",videoInfo);
            }
            $("#videoOtherModal").modal("hide");
            $scope.selectedVideoList=[];
        }

        $scope.showVideoUE=function(){
            $scope.videoContent=ue.getContent();
            $("#medioDiv").html($scope.videoContent);
            $("#showMediaInfoModal").modal("show");

            //把img替换为div
            /*$(".playerimg").each(function(i) {
                var $t = $(this);
                var id = "playerdiv"+i;
                var styleStr = "margin:15px 0px;width:"+$t.attr("width")+"px;height:"+$t.attr("height")+"px;";
                var dataVid = $t.data("vid");
                var htmlStr = "<div class='playerdiv' id='"+id+"' style='"+styleStr+"' data-vid='"+dataVid+"'></div>";
                $t.replaceWith(htmlStr);
            });

            //初始化播放器
            $(".playerdiv").each(function() {
                var $t = $(this);
                var vId = $t.data("vid");
                var player=new YKU.Player($t.attr("id"), {
                    styleid: "0",
                    client_id: "1a5a3c98f8886cf6",
                    vid: vId
                });
            });*/
        }

        $scope.selectVideo=function(id,thumbnail){
            var hasSel=1;
            for(var i=0;i<$scope.selectedVideoList.length;i++){
                var vid=$scope.selectedVideoList[i].id;
                if(id==vid){
                    hasSel=-1;
                    $scope.selectedVideoList.splice(i,1);
                }
            }
            if(hasSel==1){
                $scope.selectedVideoList.push({id:id,thumbnail:thumbnail});
            }
        }
        $scope.initData();
        $scope.getVideoList();
    }]);


/**
 * 排名分类设置
 */
platformControllers.controller('rankingWayCtrl', ['$scope','$http','$controller','$upload',
    function($scope,$http,$controller,$upload) {
        var parentCtrl = $controller('baseMediaCtrl', {$scope: $scope,$http:$http});

        /**
         * 从后台查询数据
         */
        $scope.queryWayList=function(){
            var interfaceName='/playerRankingWay/getWayList';
            $scope.queryData(interfaceName,1);
        }


        /**
         * 重新加载表格中的数据
         */
        $scope.reload = function () {
            $scope.queryWayList();
        }


        /**
         * 初始化数据
         * @param index   行记录下标
         */
        $scope.showModalWindow = function (id) {
            $scope.submitted = false;
            $scope.deleteOptions=[
                {name:'启用',id:0},
                {name:'停用',id:1}
            ];

            $scope.sexOptions=[
                {name:'男',id:0},
                {name:'女',id:1}
            ];

            $scope.playOptions=[
                {name:'单打',id:0},
                {name:'双打',id:1}
            ];

            $scope.professionOptions=[
                {name:'职业运动员',id:0},
                {name:'非职业运动员',id:1}
            ];

            $scope.countryOptions=countryList;

            $scope.public={type:0,condition:{}};
            if(id!=null&&id!=""){
                var interfaceName="/playerRankingWay/findById.do";
                $scope.getApi(interfaceName,{id:id},function(data,status){
                    $scope.public=data.data;
                    if($scope.public.condition==null||$scope.public.condition==""){
                        $scope.public.condition={};
                    }
                    setTimeout(function () {
                        $("#selCountry").select2().select2("val", $scope.public.condition.country);
                    }, 300);
                    $("#modalWin").modal("show");
                });
            }else{
                $("#modalWin").modal("show");
            }
        }

        /**
         * 保存数据
         * @param isValid
         */
        $scope.saveWay=function(isValid){
            var id=$scope.public.id;
            var type=$scope.public.type;
            var params={name: $scope.public.name,sortNum: $scope.public.sortNum,enableStatus: $scope.public.enableStatus,type:type};
            if(type==1){
                var sex=$scope.public.condition.sex+'';
                if(sex==null||sex==''||sex=='undefined'){
                    toastError("性别不能为空!!");
                    return;
                }
                var country=$scope.public.condition.country+'';
                if(country==null||country==''||country=='undefined'){
                    toastError("国籍不能为空!!");
                    return;
                }
                var palyType=$scope.public.condition.palyType+'';
                if(palyType==null||palyType==''||palyType=='undefined'){
                    toastError("比赛方式不能为空!!");
                    return;
                }
                var profession=$scope.public.condition.profession+'';
                if(profession==null||profession==''||profession=='undefined'){
                    toastError("运动员职业不能为空!!");
                    return;
                }

                params["condition.sex"]=sex;
                params["condition.palyType"]=palyType
                params["condition.profession"]=profession;
                params["condition.country"]=country;
            }
            var interfaceName="/playerRankingWay/saveWay";
            if(id!=null&&id!=""){
                interfaceName="/playerRankingWay/updateWay";
                params["id"]=id;
            }
            $scope.addData(isValid,interfaceName,params,$('#modalWin'),'',function(data,status){
                toastError("保存失败!!"+status);
                return false;
            });
        }

        /**
         *  删除
         * @param id
         */
        $scope.deleteWay = function (index) {
            var id=$scope.datas[index].id;
            var enableStatus=$scope.datas[index].enableStatus;
            if(enableStatus==0){
                toastError("启用状态不能删除!!");
                return;
            }
            alertMsg("提示信息","确定删除您所选的记录?","删除该数据不能恢复",function() {
                var interfaceName = "/playerRankingWay/deleteWay";
                var params = {id: id};
                $scope.deleteData(interfaceName, params);
            })
        }

        //页面初始化
        $scope.searchField="";
        $scope.queryWayList();
    }]);


/**
 * 历史排名维护设置
 */
platformControllers.controller('rankingPhaseCtrl', ['$scope','$http','$controller','$upload',
    function($scope,$http,$controller,$upload) {
        var parentCtrl = $controller('baseMediaCtrl', {$scope: $scope,$http:$http});

        $scope.typeOptions=[
            {name:'全部',id:''}
        ];
        var interfaceName="/playerRankingWay/getWayList";
        $scope.getApi(interfaceName,{},function(data,status){
            for(var i=0;i<data.data.length;i++) {
                var record=data.data[i];
                $scope.typeOptions.push({name:record.name,id:record.id});
            }
        });
        $scope.type='';

        /**
         * 从后台查询数据
         */
        $scope.queryRankPhaseList=function(){
            var interfaceName='/playerRankingHistory/getRankingPhaseList';
            $scope.queryData(interfaceName,1,{rangkingWayId:$scope.type});
        }


        /**
         * 重新加载表格中的数据
         */
        $scope.reload = function () {
            $scope.queryRankPhaseList();
        }


        /**
         * 打开自动生成排名窗口
         */
        $scope.showAutoRankingWindow = function () {
            //获取上次生成排名时间
            $scope.getApi("/playerRankingHistory/getRankLastTime",{type:1},function(data,status){
                $scope.rankLastTime=data.data;
            });
            //获取自动排名类别
            var interfaceName="/playerRankingWay/getWayList";
            var params={type:1,enableStatus:0,page:1,limit:1000};
            $scope.getApi(interfaceName,params,function(data,status){
                $scope.wayArray=data.data;
                $scope.autoWaySelected=[];
                for(var i=0;i<$scope.wayArray.length;i++) {
                    $scope.autoWaySelected.push($scope.wayArray[i].id);
                }
                $("#autoModalWin").modal("show");
            });
        }

        //选中或取消选中
        $scope.updateAutoWaySelection=function($event, id){
            var checkbox = $event.target;
            var action = (checkbox.checked?'add':'remove');
            var checkIndex=$scope.autoWaySelected.indexOf(id);
            if(action == 'add' &&checkIndex  == -1){
                $scope.autoWaySelected.push(id);
            }
            if(action == 'remove' && checkIndex!=-1){
                $scope.autoWaySelected.splice(checkIndex,1);
            }
        }

        /**
         * 保存自动排名数据
         * @param isValid
         */
        $scope.saveAutoWay=function(isValid){
            var interfaceName="/playerRankingHistory/autoRanking";
            if($scope.autoWaySelected.length==0){
                toastError("请至少选择一个类别!!");
                return;
            }
            $scope.addData(true,interfaceName,{wayIds:$scope.autoWaySelected.join(",")},$('#autoModalWin'),'',function(data,status){
                toastError("保存失败!!"+status);
                return false;
            });
        }

        /**
         *  删除
         * @param id
         */
        $scope.deleteRanking = function (index) {
            var id=$scope.datas[index].rangkingWayId;
            var num=$scope.datas[index].num;
            alertMsg("提示信息","确定删除您所选的记录?","删除该数据不能恢复",function() {
                var interfaceName = "/playerRankingHistory/deleteRanking";
                var params = {rangkingWayId: id,num:num};
                $scope.deleteData(interfaceName, params);
            })
        }

        //页面初始化
        $scope.searchField="";
        $scope.queryRankPhaseList();
    }]);


/**
 * 手动添加组合双打排名
 */
platformControllers.controller('saveDoubleWayRankCtrl', ['$scope','$http','$controller','$upload','$routeParams','$location',
    function($scope,$http,$controller,$upload,$routeParams,$location) {
        var parentCtrl = $controller('baseMediaCtrl', {$scope: $scope,$http:$http});

        /**
         * 初始化数据
         * @param index   行记录下标
         */
        $scope.initData = function () {

            //获取上次生成排名时间
            $scope.getApi("/playerRankingHistory/getRankLastTime",{type:0},function(data,status){
                $scope.rankLastTime=data.data;
            });

            //获取球星
            var playerInterfaceName="/mediaPublic/findlist.do";
            $scope.getApi(playerInterfaceName,{type:2,enableStatus:0,page:1,limit:1000},function(data,status){
                $scope.playerOptions=data.data;
            });
            //获取手动排名类别
            var interfaceName="/playerRankingWay/getWayList";
            $scope.getApi(interfaceName,{type:0,enableStatus:0,page:1,limit:1000},function(data,status){
                $scope.doubleTypeOptions=data.data;
                $scope.doubleRankingArray=[];
                $("#dobuleModalWin").modal("show");
            });
            $scope.typeChange();
        }

        $scope.typeChange=function($event){
            var interfaceName="/playerRankingHistory/getRankNumByWayId";
            $scope.getApi(interfaceName,{wayId:$scope.doubleType},function(data,status){
                if($scope.doubleType!=null&&$scope.doubleType!=""){
                    $scope.preRankNum="该类别已生成"+data.data+"期";
                }

            });
        }

        $scope.addDoubleRanking = function () {
            var ranking={ranking:'',entrieNum:'',integral:'',firstPalyerId:'',secondPalyerId:''};
            $scope.doubleRankingArray.push(ranking);
        }

        $scope.delDoubleRank = function (index) {
            $scope.doubleRankingArray.splice(index, 1);
        }

        $scope.saveDoubleWay=function(){
            var interfaceName="/playerRankingHistory/saveDoublesRanking";
            var rangkingWayId=$scope.doubleType;
            if(rangkingWayId==null||rangkingWayId==""){
                toastError("请选择一个排名分类!!");
                return;
            }
            if($scope.doubleRankingArray.length==0){
                toastError("请至少添加一组球星排名!!");
                return;
            }
            var params={rangkingWayId:rangkingWayId,datas:angular.toJson($scope.doubleRankingArray)};
            $scope.addData(true,interfaceName,params,$('#dobuleModalWin'),function(data,status){
                toast("保存成功!!");
                $location.path("/rankingPhase");
            },function(data,status){
                toastError("保存失败!!"+status);
                return false;
            });
        }


        $scope.initData();
    }]);


/**
 * 球星排名详细列表
 */
platformControllers.controller('rankingDetailCtrl', ['$scope','$http','$controller','$routeParams',
    function($scope,$http,$controller,$routeParams) {
        var parentCtrl = $controller('baseMediaCtrl', {$scope: $scope,$http:$http});
        var rangkingWayId=$routeParams.rangkingWayId;
        var num=$routeParams.num;

        /**
         * 从后台查询数据
         */
        $scope.queryRankDetailList=function(){
            var interfaceName='/playerRankingHistory/getRankingDetailList';
            $scope.queryData(interfaceName,1,{num:num,rangkingWayId:rangkingWayId});
        }


        /**
         * 重新加载表格中的数据
         */
        $scope.reload = function () {
            $scope.queryRankDetailList();
        }

        //页面初始化
        $scope.searchField="";
        $scope.queryRankDetailList();
    }]);



/**
 * 关键词管理
 */
platformControllers.controller('keyWorldCtrl', ['$scope','$http','$controller','$upload',
    function($scope,$http,$controller,$upload) {
        var parentCtrl = $controller('baseMediaCtrl', {$scope: $scope,$http:$http});

        /**
         * 从后台查询数据
         */
        $scope.queryKeyWorldList=function(){
            var interfaceName='/mediaBlacklist/getKeyWorldList.do';
            $scope.queryData(interfaceName,1);
        }


        /**
         * 重新加载表格中的数据
         */
        $scope.reload = function () {
            $scope.queryKeyWorldList();
        }


        /**
         * 初始化数据
         * @param index   行记录下标
         */
        $scope.showModalWindow = function (index) {
            $scope.submitted = false;
            $scope.deleteOptions=[
                {name:'启用',id:0},
                {name:'停用',id:1}
            ];

            $scope.keyWorld=$scope.datas[index];
            if($scope.keyWorld==null){
                $scope.keyWorld=={};
            }
            $("#modalWin").modal("show");
        }

        /**
         * 保存数据
         * @param isValid
         */
        $scope.saveKeyWorld=function(isValid){
            var id=$scope.keyWorld.id;
            var params={keyWorld: $scope.keyWorld.keyWorld,afterWorld: $scope.keyWorld.afterWorld,enableStatus: $scope.keyWorld.enableStatus};
            var interfaceName="/mediaBlacklist/saveKeyWorld.do";
            if(id!=null&&id!=""){
                interfaceName="/mediaBlacklist/updateKeyWorld.do";
                params["id"]=id;
            }
            $scope.addData(isValid,interfaceName,params,$('#modalWin'),'',function(data,status){
                toastError("保存失败!!"+status);
                return false;
            });
        }

        /**
         *  删除
         * @param id
         */
        $scope.deleteKeyWorld = function (index) {
            var id=$scope.datas[index].id;
            var enableStatus=$scope.datas[index].enableStatus;
            if(enableStatus==0){
                toastError("启用状态不能删除!!");
                return;
            }
            alertMsg("提示信息","确定删除您所选的记录?","删除该数据不能恢复",function() {
                var interfaceName = "/mediaBlacklist/deleteKeyWorld.do";
                var params = {id: id};
                $scope.deleteData(interfaceName, params);
            })
        }

        //页面初始化
        $scope.searchField="";
        $scope.queryKeyWorldList();
    }]);


/**
 * 运营统计
 */
platformControllers.controller('mediaStatCtrl', ['$scope','$http','$controller','$upload',
    function($scope,$http,$controller,$upload) {
        var parentCtrl = $controller('baseMediaCtrl', {$scope: $scope,$http:$http});

        $scope.search={recommend:'',queryDateType:'',queryOrderType:1};

        /**
         * 从后台查询数据
         */
        $scope.queryMediaStat=function(){
            var interfaceName='/user/findUser.do';
            var params={queryOrderType:$scope.search.queryOrderType};
            if($scope.search.recommend!=""){
                params['recommend']=$scope.search.recommend;
            }
            if($scope.search.queryDateType!=""){
                params['queryDateType']=$scope.search.queryDateType;
            }
            if($scope.mobile!=""){
                params['userMobile']=$scope.mobile;
            }
            $scope.queryData(interfaceName,1,params);
        }


        /**
         * 重新加载表格中的数据
         */
        $scope.reload = function () {
            $scope.queryMediaStat();
        }


        /**
         * 推荐用户/取消推荐
         * @param isValid
         */
        $scope.recommendUpdate=function(index){
            var id=$scope.datas[index].uid;
            var nick=$scope.datas[index].nick;
            var recommend=$scope.datas[index].recommend;
            var params={};
            var tipMsg="确定要推荐关注["+nick+"]?";
            if(recommend==1){
                tipMsg="确定要取消推荐关注["+nick+"]?";
                recommend=0;
            }else{
                recommend=1;
            }
            alertMsg("提示信息",tipMsg,"",function() {
                var interfaceName = "/user/recommmend.do";
                var params = {uid: id,type:recommend};
                $scope.addData(true,interfaceName,params,'','',function(data,status){
                    toastError("保存失败!!"+status);
                    return false;
                });
            })

        }

        //页面初始化
        $scope.searchField="";
        $scope.queryMediaStat();
    }]);
