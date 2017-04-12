/**
 * @author Aniu[2017-02-27 23:46]
 * @update Aniu[2017-02-27 23:46]
 * @version 1.0.1
 * @description 路由
 */

Nui.define(function(){
    return this.extend('component', {
        static:{
            _trigger:false,
            _domain:location.protocol+'//'+location.host,
            _paths:{},
            _params:{},
            _alias:{},
            _replace:function(hash){
                return hash.replace(this._domain, '').replace(/^\#\!?/, '').replace(/^([^\/])/, '/$1').replace(/\/$/g, '')
            },
            alias:function(val){
                return $.extend(this._alias, val||{})
            },
            _change:function(){
                var that = this, hash = that._replace(location.hash);   
                if(!$.isEmptyObject(that._paths) || !$.isEmptyObject(that._params)){
                    Nui.each([that._paths, that._params], function(val, key){
                        var match = false;
                        Nui.each(val, function(v){
                            if((key === 0 && hash === v.path) || (key === 1 && hash.indexOf(v.path) === 0)){
                                var params = hash.replace(v.path, '').replace(/^\//, '');
                                params = params ? params.split('/') : [];
                                if(params.length === v.params.length){
                                    var param = {};
                                    Nui.each(v.params, function(val, key){
                                    param[val] = params[key]
                                    })
                                    v.render(v.target, {
                                        path:v.path,
                                        param:param
                                    })
                                    that._trigger = match = true;
                                    return false
                                }
                            }
                        })
                        if(match){
                            return false
                        }
                    })
                    if(!that._trigger){
                        Nui.each(that._instances, function(v){
                            if(v.options.enter === true){
                                v.target.eq(0).trigger('click');
                                that._trigger = true;
                                return false
                            }
                        })
                    }
                }
            },
            _bindHashchange:function(){
                var that = this;
                if(Nui.bsie7){
                    var hashchange = function(ret){
                        var hash = location.hash;
                        if(that._oldhash !== hash){
                            that._oldhash = hash;
                            return !ret
                        }
                        return false
                    }
                    setInterval(function(){
                        if(hashchange()){
                            that._change()
                        }
                    }, 100);
                    hashchange(true)
                }
                else{
                    Nui.win.on('hashchange', function(){
                        that._change()
                    })
                }
            },
            trigger:function(){
                if(!this._trigger){
                    this._change();
                }
            },
            $ready:null
        },
        options:{
            path:'',
            enter:false,
            onBefore:null,
            onRender:null
        },
        _init:function(){
            var that = this, router = that.constructor;
            if(that._exec() && !router._bind){
                router._bind = true;
                router._bindHashchange();
            }
        },
        _exec:function(){
            var that = this, opts = that.options, router = that.constructor;
            that.path = that._setpath(opts.path);
            that.target = that._getTarget();
            if(opts.path && that.target){
                var paths = that._getpath();
                if(paths.params.length){
                    var params = [];
                    Nui.each(paths.params, function(v){
                        params.push(v);
                        var split = '/:';
                        var subs = params.join(split);
                        router._params[paths.path+split+subs] = {
                            target:paths.target,
                            params:subs.split(split),
                            path:paths.path,
                            render:paths.render
                        }
                    })
                    router._params[that.path] = paths
                }
                else{
                    router._paths[that.path] = paths
                }
                return that._event()
            }
        },
        _setpath:function(path){
            var router = this.constructor;
            if(path = Nui.trim(path)){
                Nui.each(router._alias, function(val, key){
                    path = path.replace(new RegExp('{'+ key +'}', 'g'), val)
                })
            }
            return router._replace(path)
        },
        _getpath:function(){
            var that = this, path = that.path, opts = that.options, index = path.indexOf('/:');
            var paths = {
                target:that.target,
                params:[]
            }
            if(index !== -1){
                paths.params = path.substr(index+2).split('/:');
                paths.path = path.substr(0, index);
            }
            else{
                paths.path = path
            }
            paths.render = typeof opts.onRender === 'function' ? opts.onRender : $.noop
            return paths
        },
        _sethash:function(hash){
            hash = this.constructor._replace(hash);
            location.hash = '#!'+hash;
        },
        _event:function(){
            var that = this, opts = that.options;
            that._on('click', that.target, function(e){
                if(typeof opts.onBefore === 'function' && opts.onBefore() === false){
                    return false
                }
                var me = $(this);
                that._sethash(me.attr('href'));
                return false
            })
            return that
        },
        _reset:function(){
            var that = this, router = that.constructor;
            that._off();
            delete router._paths[that.path];
            delete router._params[that.path];
            return that
        }
    })
})
