layui.define(['jquery', 'jqelem'], function (exports) {
	var $       = layui.jquery,
		element = layui.jqelem,
		tabMenu = function () {
			this.config = {
				item    : '.jqadmin-tab-box',
				closed  : true,
				showIcon: true
			};
		},
		objTab  = {};

	/**
	 * [参数设置 options]
	 */
	tabMenu.prototype.set = function (options) {
		if (typeof(options) == 'string' && options != "") {
			this.config.item = options;
		} else if (typeof(options) == 'object') {
			$.extend(true, this.config, options);
		}
		return this;
	};
	/**
	 * 返回对象参数初始化结果
	 */
	tabMenu.prototype.init = function () {
		var _this      = this,
			config     = _this.config,
			$container = $('' + config.item + ''),
			filter     = $container.attr('lay-filter');
		if (filter === undefined || filter === '') {
			console.log('错误:请设置Tab菜单选项卡属性lay-filter过滤器');
		}

		objTab.titleBox   = $container.children('ul.layui-tab-title');
		objTab.contentBox = $container.children('div.layui-tab-content');
		objTab.tabFilter  = filter;

		return _this;
	}

	tabMenu.prototype.exited = function (data) {
		var tab_index = -1, href = data.href;
		if (objTab.titleBox === undefined) {
			this.init()
		}
		objTab.titleBox.find('li').each(function (i, e) {
			var $em = $(this).children('em');
			if ($em.data('href') === href) {
				tab_index = $(this).attr('lay-id');
			}
		});
		return tab_index;
	};
	/**
	 * 添加tab菜单选项卡
	 *@param  data [ title 菜单选项卡标题
	 ,href 菜单URL地址
	 ,icon 菜单的ICON图标
	 ,cls  class
	 ]
	 @param fresh
	 @param active
	 */
	tabMenu.prototype.tabAdd = function (data, fresh, active) {
		var tab_index = this.exited(data),
			_this     = this,
			cls       = data.cls || 'iconfont',
			isActive  = active !== false;
		data.cls      = cls;
		if (tab_index === -1) {
			var layID   = data.layId ? data.layId : new Date().getTime();
			var content = '<iframe src="' + data.href + '" data-id="' + layID + '" class="jqadmin-iframe"></iframe>';
			var title   = '';

			// 如果icon有定义则添加到标题中
			if (!_this.config.showIcon) {
				title += '<i class="' + cls + ' hide-icon">' + data.icon + '</i>';
			} else {
				title += '<i class="' + cls + '">' + data.icon + '</i>';
			}
			title += '<em data-href="' + data.href + '">' + data.title + '</em>';
			if (this.config.closed) {
				title += '<i class="layui-icon layui-unselect layui-tab-close" data-id="' + layID + '">&#9747;</i>';
			}

			//添加tab
			element.tabAdd(objTab.tabFilter, {
				title  : title,
				content: content,
				id     : layID,
				cls    : cls
			});

			//添加打开的菜单到列表,刷新打开列表时不操作数据
			if (!data.nodo) {
				data.layId = layID;
				_this.storage(data, "add");
				//页面淡出效果
			}
			if (isActive) {
				_this.effect(layID);
			}
			if (this.config.closed) {
				//监听关闭事件
				objTab.titleBox.find('li').children('i.layui-tab-close[data-id=' + layID + ']').on('click', function () {
					element.tabDelete(objTab.tabFilter, $(this).parent('li').attr('lay-id'), data.parent);
					_this.tabMove(1, 1);
					//删除数组中的对应元素
					element.init();
					_this.storage(data, "close");
				});
			}
			if (isActive) {
				this.tabMove(tab_index, 0);
				//切换到当前打开的选项卡
				element.tabChange(objTab.tabFilter, layID);
			}
		} else {
			element.tabChange(objTab.tabFilter, tab_index);
			_this.storage(data, "change");
			this.tabMove(tab_index, 0);
			if (fresh) {
				_this.fresh(tab_index);
			}
		}
	};
	tabMenu.prototype.active  = function (data) {
		var tab_index = this.exited(data);
		if (tab_index >= 0) {
			element.tabChange(objTab.tabFilter, tab_index);
			this.tabMove(tab_index, 0);
		}
	};
	tabMenu.prototype.effect  = function (layID, ischange) {
		//页面淡出效果
		var l = layer.load(2);
		if (ischange) {
			objTab.contentBox.find('iframe[data-id=' + layID + ']').css({
				"opacity"   : "0",
				"margin-top": "50px"
			}).delay(200).animate({opacity: '1', marginTop: "0"}, 200);
			layer.close(l);
		} else {
			objTab.contentBox.find('iframe[data-id=' + layID + ']').css({
				"opacity"   : "0",
				"margin-top": "50px"
			}).load(function () {
				$(this).delay(100).animate({opacity: '1', marginTop: "0"}, 200);
				layer.close(l);
			});
		}
	};
	//存储
	tabMenu.prototype.storage = function (data, action) {
		if (data.title == undefined && action != "all") {
			return false;
		}
		var storage = window.sessionStorage || {
			removeItem: function () {
			}
		};
		var _data   = JSON.stringify(data);
		if (action == "add") {
			if (storage.menu) {
				var menulist = storage.menu;
				menulist     = menulist.split("<-!->");
				menulist.remove(_data);
				menulist.push(_data);
				var menu     = menulist.join("<-!->");
				storage.menu = menu;
			} else {
				storage.menu = _data;
			}
		} else if (action == "all") {
			storage.removeItem("curMenu");
			storage.removeItem("menu");
		} else {
			//取得打开的菜单数组
			var menulist = storage.menu;
			if (!menulist) {
				return;
			}
			menulist = menulist.split("<-!->");
			if (action == "close") {
				for (index in menulist) {
					if (index == "remove") {
						continue;
					}

					if (typeof menulist[index] === 'string') {
						var menu = JSON.parse(menulist[index]);
					}
					if (menu.layId == data.layId) {
						menulist.splice(index, 1);
					}
				}
				storage.menu = menulist.join("<-!->");
				storage.removeItem("curMenu");
			} else {
				for (index in menulist) {
					if (index == "remove") {
						continue;
					}
					if (typeof menulist[index] === 'string') {
						var menu = JSON.parse(menulist[index]);
					}
					if (menu.layId == data.layId) {
						_data = menulist[index];
						break;
					}
				}
				if (action == "other") {
					storage.menu = _data;
				}
			}
		}
	};

	tabMenu.prototype.fresh  = function (index, active) {
		if (!index) {
			return;
		}
		if (active) {
			element.tabChange(objTab.tabFilter, index);
		}
		var othis   = objTab.titleBox.find('>li[lay-id="' + index + '"]'),
			index1  = othis.parent().children('li').index(othis),
			parents = othis.parents('.layui-tab').eq(0),
			item    = parents.children('.layui-tab-content').children('.layui-tab-item'),
			src     = item.eq(index1).find('iframe').attr("src");
		item.eq(index1).find('iframe').attr("src", src);
	};
	tabMenu.prototype.close  = function (location) {
		var url = location.href.substring(location.origin.length), id = this.exited({href: url});
		if (id) {
			var data = {layId: id};
			element.tabDelete(objTab.tabFilter, id);
			this.tabMove(1, 1);
			//删除数组中的对应元素
			element.init();
			data.title = '';
			this.storage(data, "close");
		}
	};
	tabMenu.prototype.reload = function (url) {
		var id = this.exited({href: url});
		if (id) {
			this.fresh(id, false);
		}
	};
	/**
	 *@param index 大于等于0时表示菜单选项卡已经存在，才有移动的需求
	 *@param scene 为1时表示删除tab菜单选项卡，为0时表示切换或是添加菜单选项卡
	 */
	tabMenu.prototype.tabMove = function (index, scene) {
		//取得屏幕总宽度
		var navWidth = parseInt(objTab.titleBox.parent('div').width());
		//取得菜单选项卡总宽度
		var $tabNav  = objTab.titleBox.find('li'), tab_all_width = 0;
		if (!$tabNav[0]) {
			return
		}

		$tabNav.each(function (i, n) {
			tab_all_width += $(n).outerWidth(true);
		});

		if (tab_all_width > navWidth + 1) {
			$('.tab-move-btn').show();
			var ml = navWidth - tab_all_width;
			if (ml < 45) {
				if (index >= 0) {
					var current_tab_left = 0;
					try {
						current_tab_left = parseInt(objTab.titleBox.find('.layui-this').position().left);
					} catch (e) {
					}
					var curent_tab_ml = parseInt(objTab.titleBox.css("marginLeft")),
						curent_ml     = current_tab_left + parseInt(curent_tab_ml);

					if (curent_ml <= 45) {
						ml = 45 - current_tab_left;
					} else {
						var is_show = -(curent_tab_ml - navWidth + parseInt(objTab.titleBox.find('.layui-this').outerWidth(true)) + current_tab_left);
						if (is_show <= 0) {
							ml = navWidth - current_tab_left - parseInt(objTab.titleBox.find('.layui-this').outerWidth(true));
						} else {
							if (scene == 1 && parseInt(curent_tab_ml) < 0) {
								ml = navWidth - current_tab_left - parseInt(objTab.titleBox.find('.layui-this').outerWidth(true));

								if (ml > 45) {
									ml = 45;
								}
							} else {
								return;
							}
						}
					}
				}
				objTab.titleBox.css({"marginLeft": ml});
			}
		} else {
			$('.tab-move-btn').hide();
			objTab.titleBox.css({"marginLeft": 45});
		}
	};
	/**
	 *根据值查找所在位置index值，查不到就返回-1
	 */
	Array.prototype.indexOf = function (val) {
		for (var i = 0; i < this.length; i++) {
			if (this[i] == val) return i;
		}
		return -1;
	};

	/**
	 *根椐值删除元素
	 */
	Array.prototype.remove = function (val) {
		var index = this.indexOf(val);
		if (index > -1) {
			this.splice(index, 1);
		}
	};

	exports('tabmenu', function (options) {
		var navtab = new tabMenu();
		return navtab.set(options)
	});
});