$package("app.modules.config.unit")
$import(	
	"app.desktop.Module",
	"app.modules.common",
	"util.dictionary.SimpleDicFactory"
)

app.modules.config.unit.UnitTypeRoleForm = function(cfg){
	this.dicId = "rolelist"
	Ext.apply(this,app.modules.common)
	app.modules.config.unit.UnitTypeRoleForm.superclass.constructor.apply(this,[cfg])
}

Ext.extend(app.modules.config.unit.UnitTypeRoleForm, app.desktop.Module, {
	initPanel:function(){
		var rolelist = this.dicId
		if(this.domain && this.domain != globalDomain){
			rolelist = this.domain + "." + rolelist
		}
		var roles = util.dictionary.SimpleDicFactory.createDic({id:rolelist,editable:false})
		roles.name = "roles"
		roles.fieldLabel="角色列表"
		roles.allowBlank = false
		this.roles = roles
		roles.on("select",this.initFormData,this)
		var form = new Ext.FormPanel({
	        labelWidth: 75, 
	        frame:true,
	        autoScroll:true,
	        labelAlign:'top',
	        defaultType: 'textfield',
	        defaults:{width:350},
	        items: [
	        	{
	                fieldLabel: '角色编号',
	                name: 'key',
	                readOnly:true
	            }, {
	                fieldLabel: '角色名称',
	                name: 'text',
	                readOnly:true  
	            },roles
	        ]
	    });
	    this.form = form
	    return this.form
	},
	
	loadDic:function(){
		this.form.getForm().reset()
	    this.roles.store.removeAll()
		this.roles.store.proxy = new Ext.data.HttpProxy({
			  method:"GET",
		      url:this.getDicIdByDomain(this.domain,this.dicId) + ".dic"
		})
		this.roles.store.load()
	},
	
	getDicIdByDomain:function(domain, dic){
	    if(domain != globalDomain){
		    dic = domain + "." + dic
		}
		return dic
	},
	
	initFormData:function(com,record){
		var form = this.form.getForm()
		form.findField("key").setValue(com.getValue())
		form.findField("text").setValue(com.getRawValue())
	},
	doSave:function(){
		if(!this.validate()){
			return
		}
		var form = this.form.getForm()
		var id = form.findField("key").getValue()
		var title = form.findField("text").getValue()
		var newData = {
		    id : id,
		    title : title,
		    iconCls : 'role'
		}
		this.fireEvent("save",this,newData)
	},
	validate:function(){
		return this.form.getForm().isValid();
	},
	getWin: function(){
		var win = this.win
		if(!win){
			win = new Ext.Window({
		        title: "添加角色",
		        width: 380,
		        height:250,
		        iconCls: 'icon-form',
		        shim:true,
		        layout:"fit",
		        animCollapse:true,
		        items:this.initPanel(),
		        buttonAlign:"center",
	        	buttons:[{
			            text: '添加',
			            handler:this.doSave,
			            scope:this
			        	}],
		        closeAction:'hide',
		        maximizable: true,
		        constrain:true,
		        shadow:false,
		        modal:true
            })
		    var renderToEl = this.getRenderToEl()
            if(renderToEl){
            	win.render(renderToEl)
            }
			this.win = win
		}
		return win;
	}
})