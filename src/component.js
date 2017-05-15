/**
 * @author Aniu[2016-11-11 16:54]
 * @update Aniu[2016-11-11 16:54]
 * @version 1.0.1
 * @description 组件基类
 */

;!(function(window, document, undefined){
    if(typeof jQuery === undefined){
        return
    }
    Nui.define('component', ['template'], function(tpl){
        var module = this;

        Nui.win = $(window);
        Nui.doc = $(document);

        var getOptions = function(name, elem){
            var options = elem.data(name+'Options');
            if(!options){
                return
            }
            if(typeof options === 'string'){
                options = eval('('+ options +')')
            }
            return options
        }

        var statics = {
            _index:0,
            _instances:{},
            _options:{},
            _init:null,
            _jquery:function(elem){
                if(elem instanceof jQuery){
                    return elem
                }
                return $(elem)
            },
            _getSize:function(selector, dir, attr){
                var size = 0;
                attr = attr || 'border';
                dir = dir || 'tb';
                if(attr === 'all'){
                    return this._getSize(selector, dir) + this._getSize(selector, dir, 'padding')
                }
                var group = {
                    l:['Left'],
                    r:['Right'],
                    lr:['Left', 'Right'],
                    t:['Top'],
                    b:['Bottom'],
                    tb:['Top', 'Bottom']
                }
                var arr = [{
                    border:{
                        l:['LeftWidth'],
                        r:['RightWidth'],
                        lr:['LeftWidth', 'RightWidth'],
                        t:['TopWidth'],
                        b:['BottomWidth'],
                        tb:['TopWidth', 'BottomWidth']
                    }
                }, {
                    padding:group
                }, {
                    margin:group
                }];
                Nui.each(arr, function(val){
                    if(val[attr]){
                        Nui.each(val[attr][dir], function(v){
                            var value = parseInt(selector.css(attr+v));
                            size += isNaN(value) ? 0 : value
                        });
                    }
                });
                return size
            },
            $fn:function(name, module){
                if($.fn[name]){
                    return
                }
                $.fn[name] = function(){
                    var args = arguments;
                    var options = args[0];
                    return this.each(function(){
                        if(typeof options !== 'string'){
                            if(Nui.type(options, 'Object')){
                                options.target = this
                            }
                            else{
                                options = {
                                    target:this
                                }
                            }
                            module(options);
                        }
                        else if(options){
                            var object = this.nui[name];
                            if(options.indexOf('_') !== 0){
                                if(options === 'options'){
                                    object.set(args[1], args[2])
                                }
                                else{
                                    var attr = object[options];
                                    if(typeof attr === 'function'){
                                        attr.apply(object, Array.prototype.slice.call(args, 1))
                                    }
                                }
                            }
                        }
                    })
                }
            },
            $ready:function(name, module){
                var $fn = $.fn[name];
                Nui.doc.find('[data-'+name+'-options]').each(function(index, item){
                    var ele = $(item);
                    options = getOptions(name, ele);
                    if($fn){
                        ele[name](options)
                    }
                    else{
                        module(options)
                    }
                })
            },
            options:function(key, value){
                if(Nui.type(key, 'Object')){
                    $.extend(true, this._options, key)
                }
                else if(Nui.type(key, 'String')){
                    this._options[key] = value
                }
            }
        }

        Nui.each(['init', 'set', 'reset', 'destroy'], function(method){
            statics[method] = function(){
                var that = this, args = arguments, container = args[0], name = that._component_name_;
                if(name){
                    if(container && container instanceof jQuery){
                        if(method === 'init'){
                            container.find('[data-'+name+'-options]').each(function(){
                                var ele = $(this);
                                if(ele[name]){
                                    ele[name](getOptions(name, ele))
                                }
                            })
                        }
                        else{
                            container.find('[nui_component_'+ name +']').each(function(){
                                var object;
                                if(this.nui && (object = this.nui[name]) && object[method]){
                                    object[method].apply(object, Array.prototype.slice.call(args, 1))
                                }
                            })
                        }
                    }
                    else{
                        Nui.each(that._instances, function(val){
                            val[method].apply(val, args)
                        })
                    }
                }
                else{
                    Array.prototype.unshift.call(args, method);
                    var components = module.components();
                    if(method !== 'init'){
                        Nui.each(components, function(v){
                            v.apply(v, args)
                        })
                    }
                    else{
                        Nui.each(components, function(v){
                            if(typeof v('$ready') === 'function'){
                                v.apply(v, args)
                            }
                        })
                    }
                }
            }
        })

        return ({
            static:statics,
            options:{
                target:null,
                id:null,
                skin:''
            },
            _init:$.noop,
            _exec:$.noop,
            _getTarget:function(){
                var that = this;
                if(!that.target){
                    var target = that.options.target;
                    var self = that.constructor;
                    if(!target){
                        return null
                    }
                    target = self._jquery(target);
                    that.target = target.attr(self._component_attr_name_, '');
                    that.target.each(function(){
                        if(!this.nui){
                            this.nui = {};
                        }
                        this.nui[self._component_name_] = that
                    })
                }
                return that.target
            },
            _on:function(type, dalegate, selector, callback, trigger){
                var that = this;
                if(typeof selector === 'function'){
                    trigger = callback;
                    callback = selector;
                    selector = dalegate;
                    dalegate = null;
                    selector = that.constructor._jquery(selector)
                }

                var _callback = function(e){
                    return callback.call(this, e, $(this))
                }

                if(dalegate){
                    if(typeof selector !== 'string'){
                        selector = selector.selector
                    }
                    dalegate.on(type, selector, _callback);
                    if(trigger){
                        dalegate.find(selector).trigger(type)
                    }
                }
                else{
                    selector.on(type, _callback);
                    if(trigger){
                        selector.trigger(type)
                    }
                }

                that._events.push({
                    dalegate:dalegate,
                    selector:selector,
                    type:type,
                    callback:_callback
                });

                return that
            },
            _off:function(){
                var that = this, _events = that._events;
                Nui.each(_events, function(val, key){
                    if(val.dalegate){
                        val.dalegate.off(val.type, val.selector, val.callback)
                    }
                    else{
                        val.selector.off(val.type, val.callback)
                    }
                    _events[key] = null;
                    delete _events[key]
                });
                that._events = [];
                return that
            },
            _delete:function(){
                var that = this;
                var self = that.constructor;
                that.target.removeAttr(self._component_attr_name_).each(function(){
                    if(this.nui){
                        this.nui[self._component_name_] = null;
                        delete this.nui[self._component_name_];
                    }
                })
                self._instances[that.index] = null;
                delete self._instances[that.index]
            },
            _reset:function(){
                this._off();
                if(this.element){
                    this.element.remove();
                }
                return this
            },
            _tpl2html:function(tpls, data){
                return tpl.render.call(this, tpls, data, {
                    openTag:'<%',
                    closeTag:'%>'
                })
            },
            set:function(name, value){
                this._reset();
                if(name || value){
                    if($.isPlainObject(name)){
                        this.options = $.extend(true, this.options, name)
                    }
                    else{
                        this.options[name] = value
                    }
                    this._exec()
                }
                return this
            },
            get:function(key){
                if(!key){
                    return this.options
                }
                else{
                    return this.options[key]
                }
            },
            reset:function(){
                return this.set(that.optionsCache)
            },
            destroy:function(id){
                if(id && this.options.id !== id){
                    return
                }
                this._reset();
                this._delete();
            }
        })
    })
})(this, document);
