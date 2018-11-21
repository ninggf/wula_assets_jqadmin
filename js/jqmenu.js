layui.define(["jquery","laytpl","layer","jqelem","tabmenu"],function(i){var o=layui.jquery,s=layui.laytpl,l=layui.jqelem,t=layui.layer,m=!0,d=!1,u=layui.tabmenu(),e=function(){this.options={showIcon:!0}};e.prototype.init=function(){l.init();var i=this,e=o("iframe[data-id=0]");i.resize(),i.menuBind(),i.openOldMenu(),0<e.length&&e.attr("src",o("[lay-id=0]").find("em").data("href")),o(".layui-tab-content").prepend('<div class="coverBox"></div>')},e.prototype.tabmenu=u,window.jqTabmenu=u,e.prototype.resize=function(){o(window).on("resize",function(){var i,e,n,t,a,s,l;i=o(".menu-type").find("i").removeClass("iconfont").addClass("layui-icon"),e=o("body"),n=o("#submenu"),t=document.documentElement,a=e.hasClass("pre-set"),s=n.find("ul li"),(l=t.clientWidth)<=750?(o(".jqadmin-main-menu").hide(),e.addClass("left-miss left-off minWidth"),o(".jqadmin-main-menu .layui-nav .layui-nav-item a span").show(),o(".layui-header .header-right .right-menu").hide(),i.html("&#xe66b;")):(l<970?(o(".layui-nav-itemed").removeClass("layui-nav-itemed"),o(".jqadmin-main-menu").show(),o(".jqadmin-main-menu .layui-nav .layui-nav-item a span").hide(),o(".layui-header .header-right .right-menu").show(),e.removeClass("left-miss minWidth").addClass("left-off"),s.children("a").addClass("nav-collapse"),i.html("&#xe66b;")):(o(".jqadmin-main-menu").show(),o(".jqadmin-main-menu .layui-nav .layui-nav-item a span").show(),o(".layui-header .header-right .right-menu").show(),a?(e.removeClass("minWidth left-miss"),i.html("&#xe66b;")):l<1280?(e.addClass("left-off").removeClass("minWidth left-miss"),i.html("&#xe66b;")):(e.removeClass("left-off minWidth left-miss"),i.html("&#xe668;")),s.find("a").removeClass("nav-collapse")),o(".jqadmin-main-menu .cloneDom").remove(),d=!1),u.init(),u.tabMove(0,1)}).resize()},e.prototype.menuBind=function(){var a=this,i=o("#menu"),e=o("#submenu").find("ul li"),n=o("body");i.find("a").on("mouseenter",function(){!n.hasClass("minWidth")&&o(window).width()<970&&t.tips(o(this).data("title"),o(this),{tips:3})}).on("mouseleave",function(){t.closeAll("tips")}),e.on("mouseenter",function(){n.hasClass("left-off")&&(0<o(this).find("dl").length?(o(this).addClass("layui-nav-itemed"),t.closeAll("tips")):t.tips(o(this).children("a").data("title"),o(this)))}).on("mouseleave",function(){n.hasClass("left-off")&&(t.closeAll("tips"),o(this).removeClass("layui-nav-itemed"))}),o(".layui-tab-content").on("click",".coverBox",function(){var i=o(".menu-type").find("i");o(this).hide(),o(".tab-move-btn").removeClass("open").find("i").html("&#xe604;"),o(".menu-list").slideUp("fast"),o(".jqadmin-auxiliary-btn").removeClass("xz"),o("body.minWidth .jqadmin-main-menu").slideUp(),o(".left-off .layui-nav-itemed").removeClass("layui-nav-itemed"),o("body.minWidth").addClass("left-miss left-off"),i.html("&#xe66b;")}),o(".sub-menu .layui-nav-item,.tab-menu,.menu-list li").bind("click",function(){var i=o(this);i.siblings("li").removeClass("layui-nav-itemed"),t.closeAll("tips"),o(".menu-list").slideUp(),o(".tab-move-btn").removeClass("open").find("i").html("&#xe604;"),i.find("dl").length<=0?a.menuSetOption(i):i.hasClass("layui-nav-itemed")&&i.find("a").removeClass("nav-collapse")}).find("dd").bind("click",function(){a.menuSetOption(o(this))}),n.on("click",".all-menus a",function(){return t.closeAll(),a.menuSetOption(o(this)),!1}),l.on("nav(main-menu)",function(i){o(".left-off .jqamdin-left-bar .layui-nav-itemed").removeClass("layui-nav-itemed");var e=i.index(),n=o("#submenu .sub-menu");if(i[0].id){var t=n.eq(e);if((window.sessionStorage||{}).menuId=t.find("[data-formmenu]").data("formenu"),t.is(":visible"))return!1;n.hide(),t.show()}else i.hasClass("fav-menu")&&a.menuSetOption(i)}),o(".tab-move-btn").bind("click",function(){var i=o(".menu-list").css("display");o(".jqadmin-auxiliary-btn").removeClass("xz"),o(".minWidth .jqadmin-main-menu").slideUp(),o("body").hasClass("minWidth")&&o("body").addClass("left-miss left-off"),"none"==i?(o(this).addClass("open"),o(".coverBox").show(),a.menulist(),o(".menu-list li").bind("click",function(){a.menuSetOption(o(this))}),o(".menu-list").slideDown("fast"),o(this).find("i").html("&#xe603;")):(o(this).removeClass("open"),o(".coverBox").hide(),o(".menu-list").slideUp("fast"),o(this).find("i").html("&#xe604;"))})},e.prototype.menuSetOption=function(i){var e=i.is("a")?i:i.children("a"),n=e.data("url"),t=e.children("i:first").data("icon")||"&#xe621;",a=e.data("title"),s=e.data("target")||e.attr("target"),l={href:n,icon:t,cls:e.children("i:first").get(0).className,title:a};return s?(window.location.href=n,!0):(this.menuOpen(l),!1)},e.prototype.menuOpen=function(i,e){u.tabAdd(i,this.options.fresh,e)},e.prototype.openOldMenu=function(){var t=window.sessionStorage||{},i=0,a=this;if(l.on("tab(tabmenu)",function(i){var e=o(this).attr("lay-id");o(".menu-list").slideUp(),o(".tab-move-btn").removeClass("open").find("i").html("&#xe604;");var n={layId:e};!m&&e&&u.storage(n,"change"),i&&i.this&&(t.cTabIdx=o(i.this).attr("lay-id"),t.cTabIdx&&a.sw(o(i.this)))}),t.menu){var e,n=t.menu;for(index in n=n.split("<-!->"))"remove"!=index&&("string"==typeof n[index]&&(e=JSON.parse(n[index])),e&&(e.nodo=!0,t.cTabIdx==e.layId?(this.menuOpen(e,!0),i++):this.menuOpen(e,!1)))}0===i&&this.sw(!1),m=!1},e.prototype.sw=function(i){var e,n=window.sessionStorage||{},t=null;if(i){var a=i.find("em").data("href");if(a){var s=o("#submenu").find('a[data-url="'+a+'"]');if(0<s.length){o(".left-off .layui-nav-itemed").removeClass("layui-nav-itemed");var l=s.closest("ul.layui-nav");l.find(".layui-this").removeClass("layui-this"),s.parent().addClass("layui-this"),e=l.data("formenu")}}}else e=n.menuId;e?t=o("#"+e):n.menuId&&(t=o("#"+n.menuId)),t&&0<t.length?t.click():o("#menu li:first").click()},e.prototype.menulist=function(){if(i=(window.sessionStorage||{}).menu){var i=i.split("<-!->"),e=[],n={};for(index in i)if("remove"!=index){if("string"==typeof i[index])var t=JSON.parse(i[index]);e.push(t)}if(n.list=e,""!=n||null!=n){var a=o("#menu-list-tpl").html();s(a).render(n,function(i){o("#menu-list").html(i)})}}},e.prototype.menuShowType=function(i){var e=document.documentElement.clientWidth,n=o("body"),t=0,a=o(".menu-type").find("i"),s=o("#submenu").find("ul li");switch("close"==i?t=1:"open"==i?t=0:n.hasClass("left-off")?(n.hasClass("minWidth")&&(o(".coverBox").show(),o(".menu-list").css("display","none")),t=0):t=1,t){case 1:o(".layui-nav-tree .layui-nav-item").removeClass("layui-nav-itemed"),s.children("a").each(function(){o(this).addClass("nav-collapse")}),n.addClass("left-off").removeClass("left-miss"),this.options.showIcon||o("#submenu").find("i").removeClass("hide-icon"),a.html("&#xe66b;");break;default:s.find("a").removeClass("nav-collapse"),n.removeClass("left-off"),e<=750&&n.removeClass("left-miss"),a.html("&#xe668;")}},o("body").on("click",".minWidth li.first",function(){o(".minWidth #menu .head-nav-item").removeClass("layui-this"),o("#menu li.first dl").removeClass("layui-show"),o(this).siblings(".first").find("dl").hide(),o(this).find("span").toggleClass("layui-nav-mored"),o(this).find("dl").toggle()}).on("click",".jqadmin-auxiliary-btn",function(){if(o(this).toggleClass("xz"),o(".tab-move-btn").removeClass("open").find("i").html("&#xe604;"),o(".menu-list").slideUp("fast"),o(this).hasClass("xz")?o(".coverBox").show():(o("body").hasClass("left-miss")||o("body").hasClass("left-off"))&&o(".coverBox").hide(),!d){var i=o(".minWidth .layui-header .header-right .right-menu li").clone(!0);o(".minWidth .layui-header .header-right .right-menu").hide(),i.appendTo("#menu")}o(".minWidth .jqadmin-main-menu").slideToggle(),d=!0}).on("click",".minWidth .first dd",function(){o(".minWidth .jqadmin-main-menu").slideUp()}).on("click",".minWidth .head-nav-item",function(){o(".minWidth .jqadmin-main-menu").slideUp(),top.global.menu.menuShowType("open")}).on("click",".minWidth .tab-menu",function(){o(".minWidth .jqadmin-main-menu").slideUp()}),i("jqmenu",e)});