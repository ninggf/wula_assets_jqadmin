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
			title     : "*.*",
			extensions: "jpg,gif,png,jpeg"
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
		this.value      = elem.data('value');
		this.varName    = elem.data('name');
		this.auto       = elem.data('auto') !== undefined;
		this.extensions = elem.data('exts') || 'jpg,gif,png,jpeg';
		this.width      = elem.data('width') || 90;
		this.height     = elem.data('height') || this.width;
		this.readonly   = elem.data('readonly') !== undefined;
		this.whstyle    = 'width:' + this.width + 'px;height:' + this.height + 'px;';
		this.isLocal    = elem.data('localStore') !== undefined;
		let opts        = {};
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

		// 删除文件
		const removeFile = function () {
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
		let destroy      = function () {
			elem.off('form.placement');
			if ($this.uploader) {
				$this.uploader.destroy();
				$this.wrapper = null;
				elem.data('uploaderObj', null);
				$(this).off('wulaui.widgets.destroy', destroy);
				delete $this.uploader;
			}
		};
		this.id          = elem.attr('id');
		this.btnId       = 'uploadimg-' + this.id;
		this.wrapper     = $('<ul class="upload-img-box clearfix"><li class="uploadimg-btn"><a href="javascript:void(0);" style="' + this.whstyle + '" id="' + this.btnId + '"></a></li></ul>');
		elem.append(this.wrapper);
		this.uploadBtn          = this.wrapper.find('.uploadimg-btn');
		this.opts.browse_button = 'uploadimg-' + elem.attr('id');
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
				html += '<span>' + (file.size / 1000).toFixed(1) + 'K</span>';
				html += '<i>×</i>';
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
			}
		});
		//上传进度
		uploader.bind('UploadProgress', (up, file) => {
			let id = '#up-' + file.id;
			$(id + ' .progress-bar').css('width', file.percent + '%');
		});
		// 上传完成
		uploader.bind('FileUploaded', (up, file, resp) => {
			let id = file.id, idx = '#up-' + id;
			if (file.status === plupload.DONE) {
				$(idx + ' .progress-bar').removeClass('progress-bar-info').addClass('progress-bar-success');
				try {
					let result = $.parseJSON(resp.response);
					let rst    = result.result;
					if (rst) {
						$(idx + ' input').val(rst.url);
						try {
							$this.element.trigger('uploader.uploaded', [rst]);
						} catch (ee) {
						}
					} else {
						$(idx + ' .progress-bar').removeClass('progress-bar-info').addClass('progress-bar-danger');
					}
				} catch (e) {
					$('#up-' + id + ' .progress-bar').removeClass('progress-bar-info').addClass('progress-bar-danger');
					wui.toast.error(e.message);
				}
			} else {
				$('#up-' + id + ' .progress-bar').removeClass('progress-bar-info').addClass('progress-bar-danger');
			}
		});
		//全部上传完全
		uploader.bind('UploadComplete', (up) => {
			up.disableBrowse(false);
			$this.newFile = 0;
			up.splice(0);
			up.refresh();
			$this.element.trigger('uploader.done');
		});
		//上传失败
		uploader.bind('Error', (up, file) => {
			up.disableBrowse(false);
			let id = file.file ? file.file.id : file.id;
			$('#up-' + id + ' .progress-bar').removeClass('progress-bar-info').addClass('progress-bar-danger');
			if (file.response) {
				try {
					let result = eval('(' + file.response + ')');
					let rst    = result.error;
					wui.toast.error(rst.message);
				} catch (e) {
					console.log(e);
				}
			} else if (file.message) {
				wui.toast.error(file.message);
			}
			$this.element.trigger('uploader.error');
		});

		elem.closest('.wulaui').on('wulaui.widgets.destroy', destroy);
	};

	nuiUploader.prototype.start = function () {
		if (this.newFile > 0) {
			this.uploader.start();
		} else {
			this.element.trigger('uploader.done');
		}
	};

	nuiUploader.prototype.stop  = function () {
		this.uploader.stop();
	};
	nuiUploader.prototype.get   = function () {
		return this.uploader;
	};
	nuiUploader.prototype.clear = function () {
		this.wrapper.find('li').not(this.uploadBtn).find('i').click();
		this.uploader.splice(0);
		this.uploader.refresh();
		this.uploader.disableBrowse(false);
		this.uploadBtn.show();
	};
	$.fn.wulauploader           = function () {
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
					that.wulauploader();
				});
			}
		}
	})
})($, wulaui);