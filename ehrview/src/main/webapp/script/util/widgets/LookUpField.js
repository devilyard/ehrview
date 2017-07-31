$package("util.widgets")

util.widgets.LookUpField = Ext.extend(Ext.form.TriggerField, {
    triggerClass:'x-form-search-trigger',
	editable:false,
	emptyText:"请选择",
	onTriggerClick:function(){
		if(this.disabled){
			return;
		}
		this.fireEvent("lookup",this)
	}
})
Ext.reg('lookupfield', util.widgets.LookUpField);

util.widgets.LookUpFieldEx = Ext.extend(Ext.form.TwinTriggerField, {
	trigger1Class:'x-form-clear-trigger',
    trigger2Class:'x-form-search-trigger',
	editable:false,
	emptyText:"请选择",
	onTrigger1Click:function(){
		if(this.disabled){
			return;
		}
		if(!this.fireEvent("clear",this)){ 
			return;
		}
		this.setValue("")
	},
	onTrigger2Click:function(){
		if(this.disabled){
			return;
		}
		this.fireEvent("lookup",this)
	}
})
Ext.reg('lookupfieldex', util.widgets.LookUpFieldEx);