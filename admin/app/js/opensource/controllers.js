/**
 * 开放页面相关controller
 * Created by admin on 2015/9/13.
 */
var opensourceControllers = angular.module('opensourceControllers', []);

/**
 *分享页面
 */
opensourceControllers.controller('shareTestCtrl', ['$scope','$http','$controller','$routeParams','$sce',
  function($scope,$http,$controller,$routeParams,$sce) {

      var type=$routeParams.type;//1:视频;2:新闻
      var id=$routeParams.id;
      var interfaceUrlName=GlobalConstant.javaServerPath;
      if(type==1){
          interfaceUrlName=interfaceUrlName+"/mediavideo/findById.do";
      }else if(type==2){
          interfaceUrlName=interfaceUrlName+"/medianew/findById.do";
      }
      var params={id:id};
      $http.get(interfaceUrlName,{params:params,withCredentials:false}).success(function(data,status) {
          $scope.media=data.data;
          //$scope.htmlContent=$sce.trustAsHtml(data.data.content);
          $("#medioDiv").html(data.data.content);
          if(type==1){
              $(".playerimg").each(function(i) {
                  var $t = $(this);
                  var id = "playerdiv"+i;
                  //var styleStr = "margin:15px 0px;width:"+$t.attr("width")+"px;height:"+$t.attr("height")+"px;";
                  var styleStr = "margin:15px 0px;max-width:100%;height:"+$t.attr("height")+"px;";
                  var dataVid = $t.data("vid");
                  var htmlStr = "<div class='playerdiv' id='"+id+"' style='"+styleStr+"' data-vid='"+dataVid+"'></div>";
                  $t.replaceWith(htmlStr);
              });
              //初始化播放器
              $(".playerdiv").each(function() {
                  var $t = $(this);
                  var vId = $t.data("vid");
                  new YKU.Player($t.attr("id"), {
                      styleid: "0",
                      client_id: "1a5a3c98f8886cf6",
                      vid: vId
                  });
              });
          }

      }).error(function(data,status){
          alert("获取数据失败,error=" + angular.toJson(data)+",status="+status);
      });
  }
]);


/**
 *分享测试页面
 */
opensourceControllers.controller('shareCtrl', ['$scope','$http','$controller','$routeParams','$sce','$location',
    function($scope,$http,$controller,$routeParams,$sce,$location) {

        var type=$routeParams.type;//1:视频;2:新闻
        var id=$routeParams.id;
        var interfaceUrlName=GlobalConstant.javaServerPath;
        if(type==1){
            interfaceUrlName=interfaceUrlName+"/mediavideo/findById.do";
        }else if(type==2){
            interfaceUrlName=interfaceUrlName+"/medianew/findById.do";
        }
        var params={id:id};
        $http.get(interfaceUrlName,{params:params,withCredentials:false}).success(function(data,status) {
            $scope.media=data.data;
            //$scope.htmlContent=$sce.trustAsHtml(data.data.content);
            $("#medioDiv").html(data.data.content);
            if(type==1){
                var player;
                $(".playerimg").click(function() {
                    var $t = $(this);
                    var vId = $t.data("vid");
                    //$location.path("/show");
                    player=new YKU.Player('playerYouKu', {
                        styleid: "0",
                        client_id: "1a5a3c98f8886cf6",
                        vid: vId
                    });
                    $("html, body").css("overflow", "hidden");
                    $("#modalDiv").show();
                });

                $("#closeLink").click(function(e) {
                    e.preventDefault();
                    $("html, body").css("overflow", "auto");
                    player.pauseVideo();
                    $("#modalDiv").hide();
                });
            }

        }).error(function(data,status){
            alert("获取数据失败,error=" + angular.toJson(data)+",status="+status);
        });


    }
]);