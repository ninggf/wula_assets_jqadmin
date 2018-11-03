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
	var $         = layui.jquery,
		tpl       = layui.laytpl,
		element   = layui.jqelem,
		layer     = layui.layer,
		init      = true,
		cloneTemp = false,
		tabmenu   = layui.tabmenu(),
		jqmenu    = function () {
			this.options = {
				showIcon: true
			}
		};

	jqmenu.prototype.init = function () {
		var _this = this;
		_this.resize();
		_this.menuBind();
		_this.openOldMenu();
		element.init();
		if ($('iframe[data-id=0]').length > 0) {
			$('iframe[data-id=0]').attr('src', $('[lay-id=0]').find('em').data('href'));
		}
		$('.layui-tab-content').prepend('<div class="coverBox"></div>');
	};

	/**
	 * 将tabmenu类附到jqmenu上，方法tab的接口调用与重写
	 */
	jqmenu.prototype.tabmenu = tabmenu;
	window.jqTabmenu = tabmenu;
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
		var _this = this, mm = $('#menu'),leftSub = $('#submenu').find("ul li");
		//初始化时显示第一个菜单
		mm.find('a').on('mouseenter', function () {
			layer.tips($(this).data("title"), $(this), {
				tips: 3
			});
		}).on('mouseleave', function () {
			layer.closeAll('tips')
		});
		if($('body').hasClass('left-off')){
			leftSub.on('mouseenter', function () {
				if($(this).find('dl').length > 0){
					$(this).addClass('layui-nav-itemed');
					layer.closeAll('tips');
				}else{
					layer.tips($(this).children('a').data("title"), $(this));
				}
			}).on('mouseleave', function () {
				
				layer.closeAll('tips');
				$(this).removeClass('layui-nav-itemed');
			});
		}else{
			leftSub.off('mouseenter').off('mouseleave');
		}
		$('.layui-tab-content').on('click','.coverBox',function(){
			$(this).hide();
			$('.tab-move-btn').removeClass('open').find('i').html("&#xe604;");
			$('.menu-list').slideUp('fast');
			$('.jqadmin-auxiliary-btn').removeClass('xz');
			$('.minWidth .jqadmin-main-menu').slideUp();
			$('.left-off .layui-nav-itemed').removeClass('layui-nav-itemed');
			$('#submenu').find("ul li").find("a").on('mouseenter', function () {
				layer.tips($(this).data("title"), $(this));
			});
			$('#submenu').find("ul li").find("a").on('mouseleave', function () {
				layer.closeAll('tips');
			});
		})
		//绑定左侧树菜单的单击事件
		$('.sub-menu .layui-nav-item,.tab-menu,.menu-list li').bind("click", function () {
			
			var obj = $(this);
			obj.siblings('li').removeClass('layui-nav-itemed');
			layer.closeAll('tips');
			$('.menu-list').slideUp();
			$('.tab-move-btn').removeClass('open').find('i').html("&#xe604;");
			if (obj.find('dl').length <= 0) {
				_this.menuSetOption(obj);
			}else{
				if(obj.hasClass('layui-nav-itemed')){
					obj.find("a").off('mouseenter').removeClass('nav-collapse');
					// if($('body').hasClass('left-off')){
					// 	$('.coverBox').show();
					// }
				}else{
					$('.coverBox').hide();
					obj.find("a").on('mouseenter', function () {
						layer.tips($(this).data("title"), $(this));
					});
					obj.find("a").on('mouseleave', function () {
						layer.closeAll('tips');
					});
				}
			}
		}).find('dd').bind("click", function () {
			
			_this.menuSetOption($(this));
		});

		//绑定主菜单单击事件，点击时显示相应的菜单
		element.on('nav(main-menu)', function (elem) {
			$('.left-off .jqamdin-left-bar .layui-nav-itemed').removeClass('layui-nav-itemed');
			var index = elem.index();
			if ((elem[0].className).indexOf('tab-menu') != -1) {
				return;
			}
			var cmenu       = $('#submenu .sub-menu').eq(index), sStorage = window.sessionStorage || {};
			sStorage.menuId = cmenu.find('ul').data('formenu');
			if (cmenu.is(':visible')) {
				return;
			}
			$('#submenu .sub-menu').hide();
			cmenu.show();
		});
		//绑定更多按钮事件
		$('.tab-move-btn').bind("click", function () {
			var show = $('.menu-list').css('display');
			$('.jqadmin-auxiliary-btn').removeClass('xz');
			$('.minWidth .jqadmin-main-menu').slideUp();
			if (show == "none") {
				$(this).addClass('open');
				$('.coverBox').show();
				$('.coverBox').show();
				_this.menulist();
				$('.menu-list li').bind("click", function () {
					_this.menuSetOption($(this));
				});

				$('.menu-list').slideDown('fast');
				$(this).find('i').html("&#xe603;");
			} else {
				$(this).removeClass('open');
				$('.coverBox').hide();
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
				cls  : $a.children('i:first').get(0).className,
				title: title
			};
		this.menuOpen(data);
	};

	/**
	 *@todo 打开菜单项
	 */
	jqmenu.prototype.menuOpen = function (data, active) {
		tabmenu.tabAdd(data, this.options.fresh, active);
	};
	/**
	 * 刷新后打开原打开的菜单
	 */
	jqmenu.prototype.openOldMenu = function () {
		var sStorage = window.sessionStorage || {}, ctab = 0, _this = this;
		element.on('tab(tabmenu)', function (e) {
			var layId = $(this).attr("lay-id");
			$('.menu-list').slideUp();
			$('.tab-move-btn').removeClass('open').find('i').html("&#xe604;");
			var data = {
				layId: layId
			};
			if (!init && layId) {
				tabmenu.storage(data, "change");
			}
			if (e && e.this) {
				sStorage.cTabIdx = $(e.this).attr('lay-id');
				if (sStorage.cTabIdx) {
					_this.sw($(e.this));
				}
			}
		});

		if (sStorage.menu) {
			var menulist = sStorage.menu, menu;
			menulist     = menulist.split("<-!->");
			for (index in menulist) {
				if (index == "remove") {
					continue;
				}
				if (typeof menulist[index] === 'string') {
					menu = JSON.parse(menulist[index]);
				}
				if (!menu) {
					continue;
				}
				menu.nodo = true;
				if (sStorage.cTabIdx == menu.layId) {
					this.menuOpen(menu, true);
					ctab++;
				} else {
					this.menuOpen(menu, false)
				}
			}
		}
		if (ctab === 0) {
			this.sw(false);
		}
		init = false;
	};
	jqmenu.prototype.sw       = function (data) {
		var sStorage = window.sessionStorage || {}, menuId;
		if (!data) {
			menuId = sStorage.menuId;
		} else {
			var url = data.find('em').data('href');
			if (url) {
				var li = $('#submenu').find('a[data-url="' + url + '"]');
				if (li.length > 0) {
					$('.left-off .layui-nav-itemed').removeClass('layui-nav-itemed')
					var subm = li.closest('ul.layui-nav');
					subm.find('.layui-this').removeClass('layui-this');
					var mp = li.parent();
					mp.addClass('layui-this');
					if (mp.is('dd')) {
						// mp.closest('li').addClass('layui-nav-itemed');
					}
					menuId = subm.data('formenu');
				}
			}
		}
		if (menuId) {
			$('#' + menuId).click();
		} else if (sStorage.menuId) {
			$('#' + sStorage.menuId).click();
		} else {
			$('#menu li:first').click();
		}
	};
	jqmenu.prototype.menulist = function () {
		var storage  = window.sessionStorage || {},
			menulist = storage.menu;
		if (menulist) {
			var menulist = menulist.split("<-!->"),
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
	};

	jqmenu.prototype.menuShowType = function (type) {
		var oHtml       = document.documentElement;
		var screenWidth = oHtml.clientWidth, showType = 0;
		if (type == 'close') {
			showType = 1;
		}
		if (type != 'open' && type != 'close' && window.localStorage) {
			var storage = window.localStorage;
			showType    = storage.getItem("showType");

			if ($('body').hasClass('left-off')) {
				showType = 0;
			} else {
				showType = 1;
			}
		}
		var _this    = this,
			showIcon = $(".menu-type").find("i");

		switch (parseInt(showType)) {
			case 1:
				$('.layui-nav-tree .layui-nav-item').removeClass('layui-nav-itemed');
				var subm = $('#submenu').find("ul li");
				subm.children("a").each(function () {
					$(this).addClass('nav-collapse');
				});
				
				$('body').addClass('left-off').removeClass('left-miss');
				subm.on('mouseenter', function () {
					if($(this).find('dl').length > 0){
						$(this).addClass('layui-nav-itemed');
						layer.closeAll('tips');
					}else{
						layer.tips($(this).children('a').data("title"), $(this));
					}
				}).on('mouseleave', function () {
					
					layer.closeAll('tips');
					$(this).removeClass('layui-nav-itemed');
				});

				

				if (!_this.options.showIcon) {
					$('#submenu').find('i').removeClass("hide-icon");
				}
				showIcon.html('&#xe66b;');
				break;
			default:
				$('#submenu').find("ul li").off('mouseenter').off('mouseleave');
				$('#submenu').find("ul li").find("a").off('mouseenter').removeClass('nav-collapse');
				$('body').removeClass('left-off');
				if (screenWidth < 750) {
					$('body').removeClass('left-miss');
					showIcon.html('&#xe668;');
				} else {
					showIcon.html('&#xe668;');
				}
		}
	};

	function getSize() {
		var showIcon    = $(".menu-type").find("i").removeClass('iconfont').addClass('layui-icon');
			oHtml       = document.documentElement,
			leftSub = $('#submenu').find("ul li")
		var screenWidth = oHtml.clientWidth;
		if (screenWidth < 750) {
			$('.jqadmin-main-menu').hide();
			$('body').addClass('left-miss left-off minWidth');
			$('.jqadmin-main-menu .layui-nav .layui-nav-item a span').show();
			$('#submenu').find("ul li").find("a").off('mouseenter');
			$('.layui-header .header-right .right-menu').hide();
		} else if (screenWidth < 970) {
			$('.layui-nav-itemed').removeClass('layui-nav-itemed');
			$('.jqadmin-main-menu').show();
			$('.jqadmin-main-menu .layui-nav .layui-nav-item a span').hide();
			$('.layui-header .header-right .right-menu').show();
			$('body').removeClass('left-miss minWidth');
			$('body').addClass('left-off');
			$('#submenu').find("ul li").children("a").each(function () {
				$(this).addClass('nav-collapse');
			})
			$('#submenu').find("ul li").find("a").on('mouseenter', function () {
				if($(this).siblings('dl').length<0){
					layer.tips($(this).data("title"), $(this));
				}else{
					layer.closeAll('tips');
				}
			});
			$('#submenu').find("ul li").find("a").on('mouseleave', function () {
				layer.closeAll('tips');
			});
			

			showIcon.html('&#xe66b;');
			$('.jqadmin-main-menu .cloneDom').remove();
			cloneTemp = false;
		} else {
			$('.jqadmin-main-menu').show();
			$('.jqadmin-main-menu .layui-nav .layui-nav-item a span').show();
			$('.layui-header .header-right .right-menu').show();
			$('body').removeClass('left-off minWidth left-miss');
			$('#submenu').find("ul li").find("a").off('mouseenter').removeClass('nav-collapse');
			showIcon.html('&#xe668;');
			$('.jqadmin-main-menu .cloneDom').remove();
			cloneTemp = false;
		}
		if($('body').hasClass('left-off')){
			leftSub.on('mouseenter', function () {
				if($(this).find('dl').length > 0){
					$(this).addClass('layui-nav-itemed');
					layer.closeAll('tips');
				}else{
					layer.tips($(this).children('a').data("title"), $(this));
				}
			}).on('mouseleave', function () {
				
				layer.closeAll('tips');
				$(this).removeClass('layui-nav-itemed');
			});
		}else{
			leftSub.off('mouseenter').off('mouseleave');
		}
	}

	window.onresize = getSize;
	getSize();
	// 移动端点击左上角下拉菜单
	$('.minWidth li.first').click(function () {
		$('.minWidth #menu .head-nav-item').removeClass('layui-this');
		$('#menu li.first dl').removeClass('layui-show');
		$(this).siblings('.first').find('dl').hide();
		$(this).find('span').toggleClass('layui-nav-mored');
		$(this).find('dl').toggle();
	});
	$('.jqadmin-auxiliary-btn').click(function () {
		$(this).toggleClass('xz');
		$('.tab-move-btn').removeClass('open').find('i').html("&#xe604;");
		$('.menu-list').slideUp('fast');
		$('.coverBox').show();
		if (!cloneTemp) {
			var cloneItems = $('.minWidth .layui-header .header-right .right-menu li').clone(true);
			$('.minWidth .layui-header .header-right .right-menu').hide();
			cloneItems.appendTo('#menu');
		}
		$('.minWidth .jqadmin-main-menu').slideToggle();

		cloneTemp = true;
	});

	$('.minWidth .first dd').click(function () {
		$('.minWidth .jqadmin-main-menu').slideUp();
	});
	$('.minWidth .head-nav-item').click(function () {
		$('.minWidth .jqadmin-main-menu').slideUp();
		top.global.menu.menuShowType('open');
	});
	$('.minWidth .tab-menu').unbind('click').click(function () {
		$('.minWidth .jqadmin-main-menu').slideUp();
	});
	// 移动端下拉菜单功能调整
	exports('jqmenu', jqmenu);
});