var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

layui.define(['jquery', 'laytpl', 'layer', 'form', 'toastr'], function (exports) {
	var $ = layui.$,
	    layer = layui.layer,
	    form = layui.form,
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
	//修改模板
	layui.laytpl.config({
		open: '<%',
		close: '%>'
	});
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
	WulaUI.prototype.dialog = function (opts) {
		var _area = ["auto", "auto"];
		if (parseInt(opts.type) === 2) {
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

		if (!opts.area) {
			var l = layer.open(opts);
			layer.full(l);
		} else {
			opts.area = _area;
			layer.open(opts);
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
		    data = {
			href: href,
			icon: icon,
			title: title
		};
		if (href) {
			wulaui.open(data);
		}
		return false;
	}).on('click', '[data-dialog]', function () {
		var that = $(this),
		    opts = {
			type: 2,
			title: that.attr('title') || that.data('title') || that.text(),
			content: that.attr('href') || that.data('url'),
			area: ''
		},
		    params = getParams(that, 'params');
		opts = $.extend({}, opts, params);
		wulaui.dialog(opts);
		return false;
	});

	//引入wulaui扩展
	;(function ($, layer, wulaui) {
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
			if (opts.element.hasClass('data-loading-text')) {
				opts.element.button('loading');
			}
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
		var dialog = function dialog(opts) {
			wulaui.dialog(opts);
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
							type: be.opts.type || 2,
							btn: be.opts.btn || null,
							data: be.opts.data
						}, be.opts.dialog);
						dialog(ops);
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
		//处理数据返回错误
		var deal500 = function deal500(xhr, title) {
			// 处理500错误
			var message = function (rq) {
				var t = rq.responseText;
				if (rq.getResponseHeader('ajax')) {
					try {
						var data = $.parseJSON(t);
						return data.message;
					} catch (e) {}
				} else if (t.indexOf('</body>')) {
					t = t.substr(0, t.indexOf('</body>'));
					t = t.substr(t.indexOf('>', t.indexOf('<body')) + 1);
				}
				return t;
			}(xhr);
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
						notice ? toast.error(data.message) : layer.alert(data.message, { icon: 5 });
						break;
					case 400:
						//WARNING
						notice ? toast.warning(data.message) : layer.alert(data.message, { icon: 2 });
						break;
					case 300:
						//INFO
						notice ? toast.info(data.message) : layer.alert(data.message, { icon: 1 });
						break;
					case 200: //SUCCESS
					default:
						notice ? toast.success(data.message) : layer.alert(data.message, { icon: 6 });
						break;
				}
			}
		};
		//处理上ajax返回动作
		var ajaxAction = function ajaxAction(data, opts) {
			var target = void 0;
			switch (data.action) {
				case 'update':
					//更新内容
					target = $(data.target);
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
					break;
				case 'reload':
					//重新加载
					if (!data.target || data.target === 'document') {
						location.reload(true);
						return;
					}
					try {
						target = $(data.target);
						if (target.length) {
							var loader = target.data('loaderObj');
							if (loader) {
								loader.reload(null, true);
							}
						}
					} catch (e) {}
					break;
				case 'click':
					//点击
					target = $(data.target);
					if (target.length) {
						if (/^#.+/.test(target.attr('href'))) {
							window.location.hash = target.attr('href');
						} else {
							target.click();
						}
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
									layer.close(layer.index);
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
			var message = function (t) {
				if (xhr.getResponseHeader('ajax')) {
					try {
						var data = $.parseJSON(t);
						return data.message;
					} catch (e) {}
				} else if (t.indexOf('</body>')) {
					t = t.substr(0, t.indexOf('</body>'));
					t = t.substr(t.indexOf('>', t.indexOf('<body')) + 1);
				}
				return t;
			}(xhr.responseText);
			toast.error(message);
		};

		$('body').on('click', '[data-ajax]:not(form)', doAjaxRequest).on('submit', 'form[data-ajax]', doAjaxRequest).on('change', 'select[data-ajax]', doAjaxRequest);
		//挂载ajax方法
		wulaui.ajax = {
			confirm: confirmx,
			dialog: dialog,
			ajax: $.ajax
		};
	})($, layer, wulaui);
	;(function ($, wui) {
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
			this.url = this.element.data('load');
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
			$(this).find('[data-validate]').wulaform();
		});
	})($, layer, wulaui);
	//end
	wulaui.init();
	exports('wulaui', wulaui);
});