layui.define(["jquery","laytpl","bootstrap"],function(t){var e=layui.$,a=e,o=layui.laytpl,n='<div class="pull-in"><div class="form-group clearfix"><div class="col-xs-4"><label>target</label><br/><input type="text" class="form-control" value="{{d.target}}" name="target"></div><div class="col-xs-8"><label>标题</label><br/><input type="text" class="form-control" value="{{=d.title}}" name="title"></div></div><div class="form-group clearfix"><div class="col-xs-12"><label>URL</label><div class="input-group"><input class="form-control" placeholder="URL" type="text" value="{{d.href}}" name="href"><span class="input-group-btn"><button class="btn btn-success btn-icon" type="button"><i class="fa fa-check-square"></i></button></span></div></div></div>',i='<div class="pull-in"><div class="form-group clearfix"><div class="col-xs-3"><label>宽</label><br/><input type="text" class="form-control" value="{{d.width}}" name="width"></div><div class="col-xs-3"><label>高</label><br/><input type="text" class="form-control" value="{{d.height}}" name="height"></div><div class="col-xs-6"><label>替换文本</label><br/><input type="text" class="form-control" value="{{=d.alt}}" name="alt"></div></div><div class="form-group clearfix"><div class="col-xs-12"><label>排版</label><br/><div><label class="checkbox-inline"><input type="radio" name="float" value="none">无</label><label class="checkbox-inline"><input type="radio" name="float" value="left">居左</label><label class="checkbox-inline"><input type="radio" name="float" value="right">居右</label></div></div></div><div class="form-group clearfix"><div class="col-xs-12"><label>图片地址</label><div class="input-group"><input class="form-control" placeholder="SRC" type="text" value="{{d.src}}" name="src"><span class="input-group-btn"><button class="btn btn-success btn-icon" type="button"><i class="fa fa-check-square"></i></button></span></div></div></div>';function l(t){if("string"==typeof t.data&&(t.data={keys:t.data}),t.data&&t.data.keys&&"string"==typeof t.data.keys){var e=t.handler,o=t.data.keys.toLowerCase().split(" "),n=["text","password","number","email","url","range","date","month","week","time","datetime","datetime-local","search","color","tel"];t.handler=function(t){if(this===t.target||!(/textarea|select/i.test(t.target.nodeName)||a.inArray(t.target.type,n)>-1)){var i=a.hotkeys.specialKeys[t.keyCode],l="keypress"===t.type&&String.fromCharCode(t.which).toLowerCase(),r="",s={};t.altKey&&"alt"!==i&&(r+="alt+"),t.ctrlKey&&"ctrl"!==i&&(r+="ctrl+"),t.metaKey&&!t.ctrlKey&&"meta"!==i&&(r+="meta+"),t.shiftKey&&"shift"!==i&&(r+="shift+"),i&&(s[r+i]=!0),l&&(s[r+l]=!0,s[r+a.hotkeys.shiftNums[l]]=!0,"shift+"===r&&(s[a.hotkeys.shiftNums[l]]=!0));for(var c=0,d=o.length;c<d;c++)if(s[o[c]])return e.apply(this,arguments)}}}}function r(t,a){var l=this;this.selectedRange=null,this.editor=e(t).on("click",function(){e(this).find("a,img").removeAttr("data-original-title").popover("destroy")});var r=e(t),s=e.extend(!0,{},{hotKeys:{"Ctrl+b meta+b":"bold","Ctrl+i meta+i":"italic","Ctrl+u meta+u":"underline","Ctrl+f meta+f":"removeFormat","Ctrl+z":"undo","Ctrl+y meta+y meta+shift+z":"redo","Ctrl+l meta+l":"justifyleft","Ctrl+r meta+r":"justifyright","Ctrl+e meta+e":"justifycenter","Ctrl+j meta+j":"justifyfull","Shift+tab":"outdent",tab:"indent"},toolbarSelector:"[data-role=editor-toolbar]",commandRole:"edit",activeToolbarClass:"btn-info",selectionMarker:"edit-focus-marker",selectionColor:"darkgray",dragAndDropImages:!1,keypressTimeout:200,fileUploadError:function(t,e){}},a);this.options=s;var c="a[data-"+s.commandRole+"],button[data-"+s.commandRole+"],input[type=button][data-"+s.commandRole+"]";this.toolbarBtnSelector=c,this.bindHotkeys(r,s,c),this.bindToolbar(r,e(s.toolbarSelector),s,c),r.attr("contenteditable",!0).on("mouseup keyup mouseout",function(){this.saveSelection(),this.updateToolbar(r,c,s)}.bind(this)),r.on("click","img",function(t){t.stopPropagation();var a,n,r=e(this).popover({container:"body",content:(a=e(this),n={src:a.attr("src")||"",alt:a.attr("alt")||"",width:a.css("width")||"",height:a.css("height")||"",float:a.css("float")||"none"},o(i).render(n)),html:!0,placement:"bottom",viewport:"#"+l.editor.attr("id"),trigger:"manual",template:'<div class="popover imgtag-dlg" role="tooltip" style="width: 400px;max-width:400px"><div class="arrow"></div><div class="popover-content"></div></div>'}).on("shown.bs.popover",function(){var t=r.css("float");e(".imgtag-dlg").find("[name=float][value="+t+"]").prop("checked",!0),e(".imgtag-dlg button").on("click",function(){var t=e(this).closest(".imgtag-dlg"),a=t.find("[name=src]").val(),o=t.find("[name=alt]").val(),n=t.find("[name=width]").val(),i=t.find("[name=height]").val(),l=t.find("[name=float]:checked").val();r.attr("src",a).attr("alt",o).css("width",n).css("height",i),"none"===l?r.css("float","none"):r.css("float",l),r.popover("destroy")})}).popover("show");return!1}).on("click","a",function(t){t.stopPropagation();var a,i,r=e(this).popover({container:"body",content:(a=e(this),i={href:a.attr("href")||"",target:a.attr("target")||"",title:a.attr("title")||""},o(n).render(i)),html:!0,placement:"bottom",viewport:"#"+l.editor.attr("id"),trigger:"manual",template:'<div class="popover atag-dlg" role="tooltip" style="width: 400px;max-width:400px"><div class="arrow"></div><div class="popover-content"></div></div>'}).on("shown.bs.popover",function(){e(".atag-dlg button").on("click",function(){var t=e(this).closest(".atag-dlg"),a=t.find("[name=target]").val(),o=t.find("[name=title]").val(),n=t.find("[name=href]").val();r.attr("target",a).attr("title",o).attr("href",n),r.popover("destroy")})}).popover("show");return!1}),e(window).bind("touchend",function(t){var e=r.is(t.target)||r.has(t.target).length>0,a=this.getCurrentRange();a&&a.startContainer===a.endContainer&&a.startOffset===a.endOffset&&!e||(this.saveSelection(),this.updateToolbar(r,c,s))})}r.prototype.updateToolbar=function(t,a,o){o.activeToolbarClass&&e(o.toolbarSelector).find(a).each(function(){var t=e(this),a=t.data(o.commandRole).split(" "),n=a[0];a.length>1&&document.queryCommandEnabled(n)&&document.queryCommandValue(n)===a[1]?t.addClass(o.activeToolbarClass):1===a.length&&document.queryCommandEnabled(n)&&document.queryCommandState(n)?t.addClass(o.activeToolbarClass):t.removeClass(o.activeToolbarClass)})},r.prototype.execCommand=function(t,e,a,o,n){var i=t.split(" "),l=i.shift(),r=i.join(" ")+(e||""),s=t.split("-");1===s.length?document.execCommand(l,!1,r):"format"===s[0]&&2===s.length&&document.execCommand("formatBlock",!1,s[1]),(a||this.editor).trigger("change"),this.updateToolbar(a||this.editor,n||this.toolbarBtnSelector,o||this.options)},r.prototype.bindHotkeys=function(t,a,o){var n=this;e.each(a.hotKeys,function(i,l){l&&e(t).keydown(i,function(i){t.attr("contenteditable")&&e(t).is(":visible")&&(i.preventDefault(),i.stopPropagation(),n.execCommand(l,null,t,a,o))}).keyup(i,function(a){t.attr("contenteditable")&&e(t).is(":visible")&&(a.preventDefault(),a.stopPropagation())})}),t.keyup(function(){t.trigger("change")})},r.prototype.getCurrentRange=function(){var t=void 0,e=void 0;return window.getSelection?(t=window.getSelection()).getRangeAt&&t.rangeCount&&(e=t.getRangeAt(0)):document.selection&&(e=document.selection.createRange()),e},r.prototype.saveSelection=function(){this.selectedRange=this.getCurrentRange()},r.prototype.restoreSelection=function(){var t=void 0;if(window.getSelection||document.createRange){if(t=window.getSelection(),this.selectedRange){try{t.removeAllRanges()}catch(t){document.body.createTextRange().select(),document.selection.empty()}t.addRange(this.selectedRange)}}else document.selection&&this.selectedRange&&this.selectedRange.select()},r.prototype.markSelection=function(t,e){this.restoreSelection(),document.queryCommandSupported("hiliteColor")&&document.execCommand("hiliteColor",!1,t||"transparent"),this.saveSelection()},r.prototype.bindToolbar=function(t,a,o,n){var i=this;a.find(n).click(function(){i.restoreSelection(),t.focus(),i.execCommand(e(this).data(o.commandRole),null,t,o,n),i.saveSelection()}),a.find("[data-toggle=dropdown]").on("click",function(){i.markSelection(o.selectionColor,o)}),a.on("hide.bs.dropdown",function(){i.markSelection(!1,o)}),a.find("input[type=text][data-"+o.commandRole+"]").on("webkitspeechchange change",function(){var a=this.value;this.value="",i.restoreSelection(),""===window.getSelection().toString().trim()&&a&&(i.editor.append("<span>"+a+"</span>"),function(t){if(window.getSelection&&document.createRange){var e=window.getSelection(),a=document.createRange();a.selectNodeContents(t),e.removeAllRanges(),e.addRange(a)}else if(document.selection&&document.body.createTextRange){var o=document.body.createTextRange();o.moveToElementText(t),o.select()}}(e("span:last",i.editor)[0])),a&&(t.focus(),i.execCommand(e(this).data(o.commandRole),a,t,o,n)),i.saveSelection()}).on("blur",function(){i.markSelection(!1,o)})},e.fn.wysiwyg=function(t){return new r(this,t)},e.hotkeys={version:"0.8",specialKeys:{8:"backspace",9:"tab",10:"return",13:"return",16:"shift",17:"ctrl",18:"alt",19:"pause",20:"capslock",27:"esc",32:"space",33:"pageup",34:"pagedown",35:"end",36:"home",37:"left",38:"up",39:"right",40:"down",45:"insert",46:"del",96:"0",97:"1",98:"2",99:"3",100:"4",101:"5",102:"6",103:"7",104:"8",105:"9",106:"*",107:"+",109:"-",110:".",111:"/",112:"f1",113:"f2",114:"f3",115:"f4",116:"f5",117:"f6",118:"f7",119:"f8",120:"f9",121:"f10",122:"f11",123:"f12",144:"numlock",145:"scroll",186:";",191:"/",220:"\\",222:"'",224:"meta"},shiftNums:{"`":"~",1:"!",2:"@",3:"#",4:"$",5:"%",6:"^",7:"&",8:"*",9:"(",0:")","-":"_","=":"+",";":": ","'":'"',",":"<",".":">","/":"?","\\":"|"}},e.each(["keydown","keyup","keypress"],function(){e.event.special[this]={add:l}}),t("wysiwyg",r)});