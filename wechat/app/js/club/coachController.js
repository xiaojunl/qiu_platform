/**
 * Created by admin on 2015/9/28.
 */

wechatApp.controller('coachListCtrl', ['$scope','$http','$controller','$routeParams',
    function($scope,$http,$controller,$routeParams) {


        var parentCtrl = $controller('baseCtrl', {$scope: $scope,$http:$http});
        $scope.imgServerPath=GlobalConstant.imgServerPath;
        $scope.clubId=$routeParams.clubId;

        $scope.loadCoachList=function(oId){
            var interfaceName="/club/"+ $scope.clubId;
            var params={id: $scope.clubId};
            if(oId!=null&&oId!=""){
                params["oId"]=oId;
            }
            $scope.getApi(interfaceName,params,function(data,status){
                if(oId!=null&&oId!=""){
                    $scope.coachList = $scope.coachList.concat(data.coaches);//将最新查询的结果拷贝到之前的数组里面
                }else{
                    $scope.coachList = data.coaches;
                }
                $scope.hasMore=false;//是否还有更多数据(true表示有)
            });
        }

        /**
         * 加载更多
         */
        $scope.loadMoreCoache=function(){
            if($scope.hasMore==false){
                return;
            }
            var lastId="";
            if($scope.coachList.length>0){
                lastId=$scope.coachList[$scope.coachList.length-1]._id;//最后一条数据的id
            }
            $scope.loadCoachList(lastId);
        }

        $scope.loadCoachList();
    }
]);