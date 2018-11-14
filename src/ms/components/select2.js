($ => {
    let nuiCombox                    = function (combox) {
        let me      = this;
        this.combox = combox;
        combox.data('comboxObj', this);
        let opts       = {
            allowClear: true
        }, fr          = $.Event('combox.formatResult');
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
        opts.maximumInputLength = combox.data('mxl') ? parseInt(combox.data('mxl'), 10) : 200;
        opts.formatResult       = function (object, container, query) {
            fr.data  = object;
            fr.query = query;
            combox.trigger(fr);
            return fr.data.text;
        };
        opts.formatSelection    = function (object) {
            let fs      = $.Event('combox.formatSelection');
            fs.selected = object;
            combox.trigger(fs);
            return fs.selected.text;
        };
        opts.sortResults        = function (results) {
            return $.grep(results, function (e) {
                return !!e.text;
            });
        };
        if (this.isTagMode) {
            let tags = combox.data('tagMode');
            if (tags) {
                tags = tags.split(',');
            } else {
                tags = [''];
            }
            opts.tags            = tags;
            opts.separator       = ',';
            opts.tokenSeparators = [',', ' '];
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
                quietMillis: 500,
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
                results    : function (data) {
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
        combox.closest('.wulaui').on('wulaui.widgets.destroy', function () {
            me.comboxObj.select2('destroy');
        });
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