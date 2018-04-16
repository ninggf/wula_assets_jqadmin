layui.define(['jquery'], function (exports) {
	let $ = layui.$;

	//=require tree/jquery.ztree.core.js

	exports('ztree', $.fn.zTree);
	layui.addcss('ztree.css', 'ztree');
});
