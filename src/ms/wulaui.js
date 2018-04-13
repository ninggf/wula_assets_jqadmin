layui.define(['jquery', 'layer', 'toastr'], function (exports) {
	let $                    = layui.$,
		layer                = layui.layer,
		WulaUI               = function () {
			let cfg     = layui.data('wulaui');
			this.config = $.extend({}, {
				base  : '/',
				assets: '/assets/',
				medias: [],
				groups: {char: [], prefix: []},
				ids   : {}
			}, cfg.config);
		}, getParams         = function (obj, attr) {
			let params = obj.data(attr) || obj.attr(attr);
			if (params) {
				if (typeof(params) === "string") {
					try {
						return new Function("return {" + params + "}")();
					} catch (e) {
						return {};
					}
				}
			}
			return params;
		};
	WulaUI.prototype.toast   = top.global && top.global.toast ? top.global.toast : layui.toastr;
	WulaUI.prototype.layer   = top.global && top.global.layer ? top.global.layer : layui.layer;
	WulaUI.prototype.app     = function (url) {
		if (typeof(url) === "string") {
			let config = this.config,
				chunks = url.split('/');
			if (chunks[0].match(/^([~!@#%\^&\*])(.+)$/)) {
				let id     = RegExp.$2,
					prefix = RegExp.$1;
				if (config.ids && config.ids[id]) {
					id = config.ids[id];
				}
				if (config.groups && config.groups.char) {
					for (let i = 0; i < config.groups.char.length; i++) {
						if (config.groups.char[i] === prefix) {
							prefix = config.groups.prefix[i];
							break;
						}
					}
				}
				chunks[0] = prefix + id;
			} else {
				let id = chunks[0];
				if (config.ids && config.ids[id]) {
					id        = config.ids[id];
					chunks[0] = id;
				}
			}
			chunks[0] = config.base + chunks[0];
			url       = chunks.join('/');
		}
		return url;
	};
	WulaUI.prototype.media   = function (url) {
		if (/^(\/|https?:\/\/).+/.test(url)) {
			return url;
		}
		if (this.config.medias) {
			let medias = this.config.medias, idx = parseInt(Math.random() * 200) % medias.length;
			return medias[idx] + url;
		}
		return this.config.base + url;
	};
	WulaUI.prototype.assets  = function (url) {
		if (/^(\/|https?:\/\/).+/.test(url)) {
			return url;
		}
		return this.config.assets + url;
	};
	WulaUI.prototype.open    = function (obj) {
		if (top.global && top.global.menu) {
			let menu = top.global.menu;
			menu.menuOpen(obj);
		}
	};
	WulaUI.prototype.init    = function (e) {
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
	WulaUI.prototype.dialog  = function (opts, e) {
		let _area = ["auto", "auto"], ajax = false, idx = 0;
		if (e) {
			let be     = $.Event('before.dialog');
			be.options = opts;
			e.trigger(be);
		}
		if (parseInt(opts.type) === 2) {
			if (opts.data)
				opts.content = opts.content + (opts.content.indexOf('?') >= 0 ? "&" : "?") + opts.data;
		} else if (opts.type === 'ajax') {
			ajax = true;
			if (opts.data)
				opts.content = opts.content + (opts.content.indexOf('?') >= 0 ? "&" : "?") + opts.data;
		} else {
			opts.content = $(opts.content);
		}
		if (opts.area !== "" || opts.area !== "auto,auto") {
			_area        = opts.area.split(',');
			let width    = parseInt(_area[0]),
				maxWidth = $(window).width() - 20;
			if (width > maxWidth) {
				_area[0] = (maxWidth) + "px";
			}
			let height    = parseInt(_area[1]),
				maxHeight = $(window).height() - 20;
			if (height > maxHeight) {
				_area[1] = (maxHeight) + "px";
			}
		}
		if (ajax) {
			opts.type        = 1;
			opts.success     = function (o) {
				wulaui.init(o);
				opts.$content = o;
			};
			opts.beforeClose = function () {
				wulaui.destroy(opts.$content);
			};
			wulaui.ajax.ajax(opts.content, {
				element : e || $('body'),
				dataType: 'html',
				method  : 'get'
			}).done(data => {
				opts.type    = 1;
				opts.content = data;
				if (!opts.area) {
					idx = layer.open(opts);
					layer.full(idx);
				} else {
					opts.area = _area;
					idx       = layer.open(opts);
				}
				if (e) {
					e.data('dialogId', idx);
				}
			});
		} else {
			if (!opts.area) {
				idx = layer.open(opts);
				layer.full(idx);
			} else {
				opts.area = _area;
				idx       = layer.open(opts);
			}
			if (e) {
				e.data('dialogId', idx);
			}
		}
	};
	WulaUI.prototype.params  = getParams;
	WulaUI.prototype.format  = function (source, params) {
		if (arguments.length === 1) {
			return function () {
				let args = $.makeArray(arguments);
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

	let wulaui = new WulaUI();
	//注册事件
	$('body').on('click', '[data-tab]', function () {
		let that  = $(this),
			href  = that.attr('href') || that.data('url'),
			title = that.attr('title') || that.data('title') || that.text() || '新窗口',
			icon  = that.data('tab') || '&#xe621;',
			cls   = that.data('cls') || null,
			data  = {
				href : href,
				icon : icon,
				cls  : cls,
				title: title
			};
		if (href) {
			wulaui.open(data);
		}
		if (that.is('a') && that.closest('ul').is('.dropdown-menu')) {
			that.closest('ul').closest('.open').removeClass('open');
		}
		return false;
	}).on('click', '[data-dialog]', function () {
		try {
			let that  = $(this), opts = {
				type   : that.data('dialog') || 2,
				title  : that.attr('title') || that.data('title') || that.text(),
				content: that.attr('href') || that.data('url'),
				area   : ''
			}, params = getParams(that, 'params'), area = that.data('area');
			opts      = $.extend({}, opts, params);
			if (area) {
				opts.area = area;
			}
			wulaui.dialog(opts, that);
		} catch (e) {
			console.log(e);
		}
		return false;
	}).on('click', '[data-toggle^="class"]', function (e) {
		e && e.preventDefault();
		let $this = $(e.target), $class, $target, $tmp, $classes, $targets;
		!$this.data('toggle') && ($this = $this.closest('[data-toggle^="class"]'));
		$class  = $this.data()['toggle'];
		$target = $this.data('target') || $this.attr('href');
		$class && ($tmp = $class.split(':')[1]) && ($classes = $tmp.split(','));
		$target && ($targets = $target.split(','));
		$targets && $targets.length && $.each($targets, function (index, e) {
			(e !== '#') && $(e).toggleClass($classes[index]);
		});
		$this.toggleClass('active');
	}).on('focus', '[data-expend]', function () {
		let $this = $(this), ow = $this.data('owidth') || $this.width(), nw = $this.data('expend');
		$this.data('owidth', ow);
		if (nw) {
			$this.width(nw);
		}
	}).on('blur', '[data-expend]', function () {
		let $this = $(this), ow = $this.data('owidth');
		if (ow) {
			$this.width(ow);
		}
	});
	//引入wulaui扩展
	//=require components/ajax.js
	//=require components/loader.js
	//=require components/form.js
	//=require components/validate.js
	//=require components/table.js
	//=require components/table-plg-pager.js
	//=require components/table-plg-searchform.js
	//=require components/uploader.js
	//=require components/popmenu.js
	//=require components/select2.js
	//=require components/datepicker.js
	//=require components/tree.js
	//end

	wulaui.init();
	exports('wulaui', wulaui)
});