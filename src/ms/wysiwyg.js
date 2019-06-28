layui.define(['jquery', 'laytpl', 'bootstrap', 'layer'], exports => {
    let $       = layui.$,
        jQuery  = $,
        layer   = layui.layer,
        tpl     = layui.laytpl,
        atagTpl = '<div class="pull-in">' +
            '<div class="form-group clearfix">' +
            '<div class="col-xs-4"><label>target</label><br/>' +
            '<select name="target"><option value="" selected>当前窗口</option><option value="_blank">新开窗口</option></select> ' +
            '</div>' +
            '<div class="col-xs-8"><label>标题</label><br/><input type="text" class="form-control" value="{{=d.title}}" name="title"></div>' +
            '</div>' +
            '<div class="form-group clearfix m-b-none">' +
            '<div class="col-xs-12"><label>URL</label><br/>' +
            '<input class="form-control" placeholder="URL" type="text" value="{{d.href}}" name="href">' +
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
            '<div class="form-group clearfix m-b-none">' +
            '<div class="col-xs-12"><label>图片地址</label><br/>' +
            '<input class="form-control" placeholder="SRC" type="text" value="{{d.src}}" name="src">' +
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
        let me = this, t = this;
        t.doc  = element.ownerDocument || document;
        try {
            // Disable image resize, try-catch for old IE
            t.doc.execCommand('enableObjectResizing', false, false);
            t.doc.execCommand('defaultParagraphSeparator', false, 'p');
        } catch (e) {
        }
        this.selectedRange      = null;
        this.editor             = $(element);
        let editor              = this.editor;
        let defaults            = {
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
            me.saveSelection();
            me.updateToolbar(editor, toolbarBtnSelector, options);
        }.bind(this));

        editor.on('dblclick', 'img', function (e) {
            e.stopPropagation();
            let a = $(this);
            layer.open({
                btn       : ['确认', '取消'],
                shadeClose: !0,
                title     : '编辑图片',
                content   : editImg($(this)),
                area      : ['500px', 'auto'],
                success   : function (tag) {
                    tag.find('[name=float][value=' + a.css('float') + ']').prop('checked', true);
                },
                yes       : function (idx, pa) {
                    let src    = pa.find('[name=src]').val(),
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
                    layer.close(idx);
                }
            });
            return false;
        }).on('dblclick', 'a', function (e) {
            e.stopPropagation();
            let a = $(this);
            layer.open({
                btn       : ['确认', '取消'],
                shadeClose: !0,
                title     : '编辑超链接',
                content   : editAtag($(this)),
                area      : ['500px', 'auto'],
                yes       : function (idx, pa) {
                    let tg   = pa.find('[name=target]').val(),
                        tl   = pa.find('[name=title]').val(),
                        href = pa.find('[name=href]').val();
                    a.removeAttr('target').removeAttr('title');
                    if (tg) {
                        a.attr('target', tg);
                    }
                    if (tl) {
                        a.attr('title', tl);
                    }
                    a.attr('href', href);
                    layer.close(idx);
                }
            });
            return false;
        });

        $(window).on("touchend", function (e) {
            let isInside     = (editor.is(e.target) || editor.has(e.target).length > 0),
                currentRange = me.getCurrentRange(),
                clear        = currentRange && (currentRange.startContainer === currentRange.endContainer && currentRange.startOffset === currentRange.endOffset);

            if (!clear || isInside) {
                me.saveSelection();
                me.updateToolbar(editor, toolbarBtnSelector, options);
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

    Wysiwyg.prototype.execCommand = function (commandWithArgs, valueArg) {

        let commandArr = commandWithArgs.split(" "),
            command    = commandArr.shift(),
            args       = commandArr.join(" ") + (valueArg || "");

        let parts = commandWithArgs.split("-");
        try {
            this.doc.execCommand('styleWithCSS', false, true);
        } catch (c) {
        }
        if (parts.length === 1) {
            this.doc.execCommand(command, false, args);
        } else if (parts[0] === "format" && parts.length === 2) {
            this.doc.execCommand("formatBlock", false, parts[1]);
        }

        this.editor.trigger("change");
        this.updateToolbar(this.editor, this.toolbarBtnSelector, this.options);
    };

    Wysiwyg.prototype.bindHotkeys = function (editor, options, toolbarBtnSelector) {
        let self = this;
        $.each(options.hotKeys, function (hotkey, command) {
            if (!command) return;

            $(editor).keydown(hotkey, function (e) {
                if (editor.attr("contenteditable") && $(editor).is(":visible")) {
                    e.preventDefault();
                    e.stopPropagation();
                    self.execCommand(command, null);
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
                } catch (ex) {
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
        if (this.doc.queryCommandSupported("hiliteColor")) {
            this.doc.execCommand("hiliteColor", false, color || "transparent");
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
            self.execCommand($(this).data(options.commandRole), null);
            self.saveSelection();
            //console.log([toolbar, toolbarBtnSelector, options]);
        });

        toolbar.find("[data-toggle=dropdown]").on('click', (function () {
            self.markSelection(options.selectionColor, options);
            //console.log(['dropdown',toolbar, toolbarBtnSelector, options]);
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
                self.execCommand($(this).data(options.commandRole), newValue);
            }
            self.saveSelection();
        }).on("blur", function () {
            self.markSelection(false, options);
        });
    };
    /*
     *  Represenets an editor
     *  @constructor
     *  @param {object} options - The default options selected by the user.
     *  @param {object} params  - The params for method
     */

    $.fn.wysiwyg = function (options, params) {
        let trumbowygDataName = 'wulawysiwyg';
        if (options === Object(options) || !options) {
            let editors = this.each(function () {
                if (!$(this).data(trumbowygDataName)) {
                    $(this).data(trumbowygDataName, new Wysiwyg(this, options));
                }
            });
            if (this.length === 1) {
                return $(this).data(trumbowygDataName);
            } else {
                return editors;
            }
        }
        if (this.length === 1) {
            try {
                let t = $(this).data(trumbowygDataName);
                switch (options) {
                    default:
                        return t;

                }
            } catch (e) {

            }
        }
        return null;
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