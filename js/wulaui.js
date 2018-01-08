var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

layui.define(['jquery', 'layer', 'form', 'toastr'], function (exports) {
	var $ = layui.$,
	    layer = layui.layer,
	    WulaUI = function WulaUI() {
		var cfg = layui.data('wulaui');
		this.config = $.extend({}, {
			base: '/',
			assets: '/assets/',
			medias: [],
			groups: { char: [], prefix: [] },
			ids: {}
		}, cfg.config);
	},
	    getParams = function getParams(obj, attr) {
		var params = obj.data(attr) || obj.attr(attr);
		if (params) {
			if (typeof params === "string") {
				try {
					return new Function("return {" + params + "}")();
				} catch (e) {
					return {};
				}
			}
		}
		return params;
	};
	WulaUI.prototype.toast = top.global && top.global.toast ? top.global.toast : layui.toastr;
	WulaUI.prototype.layer = top.global && top.global.layer ? top.global.layer : layui.layer;
	WulaUI.prototype.app = function (url) {
		if (typeof url === "string") {
			var config = this.config,
			    chunks = url.split('/');
			if (chunks[0].match(/^([~!@#%\^&\*])(.+)$/)) {
				var id = RegExp.$2,
				    prefix = RegExp.$1;
				if (config.ids && config.ids[id]) {
					id = config.ids[id];
				}
				if (config.groups && config.groups.char) {
					for (var i = 0; i < config.groups.char.length; i++) {
						if (config.groups.char[i] === prefix) {
							prefix = config.groups.prefix[i];
							break;
						}
					}
				}
				chunks[0] = prefix + id;
			} else {
				var _id = chunks[0];
				if (config.ids && config.ids[_id]) {
					_id = config.ids[_id];
					chunks[0] = _id;
				}
			}
			chunks[0] = config.base + chunks[0];
			url = chunks.join('/');
		}
		return url;
	};
	WulaUI.prototype.media = function (url) {
		if (/^(\/|https?:\/\/).+/.test(url)) {
			return url;
		}
		if (this.config.medias) {
			var medias = this.config.medias,
			    idx = parseInt(Math.random() * 200) % medias.length;
			return medias[idx] + url;
		}
		return this.config.base + url;
	};
	WulaUI.prototype.assets = function (url) {
		if (/^(\/|https?:\/\/).+/.test(url)) {
			return url;
		}
		return this.config.assets + url;
	};
	WulaUI.prototype.open = function (obj) {
		if (top.global && top.global.menu) {
			var menu = top.global.menu;
			menu.menuOpen(obj);
		}
	};
	WulaUI.prototype.init = function (e) {
		e = e || $('body .wulaui');
		if (e.hasClass('wulaui')) {
			e.trigger('wulaui.widgets.init');
		} else {
			e.find('.wulaui').trigger('wulaui.widgets.init');
		}
	};
	WulaUI.prototype.destroy = function (e) {
		if (e.length === 0) return;
		if (e.hasClass('wulaui')) {
			e.triggerHandler('wulaui.widgets.destroy');
		} else {
			e.find('.wulaui').each(function () {
				$(this).triggerHandler('wulaui.widgets.destroy');
			});
		}
	};
	WulaUI.prototype.dialog = function (opts, e) {
		var _area = ["auto", "auto"],
		    ajax = false;
		if (e) {
			var be = $.Event('before.dialog');
			be.options = opts;
			e.trigger(be);
		}
		if (parseInt(opts.type) === 2) {
			if (opts.data) opts.content = opts.content + "?" + opts.data;
		} else if (opts.type === 'ajax') {
			ajax = true;
			if (opts.data) opts.content = opts.content + "?" + opts.data;
		} else {
			opts.content = $(opts.content);
		}
		if (opts.area !== "" || opts.area !== "auto,auto") {
			_area = opts.area.split(',');
			var width = parseInt(_area[0]),
			    maxWidth = $(window).width() - 20;
			if (width > maxWidth) {
				_area[0] = maxWidth + "px";
			}
			var height = parseInt(_area[1]),
			    maxHeight = $(window).height() - 20;
			if (height > maxHeight) {
				_area[1] = maxHeight + "px";
			}
		}
		if (ajax) {
			opts.type = 1;
			opts.success = function (o) {
				wulaui.init(o);
				opts.$content = o;
			};
			opts.end = function () {
				wulaui.destroy(opts.$content);
			};
			wulaui.ajax.ajax(opts.content, {
				element: e || $('body'),
				dataType: 'html',
				method: 'get'
			}).done(function (data) {
				opts.type = 1;
				opts.content = data;
				if (!opts.area) {
					var l = layer.open(opts);
					layer.full(l);
				} else {
					opts.area = _area;
					layer.open(opts);
				}
			});
		} else {
			if (!opts.area) {
				var l = layer.open(opts);
				layer.full(l);
			} else {
				opts.area = _area;
				layer.open(opts);
			}
		}
	};
	WulaUI.prototype.params = getParams;
	WulaUI.prototype.format = function (source, params) {
		if (arguments.length === 1) {
			return function () {
				var args = $.makeArray(arguments);
				args.unshift(source);
				return WulaUI.prototype.format(args);
			};
		}
		if (params === undefined) {
			return source;
		}
		if (arguments.length > 2 && params.constructor !== Array) {
			params = $.makeArray(arguments).slice(1);
		}
		if (params.constructor !== Array) {
			params = [params];
		}
		$.each(params, function (i, n) {
			source = source.replace(new RegExp("\\{" + i + "\\}", "g"), function () {
				return n;
			});
		});
		return source;
	};

	var wulaui = new WulaUI();
	//注册事件
	$('body').on('click', '[data-tab]', function () {
		var that = $(this),
		    href = that.attr('href') || that.data('url'),
		    title = that.attr('title') || that.data('title') || that.text() || '新窗口',
		    icon = that.data('tab') || '&#xe621;',
		    cls = that.data('cls') || null,
		    data = {
			href: href,
			icon: icon,
			cls: cls,
			title: title
		};
		if (href) {
			wulaui.open(data);
		}
		return false;
	}).on('click', '[data-dialog]', function () {
		try {
			var that = $(this),
			    opts = {
				type: that.data('dialog') || 2,
				title: that.attr('title') || that.data('title') || that.text(),
				content: that.attr('href') || that.data('url'),
				area: ''
			},
			    params = getParams(that, 'params'),
			    area = that.data('area');
			opts = $.extend({}, opts, params);
			if (area) {
				opts.area = area;
			}
			wulaui.dialog(opts, that);
		} catch (e) {
			console.log(e);
		}
		return false;
	});
	$(document).on('click', '[data-toggle^="class"]', function (e) {
		e && e.preventDefault();
		var $this = $(e.target),
		    $class = void 0,
		    $target = void 0,
		    $tmp = void 0,
		    $classes = void 0,
		    $targets = void 0;
		!$this.data('toggle') && ($this = $this.closest('[data-toggle^="class"]'));
		$class = $this.data()['toggle'];
		$target = $this.data('target') || $this.attr('href');
		$class && ($tmp = $class.split(':')[1]) && ($classes = $tmp.split(','));
		$target && ($targets = $target.split(','));
		$targets && $targets.length && $.each($targets, function (index, e) {
			e !== '#' && $(e).toggleClass($classes[index]);
		});
		$this.toggleClass('active');
	});
	//引入wulaui扩展
	(function ($, layer, wulaui) {
		"use strict";

		var wulajax = $.ajax,
		    toast = wulaui.toast;
		// 重写ajax
		$.ajax = function (url, options) {
			return wulajax(url, options).done(function (data) {
				var opts = options || url;
				if (opts.mode === 'abort') {
					return;
				}
				if (opts.dataType === 'json') {
					showMsg(data);
					ajaxAction(data, opts);
				} else if (opts.action === 'update' && opts.target) {
					ajaxAction({ code: 200, action: 'update', target: opts.target, args: { content: data } }, opts);
				}
			});
		};
		//修改默认的ajax行为
		$(document).ajaxSend(function (event, xhr, opts) {
			if (opts.mode === 'abort') {
				return;
			}
			if (!opts.element) {
				opts.element = $('body');
			} else {
				opts.isElement = true;
			}
			if (opts.isElement) {
				opts.element.data('ajaxSending', true);
			}
			var e = new $.Event('ajax.send');
			e.element = opts.element;
			opts.element.trigger(e, [opts, xhr]);
			xhr.setRequestHeader('X-AJAX-TYPE', opts.dataType);
		});

		$(document).ajaxError(function (event, xhr, opts, error) {
			if (opts.mode === 'abort') {
				return;
			}
			var e = $.Event('ajax.error');
			opts.element.trigger(e, [opts, error, xhr]);
			if (!e.isDefaultPrevented()) {
				//处理错误
				switch (xhr.status) {
					case 500:
						deal500(xhr, '服务器端500错误');
						break;
					case 200:
						//数据类型转换错误
						deal500(xhr, '数据类型转换出错');
						break;
					case 401:
						showNotice(xhr);
						$(document).trigger('wula.need.login');
						break;
					case 403:
						showNotice(xhr);
						$(document).trigger('wula.perm.denied');
						break;
					case 404:
						showNotice(xhr);
						$(document).trigger('wula.page.404');
						break;
					case 422:
						try {
							ajaxAction($.parseJSON(xhr.responseText));
						} catch (e) {}
						break;
					default:
						showNotice(xhr);
				}
			}
		});

		$(document).ajaxSuccess(function (event, xhr, opts, data) {
			if (opts.mode === 'abort') {
				return;
			}
			opts.element.trigger('ajax.success', [data, opts, xhr]);
		});

		$(document).ajaxComplete(function (event, xhr, opts) {
			if (opts.mode === 'abort') {
				return;
			}
			opts.element.data('ajaxSending', false);
			if (opts.element.hasClass('data-loading-text')) {
				opts.element.button('reset');
			}
			var e = new $.Event('ajax.done');
			e.element = opts.element;
			opts.element.trigger(e, [opts, xhr]);
		});
		// 全局设置
		$.ajaxSetup({
			cache: false,
			timeout: 900000
		});
		var confirmx = function confirmx(ajax, content, opts) {
			var ops = $.extend({}, { icon: 3, title: '请确认', loading: false }, opts || {});
			layer.confirm(content || '亲，你确定要这么干吗？', ops, function (index) {
				layer.close(index);
				if (ops.loading) {
					index = layer.load(2);
					$.ajax(ajax).always(function () {
						layer.close(index);
					});
				} else {
					$.ajax(ajax);
				}
			});
		};
		var dialog = function dialog(opts, e) {
			wulaui.dialog(opts, e);
		};
		// ajax 请求
		var doAjaxRequest = function doAjaxRequest(e) {
			e.preventDefault();
			e.stopPropagation();
			var $this = $(this);
			if ($this.data('ajaxSending')) {
				return false;
			}
			// ajax before,用户处理此事件做数据校验.
			var event = $.Event('ajax.before');
			event.element = $this;
			$this.trigger(event);
			if (!event.isDefaultPrevented()) {
				// 生成发起ajax请求的选项.
				var be = $.Event('ajax.build');
				be.opts = $.extend({ element: $this, data: [] }, $this.data() || {});
				be.opts.url = be.opts.url || $this.attr('href') || $this.attr('action') || '';
				var ajax = be.opts.ajax || 'get.json';
				delete be.opts.ajax;
				var types = ajax.split('.');
				be.opts.dataType = types.length === 2 ? types[1] : 'json';
				var method = $this.attr('method') || (types[0] ? types[0] : null) || 'GET';
				be.opts.method = method.toUpperCase();

				if (be.opts.method === 'UPDATE') {
					be.opts.method = 'GET';
					be.opts.dataType = 'html';
					be.opts.action = 'update';
					be.opts.target = $this.attr('target') || $this.data('target');
				} else if (be.opts.method === 'DIALOG') {
					be.opts.method = 'GET';
					be.opts.dataType = 'html';
					be.opts.action = 'dialog';
					be.opts.title = $this.attr('title') || $this.data('title') || false;
					be.opts.dialog = $.extend({}, wulaui.params($this, 'params'));
					be.opts.dialog.type = types.length === 2 ? 2 : 'ajax';
					var dialogE = $.Event('build.dialog');
					dialogE.btn = null;
					$this.trigger(dialogE);
					if (dialogE.btn) {
						be.opts.btn = dialogE.btn;
					}
				}

				var selected = $this.data('grp');
				if (selected) {
					var ids = [],
					    name = $this.data('arg') || 'ids';
					$(selected).each(function (i, n) {
						ids.push($(n).val());
					});
					if (ids.length === 0) {
						var warn = $this.data('warn') || '请选择要处理的数据';
						toast.warning(warn);
						return;
					}
					ids = ids.join(',');
					be.opts.data.push({
						name: name,
						value: ids
					});
				}
				$this.trigger(be);
				if (!be.isDefaultPrevented()) {
					if (be.opts.action === 'update' && $(be.opts.target).data('loaderObj')) {
						$(be.opts.target).data('load', be.opts.url).data('loaderObj').reload(null, $this.data('force') !== undefined);
					} else if (be.opts.action === 'dialog') {
						var ops = $.extend({}, {
							content: be.opts.url,
							title: be.opts.title,
							area: be.opts.area || '',
							btn: be.opts.btn || null,
							data: be.opts.data
						}, be.opts.dialog);
						dialog(ops, $this);
					} else if ($this.data('confirm') !== undefined) {
						var content = $this.data('confirm'),
						    autoClose = parseInt($this.data('auto'), 0) || 0,
						    opts = {
							icon: 3,
							loading: $this.data('loading') !== undefined,
							title: $this.attr('title') || $this.data('title') || '请确认'
						};
						if (autoClose > 0) {
							opts.time = autoClose;
						}
						confirmx(be.opts, content, opts);
					} else {
						$.ajax(be.opts);
					}
				}
			}
			return false;
		};
		var getMsg = function getMsg(rq) {
			var t = rq.responseText;
			if (rq.getResponseHeader('ajax')) {
				try {
					var data = $.parseJSON(t);
					return data.message;
				} catch (e) {
					t = '数据转换异常';
				}
			} else if (t.indexOf('</body>') > 0) {
				t = t.substr(0, t.indexOf('</body>'));
				t = t.substr(t.indexOf('>', t.indexOf('<body')) + 1);
			} else if (rq.statusText === 'error') {
				t = '出错啦';
			}
			return t;
		};
		//处理数据返回错误
		var deal500 = function deal500(xhr, title) {
			// 处理500错误
			var message = getMsg(xhr);
			layer.full(layer.open({
				type: 0,
				title: title,
				icon: 2,
				content: message
			}));
		};
		//显示正常提示
		var showMsg = function showMsg(data) {
			if (data.message) {
				var notice = true;
				if (data.style === 'alert') {
					notice = false;
				}
				switch (data.code) {
					case 500:
						//ERROR
						notice ? toast.error(data.message) : layer.alert(data.message, {
							icon: 5,
							title: null,
							btn: null,
							shadeClose: !0
						});
						break;
					case 400:
						//WARNING
						notice ? toast.warning(data.message) : layer.alert(data.message, {
							icon: 2,
							title: null,
							btn: null,
							shadeClose: !0
						});
						break;
					case 300:
						//INFO
						notice ? toast.info(data.message) : layer.alert(data.message, {
							icon: 1,
							title: null,
							btn: null,
							shadeClose: !0
						});
						break;
					case 200: //SUCCESS
					default:
						notice ? toast.success(data.message) : layer.alert(data.message, {
							icon: 6,
							title: null,
							btn: null,
							shadeClose: !0
						});
						break;
				}
			}
		};
		//处理上ajax返回动作
		var ajaxAction = function ajaxAction(data, opts) {
			var target = void 0,
			    des = void 0;
			switch (data.action) {
				case 'update':
					//更新内容
					des = getTarget(data.target);
					if (des[0] === 'parent' && parent.ajaxActions) {
						parent.ajaxActions.update(des[1], data);
					} else if (des[0] === 'top' && top.ajaxActions) {
						top.ajaxActions.update(des[1], data);
					} else {
						ajaxActions.update(des[1], data);
					}
					break;
				case 'reload':
					//重新加载
					if (!data.target || data.target === 'document' || data.target === 'top') {
						data.target === 'top' ? top.location.reload(true) : location.reload(true);
						return;
					}
					try {
						des = getTarget(data.target);
						if (des[0] === 'parent' && parent.ajaxActions) {
							parent.ajaxActions.reload(des[1]);
						} else if (des[0] === 'top' && top.ajaxActions) {
							top.ajaxActions.reload(des[1]);
						} else {
							ajaxActions.reload(des[1]);
						}
					} catch (e) {}
					break;
				case 'click':
					//点击
					des = getTarget(data.target);
					if (des[0] === 'parent' && parent.ajaxActions) {
						parent.ajaxActions.click(des[1]);
					} else if (des[0] === 'top' && top.ajaxActions) {
						top.ajaxActions.click(des[1]);
					} else {
						ajaxActions.click(des[1]);
					}
					break;
				case 'redirect':
					//重定向
					var url = data.target;
					if (url) {
						if (window.location.hash && data.hash) {
							window.location.href = url + window.location.hash;
						} else {
							window.location.href = url;
						}
					}
					break;
				case 'dialog':
					dialog(data.args, opts.element);
					break;
				case 'validate':
					//表单验证
					target = $('form[name="' + data.target + '"]');
					var errs = data.args;
					var obj = target.data('validateObj');
					if (obj) {
						obj.showErrors(errs);
					}
					break;
				default:
			}
			if (opts && opts.element && data.code && data.code <= 300) {
				var ajaxDone = opts.element.data('ajaxDone');
				if (ajaxDone) {
					var actions = ajaxDone.split(';');
					$.each(actions, function (i, ajaxDone) {
						var args = ajaxDone.split(':'),
						    op = args[0];
						switch (op) {
							case 'close':
								if (args.length > 1) {
									if (args[1] === 'parent' && parent.layer) {
										parent.layer.close(parent.layer.index);
									} else if (args[1] === 'top' && top.layer) {
										top.layer.close(top.layer.index);
									} else {
										layer.close(layer.index);
									}
								}
								break;
							case 'show':
								if (args.length > 1) {
									$(args[1]).removeClass('hidden').show();
								}
								break;
							case 'hide':
								if (args.length > 1) {
									$(args[1]).addClass('hidden').hide();
								}
								break;
							case 'click':
								target = $(args[1]);
								if (target.length) {
									target.click();
								}
								break;
							case 'reload':
								$(args[1]).each(function (i, e) {
									var loader = $(e).data('loaderObj');
									if (loader) {
										loader.reload();
									}
								});
								break;
							default:
						}
					});
				}
			}
		};
		//显示http返回异常码是提示
		var showNotice = function showNotice(xhr) {
			var message = getMsg(xhr);
			toast.error(message);
		};
		var getTarget = function getTarget(tag) {
			if (typeof tag === 'string') {
				var target = tag.split(':');
				if (target.length === 2) {
					return target;
				}
			}
			return ['me', tag];
		};
		$('body').on('click', '[data-ajax]:not(form)', doAjaxRequest).on('submit', 'form[data-ajax]', doAjaxRequest).on('change', 'select[data-ajax]', doAjaxRequest);
		//挂载ajax方法
		wulaui.ajax = {
			confirm: confirmx,
			dialog: dialog,
			ajax: $.ajax
		};
		window.ajaxActions = {
			reload: function reload(target) {
				target = $(target);
				if (target.length) {
					var loader = target.data('loaderObj');
					if (loader) {
						loader.reload(null, true);
					}
				}
			},
			update: function update(target, data) {
				target = $(target);
				if (target.length && data.args && data.args.content) {
					var append = data.args.append;
					if (append) {
						var d = $(data.args.content);
						target.append(d);
						wulaui.init(d);
					} else {
						wulaui.destroy(target);
						target.empty().html(data.args.content);
						wulaui.init(target);
					}
					target.trigger('content.updated');
				}
			},
			click: function click(target) {
				target = $(target);
				if (target.length) {
					if (/^#.+/.test(target.attr('href'))) {
						window.location.hash = target.attr('href');
					} else {
						target.click();
					}
				}
			}
		};
	})($, layer, wulaui);
	(function ($, wui) {
		var ajax = wui.ajax;
		//自动加载
		$.fn.wulauiLoad = function () {
			return $(this).each(function (i, e) {
				var me = $(e),
				    inited = me.data('loaderObj');
				if (!inited) {
					me.data('loaderObj', new doLoad(me));
				}
			});
		};
		$.fn.reload = function (url, force) {
			return $(this).each(function (i, e) {
				var inited = $(e).data('loaderObj');
				if (inited) {
					if (url) {
						$(e).data('load', url);
					}
					inited.reload(null, force);
				}
			});
		};
		var doLoad = function doLoad(element) {
			this.autoload = element.data('auto') !== undefined;
			this.lazy = element.data('lazy') !== undefined;
			this.element = element;
			if (this.autoload) {
				this.reload();
			}
		};
		// reload
		doLoad.prototype.reload = function (cb, force) {
			_doLoad.apply(this, [force]);
		};
		var _doLoad = function _doLoad(force) {
			var ourl = this.url ? this.url : '';
			this.url = this.element.data('load') || this.element.attr('href');
			if (!this.url || !force && this.lazy && ourl === this.url) {
				return;
			}
			var be = $.Event('ajax.build');
			be.opts = $.extend({ element: this.element }, this.element.data() || {});
			be.opts.url = this.url;
			be.opts.method = 'GET';
			be.opts.action = 'update';
			be.opts.dataType = 'html';
			be.opts.target = this.element;

			this.element.trigger(be);
			if (!be.isDefaultPrevented()) {
				ajax.ajax(be.opts);
			}
		};

		$('body').on('wulaui.widgets.init', '.wulaui', function (e) {
			e.stopPropagation();
			$(this).find('[data-load]').wulauiLoad();
		});
	})($, wulaui);
	(function ($, layer, wulaui) {
		var methods = {
			required: function required(value, element, param) {
				if (!this.depend(param, element)) {
					return "dependency-mismatch";
				}
				if (element.nodeName.toLowerCase() === "select") {
					var val = $(element).val();
					return val && val.length > 0;
				}
				if (this.checkable(element)) {
					return this.getLength(value, element) > 0;
				}
				return value.length > 0;
			},
			email: function email(value, element) {
				return this.optional(element) || /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(value);
			},
			url: function url(value, element) {
				return this.optional(element) || /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(value);
			},
			date: function date(value, element) {
				return this.optional(element) || /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/.test(value);
			},
			number: function number(value, element) {
				return this.optional(element) || /^(?:-?\d+|-?\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(value);
			},
			digits: function digits(value, element) {
				return this.optional(element) || /^(0|[1-9]\d*)$/.test(value);
			},
			minlength: function minlength(value, element, param) {
				var length = $.isArray(value) ? value.length : this.getLength(value, element);
				return this.optional(element) || length >= param;
			},
			maxlength: function maxlength(value, element, param) {
				var length = $.isArray(value) ? value.length : this.getLength(value, element);
				return this.optional(element) || length <= param;
			},
			rangelength: function rangelength(value, element, param) {
				var length = $.isArray(value) ? value.length : this.getLength(value, element);
				return this.optional(element) || length >= param[0] && length <= param[1];
			},
			min: function min(value, element, param) {
				return this.optional(element) || value >= param;
			},
			max: function max(value, element, param) {
				return this.optional(element) || value <= param;
			},
			range: function range(value, element, param) {
				return this.optional(element) || value >= param[0] && value <= param[1];
			},
			step: function step(value, element, param) {
				var type = $(element).attr("type"),
				    errorMessage = "Step attribute on input type " + type + " is not supported.",
				    supportedTypes = ["text", "number", "range"],
				    re = new RegExp("\\b" + type + "\\b"),
				    notSupported = type && !re.test(supportedTypes.join()),
				    decimalPlaces = function decimalPlaces(num) {
					var match = ("" + num).match(/(?:\.(\d+))?$/);
					if (!match) {
						return 0;
					}
					return match[1] ? match[1].length : 0;
				},
				    toInt = function toInt(num) {
					return Math.round(num * Math.pow(10, decimals));
				},
				    valid = true,
				    decimals = void 0;
				if (notSupported) {
					throw new Error(errorMessage);
				}
				decimals = decimalPlaces(param);
				if (decimalPlaces(value) > decimals || toInt(value) % toInt(param) !== 0) {
					valid = false;
				}
				return this.optional(element) || valid;
			},
			equalTo: function equalTo(value, element, param) {
				var target = $(param);
				return value === target.val();
			},
			passwd: function passwd(value, element, param) {
				if (this.optional(element)) {
					return true;
				}
				switch (param) {
					case '2':
						return (/[a-z]/i.test(value) && /\d/.test(value) && /[^a-z\d]/i.test(value)
						);
					case '3':
						return (/[A-Z]/.test(value) && /[a-z]/.test(value) && /\d/.test(value) && /[^a-z\d]/i.test(value)
						);
					case '1':
					default:
						return (/[a-z]/i.test(value) && /\d/.test(value)
						);
				}
			},
			pattern: function pattern(value, element, param) {
				if (this.optional(element)) {
					return true;
				}
				if (typeof param === "string") {
					return new RegExp("^(?:" + param + ")$").test(value);
				}
				return param.test(value);
			},
			ip: function ip(value, element) {
				return this.optional(element) || /^(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)$/i.test(value);
			},
			phone: function phone(value, element) {
				return this.optional(element) || /^1[34578]\d{9}$/.test(value);
			}
		};
		var defaultMsgs = {
			required: "这是必填字段",
			email: "请输入合法的邮箱地址",
			url: "请输入合法的URL",
			date: "请输入合法的日期",
			number: "请输入有效的数字",
			digits: "只能输入数字",
			equalTo: "你的输入不相同",
			maxlength: "最多可以输入{0}个字符",
			minlength: "最少要输入{0}个字符",
			rangelength: "请输入长度在{0}到{1}之间的字符串",
			range: "请输入范围在{0}到{1}之间的数值",
			max: "请输入不大于{0}的数值",
			min: "请输入不大于{0}的数值",
			step: "请输入{0}的倍数",
			passwd: '你输入的密码不够强',
			pattern: '请输入合法的格式',
			ip: '请输入合法的IP地址',
			phone: '请输入有效的手机号'
		};

		var Validator = function Validator(form) {
			this.form = form;
			var me = this,
			    e = new $.Event('form.init.rule');
			e.form = this;
			//提交之前验证
			form.trigger(e).on('ajax.before', function () {
				return me.validate();
			}).on('blur', '[data-verify]:not(readonly):not(ignore)', function () {
				me.check($(this), this);
			});
		};

		$.extend(Validator, {
			prototype: {
				validate: function validate() {
					var that = this,
					    checked = 0,
					    total = 0;
					this.form.find('[data-verify]:not(readonly):not([ignore])').each(function (i, e) {
						if (that.check($(e), e) === true) {
							checked++;
						}
						total++;
					});
					return checked === total;
				},
				check: function check(field, element) {
					var rules = field.data('wulauiValidRules') || this.parseRules(field) || false,
					    msgs = field.data('wulauiValidMsgs') || {},
					    val = this.elementValue(element),
					    rule = void 0,
					    result = void 0,
					    method = void 0,
					    errorEle = this.createErrorEle(field, element);
					if (rules) {
						var rulesCount = $.map(rules, function (n, i) {
							return i;
						}).length;
						for (method in rules) {
							rule = { method: method, parameters: rules[method] };
							try {
								result = methods[method].call(this, val, element, rule.parameters);
								if (result === "dependency-mismatch" && rulesCount === 1) {
									continue;
								}
								if (!result) {
									errorEle.html(this.getMsg(rule, msgs)).show();
									return false;
								}
							} catch (e) {
								console.log("Exception occurred when checking element '" + (element.id || element.name) + "', check the '" + rule.method + "' method.", e);
							}
						}
						if (this.objectLength(rules)) {
							errorEle.hide();
						}
					}
					return true;
				},
				parseRules: function parseRules(field) {
					var rules = wulaui.params(field, 'verify');
					if (rules) {
						field.data('wulauiValidRules', rules);
						field.data('wulauiValidMsgs', wulaui.params(field, 'verifyMsg'));
						return rules;
					}
					return false;
				},
				getMsg: function getMsg(rule, msgs) {
					var theregex = /\$?\{(\d+)\}/g,
					    msg = void 0;
					if (msgs[rule.method]) {
						msg = msgs[rule.method];
					} else if (defaultMsgs[rule.method]) {
						msg = defaultMsgs[rule.method];
					} else {
						msg = '此项填写不合法';
					}
					if (typeof msg === "function") {
						msg = msg.call(this, rule.parameters);
					} else if (theregex.test(msg)) {
						msg = wulaui.format(msg.replace(theregex, "{$1}"), rule.parameters);
					}
					return msg;
				},
				checkable: function checkable(element) {
					return (/radio|checkbox/i.test(element.type)
					);
				},
				depend: function depend(param, element) {
					var type = typeof param === "undefined" ? "undefined" : typeof param === 'undefined' ? 'undefined' : _typeof(param);
					return this.dependTypes[type] ? this.dependTypes[type](param, element) : true;
				},

				dependTypes: {
					"boolean": function boolean(param) {
						return param;
					},
					"string": function string(param, element) {
						return !!$(param, element.form).length;
					},
					"function": function _function(param, element) {
						return param(element);
					}
				},
				optional: function optional(element) {
					var val = this.elementValue(element);
					return !methods.required.call(this, val, element) && "dependency-mismatch";
				},
				objectLength: function objectLength(obj) {
					var count = 0,
					    i = void 0;
					for (i in obj) {
						if (obj[i]) {
							count++;
						}
					}
					return count;
				},
				escapeCssMeta: function escapeCssMeta(string) {
					return string.replace(/([\\!"#$%&'()*+,./:;<=>?@\[\]^`{|}~])/g, "\\$1");
				},
				findByName: function findByName(name) {
					return this.form.find("[name='" + this.escapeCssMeta(name) + "']");
				},
				createErrorEle: function createErrorEle(field) {
					var error = field.parent().find('span.valid-error');
					if (error.length > 0) {
						return error;
					} else {
						error = $('<span class="valid-error"/>');
						error.appendTo(field.parent());
						return error;
					}
				},
				getLength: function getLength(value, element) {
					switch (element.nodeName.toLowerCase()) {
						case "select":
							return $("option:selected", element).length;
						case "input":
							if (this.checkable(element)) {
								return this.findByName(element.name).filter(":checked").length;
							}
					}
					return value.length;
				},
				elementValue: function elementValue(element) {
					var $element = $(element),
					    type = element.type.toLowerCase(),
					    val = void 0,
					    idx = void 0;

					if (type === "radio" || type === "checkbox") {
						var elements = this.findByName(element.name);
						if (elements.length > 1) {
							var vals = [];
							elements.filter(":checked").each(function (i, ex) {
								vals.push($(ex).val());
							});
							return vals;
						}
						return elements.filter(":checked").val();
					} else if (type === "number" && typeof element.validity !== "undefined") {
						return element.validity.badInput ? "NaN" : $element.val();
					}
					val = $element.val();
					if (type === "file") {
						if (val.substr(0, 12) === "C:\\fakepath\\") {
							return val.substr(12);
						}
						idx = val.lastIndexOf("\\");
						if (idx >= 0) {
							return val.substr(idx + 1);
						}
						return val;
					}
					if (typeof val === "string") {
						return val.replace(/\r/g, "");
					}
					return val;
				},
				showErrors: function showErrors(errors) {
					var me = this;
					$.each(errors, function (i, e) {
						var error = me.createErrorEle($('[name="' + me.escapeCssMeta(i) + '"]:first'));
						error.html(e).show();
					});
				}
			}
		});

		$.fn.wulaform = function () {
			var me = $(this);
			if (me.length) {
				me.each(function () {
					var $this = $(this);
					if (!$this.data('validateObj')) {
						$this.data('validateObj', new Validator($this));
					}
				});
			}
			return me;
		};

		wulaui.validator = {
			method: function method(name, _method, message) {
				methods[name] = _method;
				defaultMsgs[name] = message !== undefined ? message : '此项填写不合法';
			},
			validate: function validate(ele, errors) {
				var form = $(ele),
				    validator = form.data('validateObj');
				if (validator) {
					if (errors) {
						validator.showErrors(errors);
					} else {
						validator.validate();
					}
				}
			},
			get: function get(elem) {
				var form = $(elem),
				    validator = form.data('validateObj');
				if (!validator) {
					form.wulaform();
					validator = form.data('validateObj');
				}
				return validator;
			}
		};

		$('body').on('ajax.build', 'form[data-ajax]', function (e) {
			e.stopPropagation();
			e.opts.data = $(this).serializeArray();
		}).on('wulaui.widgets.init', '.wulaui', function (e) {
			e.stopPropagation();
			$(this).find('form[data-verify]').wulaform();
		});
	})($, layer, wulaui);
	(function ($) {
		var prepareValidateRule = function prepareValidateRule(rules) {
			if ('object' !== (typeof rules === 'undefined' ? 'undefined' : _typeof(rules))) {
				try {
					rules = $.parseJSON(rules);
				} catch (e) {
					rules = {};
					console.log(e.message);
				}
			}
			if (rules.rules) {
				for (var i in rules.rules) {
					for (var j in rules.rules[i]) {
						if (j === 'pattern') {
							eval('var rule = ' + rules.rules[i][j] + ';');
							rules.rules[i][j] = rule;
						}
					}
				}
			}
			return rules;
		};
		var errorPlacement = function errorPlacement(error, element) {
			if (element.is('[type=checkbox]') || element.is('[type=radio]')) {
				var wrap = element.closest('div');

				if (wrap.is('.checkbox') || wrap.is('.radio')) {
					wrap = wrap.parent().closest('div');
				}

				if (wrap.children('span').length) {
					error.insertBefore(wrap.children('span'));
				} else {
					error.appendTo(wrap);
				}
			} else {
				var e = $.Event('form.placement');
				element.trigger(e, [error, element]);
				if (!e.isDefaultPrevented()) {
					error.insertAfter(element);
				}
			}
		};
		var Validator = function Validator(form) {
			this.form = form;
			this.rules = prepareValidateRule(form.data('validate'));
			this.rules.errorPlacement = errorPlacement;
			this.rules.onsubmit = false;
			this.rules.ignoreTitle = true;
			this.rules.errorClass = 'parsley-error';
			this.rules.validClass = 'parsley-success';
			this.rules.wrapper = 'ul';
			this.rules.wrapperClass = 'parsley-error-list';
			this.rules.errorElement = 'li';
			//可以通过事件定制高级验证规则
			var e = new $.Event('form.init.rule');
			e.form = this;
			this.form.trigger(e);

			this.validator = form.validate(this.rules);
			var me = this;
			form.on('ajax.before', function () {
				return me.validate();
			});
			var destroy = function destroy() {
				me.destroy();
				me.form.closest('.wulaui').off('wulaui.widgets.destroy', destroy);
			};
			//注册销毁事件
			form.closest('.wulaui').on('wulaui.widgets.destroy', destroy);
		};
		//验证
		Validator.prototype.validate = function (errors) {
			if (!this.validator) {
				return false;
			}
			if (this.validator.form()) {
				if (errors) {
					this.validator.showErrors(errors);
					return;
				}
				if (this.validator.pendingRequest) {
					this.validator.formSubmitted = true;
					return false;
				}
			}
			return this.form.valid();
		};
		//销毁
		Validator.prototype.destroy = function () {
			if (this.validator) {
				this.validator.destroy();
				this.validator = null;
				this.rules = null;
			}
		};

		$.fn.wulavalidate = function () {
			var me = $(this);
			if (me.length) {
				$.validator.defaults.ignore = '.ignore';
				me.each(function () {
					var $this = $(this);
					if (!$this.data('validateObj')) {
						$this.data('validateObj', new Validator($this));
					}
				});
			}
			return me;
		};

		$('body').on('wulaui.widgets.init', '.wulaui', function (e) {
			e.stopPropagation();
			var v = $(this).find('form[data-validate]');
			if (v.length > 0) {
				layui.use(['validate'], function () {
					v.wulavalidate();
				});
			}
		});
	})($);
	(function ($, wui) {
		// data-source: url for loadding table rows
		// data-sort: field,dir default
		// data-tree: true or false
		// data-hh: hide head
		// data-expend: auto expend
		// data-tfoot: auto-generate tfoot
		// data-auto: auto-load data
		// th[data-sort] : sort field
		var nuiTable = function nuiTable(table) {
			var me = this;
			this.table = table;
			this.data = {};
			this.isTree = table.data('tree') !== undefined;
			this.hideHead = table.data('hh') !== undefined;
			this.autoExpend = table.data('expend') !== undefined;
			this.autoLoad = table.data('auto') !== undefined;
			this.noHover = table.data('noHover') !== undefined;
			this.source = table.data('table');
			this.id = table.attr('id');
			this.currentTreeNode = null;
			if (this.isTree) {
				this.folderOpenIcon = table.data('folderIcon1') || 'fa fa-minus-circle';
				this.folderCloseIcon = table.data('folderIcon2') || 'fa fa-plus-circle';
				this.leafIcon = table.data('leafIcon') || '';
			}
			if (this.noHover) {
				table.addClass('table');
			} else {
				table.addClass('table table-hover');
			}
			table.data('tableObj', this);
			table.data('formTarget', this);
			table.data('pagerTarget', this);
			table.data('loaderObj', this);
			this.initSorter();
			if (this.id) {
				var sform = $('form[data-table-form="#' + this.id + '"]');
				if (sform.length === 0) {
					this.initData();
				}
			} else {
				this.initData();
			}
			this.table.find('th input[type="checkbox"].grp').click(function () {
				var $this = $(this),
				    checked = $this.prop('checked');
				var selected = me.table.find('td input[type="checkbox"].grp');
				selected.prop('checked', checked);
				if (checked) {
					me.table.find('tbody tr').addClass('nui-selected');
				} else {
					me.table.find('tbody tr').removeClass('nui-selected');
				}
				me.table.find('th input[type="checkbox"].grp').not($this).prop('checked', checked);
			});
			if (this.isTree) {
				if (this.table.find('tbody tr').length > 0) {
					this.initTree();
				}
				this.table.on('click', 'tbody tr > td:first-child span.tt-folder', function () {
					var h = $(this),
					    node = me.currentTreeNode = h.parent().parent();
					if (node.data('parent') !== undefined) {
						if (h.hasClass('node-open')) {
							h.removeClass(me.folderOpenIcon).removeClass('node-open').addClass(me.folderCloseIcon);
							collapseNode(node, me);
						} else {
							h.removeClass(me.folderCloseIcon).addClass('node-open').addClass(me.folderOpenIcon);
							if (node.data('loaded')) {
								expendNode(node, me);
							} else {
								me.reload();
							}
						}
					}
				});
			}
			if (this.hideHead) {
				this.table.find('thead').hide();
				this.table.find('tfoot').hide();
			}
			this.table.trigger('wulaui.table.init');
		};
		nuiTable.prototype.initData = function () {
			if (this.autoLoad) {
				var me = this,
				    limit = 10,
				    pager = $('div[data-table-pager="#' + me.id + '"]');

				if (!this.data.cp) {
					if (pager.length === 1 && pager.data('limit')) {
						limit = parseInt(pager.data('limit'), 10);
					}
					this.data.cp = 1;
					this.data.limit = limit;
				} else if (pager.length === 1) {
					pager.data('limit', this.data.limit);
					pager.find('select').val(this.data.limit);
					if (this.pagerCtl) {
						this.pagerCtl.limit = this.data.limit;
						this.pagerCtl.current = this.data.cp;
					}
				}

				if (this.data.sf) {
					me.table.find("div.sorthd i").removeClass('fa-sort-up fa-sort-down');
					var abc = me.table.find("div[data-field='" + this.data.sf + "']");
					if (this.data.dir === 'd') {
						abc.data('dir', 'a');
						abc.find('i').addClass('fa-sort-down');
					} else {
						abc.data('dir', 'd');
						abc.find('i').addClass('fa-sort-up');
					}
				}
				this.inited = false;
				if (me.table.parents('.nui-dialog').length > 0) {
					setTimeout(function () {
						me.reload();
						me.inited = true;
					}, 200);
				} else {
					this.reload();
					this.inited = true;
				}
			}
		};
		nuiTable.prototype.initSorter = function () {
			var defaultSort = this.table.attr('data-sort'),
			    me = this;
			this.table.find('th[data-sort]').each(function (i, n) {
				var th = $(n),
				    sort = th.attr('data-sort');
				if (sort) {
					var sorts = sort.split(',');
					var field = sorts.shift(),
					    dir = 'd',
					    cls = 'fa fa-sort pull-right m-t-xs ';
					if (sorts.length > 0) {
						dir = sorts.shift();
						if (dir !== 'd' && dir !== 'a') {
							dir = 'd';
						}
					}
					if (defaultSort === sort) {
						me.data.sf = field;
						me.data.dir = dir;
						if (dir === 'd') {
							cls += 'fa-sort-down text-info';
							dir = 'a';
						} else {
							cls += 'fa-sort-up text-info';
							dir = 'd';
						}
					}
					var html = '<div class="sorthd" data-field="' + field + '"';
					html += ' data-dir="' + dir + '">' + th.html();
					html += '<i class="' + cls + '"></i></div>';
					th.empty().append($(html)).removeAttr('data-sort');
				}
			});
			if (this.table.data('tfoot')) {
				var tfoot = $('<tfoot></tfoot>');
				this.table.find('thead tr').clone().appendTo(tfoot);
				this.table.append(tfoot);
			}
			var ths = this.table.find('div.sorthd');
			ths.click(function () {
				ths.find('i').removeClass('fa-sort-down fa-sort-up text-info');
				var th = $(this),
				    f = th.data('field'),
				    d = th.data('dir'),
				    th2 = $("div[data-field='" + f + "']");
				me.doSort(f, d, function () {
					if (d === 'd') {
						th2.data('dir', 'a');
						th2.find('i').removeClass('fa-sort-up').addClass('fa-sort-down text-info');
					} else {
						th2.data('dir', 'd');
						th2.find('i').removeClass('fa-sort-down').addClass('fa-sort-up text-info');
					}
				});
			});
		};

		nuiTable.prototype.initTree = function (html) {
			var me = this;
			if (!html) {
				html = this.table.find('tbody tr');
			}
			var level = 0,
			    ref = '0';
			if (me.currentTreeNode !== null) {
				level = me.currentTreeNode.data('ttLevel');
				ref = me.currentTreeNode.attr('rel');
			}
			var cls = 'tt-folder',
			    icon = me.folderCloseIcon;
			$.each(html, function (i, n) {
				var $this = $(n),
				    id = $this.attr('rel');
				if ($this.data('handleAdded')) {
					return;
				}
				var children = html.is('[parent="' + id + '"]');
				if ($this.data('parent') || children) {
					cls = 'tt-folder';
					if (!$this.attr('data-parent')) {
						$this.attr('data-parent', 'true');
					}
					icon = me.autoExpend && (children || !me.autoLoad) ? me.folderOpenIcon : me.folderCloseIcon;
				} else {
					cls = 'tt-leaf';
					icon = me.leafIcon;
				}
				if (!$this.attr('parent')) {
					$this.attr('parent', ref);
				}
				var parent = $this.attr('parent');
				if (html.is('[rel="' + parent + '"]')) {
					$this.css('display', 'none');
				} else {
					$this.css('display', 'table-row');
				}
				$this.find('td:first').prepend($('<span class="' + cls + ' ' + icon + '"></span>'));
				$this.find('td:first').prepend($('<span class="tt-line"></span>'));
				$this.data('handleAdded', true);
				$this.data('ttLevel', level);
				$this.data('loaded', children);
			});
			if (me.autoExpend) {
				me.table.find("tbody tr[parent='0']").each(function (i, n) {
					expendNode($(n), me);
				});
			}
		};
		nuiTable.prototype.reloadNode = function (ids) {
			var me = this;
			if (ids) {
				ids = '' + ids;
				ids = ids.split(',');
				$.each(ids, function (i, e) {
					me.currentTreeNode = me.table.find('tr[rel=' + e + ']').eq(0);
					if (me.currentTreeNode && me.currentTreeNode.data('loaded')) {
						var icon = me.currentTreeNode.find('td:first-child span.tt-folder');
						me.currentTreeNode.data('loaded', false);
						if (icon.hasClass('node-open')) {
							clearSubNode(me.currentTreeNode, me);
							me.currentTreeNode.find('td:first-child span.tt-folder').removeClass(me.folderOpenIcon).removeClass('node-open').addClass(me.folderCloseIcon);
							me.reload();
						}
					}
				});
			} else {
				if (me.currentTreeNode) {
					me.currentTreeNode.data('loaded', false);
					me.currentTreeNode = null;
				}
				this.reload();
			}
		};
		nuiTable.prototype.doPage = function (cp, limit, reload, ct) {
			this.data.cp = cp;
			this.currentTreeNode = null;
			if (limit) {
				this.data.limit = limit;
			}
			if (reload) {
				this.reload(null, ct);
			}
		};

		nuiTable.prototype.doSort = function (field, order, cb) {
			this.currentTreeNode = null;
			this.data.sf = field;
			this.data.dir = order;
			this.reload(cb);
		};

		nuiTable.prototype.reload = function (cb, search) {
			if (!this.source) {
				return;
			}
			var me = this,
			    data = [],
			    pageit = false;
			if (me.searchForm) {
				data = me.searchForm.serializeArray();
			}
			if (search || !this.inited) {
				data.push({
					name: 'count',
					value: 1
				});
				pageit = true;
			}
			if (search) {
				this.data.cp = 1;
				this.currentTreeNode = null;
				if (this.pagerCtl) {
					this.pagerCtl.current = 1;
				}
			}

			data.push({
				name: 'pager[page]',
				value: this.data.cp
			});

			data.push({
				name: 'pager[size]',
				value: this.data.limit
			});

			if (this.data.sf) {
				data.push({
					name: 'sort[name]',
					value: this.data.sf
				});
				if (this.data.dir) {
					data.push({
						name: 'sort[dir]',
						value: this.data.dir
					});
				} else {
					data.push({
						name: 'sort[dir]',
						value: 'd'
					});
				}
			}

			if (me.currentTreeNode !== null) {
				data.push({
					name: 'parentId',
					value: me.currentTreeNode.attr('rel')
				});
				me.currentTreeNode.find('.tt-folder').addClass('fa-spin');
			}

			$.ajax(me.source, {
				dataType: 'html',
				element: me.table,
				data: data,
				method: 'get'
			}).done(function (html) {
				me.table.find('th input[type="checkbox"].grp').prop('checked', false);
				html = $(html);
				var disableTree = html.data('disableTree');
				if (me.isTree && !disableTree) {
					if (me.currentTreeNode) {
						html = html.find('tr');
						me.initTree(html);
						me.currentTreeNode.after(html);
						me.currentTreeNode.data('loaded', true);
						me.currentTreeNode.find('.tt-folder').removeClass('fa-spin ' + me.folderCloseIcon).addClass(me.folderOpenIcon + ' node-open');
						expendNode(me.currentTreeNode, me);
					} else {
						var tb = me.table.find('tbody');
						wui.destroy(tb);
						tb.remove();
						me.table.find('thead').after(html);
						me.initTree();
					}
				} else {
					var _tb = me.table.find('tbody');
					wui.destroy(_tb);
					_tb.remove();
					me.table.find('thead').after(html);
				}

				if ($.isFunction(cb)) {
					cb();
				}

				if (me.pagerCtl && $.isFunction(me.pagerCtl.pageIt)) {
					var total = -1;
					if (pageit) {
						var ot = html.data('total');
						if (ot === '') {
							total = -1;
						} else {
							total = parseInt(ot || 0, 10);
						}
					}
					me.pagerCtl.pageIt(total);
				}
				wui.init(html);
			});
		};

		nuiTable.prototype.form = function (form) {
			if (form) {
				this.searchForm = form;
				this.initData();
			} else {
				return this.searchForm;
			}
		};
		nuiTable.prototype.pager = function (pager) {
			if (pager) {
				this.pagerCtl = pager;
			} else {
				return this.pagerCtl;
			}
		};
		nuiTable.prototype.filter = function (field, value) {
			if (value === undefined) {
				this.table.find('tbody tr').show();
			} else {
				var attr = '[data-field-' + field + '="' + value + '"]';
				this.table.find('tbody tr' + attr).show();
				this.table.find('tbody tr').not(attr).hide();
			}
		};
		$.fn.wulatable = function (option) {
			var args = Array.apply(null, arguments);
			args.shift();
			return $(this).each(function (i, elm) {
				var table = $(elm);
				if (!table.data('tableObj')) {
					new nuiTable(table);
				} else {
					var data = table.data('tableObj');
					if (typeof option === 'string' && typeof data[option] === 'function') {
						data[option].apply(data, args);
					}
				}
			});
		};

		var expendNode = function expendNode(node, table) {
			var treeid = node.attr('rel'),
			    tree = table.table,
			    subLevel = node.data('ttLevel') + 1;
			if (!node.data('childrenMoved')) {
				node.after(tree.find('[parent="' + treeid + '"]'));
				node.data('childrenMoved', true);
			}
			var ml = subLevel * 10 + 'px';
			tree.find('[parent="' + treeid + '"]').each(function (i, n) {
				var $this = $(n),
				    h = $this.find('td:first span.tt-folder');
				$this.data('ttLevel', subLevel);
				$this.find('td:first span.tt-line').css({ 'margin-left': ml });
				$this.css({ 'display': 'table-row' });
				if (h.hasClass('node-open')) {
					expendNode($this, table);
				}
			});
		};
		var collapseNode = function collapseNode(node, table) {
			var treeid = node.attr('rel');
			var tree = table.table;
			tree.find('[parent="' + treeid + '"]').each(function (i, n) {
				var $this = $(n);
				collapseNode($this, table);
				$this.css('display', 'none');
			});
		};
		var clearSubNode = function clearSubNode(node, table) {
			var treeid = node.attr('rel');
			var tree = table.table;
			tree.find('[parent="' + treeid + '"]').each(function (i, n) {
				var $this = $(n);
				clearSubNode($this, table);
				$this.css('display', 'none').remove();
			});
		};

		$('body').on('wulaui.widgets.init', '.wulaui', function (e) {
			e.stopPropagation();
			$(this).find('[data-table]').wulatable();
		});
	})($, wulaui);

	(function ($) {
		var pagerTpl = '<section class="col-sm-12  col-md-7 col-lg-8 text-right"><ul class="pagination pagination-sm m-t-sm m-b-none"></ul></section>';
		var tipTpl = '<section class="col-sm-12  col-md-5 col-lg-4 visible-md-block visible-lg-block"><div class="m-t text-muted">每页&nbsp;<select></select>条&nbsp;共<span class="tp"></span>页<span class="tr"></span>条记录</div></section>';
		var nuiPager = function nuiPager(pager) {
			var targetId = pager.data('tablePager');
			if (targetId) {
				var target = $(targetId).data('pagerTarget');
				if (target) {
					this.pagerTarget = target;
				}
			}
			pager.addClass('row');
			if (!this.pagerTarget || !$.isFunction(this.pagerTarget.pager) || !$.isFunction(this.pagerTarget.doPage)) {
				return;
			}
			this.pagerTarget.pager(this);

			this.element = pager;
			this.total = parseInt($(targetId).find('tbody').data('total') || 0, 10);
			this.limit = parseInt(pager.data('limit') || 20, 10);
			this.pp = parseInt(pager.data('pp') || 5, 10);
			this.current = 1;
			if (!this.limit) {
				this.limit = 20;
			}
			if (!this.pp) {
				this.pp = 5;
			}
			var me = this;
			var pageWrapper = $(pagerTpl);

			if (pager.data('hiddenTip') === undefined) {
				this.tipElm = $(tipTpl);
				var sbox = this.tipElm.find('select');
				sbox.append($('<option value="5">5</option>'));
				sbox.append($('<option value="10">10</option>'));
				sbox.append($('<option value="15">15</option>'));
				sbox.append($('<option value="20">20</option>'));
				sbox.append($('<option value="30">30</option>'));
				sbox.append($('<option value="50">50</option>'));
				sbox.append($('<option value="100">100</option>'));
				sbox.val(this.limit);
				this.tipElm.find('.tr').html(this.total);
				this.tipElm.appendTo(pager);
				sbox.change(function () {
					me.limit = $(this).val();
					me.current = 1;
					me.pagerTarget.doPage(me.current, me.limit, true, true);
				});
			} else {
				pageWrapper.removeClass('col-md-7 col-lg-8');
			}

			var pagerElm = this.pagerElm = pageWrapper.find('ul');
			pagerElm.append('<li class="disabled p-f"><a href="#" rel="1"><i class="fa fa-fast-backward"></i></a></li>');
			pagerElm.append('<li class="disabled p-p"><a href="#" rel="1"><i class="fa fa-backward"></i></a></li>');
			for (var i = 1; i <= this.pp; i++) {
				pagerElm.append('<li class="p-' + i + '"><a href="#" rel="' + i + '">' + i + '</a></li>');
			}
			pagerElm.append('<li class="disabled p-n"><a href="#" rel="1"><i class="fa fa-forward"></i></a></li>');
			pagerElm.append('<li class="disabled p-l"><a href="#" rel="1"><i class="fa fa-fast-forward"></i></a></li>');
			pageWrapper.appendTo(pager);
			pagerElm.on('click', 'a', function (event) {
				event.preventDefault();
				if (!$(this).parents('li').hasClass('disabled')) {
					var rel = $(this).attr('rel');
					me.current = parseInt(rel, 10);
					me.pagerTarget.doPage(me.current, me.limit, true);
				}
				return false;
			});
			this.pagerTarget.doPage(me.current, me.limit);
			this.pageIt(this.total);
		};
		nuiPager.prototype.pageIt = function (total) {
			this.total = total >= 0 ? total : this.total;
			var tp = Math.ceil(this.total / this.limit),
			    pagerElm = this.pagerElm;
			if (this.tipElm) {
				this.tipElm.find('.tp').html(tp);
				this.tipElm.find('.tr').html(this.total);
			}
			if (tp < 2) {
				pagerElm.hide();
				return;
			} else {
				pagerElm.show();
			}
			pagerElm.find('li').removeClass('disabled');
			if (this.current > 1) {
				pagerElm.find('.p-f').removeClass('disabled');
				pagerElm.find('.p-p').removeClass('disabled').find('a').attr('rel', this.current - 1);
			} else {
				pagerElm.find('.p-f').addClass('disabled');
				pagerElm.find('.p-p').addClass('disabled');
			}

			if (this.current === tp) {
				pagerElm.find('.p-n').addClass('disabled');
				pagerElm.find('.p-l').addClass('disabled');
			} else {
				pagerElm.find('.p-l').removeClass('disabled').find('a').attr('rel', tp);
				pagerElm.find('.p-n').removeClass('disabled').find('a').attr('rel', this.current + 1);
			}
			var pt = Math.ceil(this.pp / 2),
			    start = 0;
			if (tp < this.pp) {
				for (var i = this.pp; i > tp; i--) {
					pagerElm.find('.p-' + i).hide();
				}
			}

			if (this.current >= pt) {
				start = this.current - pt - 1;
			}
			if (this.current + pt > tp) {
				start = tp - this.pp;
			}
			start = Math.max(0, start);
			for (var _i = 1; _i <= Math.min(this.pp, tp); _i++) {
				pagerElm.find('.p-' + _i).addClass('hidden-xs').css('display', 'inline').find('a').attr('rel', start + _i).html(start + _i);
			}
			pagerElm.find('a[rel=' + this.current + ']').parents('li').removeClass('hidden-xs').addClass('disabled');
		};

		$.fn.wulaplgpager = function () {
			return $(this).each(function (i, elm) {
				var pager = $(elm);
				if (!pager.data('pagerObj')) {
					pager.data('pagerObj', new nuiPager(pager));
				}
			});
		};

		$('body').on('wulaui.table.init', 'table[data-table]', function (e) {
			e.stopPropagation();
			var id = $(this).attr('id');
			if (id) {
				$('div[data-table-pager="#' + id + '"]').wulaplgpager();
			}
		});
	})($);

	(function ($) {
		var nuiSearchForm = function nuiSearchForm(form) {
			var targetId = form.data('tableForm');
			if (targetId) {
				var target = $(targetId).data('formTarget');
				if (target && $.isFunction(target.form) && $.isFunction(target.reload)) {
					target.form(form);
					form.submit(function (event) {
						event.preventDefault();
						target.reload(null, true);
						return false;
					});
				}
			}
		};
		$.fn.wulaplgform = function () {
			return $(this).each(function (i, elm) {
				var form = $(elm);
				if (!form.data('formObj')) {
					form.data('formObj', new nuiSearchForm(form));
				}
			});
		};

		$('body').on('wulaui.table.init', 'table[data-table]', function (e) {
			e.stopPropagation();
			var id = $(this).attr('id');
			if (id) {
				$('form[data-table-form="#' + id + '"]').wulaplgform();
			}
		});
	})($);
	(function ($) {
		var defaultOpts = {
			c: false,
			runtimes: 'html5',
			max_file_count: 1,
			chunk_size: '256k',
			chunks: true,
			multi_selection: false,
			max_file_size: '28mb',
			filters: [{
				title: "*.*",
				extensions: "jpg,gif,png,jpeg"
			}]
		};
		//预览文件
		var PreviewFile = function PreviewFile(file, id) {
			this.file = file;
			this.id = id;
			this.name = file.name;
			this.previewable = /.+\.(png|gif|jpg|jpeg|bmp)/i.test(this.name);
			if (this.previewable) {
				var img = $(this.id).get(0);
				var reader = new FileReader();
				reader.onload = function (evt) {
					img.src = evt.target.result;
				};
				reader.readAsDataURL(this.file);
			} else {
				$(this.id).attr('src', $.wulaUI.appConfig.assets + 'dat.jpg');
			}
		};

		//文件上传器
		var nuiUploader = function nuiUploader(elem) {
			elem.data('uploaderObj', this);
			var $this = this;
			this.element = elem;
			this.value = elem.data('value');
			this.varName = elem.data('name');
			this.auto = elem.data('auto') !== undefined;
			this.extensions = elem.data('exts');
			this.width = elem.data('width') || 90;
			this.height = elem.data('height') || this.width;
			this.readonly = elem.data('readonly') !== undefined;
			this.whstyle = 'width:' + this.width + 'px;height:' + this.height + 'px;';
			var opts = {};
			if (this.extensions) {
				opts.filters = {
					title: '*.*',
					extensions: this.extensions
				};
			}
			var cnt = elem.data('multi');
			this.multi = parseInt(cnt ? cnt : 1, 10) || 1;
			if (this.multi > 1) {
				opts.max_file_count = this.multi;
				opts.chunks = true;
				opts.chunk_size = '512k';
				opts.multi_selection = true;
				this.varName += '[]';
			} else {
				this.multi = 1;
			}

			this.mfs = elem.data('maxFileSize');
			if (this.mfs) {
				opts.max_file_size = this.mfs;
			}

			var resize = elem.data('resize');
			if (resize) {
				var rss = resize.split(',');
				opts.resize = {};
				opts.resize.width = rss[0];
				opts.resize.height = rss[0];
				opts.resize.preserve_headers = false;
				if (rss.length >= 2 && rss[1]) {
					opts.resize.height = rss[1];
				}
				if (rss.length >= 3 && rss[2]) {
					opts.resize.quality = rss[2];
				}
				if (rss.length >= 4 && rss[3]) {
					opts.resize.crop = true;
				}
			}
			this.opts = $.extend({}, defaultOpts, opts);

			this.noWatermark = elem.data('noWater'); //强制不添加水印
			if (this.noWatermark !== undefined) {
				this.opts.multipart_params = {
					nowater: 1
				};
			}

			// 删除文件
			var removeFile = function removeFile() {
				var up = $this.uploader;
				var parent = $(this).parent();
				var fileId = parent.find('input').attr('id');
				var f = up.getFile(fileId);
				if (f) {
					up.removeFile(f);
					$this.newFile--;
				}
				var url = parent.find('input').val();
				if (url) {
					var e = $.Event('uploader.remove');
					$this.element.trigger(e, [url]);
					if (!e.isDefaultPrevented()) {
						parent.remove();
						$this.uploadBtn.show();
					}
				} else {
					parent.remove();
					$this.uploadBtn.show();
				}
				if ($this.wrapper.find('input').length === 0) {
					$this.uploadBtn.append('<input type="hidden" id="empty-f-' + $this.id + '" name="' + $this.varName + '" value=""/>');
				}
			};
			//销毁
			var destroy = function destroy() {
				elem.off('form.placement');
				if ($this.uploader) {
					$this.uploader.destroy();
					$this.wrapper = null;
					elem.data('uploaderObj', null);
					$(this).off('wulaui.widgets.destroy', destroy);
					delete $this.uploader;
				}
			};
			this.id = elem.attr('id');
			this.btnId = 'uploadimg-' + this.id;
			this.wrapper = $('<ul class="upload-img-box clearfix"><li class="uploadimg-btn"><a href="javascript:void(0);" style="' + this.whstyle + '" id="' + this.btnId + '"></a></li></ul>');
			elem.append(this.wrapper);
			this.uploadBtn = this.wrapper.find('.uploadimg-btn');
			this.opts.browse_button = 'uploadimg-' + elem.attr('id');
			this.opts.url = elem.data('uploader') || '';
			var uploader = new plupload.Uploader(this.opts);
			this.uploader = uploader;
			this.newFile = 0;
			//有值
			if (this.value) {
				if (this.multi === 1) {
					this.value = [this.value];
				}
				if ($.isArray(this.value)) {
					$.each(this.value, function (i, e) {
						var html = '<li id="up-file' + i + '">';
						html += '<img id="img_file' + i + '" src="' + wulamedia(e) + '" style="' + $this.whstyle + '"/>';
						if (!$this.readonly) {
							html += '<i>×</i>';
						}
						html += '<input type="hidden" id="old-file' + i + '" name="' + $this.varName + '" value="' + e + '"/>';
						html += '</li>';
						var imgEle = $(html);
						$this.uploadBtn.before(imgEle);
						imgEle.on('click', 'i', removeFile);
					});
					var imgNum = $this.wrapper.find('input').length;
					if (imgNum >= $this.multi) {
						$this.uploadBtn.hide();
					}
				}
			} else {
				this.uploadBtn.append('<input type="hidden" id="empty-f-' + this.id + '" name="' + this.varName + '" value=""/>');
			}
			if (this.readonly) {
				this.uploadBtn.remove();
			}
			uploader.init();

			uploader.bind('BeforeUpload', function (up, file) {
				var id = '#up-' + file.id;
				$(id + ' .progress').show();
			});

			//添加文件
			uploader.bind('FilesAdded', function (up, files) {
				var fileInput = document.getElementById(up.id + '_' + up.runtime),
				    imgNum = void 0;
				$this.uploadBtn.find('input').remove();

				if ($this.auto) {
					up.disableBrowse(true);
				}

				for (var i in files) {
					imgNum = $this.wrapper.find('input').length;
					if (imgNum + 1 > $this.multi) {
						up.splice($this.newFile);
						break;
					}
					var file = files[i],
					    rfile = null;
					for (var j in fileInput.files) {
						if (fileInput.files[j].name === file.name && fileInput.files[j].size === file.size) {
							rfile = fileInput.files[j];
						}
					}
					if (!rfile) {
						continue;
					}
					$this.newFile++;

					var html = '<li id="up-' + file.id + '">';
					html += '<img id="img_' + file.id + '" src="' + $.wulaUI.appConfig.assets + 's.gif" style="' + $this.whstyle + '"/>';
					html += '<div class="progress progress-xs" style="display:none;width: ' + $this.width + 'px"><div class="progress-bar progress-bar-info"></div></div>';
					html += '<span>' + (file.size / 1000).toFixed(1) + 'K</span>';
					html += '<i>×</i>';
					html += '<input type="hidden" id="' + file.id + '" name="' + $this.varName + '"/>';
					html += '</li>';
					var imgEle = $(html);
					$this.uploadBtn.before(imgEle);
					new PreviewFile(rfile, '#img_' + file.id);
					imgEle.on('click', 'i', removeFile);
				}
				if (++imgNum >= $this.multi) {
					$this.uploadBtn.hide();
				}
				if ($this.auto && $this.newFile > 0) {
					up.start();
				}
			});
			//上传进度
			uploader.bind('UploadProgress', function (up, file) {
				var id = '#up-' + file.id;
				$(id + ' .progress-bar').css('width', file.percent + '%');
			});
			// 上传完成
			uploader.bind('FileUploaded', function (up, file, resp) {
				var id = file.id,
				    idx = '#up-' + id;
				if (file.status === plupload.DONE) {
					$(idx + ' .progress-bar').removeClass('progress-bar-info').addClass('progress-bar-success');
					try {
						var result = $.parseJSON(resp.response);
						var rst = result.result;
						if (rst) {
							$(idx + ' input').val(rst.url);
							try {
								$this.element.trigger('uploader.uploaded', [rst]);
							} catch (ee) {}
						} else {
							$(idx + ' .progress-bar').removeClass('progress-bar-info').addClass('progress-bar-danger');
						}
					} catch (e) {
						$('#up-' + id + ' .progress-bar').removeClass('progress-bar-info').addClass('progress-bar-danger');
						$.notifyD(e.message);
					}
				} else {
					$('#up-' + id + ' .progress-bar').removeClass('progress-bar-info').addClass('progress-bar-danger');
				}
			});
			//全部上传完全
			uploader.bind('UploadComplete', function (up) {
				up.disableBrowse(false);
				$this.newFile = 0;
				up.splice(0);
				up.refresh();
				$this.element.trigger('uploader.done');
			});
			//上传失败
			uploader.bind('Error', function (up, file) {
				up.disableBrowse(false);
				var id = file.file ? file.file.id : file.id;
				$('#up-' + id + ' .progress-bar').removeClass('progress-bar-info').addClass('progress-bar-danger');
				if (file.response) {
					try {
						var result = eval('(' + file.response + ')');
						var rst = result.error;
						$.notifyD(rst.message);
					} catch (e) {
						console.log(e);
					}
				} else if (file.message) {
					$.notifyD(file.message);
				}
				$this.element.trigger('uploader.error');
			});

			elem.closest('.wulaui').on('wulaui.widgets.destroy', destroy);
		};

		nuiUploader.prototype.start = function () {
			if (this.newFile > 0) {
				this.uploader.start();
			}
		};

		nuiUploader.prototype.stop = function () {
			this.uploader.stop();
		};
		nuiUploader.prototype.clear = function () {
			this.wrapper.find('li').not(this.uploadBtn).find('i').click();
			this.uploader.splice(0);
			this.uploader.refresh();
			this.uploader.disableBrowse(false);
			this.uploadBtn.show();
		};
		$.fn.wulauploader = function () {
			var args = Array.apply(null, arguments);
			args.shift();
			return $(this).each(function (i, elm) {
				var table = $(elm);
				if (!table.data('uploaderObj')) {
					new nuiUploader(table);
				} else {
					var data = table.data('uploaderObj');
					if (typeof option === 'string' && typeof data[option] === 'function') {
						data[option].apply(data, args);
					}
				}
			});
		};

		$('body').on('wulaui.widgets.init', '.wulaui', function (e) {
			e.stopPropagation();
			var that = $(this).find('[data-uploader]');
			if (that.length > 0) {
				layui.use('plupload', function () {
					console.log('plupload done');
					that.wulauploader();
				});
			}
		});
	})($);
	(function ($, wui) {

		$.fn.wulapopmenu = function () {
			return $(this).each(function (i, e) {
				var me = $(e),
				    inited = me.data('popMenuObj');
				if (!inited) {
					me.data('popMenuObj', new popMenu(me));
				}
			});
		};

		var popMenu = function popMenu(element) {
			this.target = element.data('popMenu');
			this.arg = element.data('popArg') || 'id';
			var me = this;
			if (this.target) {
				element.find('[data-id]').hover(function () {
					var $this = $(this),
					    toolbar = $this.data('popToolbar'),
					    id = $this.data('id');
					if (!toolbar) {
						toolbar = $(me.target).clone(true);
						$this.data('popToolbar', toolbar);
						toolbar.css({
							'position': 'absolute',
							'right': 5,
							'bottom': 5,
							'padding': 0,
							'margin': 0
						}).find('[data-ajax]').on('ajax.build', function (e) {
							if (e.opts && e.opts.url) e.opts.url = e.opts.url + (e.opts.url.indexOf('?') > 0 ? '&' : '?') + me.arg + '=' + id;
						});
						toolbar.appendTo($this);
					}
					toolbar.show();
					return false;
				}, function () {
					var $this = $(this),
					    popMenu = $this.data('popToolbar');
					if (popMenu) {
						popMenu.hide();
					}
					return false;
				});
			}
		};
		$('body').on('wulaui.widgets.init', '.wulaui', function (e) {
			e.stopPropagation();
			$(this).find('[data-pop-menu]').wulapopmenu();
		});
	})($, wulaui);
	(function ($) {
		var nuiCombox = function nuiCombox(combox) {
			var me = this;
			this.combox = combox;
			combox.data('comboxObj', this);
			var opts = {
				allowClear: true
			};
			this.isTagMode = combox.data('tagMode') !== undefined;
			this.parent = combox.data('parent');
			this.url = combox.data('combox');
			this.multiple = combox.data('multi') !== undefined;
			if (this.multiple && combox.data('multi')) {
				opts.maximumSelectionSize = parseInt(combox.data('multi'), 10);
			}
			opts.placeholder = combox.attr('placeholder') || '';
			opts.allowClear = combox.data('allowClear') === 'false' ? false : opts.allowClear;
			opts.minimumInputLength = combox.data('mnl') ? parseInt(combox.data('mnl'), 10) : 0;

			if (this.isTagMode && this.multiple) {
				opts.separator = ',';
				opts.tokenSeparators = [',', ' '];
				opts.tokenizer = function (input, selection, selectCallback, opts) {
					if (input.length > 1) {
						var len = input.length,
						    token = input.substring(len - 1, len);
						if (token === ',' || token === ' ') {
							var sl = selection.length;
							input = input.replace(/[, ]+$/g, '');
							for (var i = 0; i < sl; i++) {
								if (input === selection[i].id) {
									me.comboxObj.select2('close');
									return;
								}
							}
							selectCallback({
								id: input,
								text: input
							});
						}
					}
				};
			}
			if (!combox.is('select')) {
				opts.multiple = this.multiple;
				opts.initSelection = function (element, callback) {
					var vars = $(element).val(),
					    data = null,
					    svar = void 0,
					    values = [];
					if (me.multiple) {
						data = [{
							id: '',
							text: ''
						}];
					} else {
						data = {
							id: '',
							text: ''
						};
					}
					if (vars) {
						if (me.multiple) {
							vars = vars.split(',');
							data = [];
							for (var i in vars) {
								svar = vars[i].split(':');
								if (svar.length > 1) {
									data.push({
										id: svar[0],
										text: svar[1]
									});
								} else {
									data.push({
										id: svar[0],
										text: svar[0]
									});
								}
								values.push(svar[0]);
							}
						} else {
							vars = vars.split(':');
							if (vars.length > 1) {
								data = {
									id: vars[0],
									text: vars[1]
								};
							} else {
								data = {
									id: vars[0],
									text: vars[0]
								};
							}
							values.push(vars[0]);
						}
						$(element).attr('value', values.join(','));
					}
					callback(data);
				};
			}

			if (this.url) {
				opts.ajax = {
					quietMillis: 100,
					cache: true,
					data: function data(term, page) {
						var data = {
							q: term,
							_cp: page
						};
						if (me.parent) {
							data.p = $('#' + me.parent).val();
						}
						return data;
					},
					dataType: 'json',
					url: this.url,
					results: function results(data, page) {
						if (data.results) {
							return data;
						} else {
							return { results: data, more: false };
						}
					}
				};
			}
			this.options = opts;
			this.comboxObj = combox.select2(this.options);
			if (this.parent) {
				var pCombox = $('#' + this.parent);
				if (pCombox.length > 0) {
					pCombox.change(function () {
						me.setValue();
					});
				}
			}
		};
		nuiCombox.prototype.getComboxObj = function () {
			return this.comboxObj;
		};
		nuiCombox.prototype.getCombox = function () {
			return this.combox;
		};
		nuiCombox.prototype.setValue = function (value) {
			if (!value) {
				value = this.multiple ? null : '';
			}
			this.combox.select2('val', value, true);
		};

		$.fn.wulauiCombox2 = function () {
			return $(this).each(function (i, e) {
				var $this = $(e),
				    inited = $this.data('comboxObj');
				if (inited) {
					return;
				}
				new nuiCombox($this);
			});
		};

		//初始化combox
		$('body').on('wulaui.widgets.init', '.wulaui', function (e) {
			e.stopPropagation();
			var that = $(this).find('[data-combox]');
			if (that.length > 0) layui.use('select2', function () {
				that.wulauiCombox2();
			});
		});
	})($);
	(function ($) {
		var WulaTree = function WulaTree(element) {
			var me = this;
			this.settings = {
				view: {},
				callback: {},
				edit: {
					drap: {}
				},
				data: {
					keep: {},
					key: {},
					simpleData: {}
				},
				check: {}
			};
			this.url = element.data('ztree');
			this.lazy = element.data('lazy') !== undefined;
			element.addClass('ztree');
			if (this.url) {
				this.settings.async = {
					enable: true,
					url: this.url,
					type: 'get',
					dataType: 'json',
					autoParam: ["id"]
				};
			}

			element.on('ztree.setting.load', function () {
				var e = $.Event('ztree.init');
				e.tree = me;
				element.trigger(e);
				me.settings = e.tree.settings;
				me.nodes = e.tree.nodes;
				if (!e.isDefaultPrevented()) {
					me.treeObj = $.fn.zTree.init(element, me.settings, me.nodes);
					element.trigger('ztree.inited', [me.treeObj]);
				}
				element.off('ztree.setting.load');
			}).closest('.wulaui').on('wulaui.widgets.destroy', me.destroy);

			if (!this.lazy) {
				element.trigger('ztree.setting.load');
			}
		};

		WulaTree.prototype.destroy = function () {
			if (this.treeObj) {
				this.treeObj.destroy();
				delete this.treeObj;
				$(this).off('wulaui.widgets.destroy', this.destroy);
			}
		};

		$.fn.wulatree = function (option) {
			return $(this).each(function () {
				var me = $(this);
				if (option === 'load') {
					me.trigger('ztree.setting.load');
				} else if (option === 'destroy') {
					var treeObj = me.data('treeObj');
					if (treeObj) {
						me.data('treeObj', null);
						treeObj.destroy();
						treeObj = null;
					}
				} else if (!me.data('treeObj')) {
					me.data('treeObj', new WulaTree(me));
				}
			});
		};

		$('body').on('wulaui.widgets.init', '.wulaui', function (e) {
			e.stopPropagation();
			var that = $(this).find('[data-ztree]');
			if (that.length > 0) {
				layui.use('ztree', function () {
					that.wulatree();
				});
			}
		});
	})($);
	//end
	wulaui.init();
	exports('wulaui', wulaui);
});