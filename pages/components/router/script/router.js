Nui.define(['{cpns}/router'], function(router){
    var module = this;

    return function(){
        router.alias({
            'list':'/voucher/list/:nickname/:career'
        })

        router.config({
            container:'.g-main',
            delegate:Nui.doc,
            level:2,
            //wrapper:true,
            onAfter:function(elem){
                $('.m-menu-item a.s-crt').removeClass('s-crt');
                elem.addClass('s-crt');
            }
        })

        router({
            target:'#index',
            entry:true,
            path:'/index',
            onChange:module.require('./modules/index')
        })

        router({
            target:'#recordVoucher',
            path:'/voucher/record',
            wrapper:false,
            onBefore:function(target, render){
                if(confirm('点击取消不会切换页面')){
                    render()
                }
                return false;
            },
            onChange:module.require('./modules/recordVoucher')
        })

        router({
            target:'#seeVoucher',
            path:'{list}',
            wrapper:false,
            level:2,
            onChange:module.require('./modules/seeVoucher')
        })

        router.start()
    }
})