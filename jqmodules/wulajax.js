layui.define(['jquery', 'layer'], function (exports) {
	"use strict";

	var $ = layui.$,
	    wulajax = $.wulajax = $.ajax,
	    layer = layui.layer;
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
					deal500({
						message: function (t) {
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
						}(xhr.responseText)
					});
					break;
				case 200:
					//数据类型转换错误
					deal500({
						message: function (t) {
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
						}(xhr.responseText)
					}, $.lang.core.ajaxDataConvertException);
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
		//$.wulaUI.loadingBar.success();
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
				be.opts.dialogTitle = $this.data('dialogTitle') || false;
				be.opts.dialogType = $this.data('dialogType') || 'orange';
				be.opts.dialogWidthClass = $this.data('dialogWidthCls') || false;
				be.opts.dialogWidth = $this.data('dialogWidth') || 0;
				var dialogE = $.Event('build.dialog');
				dialogE.buttons = null;
				$this.trigger(dialogE);
				if (dialogE.buttons) {
					be.opts.buttons = dialogE.buttons;
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
					var warn = $this.data('warn') || $.lang.core.emptyWarn;
					$.notifyW(warn, $.lang.core.warning);
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
					//是dialog，所以走$.ajaxDialog方法
					var ops = be.opts;
					$.ajaxDialog(ops.url, ops.dialogTitle, ops.buttons, ops.dialogType, ops.dialogWidthClass, ops.dialogWidth, $this.data('dialogIcon'), $this.data('dialogId'));
				} else if ($this.data('confirm') !== undefined) {
					//confirm
					var jc = $.confirm({
						content: $this.data('confirm') || '',
						title: $this.data('confirmTitle') || $.lang.core.confirmTile,
						icon: $this.data('confirmIcon') || 'fa fa-question-circle',
						type: $this.data('confirmType') || 'orange',
						theme: $this.data('confirmTheme') || 'material',
						autoClose: $this.data('confirmAutoclose') || false,
						draggable: false,
						alignMiddle: true,
						escapeKey: 'cancel',
						buttons: {
							ok: {
								text: $.lang.core.yes1,
								btnClass: 'btn-blue',
								keys: ['enter'],
								action: function action() {
									if ($this.data('loading') !== undefined) {
										$this.data('loading', null);
										jc.setTitle('');
										jc.buttons.ok.hide();
										jc.buttons.cancel.hide();
										jc.setIcon('');
										jc.setContent('<p class="text-center"><i class="fa fa-spinner fa-spin fa-4x" aria-hidden="true"></i></p>');

										$.ajax(be.opts).always(function () {
											if ($this.data('block') !== undefined) {
												return;
											}
											jc.close();
										});

										return false;
									} else $.ajax(be.opts);
								}
							},
							cancel: {
								text: $.lang.core.cancel
							}
						}
					});
				} else {
					$.ajax(be.opts);
				}
			}
		}
		return false;
	};
	var deal500 = function deal500(data, title) {
		// 处理500错误
		console.log('ajax - 500');
	};
	var showMsg = function showMsg(data, opts) {
		if (data.message) {
			var notice = true,
			    _opts = {};
			if (data.style === 'alert') {
				notice = false;
			}
			switch (data.code) {
				case 500:
					//ERROR
					_opts.icon = 'fa fa-warning';
					_opts.title = $.lang.core.error;
					if (notice) {
						_opts.type = 'danger';
					} else {
						_opts.type = 'red';
						_opts.content = data.message;
					}
					break;
				case 400:
					//WARNING
					_opts.icon = 'fa fa-warning';
					_opts.title = $.lang.core.warning;
					if (notice) {
						_opts.type = 'warning';
					} else {
						_opts.type = 'orange';
						_opts.content = data.message;
					}
					break;
				case 300:
					//INFO
					_opts.icon = 'fa fa-info-circle';
					_opts.title = $.lang.core.info;
					if (notice) {
						_opts.type = 'info';
					} else {
						_opts.type = 'blue';
						_opts.content = data.message;
					}
					break;
				case 200: //SUCCESS
				default:
					_opts.icon = 'fa fa-check-square';
					_opts.title = $.lang.core.success;
					if (notice) {
						_opts.type = 'success';
					} else {
						_opts.type = 'green';
						_opts.content = data.message;
					}
					break;
			}
			if (notice) {
				_opts.z_index = 900000;
				_opts.placement = {
					from: "top",
					align: "center"
				};
				_opts.offset = { y: 5 };
				_opts.mouse_over = 'pause';
				_opts.delay = 3000;
				//显示提示信息
				//				$.notify({
				//					icon   : opts.icon,
				//					title  : '<strong>' + opts.title + '</strong>',
				//					message: data.message
				//				}, opts);
			} else {
					//$.dialog(opts);
				}
		}
		console.log('show message');
	};
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
						//$.wulaUI.initElement(d);
					} else {
						//$.wulaUI.destroyElement(target);
						target.empty().html(data.args.content);
						//$.wulaUI.initElement(target);
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
			case 'validate':
				//表单验证
				target = $('form[name="' + data.target + '"]');
				var errs = data.args;
				var obj = target.data('validateObj');
				if (obj) {
					obj.validate(errs);
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
								$.each(args, function (i, e) {
									if ($.dialogStack[e]) {
										$.dialogStack[e].close();
									}
								});
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
	var showNotice = function showNotice(xhr) {
		console.log('show Notice');
		//		$.notify({
		//			icon   : 'fa fa-warning',
		//			title  : '<strong>' + $.lang.core.error + '</strong>',
		//			message: '<br/>' + (t => {
		//				if (xhr.getResponseHeader('ajax')) {
		//					try {
		//						let data = $.parseJSON(t);
		//						return data.message;
		//					} catch (e) {
		//					}
		//				} else if (t.indexOf('</body>')) {
		//					t = t.substr(0, t.indexOf('</body>'));
		//					t = t.substr(t.indexOf('>', t.indexOf('<body')) + 1);
		//				}
		//				return t;
		//			})(xhr.responseText)
		//		}, {
		//			type     : 'danger',
		//			z_index  : 90000,
		//			placement: {
		//				from : "top",
		//				align: "center"
		//			}
		//		});
	};
	//页面加载完成时处理
	$(function () {
		$('body').on('click', '[data-ajax]:not(form)', doAjaxRequest).on('submit', 'form[data-ajax]', doAjaxRequest).on('change', 'select[data-ajax]', doAjaxRequest);
	});

	exports('wulajax', {
		confirm: function confirm() {
			console.log('confirm');
		},
		dialog: function dialog() {}
	});
});