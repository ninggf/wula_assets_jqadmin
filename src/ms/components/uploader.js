(($, wui) => {
    let defaultOpts   = {
        c              : false,
        runtimes       : 'html5',
        max_file_count : 1,
        chunk_size     : '256k',
        chunks         : true,
        multi_selection: false,
        max_file_size  : '28mb',
        filters        : [{
            title             : "*.*",
            extensions        : "jpg,gif,png,jpeg",
            prevent_duplicates: true
        }]
    };
    //预览文件
    const PreviewFile = function (file, id) {
        this.file        = file;
        this.id          = id;
        this.name        = file.name;
        this.previewable = /.+\.(png|gif|jpg|jpeg|bmp)/i.test(this.name);
        if (this.previewable) {
            let img       = $(this.id).get(0);
            let reader    = new FileReader();
            reader.onload = function (evt) {
                img.src = evt.target.result;
            };
            reader.readAsDataURL(this.file);
        } else {
            $(this.id).attr('src', wui.config.assets + 'dat.jpg');
        }
    };

    //文件上传器
    const nuiUploader = function (elem) {
        elem.data('uploaderObj', this);
        let $this       = this;
        this.element    = elem;
        this.form       = elem.closest('form[data-ajax]');
        this.value      = elem.data('value');
        this.varName    = elem.data('name');
        this.auto       = elem.data('auto') !== undefined;
        this.extensions = elem.data('exts') || 'jpg,gif,png,jpeg';
        this.width      = elem.data('width') || 90;
        this.height     = elem.data('height') || this.width;
        this.readonly   = elem.data('readonly') !== undefined;
        this.whstyle    = 'width:' + this.width + 'px;height:' + this.height + 'px;';
        this.isLocal    = elem.data('localStore') !== undefined;
        let opts        = {
            multipart_params: {}
        };
        if (this.extensions) {
            opts.filters = [{
                title     : '*.*',
                extensions: this.extensions
            }];
        }
        let cnt    = elem.data('multi');
        this.multi = parseInt(cnt ? cnt : '1', 10) || 1;
        if (this.multi > 1) {
            opts.max_file_count  = this.multi;
            opts.chunks          = true;
            opts.chunk_size      = '512k';
            opts.multi_selection = true;
            this.varName += '[]';
        } else {
            this.multi = 1;
        }

        this.mfs = elem.data('maxFileSize');
        if (this.mfs) {
            opts.max_file_size = this.mfs;
        }

        let resize = elem.data('resize');
        if (resize) {
            let rss                      = resize.split(',');
            opts.resize                  = {};
            opts.resize.width            = rss[0];
            opts.resize.height           = rss[0];
            opts.resize.preserve_headers = false;
            if (rss.length >= 2 && rss[1]) {
                opts.resize.height = rss[1];
            }
            if (rss.length >= 3 && rss[2]) {
                opts.resize.quality = rss[2];
            }
            if (rss.length >= 4 && rss[3]) {
                opts.resize.crop = true;
            }
        }
        this.opts = $.extend({}, defaultOpts, opts);

        this.noWatermark = elem.data('noWater');//强制不添加水印
        if (this.noWatermark !== undefined) {
            this.opts.multipart_params = {
                nowater: 1
            };
        }
        //fid，用于防止文件上传错误
        this.opts.multipart_params.fid = Math.random() * 10000000;
        // 删除文件
        const removeFile               = function () {
            let up     = $this.uploader;
            let parent = $(this).parent();
            let fileId = parent.find('input').attr('id');
            let f      = up.getFile(fileId);
            if (f) {
                up.removeFile(f);
                $this.newFile--;
            }
            let url = parent.find('input').val();
            if (url) {
                let e = $.Event('uploader.remove');
                $this.element.trigger(e, [url]);
                if (!e.isDefaultPrevented()) {
                    parent.remove();
                    $this.uploadBtn.show();
                }
            } else {
                parent.remove();
                $this.uploadBtn.show();
            }
            if ($this.wrapper.find('input').length === 0) {
                $this.uploadBtn.append('<input type="hidden" id="empty-f-' + $this.id + '" name="' + $this.varName + '" value=""/>');
            }
        };
        //销毁
        const destroy                  = function () {
            elem.off('form.placement');
            if ($this.uploader) {
                $this.uploader.destroy();
                $this.wrapper = null;
                elem.data('uploaderObj', null);
                $(this).off('wulaui.widgets.destroy', destroy);
                delete $this.uploader;
            }
        };
        elem.closest('.wulaui').on('wulaui.widgets.destroy', destroy);
        this.id    = elem.attr('id');
        this.btnId = 'uploadimg-' + this.id;
        if (elem.hasClass('input-group')) {
            this._init2(removeFile, elem);
        } else {
            this._init1(removeFile, elem);
        }
        //全部上传完全
        this.uploader.bind('UploadComplete', (up, files) => {
            up.disableBrowse(false);
            if (files.length > 0) {
                for (let i = 0; i < files.length; i++) {
                    up.removeFile(files[i]);
                }
                $this.newFile = up.files.length;
            }
            if ($this.newFile === 0) {
                if ($this.element.hasClass('pendup')) {
                    $this.element.removeClass('pendup');
                    if ($this.form.length > 0 && $this.form.find('[data-uploader].pendup').length === 0) {
                        $this.form.submit();//再次提交
                    }
                } else {
                    $this.element.trigger('uploader.done');
                }
            } else if ($this.form.length > 0) {
                $this.form.trigger('uploader.error', [$this.element]);
            }
        });
    };

    nuiUploader.prototype.start  = function () {
        if (this.newFile > 0) {
            this.uploader.start();
        } else {
            this.element.trigger('uploader.done');
            if (this.element.hasClass('pendup')) {
                this.element.removeClass('pendup');
            }
            if (this.form.length > 0) {
                this.form.trigger('uploader.done');
            }
        }
    };
    nuiUploader.prototype.stop   = function () {
        this.uploader.stop();
    };
    nuiUploader.prototype.get    = function () {
        return this.uploader;
    };
    nuiUploader.prototype.clear  = function () {
        this.wrapper.find('li').not(this.uploadBtn).find('i').click();
        this.uploader.splice(0);
        this.uploader.refresh();
        this.uploader.disableBrowse(false);
        this.uploadBtn.show();
    };
    nuiUploader.prototype._init1 = function (removeFile, elem) {
        let $this    = this;
        this.wrapper = $('<ul class="upload-img-box"><li class="uploadimg-btn"><a href="javascript:void(0);" style="' + this.whstyle + '" id="' + this.btnId + '"></a></li><br class="clearfix"/></ul>');
        elem.append(this.wrapper);
        this.uploadBtn          = this.wrapper.find('.uploadimg-btn');
        this.opts.browse_button = this.btnId;
        this.opts.url           = elem.data('uploader') || '';
        let uploader            = new plupload.Uploader(this.opts);
        this.uploader           = uploader;
        this.newFile            = 0;
        //有值
        if (this.value) {
            if (this.multi === 1) {
                this.value = [this.value];
            }
            if ($.isArray(this.value)) {
                $.each(this.value, (i, e) => {
                    let html = '<li id="up-file' + i + '">';
                    html += '<img id="img_file' + i + '" src="' + ($this.isLocal ? wui.base(e) : wui.media(e)) + '" style="' + $this.whstyle + '"/>';
                    html += '<span class="fsrc">' + e + '</span>';
                    if (!$this.readonly) {
                        html += '<i>×</i>';
                    }
                    html += '<input type="hidden" id="old-file' + i + '" name="' + $this.varName + '" value="' + e + '"/>';
                    html += '</li>';
                    let imgEle = $(html);
                    $this.uploadBtn.before(imgEle);
                    imgEle.on('click', 'i', removeFile);
                });
                let imgNum = $this.wrapper.find('input').length;
                if (imgNum >= $this.multi) {
                    $this.uploadBtn.hide();
                }
            }
        } else {
            this.uploadBtn.append('<input type="hidden" id="empty-f-' + this.id + '" name="' + this.varName + '" value=""/>');
        }
        if (this.readonly) {
            this.uploadBtn.remove();
        }
        uploader.init();

        uploader.bind('BeforeUpload', function (up, file) {
            let id = '#up-' + file.id;
            $(id + ' .progress').show();
        });

        //添加文件
        uploader.bind('FilesAdded', function (up, files) {
            let fileInput = document.getElementById(up.id + '_' + up.runtime), imgNum;
            $this.uploadBtn.find('input').remove();

            if ($this.auto) {
                up.disableBrowse(true);
            }

            for (let i in files) {
                imgNum = $this.wrapper.find('input').length;
                if (imgNum + 1 > $this.multi) {
                    up.splice($this.newFile);
                    break;
                }
                let file = files[i], rfile = null;
                for (let j in fileInput.files) {
                    if (fileInput.files[j].name === file.name && fileInput.files[j].size === file.size) {
                        rfile = fileInput.files[j];
                    }
                }
                if (!rfile) {
                    continue;
                }
                $this.newFile++;

                let html   = '<li id="up-' + file.id + '">';
                html += '<img id="img_' + file.id + '" src="' + wui.config.assets + 's.gif" style="' + $this.whstyle + '"/>';
                html += '<div class="progress progress-xs" style="display:none;width: ' + $this.width + 'px"><div class="progress-bar progress-bar-info"></div></div>';
                html += '<span class="fsrc">' + file.name + '</span>';
                html += '<span class="fsize">' + (file.size / 1000).toFixed(1) + 'K</span>';
                html += '<i>+</i>';
                html += '<input type="hidden" id="' + file.id + '" name="' + $this.varName + '"/>';
                html += '</li>';
                let imgEle = $(html);
                $this.uploadBtn.before(imgEle);
                new PreviewFile(rfile, '#img_' + file.id);
                imgEle.on('click', 'i', removeFile);
            }
            if (++imgNum >= $this.multi) {
                $this.uploadBtn.hide();
            }
            if ($this.auto && $this.newFile > 0) {
                up.start();
            } else if ($this.newFile > 0) {
                $this.element.addClass('pendup');
            }
        });
        //上传进度
        uploader.bind('UploadProgress', (up, file) => {
            let id = '#up-' + file.id;
            $(id + ' .progress-bar').css('width', file.percent + '%');
        });
        // 上传完成
        uploader.bind('FileUploaded', (up, file, resp) => {
            let id = file.id, idx = '#up-' + id, pbar = $(idx + ' .progress-bar'), msg = null;
            pbar.removeClass('progress-bar-info');
            if (file.status === plupload.DONE) {
                try {
                    let result = $.parseJSON(resp.response);
                    let rst    = result.result, err = result.error;
                    if (rst) {
                        $(idx + ' input').val(rst.url);
                        try {
                            $this.element.trigger('uploader.uploaded', [rst, $(idx)]);
                        } catch (ee) {
                        }
                        pbar.addClass('progress-bar-success');
                    } else {
                        //
                        if (err && err.message) {
                            msg = err.message;
                        } else {
                            msg = '文件上传失败';
                        }
                    }
                } catch (e) {
                    msg = e.message;
                }
            } else {
                msg = '上传失败:未知错误';
            }
            if (msg) {
                uploader.removeFile(file);
                $this.element.trigger('uploader.error', [msg, $(idx)]);
                if (!$this.auto && $this.form.length > 0) {
                    $this.form.trigger('uploader.error', [$this.element, msg]);
                }
                if ($this.auto) {
                    wui.layer.alert(msg, {
                        icon: 2, title: null, btn: null, shadeClose: true, resize: false, end: function () {
                            removeFile.call($(idx + ' i'));
                        }
                    });
                }
            }
        });
        //上传失败
        uploader.bind('Error', (up, file) => {
            up.disableBrowse(false);
            let id = file.file ? file.file.id : file.id, msg = '文件上传出错', needRm = false, msgSet = false;
            if (file.status) {
                try {
                    let res = $.parseJSON(file.response);
                    if (res && res.error && res.error.message) {
                        msg    = res.error.message;
                        msgSet = true;
                    }
                } catch (e) {

                }
                if (!msgSet) {
                    switch (file.status) {
                        case 403:
                            msg = '无权限上传';
                            break;
                        case 404:
                            msg = '上传地址不存在';
                            break;
                        case 500:
                        case 502:
                        case 503:
                            msg = '服务器出错啦[' + file.status + ']';
                            break;
                        default:
                            msg = '网络出错';
                    }
                }
                uploader.removeFile(file.file);
                needRm = true;
                if (!$this.auto && $this.form.length > 0) {
                    $this.form.trigger('uploader.error', [$this.element, msg]);
                }
            } else if (file.message) {
                msg = file.message;
            }
            $this.element.trigger('uploader.error', [msg, needRm ? $('#up-' + id) : null]);

            if ($this.auto || !needRm) {
                wui.layer.alert(msg, {
                    icon: 2, title: null, btn: null, shadeClose: true, resize: false, end: function () {
                        if (needRm)
                            removeFile.call($('#up-' + id + ' i'));
                    }
                });
            }
        });
    };
    nuiUploader.prototype._init2 = function (removeFile, elem) {
        this.inputEle = $('<input type="text" class="form-control" autocomplete="off" id="file-' + this.id + '" name="' + this.varName + '"/>');
        this.inputEle.val(this.value);
        this.btnEle = $('<span class="input-group-addon"><em>x</em><i class="fa fa-upload" id="' + this.btnId + '" style="cursor: pointer"></i></span>');
        elem.append(this.inputEle).append(this.btnEle);
        if (this.readonly) {
            this.inputEle.attr('readonly', 'true');
            return;
        }
        this.opts.browse_button = this.btnId;
        this.opts.url           = elem.data('uploader') || '';
        let uploader            = new plupload.Uploader(this.opts), $this = this;
        this.uploader           = uploader;
        this.fileTitle          = '';
        uploader.init();
        uploader.bind('FilesAdded', function (up, files) {
            if (up.files.length > 1) {
                up.splice(0, up.files.length - 1);
            }
            $this.inputEle.val(files[0].name + '（' + (files[0].size / 1000).toFixed(1) + 'KB）').removeClass('parsley-error');
            $this.fileTitle = files[0].name;
            $this.newFile   = up.files.length;
            if (!$this.auto) {
                $this.element.addClass('pendup');
            } else {
                up.start();
            }
        });
        //上传进度
        uploader.bind('UploadProgress', (up, file) => {
            $this.inputEle.val($this.fileTitle + ' - ' + file.percent + '%');
        });
        uploader.bind('FileUploaded', (up, file, resp) => {
            let msg = null;
            if (file.status === plupload.DONE) {
                try {
                    let result = $.parseJSON(resp.response);
                    let rst    = result.result, err = result.error;
                    if (rst) {
                        $this.inputEle.val(rst.url).removeClass('parsley-error');
                        $this.element.trigger('uploader.uploaded', [rst, $this.inputEle]);
                    } else {
                        if (err && err.message) {
                            msg = err.message;
                        } else {
                            msg = '文件上传出错';
                        }
                    }
                } catch (e) {
                    msg = e.message;
                }
            } else {
                msg = '上传失败:未知错误';
            }
            if (msg) {
                uploader.removeFile(file);
                $this.inputEle.val('').addClass('parsley-error');
                $this.element.trigger('uploader.reset', [$this.inputEle]);
                if ($this.auto) {
                    wui.layer.alert(msg, {
                        icon: 2, title: null, btn: null, shadeClose: true, resize: false
                    });
                } else if ($this.form.length > 0) {
                    $this.form.trigger('uploader.error', [$this.element, msg]);
                }
            }
        });
        uploader.bind('Error', (up, file) => {
            let msg = '文件上传出错', needRm = false, msgSet = false;
            if (file.status) {
                try {
                    let res = $.parseJSON(file.response);
                    if (res && res.error && res.error.message) {
                        msg    = res.error.message;
                        msgSet = true;
                    }
                } catch (e) {

                }
                if (!msgSet) {
                    switch (file.status) {
                        case 403:
                            msg = '无权限上传';
                            break;
                        case 404:
                            msg = '上传地址不存在';
                            break;
                        case 500:
                        case 502:
                        case 503:
                            msg = '服务器出错啦[' + file.status + ']';
                            break;
                        default:
                            msg = '网络出错';
                    }
                }
                uploader.removeFile(file.file);
                if (!$this.auto && $this.form.length > 0) {
                    $this.form.trigger('uploader.error', [$this.element, msg]);
                }
                needRm = true;
            } else if (file.message) {
                msg = file.message;
            }
            $this.inputEle.val('').addClass('parsley-error');
            $this.element.trigger('uploader.reset', [$this.inputEle]);
            if ($this.auto || !needRm) {
                wui.layer.alert(msg, {
                    icon: 2, title: null, btn: null, shadeClose: true, resize: false
                });
            }
        });
        elem.find('span > em').on('click', function () {
            $this.element.removeClass('pendup');
            $this.uploader.splice(0);
            $this.inputEle.val('');
            $this.newFile = 0;
            $this.element.trigger('uploader.reset', [$this.inputEle]);
        });
    };
    $.fn.wulauploader            = function () {
        let args = Array.apply(null, arguments);
        args.shift();
        return $(this).each(function (i, elm) {
            let table = $(elm);
            if (!table.data('uploaderObj')) {
                new nuiUploader(table);
            } else {
                let data = table.data('uploaderObj');
                if (typeof option === 'string' && typeof data[option] === 'function') {
                    data[option].apply(data, args);
                }
            }
        });
    };

    $('body').on('wulaui.widgets.init', '.wulaui', function (e) {
        e.stopPropagation();
        let that = $(this).find('[data-uploader]');
        if (that.length > 0) {
            if (window.plupload) {
                that.wulauploader();
            } else {
                layui.use('plupload', function () {
                    plupload.addI18n({
                        "Error: File too large:"              : "文件太大:",
                        "Duplicate file error."               : "文件重复啦。",
                        "File size error."                    : "文件太大了，请选个小点的",
                        "Error: Invalid file extension:"      : "无效的文件扩展名:",
                        "Runtime ran out of available memory.": "运行时已消耗所有可用内存。",
                        "File count error."                   : "文件数量错误。",
                        "File extension error."               : "文件类型错误。"
                    });
                    that.wulauploader();
                });
            }
        }
    })
})($, wulaui);