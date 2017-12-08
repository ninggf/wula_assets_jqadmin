(($, wui) => {
	let ajax                = wui.ajax;
	//自动加载
	$.fn.wulauiLoad         = function () {
		return $(this).each((i, e) => {
			let me = $(e), inited = me.data('loaderObj');
			if (!inited) {
				me.data('loaderObj', new doLoad(me));
			}
		})
	};
	$.fn.reload             = function (url, force) {
		return $(this).each((i, e) => {
			let inited = $(e).data('loaderObj');
			if (inited) {
				if (url) {
					$(e).data('load', url);
				}
				inited.reload(null, force);
			}
		})
	};
	const doLoad            = function (element) {
		this.autoload = element.data('auto') !== undefined;
		this.lazy     = element.data('lazy') !== undefined;
		this.element  = element;
		if (this.autoload) {
			this.reload();
		}
	};
	// reload
	doLoad.prototype.reload = function (cb, force) {
		_doLoad.apply(this, [force]);
	};
	const _doLoad           = function (force) {
		let ourl = this.url ? this.url : '';
		this.url = this.element.data('load');
		if (!this.url || (!force && this.lazy && ourl === this.url)) {
			return;
		}
		let be           = $.Event('ajax.build');
		be.opts          = $.extend({element: this.element}, this.element.data() || {});
		be.opts.url      = this.url;
		be.opts.method   = 'GET';
		be.opts.action   = 'update';
		be.opts.dataType = 'html';
		be.opts.target   = this.element;

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