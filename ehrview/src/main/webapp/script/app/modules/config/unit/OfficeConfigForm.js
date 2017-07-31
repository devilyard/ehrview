$package("app.modules.config.unit")

$import("app.modules.config.unit.ManageUnitForm")

app.modules.config.unit.OfficeConfigForm = function(cfg){
	cfg.cfgCls = [
	       {id:'highLevel',script:'app.modules.config.unit.ManageUnitQuery',title:'上级科室',entryName:'SYS_Office'},
	       {id:'lowerLevel',script:'app.modules.config.unit.ManageUnitQuery',title:'下级科室',entryName:'SYS_Office'}	       
	]
	cfg.width = 700
	cfg.height = 430
	app.modules.config.unit.OfficeConfigForm.superclass.constructor.apply(this,[cfg])
}
Ext.extend(app.modules.config.unit.OfficeConfigForm, app.modules.config.unit.ManageUnitForm,{
	tabChange:function(tab, panel){
	    var form = this.form.getForm()
		var v = form.findField("officeCode").getValue()
		var pv = form.findField("parentId").getValue()
		if(!v || !panel){
		   return
		}
		var cnd = null
		var id = panel._Id
		if(id == "highLevel"){
		   cnd = ['eq',['$','officeCode'],['s',pv]]
		}else if(id == "lowerLevel"){
		   cnd = ['eq',['$','parentId'],['s',v]]
		}else{
		   cnd = ['eq',['$','organizCode'],['s',v]]
		}
		var m = this.midiModules[id]
		if(m && m.refresh){
			m.requestData.cnd = cnd
			m.refresh()
		}
	},
	
	doNew:function(){
		app.modules.config.unit.OfficeConfigForm.superclass.doNew.call(this)
		var form = this.form.getForm()
		var pf = form.findField("parentId")
		if(!pf){
			return
		}
		pf.disable()
		var f = form.findField("organizCode")		
	    if(f){
	    	if(!f.hasListener("select")){
	    	    f.on("select",this.changeParentOffice,this)
	    	}
	    	var node = this.opener.node
	    	if(node){
	    	   f.setValue({key:node.attributes.key,text:node.text})
	    	   pf.enable()
	    	}
	        f.enable()
	    }		
		if(!pf.hasListener("expand")){
		    pf.on("expand",function(com){
		       this.loadTreeData(com.tree, f.getValue())
		    },this)		    
		}
		
		
		
	},
	
	initFormData:function(data){
		var form = this.form.getForm()
		var f = form.findField("parentId")
		f.enable()
		app.modules.config.unit.OfficeConfigForm.superclass.initFormData.call(this,data)
	},
	
	changeParentOffice:function(com){
		var v = com.getValue()
		var form = this.form.getForm()
		var f = form.findField("parentId")
		if(f){
		   f.enable()
		   f.clearValue()
		}
	    
	    
	},
	
	loadTreeData:function(tree, v){
	    var dic = "officeDic"
	    var loader = tree.getLoader()
	    loader.url = dic + ".dic"
		loader.dic = {id:dic,filter:['eq',['$map','organizCode'],['s',v]]}
		var node = tree.getRootNode()
		node.reload()
	},
	
	parentManageCheck:function(com,record,index){
		var id = com.getValue()
	    var form = this.form.getForm()
		var f = form.findField("officeCode")
		if(f){
		   var codeId = f.getValue()
		   if(codeId == id){
		   	   Ext.Msg.alert("错误","不能选择自己科室")
		   	   com.clearValue()
		   }
		  this.checkParentNode(record,codeId,com)   
		}
	},
	
	checkParentNode:function(node,codeId,com){
		 var parent = node.parentNode
		 if(parent){
		   	if(parent.id==codeId){
		   		Ext.Msg.alert("错误","不能选择是本科室的下级科室")
		   	   	com.clearValue()
		   	}else{
		   		this.checkParentNode(parent,codeId,com)	
		   	}
		 }
	}
	
})

