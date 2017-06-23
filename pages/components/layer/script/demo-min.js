Nui.define("{cpns}/placeholder",["util","component"],function(t,e){var i=t.supportHtml5("placeholder","input");return this.extend(e,{options:{text:"",animate:!1,equal:!1,color:"#ccc"},_template:{list:"<%each style%><%$index%>:<%$value%>;<%/each%>",wrap:'<strong class="<% className %>" style="<%include \'list\'%>" />',elem:"<b style=\"<%include 'list'%>\"><%text%></b>"},_init:function(){this._exec()},_exec:function(){var t=this,e=t._getTarget();if(e){var i=t.deftext=e.attr("placeholder");!t.deftext&&t.options.text&&e.attr("placeholder",i=t.options.text),t.text=Nui.trim(i),void 0===t.val&&(t.val=Nui.trim(e.val())),t.text&&t._create()}},_create:function(){var t=this,e=t.options,n=t.constructor;if(e.animate||!e.animate&&!i){e.animate&&t.target.removeAttr("placeholder");var o=t._tplData();o.style={position:"relative",display:"inline-block",width:t.target.outerWidth()+"px",overflow:"hidden",cursor:"text"},t.target.wrap(t._tpl2html("wrap",o)),t.element=$(t._tpl2html("elem",{text:t.text,style:function(){var i=t.target.outerHeight(),o=t.target.is("textarea");return{display:Nui.trim(t.target.val())?"none":"inline",position:"absolute",left:n._getSize(t.target,"l","padding")+n._getSize(t.target,"l")+"px",top:n._getSize(t.target,"t","padding")+n._getSize(t.target,"t")+"px",height:o?"auto":i+"px","line-height":o?"normal":i+"px",color:e.color}}()})).insertAfter(t.target),t._events()}else t._setStyle()},_setStyle:function(){var t=this;t.options;t.className="_placeholder-"+t.__id,t.target.addClass(t.className),t.constructor.style||t._createStyle(),t._createRules()},_createStyle:function(){var t=this,e=document.createElement("style");document.head.appendChild(e),t.constructor.style=e.sheet},_createRules:function(){var t=this,e=t.constructor.style,i=t.__id;try{e.deleteRule(i)}catch(t){}Nui.each(["::-webkit-input-placeholder",":-ms-input-placeholder","::-moz-placeholder"],function(n){var o="."+t.className+n,a="opacity:1; color:"+(t.options.color||"");try{"addRule"in e?e.addRule(o,a,i):"insertRule"in e&&e.insertRule(o+"{"+a+"}",i)}catch(t){}})},_events:function(){var t=this,e=t.options,i=t.constructor,n=i._getSize(t.target,"l","padding")+i._getSize(t.target,"l");t._on("click",t.element,function(){t.target.focus()}),t._on("focus",t.target,function(){e.animate&&t.element.stop(!0,!1).animate({left:n+10,opacity:"0.5"})}),t._on("blur change",t.target,function(e,i){t.value()}),t._on("keyup keydown",t.target,function(e,i){Nui.trim(i.val())?t.element.hide():t.element.show()})},_reset:function(){var t=this;t._off(),t.element&&(t.element.remove(),t.target.unwrap()),t.target.val(t.val).removeClass(t.className),t.deftext?t.target.attr("placeholder",t.deftext):t.target.removeAttr("placeholder")},value:function(t){var e=this.constructor,i=this.target,n=e._getSize(i,"l","padding")+e._getSize(i,"l"),o=Nui.trim(arguments.length?i.val(t).val():i.val());!this.options.equal&&o===this.text||!o?(i.val(""),this.element&&this.element.show(),this.options.animate&&this.element.stop(!0,!1).animate({left:n,opacity:"1"})):this.element&&this.element.hide()}})}),Nui.define("src/components/layer/layer",["component","util"],function(t,e){var i={_maskzIndex:1e4,_zIndex:1e4,_init:function(){var t=this;Nui.win.on("resize",function(){Nui.each(t.__instances,function(t){var e=t.options;(e.position||!0===e.isCenter)&&setTimeout(function(){t.resize()})})})},$fn:null,$ready:null,init:null},n={content:"",width:320,height:"auto",maxWidth:0,maxHeight:0,timer:0,edge:0,container:"body",title:"温馨提示",isMove:!1,isMask:!0,isInnerMove:!1,isClickMask:!1,isMoveMask:!1,isHide:!0,isCenter:!1,isFull:!1,isTop:!1,isTip:!1,isFixed:!0,scrollbar:!0,align:"center",bubble:{enable:!1,dir:"top"},iframe:{enable:!1,cache:!1,src:""},close:{enable:!0,text:"×"},confirm:{enable:!1,name:"normal",text:"确定",callback:function(){return!0}},cancel:{enable:!0,text:"取消"},position:null,under:null,button:null,onMove:null,onResize:null,onScroll:null};return this.extend(t,{static:i,options:n,_template:{layout:'<div class="<% className %>" style="<% include \'style\' %>"><div class="layer-box"><%if close%><% var btn = close %><% include "button" %><%/if%><%if bubble%><span class="layer-bubble layer-bubble-<%bubble%>"><b></b><i></i></span><%/if%><%if title%><div class="layer-head"><span class="layer-title"><%title%></span></div><%/if%><div class="layer-body"><div class="layer-main"><%content%></div></div><%if button && button.length%><div class="layer-foot" style="text-align:<%align%>"><%each button btn%><%include "button"%><%/each%></div><%/if%></div></div>',button:'<button class="ui-button<%if btn.name%><%each [].concat(btn.name) name%> ui-button-<%name%><%/each%><%/if%> layer-button-<%btn.id%>"><%btn.text || "按钮"%></button>',iframe:'<iframe<%each attr%> <%$index%>="<%$value%>"<%/each%>></iframe>',mask:'<div class="nui-layer-mask<%if skin%> nui-layer-mask-<%skin%><%/if%>" style="<%include \'style\'%>"><div class="layer-mask"></div></div>',movemask:'<div class="nui-layer-movemask<%if skin%> nui-layer-movemask-<%skin%><%/if%>" style="<%include \'style\'%>"></div>',style:"<%each style%><%$index%>: <%$value%>; <%/each%>"},_temp:{},_init:function(){this._zIndex=++this.constructor._zIndex,this._exec()},_exec:function(){var t=this,e=t.options,i=t.constructor;if(t._container=i._jquery(e.container),t._container.length){if(t._containerDOM=t._container.get(0),"BODY"!==t._containerDOM.tagName){t._window=t._container,t._isWindow=!1;var n=t._container.css("position");"absolute"!==n&&"relative"!==n&&t._container.css("position","relative")}else t._window=Nui.win,t._isWindow=!0;t._isFixed=e.isFixed&&!Nui.bsie6&&t._isWindow,t._create()}},_create:function(){var t=this,e=t.options,i={},n=!1;!0!==e.isTip&&(i=t._createButton(),n="string"==typeof e.title);var o=t._tplData({content:t._getContent(),close:i.close,button:i.button,title:n?e.title||"温馨提示":null,bubble:!0===e.bubble.enable?e.bubble.dir:null,align:e.align||"center",style:{"z-index":t._zIndex,position:"absolute",display:"block"}});t._isFixed&&(o.style.position="fixed"),t._setTop(),t.element=$(t._tpl2html("layout",o)).appendTo(t._container),t._box=t.element.children(".layer-box"),t._head=t._box.children(".layer-head"),t._body=t._box.children(".layer-body"),t._main=t._body.children(".layer-main"),t._foot=t._box.children(".layer-foot"),!0!==e.isTip&&(!0===e.iframe.enable&&(t._iframe=t._main.children("iframe"),t._iframeOnload()),!0===e.isMove&&n&&t._bindMove(),t._button.length&&t._buttonEvent(),!0===e.isTop&&t._bindTop()),!0===e.isFixed&&!0==!t._isFixed&&t._bindScroll(),t._show()},_getContent:function(){var t=this,e=t.options,i="";return!0!==e.isTip&&!0===e.iframe.enable?i=t._createIframe():"string"==typeof e.content?i=e.content:e.content instanceof jQuery&&(i=e.content.prop("outerHTML")),i},_createIframe:function(){var t=this,i=t.options,o="layer-iframe"+t.__id,a=i.iframe.src;return!1===n.iframe.cache&&(a=e.setParam("_",(new Date).getTime(),a)),t._tpl2html("iframe",{attr:{frameborder:"0",name:o,id:o,src:a,scroll:"hidden",style:"width:100%;"}})},_iframeOnload:function(){var t=this;t._iframe.load(function(){t._iframeDocument=t._iframe.contents(),t._resize()})},_createButton:function(){var t=this,e=t.options,i={},n={},o={};return t._button=[],Nui.each(["confirm","cancel"],function(t){var n=e[t];n&&!0===n.enable&&(i[t]={id:t,name:n.name,text:n.text,callback:n.callback})}),e.button&&e.button.length&&Nui.each(e.button,function(e){var n=e.id;o[n]||(o[n]=!0,i[n]&&(e.text||("cancel"===n?e.text="取消":"confirm"===n&&(e.text="确定")),delete i[n]),t._button["close"===n?"unshift":"push"](e))}),Nui.each(i,function(e){t._button.push(e)}),!o.close&&e.close&&!0===e.close.enable&&t._button.unshift({id:"close",name:e.close.name,text:e.close.text,callback:e.close.callback}),t._button[0]&&"close"===t._button[0].id?(n.close=t._button[0],n.button=t._button.slice(1)):n.button=t._button,n},_buttonEvent:function(){var t=this;Nui.each(t._button,function(e){t._on("click",t.element,".layer-button-"+e.id,function(i,n){if(!n.hasClass("nui-button-disabled")){var o=e.id,a=e.callback,l="function"==typeof a?a.call(t,t._main,t.__id,n):null;("confirm"===o&&!0===l||"confirm"!==o&&!1!==l)&&t.destroy()}})})},_bindTop:function(){var t=this;t._on("click",t.element,function(){t._setzIndex()})},_bindMove:function(){var t,e,i,n,o=this,a=o.options,l=o.element,s=o.constructor,r=l,c=!1;o._on("mousedown",o._head,function(i,n){c=!0,o._setzIndex(),!0===a.isMoveMask&&(r=o._moveMask=$(o._tpl2html("movemask",{skin:a.skin,style:{"z-index":o._zIndex+1,cursor:"move",position:o._isFixed?"fixed":"absolute"}})).appendTo(o._container),r.css({width:o._temp.width-s._getSize(r,"lr","all"),height:o._temp.height-s._getSize(r,"tb","all"),top:o._data.top,left:o._data.left})),n.css("cursor","move"),t=i.pageX-o._data.left,e=i.pageY-o._data.top,i.stopPropagation()}),o._on("mousemove",Nui.doc,function(l){var s=o._container.outerWidth(),_=o._container.outerHeight();if(c)return i=l.pageX-t,n=l.pageY-e,i<0&&(i=0),n<0&&(n=0),!0===a.isInnerMove&&(i+o._temp.width>s&&(i=s-o._temp.width),n+o._temp.height>_&&(n=_-o._temp.height)),o._data.top=n,o._data.left=i,r.css({top:n,left:i}),!c}),o._on("mouseup",Nui.doc,function(t){c&&(c=!1,o._head.css("cursor","default"),!0===a.isMoveMask&&(l.css(o._data),o._moveMask.remove(),o._moveMask=null),"function"==typeof a.onMove&&a.onMove.call(o,o._main,o.__id),o._temp.top=o._data.top-o._window.scrollTop(),o._temp.left=o._data.left-o._window.scrollLeft())})},_bindScroll:function(){var t=this,e=t.options;t._on("scroll",t._window,function(){var i=t._temp.top+t._window.scrollTop(),n=t._temp.left+t._window.scrollLeft();t._data.top=i,t._data.left=n,t.element.css(t._data),"function"==typeof e.onScroll&&e.onScroll.call(t,t._main,t.__id)})},_setzIndex:function(){var t=this,e=t.constructor;t._isTop&&(t._isTop=!1,t._zIndex=++e._zIndex,t.element.css("zIndex",t._zIndex),t._setTop())},_setLower:function(t){var e=this,i=e.constructor,n=e.options;n.under&&(Nui.type(n.under,"Object")?unders.push(n.under):Nui.isArray(n.under)&&(unders=n.under),unders.length&&Nui.each(unders,function(e,n){e&&e.element&&e.element.css("z-index",t?e._zIndex:i._maskzIndex-1)}))},_setTop:function(){var t=this,e=t.constructor;Nui.each(e.__instances,function(e){e&&e!==t&&!0===e.options.isTop&&(e._isTop=!0)})},_resize:function(t){var e=this,i=(e.constructor,e.options),n=e.element,o=e._window.outerWidth(),a=e._window.outerHeight(),l=0,s=0;if(e._isFixed||(s=e._window.scrollLeft(),l=e._window.scrollTop()),e._setSize(),i.position){var r=i.position;e._position={top:r.top,right:r.right,bottom:r.bottom,left:r.left};var c=n.css(e._position).position();Nui.bsie6&&(s=0,l=0),e._data.left=c.left+s,e._data.top=c.top+l}else if("init"===t||!0===i.isCenter){var _=(o-e._temp.width)/2+s,u=(a-e._temp.height)/2+l,d=i.edge>0?i.edge:0;e._data.left=_>0?_:d,e._data.top=u>0?u:d}e._temp.top=e._data.top-e._window.scrollTop(),e._temp.left=e._data.left-e._window.scrollLeft(),n.css(e._data)},_setSize:function(){var t=this,e=t.constructor,i=t.options,n=t.element,o=i.edge>0?2*i.edge:0,a=t._window.outerWidth()-o,l=t._window.outerHeight()-o;t._data={},t._body.css({height:"auto",overflow:"visible"}),n.css({top:"auto",left:"auto",width:"auto",height:"auto"});var s=e._getSize(t._box,"tb","all")+t._head.outerHeight()+e._getSize(t._head,"tb","margin")+e._getSize(t._body,"tb","all")+t._foot.outerHeight()+e._getSize(t._foot,"tb","margin"),r=n.outerWidth();!0!==i.isFull?(r=i.width>0?i.width:r,i.maxWidth>0&&r>=i.maxWidth&&(r=i.maxWidth),!0===i.scrollbar&&r>a&&(r=a)):r=a,t._data.width=r-e._getSize(n,"lr","all"),n.css(t._data);var c=n.outerHeight();t._iframeDocument&&(t._iframeDocument[0].layer=t,c=s+t._iframeDocument.find("body").outerHeight()),!0!==i.isFull?(c=i.height>0?i.height:c,i.maxHeight>0&&c>=i.maxHeight&&(c=i.maxHeight),(!0===i.scrollbar||t._iframeDocument)&&c>l&&(c=l)):c=l,t._temp.width=r,t._temp.height=c,t._data.height=c-e._getSize(n,"tb","all"),n.css(t._data);var _=t._data.height-s;t._main.outerHeight()>_&&!t._iframe&&!0===i.scrollbar&&t._body.css("overflow","auto"),t._iframe&&t._iframe.height(_),t._body.height(_)},_showMask:function(){var t=this,e=t.constructor,i=t.options;t._containerDOM.__layermask__||(t._containerDOM.__layermask__=$(t._tpl2html("mask",{skin:i.skin,style:{"z-index":e._maskzIndex,position:t._isFixed?"fixed":"absolute",top:"0px",left:"0px",width:"100%",height:t._isFixed?"100%":t._container.outerHeight()+"px"}})).appendTo(t._container)),!0===i.isClickMask&&t._on("click",t._containerDOM.__layermask__,function(){t.hide()})},_show:function(){var e=this,i=e.options;return t("init",e._main),e._resize("init"),e._setLower(),!0===i.isMask&&e._showMask(),i.timer>0&&(e._timer=setTimeout(function(){e.hide()},i.timer)),"function"==typeof i.onInit&&i.onInit.call(this,e._main,e.__id),e},_reset:function(){var e=this,i=e.constructor,n=!0;t.exports._reset.call(this),t("destroy",e._main),Nui.each(i.__instances,function(t){if(t&&!0===t.options.isMask&&t!==e&&t._containerDOM===e._containerDOM)return n=!1}),n&&e._containerDOM.__layermask__&&(e._containerDOM.__layermask__.remove(),e._containerDOM.__layermask__=null),e.options.timer>0&&clearTimeout(e._timer)},resize:function(){var t=this,e=t.options;t.element;return t._resize(),"function"==typeof e.onResize&&e.onResize.call(this,t._main,t.__id),t},hide:function(){!0===this.options.isHide&&this.destroy()},destroy:function(){var t=this,e=t.constructor,i=t.options;t._delete(),t._reset(),t._setLower(!0),e._zIndex--,"function"==typeof i.onDestroy&&i.onDestroy.call(this,t._main,t.__id)}})}),Nui.define("{cpns}/layer/layerExt",["src/components/layer/layer"],function(t){return t.alert=function(e,i,n,o){return t({content:'<div style="padding:10px; line-height:20px;">'+(e||"")+"</div>",width:n,height:o,cancel:{text:"关闭"}})},t.confirm=function(e,i,n,o,a){return t({content:'<div style="padding:10px; line-height:20px;">'+(e||"")+"</div>",width:o,height:a,align:"right",confirm:{enable:!0,callback:i||function(){return!0}}})},t.iframe=function(e,i,n,o){return t({iframe:{enable:!0,src:e},width:n,height:o,cancel:{text:"关闭"}})},t.tip=function(e,i,n,o,a){return t({content:e,id:"tip",width:"auto",height:"auto",maxWidth:o,maxHeight:a,isTip:!0,isClose:!1,position:n,bubble:{enable:!0,dir:i||"top"}})},t.loading=function(e,i,n){return t({content:'<div style="white-space:nowrap;">'+(e||"正在加载数据...")+"</div>",id:"loading",width:"auto",height:"auto",maxWidth:i,maxHeight:n,isTip:!0,isFull:!1})},t.message=function(){},t.form=function(){},t}),Nui.define("./script/demo",function(require,imports,renders,extend){var t=require("{cpns}/layer/layerExt");require("{cpns}/placeholder");$("#btn").click(function(){t.loading("")}),$("#reset").click(function(){t("reset")})});
//# sourceMappingURL=demo-min.js.map