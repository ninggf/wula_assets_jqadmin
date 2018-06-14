layui.define(['jquery'], function (exports) {
	let $ = layui.$;
	layui.addcss('ztree.css', 'ztree');

	//=require tree/jquery.ztree.core.js

	exports('ztree', $.fn.zTree);
});
