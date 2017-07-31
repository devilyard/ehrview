String.prototype.realLength = function(){
  return this.replace(/[^\x00-\xff]/ig,"**").length;
}
Ext.override(Ext.form.TextField,{
	getErrors: function(value) {
        var errors = Ext.form.TextField.superclass.getErrors.apply(this, arguments);
        
        value = Ext.isDefined(value) ? value : this.processValue(this.getRawValue());        
        
        if (Ext.isFunction(this.validator)) {
            var msg = this.validator(value);
            if (msg !== true) {
                errors.push(msg);
            }
        }
        
        if (value.length < 1 || value === this.emptyText) {
            if (this.allowBlank) {
                //if value is blank and allowBlank is true, there cannot be any additional errors
                return errors;
            } else {
                errors.push(this.blankText);
            }
        }
        
        if (!this.allowBlank && (value.length < 1 || value === this.emptyText)) { // if it's blank
            errors.push(this.blankText);
        }
        var valueLength = value.realLength();
        if (valueLength < this.minLength) {
            errors.push(String.format(this.minLengthText, this.minLength));
        }
        
        if (valueLength > this.maxLength) {
            errors.push(String.format(this.maxLengthText, this.maxLength));
        }
        
        if (this.vtype) {
            var vt = Ext.form.VTypes;
            if(!vt[this.vtype](value, this)){
                errors.push(this.vtypeText || vt[this.vtype +'Text']);
            }
        }
        
        if (this.regex && !this.regex.test(value)) {
            errors.push(this.regexText);
        }
        
        return errors;
	}
	
})

$package("app.modules.form")

$import(
		"app.modules.common",		
		"util.Accredit",
		"util.widgets.ImageField",
		"util.rmi.jsonRequest",
		"app.desktop.Module",
		"util.widgets.DateTimeField"
		)

app.modules.form.SimpleFormView = function(cfg){
	this.exContext = {}
	this.saveServiceId = "simpleSave"
	this.loadServiceId = "simpleLoad"
	this.width = 700;
	this.data = {};
	this.actions = [
		{id:"new",name:"新建"},
		{id:"save",name:"保存"}
	]
	if(!this.isCombined)
		this.actions.push({id:"cancel",name:"取消",iconCls:"common_cancel"})
	this.autoLoadSchema = true
	this.autoLoadData = true;
	this.showButtonOnTop = false
	Ext.apply(this,app.modules.common)
	app.modules.form.SimpleFormView.superclass.constructor.apply(this,[cfg])
}
Ext.extend(app.modules.form.SimpleFormView, app.desktop.Module,{
	init:function(){
		this.addEvents({
			"formInit":true,
			"beforeSave":true,
			"saveSuccess":true,
			"beforeLoadData":true,
			"loadData":true,
			"loadSchema":true,
			"addfield":true
		})
		if(this.autoLoadSchema){
			this.getSchema();
		}
	},
	initPanel:function(sc){
		if(this.form){
			if(!this.isCombined){
				this.addPanelToWin();
			}			
			return this.form;
		}
		var schema = sc
		if(!schema){
			var re = util.schema.loadSync(this.entryName)
			if(re.code == 200){
				schema = re.schema;
			}
			else{
				this.processReturnMsg(re.code,re.msg,this.initPanel)
				return;
			}
		}
		this.schema = schema;
		var ac =  util.Accredit;
		var defaultWidth = this.fldDefaultWidth || 200
		var cfg = {
			labelAlign:"right",
			labelWidth:this.labelWidth || 80,
			iconCls: 'bogus',
			border:false,
			frame: true,
			autoHeight:true,
			autoWidth:true,
			defaultType: 'textfield',
			shadow:true
		}
		this.initBars(cfg);
		this.form = new Ext.FormPanel(cfg)
		this.form.on("afterrender",this.onReady,this)
		var groups = {};
		var g = new Ext.form.FieldSet({
					title:'基本信息',
					animCollapse:true,
					defaultType:'textfield',
					autoWidth:true,
					autoHeight:true,
					collapsible:true
				})
		groups["_default"] = g
		var items =  schema.items

		for(var i = 0; i <items.length; i ++){
			var it = items[i]
			if((it.display == 0 || it.display == 1) || !ac.canRead(it.acValue)){
				continue;
			}
			var f = this.createField(it)
			f.index = i;
			if(!this.fireEvent("addfield",f,it)){
				continue;
			}
			var gname = it.group 
			if(gname){
				if(!groups[gname]){
					var cfg = {}
					cfg.defaultType = 'textfield',
					cfg.title = it.group
					cfg.autoWidth = true
					cfg.autoHeight = true
					cfg.collapsible= true
					var group = new Ext.form.FieldSet(cfg)
					groups[gname] = group
				}
			}
			else{
				gname = "_default"
			}
			groups[gname].add(f)
		}
		for(s in groups){
			this.form.add(groups[s])
		}
		this.setKeyReadOnly(true)
		if(!this.isCombined){
			this.addPanelToWin();
		}
		return this.form
	},
	onReady:function(){
		if(this.autoLoadData){
			this.loadData();
		}
		var el = this.form.el
		if(!el){
			return
		}
		var actions = this.actions
		if(!actions){
			return
		}
		var f1 = 112
		var keyMap = new Ext.KeyMap(el)
		keyMap.stopEvent = true
		
		var btnAccessKeys = {}
		var keys = []
		if(this.showButtonOnTop){
			var btns = this.form.getTopToolbar().items; 
			if(btns){
				var n = btns.getCount()
				for(var i = 0; i < n; i ++){
					var btn = btns.item(i)
					var key = btn.accessKey
					if(key){
						btnAccessKeys[key] = btn
						keys.push(key)
					}
				}
			}
		}
		else{
			var btns = this.form.buttons
			for(var i = 0;i < btns.length; i ++){
				var btn = btns[i]
				var key = btn.accessKey
				if(key){
					btnAccessKeys[key] = btn
					keys.push(key)
				}
			}
		}
		this.btnAccessKeys = btnAccessKeys
		keyMap.on(keys,this.onAccessKey,this)
		if(this.win){
			keyMap.on({key:Ext.EventObject.ESC,shift:true},this.onEsc,this)
		}
	},
	//add by huangpf 
	doCancel:function(){
		var win = this.getWin();
		if(win)
			win.hide();
	},
	
	onAccessKey:function(key){
		var ee = Ext.EventObject
		if(window.event){
		   	ee= window.event
		}
		ee.keyCode=0;
		ee.returnValue=false;
		
		var btn = this.btnAccessKeys[key]
		if(!btn.disabled){
			if(btn.enableToggle){
				btn.toggle(!btn.pressed)
			}
			this.doAction(btn)
		}
//		var ev = window.event
//		try{
//			ev.keyCode=0;
//			ev.returnValue=false
//		}
//		catch(e){}
	},	
	onEsc:function(){
		this.win.hide()
	},	
	createField:function(it){
		var ac =  util.Accredit;
		var defaultWidth = this.fldDefaultWidth || 200
		var cfg = {
			name:it.id,
			fieldLabel:it.alias,
			xtype:it.xtype || "textfield",
			vtype:it.vtype,
			width:defaultWidth,
			value:it.defaultValue,
			enableKeyEvents:it.enableKeyEvents,
			labelSeparator:":"
		}
		cfg.listeners = {
			specialkey:this.onFieldSpecialkey,
			scope:this
		}
		if(it.onblur){
			var func = eval("this."+it.onblur)
			if(typeof func == 'function'){
				Ext.apply(cfg.listeners, {blur:func})
			}
		}
		if(it.inputType){
			cfg.inputType = it.inputType
		}
		if(it.editable){
		   cfg.editable = (it.editable=="true")?true:false
		}
		if(it['not-null'] == "1" || it['not-null'] == "true"){
			cfg.allowBlank = false
			cfg.invalidText  = "必填字段"
			cfg.regex = /(^\S+)/
			cfg.regexText = "前面不能有空格字符"
		}
		if(it.fixed == "true"){
			cfg.disabled = true
		}
		if(it.pkey == "true" && it.generator == 'auto'){
			cfg.disabled = true
		}
		if(it.evalOnServer && ac.canRead(it.acValue)){
			cfg.disabled = true
		}
		if(this.op == "create" && !ac.canCreate(it.acValue)){
			cfg.disabled = true
		}
		if(this.op == "update" && !ac.canUpdate(it.acValue)){
			cfg.disabled = true
		}
		if(it.dic){
			it.dic.src = this.entryName + "." + it.id
			it.dic.defaultValue = it.defaultValue
			it.dic.width = defaultWidth
			var combox = this.createDicField(it.dic)
			Ext.apply(combox,cfg)
			combox.on("specialkey",this.onFieldSpecialkey,this)
			return combox;
		}
		if(it.length){
			cfg.maxLength = it.length;
		}
		if(it.maxValue){
			cfg.maxValue = it.maxValue;
		}
		if(it.minValue){
			cfg.minValue = it.minValue;
		}
		if(it.xtype){
			if(it.xtype == "htmleditor"){
				cfg.height = it.height || 200;
			}
			if(it.xtype == "textarea"){
			    cfg.height = it.height || 60
			}
			if(it.xtype == "datefield" && (it.type == "datetime" || it.type == "timestamp")){
				cfg.emptyText  = "请选择日期"	
				cfg.format = 'Y-m-d'
			}
			return cfg;
		}
		switch(it.type){
			case 'int':
			case 'double':
			case 'bigDecimal':
				cfg.xtype = "numberfield"
				if(it.type == 'int'){
					cfg.decimalPrecision = 0;
					cfg.allowDecimals = false
				}
				else{
					cfg.decimalPrecision = it.precision || 2;
				}
				break;
			case 'date':
				cfg.xtype = 'datefield'
				cfg.emptyText  = "请选择日期"	
				cfg.format = 'Y-m-d'
				break;
			case 'datetime':
				cfg.xtype = 'datetimefield'
				cfg.emptyText  = "请选择日期时间"
				cfg.format = 'Y-m-d H:i:s'
				break;
			case 'text':
				cfg.xtype = "htmleditor"
				cfg.enableSourceEdit = false
				cfg.enableLinks = false
				cfg.width = 300
				break;
		}
		return cfg;
	},
	initBars:function(cfg){
		
		if(this.showButtonOnTop){
			cfg.tbar = (this.tbar || []).concat(this.createButtons())
		}
		else{
			cfg.tbar = this.tbar
			cfg.buttons = this.createButtons()
		}
		if(this.bbar){
			cfg.bbar = this.bbar
		}
		
	},
	addPanelToWin:function(){
		if(!this.fireEvent("panelInit",this.form)){
			return;
		};
		var win = this.getWin();
		win.add(this.form)
		if(win.el){
			win.doLayout()	
			win.center();
		}
		this.fireEvent("afterPanelInit",this.form)
	},
	createDicField:function(dic){
		var cls = "util.dictionary.";
		if(!dic.render){
			cls += "Simple";
		}
		else{
			cls += dic.render
		}
		cls += "DicFactory"
		
		$import(cls)
		var factory = eval("(" + cls + ")")
		var field = factory.createDic(dic)
		return field
	},
	onFieldSpecialkey:function(f,e){
		var key = e.getKey()
		if(key == e.ENTER){
			e.stopEvent()
			this.focusFieldAfter(f.index)
		}
	},
	focusFieldAfter:function(index,delay){
			var items = this.schema.items
			var form = this.form.getForm()
			for(var i = index + 1; i < items.length; i ++){
				var next = items[i]
				var field = form.findField(next.id)
				if(field && !field.disabled){
					field.focus(true,delay || 200)
					return;
				}
			}
			var btns;
			if(this.showButtonOnTop){
				btns = this.form.getTopToolbar().items
				if(btns){
					var n = btns.getCount()
					for(var i = 0; i < n; i ++){
						var btn = btns.item(i)
						if(btn.cmd == "save"){
							if(btn.rendered){
								btn.focus()
							}
							return;
						}
					}
				}
			}
			else{
				btns =  this.form.buttons;
				if(btns){
					var n = btns.length
					for(var i = 0; i < n; i ++){
						var btn = btns[i]
						if(btn.cmd == "save"){
							if(btn.rendered){
								btn.focus()
							}
							return;
						}
					}	
				}			
			}	
	},
	getWin: function(){
		var win = this.win
		if(!win){
			win = new Ext.Window({
				id:this.id,
		        title: this.title,
		        width: this.width,
		        height:100,
		        autoHeight:true,
		        iconCls: 'icon-form',
		        bodyBorder:false,
		        closeAction:'hide',
		        shim:true,
		        layout:"fit",
		        plain:true,
		        autoScroll:false,
		        //minimizable: true,
		        maximizable: true,
		        shadow:false,
		        buttonAlign:'center',
		        modal:true
            })
		    win.on("show",function(){
		    	this.fireEvent("winShow")
		    },this)
		    win.on("close",function(){
				this.fireEvent("close",this)
			},this)
		    win.on("hide",function(){
				this.fireEvent("close",this)
			},this)
			win.on("restore",function(w){
				this.form.onBodyResize()
				this.form.doLayout()				
			    this.win.doLayout()
			},this)
			
		    var renderToEl = this.getRenderToEl()
            if(renderToEl){
            	win.render(renderToEl)
            }
			this.win = win
		}
		return win;
	},
	createButtons:function(){
		if(this.op == 'read'){
			return [];
		}
		var actions = this.actions
		var buttons = []
		if(!actions){
			return buttons
		}
		var f1 = 112

		for(var i = 0; i < actions.length; i ++){
			var action = actions[i];
			var btn = {}
			btn.accessKey = f1 + i,
			btn.cmd = action.id
			btn.text = action.name + "(F" + (i + 1) + ")",
			btn.iconCls = action.iconCls || action.id
			btn.script =  action.script
			btn.handler = this.doAction;
			btn.scope = this;
			buttons.push(btn)
		}
		return buttons
	},
	doAction: function(item,e){
		var cmd = item.cmd
		var script = item.script
		cmd = cmd.charAt(0).toUpperCase() + cmd.substr(1)
		if(script){
			$require(script,[function(){
				eval(script + '.do' +cmd +'.apply(this,[item,e])')	
			},this])
		}
		else{
			var action =  this["do"+cmd]
			if(action){
				action.apply(this,[item,e])
			}
		}
	},
	doNew: function(){
		this.op = "create"
		if(this.data){
			this.data = {}
		}
		if(!this.schema){
			return;
		}
		var form = this.form.getForm()
		var items = this.schema.items
		var n = items.length
		for(var i = 0; i < n; i ++){
			var it = items[i]
			var f = form.findField(it.id)
			if(f){
				f.setValue(it.defaultValue)
				if(it.update == "false" && !it.fixed && !it.evalOnServer){
					f.enable();
				}
				f.validate();
			}		
		}
		this.setKeyReadOnly(false)
		this.fireEvent("doNew",this.form)
		this.focusFieldAfter(-1,800)
	},
	loadData: function(){
		if(this.loading){
			return
		}
		if(!this.schema){
			return
		}
		if(!this.initDataId && !this.initDataBody){
			return;
		}
		if(!this.fireEvent("beforeLoadData",this.entryName,this.initDataId,this.initDataBody)){
			return
		}
		if(this.form && this.form.el){
			this.form.el.mask("正在载入数据...","x-mask-loading")
		}
		this.loading = true
		util.rmi.jsonRequest({
				serviceId:this.loadServiceId,
				schema:this.entryName,
				pkey:this.initDataId,
				body:this.initDataBody,
				action:this.op,    //按钮事件
				module:this._mId   //增加module的id
			},
			function(code,msg,json){
				if(this.form && this.form.el){
					this.form.el.unmask()
				}
				this.loading = false
				if(code > 300){
					this.processReturnMsg(code,msg,this.loadData)
					return
				}
				if(json.body){
					this.doNew()
					this.initFormData(json.body)
					this.fireEvent("loadData",this.entryName,json.body);
				}
				if(this.op == 'create'){
					this.op = "update"
				}
				
			},
			this)//jsonRequest
	},
	initFormData:function(data){
		Ext.apply(this.data,data)
		this.initDataId = this.data[this.schema.pkey]
		var form = this.form.getForm()
		var items = this.schema.items
		var n = items.length
		for(var i = 0; i < n; i ++){
			var it = items[i]
			var f = form.findField(it.id)
			if(f){
				var v = data[it.id]
				if(v){
					if((it.type == 'date' || it.xtype == 'datefield') && typeof v == 'string' && v.length > 10){
						v = v.substring(0,10)
					}
					f.setValue(v)
				}
				if(it.update == "false"){
					f.disable();
				}
			}
		}
		this.setKeyReadOnly(true)	
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
				if(this.op == "create" && !ac.canCreate(it.acValue)){
					continue;
				}				
				var v = it.defaultValue || this.data[it.id]
				if(v != null && typeof v == "object"){
					v = v.key
				}
				var f = form.findField(it.id)
				if(f){
					v = f.getValue()
					if(it.id == "content"){
//						alert(v)
//						return
					}
					// add by huangpf 
					if(f.getXType() =="treeField"){
						var rawVal= f.getRawValue();
						if(rawVal==null || rawVal=="")
							v = "";
					}
					//end 
				}
				if(v == null || v === ""){
					if(!(it.pkey == "true") && (it["not-null"]=="1"||it['not-null'] == "true") && !it.ref){
						alert(it.alias+"不能为空")
						return;
					}
				}
				values[it.id] = v;
			}
		}
		Ext.apply(this.data,values);
		this.saveToServer(values)
	},
	saveToServer:function(saveData){
		if(!this.fireEvent("beforeSave",this.entryName,this.op,saveData)){
			return;
		}
//		if(this.initDataId == null){
//			this.op = "create";
//		}
		this.saving = true
		this.form.el.mask("正在保存数据...","x-mask-loading")
		util.rmi.jsonRequest({
				serviceId:this.saveServiceId,
				op:this.op,
				schema:this.entryName,
				module:this._mId,  //增加module的id
				body:saveData
			},
			function(code,msg,json){
				this.form.el.unmask()
				this.saving = false
				if(code > 300){
					this.processReturnMsg(code,msg,this.saveToServer,[saveData],json.body);
					return
				}
				Ext.apply(this.data,saveData);
				if(json.body){
					this.initFormData(json.body)
					this.fireEvent("save",this.entryName,this.op,json,this.data)
				}
				this.op = "update"
			},
			this)//jsonRequest
			
			var win = this.getWin();
		if(win){
			win.hide();
		}	
	},
	validate:function(){
		return this.form.getForm().isValid();
	},
	setKeyReadOnly:function(status){
		if(this.schema.keyGenerator == "auto"){
			status = true
		}
		if(this.schema.pkey){
			var pkey = this.form.getForm().findField(this.schema.pkey)
			if(pkey){
				pkey.setDisabled(status)
			}
		}
	}
	
});