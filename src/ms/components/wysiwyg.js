(($, wui) => {
	/**
	 * 创建wysiwyg编辑器.
	 *
	 * @param element 元素
	 */
	const nuiWysiwyg            = function (element) {
		let me        = this, uploader = layui.upload;
		this.form     = element.closest('form');
		this.targetId = element.attr('for');
		this.target   = $(this.targetId);
		this.parent   = element.closest('div.wysiwyg');
		this.mode     = 'edit';
		this.readonly = element.data('readonly');
		if (this.form.data('ajax') !== undefined) {
			this.form.on('ajax.before', function () {
				me.target.val(element.html());
			});
		} else {
			this.form.on('submit', function () {
				me.target.val(element.html());
			});
		}
		element.data('wysiwygObj', this);
		this.element = element;
		//绑定事件
		this.parent.on('click', 'a[data-act]', function () {
			let act = $(this).data('act');
			if (me[act]) {
				me[act].apply(me);
			}
		}).on('click', '.ins-pic', function () {
			let pa = $(this).closest('.input-group').find('.form-control'), src = pa.val();
			pa.val('');
			if (src) {
				me.exec('insertImage', src);
			}
		});
		if (!this.readonly) {
			this.editor = element.wysiwyg({
				toolbarSelector: this.targetId + "-editor-toolbar",
			});
			uploader.render({
				elem      : this.targetId + '-uploader'
				, url     : wui.app('media/ins'),
				exts      : 'jpg|png|gif|jpeg'
				, done    : function (res) {
					//上传完毕回调
					if (res.done === 1) {
						let url   = wui.media(res.result.url),
							width = res.result.width >= 800 ? '100%' : res.result.width + 'px',
							html  = '<img src="' + url + '" style="width:' + width + ';height: auto;border:0"/>';
						me.exec('insertHtml', html);
					}
				}, accept : 'images'
				, multiple: true
			});
		}
		element.data('wysiwygObj', this.editor);
	};
	nuiWysiwyg.prototype.exec   = function (cmd, arg) {
		if (!this.editor) return;
		this.editor.restoreSelection();
		this.element.focus();
		this.editor.execCommand(cmd, arg, this.element);
		this.editor.saveSelection();
	};
	nuiWysiwyg.prototype.source = function () {
		this.element.find('a,img').removeAttr('data-original-title').popover('destroy');
		if (this.mode === 'edit') {
			this.mode = 'source';
			this.element.addClass('hidden');
			this.target.val(this.element.html()).removeClass('hidden');
			this.parent.find('.btn-toolbar .btn-group').not('.source').hide();
		} else {
			this.mode = 'edit';
			this.target.addClass('hidden');
			this.element.html(this.target.val()).removeClass('hidden');
			this.parent.find('.btn-toolbar .btn-group').show();
		}
	};
	nuiWysiwyg.prototype.pager  = function () {
		if (this.editor) {
			this.exec('insertHtml', '<hr/><div><br/></div>');
		}
	};

	function initEditor(element) {
		element.each(function (i, elm) {
			let el = $(elm);
			if (!el.data('wysiwygObj')) {
				new nuiWysiwyg(el);
			}
		});
	}

	$('body').on('wulaui.widgets.init', '.wulaui', function (e) {
		e.stopPropagation();
		let that = $(this).find('[data-wysiwyg]');
		if (that.length > 0) {
			layui.use(['upload', 'wysiwyg'], function () {
				initEditor(that);
			});
		}
	});
})($, wulaui);