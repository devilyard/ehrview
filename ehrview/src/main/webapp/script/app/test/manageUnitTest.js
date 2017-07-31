$package("app.test")

$import(
	"app.desktop.Module",
	"org.ext.ux.TabCloseMenu",
	"app.modules.common",
	"util.dictionary.TreeDicFactory"
)

app.test.manageUnitTest = function(cfg){
	this.height = 300
	this.dicId = "user02"  //"manageUnit"
	Ext.apply(this,app.modules.common)
	app.test.manageUnitTest.superclass.constructor.apply(this,[cfg])
}

Ext.extend(app.test.manageUnitTest, app.desktop.Module,{
	initPanel:function(){
		var tree = util.dictionary.TreeDicFactory.createTree({id:this.dicId,sliceType:5,keyNotUniquely:true})
		tree.autoScroll = true
		var form = this.createForm()
		var panel = new Ext.Panel({
			border:false,
			frame:true,
		    layout:'border',
		    width:this.width,
		    height:this.height,
		    items: [{
		    	layout:"fit",
		    	split:true,
		    	collapsible:true,
		        title: '',
		        region:'west',
		        width:200,
		        items:tree
		    },{
		    	layout:"fit",
		    	split:true,
		        title: '',
		        region: 'center',
		        width: 400,
		        items:form
		    }]
		});	
		tree.on("click",this.onTreeClick,this)
		tree.expand()
		this.tree = tree;
		this.panel = panel;
		return panel
	},
	createForm:function(){
	    var form = new Ext.FormPanel({
	        labelWidth: 75, 
	        frame:true,
	        bodyStyle:'padding:2px 20px 0 0',
	        width: 580,
	        defaults: {width: 550},
	        autoScroll:true,
	        labelAlign:'top',
	        defaultType: 'textfield',
	        items: [
	        	{
	                fieldLabel: '机构类型编码',
	                name: 'key',
	                allowBlank:false
	            }, {
	                fieldLabel: '机构类型名称',
	                name: 'text',
	                allowBlank:false
	            },
	            {
	                fieldLabel: '节点属性',
	                xtype:'textarea',
	                height:100,
	                name: 'prop',
	                allowBlank:false
	            }
	        ]});
	    this.form = form
        return form;
	},

	onTreeClick:function(node,e){
		this.selectedNode = node
		this.cmd = "updateItem"
		this.form.getForm().reset();
		var n = node
		var fields = this.getFields()
		fields.key.setValue(n.attributes.key)
		fields.text.setValue(n.attributes.text)
		fields.prop.setValue(Ext.encode(n.attributes))
	},
	getFields:function(){
		var fields = this.fields
		if(!fields){
			var items = this.form.items
			var n = items.getCount()
			var fields = {}
			for(var i = 0; i < n; i ++){
				var f = items.get(i)
				if(f.name)
					fields[f.name] = f
			}
			this.fields = fields
		}
		return fields
	}
})