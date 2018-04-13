(($) => {
	const WulaTree = function (element) {
		let me        = this;
		this.settings = {
			view    : {},
			callback: {},
			edit    : {
				drap: {}
			},
			data    : {
				keep      : {},
				key       : {},
				simpleData: {}
			},
			check   : {}
		};
		this.url      = element.data('ztree');
		this.lazy     = element.data('lazy') !== undefined;
		element.addClass('ztree');
		if (this.url) {
			this.settings.async = {
				enable   : true,
				url      : this.url,
				type     : 'get',
				dataType : 'json',
				autoParam: ["id"]
			};
		}
		element.on('ztree.setting.load', function () {
			let e  = $.Event('ztree.init');
			e.tree = me;
			element.trigger(e);
			me.settings = e.tree.settings;
			me.nodes    = e.tree.nodes;
			if (!e.isDefaultPrevented()) {
				me.treeObj = $.fn.zTree.init(element, me.settings, me.nodes);
				element.trigger('ztree.inited', [me.treeObj]);
			}
			element.off('ztree.setting.load');
		}).closest('.wulaui').on('wulaui.widgets.destroy', me.destroy);

		if (!this.lazy) {
			element.trigger('ztree.setting.load');
		}
	};

	WulaTree.prototype.destroy = function () {
		if (this.treeObj) {
			this.treeObj.destroy();
			delete this.treeObj;
			$(this).off('wulaui.widgets.destroy', this.destroy);
		}
	};

	$.fn.wulatree = function (option) {
		return $(this).each(function () {
			let me = $(this);
			if (option === 'load') {
				me.trigger('ztree.setting.load');
			} else if (option === 'destroy') {
				let treeObj = me.data('treeObj');
				if (treeObj) {
					me.data('treeObj', null);
					treeObj.destroy();
					treeObj = null;
				}
			} else if (!me.data('treeObj')) {
				me.data('treeObj', new WulaTree(me));
			}
		});
	};

	$('body').on('wulaui.widgets.init', '.wulaui', function (e) {
		e.stopPropagation();
		let that = $(this).find('[data-ztree]');
		if (that.length > 0) {
			if ($.fn.zTree) {
				that.wulatree();
			} else {
				layui.use('ztree', function () {
					that.wulatree();
				});
			}
		}
	})
})($);