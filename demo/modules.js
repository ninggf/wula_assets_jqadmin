layui.config({
	base   : '/demo/js/',
	version: "2.0.1-simple"
}).extend({
	jqelem      : '../../js/jqelem',
	jqmenu      : '../../js/jqmenu',
	tabmenu     : '../../js/tabmenu',
	jqtags      : '../../js/jqtags',
	plupload    : '../../lib/plupload',
	select2     : '../../lib/select2',
	toastr      : '../../js/toastr',
	ztree       : '../../js/ztree',
	"ztree.edit": '../../js/ztree_edit',
	"ztree.hide": '../../js/ztree_hide',
	wulaui      : '../../js/wulaui'
});
layui.data('wulaui', {
	key  : 'config',
	value: {
		base  : '/demo/',
		assets: '/demo/',
		medias: [],
		groups: {char: [], prefix: []},
		ids   : {}
	}
});