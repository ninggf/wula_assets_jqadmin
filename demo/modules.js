layui.config({
	base   : '/demo/js/',
	version: "2.0.1-simple"
}).extend({
	jqelem     : '../../js/jqelem',
	jqmenu     : '../../js/jqmenu',
	tabmenu    : '../../js/tabmenu',
	jqtags     : '../../js/jqtags',
	webuploader: '../../lib/webuploader',
	echarts    : '../../lib/echarts',
	toastr     : '../../js/toastr',
	wulaui     : '../../js/wulaui'
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