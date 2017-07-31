$package("app.test")

$import("app.modules.form.SimpleFormView",
        "util.rmi.miniJsonRequestSync",
        "app.modules.common"
)

app.test.keyManagerForm = function(cfg){
	cfg.entryName = "keyManager"
	cfg.fldDefaultWidth = 500
	cfg.showButtonOnTop = true
	Ext.apply(this,app.modules.common)
    app.test.keyManagerForm.superclass.constructor.apply(this,[cfg])
}

Ext.extend(app.test.keyManagerForm,app.modules.form.SimpleFormView,{
	
	createField:function(it){
		if(it.id=="roles"){
		    it.defaultValue = '<rule name="area" type="string" defaultFill="0" length="5" fillPos="after">%user.manageUnit.id</rule>'
                               +'\n<rule name="increaseId" type="increase" defaultFill="0" length="5" startPos="0" />'
		}
		var cfg = app.test.keyManagerForm.superclass.createField.call(this,it)
		return cfg
	},
	
	doGetKey:function(){
		if(!this.validate()){
			return
		}
		var values = {}
	    var form = this.form.getForm()
	    var items = this.schema.items
	    var n = items.length
	    for(var i=0; i<n; i++){
	        var it = items[i]
	        var f = form.findField(it.id)
	        if(f && it.fixed != "true"){
	           values[it.id] = f.getValue()
	        }
	    }
	    this.saveToServer(values)
	    

	},
	
	saveToServer:function(data){
	    var json = util.rmi.miniJsonRequestSync({
	       		serviceId:"keyManagerTest",
				schema:this.entryName,
				module:this._mId,  //增加module的id
				body:data
	    })
	    if(json.code == 200){	    		    	
	    	var body = json.json
	    	alert(body.keyId)
	    }else if(json.code > 300){
	      	this.processReturnMsg(json.code,json.msg,this.saveToServer,[data]);
	    }
	}
    
})