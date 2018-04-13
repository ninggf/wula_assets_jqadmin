($ => {
	let nuiCombox                    = function (combox) {
		let me      = this;
		this.combox = combox;
		combox.data('comboxObj', this);
		let opts       = {
			allowClear: true
		};
		this.isTagMode = combox.data('tagMode') !== undefined;
		this.parent    = combox.data('parent');
		this.url       = combox.data('combox');
		this.multiple  = combox.data('multi') !== undefined;
		if (this.multiple && combox.data('multi')) {
			opts.maximumSelectionSize = parseInt(combox.data('multi'), 10);
		}
		opts.placeholder        = combox.attr('placeholder') || '';
		opts.allowClear         = combox.data('allowClear') === 'false' ? false : opts.allowClear;
		opts.minimumInputLength = combox.data('mnl') ? parseInt(combox.data('mnl'), 10) : 0;

		if (this.isTagMode && this.multiple) {
			opts.separator       = ',';
			opts.tokenSeparators = [',', ' '];
			opts.tokenizer       = function (input, selection, selectCallback, opts) {
				if (input.length > 1) {
					let len = input.length, token = input.substring(len - 1,
						len);
					if (token === ',' || token === ' ') {
						let sl = selection.length;
						input  = input.replace(/[, ]+$/g, '');
						for (let i = 0; i < sl; i++) {
							if (input === selection[i].id) {
								me.comboxObj.select2('close');
								return;
							}
						}
						selectCallback({
							id  : input,
							text: input
						});
					}
				}
			};
		}
		if (!combox.is('select')) {
			opts.multiple      = this.multiple;
			opts.initSelection = function (element, callback) {
				let vars = $(element).val(), data = null, svar, values = [];
				if (me.multiple) {
					data = [{
						id  : '',
						text: ''
					}];
				} else {
					data = {
						id  : '',
						text: ''
					};
				}
				if (vars) {
					if (me.multiple) {
						vars = vars.split(',');
						data = [];
						for (let i in vars) {
							svar = vars[i].split(':');
							if (svar.length > 1) {
								data.push({
									id  : svar[0],
									text: svar[1]
								});
							} else {
								data.push({
									id  : svar[0],
									text: svar[0]
								});
							}
							values.push(svar[0]);
						}
					} else {
						vars = vars.split(':');
						if (vars.length > 1) {
							data = {
								id  : vars[0],
								text: vars[1]
							};
						} else {
							data = {
								id  : vars[0],
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
				cache      : true,
				data       : function (term, page) {
					let data = {
						q  : term,
						_cp: page,
					};
					if (me.parent) {
						data.p = $('#' + me.parent).val();
					}
					return data;
				},
				dataType   : 'json',
				url        : this.url,
				results    : function (data, page) {
					if (data.results) {
						return data;
					} else {
						return {results: data, more: false};
					}
				}
			};
		}
		this.options   = opts;
		this.comboxObj = combox.select2(this.options);
		if (this.parent) {
			let pCombox = $('#' + this.parent);
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
	nuiCombox.prototype.getCombox    = function () {
		return this.combox;
	};
	nuiCombox.prototype.setValue     = function (value) {
		if (!value) {
			value = this.multiple ? null : '';
		}
		this.combox.select2('val', value, true);
	};

	$.fn.wulauiCombox2 = function () {
		return $(this).each(function (i, e) {
			const $this = $(e), inited = $this.data('comboxObj');
			if (inited) {
				return;
			}
			new nuiCombox($this);
		});
	};

	//初始化combox
	$('body').on('wulaui.widgets.init', '.wulaui', function (e) {
		e.stopPropagation();
		let that = $(this).find('[data-combox]');
		if (that.length > 0)
			if ($.fn.select2) {
				that.wulauiCombox2();
			} else {
				layui.use('select2', () => {
					that.wulauiCombox2();
				});
			}
	});
})($);