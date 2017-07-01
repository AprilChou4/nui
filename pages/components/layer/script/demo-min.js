Nui.define('src/components/placeholder',['component'],function(t){return this.extend(t,{options:{text:'',animate:!1,equal:!1,color:'#ccc'},_template:{list:'<%each style%><%$index%>:<%$value%>;<%/each%>',wrap:'<strong class="<% className %>" style="<%include \'list\'%>" />',elem:'<b style="<%include \'list\'%>"><%text%></b>'},_init:function(){this._exec()},_exec:function(){var t=this,e=t._getTarget();if(e){var n=t.deftext=e.attr('placeholder');!t.deftext&&t.options.text&&e.attr('placeholder',n=t.options.text),t.text=Nui.trim(n),void 0===t.val&&(t.val=Nui.trim(e.val())),t.text&&t._create()}},_create:function(){var t=this,e=t.options,n=t.constructor;if(!e.animate&&(e.animate||'placeholder'in document.createElement('input')))t._setStyle();else{e.animate&&t.target.removeAttr('placeholder');var i=t._tplData();i.style={'position':'relative','display':'inline-block','width':t.target.outerWidth()+'px','overflow':'hidden','cursor':'text'},t.target.wrap(t._tpl2html('wrap',i)),t.element=$(t._tpl2html('elem',{text:t.text,style:function(){var i=t.target.outerHeight(),o=t.target.is('textarea');return{'display':Nui.trim(t.target.val())?'none':'inline','position':'absolute','left':n._getSize(t.target,'l','padding')+n._getSize(t.target,'l')+'px','top':n._getSize(t.target,'t','padding')+n._getSize(t.target,'t')+'px','height':o?'auto':i+'px','line-height':o?'normal':i+'px','color':e.color}}()})).insertAfter(t.target),t._events()}},_setStyle:function(){var t=this;t.options;t.className='_placeholder-'+t.__id,t.target.addClass(t.className),t.constructor.style||t._createStyle(),t._createRules()},_createStyle:function(){var t=this,e=document.createElement('style');document.head.appendChild(e),t.constructor.style=e.sheet},_createRules:function(){var t=this,e=t.constructor.style,n=t.__id;try{e.deleteRule(n)}catch(t){}Nui.each(['::-webkit-input-placeholder',':-ms-input-placeholder','::-moz-placeholder'],function(i){var o='.'+t.className+i,a='opacity:1; color:'+(t.options.color||'');try{'addRule'in e?e.addRule(o,a,n):'insertRule'in e&&e.insertRule(o+'{'+a+'}',n)}catch(t){}})},_events:function(){var t=this,e=t.options,n=t.constructor,i=n._getSize(t.target,'l','padding')+n._getSize(t.target,'l');t._on('click',t.element,function(){t.target.focus()}),t._on('focus',t.target,function(){e.animate&&t.element.stop(!0,!1).animate({left:i+10,opacity:'0.5'})}),t._on('blur change',t.target,function(e,n){t.value()}),t._on('keyup keydown',t.target,function(e,n){Nui.trim(n.val())?t.element.hide():t.element.show()})},_reset:function(){var t=this;t._off(),t.element&&(t.element.remove(),t.target.unwrap()),t.target.val(t.val).removeClass(t.className),t.deftext?t.target.attr('placeholder',t.deftext):t.target.removeAttr('placeholder')},value:function(t){var e=this.constructor,n=this.target,i=e._getSize(n,'l','padding')+e._getSize(n,'l'),o=Nui.trim(arguments.length?n.val(t).val():n.val());!this.options.equal&&o===this.text||!o?(n.val(''),this.element&&this.element.show(),this.options.animate&&this.element.stop(!0,!1).animate({left:i,opacity:'1'})):this.element&&this.element.hide()}})}),Nui.define('src/components/layer/layer',['component','util'],function(t,e){var n={_maskzIndex:1e4,_zIndex:1e4,_init:function(){var t=this,e=null;Nui.win.on('resize',function(){clearTimeout(e),e=setTimeout(function(){Nui.each(t.__instances,function(t){var e=t.options;(e.position||!0===e.isCenter)&&t.resize()})})})},$fn:null,$ready:null,init:null},i={content:'',width:320,height:'auto',maxWidth:0,maxHeight:0,timer:0,edge:0,container:'body',title:'温馨提示',isMove:!1,isMask:!0,isInnerMove:!1,isClickMask:!1,isMoveMask:!1,isHide:!0,isCenter:!0,isFull:!1,isTop:!1,isTips:!1,isFixed:!0,scrollbar:!0,align:'center',bubble:{enable:!1,dir:'top'},iframe:{enable:!1,cache:!1,src:''},close:{enable:!0,text:'×'},confirm:{enable:!1,name:'normal',text:'确定',callback:function(){return!0}},cancel:{enable:!0,text:'取消'},position:null,under:null,button:null,onMove:null,onResize:null,onScroll:null,onBeforeDestroy:null};return this.extend(t,{static:n,options:i,_template:{layout:'<div class="<% className %>" style="<% include \'style\' %>"><div class="layer-box"><%if close%><% var btn = close %><% include "button" %><%/if%><%if bubble%><span class="layer-bubble layer-bubble-<%bubble%>"><b></b><i></i></span><%/if%><%if title%><div class="layer-head"><span class="layer-title"><%title%></span></div><%/if%><div class="layer-body"><div class="layer-main"><%content%></div></div><%if button && button.length%><div class="layer-foot" style="text-align:<%align%>"><div class="layer-inner"><%each button btn%><%include "button"%><%/each%></div></div><%/if%></div></div>',button:'<button class="ui-button<%if btn.name%><%each [].concat(btn.name) name%> ui-button-<%name%><%/each%><%/if%> layer-button-<%btn.id%>"><%btn.text || "按钮"%></button>',iframe:'<iframe<%each attr%> <%$index%>="<%$value%>"<%/each%>></iframe>',mask:'<div class="nui-layer-mask<%if skin%> nui-layer-mask-<%skin%><%/if%>" style="<%include \'style\'%>"><div class="layer-mask"></div></div>',movemask:'<div class="nui-layer-movemask<%if skin%> nui-layer-movemask-<%skin%><%/if%>" style="<%include \'style\'%>"></div>',style:'<%each style%><%$index%>: <%$value%>; <%/each%>'},data:{},_init:function(){this._zIndex=++this.constructor._zIndex,this._exec()},_exec:function(){var t=this,e=t.options,n=t.constructor;if(t._container=n._jquery(e.container),t._container.length){if(t._containerDOM=t._container.get(0),'BODY'!==t._containerDOM.tagName){t._window=t._container,t._isWindow=!1;var i=t._container.css('position');'absolute'!==i&&'relative'!==i&&t._container.css('position','relative')}else t._window=Nui.win,t._isWindow=!0;t._isFixed=e.isFixed&&!Nui.bsie6&&t._isWindow,t._create()}},_create:function(){var t=this,e=t.options,n=t._createButton(),i=!1;!0!==e.isTips&&(i='string'==typeof e.title);var o=t._tplData({content:t._getContent(),close:n.close,button:n.button,title:i?e.title||'温馨提示':null,bubble:!0===e.bubble.enable?e.bubble.dir:null,align:e.align||'center',style:{'z-index':t._zIndex,'position':'absolute','display':'block'}});t._isFixed&&(o.style.position='fixed'),t._setTop(),t.element=$(t._tpl2html('layout',o)).appendTo(t._container),t._box=t.element.children('.layer-box'),t._head=t._box.children('.layer-head'),t._body=t._box.children('.layer-body'),t._main=t._body.children('.layer-main'),t._foot=t._box.children('.layer-foot'),!0!==e.isTips&&(!0===e.iframe.enable&&(t._iframe=t._main.children('iframe'),t._iframeOnload()),!0===e.isMove&&i&&t._bindMove(),!0===e.isTop&&t._bindTop()),t._button.length&&t._buttonEvent(),!0===e.isFixed&&!0==!t._isFixed&&t._bindScroll(),t._show()},_getContent:function(){var t=this,e=t.options,n='';return!0!==e.isTips&&!0===e.iframe.enable?n=t._createIframe():'string'==typeof e.content?n=e.content:e.content instanceof jQuery&&(n=e.content.prop('outerHTML')),n},_createIframe:function(){var t=this,n=t.options,o='layer-iframe'+t.__id,a=n.iframe.src;return!1===i.iframe.cache&&(a=e.setParam('_',(new Date).getTime(),a)),t._tpl2html('iframe',{attr:{frameborder:'0',name:o,id:o,src:a,scroll:'hidden',style:'width:100%;'}})},_iframeOnload:function(){var t=this;t._iframe.load(function(){t._iframeDocument=t._iframe.contents(),t._resize()})},_createButton:function(){var t=this,e=t.options,n={},i={},o={};return t._button=[],!0!==e.isTips&&(Nui.each(['confirm','cancel'],function(t){var i=e[t];i&&!0===i.enable&&(n[t]={id:t,name:i.name,text:i.text,callback:i.callback})}),e.button&&e.button.length&&Nui.each(e.button,function(e){var i=e.id;o[i]||(o[i]=!0,n[i]&&(e.text||('cancel'===i?e.text='取消':'confirm'===i&&(e.text='确定')),delete n[i]),t._button['close'===i?'unshift':'push'](e))}),Nui.each(n,function(e){t._button.push(e)})),!o.close&&e.close&&!0===e.close.enable&&t._button.unshift({id:'close',name:e.close.name,text:e.close.text,callback:e.close.callback}),t._button[0]&&'close'===t._button[0].id?(i.close=t._button[0],i.button=t._button.slice(1)):i.button=t._button,i},_buttonEvent:function(){var t=this;Nui.each(t._button,function(e){t._on('click',t.element,'.layer-button-'+e.id,function(n,i){if(!i.hasClass('nui-button-disabled')){var o=e.id,a=e.callback,s='function'==typeof a?a.call(t,t._main,t.__id,i):null;('confirm'===o&&!0===s||'confirm'!==o&&!1!==s)&&t.destroy()}})})},_bindTop:function(){var t=this;t._on('click',t.element,function(){t._setzIndex()})},_bindMove:function(){var t,e,n,i,o=this,a=o.options,s=o.element,r=o.constructor,l=s,c=!1;o._on('mousedown',o._head,function(n,i){c=!0,o._setzIndex(),!0===a.isMoveMask&&(l=o._moveMask=$(o._tpl2html('movemask',{skin:a.skin,style:{'z-index':o._zIndex+1,'cursor':'move','position':o._isFixed?'fixed':'absolute'}})).appendTo(o._container),l.css({width:o.data.outerWidth-r._getSize(l,'lr','all'),height:o.data.outerHeight-r._getSize(l,'tb','all'),top:o.data.top,left:o.data.left})),i.css('cursor','move'),t=n.pageX-o.data.left,e=n.pageY-o.data.top,n.stopPropagation()}),o._on('mousemove',Nui.doc,function(s){var r=o._container.outerWidth(),u=o._container.outerHeight();if(c)return n=s.pageX-t,i=s.pageY-e,n<0&&(n=0),i<0&&(i=0),!0===a.isInnerMove&&(n+o.data.outerWidth>r&&(n=r-o.data.outerWidth),i+o.data.outerHeight>u&&(i=u-o.data.outerHeight)),o.data.top=i,o.data.left=n,l.css({top:i,left:n}),!c}),o._on('mouseup',Nui.doc,function(t){c&&(c=!1,o._head.css('cursor','default'),!0===a.isMoveMask&&(s.css(o.data),o._moveMask.remove(),o._moveMask=null),'function'==typeof a.onMove&&a.onMove.call(o,o._main,o.__id),o.data.offsetTop=o.data.top-o._window.scrollTop(),o.data.offsetLeft=o.data.left-o._window.scrollLeft())})},_bindScroll:function(){var t=this,e=t.options;t._on('scroll',t._window,function(){var n=t.data.offsetTop+t._window.scrollTop(),i=t.data.offsetLeft+t._window.scrollLeft();t.data.top=n,t.data.left=i,t.element.css(t.data),'function'==typeof e.onScroll&&e.onScroll.call(t,t._main,t.__id)})},_setzIndex:function(){var t=this,e=t.constructor;t._isTop&&t.element&&(t._isTop=!1,t._zIndex=++e._zIndex,t.element.css('zIndex',t._zIndex),t._setTop())},_setLower:function(t){var e=this,n=e.constructor,i=e.options,o=[];i.under&&(o=o.concat(i.under),o.length&&Nui.each(o,function(e,i){e&&e.element&&e.element.css('z-index',t?e._zIndex:n._maskzIndex-1)}))},_setTop:function(){var t=this,e=t.constructor;Nui.each(e.__instances,function(e){e&&e!==t&&!0===e.options.isTop&&(e._isTop=!0)})},_position:function(){var t,e=this,n=e.data,i=e.options.position,o={top:i.top,left:i.left,right:i.right,bottom:i.bottom};return void 0!==o.top&&void 0!==o.bottom&&delete o.bottom,void 0!==o.left&&void 0!==o.right&&delete o.right,Nui.each(o,function(e,i){if(void 0===e)return delete o[i],!0;t=e,'string'==typeof e&&(e?'top'===i||'bottom'===i?'self'===e?t=n.outerHeight:/[\+\-\*\/]/.test(e)&&(t=new Function('var self = '+n.outerHeight+'; return '+e)()):'self'===e?t=n.outerWidth:/[\+\-\*\/]/.test(e)&&(t=new Function('var self = '+n.outerWidth+'; return '+e)()):t=0),o[i]='auto'===t?'auto':parseFloat(t)+'px'}),o},_resize:function(t){var e=this,n=(e.constructor,e.options),i=e.element,o=e._window.outerWidth(),a=e._window.outerHeight(),s=0,r=0;if(e._isFixed||(r=e._window.scrollLeft(),s=e._window.scrollTop()),e._setSize(),n.position){var l=i.css(e._position()).position();Nui.bsie6&&(r=0,s=0),e.data.left=l.left+r,e.data.top=l.top+s}else if('init'===t||!0===n.isCenter){var c=(o-e.data.outerWidth)/2+r,u=(a-e.data.outerHeight)/2+s,d=n.edge>0?n.edge:0;e.data.left=c>0?c:d,e.data.top=u>0?u:d}e.data.offsetTop=e.data.top-e._window.scrollTop(),e.data.offsetLeft=e.data.left-e._window.scrollLeft(),i.css(e.data)},_setSize:function(){var t=this,e=t.constructor,n=t.options,i=t.element,o=n.edge>0?2*n.edge:0,a=t._window.outerWidth()-o,s=t._window.outerHeight()-o;t._body.css({height:'auto',overflow:'visible'}),i.css({top:'auto',left:'auto',width:'auto',height:'auto'});var r=e._getSize(t._box,'tb','all')+t._head.outerHeight()+e._getSize(t._head,'tb','margin')+e._getSize(t._body,'tb','all')+t._foot.outerHeight()+e._getSize(t._foot,'tb','margin'),l=i.outerWidth();!0!==n.isFull?(n.width>0&&(l=n.width),n.maxWidth>0&&l>=n.maxWidth&&(l=n.maxWidth),!0===n.scrollbar&&l>a&&(l=a)):l=a;var c='nowrap';(n.width>0||l==n.maxWidth||l==a)&&(c='normal'),t.data.width=l-e._getSize(i,'lr','all'),t._main.css('white-space',c),i.width(t.data.width);var u=i.outerHeight();t._iframeDocument&&(t._iframeDocument[0].layer=t,u=r+t._iframeDocument.find('body').outerHeight()),!0!==n.isFull?(u=n.height>0?n.height:u,n.maxHeight>0&&u>=n.maxHeight&&(u=n.maxHeight),(!0===n.scrollbar||t._iframeDocument)&&u>s&&(u=s)):u=s,t.data.outerWidth=l,t.data.outerHeight=u,t.data.height=u-e._getSize(i,'tb','all'),i.height(t.data.height);var d=t.data.height-r;t._main.outerHeight()>d&&!t._iframe&&!0===n.scrollbar&&t._body.css('overflow','auto'),t._iframe&&t._iframe.height(d),t._body.height(d)},_showMask:function(){var t=this,e=t.constructor,n=t.options;t._containerDOM.__layermask__||(t._containerDOM.__layermask__=$(t._tpl2html('mask',{skin:n.skin,style:{'z-index':e._maskzIndex,'position':t._isFixed?'fixed':'absolute','top':'0px','left':'0px','width':'100%','height':t._isFixed?'100%':t._container.outerHeight()+'px'}})).appendTo(t._container)),!0===n.isClickMask&&t._on('click',t._containerDOM.__layermask__,function(){t.hide()})},_show:function(){var e=this,n=e.options;return t('init',e._main),e._resize('init'),e._setLower(),!0===n.isMask&&e._showMask(),n.timer>0&&(e._timer=setTimeout(function(){e.hide()},n.timer)),'function'==typeof n.onInit&&n.onInit.call(this,e._main,e.__id),e},_reset:function(){var e=this,n=e.constructor,i=!0;t.exports._reset.call(this),t('destroy',e._main),Nui.each(n.__instances,function(t){if(t&&!0===t.options.isMask&&t!==e&&t._containerDOM===e._containerDOM)return i=!1}),i&&e._containerDOM.__layermask__&&(e._containerDOM.__layermask__.remove(),e._containerDOM.__layermask__=null),e.options.timer>0&&clearTimeout(e._timer)},resize:function(){var t=this,e=t.options;t.element;return t._resize(),'function'==typeof e.onResize&&e.onResize.call(this,t._main,t.__id),t},hide:function(){!0===this.options.isHide&&this.destroy()},destroy:function(){var t=this,e=t.constructor,n=t.options;'function'==typeof n.onBeforeDestroy&&!1===n.onBeforeDestroy.call(this,t._main,t.__id)||(t._delete(),t._reset(),t._setLower(!0),e._zIndex--,'function'==typeof n.onDestroy&&n.onDestroy.call(this,t._main,t.__id))}})}),Nui.define('src/components/layer/layerExt',['src/components/layer/layer'],function(layer){return layer.alert=function(t,e,n,i){var o;return'object'==typeof t&&(o=t,t=o.content,delete o.content),layer($.extend({content:'<div style="padding:10px; line-height:20px;">'+(t||'')+'</div>',width:n,height:i,cancel:{text:'关闭'}},o||{}))},layer.confirm=function(t,e,n,i,o){var a;return'object'==typeof t&&(a=t,t=a.content,delete a.content),layer($.extend(!0,{content:'<div style="padding:10px; line-height:20px;">'+(t||'')+'</div>',width:i,height:o,align:'right',confirm:{callback:e||function(){return!0}}},a||{},{confirm:{enable:!0}}))},layer.iframe=function(t,e,n,i){return layer({iframe:{enable:!0,src:t},width:n,height:i,cancel:{text:'关闭'}})},layer.tips=function(t,e,n,i,o){var a;return'object'==typeof t&&(a=t,t=a.content,delete a.content),layer($.extend(!0,{content:t,id:'tips',width:i||'auto',height:o||'auto',position:n,bubble:{enable:!0,dir:e||'top'}},a||{},{isTips:!0,isMask:!1,isClose:!1,close:{enable:!1}}))},layer.loading=function(t,e,n){var i;return'object'==typeof t&&(i=t,t=i.content,delete i.content),Nui.type(t,'Number')&&(n=e,e=t,t=''),layer($.extend({content:'<div style="padding:10px;">'+(t||'正在加载数据...')+'</div>',width:e||'auto',height:n||'auto'},i||{},{id:'loading',isTips:!0,close:{enable:!1}}))},layer.message=function(t,e){var n,i='#f00';return'object'==typeof t&&(n=t,e=n.content,delete n.content,t='success'),'success'!==t&&'error'!==t&&(e=t,t='success'),'success'!==t||e?'error'!==t||e||(e='操作失败'):e='操作成功','success'===t&&(i='#39B54A'),layer($.extend({content:'<div style="padding:10px; color:'+i+';">'+e+'</div>',id:'message',width:'auto',height:'auto',isTips:!0,timer:1500,close:{enable:!0}},n||{},{isMask:!1}))},layer.form=function(options){var onInit=options.onInit;delete options.onInit;var validator,valid=options.valid,btns=$.extend([],options.button||[{id:'cancel',text:'关闭'},{id:'confirm',name:'normal',text:'保存'}]);Nui.each(btns,function(t,e){if('confirm'===t.id&&!t.callback)return btns[e].callback=function(t){t.find('form').submit()},!1}),delete options.button;var formLayer=layer($.extend(!0,{button:btns},{scrollbar:!1,id:'form',onInit:function(main,id){var that=this,elems=main.find('[name!=""][data-rule]'),form=main.find('form'),rules={},messages={},setting=form.data('setting');elems.each(function(){var elem=$(this),name=elem.attr('name'),data=elem.data(),rule=eval('('+data.rule+')'),message=eval('('+data.message+')');rules[name]=rule,$.each(message,function(t,e){'function'==typeof options.messageFilter&&(message[t]=options.messageFilter(name,e)||'')}),messages[name]=message});var opts={rules:rules,messages:messages,errorClass:'s-err',onkeyup:!1,focusInvalid:!1,focusCleanup:!0,ignore:'',success:function(t,e){t.remove(),$(e).addClass('s-succ')},errorPlacement:function(t,e){e.removeClass('s-succ'),t.text()&&e.closest(options.itemWrap||'.ui-item').find(options.errorWrap||'.ui-err').html(t)},submitHandler:function(){var t={};if(options.ajax&&'function'==typeof options.ajax.getData)t=options.ajax.getData(form);else{var e=form.serializeArray();$.each(e,function(e,n){t[n.name]||(t[n.name]=[]),t[n.name].push(n.value)});for(var n in t)t[n]=t[n].join(',')}var i=layer.loading({content:options.loading||'正在保存数据...',under:that});'function'==typeof options.onBeforeSubmit&&(t=options.onBeforeSubmit.call(that,main,id,t)||t),$.ajax($.extend({url:form.attr('action'),dataType:'json',type:form.attr('method')||'POST',data:t,success:function(t,e){i.hide(),'function'==typeof options.onSuccess&&options.onSuccess.call(that,main,id,t,e)},error:function(t){i.hide(),'function'==typeof options.onError&&options.onError.call(that,main,id,t)}},options.ajax||{}),null)}};validator=form.validate($.extend(!0,opts,setting||{},valid||{})),'function'==typeof onInit&&onInit.call(that,main,id,validator)}},options||{}));return formLayer.validator=validator,formLayer},layer}),Nui.define('./script/demo',function(require,imports,renders,extend){var t=require('src/components/layer/layerExt'),e=(require('src/components/placeholder'),t({content:'<input type="text" data-placeholder-options="{animate:true}" placeholder="默认文本"><a>aaa</a>',width:300,maxWidth:400,id:'aaa',skin:'aaa',title:'',close:{},cancel:{},isCenter:!0,isMask:!1,isClickMask:!0,isTop:!0,isMove:!0,isInnerMove:!0,isHide:!1,timer:1e3,button:[{id:'aaaaa',text:'111'}],position:{bottom:'self*-1+30',right:0},scrollbar:!0,onInit:function(t){t.on('click','a',function(){t.append('<p>aaaa</p><p>aaaa</p><p>aaaa</p><p>aaaa</p><p>aaaa</p><p>aaaa</p><p>aaaa</p>'),e.resize()})},onBeforeDestroy:function(){return!1}}));t.message(''),$('#btn').click(function(){e.element.animate({top:e.data.top-e.data.outerHeight+30})}),$('#reset').click(function(){t('reset')})});
//# sourceMappingURL=demo-min.js.map?v=907bbd4