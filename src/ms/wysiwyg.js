layui.define(['jquery', 'laytpl', 'bootstrap'], exports => {
	let $       = layui.$,
		jQuery  = $,
		tpl     = layui.laytpl,
		atagTpl = '<div class="pull-in">' +
			'<div class="form-group clearfix">' +
			'<div class="col-xs-4"><label>target</label><br/><input type="text" class="form-control" value="{{d.target}}" name="target"></div>' +
			'<div class="col-xs-8"><label>标题</label><br/><input type="text" class="form-control" value="{{=d.title}}" name="title"></div>' +
			'</div>' +
			'<div class="form-group clearfix">' +
			'<div class="col-xs-12"><label>URL</label>' +
			'<div class="input-group">' +
			'<input class="form-control" placeholder="URL" type="text" value="{{d.href}}" name="href">' +
			'<span class="input-group-btn"><button class="btn btn-success btn-icon" type="button"><i class="fa fa-check-square"></i></button></span>' +
			'</div></div></div>',
		imgTpl  = '<div class="pull-in">' +
			'<div class="form-group clearfix">' +
			'<div class="col-xs-3"><label>宽</label><br/><input type="text" class="form-control" value="{{d.width}}" name="width"></div>' +
			'<div class="col-xs-3"><label>高</label><br/><input type="text" class="form-control" value="{{d.height}}" name="height"></div>' +
			'<div class="col-xs-6"><label>替换文本</label><br/><input type="text" class="form-control" value="{{=d.alt}}" name="alt"></div>' +
			'</div><div class="form-group clearfix"><div class="col-xs-12"><label>排版</label><br/><div>' +
			'<label class="checkbox-inline"><input type="radio" name="float" value="none">无</label>' +
			'<label class="checkbox-inline"><input type="radio" name="float" value="left">居左</label>' +
			'<label class="checkbox-inline"><input type="radio" name="float" value="right">居右</label>' +
			'</div></div></div>' +
			'<div class="form-group clearfix">' +
			'<div class="col-xs-12"><label>图片地址</label>' +
			'<div class="input-group">' +
			'<input class="form-control" placeholder="SRC" type="text" value="{{d.src}}" name="src">' +
			'<span class="input-group-btn"><button class="btn btn-success btn-icon" type="button"><i class="fa fa-check-square"></i></button></span>' +
			'</div></div></div>';

	/*
	 * hotkeys key handler
	 */
	function keyHandler(handleObj) {
		if (typeof handleObj.data === "string") {
			handleObj.data = {keys: handleObj.data};
		}

		// Only care when a possible input has been specified
		if (!handleObj.data || !handleObj.data.keys || typeof handleObj.data.keys !== "string") {
			return;
		}

		let origHandler             = handleObj.handler,
			keys                    = handleObj.data.keys.toLowerCase().split(" "),
			textAcceptingInputTypes = ["text", "password", "number", "email", "url", "range", "date", "month", "week", "time", "datetime", "datetime-local", "search", "color", "tel"];

		handleObj.handler = function (event) {
			// Don't fire in text-accepting inputs that we didn't directly bind to
			if (this !== event.target && (/textarea|select/i.test(event.target.nodeName) ||
				jQuery.inArray(event.target.type, textAcceptingInputTypes) > -1)) {
				return;
			}

			let special              = jQuery.hotkeys.specialKeys[event.keyCode],
				// character codes are available only in keypress
				character            = event.type === "keypress" && String.fromCharCode(event.which).toLowerCase(),
				modif = "", possible = {};

			// check combinations (alt|ctrl|shift+anything)
			if (event.altKey && special !== "alt") {
				modif += "alt+";
			}

			if (event.ctrlKey && special !== "ctrl") {
				modif += "ctrl+";
			}

			// TODO: Need to make sure this works consistently across platforms
			if (event.metaKey && !event.ctrlKey && special !== "meta") {
				modif += "meta+";
			}

			if (event.shiftKey && special !== "shift") {
				modif += "shift+";
			}

			if (special) {
				possible[modif + special] = true;
			}

			if (character) {
				possible[modif + character]                           = true;
				possible[modif + jQuery.hotkeys.shiftNums[character]] = true;

				// "$" can be triggered as "Shift+4" or "Shift+$" or just "$"
				if (modif === "shift+") {
					possible[jQuery.hotkeys.shiftNums[character]] = true;
				}
			}

			for (let i = 0, l = keys.length; i < l; i++) {
				if (possible[keys[i]]) {
					return origHandler.apply(this, arguments);
				}
			}
		};
	}

	function editAtag(a) {
		let opts = {
			href  : a.attr("href") || '',
			target: a.attr('target') || '',
			title : a.attr('title') || ''
		};

		return tpl(atagTpl).render(opts);
	}

	function editImg(a) {
		let opts = {
			src   : a.attr("src") || '',
			alt   : a.attr("alt") || '',
			width : a.css('width') || '',
			height: a.css('height') || '',
			float : a.css('float') || 'none'
		};

		return tpl(imgTpl).render(opts);
	}

	/*
	 *  Represenets an editor
	 *  @constructor
	 *  @param {DOMNode} element - The TEXTAREA element to add the Wysiwyg to.
	 *  @param {object} userOptions - The default options selected by the user.
	 */
	function Wysiwyg(element, userOptions) {

		// This calls the $ function, with the element as a parameter and
		// returns the jQuery object wrapper for element. It also assigns the
		// jQuery object wrapper to the property $editor on `this`.
		let me             = this;
		this.selectedRange = null;
		this.editor        = $(element).on('click', function () {
			$(this).find('a,img').removeAttr('data-original-title').popover('destroy');
		});
		let editor         = $(element);
		let defaults       = {
			hotKeys           : {
				"Ctrl+b meta+b"             : "bold",
				"Ctrl+i meta+i"             : "italic",
				"Ctrl+u meta+u"             : "underline",
				"Ctrl+f meta+f"             : "removeFormat",
				"Ctrl+z"                    : "undo",
				"Ctrl+y meta+y meta+shift+z": "redo",
				"Ctrl+l meta+l"             : "justifyleft",
				"Ctrl+r meta+r"             : "justifyright",
				"Ctrl+e meta+e"             : "justifycenter",
				"Ctrl+j meta+j"             : "justifyfull",
				"Shift+tab"                 : "outdent",
				"tab"                       : "indent"
			},
			toolbarSelector   : "[data-role=editor-toolbar]",
			commandRole       : "edit",
			activeToolbarClass: "btn-info",
			selectionMarker   : "edit-focus-marker",
			selectionColor    : "darkgray",
			dragAndDropImages : false,
			keypressTimeout   : 200,
			fileUploadError   : function (reason, detail) {
				//console.log("File upload error", reason, detail);
			}
		};

		let options             = $.extend(true, {}, defaults, userOptions);
		this.options            = options;
		let toolbarBtnSelector  = "a[data-" + options.commandRole + "],button[data-" + options.commandRole + "],input[type=button][data-" + options.commandRole + "]";
		this.toolbarBtnSelector = toolbarBtnSelector;
		this.bindHotkeys(editor, options, toolbarBtnSelector);

		this.bindToolbar(editor, $(options.toolbarSelector), options, toolbarBtnSelector);

		editor.attr("contenteditable", true).on("mouseup keyup mouseout", function () {
			this.saveSelection();
			this.updateToolbar(editor, toolbarBtnSelector, options);
		}.bind(this));

		editor.on('click', 'img', function (e) {
			e.stopPropagation();
			let a = $(this).popover({
				container: 'body',
				content  : editImg($(this)),
				html     : true,
				placement: 'auto bottom',
				viewport : '#' + me.editor.attr('id'),
				trigger  : 'manual',
				template : '<div class="popover imgtag-dlg" role="tooltip" style="width: 400px;max-width:400px"><div class="arrow"></div><div class="popover-content"></div></div>'
			}).on('shown.bs.popover', function () {
				let float = a.css('float');
				$('.imgtag-dlg').find('[name=float][value=' + float + ']').prop('checked', true);
				$('.imgtag-dlg button').on('click', function () {
					let pa     = $(this).closest('.imgtag-dlg'),
						src    = pa.find('[name=src]').val(),
						alt    = pa.find('[name=alt]').val(),
						width  = pa.find('[name=width]').val(),
						height = pa.find('[name=height]').val(),
						float  = pa.find('[name=float]:checked').val();
					a.attr('src', src).attr('alt', alt).css('width', width).css('height', height);
					if (float === 'none') {
						a.css('float', 'none');
					} else {
						a.css('float', float);
					}
					a.popover('destroy');
				});
			}).popover('show');
			return false;

		}).on('click', 'a', function (e) {
			e.stopPropagation();
			let a = $(this).popover({
				container: 'body',
				content  : editAtag($(this)),
				html     : true,
				placement: 'auto bottom',
				viewport : '#' + me.editor.attr('id'),
				trigger  : 'manual',
				template : '<div class="popover atag-dlg" role="tooltip" style="width: 400px;max-width:400px"><div class="arrow"></div><div class="popover-content"></div></div>'
			}).on('shown.bs.popover', function () {
				$('.atag-dlg button').on('click', function () {
					let pa   = $(this).closest('.atag-dlg'),
						tg   = pa.find('[name=target]').val(),
						tl   = pa.find('[name=title]').val(),
						href = pa.find('[name=href]').val();
					a.attr('target', tg).attr('title', tl).attr('href', href);
					a.popover('destroy');
				});
			}).popover('show');
			return false;
		});

		$(window).bind("touchend", function (e) {
			let isInside     = (editor.is(e.target) || editor.has(e.target).length > 0),
				currentRange = this.getCurrentRange(),
				clear        = currentRange && (currentRange.startContainer === currentRange.endContainer && currentRange.startOffset === currentRange.endOffset);

			if (!clear || isInside) {
				this.saveSelection();
				this.updateToolbar(editor, toolbarBtnSelector, options);
			}
		});
	}

	Wysiwyg.prototype.updateToolbar = function (editor, toolbarBtnSelector, options) {
		if (options.activeToolbarClass) {
			$(options.toolbarSelector).find(toolbarBtnSelector).each(function () {
				let self       = $(this);
				let commandArr = self.data(options.commandRole).split(" ");
				let command    = commandArr[0];

				// If the command has an argument and its value matches this button. == used for string/number comparison
				if (commandArr.length > 1 && document.queryCommandEnabled(command) && document.queryCommandValue(command) === commandArr[1]) {
					self.addClass(options.activeToolbarClass);
				}

				// Else if the command has no arguments and it is active
				else if (commandArr.length === 1 && document.queryCommandEnabled(command) && document.queryCommandState(command)) {
					self.addClass(options.activeToolbarClass);
				}

				// Else the command is not active
				else {
					self.removeClass(options.activeToolbarClass);
				}
			});
		}
	};

	Wysiwyg.prototype.execCommand = function (commandWithArgs, valueArg, editor, options, toolbarBtnSelector) {
		let commandArr = commandWithArgs.split(" "),
			command    = commandArr.shift(),
			args       = commandArr.join(" ") + (valueArg || "");

		let parts = commandWithArgs.split("-");

		if (parts.length === 1) {
			document.execCommand(command, false, args);
		} else if (parts[0] === "format" && parts.length === 2) {
			document.execCommand("formatBlock", false, parts[1]);
		}

		(editor || this.editor).trigger("change");
		this.updateToolbar(editor || this.editor, toolbarBtnSelector || this.toolbarBtnSelector, options || this.options);
	};

	Wysiwyg.prototype.bindHotkeys = function (editor, options, toolbarBtnSelector) {
		let self = this;
		$.each(options.hotKeys, function (hotkey, command) {
			if (!command) return;

			$(editor).keydown(hotkey, function (e) {
				if (editor.attr("contenteditable") && $(editor).is(":visible")) {
					e.preventDefault();
					e.stopPropagation();
					self.execCommand(command, null, editor, options, toolbarBtnSelector);
				}
			}).keyup(hotkey, function (e) {
				if (editor.attr("contenteditable") && $(editor).is(":visible")) {
					e.preventDefault();
					e.stopPropagation();
				}
			});
		});

		editor.keyup(function () {
			editor.trigger("change");
		});
	};

	Wysiwyg.prototype.getCurrentRange = function () {
		let sel, range;
		if (window.getSelection) {
			sel = window.getSelection();
			if (sel.getRangeAt && sel.rangeCount) {
				range = sel.getRangeAt(0);
			}
		} else if (document.selection) {
			range = document.selection.createRange();
		}

		return range;
	};

	Wysiwyg.prototype.saveSelection = function () {
		this.selectedRange = this.getCurrentRange();
	};

	Wysiwyg.prototype.restoreSelection = function () {
		let selection;
		if (window.getSelection || document.createRange) {
			selection = window.getSelection();
			if (this.selectedRange) {
				try {
					selection.removeAllRanges();
				}
				catch (ex) {
					document.body.createTextRange().select();
					document.selection.empty();
				}
				selection.addRange(this.selectedRange);
			}
		} else if (document.selection && this.selectedRange) {
			this.selectedRange.select();
		}
	};

	Wysiwyg.prototype.markSelection = function (color, options) {
		this.restoreSelection();
		if (document.queryCommandSupported("hiliteColor")) {
			document.execCommand("hiliteColor", false, color || "transparent");
		}
		this.saveSelection();
	};

	//Move selection to a particular element
	function selectElementContents(element) {
		if (window.getSelection && document.createRange) {
			let selection = window.getSelection();
			let range     = document.createRange();
			range.selectNodeContents(element);
			selection.removeAllRanges();
			selection.addRange(range);
		} else if (document.selection && document.body.createTextRange) {
			let textRange = document.body.createTextRange();
			textRange.moveToElementText(element);
			textRange.select();
		}
	}

	Wysiwyg.prototype.bindToolbar = function (editor, toolbar, options, toolbarBtnSelector) {
		let self = this;
		toolbar.find(toolbarBtnSelector).click(function () {
			self.restoreSelection();
			editor.focus();
			self.execCommand($(this).data(options.commandRole), null, editor, options, toolbarBtnSelector);
			self.saveSelection();
		});

		toolbar.find("[data-toggle=dropdown]").on('click', (function () {
			self.markSelection(options.selectionColor, options);
		}));

		toolbar.on("hide.bs.dropdown", function () {
			self.markSelection(false, options);
		});

		toolbar.find("input[type=text][data-" + options.commandRole + "]").on("webkitspeechchange change", function () {
			let newValue = this.value;  // Ugly but prevents fake double-calls due to selection restoration
			this.value   = "";
			self.restoreSelection();

			let text = window.getSelection();
			if (text.toString().trim() === '' && newValue) {
				//create selection if there is no selection
				self.editor.append('<span>' + newValue + '</span>');
				selectElementContents($('span:last', self.editor)[0]);
			}

			if (newValue) {
				editor.focus();
				self.execCommand($(this).data(options.commandRole), newValue, editor, options, toolbarBtnSelector);
			}
			self.saveSelection();
		}).on("blur", function () {
			//let input = $(this);
			self.markSelection(false, options);
		});

	};
	/*
	 *  Represenets an editor
	 *  @constructor
	 *  @param {object} userOptions - The default options selected by the user.
	 */

	$.fn.wysiwyg = function (userOptions) {
		return new Wysiwyg(this, userOptions);
	};

	$.hotkeys = {
		version: "0.8",

		specialKeys: {
			8  : "backspace", 9: "tab", 10: "return", 13: "return", 16: "shift", 17: "ctrl", 18: "alt", 19: "pause",
			20 : "capslock", 27: "esc", 32: "space", 33: "pageup", 34: "pagedown", 35: "end", 36: "home",
			37 : "left", 38: "up", 39: "right", 40: "down", 45: "insert", 46: "del",
			96 : "0", 97: "1", 98: "2", 99: "3", 100: "4", 101: "5", 102: "6", 103: "7",
			104: "8", 105: "9", 106: "*", 107: "+", 109: "-", 110: ".", 111: "/",
			112: "f1", 113: "f2", 114: "f3", 115: "f4", 116: "f5", 117: "f6", 118: "f7", 119: "f8",
			120: "f9", 121: "f10", 122: "f11", 123: "f12", 144: "numlock", 145: "scroll", 186: ";", 191: "/",
			220: "\\", 222: "'", 224: "meta"
		},

		shiftNums: {
			"`": "~", "1": "!", "2": "@", "3": "#", "4": "$", "5": "%", "6": "^", "7": "&",
			"8": "*", "9": "(", "0": ")", "-": "_", "=": "+", ";": ": ", "'": "\"", ",": "<",
			".": ">", "/": "?", "\\": "|"
		}
	};

	$.each(["keydown", "keyup", "keypress"], function () {
		$.event.special[this] = {add: keyHandler};
	});

	exports('wysiwyg', Wysiwyg);
});