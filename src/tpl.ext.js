/**
 * @filename tpl.js
 * @author Aniu[2016-11-11 16:54]
 * @update Aniu[2016-11-11 16:54]
 * @version 1.0.1
 * @description ģ������������Ⱦ����
 */

;!(function($, Nui, undefined){
    Nui.use('tpl', function(tpl){
        var util = Nui.use('util');
        //��ʽ������
        tpl.method('format', function(timestamp, format){
            return util.formatDate(timestamp, format)
        })
        
        //����url
        tpl.method('seturl', function(name, value, url){
            return util.setParam(name, value, url)
        })

    })
})(jQuery, Nui)