$package("app.modules.config.user")

$import(
		"app.modules.form.SimpleFormView"
		)
		
app.modules.config.user.UserPropForm = function(cfg){
	cfg.width = 500;
	cfg.fldDefaultWidth = 300
	this.dicId = "positionDic"
	this.localDomain = globalDomain//"ctd"
	this.serviceId = "userService"
	this.roleId = "jobId"
	this.unitId = "manaUnitId"
	this.post = "post"
	this.domainId = "domain"
	cfg.actions = [
		{id:"save",name:"保存"},
		{id:"cancel",name:"取消",iconCls:"common_cancel"}
	]
	app.modules.config.user.UserPropForm.superclass.constructor.apply(this,[cfg])

}
Ext.extend(app.modules.config.user.UserPropForm, app.modules.form.SimpleFormView,{

	doNew: function(){
		app.modules.config.user.UserPropForm.superclass.doNew.call(this)
		var form = this.form.getForm()
		var fd = form.findField(this.domainId)
		if(!fd.hasListener("select")){
		    fd.on("select",this.changeManageUnit,this)
		}		
	    var fpost = form.findField(this.post)  //所属部门
	    if(fpost){
	    	fpost.setValue({key:"",text:""})
	    	if(!fpost.hasListener("click")){
	    	    fpost.tree.on("click",this.addValue,this)
	    	}
	    	if(!fpost.hasListener("expand")){
	    	    fpost.on("expand",function(com){
		       		this.loadTreeData(com.tree, fd.getValue())
		    	},this)
	    	}
	    	this.fpost = fpost  
	    }	    
	},
	
	changeManageUnit:function(com){
	    var form = this.form.getForm()
	    var funit = form.findField(this.unitId)
	    funit.setValue({key:"",text:""})
	    this.fpost.setValue({key:"",text:""})
	    
	},
	
	loadTreeData:function(tree, domain){
	    if(tree){
	       var node = tree.getRootNode()
	       if(!domain){
	          node.removeAll()
	          return
	       }
	       var loader = tree.getLoader()
	       var dic = this.dicId
		   if(domain != this.localDomain){
		      dic = domain + "." +this.dicId
		   }
		   loader.url = dic + ".dic"
		   loader.dic = {id:dic}		   
		   node.reload()
	    }
	},
	
	addValue:function(node){		
	   var parentNode = node.parentNode
	   var form = this.form.getForm()
	   var funit = form.findField(this.unitId)
	   funit.setValue({key:parentNode.id,text:parentNode.text})
	   this.data[this.roleId] = node.attributes.rid
	},
	
	loadData:function(){
	   var r = this.exContext[this.entryName]
	   var data = {}
	   Ext.apply(data,r.data)
	   if(data){
		  var items = this.schema.items
		  var n = items.length
		  for(var i = 0; i < n; i ++){
		     var it = items[i]
		     var id = it.id
		     if(it.dic){
		         data[id] = {key:data[id],text:data[id+"_text"]}
		     }
		  }		  
	   }
	   this.doNew()
	   this.initFormData(data)
	   if(this.op == "create"){
	      this.op = "update"
	   }
	},
	
	doSave: function(){
		if(this.saving){
			return
		}
		var ac =  util.Accredit;
		var form = this.form.getForm()
		if(!this.validate()){
			return
		}
		if(!this.schema){
			return
		}
		var values = {};
		var items = this.schema.items	
		Ext.apply(this.data,this.exContext)
				
		if(items){
			var n = items.length
			for(var i = 0; i < n; i ++){
				var it = items[i]
				if(it.id.indexOf("_text") != -1){
				    continue
				}
				if(this.op == "create" && !ac.canCreate(it.acValue)){
					continue;
				}				
				var v = it.defaultValue || this.data[it.id]			
				if(v != null && typeof v == "object"){
					if(it.dic){
					   values[it.id+"_text"] = v.text
					}
					v = v.key
				}
				var f = form.findField(it.id)
				if(f){
					v = f.getValue()
					if(it.dic){
					   values[it.id+"_text"] = f.getRawValue()
					}
				}
				values[it.id] = v;
			}
		}		
		Ext.apply(this.data,values);
		this.saveToGrid(values)
	},
	
	saveToGrid:function(values){
		var items = this.schema.items
	    var n = items.length
		var fields = []
		for(var i = 0; i < n; i ++){
		    var it = items[i]
		    fields[i] = {name:it.id}
		}
		var record = Ext.data.Record.create(fields)
		var store = this.opener.grid.getStore()
		var post = values[this.post]
		var domain = values[this.domainId]
		if(!post || !domain){
		   return
		}

		var rr = new record(values)
		if(this.op=="create"){
			if(this.indexOfValue(domain,post) == -1){
			    store.add(rr)			    
			    this.op = "update"
			}else{
		        Ext.Msg.alert("错误", "相关职位已存在,无法保存");
		    }
		}else{			
			var r = this.exContext[this.entryName]
			var n = store.indexOf(r)
			var i = this.indexOfValue(domain,post)
			if(i != -1 && i != n){
				Ext.Msg.alert("错误", "相关职位已存在,无法保存");
				return
			}
		    store.remove(r)		    
		    store.insert(n,rr)
		}
		this.exContext[this.entryName] = rr
		this.fireEvent("save",this)
	},
	
	indexOfValue:function(domain, v){
	    var store = this.opener.grid.getStore()
		var n = store.getCount()
		for(var i=0; i<n; i++){
		    var rr = store.getAt(i) 
		    if(rr.get(this.domainId) == domain && rr.get(this.post) == v){
		    	return i
		    }
		}
		return -1
	}
	

	
})