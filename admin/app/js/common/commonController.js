/**
 * Created by admin on 2015/10/4.
 */

var commonControllers = angular.module('commonControllers', ['baseModule']);

/**
 * 财务管理
 */
commonControllers.controller('financialListCtrl', ['$scope','$http','$controller','$routeParams',
    function($scope,$http,$controller,$routeParams) {
        var parentCtrl = $controller('baseCtrl', {$scope: $scope,$http:$http});

        $scope.type=$routeParams.type;
        $scope.financialTitle="场馆财务统计";
        if($scope.type==2){
            $scope.financialTitle="俱乐部财务统计";
        }

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

        /**
         * 从后台查询数据
         */
        $scope.queryFinancial=function(){
            var interfaceName='/finance/order';
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
            var params={};

            if(beginTime!=null&&beginTime!=""){
                params["beginTime"]=new Date(beginTime).getTime();
            }
            if(endTime!=null&&endTime!=""){
                params["endTime"]=new Date(endTime).getTime();
            }
            if($scope.type!=""){
                params["type"]=$scope.type;
            }


            $scope.getApi(interfaceName, params,function(data,status){
                $scope.ordCnts = data;
            });
        }


        /**
         * 重新加载表格中的数据
         */
        $scope.reload = function () {
            $scope.queryFinancial();
        }


        //页面初始化
        $scope.searchField="";
        $scope.search={};
        $scope.queryFinancial();
    }]);


/**
 * 修改密码
 */
commonControllers.controller('modifyPwdCtrl', ['$scope','$http','$controller','$routeParams',
    function($scope,$http,$controller,$routeParams) {
        var parentCtrl = $controller('baseCtrl', {$scope: $scope,$http:$http});

        $scope.modifyPassword=function(isValid){
            if(isValid) {//验证通过
                $scope.submitted = false;
            }else{
                $scope.submitted = true;
                return;
            }
            if($scope.newPassword!=$scope.comfirmPassword){
                toastError("新密码和确认新密码输入不一致!!");
                return;
            }
            var interfaceName="/user";
            var params={password:$scope.newPassword,oldPassword:$scope.oldPassword};
            $scope.putApi(interfaceName,params,function(data,status){
                toast("修改成功!!");
            },function(data,status){
                if(status==401){
                    toastError("旧密码错误!!");
                }else{
                    toastError("修改失败!!"+angular.toJson(data));
                }

            })
        }
    }]);


/**
 * 系统通知
 */
commonControllers.controller('messageListCtrl', ['$scope','$http','$controller',
    function($scope,$http,$controller) {
        var parentCtrl = $controller('baseCtrl', {$scope: $scope,$http:$http});

        $(function() {
            //标记已读
            $(".msg-list").on("click", ".list-group-item", function(e) {
                e.preventDefault();
                $(this).addClass("list-group-item-readed");
            });
        });

        /**
         * 根据消息是否已读状态动态显示样式
         * @param index
         * @returns {*}
         */
        $scope.getMessageStatusClass=function(index){
            var state=$scope.datas[index].state;
            if(state==0){
                return "list-group-item";
            }else{
                return "list-group-item list-group-item-readed";
            }
        }

        /**
         * 从后台查询消息数据
         */
        $scope.queryMessage=function(){
            var interfaceName='/msg/msg';
            $scope.queryData(interfaceName,1);
        }


        /**
         * 重新加载表格中的数据
         */
        $scope.reload = function () {
            $scope.queryMessage();
        }

        /**
         * 读消息标示
         * @param index
         */
        $scope.readMsg = function (index) {
            var msgId=$scope.datas[index]._id;
            var state=$scope.datas[index].state;
            var interfaceName="/msg/msg";
            if(state==0){
                $scope.postApi(interfaceName,{msgId:msgId},function(data,status){
                    $scope.datas[index].state=1;
                },function(data,status){
                    toastError(angular.toJson(data));
                })
            }
        }

        //页面初始化
        $scope.searchField="";
        $scope.queryMessage();
    }]);


/**
 * 主页控制
 */
commonControllers.controller('mainCtrl', ['$scope','$http','$controller',
    function($scope,$http,$controller) {
        var parentCtrl = $controller('baseCtrl', {$scope: $scope,$http:$http});

        /**
         * 从后台查询未读消息个数
         */
        $scope.queryMsgUnReadCount=function(){
            var interfaceName='/msg/unReadCount';
            $scope.getApi(interfaceName,{},function(data,status){
                $scope.unReadMsgCount = data.count;
            });
        }

        /**
         * 用户退出系统
         */
        $scope.userLogout=function(){
            var interfaceName='/user/logout';
            $scope.getApi(interfaceName,{},function(data,status){
                location.href = "index.html";
            });
        }


        $scope.queryMsgUnReadCount();
    }]);



//按照6大州划分国家
var countryList = [
        {groupName:'亚洲',dataList:['中国','蒙古','朝鲜','韩国','日本','菲律宾','越南','老挝','柬埔寨','缅甸','泰国','马来西亚','文莱','新加坡','印度尼西亚','东帝汶','尼泊尔','不丹','孟加拉国','印度','巴基斯坦','斯里兰卡','马尔代夫','哈萨克斯坦','吉尔吉斯斯坦','塔吉克斯坦','乌兹别克斯坦','土库曼斯坦','阿富汗','伊拉克','伊朗','叙利亚','约旦','黎巴嫩','以色列','巴勒斯坦','沙特阿拉伯','巴林','卡塔尔','科威特','阿拉伯联合酋长国（阿联酋）','阿曼','也门','格鲁吉亚','亚美尼亚','阿塞拜疆','土耳其','塞浦路斯']},
        {groupName:'欧洲',dataList:['芬兰','瑞典','挪威','冰岛','丹麦 ','法罗群岛','爱沙尼亚','拉脱维亚','立陶宛','白俄罗斯','俄罗斯','乌克兰','摩尔多瓦','波兰','捷克','斯洛伐克','匈牙利','德国','奥地利','瑞士','列支敦士登','英国','爱尔兰','荷兰','比利时','卢森堡','法国','摩纳哥','罗马尼亚','保加利亚','塞尔维亚','马其顿','阿尔巴尼亚','希腊','斯洛文尼亚','克罗地亚','黑山','马耳他','波斯尼亚和黑塞哥维那 ','意大利','梵蒂冈','圣马力诺','西班牙','葡萄牙','安道尔','直布罗陀']},
        {groupName:'非洲',dataList:['埃及','利比亚','突尼斯','阿尔及利亚','摩洛哥','亚速尔群岛（葡）','马德拉群岛（葡）','苏丹','南苏丹','埃塞俄比亚','厄立特里亚','索马里','吉布提','肯尼亚','坦桑尼亚','乌干达','卢旺达','布隆迪','塞舌尔','乍得','中非','喀麦隆','赤道几内亚','加蓬','刚果共和国（刚果（布））','刚果民主共和国 （刚果（金））','圣多美和普林西比','毛里塔尼亚','西撒哈拉（非独立国家）','塞内加尔','冈比亚','马里','布基纳法索','几内亚','几内亚比绍','佛得角','塞拉利昂','利比里亚','科特迪瓦','加纳','多哥','贝宁','尼日尔','加那利群岛（西）','尼日利亚','赞比亚','安哥拉','津巴布韦','马拉维','莫桑比克','博茨瓦纳','纳米比亚','南非','斯威士兰','莱索托','马达加斯加','科摩罗','毛里求斯','留尼汪岛（法）','圣赫勒拿岛（英）']},
        {groupName:'北美洲',dataList:['加拿大','美国','墨西哥','格陵兰（丹）','圣皮埃尔和密克隆（法）','危地马拉','伯利兹','萨尔瓦多','洪都拉斯','尼加拉瓜','哥斯达黎加','巴拿马','巴哈马','古巴','牙买加','海地','多米尼加共和国','安提瓜和巴布达','圣基茨和尼维斯','多米尼克','圣卢西亚','圣文森特和格林纳丁斯','格林纳达','巴巴多斯','特立尼达和多巴哥','波多黎各（美）','英属维尔京群岛','美属维尔京群岛','安圭拉（英）','蒙特塞拉特（英）','瓜德罗普（法）','马提尼克（法）','阿鲁巴（荷）','库拉索（荷）','荷属圣马丁','特克斯和凯科斯群岛（英）','开曼群岛（英）','百慕大群岛（英）']},
        {groupName:'南美洲',dataList:['哥伦比亚','委内瑞拉','圭亚那','法属圭亚那','苏里南','厄瓜多尔','秘鲁','玻利维亚','巴西','智利','阿根廷','乌拉圭','巴拉圭']},
        {groupName:'大洋洲',dataList:['澳大利亚','新西兰','帕劳','密克罗尼西亚联邦','马绍尔群岛','基里巴斯','瑙鲁','北马里亚纳（美）','关岛（美）','巴布亚新几内亚','所罗门群岛','瓦努阿图','斐济群岛','新喀里多尼亚（法）','图瓦卢','萨摩亚','汤加','','库克群岛（新）','纽埃（新）','托克劳（新）','法属波利尼西亚','瓦利斯和富图纳（法）','皮特凯恩群岛（英）','美属萨摩亚']}
    ]