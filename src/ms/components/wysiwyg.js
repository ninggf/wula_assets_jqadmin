(($, wui) => {
	/**
	 * 创建wysiwyg编辑器.
	 *
	 * @param element 元素
	 */
	const nuiWysiwyg = element => {
		let me = this;
		element.data('wysiwygObj', this);
		this.element = element;

		this.editor = element.wysiwyg({});
		element.data('wysiwygObj', this.editor);
	};

	nuiWysiwyg.prototype.getEditor = () => {
		return this.editor;
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
			if ($.fn.wysiwyg) {
				initEditor(that);
			} else {
				layui.use('wysiwyg', function () {
					initEditor(that);
				});
			}
		}
	});
})($, wulaui);