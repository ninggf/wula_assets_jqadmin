/*
 * @Author: Paco
 * @Date:   2017-03-12
 * @lastModify 2017-05-08
 * +----------------------------------------------------------------------
 * | jqadmin [ jq酷打造的一款懒人后台模板 ]
 * | Copyright (c) 2017 http://jqadmin.jqcool.net All rights reserved.
 * | Licensed ( http://jqadmin.jqcool.net/licenses/ )
 * | Author: Paco <admin@jqcool.net>
 * +----------------------------------------------------------------------
 */

layui.define(['jquery', 'laytpl', 'layer', 'jqelem', 'tabmenu'], function (exports) {
    var $         = layui.jquery,
        tpl       = layui.laytpl,
        element   = layui.jqelem,
        layer     = layui.layer,
        init      = true,
        cloneTemp = false,
        tabmenu   = layui.tabmenu(),
        jqmenu    = function () {
            this.options = {
                showIcon: true
            }
        };

    jqmenu.prototype.init = function () {
        var _this = this, fframe = $('iframe[data-id=0]');
        _this.resize();
        _this.menuBind();
        _this.openOldMenu();
        element.init();
        if (fframe.length > 0) {
            fframe.attr('src', $('[lay-id=0]').find('em').data('href'));
        }
        $('.layui-tab-content').prepend('<div class="coverBox"></div>');//弹层
    };

    /**
     * 将tabmenu类附到jqmenu上，方法tab的接口调用与重写
     */
    jqmenu.prototype.tabmenu = tabmenu;
    window.jqTabmenu          = tabmenu;
    jqmenu.prototype.resize   = function () {
        $(window).on('resize', function () {
            getSize();
            tabmenu.init();
            tabmenu.tabMove(0, 1);
        }).resize();
    };
    jqmenu.prototype.menuBind = function () {
        var _this = this, mm = $('#menu'), leftSub = $('#submenu').find("ul li"), $body = $('body');
        // 主菜单提示
        mm.find('a').on('mouseenter', function () {
            if (!$body.hasClass('minWidth') && $(window).width() < 970) {
                layer.tips($(this).data("title"), $(this), {
                    tips: 3
                })
            }
        }).on('mouseleave', function () {
            layer.closeAll('tips')
        });

        //左部菜单提示
        leftSub.on('mouseenter', function () {
            if ($body.hasClass('left-off')) {
                if ($(this).find('dl').length > 0) {
                    $(this).addClass('layui-nav-itemed');
                    layer.closeAll('tips');
                } else {
                    layer.tips($(this).children('a').data("title"), $(this));
                }
            }
        }).on('mouseleave', function () {
            if ($body.hasClass('left-off')) {
                layer.closeAll('tips');
                $(this).removeClass('layui-nav-itemed');
            }
        });

        $('.layui-tab-content').on('click', '.coverBox', function () {
            var showIcon = $(".menu-type").find("i");
            $(this).hide();
            $('.tab-move-btn').removeClass('open').find('i').html("&#xe604;");
            $('.menu-list').slideUp('fast');
            $('.jqadmin-auxiliary-btn').removeClass('xz');
            $('body.minWidth .jqadmin-main-menu').slideUp();
            $('.left-off .layui-nav-itemed').removeClass('layui-nav-itemed');
            $('body.minWidth').addClass('left-miss left-off');
            showIcon.html('&#xe66b;');
        });
        //绑定左侧树菜单的单击事件
        $('.sub-menu .layui-nav-item,.tab-menu,.menu-list li').bind("click", function () {
            var obj = $(this);
            obj.siblings('li').removeClass('layui-nav-itemed');
            layer.closeAll('tips');
            $('.menu-list').slideUp();
            $('.tab-move-btn').removeClass('open').find('i').html("&#xe604;");
            if (obj.find('dl').length <= 0) {
                _this.menuSetOption(obj);
            } else if (obj.hasClass('layui-nav-itemed')) {
                obj.find("a").removeClass('nav-collapse');
            }
        }).find('dd').bind("click", function () {
            _this.menuSetOption($(this));
        });
        // 功能导航的单击事件
        $body.on('click', '.all-menus a', function () {
            layer.closeAll();
            _this.menuSetOption($(this));
            return false;
        });
        //绑定主菜单单击事件，点击时显示相应的菜单
        element.on('nav(main-menu)', function (elem) {
            $('.left-off .jqamdin-left-bar .layui-nav-itemed').removeClass('layui-nav-itemed');
            var index = elem.index(), subMenu = $('#submenu .sub-menu');
            if (!elem[0].id) {//無左部菜單
                if (elem.hasClass('fav-menu')) {//打開快捷菜單
                    _this.menuSetOption(elem);
                }
            } else {
                var cmenu       = subMenu.eq(index), sStorage = window.sessionStorage || {};
                sStorage.menuId = cmenu.find('[data-formmenu]').data('formenu');
                if (cmenu.is(':visible')) {
                    return false;
                }
                subMenu.hide();
                cmenu.show();
            }
        });
        //绑定更多按钮事件
        $('.tab-move-btn').bind("click", function () {
            var show = $('.menu-list').css('display');
            $('.jqadmin-auxiliary-btn').removeClass('xz');
            $('.minWidth .jqadmin-main-menu').slideUp();
            if ($('body').hasClass('minWidth')) {
                $('body').addClass('left-miss left-off');
            }
            if (show == "none") {
                $(this).addClass('open');
                $('.coverBox').show();
                _this.menulist();
                $('.menu-list li').bind("click", function () {
                    _this.menuSetOption($(this));
                });

                $('.menu-list').slideDown('fast');
                $(this).find('i').html("&#xe603;");
            } else {
                $(this).removeClass('open');
                $('.coverBox').hide();
                $('.menu-list').slideUp('fast');
                $(this).find('i').html("&#xe604;");
            }
        });
    };

    jqmenu.prototype.menuSetOption = function (obj) {
        var $a     = obj.is('a') ? obj : obj.children('a'),
            href   = $a.data('url'),
            icon   = $a.children('i:first').data('icon') || '&#xe621;',
            title  = $a.data('title'),
            target = $a.data('target') || $a.attr('target'),
            data   = {
                href : href,
                icon : icon,
                cls  : $a.children('i:first').get(0).className,
                title: title
            };
        if (target) {
            window.location.href = href;
            return true;
        }
        this.menuOpen(data);
        return false;
    };

    jqmenu.prototype.menuOpen = function (data, active) {
        tabmenu.tabAdd(data, this.options.fresh, active);
    };
    /**
     * 刷新后打开原打开的菜单
     */
    jqmenu.prototype.openOldMenu = function () {
        var sStorage = window.sessionStorage || {}, ctab = 0, _this = this;
        element.on('tab(tabmenu)', function (e) {
            var layId = $(this).attr("lay-id");
            $('.menu-list').slideUp();
            $('.tab-move-btn').removeClass('open').find('i').html("&#xe604;");
            var data = {
                layId: layId
            };
            if (!init && layId) {
                tabmenu.storage(data, "change");
            }
            if (e && e.this) {
                sStorage.cTabIdx = $(e.this).attr('lay-id');
                if (sStorage.cTabIdx) {
                    _this.sw($(e.this));
                }
            }
        });

        if (sStorage.menu) {
            var menulist = sStorage.menu, menu;
            menulist     = menulist.split("<-!->");
            for (index in menulist) {
                if (index == "remove") {
                    continue;
                }
                if (typeof menulist[index] === 'string') {
                    menu = JSON.parse(menulist[index]);
                }
                if (!menu) {
                    continue;
                }
                menu.nodo = true;
                if (sStorage.cTabIdx == menu.layId) {
                    this.menuOpen(menu, true);
                    ctab++;
                } else {
                    this.menuOpen(menu, false)
                }
            }
        }
        if (ctab === 0) {
            this.sw(false);
        }
        init = false;
    };
    jqmenu.prototype.sw       = function (data) {
        var sStorage = window.sessionStorage || {}, menuId;
        if (!data) {
            menuId = sStorage.menuId;
        } else {
            var url = data.find('em').data('href');
            if (url) {
                var li = $('#submenu').find('a[data-url="' + url + '"]');
                if (li.length > 0) {
                    $('.left-off .layui-nav-itemed').removeClass('layui-nav-itemed')
                    var subm = li.closest('ul.layui-nav');
                    subm.find('.layui-this').removeClass('layui-this');
                    var mp = li.parent();
                    mp.addClass('layui-this');
                    menuId = subm.data('formenu');
                }
            }
        }
        if (menuId) {
            $('#' + menuId).click();
        } else if (sStorage.menuId) {
            $('#' + sStorage.menuId).click();
        } else {
            $('#menu li:first').click();
        }
    };
    jqmenu.prototype.menulist = function () {
        var storage  = window.sessionStorage || {},
            menulist = storage.menu;
        if (menulist) {
            var menulist = menulist.split("<-!->"),
                list     = [],
                data     = {};

            for (index in menulist) {
                if (index == "remove") {
                    continue;
                }
                if (typeof menulist[index] === 'string') {
                    var menu = JSON.parse(menulist[index])
                }

                list.push(menu);
            }
            data.list = list;
            if ("" != data || undefined != data) {
                var getTpl = $('#menu-list-tpl').html();
                tpl(getTpl).render(data, function (html) {
                    $('#menu-list').html(html);
                })
            }
        }
    };

    jqmenu.prototype.menuShowType = function (type) {
        var oHtml       = document.documentElement,
            _this       = this,
            screenWidth = oHtml.clientWidth,
            $body       = $('body'),
            showType    = 0,
            showIcon    = $(".menu-type").find("i"),
            subm        = $('#submenu').find("ul li");

        if (type == 'close') {
            showType = 1;
        } else if (type == 'open') {
            showType = 0;
        } else {
            if ($body.hasClass('left-off')) {
                if ($body.hasClass('minWidth')) {
                    $('.coverBox').show();
                    $('.menu-list').css('display', 'none')
                }
                showType = 0;
            } else {
                showType = 1;
            }
        }
        switch (showType) {
            case 1://打开
                $('.layui-nav-tree .layui-nav-item').removeClass('layui-nav-itemed');
                subm.children("a").each(function () {
                    $(this).addClass('nav-collapse');
                });

                $body.addClass('left-off').removeClass('left-miss');
                if (!_this.options.showIcon) {
                    $('#submenu').find('i').removeClass("hide-icon");
                }
                showIcon.html('&#xe66b;');
                break;
            default://关闭
                subm.find("a").removeClass('nav-collapse');
                $body.removeClass('left-off');
                if (screenWidth <= 750) {
                    $body.removeClass('left-miss');
                    showIcon.html('&#xe668;');
                } else {
                    showIcon.html('&#xe668;');
                }
        }
    };

    // 窗口大小改变时
    function getSize() {
        var showIcon    = $(".menu-type").find("i").removeClass('iconfont').addClass('layui-icon'),
            $body       = $('body'),
            $subm       = $('#submenu'),
            oHtml       = document.documentElement,
            preSet      = $body.hasClass('pre-set'),
            leftSub     = $subm.find("ul li"),
            screenWidth = oHtml.clientWidth;

        if (screenWidth <= 750) {
            $('.jqadmin-main-menu').hide();
            $body.addClass('left-miss left-off minWidth');
            $('.jqadmin-main-menu .layui-nav .layui-nav-item a span').show();
            $('.layui-header .header-right .right-menu').hide();
            showIcon.html('&#xe66b;');
        } else if (screenWidth < 970) {
            $('.layui-nav-itemed').removeClass('layui-nav-itemed');
            $('.jqadmin-main-menu').show();
            $('.jqadmin-main-menu .layui-nav .layui-nav-item a span').hide();
            $('.layui-header .header-right .right-menu').show();
            $body.removeClass('left-miss minWidth').addClass('left-off');
            leftSub.children("a").addClass('nav-collapse');
            showIcon.html('&#xe66b;');
            $('.jqadmin-main-menu .cloneDom').remove();
            cloneTemp = false;
        } else {
            $('.jqadmin-main-menu').show();
            $('.jqadmin-main-menu .layui-nav .layui-nav-item a span').show();
            $('.layui-header .header-right .right-menu').show();
            if (preSet) {
                $body.removeClass('minWidth left-miss');
                showIcon.html('&#xe66b;');
            } else {
                if (screenWidth <= 1280) {
                    $body.addClass('left-off').removeClass('minWidth left-miss');
                    showIcon.html('&#xe66b;');
                } else {
                    $body.removeClass('left-off minWidth left-miss');
                    showIcon.html('&#xe668;');
                }
            }
            leftSub.find("a").removeClass('nav-collapse');

            $('.jqadmin-main-menu .cloneDom').remove();
            cloneTemp = false;
        }
    }

    // 移动端点击左上角下拉菜单
    $('body').on('click', '.minWidth li.first', function () {
        $('.minWidth #menu .head-nav-item').removeClass('layui-this');
        $('#menu li.first dl').removeClass('layui-show');
        $(this).siblings('.first').find('dl').hide();
        $(this).find('span').toggleClass('layui-nav-mored');
        $(this).find('dl').toggle();
    })
    .on('click', '.jqadmin-auxiliary-btn', function () {
        $(this).toggleClass('xz');
        $('.tab-move-btn').removeClass('open').find('i').html("&#xe604;");
        $('.menu-list').slideUp('fast');
        if ($(this).hasClass('xz')) {
            $('.coverBox').show();
        } else {
            if ($('body').hasClass('left-miss') || $('body').hasClass('left-off')) {
                $('.coverBox').hide();
            }
        }
        if (!cloneTemp) {
            var cloneItems = $('.minWidth .layui-header .header-right .right-menu li').clone(true);
            $('.minWidth .layui-header .header-right .right-menu').hide();
            cloneItems.appendTo('#menu');
        }
        $('.minWidth .jqadmin-main-menu').slideToggle();

        cloneTemp = true;
    })
    .on('click', '.minWidth .first dd', function () {
        $('.minWidth .jqadmin-main-menu').slideUp();
    })
    .on('click', '.minWidth .head-nav-item', function () {
        $('.minWidth .jqadmin-main-menu').slideUp();
        top.global.menu.menuShowType('open');
    })
    .on('click', '.minWidth .tab-menu', function () {
        $('.minWidth .jqadmin-main-menu').slideUp();
    });
    // 移动端下拉菜单功能调整
    exports('jqmenu', jqmenu);
});