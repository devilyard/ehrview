$package("app.modules.config.base")

$import("app.modules.list.SimpleListView",
		"app.modules.config.base.ConfigFormView")

app.modules.config.base.ConfigListView = function(cfg){	
	app.modules.config.base.ConfigListView.superclass.constructor.apply(this,[cfg])	
	this.disablePagingTbr = true
}

Ext.extend(app.modules.config.base.ConfigListView,app.modules.list.SimpleListView,{
	init:function(){
		this.createCls="app.modules.config.UserConfigForm"
		this.updateCls="app.modules.config.UserConfigForm"
		this.listServiceId = "configuration"
		this.removeServiceId = "configuration"
		this.operate = "loadAllById"
		this.addEvents({
			"gridInit":true,
			"beforeLoadData":true,
			"loadData":true,
			"loadSchema":true
		})
		this.requestData = {serviceId:this.listServiceId,schema:this.entryName,operate:this.operate,pkey:this.deptno,cnd:this.initCnd,pageSize:this.pageSize || 25,pageNo:1}
		if(this.serverParams){
			Ext.apply(this.requestData,this.serverParams)
		}
		if(this.autoLoadSchema){
			this.getSchema();
		}
	},
	
	getCM:function(items){
		var cm = []
		var ac =  util.Accredit;
		var expands = []
		for(var i = 0; i <items.length; i ++){
			var it = items[i]
			if(it.noList || it.hidden || !ac.canRead(it.acValue)||it.formUse){
				continue
			}
			if(it.expand){
				var expand = {
					id: it.dic ? it.id + "_text" : it.id,
					alias:it.alias,
					xtype:it.xtype
				}
				expands.push(expand)
				continue
			}
			var width = parseInt(it.width || 80)
			var c = {
				header:it.alias,
				width:width,
				align:'center',
				sortable:true,
				dataIndex: it.dic ? it.id + "_text" : it.id
			}
			if(it.pkey || it.hiddenRead){
				c.id = it.id
				c.hidden = true
			}
			switch(it.type){
				case 'int':
				case 'double':
				case 'bigDecimal':
					if(!it.dic){
						c.css = "color:#00AA00;font-weight:bold;"
						c.align = "right"
					}
					break
				case 'timestamp':
			}			
			if(it.renderer){
				var func
				func = eval("this."+it.renderer)
				if(typeof func == 'function'){
					c.renderer = func
				}
			}
			cm.push(c)
		}
		if(expands.length > 0){
			this.rowExpander = this.getExpander(expands)
			cm = [this.rowExpander].concat(cm)
		}
		// {{{ add by wuk
		cm = [new Ext.grid.RowNumberer()].concat(cm)
		// }}}
		return cm
	},
	
	loadModule:function(cls,entryName,item,r){
		var cmd = item.cmd
		var cfg = {}
		cfg.title = this.title + '-' + item.text 
		cfg.entryName = entryName
		cfg.op = cmd
		cfg.isSYS=this.isSYS
		cfg.HIH005=this._rId           //部门编号
		cfg.deptName=this.title        //部门名称(如: 卫生许可受理科)
		cfg.HIH006=this.parentId       //单位编号  2010-01-13
		cfg.deptName2=this.parentText  //单位名称(如: 广州市卫生监督所) 2010-01-13  
		cfg.exContext = {}
		Ext.apply(cfg.exContext,this.exContext)	
		
		if(cmd  != 'create'){
			cfg.initDataId = r.get('HIH001')
			cfg.exContext[entryName] = r
		}
		if(this.saveServiceId){
			cfg.saveServiceId = this.saveServiceId;
		}
		var m =  this.midiModules[cmd]
		if(!m){
			$require(cls,[function(){
				cfg.autoLoadData = false;
				var module = eval("new " + cls + "(cfg)")
				module.on("save",this.onSave,this)
				module.opener = this
				module.setMainApp(this.mainApp)
				this.midiModules[cmd] = module
				this.fireEvent("loadModule",module)
				this.openModule(cmd,r,[100,50])
			},this])
		}
		else{
			Ext.apply(m,cfg)
			this.openModule(cmd,r)
		}
	},

	doRemove:function(){
		var r = this.getSelectedRecord()
		if(r == null){
			return
		}
		Ext.Msg.show({
		   title: '确认删除记录[' + r.get('HIH002') + ']',
		   msg: '删除操作将无法恢复，是否继续?',
		   modal:false,
		   width: 300,
		   buttons: Ext.MessageBox.OKCANCEL,
		   multiline: false,
		   fn: function(btn, text){
		   	 if(btn == "ok"){
		   	 	this.processRemove();
		   	 }
		   },
		   scope:this
		})	
	},
	
	processRemove:function(){
		var r = this.getSelectedRecord()
		if(r == null){
			return
		}		
		if(!this.fireEvent("beforeRemove",this.entryName,r)){
			return;
		}
		this.mask("在正删除数据...")
		util.rmi.jsonRequest({
				serviceId:this.removeServiceId,
				operate:"remove",
				pkey:r.get('HIH001'),
				schema:this.entryName
			},
			function(code,msg,json){
				this.unmask()
				if(code < 300){
					this.store.remove(r)
					this.fireEvent("remove",this.entryName,r)					
				}
				else{
					this.processReturnMsg(code,msg,this.doRemove)
				}
			},
			this)
	}
})