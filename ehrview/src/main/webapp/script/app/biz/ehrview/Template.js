$package( "app.biz.ehrview" )

$import( "app.modules.list.SimpleListView","app.biz.ehrview.extfckeditor" )

app.biz.ehrview.Template = function ( cfg ) {
//	cfg.createCls = "app.biz.ehrview.UpdateTemplate"
//	cfg.updateCls = "app.biz.ehrview.UpdateTemplate"
	app.biz.ehrview.Template.superclass.constructor.apply( this, [ cfg ] )
	this.requestData.serviceId = "templateListService";
//	this.autoLoadData = true
	this.disablePagingTbr = true;
}

Ext.extend(app.biz.ehrview.Template, app.modules.list.SimpleListView, {
	
	warpPanel : function(grid) {
		
		var r = util.rmi.miniJsonRequestSync({
			serviceId : "templateListService",
			method:"list"
		})
		var tree = new Ext.tree.TreePanel({    
            region: 'center',    
            //True表示为面板是可收缩的，并自动渲染一个展开/收缩的轮换按钮在头部工具条    
            //collapsible: true,    
            width: 200,    
            border : false,//表框    
            autoScroll: false,//自动滚动条    
            animate : true,//动画效果    
            rootVisible: false,//根节点是否可见    
            split: true,    
            containerScroll: false,
            loader : new Ext.tree.TreeLoader(),    
            root : new Ext.tree.AsyncTreeNode({    
                text:'根',    
                children : r.json.body
            }),  
            listeners: {        
                afterrender: function(node) {        
                    tree.expandAll();//展开树     
                }        
            }     
        }); 
		var filter = new Ext.tree.TreeFilter(tree, {
			clearBlank: true,
			autoClear: true
		});
		tree.filter = filter
		this.tree = tree;
		tree.on("click", this.onTreeClick, this)
		var panel = new Ext.Panel({
					border : false,
					layout : 'border',
					width : this.width,
					height : this.height,
					items : [{
								layout : 'fit',
								title : "模板版本",
								region : 'west',
								split : true,
								collapsible : true,
								width : 200,
								items : [tree]
							}, {
								layout : "fit",
								split : true,
								title : '',
								region : 'center',
								width : 280,
								items : grid
							}]
				});
		grid.__this = this
		return panel
	},
	onTreeClick : function(node) {
		//this.resetFirstPage()
		this.requestData.serviceId = "templateListService";
		this.requestData.method = "query";
		this.requestData.templateId = node.attributes.key;
		this.versionNumber = node.attributes.key;
		this.refresh()
	},
	onDblClick: function() {
		var r = this.getSelectedRecord();
		this.showWin(this.versionNumber,r.data.templateName);
	},
	
	showWin:function(templateId,templateName){
		var win;
		var form1 = new Ext.FormPanel({
			bodyStyle : 'padding:5px',
            labelAlign: 'right',
            height: 520,
            region: 'center',//定位
            id:'formPanel',
			items: [{
                xtype: 'fieldset',
                height :460,
                title: '模板信息',
                defaultType: 'textfield',
                items: [    {  
                	fieldLabel:'模板内容',
                    xtype:'fckeditor',  
                    name:'content',  
                    blankText: '模板内容为必填!',  
                    id:'content'  
                }  ]
            }],
            buttons: [{  
                text: '保存',  
                type:'submit',  
                handler: function() {  
                    if(form1.form.isValid()){//验证通过  
                    	form1.el.mask("在正保存数据...","x-mask-loading")
                		var r = util.rmi.miniJsonRequestSync({
                				serviceId:"templateListService",
                				method:"update",
                				templateId: templateId,
                				templateName: templateName,
                				content:Ext.get('content').getValue()
                			})
                			if(r.code == 200){
                				Ext.MessageBox.alert("提示", "保存成功",
            							function(){
            								win.close()
            							},this);
                			}else{
                				Ext.MessageBox.alert("提示", "保存失败",
            							function(){
            								win.close()
            							},this);
                			}
                    }  
                }  
            },{  
                text: '取消',
                handler : function() {
                    win.close();
                }
            }] 
		})
		
		win = new Ext.Window({
			title:"模板管理",
			layout:"form",
			width:1000,
			height:550,
			closeAction:"close",
			shadow:false,
			modal:true,
			items:[form1],
			buttonAlign:'center'
		})
		
		win.show();
		var ret = util.rmi.miniJsonRequestSync({
			serviceId : "templateListService",
			schema : this.entryName,
			method:"queryName",
			templateId: templateId,
			templateName: templateName
		})
		if (ret.code == 200) {
			var schema = ret.json.body
			if (schema) {
				Ext.getCmp('content').setValue(schema);
			}
		}
	},
	doChange: function(){
		this.onDblClick();
	}
} )