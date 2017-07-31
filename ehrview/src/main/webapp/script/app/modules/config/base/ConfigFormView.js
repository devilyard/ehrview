$package("app.modules.config.base")

$import("app.modules.form.MCFormView")

app.modules.config.base.ConfigFormView = function(cfg){
	app.modules.config.base.ConfigFormView.superclass.constructor.apply(this,[cfg])
}
Ext.extend(app.modules.config.base.ConfigFormView, app.modules.form.MCFormView,{

	loadData: function(){
		//alert(this.initDataId)
		this.doNew()
		if(!this.schema){
			return
		}
		
		if(!this.initDataId){
			var r = this.exContext[this.schema.id]
			if(r){
				this.initFormData(r.data);
				this.fireEvent("loadData",this.entryName,r.data);
			}
			return;
		}
		if(!this.fireEvent("beforeLoadData",this.entryName,this.initDataId)){
			return
		}
		if(this.form && this.form.el){
			this.form.el.mask("正在载入数据...","x-mask-loading")
		}
		util.rmi.jsonRequest({
				serviceId:'configuration',
				operate:"loadById",
				op:this.op,
				schema:this.entryName,
				pkey:this.initDataId  //在SimpleListView中有定义
			},
			function(code,msg,json){
				if(this.form && this.form.el){
					this.form.el.unmask()
				}
				if(code > 300){
					this.processReturnMsg(code,msg,this.loadData)
					return
				}
				if(json.body){
					this.initFormData(json.body)
					this.fireEvent("loadData",this.entryName,json.body);
				}
				if(!(this.op == 'read')){
					this.op = "update"
				}
			},
			this)//jsonRequest
	},
	
	saveToServer:function(saveData){
		if(!this.fireEvent("beforeSave",this.entryName,this.op,saveData)){
			return;
		}
		this.form.el.mask("在正保存数据...","x-mask-loading")
		util.rmi.jsonRequest({
				serviceId:"configuration",
				operate:"save",
				op:this.op,
				schema:this.entryName,
				body:saveData
			},
			function(code,msg,json){
				this.form.el.unmask()
				if(code > 300){
					this.processReturnMsg(code,msg,this.saveToServer,[saveData]);
					return
				}
				if(code<300){
					this.initFormData(json.body)
					this.fireEvent("save",this.entryName,json.body,this.op)
				}
				this.op = "update"
			},
			this)//jsonRequest
	}
});