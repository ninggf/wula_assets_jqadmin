($ => {
	const prepareValidateRule      = function (rules) {
		rules = rules || {};
		if ('object' !== typeof rules) {
			try {
				rules = $.parseJSON(rules);
			} catch (e) {
				rules = {};
				console.log(e.message);
			}
		}
		if (rules.rules) {
			for (let i in rules.rules) {
				for (let j in rules.rules[i]) {
					if (j === 'pattern') {
						eval('var rule = ' + rules.rules[i][j] + ';');
						rules.rules[i][j] = rule;
					}
				}
			}
		}
		return rules;
	};
	const errorPlacement           = function (error, element) {
		if (element.is('[type=checkbox]') || element.is('[type=radio]')) {
			let wrap = element.closest('div');

			if (wrap.is('.checkbox') || wrap.is('.radio')) {
				wrap = wrap.parent().closest('div');
			}

			if (wrap.children('span').length) {
				error.insertBefore(wrap.children('span'));
			} else {
				error.appendTo(wrap);
			}
		} else {
			let e = $.Event('form.placement');
			element.trigger(e, [error, element]);
			if (!e.isDefaultPrevented()) {
				error.insertAfter(element);
			}
		}
	};
	const Validator                = function (form) {
		this.form                 = form;
		this.rules                = prepareValidateRule(form.data('validate'));
		this.rules.errorPlacement = errorPlacement;
		this.rules.onsubmit       = false;
		this.rules.ignoreTitle    = true;
		this.rules.errorClass     = 'parsley-error';
		this.rules.validClass     = 'parsley-success';
		this.rules.wrapper        = 'ul';
		this.rules.wrapperClass   = 'parsley-error-list';
		this.rules.errorElement   = 'li';
		//可以通过事件定制高级验证规则
		let e                     = new $.Event('form.init.rule');
		e.form                    = this;
		this.form.trigger(e);

		this.validator = form.validate(this.rules);
		let me         = this;
		form.on('ajax.before', function () {
			return me.validate();
		});
		const destroy = function () {
			me.destroy();
			me.form.closest('.wulaui').off('wulaui.widgets.destroy', destroy);
		};
		//注册销毁事件
		form.closest('.wulaui').on('wulaui.widgets.destroy', destroy);
	};
	//验证
	Validator.prototype.validate   = function (errors) {
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
	Validator.prototype.showErrors = function (errors) {
		this.validate(errors)
	};
	//销毁
	Validator.prototype.destroy    = function () {
		if (this.validator) {
			this.validator.destroy();
			this.validator = null;
			this.rules     = null;
		}
	};

	$.fn.wulavalidate = function () {
		let me = $(this);
		if (me.length) {
			$.validator.defaults.ignore = '.ignore';
			me.each(function () {
				let $this = $(this);
				if (!$this.data('validateObj')) {
					$this.data('validateObj', new Validator($this));
				}
			});
		}
		return me;
	};

	$('body').on('wulaui.widgets.init', '.wulaui', function (e) {
		e.stopPropagation();
		let v = $(this).find('form[data-validate]');
		if (v.length > 0) {
			layui.use(['validate'], () => {
				v.wulavalidate();
			})
		}
	});
})($);