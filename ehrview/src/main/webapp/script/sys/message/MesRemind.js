$package("sys.message")
$styleSheet("sys.message.mesRemind")

Ext.messageMsg = function(){
    var msgCt;

    function createBox(t, s){
        return ['<div class="msg" onclick="doMessage()">',
                '<div class="x-box-mc"><font class="h1">',t,'</font>&nbsp;',
                '&nbsp;<font class="h2">',s,'</font></div>',
                '</div>'].join('');
    }
    return {
      	msg : function(title, format,scope){
            if(!msgCt){
                msgCt = Ext.DomHelper.insertFirst(document.body, {id:'msg-div'}, true);
            }
            msgCt.alignTo(document, 't');
            var s = String.format.apply(String, Array.prototype.slice.call(arguments, 1));
            var m = Ext.DomHelper.append(msgCt, {html:createBox(title, s)}, true);
            m.setWidth(250)
            m.slideIn('t').pause(5).ghost("t", {remove:true});
            
        	doMessage=function(){
        		scope.doMessage();
        	}
        }

    };
}();




