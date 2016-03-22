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
    if(input==0){
      return "男";
    }else{
      return "女";
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
      return "等待接单";
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

//将长整型的日期格式转换为yyyy-MM-dd hh:MM
platFilters.filter('longDateTimeRender', function() {
  return function(input) {
    if(input==null||input==""){
      return "";
    }
    return new Date(input).format("yyyy-MM-dd hh:mm:ss");
  };
});



platFilters.filter('regTypeCount', function () {
  return function (input, type) {
    var count = 0;
    for (var i = 0; i < input.length; i++) {
      if (input[i].typeId == type) {
        count = input[i].count;
        break;
      }
    }
    return count;
  };
});

platFilters.filter('regTypePrice', function () {
  return function (input, type) {
    var count = 0;
    for (var i = 0; i < input.length; i++) {
      if (input[i].typeId == type) {
        count = input[i].price.toFixed(2);
        break;
      }
    }
    return count;
  };
});

var cjCount = 0;
var cjPrice = 0;
platFilters.filter('sumRegTypeCount', function () {
  return function (input, type) {
    var sum = '';
    if (input) {
      sum = 0;
      for (var i = 0; i < input.length; i++) {
        var count = 0;
        var regTypes = input[i].types;
        for (var j = 0; j < regTypes.length; j++) {
          if (regTypes[j].typeId == type) {
            count = regTypes[j].count;
          }
        }
        sum =Number(sum) +Number(count);
      }
    }
    if (type === 3) {
      cjCount = sum;
    }
    return sum;
  };
});

platFilters.filter('sumRegTypePrice', function () {
  return function (input, type) {
    var sum = '';
    if (input) {
      sum = 0;
      for (var i = 0; i < input.length; i++) {
        var count = 0;
        var regTypes = input[i].types;
        for (var j = 0; j < regTypes.length; j++) {
          if (regTypes[j].typeId == type) {
            count = regTypes[j].price.toFixed(2);
            break;
          }
        }
        sum =Number(sum)+ Number(count);
      }
    }
    if (type === 3) {
      cjPrice = sum;
    }
    return sum;
  };
});

// 总成交单均价
platFilters.filter('cjAvgPrice', function () {
  return function (input) {
    var sumPrice = 0;
    var sumCount=0;
    for (var i = 0; i < input.length; i++) {
      var count = 0;
      var price=0;
      var regTypes = input[i].types;
      for (var j = 0; j < regTypes.length; j++) {
        if (regTypes[j].typeId == 3) {
          count = regTypes[j].count;
          price = regTypes[j].price.toFixed(2);
          sumPrice =Number(sumPrice)+ Number(price);
          sumCount =Number(sumCount)+ Number(count);
        }
      }
    }
    return (sumPrice / sumCount).toFixed(2);
  };
});

// 当天成交单均价
platFilters.filter('dcjAvgPrice', function () {
  return function (input, type) {
    var count = 0;
    for (var i = 0; i < input.length; i++) {
      if (input[i].typeId == type) {
        count = (input[i].price / input[i].count).toFixed(2);
        break;
      }
    }
    return count;
  };
});




platFilters.filter('sendTypeRender', function() {
  return function(input) {
    if(input==1){
      return "手机短信";
    }else if(input==2){
      return "APP消息";
    }else if(input==3){
      return "站内消息";
    }else{
      return input;
    }
  };
});

platFilters.filter('sendObjRender', function() {
  return function(input) {
    if(input==1){
      return "亲爱的用户";
    }else if(input==2){
      return "场馆方";
    }else if(input==3){
      return "俱乐部";
    }else{
      return input;
    }
  };
});

platFilters.filter('bannerTypeRender', function() {
  return function(input) {
    if(input==1){
      return "操作页";
    }else if(input==2){
      return "html网页";
    }else if(input==3){
      return "无详情页";
    }else{
      return input;
    }
  };
});

/**
 * 约战状态
 */
platFilters.filter('arrangeStatusFlg', function() {
  return function(input) {
    if(input==0){
      return "取消约战";
    }else if(input==1){
      return "报名中";
    }else if(input==2){
      return "已结束";
    }else{
      return input;
    }
  };
});


/**
 * 活动状态
 */
platFilters.filter('activityStatusFlg', function() {
  return function(input) {
    if(input==0){
      return "未开始";
    }else if(input==1){
      return "进行中";
    }else if(input==2){
      return "已结束";
    }else{
      return input;
    }
  };
});


/**
 * 商城订单状态
 */
platFilters.filter('goodsOrderStatusFlg', function() {
  return function(input) {
    if(input==0){
      return "未付款";
    }else if(input==1){
      return "已付款";
    }else if(input==2){
      return "已发货";
    }else if(input==3){
      return "交易成功";
    }else if(input==4){
      return "用户取消订单";
    }else if(input==5){
      return "商家取消订单";
    }else if(input==6){
      return "超时自动关闭";
    }else if(input==7){
      return "退款中";
    }else if(input==8){
      return "已退款";
    }else if(input==9){
      return "确认收货";
    }else if(input==10){
      return "申述";
    }else{
      return input;
    }
  };
});


/**
 * 收货时间段要求
 */
platFilters.filter('deliveryTimeFlg', function() {
  return function(input) {
    if(input==1){
      return "节假日送货";
    }else if(input==2){
      return "工作日送货";
    }else if(input==3){
      return "不限";
    }else{
      return input;
    }
  };
});


/**
 * 是否标志位渲染
 */
platFilters.filter('renderIsFlag', function() {
  return function(input) {
    if(input==0){
      return "是";
    }else{
      return "否";
    }
  };
});


/**
 * 公众号类型
 */
platFilters.filter('publicMediaTypeTag', function() {
  return function(input) {
    if(input==1){
      return "赛事";
    }else if(input==2){
      return "球星";
    }else if(input==3){
      return "专题";
    }else if(input==4){
      return "自定义标签";
    }else{
      return input;
    }
  };
});

/**
 * 新闻分类
 */
platFilters.filter('newsTypeTag', function() {
  return function(input) {
    if(input==0){
      return "普通新闻";
    }else if(input==1){
      return "专题新闻";
    }else{
      return input;
    }
  };
});

/**
 * 视频类型
 */
platFilters.filter('videoTypeTag', function() {
  return function(input) {
    if(input==0){
      return "普通视频";
    }else if(input==1){
      return "直播视频";
    }else{
      return input;
    }
  };
});

/**
 * 球星排名生成方式
 */
platFilters.filter('rankingWayTypeTag', function() {
  return function(input) {
    if(input==0){
      return "手动添加";
    }else if(input==1){
      return "自动生成";
    }else{
      return input;
    }
  };
});

/**
 * 球星排名生成方式
 */
platFilters.filter('palyTypeTag', function() {
  return function(input) {
    if(input==0){
      return "单打";
    }else if(input==1){
      return "双打";
    }else{
      return input;
    }
  };
});

/**
 * 是否推荐关注
 */
platFilters.filter('recommendFlag', function() {
  return function(input) {
    if(input==1){
      return "是";
    }else{
      return "否";
    }
  };
});