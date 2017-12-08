layui.define(['jquery'], function (exports) {
	let jQuery = layui.$, $ = jQuery;
	layui.addcss('ztree.css', 'ztree');

	//=require tree/jquery.ztree.core.js
	//=require tree/jquery.ztree.excheck.js

	exports('ztree', $.fn.zTree);
});
