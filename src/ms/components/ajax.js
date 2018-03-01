(($, layer, wulaui) => {
	"use strict";
	let wulajax = $.ajax,
		toast   = wulaui.toast;
	// 重写ajax
	$.ajax      = function (url, options) {
		return wulajax(url, options).done(data => {
			let opts = options || url;
			if (opts.mode === 'abort') {
				return;
			}
			if (opts.dataType === 'json') {
				showMsg(data);
				ajaxAction(data, opts);
			} else if (opts.action === 'update' && opts.target) {
				ajaxAction({code: 200, action: 'update', target: opts.target, args: {content: data}}, opts);
			}
		});
	};
	//修改默认的ajax行为
	$(document).ajaxSend((event, xhr, opts) => {
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
		let e     = new $.Event('ajax.send');
		e.element = opts.element;
		opts.element.trigger(e, [opts, xhr]);
		xhr.setRequestHeader('X-AJAX-TYPE', opts.dataType);
	});

	$(document).ajaxError((event, xhr, opts, error) => {
		if (opts.mode === 'abort') {
			return;
		}
		let e = $.Event('ajax.error');
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
					} catch (e) {
					}
					break;
				default:
					showNotice(xhr);
			}
		}
	});

	$(document).ajaxSuccess((event, xhr, opts, data) => {
		if (opts.mode === 'abort') {
			return;
		}
		opts.element.trigger('ajax.success', [data, opts, xhr]);
	});

	$(document).ajaxComplete((event, xhr, opts) => {
		if (opts.mode === 'abort') {
			return;
		}
		opts.element.data('ajaxSending', false);
		if (opts.element.hasClass('data-loading-text')) {
			opts.element.button('reset');
		}
		let e     = new $.Event('ajax.done');
		e.element = opts.element;
		opts.element.trigger(e, [opts, xhr]);
	});
	// 全局设置
	$.ajaxSetup({
		cache  : false,
		timeout: 900000
	});
	const confirmx      = function (ajax, content, opts) {
		let ops = $.extend({}, {icon: 3, title: '请确认', loading: false}, opts || {});
		layer.confirm(content || '亲，你确定要这么干吗？', ops, function (index) {
			layer.close(index);
			if (ops.loading) {
				index = layer.load(2);
				$.ajax(ajax).always(() => {
					layer.close(index);
				});
			} else {
				$.ajax(ajax);
			}
		});
	};
	const dialog        = function (opts, e) {
		wulaui.dialog(opts, e);
	};
	// ajax 请求
	const doAjaxRequest = function (e) {
		e.preventDefault();
		e.stopPropagation();
		let $this = $(this);
		if ($this.data('ajaxSending')) {
			return false;
		}
		// ajax before,用户处理此事件做数据校验.
		let event     = $.Event('ajax.before');
		event.element = $this;
		$this.trigger(event);
		if (!event.isDefaultPrevented()) {
			// 生成发起ajax请求的选项.
			let be      = $.Event('ajax.build');
			be.opts     = $.extend({element: $this, data: []}, $this.data() || {});
			be.opts.url = be.opts.url || $this.attr('href') || $this.attr('action') || $this.data('url') || '';
			let ajax    = be.opts.ajax || 'get.json';
			delete be.opts.ajax;
			let types        = ajax.split('.');
			be.opts.dataType = types.length === 2 ? types[1] : 'json';
			let method       = $this.attr('method') || (types[0] ? types[0] : null) || 'GET';
			be.opts.method   = method.toUpperCase();

			if (be.opts.method === 'UPDATE') {
				be.opts.method   = 'GET';
				be.opts.dataType = 'html';
				be.opts.action   = 'update';
				be.opts.target   = $this.attr('target') || $this.data('target');
			} else if (be.opts.method === 'DIALOG') {
				be.opts.method      = 'GET';
				be.opts.dataType    = 'html';
				be.opts.action      = 'dialog';
				be.opts.title       = $this.attr('title') || $this.data('title') || false;
				be.opts.dialog      = $.extend({}, wulaui.params($this, 'params'));
				be.opts.dialog.type = types.length === 2 ? 2 : 'ajax';
				let dialogE         = $.Event('build.dialog');
				dialogE.btn         = null;
				$this.trigger(dialogE);
				if (dialogE.btn) {
					be.opts.btn = dialogE.btn;
				}
			}

			let selected = $this.data('grp');
			if (selected) {
				let ids = [], name = $this.data('arg') || 'ids';
				$(selected).each(function (i, n) {
					ids.push($(n).val());
				});
				if (ids.length === 0) {
					let warn = $this.data('warn') || '请选择要处理的数据';
					toast.warning(warn);
					return;
				}
				ids = ids.join(',');
				be.opts.data.push({
					name : name,
					value: ids
				});
			}
			if ($this.is('input,select,textarea')) {
				be.opts.data.push({
					name : 'value',
					value: $this.val()
				});
			}
			if ($this.is('[data-toggle]')) {
				be.opts.data.push({
					name : 'value',
					value: $this.hasClass('active') ? 0 : 1
				});
			}
			$this.trigger(be);
			if (!be.isDefaultPrevented()) {
				if (be.opts.action === 'update' && $(be.opts.target).data('loaderObj')) {
					$(be.opts.target).data('load', be.opts.url).data('loaderObj').reload(null, $this.data('force') !== undefined);
				} else if (be.opts.action === 'dialog') {
					let ops = $.extend({}, {
						content: be.opts.url,
						title  : be.opts.title,
						area   : be.opts.area || '',
						btn    : be.opts.btn || null,
						data   : be.opts.data
					}, be.opts.dialog);
					dialog(ops, $this);
				} else if ($this.data('confirm') !== undefined) {
					let content   = $this.data('confirm'),
						autoClose = parseInt($this.data('auto'), 0) || 0,
						opts      = {
							icon   : 3,
							loading: $this.data('loading') !== undefined,
							title  : $this.attr('title') || $this.data('title') || '请确认',
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
	const getMsg        = function (rq) {
		let t = rq.responseText || rq.statusText;
		if (rq.getResponseHeader('ajax')) {
			try {
				let data = $.parseJSON(t);
				return data.message;
			} catch (e) {
				t = '数据转换异常';
			}
		} else if (t && t.indexOf('</body>') > 0) {
			t = t.substr(0, t.indexOf('</body>'));
			t = t.substr(t.indexOf('>', t.indexOf('<body')) + 1);
		} else if (rq.statusText === 'error') {
			t = '出错啦';
		}
		return t;
	};
	//处理数据返回错误
	const deal500       = function (xhr, title) {
		// 处理500错误
		let message = getMsg(xhr);
		layer.full(layer.open({
			type   : 0,
			title  : title,
			content: message,
			btn    : null
		}));
	};
	//显示正常提示
	const showMsg       = function (data) {
		if (data.message) {
			let notice = true;
			if (data.style === 'alert') {
				notice = false;
			}
			switch (data.code) {
				case 500://ERROR
					notice ? toast.error(data.message) : layer.alert(data.message, {
						icon      : 5,
						title     : null,
						btn       : null,
						shadeClose: !0
					});
					break;
				case 400://WARNING
					notice ? toast.warning(data.message) : layer.alert(data.message, {
						icon      : 2,
						title     : null,
						btn       : null,
						shadeClose: !0
					});
					break;
				case 300://INFO
					notice ? toast.info(data.message) : layer.alert(data.message, {
						icon      : 1,
						title     : null,
						btn       : null,
						shadeClose: !0
					});
					break;
				case 200://SUCCESS
				default:
					notice ? toast.success(data.message) : layer.alert(data.message, {
						icon      : 6,
						title     : null,
						btn       : null,
						shadeClose: !0
					});
					break;
			}
		}
	};
	//处理上ajax返回动作
	const ajaxAction    = (data, opts) => {
		let target, des;
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
				} catch (e) {
				}
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
				let url = data.target;
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
				target   = $('form[name="' + data.target + '"]');
				let errs = data.args;
				let obj  = target.data('validateObj');
				if (obj) {
					obj.showErrors(errs);
				}
				break;
			default:
		}
		if (opts && opts.element && data.code && data.code <= 300) {
			let ajaxDone = opts.element.data('ajaxDone');
			if (ajaxDone) {
				let actions = ajaxDone.split(';');
				$.each(actions, function (i, ajaxDone) {
					let args = ajaxDone.split(':'), op = args[0];
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
								let loader = $(e).data('loaderObj');
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
	const showNotice    = (xhr) => {
		let message = getMsg(xhr);
		toast.error(message);
	};
	const getTarget     = (tag) => {
		if (typeof tag === 'string') {
			let target = tag.split(':');
			if (target.length === 2) {
				return target;
			}
		}
		return ['me', tag]
	};
	$('body').on('click', 'a[data-ajax]', doAjaxRequest)
		.on('click', 'button[data-ajax]', doAjaxRequest)
		.on('submit', 'form[data-ajax]', doAjaxRequest)
		.on('change', 'select[data-ajax]', doAjaxRequest)
		.on('change', 'input[data-ajax]', doAjaxRequest)
		.on('change', 'textarea[data-ajax]', doAjaxRequest)
		.on('ajax.send', '[data-loading]', function (e) {
			e.stopPropagation();
			let me = e.element;
			if (me.data('loading') !== undefined) {
				me.data('loading', layer.load(2));
			}
		}).on('ajax.done', '[data-loading]', function (e) {
		e.stopPropagation();
		let me = e.element;
		if (me.data('loading') !== undefined) {
			layer.close(me.data('loading'))
		}
	}).on('ajax.success', '[data-toggle]', function () {
		$(this).toggleClass('active');
	});
	//挂载ajax方法
	wulaui.ajax        = {
		confirm: confirmx,
		dialog : dialog,
		ajax   : $.ajax
	};
	window.ajaxActions = {
		reload(target) {
			if (target === 'document') {
				location.reload();
				return;
			}
			target = $(target);
			if (target.length) {
				let loader = target.data('loaderObj');
				if (loader) {
					loader.reload(null, true);
				}
			}
		},
		update(target, data) {
			target = $(target);
			if (target.length && data.args && data.args.content) {
				let append = data.args.append;
				if (append) {
					let d = $(data.args.content);
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
		click(target) {
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