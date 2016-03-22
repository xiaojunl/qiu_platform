'use strict';

/**
 * 过滤器
 * Created by admin on 2015/9/13.
 */
var platFilters = angular.module('platFilters', []);

/**
 * 状态标志位渲染
 */
platFilters.filter('renderFlag', function() {
  return function(input) {
    if(input==0){
      return "启用";
    }else{
      return "停用";
    }
  };
});


/**
 * 性别标志位渲染
 */
platFilters.filter('sexFlag', function() {
  return function(input) {
    if(input==1){
      return "男";
    }else if(input==2){
      return "女";
    }else{
      return "未知";
    }
  };
});



platFilters.filter('spacePriceFlg', function() {
  return function(input) {
    if(input==0){
      return "不包含";
    }else{
      return "包含";
    }
  };
});


//订单状态
platFilters.filter('orderStatusFlag', function() {
  return function(input) {
    if(input==0){
      return "未付款";
    }else if(input==1){
      return "已支付";
    }else if(input==2){
      return "商家已接单";
    }else if(input==3){
      return "交易成功";
    }else if(input==4){
      return "用户取消订单";
    }else if(input==5){
      return "商家取消订单";
    }else if(input==6){
      return "2小时未付款自动关闭或已过期";
    }else if(input==7){
      return "退款中";
    }else if(input==8){
      return "已退款";
    }else{
      return input;
    }
  };
});

//预订时间段渲染
platFilters.filter('timeRender', function() {
  return function(input) {
    var begin=input.split(":")[0];
    var end=parseInt(begin)+1;
    var endStr=end+":00";
    if(end<10){
      endStr="0"+end+":00";
    }
    return input+"-"+endStr;
  };
});

//付款方式
platFilters.filter('paymentRender', function() {
  return function(input) {
    if(input==1){
      return "微信支付";
    }else if(input==2){
      return "支付宝";
    }else{
      return "还未支付";
    }
  };
});

//将长整型的日期格式转换为yyyy-MM-dd hh:MM
platFilters.filter('longDateTimeRender', function() {
  return function(input) {
    if(input==""){
      return "";
    }
    return new Date(input).format("yyyy-MM-dd hh:mm:ss");
  };
});


//距离格式化
platFilters.filter('disRender', function() {
  return function(input) {
    if(input<1){
      var dis=Number(input)*1000;
      if(dis<100){
        return "小于100m";
      }else{
        return dis+"m";
      }
    }else{
      return Number(input).toFixed(1)+"km";
    }
  };
});