/*
 * @Author: Paco
 * @Date:   2017-03-12
 * @lastModify 2017-05-08
 * +----------------------------------------------------------------------
 * | jqadmin [ jq酷打造的一款懒人后台模板 ]
 * | Copyright (c) 2017 http://jqadmin.jqcool.net All rights reserved.
 * | Licensed ( http://jqadmin.jqcool.net/licenses/ )
 * | Author: Paco <admin@jqcool.net>
 * +----------------------------------------------------------------------
 */

layui.define(['jquery', 'laytpl', 'layer', 'jqelem', 'tabmenu'], function (exports) {
	var $       = layui.jquery,
		tpl     = layui.laytpl,
		element = layui.jqelem,
		layer   = layui.layer,
		init    = true,
		tabmenu = layui.tabmenu(),
		jqmenu  = function () {
			this.options = {
				showIcon: true
			}
		};

	/**
	 *@todo 初始化数据
	 */
	jqmenu.prototype.init = function () {
		var _this = this;
		_this.openOldMenu();
		_this.resize();
		_this.menuBind();
		element.init();
		//加载默认tab
		tabmenu.effect(0);
		if ($('iframe[data-id=0]').length > 0) {
			$('iframe[data-id=0]').attr('src', $('[lay-id=0]').find('em').data('href'));
		}
	}

	/**
	 * 将tabmenu类附到jqmenu上，方法tab的接口调用与重写
	 */
	jqmenu.prototype.tabmenu = tabmenu;

	/**
	 *@todo 自适应窗口
	 */
	jqmenu.prototype.resize = function () {
		$(window).on('resize', function () {
			tabmenu.init();
			tabmenu.tabMove(0, 1);
		}).resize();
	}

	/**
	 *@todo 初始化菜单
	 */
	jqmenu.prototype.menuBind = function () {
		var _this = this;
		//初始化时显示第一个菜单

		$('.sub-menu').eq(0).slideDown();
		$('#menu li').removeClass("layui-this").eq(0).addClass("layui-this");

		//绑定左侧树菜单的单击事件
		$('.sub-menu .layui-nav-item,.tab-menu,.menu-list li').bind("click", function () {
			var obj = $(this);
			$('.menu-list').slideUp();
			$('.tab-move-btn').removeClass('open').find('i').html("&#xe604;");

			if (obj.find('dl').length <= 0) {
				_this.menuSetOption(obj);
			}
		}).find('dd').bind("click", function () {
			_this.menuSetOption($(this));
		});

		//绑定主菜单单击事件，点击时显示相应的菜单
		element.on('nav(main-menu)', function (elem) {
			var index = (elem.index());
			$('.sub-menu').slideUp().eq(index).slideDown();
		});
		//绑定更多按钮事件
		$('.tab-move-btn').bind("click", function () {
			var show = $('.menu-list').css('display');
			if (show == "none") {
				$(this).addClass('open');
				_this.menulist();
				$('.menu-list li').bind("click", function () {
					_this.menuSetOption($(this));
				});

				$('.menu-list').slideDown('fast');
				$(this).find('i').html("&#xe603;");
			} else {
				$(this).removeClass('open');
				$('.menu-list').slideUp('fast');
				$(this).find('i').html("&#xe604;");
			}
		});

		//禁止双击选中
		$('span.move-left-btn,span.move-right-btn').bind("selectstart", function () {
			return false;
		});
	};

	/**
	 *@todo 设置菜单项
	 */
	jqmenu.prototype.menuSetOption = function (obj) {
		var $a    = obj.children('a'),
			href  = $a.data('url'),
			icon  = $a.children('i:first').data('icon') || '&#xe621;',
			title = $a.data('title'),
			data  = {
				href : href,
				icon : icon,
				title: title
			}
		this.menuOpen(data);
	}

	/**
	 *@todo 打开菜单项
	 */
	jqmenu.prototype.menuOpen = function (data) {
		tabmenu.tabAdd(data, this.options.fresh);
	}
	/**
	 * 刷新后打开原打开的菜单
	 */
	jqmenu.prototype.openOldMenu = function () {
		element.on('tab(tabmenu)', function () {
			var layId = $(this).attr("lay-id");

			$('.menu-list').slideUp();
			$('.tab-move-btn').removeClass('open').find('i').html("&#xe604;");
			var data = {
				layId: layId
			}
			if (!init) {
				tabmenu.storage(data, "change");
			}

			if ($(this).attr("fresh")) {
				$(this).removeAttr("fresh");
				tabmenu.fresh(layId);
			}

		});
		let sStorage = window.sessionStorage;
		let explorer = navigator.userAgent;
		if (sStorage.menu) {
			var menulist = sStorage.menu;
			menulist     = menulist.split("|");
			for (index in menulist) {
				if (index == "remove") {
					continue;
				}
				if (typeof menulist[index] === 'string') {
					var menu = JSON.parse(menulist[index]);

				}

				menu.nodo = true;

				if (explorer.indexOf("Firefox") >= 0) {
					menu.old = true;
				}
				this.menuOpen(menu);
			}
		}
		if (sStorage.curMenu && sStorage.curMenu !== "undefined") {
			var menu = sStorage.curMenu;
			if (typeof menu === 'string') {
				menu = JSON.parse(menu);
			}
			if (explorer.indexOf("Firefox") >= 0) {
				menu.old = true;
			}
			this.menuOpen(menu);
		}
		init = false;
	};
	jqmenu.prototype.menulist = function () {

		var storage  = window.sessionStorage,
			menulist = storage.menu;
		if (menulist) {
			var menulist = menulist.split("|"),
				list     = [],
				data     = {};

			for (index in menulist) {
				if (index == "remove") {
					continue;
				}
				if (typeof menulist[index] === 'string') {
					var menu = JSON.parse(menulist[index])
				}

				list.push(menu);
			}
			data.list = list;
			if ("" != data || undefined != data) {
				var getTpl = $('#menu-list-tpl').html();
				tpl(getTpl).render(data, function (html) {
					$('#menu-list').html(html);
				})
			}
		}
	}

	jqmenu.prototype.menuShowType = function () {
		var oHtml = document.documentElement;
		var screenWidth = oHtml.clientWidth;
		if (window.localStorage) {
			var storage  = window.localStorage,
				showType = storage.getItem("showType");

			if ($('body').hasClass('left-off')) {
				showType = 0;
			}else{
				showType = 1;
			}
		}

		var bar      = $('.jqamdin-left-bar'),
			_this    = this,
			showIcon = $(".menu-type").find("i"),
			minWidth = 50,

			maxWidth = 200;
		if (!_this.options.showIcon) {
			maxWidth = 160;
		}
		switch (parseInt(showType)) {
			case 1:
				$('#submenu').find("ul li").children("a").each(function () {
					$(this).addClass('nav-collapse');
					if (!$(this).find("em").hasClass("layui-nav-more")) {
						$(this).css("padding-left", "14px");
					}
				})
				$('body').addClass('left-off');
				$('#submenu').find("ul li").find("a").on('mouseenter', function () {
					layer.tips($(this).data("title"), $(this));
				});
				$('#submenu').find("ul li").find("a").on('mouseleave', function () {
					layer.tips();
				});

				if (!_this.options.showIcon) {
					$('#submenu').find('i').removeClass("hide-icon");
				}
				showIcon.html('&#xe683;');
				break;
			default:
				if (screenWidth<750) {
					$('body').removeClass('left-off');
					$('body').removeClass('left-miss');
					$('#submenu').find("ul li").find("a").off('mouseenter');
					showIcon.html('&#xe61a;');
				}else{
					$('#submenu').find("ul li").find("a").off('mouseenter');
					$('body').removeClass('left-off');
					showIcon.html('&#xe61a;');
				
				}
		}
	}
	function getSize() {
		var showIcon = $(".menu-type").find("i"),
			oHtml = document.documentElement;
		var screenWidth = oHtml.clientWidth;
		if (screenWidth<750) {
			$('body').addClass('left-miss left-off');
			$('.jqadmin-main-menu .layui-nav .layui-nav-item a span').hide();
			$('#submenu').find("ul li").find("a").off('mouseenter');
			$('.layui-header .header-right .right-menu').hide();
		}else if (screenWidth < 970) {
			$('.jqadmin-main-menu .layui-nav .layui-nav-item a span').hide();
			$('.layui-header .header-right .right-menu').show();
			$('body').removeClass('left-miss');
			$('body').addClass('left-off');
			$('#submenu').find("ul li").children("a").each(function () {
				$(this).addClass('nav-collapse');
				if (!$(this).find("em").hasClass("layui-nav-more")) {
					$(this).css("padding-left", "14px");
				}
			})
			$('#submenu').find("ul li").find("a").on('mouseenter', function () {
				layer.tips($(this).data("title"), $(this));
			});
			$('#submenu').find("ul li").find("a").on('mouseleave', function () {
				layer.tips();
			});

			showIcon.html('&#xe683;');

		} else {
			$('.jqadmin-main-menu .layui-nav .layui-nav-item a span').show();
			$('.layui-header .header-right .right-menu').show();
			$('body').removeClass('left-off');
			$('#submenu').find("ul li").find("a").off('mouseenter');
			showIcon.html('&#xe61a;');
		}
	}
	window.onresize = getSize;
	getSize();

	exports('jqmenu', jqmenu);
});