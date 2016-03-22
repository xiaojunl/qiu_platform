$(function() {
	//表格中的全选效果
	/*$(".check-all").on("ifChecked", function() {
	 var $ck = $(this).parents(".table").find("input[type='checkbox']");
	 $ck.iCheck("check");
	 });
	 $(".check-all").on("ifUnchecked", function() {
	 var $ck = $(this).parents(".table").find("input[type='checkbox']");
	 $ck.iCheck("uncheck");
	 });*/
	//初始化iCheck
	/*$('input[type="checkbox"], input[type="radio"]').iCheck({
	 checkboxClass: 'icheckbox_minimal-blue',
	 radioClass: 'iradio_minimal-blue'
	 });*/
	//全选
	$(".content").on("click", ".check-all", function() {
		var $ck = $(this).parents(".table").find("input[type='checkbox']");
		if($(this).is(":checked")) {
			$ck.prop("checked", true);
		}else {
			$ck.prop("checked", false);
		}
	});

	//切换左侧菜单高亮显示
	$(".treeview-menu").on("click", "a", function() {
		$(".treeview-menu .active").removeClass("active");
		$(this).parent().addClass("active");
	});

	//点击页面空白区域，隐藏右侧栏
	$(".content-wrapper").on("click", function() {
		$(".control-sidebar-open").removeClass("control-sidebar-open");
	});

	//切换皮肤
	var skinArr = [
		"skin-blue",
		"skin-red",
		"skin-green",
		"skin-yellow",
		"skin-pruple",
		"skin-blue-light",
		"skin-red-light",
		"skin-green-light",
		"skin-yellow-light",
		"skin-purple-light"
	];
	$("#skinLinks").on("click", ".skin-link", function(e) {
		e.preventDefault();
		if(!$(this).hasClass("active")) {
			$(".skin-link").removeClass("active");
			$(this).addClass("active");

			var skinCls = $(this).data("skin");
			$.each(skinArr, function(i) {
				$("body").removeClass(skinArr[i]);
			});
			$("body").addClass(skinCls);
		}
	});
	if(localStorage){
		$('#skinLinks a.skin-link').on('click',function(){
			localStorage.body_skin = $(this).data('skin')
		});
		if(localStorage.body_skin){
			$('a.skin-link').removeClass('active');
			$('a.skin-link[data-skin="'+localStorage.body_skin+'"]').addClass('active');
			$('body').attr('class','fixed sidebar-mini '+localStorage.body_skin);
		}else{
			$('body').attr('class','fixed sidebar-mini skin-blue-light');
		}
	}else{
		$('body').attr('class','fixed sidebar-mini skin-blue-light');
	}

	$.extend({
		date:function (time) {
			var date = new Date();
			if(!isNaN(time)){
				var str = time + '';
				if(str.length==10){
					str += '000';
				}
				if(str.length==13){
					date = new Date(parseInt(str));
				}
			}
			//var date = !isNaN(time) ? new Date(parseInt(time)) : new Date();
			var o = {
				"M+": date.getMonth() + 1, //月份
				"d+": date.getDate(), //日
				"h+": date.getHours(), //小时
				"m+": date.getMinutes(), //分
				"s+": date.getSeconds(), //秒
				"q+": Math.floor((date.getMonth() + 3) / 3), //季度
				"S": date.getMilliseconds() //毫秒
			};
			var fmt = 'yyyy-MM-dd hh:mm:ss';
			if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
			for (var k in o)
				if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
			return fmt;
		}
	})
});
