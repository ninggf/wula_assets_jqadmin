(($, layer, wulaui) => {
	const methods     = {
		required(value, element, param) {
			if (!this.depend(param, element)) {
				return "dependency-mismatch";
			}
			if (element.nodeName.toLowerCase() === "select") {
				let val = $(element).val();
				return val && val.length > 0;
			}
			if (this.checkable(element)) {
				return this.getLength(value, element) > 0;
			}
			return value.length > 0;
		},
		email(value, element) {
			return this.optional(element) || /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(value);
		},
		url(value, element) {
			return this.optional(element) || /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(value);
		},
		date(value, element) {
			return this.optional(element) || /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/.test(value);
		},
		number(value, element) {
			return this.optional(element) || /^(?:-?\d+|-?\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(value);
		},
		digits(value, element) {
			return this.optional(element) || /^(0|[1-9]\d*)$/.test(value);
		},
		minlength(value, element, param) {
			let length = $.isArray(value) ? value.length : this.getLength(value, element);
			return this.optional(element) || length >= param;
		},
		maxlength(value, element, param) {
			let length = $.isArray(value) ? value.length : this.getLength(value, element);
			return this.optional(element) || length <= param;
		},
		rangelength(value, element, param) {
			let length = $.isArray(value) ? value.length : this.getLength(value, element);
			return this.optional(element) || length >= param[0] && length <= param[1];
		},
		min(value, element, param) {
			return this.optional(element) || value >= param;
		},
		max(value, element, param) {
			return this.optional(element) || value <= param;
		},
		range(value, element, param) {
			return this.optional(element) || value >= param[0] && value <= param[1];
		},
		step(value, element, param) {
			let type           = $(element).attr("type"),
				errorMessage   = "Step attribute on input type " + type + " is not supported.",
				supportedTypes = ["text", "number", "range"],
				re             = new RegExp("\\b" + type + "\\b"),
				notSupported   = type && !re.test(supportedTypes.join()),
				decimalPlaces  = function decimalPlaces(num) {
					let match = ("" + num).match(/(?:\.(\d+))?$/);
					if (!match) {
						return 0;
					}
					return match[1] ? match[1].length : 0;
				},
				toInt          = function toInt(num) {
					return Math.round(num * Math.pow(10, decimals));
				},
				valid          = true,
				decimals;
			if (notSupported) {
				throw new Error(errorMessage);
			}
			decimals = decimalPlaces(param);
			if (decimalPlaces(value) > decimals || toInt(value) % toInt(param) !== 0) {
				valid = false;
			}
			return this.optional(element) || valid;
		},
		equalTo(value, element, param) {
			let target = $(param);
			return value === target.val();
		},
		passwd(value, element, param) {
			if (this.optional(element)) {
				return true;
			}
			switch (param) {
				case '2':
					return (/[a-z]/i.test(value) && /\d/.test(value) && /[^a-z\d]/i.test(value));
				case '3':
					return (/[A-Z]/.test(value) && /[a-z]/.test(value) && /\d/.test(value) && /[^a-z\d]/i.test(value));
				case '1':
				default:
					return (/[a-z]/i.test(value) && /\d/.test(value));
			}
		},
		pattern(value, element, param) {
			if (this.optional(element)) {
				return true;
			}
			if (typeof param === "string") {
				return (new RegExp("^(?:" + param + ")$")).test(value);
			}
			return param.test(value);
		},
		ip(value, element) {
			return this.optional(element) || /^(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)$/i.test(value);
		},
		phone(value, element) {
			return this.optional(element) || /^1[34578]\d{9}$/.test(value);
		},
	};
	const defaultMsgs = {
		required   : "这是必填字段",
		email      : "请输入合法的邮箱地址",
		url        : "请输入合法的URL",
		date       : "请输入合法的日期",
		number     : "请输入有效的数字",
		digits     : "只能输入数字",
		equalTo    : "你的输入不相同",
		maxlength  : "最多可以输入{0}个字符",
		minlength  : "最少要输入{0}个字符",
		rangelength: "请输入长度在{0}到{1}之间的字符串",
		range      : "请输入范围在{0}到{1}之间的数值",
		max        : "请输入不大于{0}的数值",
		min        : "请输入不大于{0}的数值",
		step       : "请输入{0}的倍数",
		passwd     : '你输入的密码不够强',
		pattern    : '请输入合法的格式',
		ip         : '请输入合法的IP地址',
		phone      : '请输入有效的手机号'
	};

	const Validator = function (form) {
		this.form = form;
		let me    = this,
			e     = new $.Event('form.init.rule');
		e.form    = this;
		//提交之前验证
		form.trigger(e).on('ajax.before', function () {
			return me.validate();
		}).on('blur', '[data-verify]:not(readonly):not(ignore)', function () {
			me.check($(this), this);
		});
	};

	$.extend(Validator, {
		prototype: {
			validate() {
				let that = this, checked = 0, total = 0;
				this.form.find('[data-verify]:not(readonly):not([ignore])').each(function (i, e) {
					if (that.check($(e), e) === true) {
						checked++;
					}
					total++;
				});
				return checked === total;
			},
			check(field, element) {
				let rules    = field.data('wulauiValidRules') || this.parseRules(field) || false,
					msgs     = field.data('wulauiValidMsgs') || {},
					val      = this.elementValue(element), rule, result, method,
					errorEle = this.createErrorEle(field, element);
				if (rules) {
					let rulesCount = $.map(rules, function (n, i) {
						return i;
					}).length;
					for (method in rules) {
						rule = {method: method, parameters: rules[method]};
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
			parseRules(field) {
				let rules = wulaui.params(field, 'verify');
				if (rules) {
					field.data('wulauiValidRules', rules);
					field.data('wulauiValidMsgs', wulaui.params(field, 'verifyMsg'));
					return rules;
				}
				return false;
			},
			getMsg(rule, msgs) {
				let theregex = /\$?\{(\d+)\}/g, msg;
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
			checkable(element) {
				return (/radio|checkbox/i.test(element.type))
			},
			depend(param, element) {
				let type = typeof param === "undefined" ? "undefined" : typeof(param);
				return this.dependTypes[type] ? this.dependTypes[type](param, element) : true;
			},
			dependTypes: {
				"boolean" : function (param) {
					return param;
				},
				"string"  : function (param, element) {
					return !!$(param, element.form).length;
				},
				"function": function (param, element) {
					return param(element);
				}
			},
			optional(element) {
				let val = this.elementValue(element);
				return !methods.required.call(this, val, element) && "dependency-mismatch";
			},
			objectLength(obj) {
				let count = 0, i;
				for (i in obj) {
					if (obj[i]) {
						count++;
					}
				}
				return count;
			},
			escapeCssMeta(string) {
				return string.replace(/([\\!"#$%&'()*+,./:;<=>?@\[\]^`{|}~])/g, "\\$1");
			},
			findByName(name) {
				return this.form.find("[name='" + this.escapeCssMeta(name) + "']");
			},
			createErrorEle(field) {
				let error = field.parent().find('span.valid-error');
				if (error.length > 0) {
					return error;
				} else {
					error = $('<span class="valid-error"/>');
					error.appendTo(field.parent());
					return error;
				}
			},
			getLength(value, element) {
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
			elementValue(element) {
				let $element = $(element),
					type     = element.type.toLowerCase(),
					val      = void 0,
					idx      = void 0;

				if (type === "radio" || type === "checkbox") {
					let elements = this.findByName(element.name);
					if (elements.length > 1) {
						let vals = [];
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
			showErrors(errors) {
				let me = this;
				$.each(errors, function (i, e) {
					let error = me.createErrorEle($('[name="' + me.escapeCssMeta(i) + '"]:first'));
					error.html(e).show();
				});
			}
		}
	});

	$.fn.wulaform = function () {
		let me = $(this);
		if (me.length) {
			me.each(function () {
				let $this = $(this);
				if (!$this.data('validateObj')) {
					$this.data('validateObj', new Validator($this));
				}
			});
		}
		return me;
	};

	wulaui.validator = {
		method(name, method, message) {
			methods[name]     = method;
			defaultMsgs[name] = message !== undefined ? message : '此项填写不合法';
		},
		validate(ele, errors) {
			let form = $(ele), validator = form.data('validateObj');
			if (validator) {
				if (errors) {
					validator.showErrors(errors);
				} else {
					validator.validate();
				}
			}
		},
		get(elem) {
			let form = $(elem), validator = form.data('validateObj');
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