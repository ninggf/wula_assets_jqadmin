(($, wui) => {
    // data-auto: auto-load data
    const nuiRepeater = function (table) {
        this.table    = table;
        this.data     = {};
        this.autoLoad = table.data('auto') !== undefined;
        this.source   = table.data('repeater');
        this.id       = table.attr('id');
        table.data('repeaterObj', this);
        table.data('formTarget', this);
        table.data('pagerTarget', this);
        table.data('loaderObj', this);
        if (this.id) {
            let sform = $('form[data-table-form="#' + this.id + '"]');
            if (sform.length === 0) {
                this.initData();
            }
        } else {
            this.initData();
        }
        this.table.trigger('wulaui.table.init');
    };

    nuiRepeater.prototype.initData = function () {
        if (this.autoLoad) {
            let me = this, limit = 10, pager = $('div[data-table-pager="#' + me.id + '"]');
            if (!this.data.cp) {
                if (pager.length === 1 && pager.data('limit')) {
                    limit = parseInt(pager.data('limit'), 10);
                }
                this.data.cp    = 1;
                this.data.limit = limit;
            } else if (pager.length === 1) {
                pager.data('limit', this.data.limit);
                pager.find('select').val(this.data.limit);
                if (this.pagerCtl) {
                    this.pagerCtl.limit   = this.data.limit;
                    this.pagerCtl.current = this.data.cp;
                }
            }
            this.inited = false;
            if (me.table.parents('.nui-dialog').length > 0) {
                setTimeout(function () {
                    me.reload();
                    me.inited = true;
                }, 200);
            } else {
                this.reload();
                this.inited = true;
            }
        }
    };
    nuiRepeater.prototype.doPage   = function (cp, limit, reload, ct) {
        if (this.data.cp !== cp || this.data.limit !== limit) {
            reload = true;
            ct     = 1;
        }
        this.data.cp = cp;
        if (limit) {
            this.data.limit = limit;
        }
        if (reload) {
            this.reload(null, ct);
        }
    };
    nuiRepeater.prototype.doSort   = function (field, order, cb) {
        if (this.data.sf !== field || this.data.dir !== order) {
            this.data.sf  = field;
            this.data.dir = order;
            this.reload(cb);
        }
    };
    nuiRepeater.prototype.reload   = function (cb, search) {
        if (!this.source) {
            return;
        }
        let me = this, data = [], pageit = false;
        if (me.searchForm) {
            data = me.searchForm.serializeArray();
        }
        if (search || !this.inited) {
            data.push({
                name : 'count',
                value: 1
            });
            pageit = true;
        }
        if (search) {
            this.data.cp = 1;
            if (this.pagerCtl) {
                this.pagerCtl.current = 1;
            }
        }

        data.push({
            name : 'pager[page]',
            value: this.data.cp
        });

        data.push({
            name : 'pager[size]',
            value: this.data.limit
        });

        if (this.data.sf) {
            data.push({
                name : 'sort[name]',
                value: this.data.sf
            });
            if (this.data.dir) {
                data.push({
                    name : 'sort[dir]',
                    value: this.data.dir
                });
            } else {
                data.push({
                    name : 'sort[dir]',
                    value: 'd'
                });
            }
        }

        $.ajax(me.source, {
            dataType: 'html',
            element : me.table,
            data    : data,
            method  : 'get'
        }).done(function (html) {
            html = $(html);
            html.addClass('repeater-body');
            let tb = me.table.find('.repeater-body');
            wui.destroy(tb);
            tb.remove();
            me.table.append(html);
            wui.init(html);
            if (me.pagerCtl && $.isFunction(me.pagerCtl.pageIt)) {
                let total = -1;
                if (pageit) {
                    let ot = html.data('total');
                    if (ot === '') {
                        total = -1;
                    } else {
                        total = parseInt(ot || 0, 10);
                    }
                }
                me.pagerCtl.pageIt(total);
            }
            if ($.isFunction(cb)) {
                cb(html);
            }
        });
    };
    nuiRepeater.prototype.form     = function (form) {
        if (form) {
            this.searchForm = form;
            this.initData();
        } else {
            return this.searchForm;
        }
    };
    nuiRepeater.prototype.pager    = function (pager) {
        if (pager) {
            this.pagerCtl = pager;
        } else {
            return this.pagerCtl;
        }
    };
    $.fn.wularepeater              = function (option) {
        let args = Array.apply(null, arguments);
        args.shift();
        return $(this).each(function (i, elm) {
            let table = $(elm);
            if (!table.data('repeaterObj')) {
                new nuiRepeater(table);
            } else {
                let data = table.data('repeaterObj');
                if (typeof option === 'string' && typeof data[option] === 'function') {
                    data[option].apply(data, args);
                }
            }
        });
    };

    $('body').on('wulaui.widgets.init', '.wulaui', function (e) {
        e.stopPropagation();
        $(this).find('[data-repeater]').wularepeater();
    })
})($, wulaui);