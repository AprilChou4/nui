/**
 * @author Aniu[2016-11-10 22:39]
 * @update Aniu[2016-11-10 22:39]
 * @version 1.0.1
 * @description NUI框架核心
 */

;!(function(window, document, undefined){
    if(window.Nui){
        return
    }

    var Nui = window.Nui = {
        // Nui.type('nui', 'String') => true
        // Nui.type(['nui'], ['Object', 'Array']) => true
        type:function(obj, type){
            if(obj === null || obj === undefined){
                return false
            }
            if(isArray(type)){
                var ret = false;
                Nui.each(type, function(v){
                    if(isType(v)(obj)){
                        ret = true;
                        return false
                    }
                })
                return ret
            }
            return isType(type)(obj)
        },
        each:function(obj, callback){
            var i;
            if(isArray(obj)){
                var len = obj.length;
                for(i=0; i<len; i++){
                    if(callback(obj[i], i) === false){
                        break;
                    }
                }
            }
            else{
                for(i in obj){
                    if(callback(obj[i], i) === false){
                        break;
                    }
                }
            }
        },
        //jquery1.9之后就移除了该方法，以插件形式存在
        browser:(function(){
            var ua = navigator.userAgent.toLowerCase();
            var match = /(edge)[ \/]([\w.]+)/.exec(ua) ||
                        /(chrome)[ \/]([\w.]+)/.exec(ua) ||
                        /(webkit)[ \/]([\w.]+)/.exec(ua) ||
                        /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua) ||
                        /(msie) ([\w.]+)/.exec(ua) ||
                        ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua) || [];
            var browser = match[1] || '';
            var version = match[2] || '0';
            var ret = {}

            //IE11会伪装成firefox
            if(browser === 'mozilla' && /trident/.test(ua)){
                browser = 'msie';
                version = '11.0'
            }
            if(browser){
                ret[browser] = true;
                ret.version = version
            }
            if(ret.chrome || ret.edge){
                ret.webkit = true
            }
            else if(ret.webkit){
                ret.safari = true
            }
            return ret
        })()
    }

    var isType = function(type){
        return function(obj){
            return {}.toString.call(obj) === '[object ' + type + ']'
        }
    }

    var isArray = Nui.isArray = Array.isArray || isType('Array');

    Nui.each({
        trim:/^\s+|\s+$/g,
        trimLeft:/^\s+/g,
        trimRight:/\s+$/g
    }, function(v, k){
        Nui[k] = (function(){
            if(!String.prototype[k]){
                return function(str){
                    return str.replace(v, '')
                }
            }
            return function(str){
                return str[k]()
            }
        })()
    })

    var noop = function(){}

    Nui.bsie6 = Nui.browser.msie && Nui.browser.version <= 6;
    Nui.bsie7 = Nui.browser.msie && Nui.browser.version <= 7;

    // unique(['1', '2', '1']) => ['1', '2']
    var unique = function(arr){
        var newarr = [];
        var temp = {};
        Nui.each(arr, function(val){
            if(!temp[val]){
                temp[val] = true
                newarr.push(val)
            }
        })
        return newarr
    }

    var extend = function(){
        var src, copyIsArray, copy, name, options, clone,
            target = arguments[0] || {},
            i = 1,
            length = arguments.length,
            deep = false;
        if(typeof target === 'boolean'){
            deep = target;
            target = arguments[1] || {};
            i = 2;
        }
        if(typeof target !== 'object' && !Nui.type(target, 'Function')){
            target = {};
        }
        if(length === i){
            target = {};
            --i;
        }
        for( ; i < length; i++){
            if((options = arguments[i]) != null){
                for(name in options){
                    src = target[name];
                    copy = options[name];
                    if(target === copy){
                        continue;
                    }
                    if(deep && copy && (isObject(copy) || (copyIsArray = isArray(copy)))){
                        if(copyIsArray){
                            copyIsArray = false;
                            clone = src && isArray(src) ? src : [];
                        }
                        else{
                            clone = src && isObject(src) ? src : {};
                        }
                        target[name] = extend(deep, clone, copy);
                    }
                    else if(copy !== undefined){
                        target[name] = copy;
                    }
                }
            }
        }
        return target;
    }

    //判断是不是纯粹的对象
    var isObject = function(obj){
        if(!Nui.type(obj, 'Object') || obj.constructor !== Object){
            return false;
        }
        return true
    }

    var isEmptyObject = function(obj){
        var name;
        for(name in obj){
            return false;
        }
        return true;
    }

    var domain = location.protocol+'//'+location.host;
    //获取当前页面的uri
    var getPath = function(){
        var url = (domain+location.pathname).replace(/\\/g, '/');
        var index =  url.lastIndexOf('/');
        return url.substr(0, index+1);
    }

    // http://domdin, https://domain, file://url, //domain
    var isHttp = function(url){
        if(/^((https?|file):)?\/\//i.test(url)){
            return true
        }
    }

    var dirname = getPath();

    var getModuleid = function(){
        ++mid;
        return '_module_'+mid
    }

    var head = document.head || document.getElementsByTagName('head')[0] || document.documentElement;

    var support = 'onload' in document.createElement('script');

    var mid = 0;

    var moduleData;

    var cacheModules = {};

    var cacheStyles = {};

    var rootModules = {};

    var components = {};

    var config = {
        skin:null,
        paths:{},
        alias:{},
        maps:{}
    }

    //------- 修复个别浏览器兼容性问题 begin --------

    //讲道理说，文件在被加载完毕后会立即执行define方法，在onload(onreadystatechange IE9-)事件中得到moduleData，这个过程是同步的
    //但是在IE9-中，高概率出现不同步情况，就是在onreadystatechange事件中得到moduleData值不是当前文件数据，原因在于执行onload时，其它模块刚好被加载，被重新赋值了
    //IE9-中文件被加载会有5个状态 uninitialized > loading > loaded > interactive > complete
    //脚本被执行时可以通过dom节点获取到node.readyState值为interactive，而该节点一定是当前加载的脚本节点
    //小概率出现节点被添加到dom后会立即执行define，可能是由于IE的缓存原因
    var currentlyAddingScript;
    if(Nui.browser.msie && Nui.browser.version <= 9){
        var interactiveScript;
        var getCurrentScript = function(){
            if(currentlyAddingScript){
                return currentlyAddingScript
            }
            if(interactiveScript && interactiveScript.readyState === 'interactive'){
                return interactiveScript
            }
            Nui.each(head.getElementsByTagName('script'), function(script){
                if(script.readyState === 'interactive'){
                    interactiveScript = script
                    return false
                }
            })
            return interactiveScript
        }
    }

    //防止不支持该对象的浏览器报错
    window.console = window.console || {
        log:noop,
        debug:noop,
        error:noop,
        info:noop
    }

    //防止IE6-IE7鼠标hover以及position:fixed时背景图片闪烁
    if(Nui.bsie7){
        document.execCommand('BackgroundImageCache', false, true);
    }

    /* 修复toFixed四舍五入bug */
    var toFixed = Number.prototype.toFixed;
    Number.prototype.toFixed = function(n){
        var num = '1';
        var total = n;
        while(total){
            num += '0'
            total--;
        }
        return toFixed.call((Math.round(this*num)/num), n)
    }

    //常用jq对象
    if(typeof jQuery !== 'undefined'){
        Nui.win = jQuery(window);
        Nui.doc = jQuery(document);
    }

    //------- 修复end -------

    var Module = function(attrs, deps){
        var mod = this;
        //define实参中依赖模块名
        mod.deps = deps||[];
        //所有依赖模块名
        mod.alldeps = mod.deps;
        //所有依赖模块
        mod.depmodules = {};
        //模块唯一id
        mod.id = attrs[0];
        //模块名
        mod.name = attrs[1];
        //文件参数
        mod.version = '';
        //文件后缀 -min
        mod.suffix = attrs[2];
        //所在目录
        mod.uri = mod.id.substr(0, mod.id.lastIndexOf('/')+1);
    }

    //动态加载模块
    Module.prototype.load = function(){
        var mod = this;
        if(!mod.loaded && mod.name !== '_module_'+mid){
            if(!mod.url){
                var node = document.createElement('script');
                mod.url = mod.id+mod.suffix+'.js'+mod.version;
                node.src = mod.url;
                node.async = true;
                node.id = mod.id;
                currentlyAddingScript = node;
                head.appendChild(node);
                currentlyAddingScript = null;
                if(support){
                    node.onload = node.onerror = mod.onload(node)
                }
                else{
                    //ie6/7/8
                    node.onreadystatechange = function(){
                        if(/loaded|complete/.test(node.readyState)){
                            mod.onload(node)()
                        }
                    }
                }
            }
            return mod.resolve()
        }
        else{
            return mod.onload()
        }
    }

    //动态加载css
    Module.prototype.loadcss = function(){
        var mod = this;
        if(mod.styles && mod.styles.length){
            Nui.each(mod.styles, function(val){
                var path = Module.getAttrs(val, mod.uri)[0];
                if(!cacheStyles[path]){
                    cacheStyles[path] = true;
                    var node = document.createElement('link');
                    path = path+'.css'+mod.version;
                    node.rel = 'stylesheet';
                    node.href = path;
                    head.appendChild(node);
                }
            })
        }
        return mod;
    }

    //加载模块依赖
    Module.prototype.resolve = function(){
        var mod = this;
        if(mod.alldeps.length && isEmptyObject(mod.depmodules)){
            Nui.each(mod.alldeps, function(val){
                var module = Module.getModule(val, [], mod.uri);
                module.version = mod.version;
                mod.depmodules[val] = module.loaded ? module : module.load()
            })
        }
        return mod
    }

    //因为无法知晓最后一个依赖模块，所以只要任意模块被加载完毕，就会从入口模块遍历所有依赖，当全部依赖都被加载时执行回调
    Module.prototype.onload = function(node){
        var mod = this;
        if(node){
            return (function(){
                moduleData = node.moduleData || moduleData;
                node.onload = node.onerror = node.onreadystatechange = null;
                head.removeChild(node);
                node = null;
                mod.loaded = true;
                if(moduleData){
                    Nui.each(moduleData, function(val, key){
                        val && (mod[key] = val)
                    })
                    moduleData = null;
                }
                return mod.resolve().rootCallback()
            })
        }
        else{
            mod.loaded = true;
            return mod.resolve().rootCallback()
        }
    }

    //获取入口模块的所有依赖模块id，若依赖全部被加载则执行回调
    Module.prototype.rootCallback = function(){
        Nui.each(rootModules, function(root, name){
            var data = root.getData();
            var ids = unique(data.ids);
            if(data.loaded && root.callback){
                root.callback(ids)
            }
        })
        return this
    }

    //获取模块所有依赖的id，以及依赖是否被加载完毕
    Module.prototype.getData = function(data){
        if(!data){
            data = {
                ids:[],
                loaded:true
            }
        }
        data.ids.unshift(this.id);
        if(!this.loaded){
            data.loaded = false
        }
        if(this.alldeps.length){
            Nui.each(this.depmodules, function(val){
                data = val.getData(data)
            })
        }
        return data
    }

    //设置工厂函数内部方法
    Module.prototype.methods = function(){
        var mod = this;
        var methods = {};

        //导入模块
        methods.require = function(id, callback){
            var _mod = mod.depmodules[id];
            if(_mod){
                if(typeof callback === 'function'){
                    callback(_mod.module)
                }
                return _mod.module
            }
        }

        //继承模块
        methods.extend = function(module, members, inserts){
            var exports;

            if(!module){
                return
            }

            if(typeof module === 'string'){
                var _mod = methods.require(module);
                if(_mod === undefined){
                    return module
                }
                module = _mod
            }

            if(isArray(module)){
                exports = extend(true, [], module)
                if(inserts === true){
                    if(!isArray(members)){
                        exports.push(members)
                    }
                    else{
                        exports = exports.concat(members)
                    }
                }
            }
            else if(Nui.type(module, 'Function')){
                if(module.exports){
                    exports = extend(true, {}, module.exports, members);
                    exports.static.__parent = new Module.Class.parent(module)
                }
                else{
                    exports = extend(true, noop, module, members)
                }
            }
            else if(Nui.type(module, 'Object')){
                exports = extend(true, {}, module, members)
            }
            else{
                exports = module
            }

            if(isArray(inserts) && Nui.type(exports, ['Object', 'Function'])){
                Nui.each(inserts, function(val){
                    if(val.method && val.content){
                        var arr = val.method.split('->');
                        var lastkey = arr[arr.length-1];
                        var object, key;
                        while(key = arr.shift()){
                            object = object || exports;
                            if(key === lastkey){
                                break;
                            }
                            object = object[key]
                        }
                        var func = object[lastkey];
                        if(Nui.type(func, 'Function')){
                            var code = func.toString().replace(/(\})$/, ';'+val.content+'$1');
                            func = new Function('return '+code);
                            object[lastkey] = func();
                        }
                    }
                })
            }

            return exports
        }

        //导入样式
        methods.imports = noop;

        //渲染字符串
        methods.renders = function(tpl){
            return tpl
        }

        //导出接口
        methods.exports = {};

        return methods
    }

    //调用工厂函数，获取模块导出接口
    Module.prototype.exec = function(){
        var mod = this;
        if(!mod.module && typeof mod.factory === 'function'){
            var methods = mod.methods(), modules;
            if(mod.deps.length){
                //设置工厂函数形参，也就是依赖模块的引用
                modules = [];
                Nui.each(mod.deps, function(val){
                    modules.push(methods.require(val))
                })
            }
            else{
                //将工厂函数的内部方法作为参数传递，方便调用
                modules = [methods.require, methods.imports, methods.renders, methods.extend]
            }
            var exports = mod.factory.apply(methods, modules);
            //优先使用return接口
            if(typeof exports === 'undefined'){
                exports = methods.exports
            }
            
            if(mod.name === 'component' || (exports.static && exports.static.__parent instanceof Module.Class.parent)){
                var obj = {
                    statics:{},
                    propertys:{},
                    methods:{},
                    apis:{init:true}
                }

                if(config.skin && !exports.options.skin){
                    exports.options.skin = config.skin
                }

                Nui.each(exports, function(val, key){
                    //静态属性以及方法
                    if(key === 'static'){
                        obj['statics'] = val
                    }
                    //实例方法
                    else if(typeof val === 'function'){
                        obj.methods[key] = val;
                        if(!/^_/.test(key)){
                            obj.apis[key] = true
                        }
                    }
                    //实例属性
                    else{
                        obj.propertys[key] = val
                    }
                })
                //文件名作为组件名
                var name = mod.name.substr(mod.name.lastIndexOf('/')+1).replace(/\W/g, '');
                if(components[name]){
                    mod.module = components[name]
                }
                else{
                    obj.statics.__component_name = name;
                    mod.module = components[name] = Module.Class(mod, obj);
                    delete exports.static.__parent;
                    mod.module.exports = exports;
                    if(mod.name !== 'component'){
                        var Class = mod.module.constructor, method;
                        Nui.each(['_$fn', '_$ready'], function(v){
                            method = Class[v];
                            if(typeof method === 'function'){
                                method.call(Class, name, mod.module)
                            }
                        })
                    }
                }
            }
            else{
                mod.module = exports;
            }
        }
        return mod
    }

    //获取正确规范的路径
    Module.normalize = function(path){
        // a///b///c => a/b/c
        path = path.replace(/([^:])\/{2,}/g, '$1/');

        // a/b...../c => a/b../c
        path = path.replace(/\.{2,}/g, '..');

        // a/b../c => a/c
        // a/../c => c
        var replace = function(str){
            if(/([\w]+\/?)(\.\.\/)/g.test(str)){
                str = str.replace(/([\w]+\/?)(\.\.\/)/g, function(a, b, c){
                    if(a == b+c){
                        return ''
                    }
                    return a
                })
                return replace(str)
            }
            return str
        }
        path = replace(path);

        // a/b./c => a/b/c
        // a/./c => a/c
        return path.replace(/([\w]+)\/?(\.\/)+/g, '$1/')
    }

    //创建组件类
    Module.Class = function(mod, object){
        var Class = function(options){
            var that = this;
            extend(true, that, object.propertys, {
                __id:Class.__id++,
                _eventList:[]
            });
            that.options = extend(true, {}, that.options, Class._options, options||{})
            that._defaults = extend(that.options);
            Class.__instances[that.__id] = that;
            that._init()
        }
        extend(true, Class, object.statics);
        extend(true, Class.prototype, object.methods);
        Class.__setMethod(object.apis, components);
        if(typeof Class._init === 'function'){
            Class._init()
        }
        var module = function(options){
            return new Class(options)
        }
        module.constructor = Class;
        Nui.each(Class, function(v, k){
            if(typeof v === 'function' && !/^_/.test(k) && k !== 'constructor'){
                if(typeof v === 'function'){
                    module[k] = function(){
                        return Class[k].apply(Class, arguments)
                    }
                }
            }
        })
        return module
    }

    Module.Class.parent = function(module){
        this.exports = module.exports;
        this.constructor = module.constructor;
    }

    Module.setPath = function(id){
        var pathMatch = /\{([^\{\}]+)\}/.exec(id);
        if(pathMatch){
            var path = config.paths[pathMatch[1]];
            if(path){
                id = id.replace(pathMatch[0], path).replace(/(\.(js|css))?(\?[\s\S]*)?$/g, '');
            }
        }
        return id
    }

    Module.getAttrs = function(id, uri){
        // xxx.js?v=1.1.1 => xxx
        // xxx.css?v=1.1.1 => xxx
        var name = id.replace(/(\.(js|css))?(\?[\s\S]*)?$/g, '');
        var match = name.match(/-min$/g);
        var suffix = '';
        var dirid;
        if(match){
            name = name.replace(/-min$/g, '');
            suffix = match[0]
        }
        id = Module.setPath(config.alias[name] || name);
        if(!isHttp(id)){
            dirid = Module.normalize(dirname + id);
            id = (uri || dirname) + id;
        }
        id = Module.normalize(id);
        return [id, name, suffix, dirid]
    }

    Module.getModule = function(name, deps, uri){
        var attrs = Module.getAttrs(name, uri);
        var id = attrs[0];
        return cacheModules[attrs[1]] || cacheModules[id] || cacheModules[attrs[3]] || (cacheModules[id] = new Module(attrs, deps))
    }

    Module.load = function(id, callback, _module_){
        if(Nui.type(id, 'String') && Nui.trim(id)){
            //截取入口文件参数，依赖的文件加载时都会带上该参数
            var match = id.match(/(\?[\s\S]+)$/);
            var mod = Module.getModule(_module_, [id]);

            if(match){
                mod.version = match[0]
            }
            
            var depname = mod.alldeps[0];
            var version = config.maps[depname.replace(/-min$/, '')]||'';
            if(version){
                if(!/^\?/.test(version)){
                    version = '?v='+version
                }
                mod.version = version
            }

            mod.callback = function(ids){
                var _module = mod.depmodules[depname];
                var suffix = _module.suffix;
                Nui.each(ids, function(id){
                    var module = cacheModules[id].exec();
                    if(!suffix){
                        module.loadcss()
                    }
                })
                if(Nui.type(callback, 'Function')){
                    callback.call(Nui, _module.module)
                }
                delete rootModules[_module_];
                delete mod.callback
            }

            rootModules[_module_] = mod;

            mod.load()
        }
    }

    //获取工厂函数中模块的依赖
    Module.getdeps = function(str){
        var deps = [];
        var styles = [];
        var match = str.match(/(require|extend|imports)\(('|")[^'"]+\2/g);
        if(match){
            Nui.each(match, function(val){
                if(/^(require|extend)/.test(val)){
                    deps.push(val.replace(/^(require|extend)|[\('"]/g, ''))
                }
                else{
                    styles.push(val.replace(/^imports|[\('"]/g, ''))
                }

            })
        }
        return [unique(deps), unique(styles)]
    }

    Module.define = function(id, deps, factory){
        //Nui.define(function(){})
        if(Nui.type(id, 'Function')){
            factory = id;
            id = undefined;
            deps = [];
        }
        //Nui.define(['mod1', 'mod2', ..], function(){})
        //Nui.define('id', function(){})
        else if(Nui.type(deps, 'Function')){
            factory = deps;
            if(Nui.type(id, 'String')){
                deps = []
            }
            else{
                deps = id;
                id = undefined
            }
        }

        var arrs = Module.getdeps(factory.toString());
        var alldeps = deps.concat(arrs[0]);
        var styles = arrs[1];

        if(id && !cacheModules[id] && !cacheModules[Module.getAttrs(id)[0]]){
            var mod = Module.getModule(id, alldeps);
            mod.deps = deps;
            mod.styles = styles;
            mod.factory = factory;
            mod.loaded = true;
            mod.load()
        }

        moduleData = {
            name:id,
            deps:deps,
            styles:styles,
            alldeps:alldeps,
            factory:factory
        }

        if(typeof getCurrentScript !== 'undefined'){
            var script = getCurrentScript();
            if(script){
                script.moduleData = moduleData
            }
        }
    }

    Nui.load = Nui.use = function(id, callback){
        if(id && typeof id === 'string'){
            Module.load(id, callback, getModuleid())
        }
        return Nui
    }

    Nui.define = function(){
        var args = arguments;
        var len = args.length;
        var params = [];

        //Nui.define()
        //Nui.define('')
        //Nui.define([])
        //Nui.define({})
        if(!len || (len === 1 && !Nui.type(args[0], 'Function'))){
            params.push(function(){
                return args[0]
            })
        }

        //Nui.define('id', [])
        //Nui.define('id', {})
        else if((len === 2 && !Nui.type(args[1], 'Function')) || (len == 3 && !Nui.type(args[2], 'Function'))){
            params.push(args[0]);
            params.push(function(){
                return args[1]
            })
        }

        //Nui.define({}, function(){})
        else if(len === 2 && !Nui.type(args[0], ['Array', 'String']) && Nui.type(args[1], 'Function')){
            params.push(args[1])
        }

        //Nui.define('id', {}, function(){})
        //Nui.define('id', '', function(){})
        else if(len === 3 && !isArray(args[1]) && Nui.type(args[2], 'Function')){
            params.push(args[0]);
            params.push(args[2]);
        }

        //Nui.define('id', [], function(){})
        else{
            params = args
        }

        Module.define.apply(Module, params)
    }

    Nui.config = function(obj, val){
        if(Nui.type(obj, 'Object')){
            config = extend({}, config, obj);
        }
        else if(val && Nui.type(obj, 'String')){
            config[obj] = val;
            if(obj !== 'paths'){
                return
            }
        }
        else{
            return
        }
        var base = config.base || config.paths.base || '';
        if(!isHttp(base)){
            base = config.paths.base = domain+base
        }
        Nui.each(config.paths, function(v, k){
            if(k !== 'base' && !isHttp(v)){
                config.paths[k] = base+'/' + v
            }
        })
    }

})(this, document)

/**
 * @author Aniu[2016-11-11 16:54]
 * @update Aniu[2016-11-11 16:54]
 * @version 1.0.1
 * @description 实用工具集
 */

Nui.define('util', {
    /**
     * @func 常用正则表达式
     */
    regex:{
        //手机
        mobile:/^0?(13|14|15|17|18)[0-9]{9}$/,
        //电话
        tel:/^[0-9-()（）]{7,18}$/,
        //邮箱
        email:/^\w+((-w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/,
        //身份证
        idcard:/^\d{17}[\d|x]|\d{15}$/,
        //中文
        cn:/^[\u4e00-\u9fa5]+$/,
        //税号
        taxnum:/^[a-zA-Z0-9]{15,20}$/
    },
    /**
     * @func 获取url参数值
     * @return <String, Object>
     * @param name <String, Undefined> 参数名，不传则以对象形式返回全部参数
     * @param urls <String, Undefined> url地址，默认为当前访问地址
     */
    getParam:function(name, urls){
        var url = decodeURI(urls||location.href), value = {};
        startIndex = url.indexOf('?');
        if(startIndex++ > 0){
            var param = url.substr(startIndex).split('&'), temp;
            Nui.each(param, function(val){
                temp = val.split('=');
                value[temp[0]] = temp[1];
            });
        }
        if(typeof name === 'string' && name){
            value = (temp = value[name]) !== undefined ? temp : '';
        }
        return value;
    },
    /**
     * @func 设置url参数值
     * @return <String> 设置后的url
     * @param name <String, Object> 参数名或者{key:value, ...}参数集合
     * @param value <String> 参数值或者url
     * @param urls <String, Undefined> url，没有则获取浏览器url
     */
    setParam:function(name, value, urls){
        var url;
        if(Nui.type(name, 'Object')){
            url = value||location.href;
            Nui.each(name, function(val, key){
                if(val){
                    if(Nui.type(val, 'Object')){
                        val = tools.getJSON(val);
                    }
                    url = tools.setParam(key, val, url);
                }
            });
        }
        else{
            url = urls||location.href;
            if(url.indexOf('?') === -1){
                url += '?';
            }
            if(Nui.type(value, 'Object')){
                value = tools.getJSON(value);
            }
            if(url.indexOf(name+'=') !== -1){
                var reg = new RegExp('('+name+'=)[^&]*');
                url = url.replace(reg, '$1'+value);
            }
            else{
                var and = '';
                if(url.indexOf('=') !== -1){
                    and = '&';
                }
                url += and+name+'='+value;
            }
        }
        return url;
    },
    /**
     * @func 检测浏览器是否支持CSS3属性
     * @return <Boolean>
     * @param style <String> 样式属性
     */
    supportCss3:function(style){
        var prefix = ['webkit', 'Moz', 'ms', 'o'],
            i, humpString = [],
            htmlStyle = document.documentElement.style,
            _toHumb = function (string) {
                return string.replace(/-(\w)/g, function ($0, $1) {
                    return $1.toUpperCase();
                });
            };
        for (i in prefix)
            humpString.push(_toHumb(prefix[i] + '-' + style));
        humpString.push(_toHumb(style));
        for (i in humpString)
            if (humpString[i] in htmlStyle) return true;
        return false;
    },
    /**
     * @func 检测浏览器是否支持Html5属性
     * @return <Boolean>
     * @param attr <String> 属性
     * @param element <String> DOM元素标签
     */
    supportHtml5:function(attr, element){
        return attr in document.createElement(element);
    },
    /**
     * @func 模拟location.href跳转
     * @return <Undefined>
     * @param url <String> 跳转的url
     * @param target <String> 跳转类型，默认为_self
     */
    location:function(url, target){
        if(url){
            jQuery('<a href="'+ url +'"'+ (target ? 'target="'+ (target||'_self') +'"' : '' ) +'><span></span></a>')
                .appendTo('body').children().click().end().remove();
        }
    },
    /**
     * @func 格式化日期
     * @return <String>
     * @param timestamp <String, Number> 时间戳，为空返回横杠“-”
     * @param format <String, Undefined> 输出格式，为空则返回时间戳
     */
    formatDate:function(timestamp, format){
        if(timestamp = parseInt(timestamp)){
            if(!format){
                return timestamp;
            }
            var date = new Date(timestamp);
            var map = {
                'M':date.getMonth()+1,
                'd':date.getDate(),
                'h':date.getHours(),
                'm':date.getMinutes(),
                's':date.getSeconds()
            }
            format = format.replace(/([yMdhms])+/g, function(all, single){
                var value = map[single];
                if(value !== undefined){
                    if(all.length > 1){
                       value = '0' + value;
                       value = value.substr(value.length-2);
                   }
                   return value;
                }
                else if(single === 'y'){
                    return (date.getFullYear() + '').substr(4-all.length);
                }
                return all;
            });
            return format;
        }
        return '-';
    },
    /**
     * @func 格式化json
     * @return <JSON String>
     * @param data <Array, Object> 数组或者对象
     */
    getJSON:function(data){
        if(typeof JSON !== 'undefined'){
            var jsonstr = JSON.stringify(data);
            if(Nui.browser.msie && Nui.browser.version == '8.0'){
                return jsonstr.replace(/\\u([0-9a-fA-F]{2,4})/g,function(str, matched){
                    return String.fromCharCode(parseInt(matched,16))
                })
            }
            return jsonstr;
        }
        else{
            if(Nui.isArray(data)){
                var arr = [];
                Nui.each(data, function(val){
                    arr.push(tools.getJSON(val));
                });
                return '[' + arr.join(',') + ']';
            }
            else if(Nui.type(data, 'Object')){
                var temp = [];
                Nui.each(data, function(val, key){
                    temp.push('"'+ key +'":'+ tools.getJSON(val));
                });
                return '{' + temp.join(',') + '}';
            }
            else{
                return '"'+data+'"';
            }
        }
    },
    /**
     * @func 返回form数据对象
     */
    getData:function(element, item, field){
        var that = this;
    	var data = {
    		'result':{},
    		'voids':0, //字段中空值数量
            'total':0 //总计多少个字段
    	}, arr = element.serializeArray(), div = ',';
        if(item && typeof item === 'string'){
            div = item
        }
        Nui.each(arr, function(v, i){
            var val = Nui.trim(v.value)
        	data.total++;
        	if(!val){
        		data.voids++
        	}
        	var name = v.name;
        	if(!Nui.isArray(data.result[name])){
                data.result[name] = [];
            }
            data.result[name].push(val)
        })
        Nui.each(data.result, function(v, k){
            data.result[k] = v.join(div)
        })
        if(item && item instanceof jQuery && field){
            var once = false;
            data.result[field] = [];
            item.each(function(){
                var result = that.getData($(this).find('[name]')).result;
                if(!once){
                    Nui.each(result, function(v, k){
                        delete data.result[k];
                    });
                    once = true
                }
                data.result[field].push(result)
            })
        }
        return data;
    }
})

/**
 * @author Aniu[2016-11-11 16:54]
 * @update Aniu[2016-11-11 16:54]
 * @version 1.0.1
 * @description 模版引擎
 */

Nui.define('template', ['util'], function(util){

    var template = function(tplid, data, opts){
        if(this.tplid = tplid){
            if(caches[tplid]){
                return render.call(this, caches[tplid], data, opts)
            }
            var ele = document.getElementById(tplid);
            if(ele && ele.nodeName==='SCRIPT' && ele.type === 'text/html'){
                return render.call(this, caches[tplid] = ele.innerHTML, data, opts)
            }
        }
        return ''
    }

    var caches = {};

    var options = {
        openTag:'<%',
        closeTag:'%>'
    }

    var methods = {
        trim:Nui.trim,
        formatDate:util.formatDate,
        setParam:util.setParam,
        toFixed:function(value, num){
            if(typeof value === 'number'){
                return value.toFixed(num)
            }
            else if(typeof value === 'string'){
                var val = parseFloat(value);
                if(isNaN(val)){
                    return value
                }
                return val.toFixed(num)
            }
            return value
        }
    }

    var isstr = !!''.trim;

    var snippet = ';$that.out = function(){return $that.code';

    //低版本IE用push拼接字符串效率更高
    snippet = (isstr ? '""'+snippet : '[]'+snippet+'.join("")')+'}';

    var join = function(iscode){
        if(isstr){
            if(iscode){
                return function(code){
                    return '$that.code += '+code+';'
                }
            }
            return function(code, snippet){
                return code += snippet
            }
        }
        if(iscode){
            return function(code){
                return '$that.code.push('+code+');'
            }
        }
        return function(code, snippet){
            code.push(snippet);
            return code
        }
    }

    var joinCode = join(true);

    var joinSnippet = join();

    var replaceInclude = function(tpl, openTag, closeTag, opts){
        var that = this;
        var regs = openTag.replace(/([^\s])/g, '\\$1');
        var rege = closeTag.replace(/([^\s])/g, '\\$1');
        return tpl.replace(new RegExp(regs+'\\s*include\\s+[\'\"]([^\'\"]*)[\'\"]\\s*'+rege, 'g'), function(str, tid){
            if(tid){
                var tmp = that[tid];
                if(typeof tmp === 'function'){
                    tmp = tmp();
                }
                if(typeof tmp === 'string'){
                    return render.call(that, tmp, null, opts)
                }
                else{
                    return template(tid, null, opts)
                }
            }
            return ''
        })
    }

    var render = function(tpl, data, opts){
        var that = this;
        if(typeof tpl === 'string'){
            opts = opts || {};
            var openTag = opts.openTag || options.openTag, closeTag = opts.closeTag || options.closeTag;
            tpl = replaceInclude.call(that, tpl, openTag, closeTag);
            if(data && typeof data === 'object'){
                if(Nui.isArray(data)){
                    data = {
                        $list:data
                    }
                }
                var code = isstr ? '' : [];
                tpl = tpl.replace(/\s+/g, ' ');
                Nui.each(tpl.split(openTag), function(val, key){
                    val = val.split(closeTag);
                    if(key >= 1){
                        code = joinSnippet(code, compile(Nui.trim(val[0]), true))
                    }
                    else{
                        val[1] = val[0];
                    }
                    code = joinSnippet(code, compile(val[1].replace(/'/g, "\\'").replace(/"/g, '\\"')))
                });

                var variables = isstr ? '' : [];
                Nui.each(data, function(v, k){
                    variables = joinSnippet(variables, k+'=$data.'+k+',')
                })

                if(!isstr){
                    code = code.join('');
                    variables = variables.join('');
                }

                code = 'var '+ variables +'$that=this; $that.line=4; $that.code='+ snippet +';\ntry{\n' + code + ';}\ncatch(e){\n$that.error(e, $that.line)\n};';
                
                try{
                    var Rander = new Function('$data', code);
                    Rander.prototype.methods = methods;
                    Rander.prototype.error = error(code, data, that.tplid);
                    tpl = new Rander(data).out();
                    Rander = null
                }
                catch(e){
                    error(code, data, that.tplid)(e)
                }
                
            }
            return tpl
        }
        return ''
    }

    var error = function(code, data, tplid){
        return function(e, line){
            var msg = '\n';
            var codes = [];
            code = 'function anonymous($data){\n'+code+'\n}';
            code = code.split('\n');
            Nui.each(code, function(v, k){
                codes.push((k+1)+ '      ' +v.replace('$that.line++;', ''))
            })
            msg += 'code\n';
            msg += codes.join('\n')+'\n\n';
            if(typeof JSON !== undefined){
                msg += 'data\n';
                msg += JSON.stringify(data)+'\n\n'
            }
            if(tplid){
                msg += 'templateid\n';
                msg += tplid+'\n\n'
            }
            if(line){
                msg += 'line\n';
                msg += line+'\n\n'
            }
            msg += 'message\n';
            msg += e.message;
            console.error(msg)
        }
    }

    var compile = function(tpl, logic){
        if(!tpl){
            return ''
        }
        var code,res;
        if(logic){
            if((res = match(tpl, 'if')) !== undefined){
                code = 'if('+exists(res)+'){'
            }
            else if((res = match(tpl, 'elseif')) !== undefined){
                code = '\n}\nelse if('+exists(res)+'){'
            }
            else if(tpl === 'else'){
                code = '\n}\nelse{'
            }
            else if(tpl === '/if'){
                code = '}'
            }
            else if((res = match(tpl, 'each ', /\s+/)) !== undefined){
                code = 'Nui.each('+ res[0] +', function('+(res[1]||'$value')+','+(res[2]||'$index')+'){'
            }
            else if(tpl === '/each'){
                code = '});'
            }
            else if((res = match(tpl, ' | ', /\s*,\s*/)) !== undefined){
                code = joinCode('$that.methods.'+res[0]+'('+ exists(res.slice(1).toString()) +')')
            }
            else if(/^(var|let|const)\s+/.test(tpl)){
                code = exists(tpl)+';'
            }
            else{
                code = joinCode(exists(tpl, true))
            }
        }
        else{
            code = joinCode('\''+tpl+'\'')
        }
        return code + '\n' + '$that.line++;'
    }

    //判断变量是否存在
    //a.b??  a[b]??  a['b']??  a[b['c']]??
    var exists = function(code, isVal){
        return code.replace(/([\.\$\w]+\s*(\[[\'\"\[\]\w\.\$\s]+\])?)\?\?/g, function(a, b){
            var rep = '(typeof '+ b + '!=="undefined"';
            if(isVal){
                rep += '?' + b + ':' + '""';
            }
            return rep + ')'
        })
    }

    var match = function(str, syntax, regexp){
        var replace;
        if(str.indexOf(syntax) === 0){
            replace = ''
        }
        else if(syntax === ' | ' && str.indexOf(syntax) > 0){
            replace = ','
        }
        if(replace !== undefined){
            str = Nui.trimLeft(str.replace(syntax, replace));
            return regexp ? str.split(regexp) : str
        }
    }

    template.method = function(method, callback){
        if(!methods[method]){
            methods[method] = callback
        }
    }

    template.config = function(){
        var args = arguments;
        if(Nui.type(args[0], 'Object')){
            Nui.each(args[0], function(v, k){
                options[k] = v
            })
        }
        else if(args.length > 1 && typeof args[0] === 'string'){
            options[args[0]] = args[1]
        }
    }

    template.render = render;

    return template
})

Nui.define('events', function(){
    return function(opts){
        var that = this, opts = opts || {},
            elem = opts.element || that.element, 
            maps = opts.mapping || that.mapping, 
            calls = opts.callback || that.callback || {};
        if(!opts || !elem || !maps || !calls){
            return
        }
        if(!(elem instanceof jQuery)){
            elem = jQuery(elem)
        }
        var evt, ele, self = that.constructor, ret;
        var callback = function(e, elem, cbs){
            if(typeof cbs === 'function'){
                cbs.call(that, e, elem);
                return
            }
            Nui.each(cbs, function(cb, i){
                cb = calls[cb];
                if(typeof cb === 'function'){
                    return ret = cb.call(that, e, elem, ret);
                }
            }) 
        }

        Nui.each(maps, function(cbs, arrs){
            if(typeof cbs === 'string'){
                cbs = Nui.trim(cbs).split(/\s+/);
            }
            arrs = Nui.trim(arrs).split(/\s+/);
            // keyup:kupdown:focus a => elem.on('keyup kupdown focus', 'a', callback)
            evt = arrs.shift().replace(/:/g, ' ');
            ele = arrs.join(' ');
            if(self && self.__component_name){
                that._on(evt, elem, ele, function(e){
                    callback(e, $(this), cbs)
                })
            }
            else{
                elem.on(evt, ele, function(e){
                    callback(e, $(this), cbs)
                })
            }
        })
        return that
    }
})
/**
 * @author Aniu[2016-11-11 16:54]
 * @update Aniu[2016-11-11 16:54]
 * @version 1.0.1
 * @description 组件基类
 */

;!(function(window, undefined){
    if(typeof jQuery === 'undefined'){
        return
    }
    Nui.define('component', ['template', 'events'], function(tpl, events){
        var module = this;
        var callMethod = function(method, args, obj){
            //实参大于形参，最后一个实参表示id
            if(args.length > method.length){
                var id = args[method.length];
                if(id && obj.options.id !== id && obj.__id !== id){
                    return
                }
            }
            method.apply(obj, args)
        }
        //去除IE67按钮点击黑边
        if(Nui.bsie7){
            Nui.doc.on('focus', 'button, input[type="button"]', function(){
                this.blur()
            })
        }
        /**
         * 单和双下划线开头表示私有方法或者属性，只能在内部使用，
         * 单下划线继承后可重写或修改，双下划线为系统预置无法修改
         * 系统预置属性方法：__id, __instances, __parent, __component_name, __setMethod
         */
        var statics = {
            //实例对象唯一标记
            __id:0,
            //实例对象容器
            __instances:{},
            /*
            * 将实例方法接口设置为静态方法，这样可以操作多个实例，
            * 默认有 init, option, reset, destroy
            * init表示初始化组件，会查询容器内包含属性为 data-组件名-options的dom元素，并调用组件
            */
            __setMethod:function(apis, components){
                var that = this;
                Nui.each(apis, function(val, methodName){
                    if(that[methodName] === undefined){
                        that[methodName] = function(){
                            var that = this, args = arguments, container = args[0], name = that.__component_name;
                            if(name && name !== 'component'){
                                if(container && container instanceof jQuery){
                                    if(methodName === 'init'){
                                        var mod = components[name];
                                        if(mod){
                                            container.find('[data-'+name+'-options]').each(function(){
                                                //不能重复调用
                                                if(this.nui && this.nui[name]){
                                                    return
                                                }
                                                var elem = jQuery(this);
                                                var options = elem.data(name+'Options') || {};
                                                if(typeof options === 'string'){
                                                    options = eval('('+ options +')')
                                                }
                                                options.target = elem;
                                                mod(options)
                                            })
                                        }
                                    }
                                    else{
                                        container.find('[nui_component_'+ name +']').each(function(){
                                            var obj, method;
                                            if(this.nui && (obj = this.nui[name]) && typeof (method = obj[methodName]) === 'function'){
                                                callMethod(method, Array.prototype.slice.call(args, 1), obj)
                                            }
                                        })
                                    }
                                }
                                else{
                                    Nui.each(that.__instances, function(obj){
                                        var method = obj[methodName];
                                        if(typeof method === 'function'){
                                            callMethod(method, args, obj)
                                        }
                                    })
                                }
                            }
                            else{
                                Nui.each(components, function(v, k){
                                    if(k !== 'component' && typeof v[methodName] === 'function'){
                                        v[methodName].apply(v, args)
                                    }
                                })
                            }
                        }
                    }
                })
                return that
            },
            //对所有实例设置默认选项
            _options:{},
            //创建组件模块时会调用一次，可用于在document上绑定事件操作实例
            _init:jQuery.noop,
            _jquery:function(elem){
                if(elem instanceof jQuery){
                    return elem
                }
                return jQuery(elem)
            },
            _getSize:function(selector, dir, attr){
                var size = 0;
                attr = attr || 'border';
                dir = dir || 'tb';
                if(attr === 'all'){
                    return (this._getSize(selector, dir) + 
                           this._getSize(selector, dir, 'padding') +
                           this._getSize(selector, dir, 'margin'))
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
            _$fn:function(name, mod){
                jQuery.fn[name] = function(){
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
                            mod(options);
                        }
                        else if(options){
                            var object;
                            if(this.nui && (object=this.nui[name]) && options.indexOf('_') !== 0){
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
            _$ready:function(name, mod){
                if(typeof this.init === 'function'){
                    this.init(Nui.doc)
                }
            },
            config:function(key, value){
                if(Nui.type(key, 'Object')){
                    jQuery.extend(true, this._options, key)
                }
                else if(Nui.type(key, 'String')){
                    this._options[key] = value
                }
            }
        }

        return ({
            static:statics,
            options:{
                target:null,
                id:'',
                skin:'',
                onInit:null,
                onReset:null,
                onDestroy:null
            },
            _template:{},
            _init:jQuery.noop,
            _exec:jQuery.noop,
            _getTarget:function(){
                var that = this;
                if(!that.target){
                    var target = that.options.target;
                    var self = that.constructor;
                    if(!target){
                        return null
                    }
                    target = self._jquery(target);
                    var attr = 'nui_component_'+self.__component_name;
                    that.target = target.attr(attr, '');
                    that.target.each(function(){
                        if(!this.nui){
                            this.nui = {};
                        }
                        this.nui[self.__component_name] = that
                    })
                }
                return that.target
            },
            _tplData:function(data){
                var opts = this.options, 
                    self = this.constructor,
                    name = 'nui-' + self.__component_name, 
                    skin = Nui.trim(opts.skin),
                    getName = function(_class, arrs){
                        if(_class.__parent){
                            var _pclass = _class.__parent.constructor;
                            var _name = _pclass.__component_name;
                            if(_name !== 'component'){
                                if(skin){
                                    arrs.unshift('nui-'+_name+'-'+skin);
                                }
                                arrs.unshift('nui-'+_name);
                                return getName(_pclass, arrs)
                            }
                        }
                        return arrs
                    }, className = getName(self, []);

                className.push(name);
                if(skin){
                    className.push(name+'-'+skin)
                }
                if(opts.id){
                    className.push(self.__component_name + '-' + opts.id)
                }
                if(!data){
                    data = {}
                }
                data.className = className.join(' ');
                return data
            },
            _event:function(){
                return events.call(this)
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
                    return callback.call(this, e, jQuery(this))
                }

                if(dalegate){
                    if(typeof selector !== 'string'){
                        selector = selector.selector;
                        if(!selector){
                            selector = that.options.target
                        }
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

                that._eventList.push({
                    dalegate:dalegate,
                    selector:selector,
                    type:type,
                    callback:_callback
                });

                return that
            },
            _off:function(){
                var that = this, _eventList = that._eventList;
                Nui.each(_eventList, function(val, key){
                    if(val.dalegate){
                        val.dalegate.off(val.type, val.selector, val.callback)
                    }
                    else{
                        val.selector.off(val.type, val.callback)
                    }
                    _eventList[key] = null;
                    delete _eventList[key]
                });
                that._eventList = [];
                return that
            },
            _delete:function(){
                var that = this, self = that.constructor;
                if(that.target){
                    var attr = 'nui_component_'+self.__component_name;
                    that.target.removeAttr(attr).each(function(){
                        if(this.nui){
                            this.nui[self.__component_name] = null;
                            delete this.nui[self.__component_name];
                        }
                    })
                }
                self.__instances[that.__id] = null;
                delete self.__instances[that.__id]
            },
            _reset:function(){
                this._off();
                if(this.element){
                    this.element.remove();
                    this.element = null;
                }
                return this
            },
            _tpl2html:function(id, data){
                var opts = {
                    openTag:'<%',
                    closeTag:'%>'
                }
                if(arguments.length === 1){
                    return tpl.render(this._template, id, opts)
                }
                return tpl.render.call(this._template, this._template[id], data, opts)
            },
            option:function(name, value){
                this._reset();
                if(name || value){
                    if(jQuery.isPlainObject(name)){
                        this.options = jQuery.extend(true, this.options, name)
                    }
                    else{
                        this.options[name] = value
                    }
                    this._exec()
                }
                return this
            },
            reset:function(){
                this.option(this._defaults);
                if(typeof this.options.onReset === 'function'){
                    this.options.onReset.call(this)
                }
                return this;
            },
            destroy:function(){
                this._delete();
                this._reset();
                if(typeof this.options.onDestroy === 'function'){
                    this.options.onDestroy.call(this)
                }
            }
        })
    })
})(this);
