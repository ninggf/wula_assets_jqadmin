layui.define(['jquery', 'jqmenu', 'layer', 'toastr'], function (exports) {
	var $        = layui.jquery,
		menu     = layui.jqmenu,
		toast    = layui.toastr,
		mainMenu = new menu(),
		jqIndex  = function () {
		};

	top.global = {
		menu : mainMenu,
		toast: toast,
		layer: layui.layer
	};

	jqIndex.prototype.init = function () {
		mainMenu.init();
		this.showMenu();
		this.refresh();
		this.themeChange();
	};

	jqIndex.prototype.refresh = function () {
		$('.fresh-btn').bind("click", function () {
			var iframe = $('.jqadmin-body .layui-show').children('iframe'), id = iframe.data('id');
			mainMenu.tabmenu.effect(id, !0);
			iframe[0].contentWindow.location.reload(true);
		})
	};

	jqIndex.prototype.showMenu = function () {
		$('.menu-type').bind("click", function () {
			if (window.localStorage) {
				var storage  = window.localStorage;
				var showType = storage.getItem("showType");
				showType     = (showType == 1) ? 2 : 1;
				storage.setItem("showType", showType);
			}
			mainMenu.menuShowType();
		})
	};

	jqIndex.prototype.themeChange = function () {
		$('dl.theme').find('a').bind("click", function () {
			var href = $(this).attr('data-href');
			$("#theme").attr("href", href);
		})
	};

	var index = new jqIndex();
	index.init();
	exports('index', index);
});