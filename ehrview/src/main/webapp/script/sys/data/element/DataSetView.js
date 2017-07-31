$package("sys.data.element")
$styleSheet("sys.data.element.go")
$import(
	"sys.data.element.DataElementView",
	"app.modules.form.TableFormView"
)

sys.data.element.DataSetView = function(cfg) {
	cfg.westTree = "resDataSet";
	cfg.allowMutiSelected = true;
	cfg.viewDDGroup = "viewDDGroup";
	sys.data.element.DataSetView.superclass.constructor.apply(this, [cfg])
	this.entryName1 = "RES_DataGroup4Set";
	this.entryName2 = "RES_DataElement4Set";
	this.clickField = "b.DataSetId";
	this.clickFieldFix = "bDataSetId";
	this.dataElementSaveService = "dataElementSave4Set";
	this.dataElementLoadService = "dataElementLoad4Set";
	this.joinSchema = "RES_DataSetContent";
	this.searchBars = [];
	this.tbars = ['->','-',
		{text:"加入",iconCls:"add",handler:this.doAdd,scope:this},'-',
		{text:"删除",iconCls:"remove",handler:this.doRemove,scope:this}
	];
}
Ext.extend(sys.data.element.DataSetView, sys.data.element.DataElementView, {
	getWestPanel:function(){
		var wp = util.dictionary.TreeDicFactory.createTree({
			dropConfig:{
				ddGroup : this.viewDDGroup,
				notifyDrop : this.onTreeNotifyDrop,
				scope : this
			},
			keyNotUniquely:true,
			id:this.westTree,
			title:"数据集"
		});
		wp.autoScroll = true;
		wp.getLoader().on("beforeload",function(loader){
			loader.dic.filter = ['eq',['$map','DataStandardId'],['s',this.resDataStandard]];
		},this)
		wp.width = 180;
		wp.split = true,
		wp.on({
			containercontextmenu:this.containercontextmenu,
			contextmenu:this.onContextMenu,
			scope:this
		})
		this.wp = wp;
		wp.on({
			click:this.onNodeClick,
			scope:this
		})
		return wp
	},
	containercontextmenu:function(tree,e){
		e.stopEvent();
		this.selectedNode = this.wp.getRootNode();
		var cmenu = this.midiMenus['westTreeContainerMenu']
		if(!cmenu){
			cmenu = new Ext.menu.Menu({
				items:[
					{text:"增加",iconCls:"add",menu:{items:[
						{text:"目录",iconCls:"add",scope:this,handler:this.doAddCatalog}
					]}}
				]
			});
			this.midiMenus['westTreeContainerMenu'] = cmenu
		}
		cmenu.showAt([e.getPageX(),e.getPageY()]);
	},
	onContextMenu:function(node, e){
		e.stopEvent();
		this.wp.getSelectionModel().select(node);
		this.selectedNode = node;
		var cmenu = this.midiMenus['westTreeMenu']
		if(!cmenu){
			cmenu = new Ext.menu.Menu({
				items:[
					{text:"增加",iconCls:"add",menu:{items:[
						{text:"目录",iconCls:"add",scope:this,handler:this.doAddCatalog},
						{text:"子目录",iconCls:"add",scope:this,handler:this.doAddChildCatalog},
						{text:"数据集",iconCls:"add",scope:this,handler:this.doAddSet}
					]}},
					{text:"修改",iconCls:"update",scope:this,handler:this.doUpdateCatalogOrSet},
					{text:"删除",iconCls:"remove",scope:this,handler:this.doRemoveCatalogOrSet}
				]
			});
			this.midiMenus['westTreeMenu'] = cmenu
		}
		if(node.isLeaf()){
			cmenu.items.itemAt(0).hide();
		}else{
			cmenu.items.itemAt(0).show();
		}
		cmenu.showAt([e.getPageX(),e.getPageY()]);
	},
	doRemoveCatalogOrSet:function(){
		var node = this.selectedNode;
		Ext.MessageBox.confirm("提示","是否删除["+node.text+"]",function(okay){
			if("yes"==okay){
				if(node.isLeaf()){
					util.rmi.jsonRequest({
						serviceId:"dataStandardRemove",
						schema:"RES_DataSet",
						pkey:node.attributes.key
					},function(code,msg,json){
						if(code == 200){
							node.remove();
							this.clear();
						}
					},this)
				}else{
					if(node.hasChildNodes()){
						Ext.Msg.alert("提示","目录下还存在数据集，无法删除.");
					}else{
						util.rmi.jsonRequest({
							serviceId:"dataStandardRemove",
							schema:"RES_DataSetCatalog",
							pkey:node.attributes.key
						},function(code,msg,json){
							if(code == 200){
								node.remove();
								this.clear();
							}
						},this)
					}
				}
			}
		},this)
	},
	doAddCatalog:function(){
		if(this.selectedNode.parentNode){
			this.selectedNode = this.selectedNode.parentNode;
		}
		this.doAddChildCatalog();
	},
	doAddChildCatalog:function(){
		var form = this.getCatalogFrom();
		form.op = "create";
		form.doNew();
		form.getWin().show();
	},
	doAddSet:function(){
		var form = this.getDataSetForm();
		form.op = "create";
		form.doNew();
		form.getWin().show();
	},
	doUpdateCatalogOrSet:function(){
		var node = this.selectedNode;
		if(!node.isLeaf()){
			var form = this.getCatalogFrom();
			form.initDataId = node.attributes.key;
			form.loadData();
			form.getWin().show();
		}else{
			var form = this.getDataSetForm();
			form.op = "update";
			form.initDataId = node.attributes.key;
			form.loadData();
			form.getWin().show();
		}
	},
	getCatalogFrom:function(){
		var form = this.catalogFrom;
		if(!form){
			form = new app.modules.form.TableFormView({
				entryName:"RES_DataSetCatalog",
				saveServiceId:"dataSetCatalogSave",
				autoLoadSchema:false,
				actions:[
					{id:"save",name:"确定"},
					{id:"cancel",name:"取消",iconCls:"common_cancel"}
				]
			})
			form.on("addfield",function(f,it){
				if(it.id == "ParentCatalogId"){
					f.tree.getLoader().on("beforeload",function(loader){
						loader.dic.filter = ['eq',['$map','DataStandardId'],['s',this.resDataStandard]];
					},this)
				}
			},this)
			form.initPanel();
			form.on("winShow",function(){
				if(form.op == "create"){
					var data = {
						DataStandardId:this.resDataStandard
					};
					if(this.selectedNode.text.length != 0){
						data.ParentCatalogId = {key:this.selectedNode.attributes.key,text:this.selectedNode.text}
					}
					form.initFormData(data)
				}
			},this)
			form.on("save",function(a,b,c,d){
				if(b == "update"){
					this.selectedNode.setText(d["CatalogName"]);
				}
				if(b == "create"){
					var n = this.selectedNode.appendChild({
						id:d["CatalogKey"],
						text:d["CatalogName"],
						leaf:false
					});
					n.attributes.key = c.body["CatalogId"];
					n.expand();
				}				
				this.catalogFrom.getWin().hide();
			},this)
			this.catalogFrom = form;
		}
		Ext.apply(form,{
			selectedNode:this.selectedNode
		})
		return form;
	},
	getDataSetForm:function(){
		var form = this.dataSetForm;
		if(!form){
			form = new app.modules.form.TableFormView({
				entryName:"RES_DataSet",
				saveServiceId:"dataSetCatalogSave",
				width:700,
				autoLoadSchema:false,
				actions:[
					{id:"save",name:"确定"},
					{id:"cancel",name:"取消",iconCls:"common_cancel"}
				]
			})
			form.on("addfield",function(f,it){
				if(it.id == "Catalog"){
					f.tree.getLoader().on("beforeload",function(loader){
						loader.dic.filter = ['eq',['$map','DataStandardId'],['s',this.resDataStandard]];
					},this)
				}
			},this)			
			form.initPanel();
			form.on("winShow",function(){
				if(form.op == "create"){
					form.doNew();
					form.initFormData({
						DataStandardId:this.resDataStandard,
						Catalog:{key:this.selectedNode.attributes.key,text:this.selectedNode.text}
					})
				}
			},this)
			form.validateXML=this.validateXML
			form.on("beforeSave",function(a,b,c){
				var r=this.validateXML(c.DataSetMapping)
				if(r.error_code==0||c.DataSetMapping==""){
					return true;
				}
				c.DataSetMapping=null;
				Ext.Msg.alert("提示","映射内容语法有误")
				return false
			})
			form.on("save",function(a,b,c,d){
				if(b == "update"){
					this.selectedNode.setText(d["DName"]);
				}
				if(b == "create"){
					var node = this.selectedNode.appendChild({
						text:d["DName"],
						leaf:true
					});
					node.attributes.key = d["DataSetId"]
				}				
				this.dataSetForm.getWin().hide();
			},this)
			this.dataSetForm = form;
		}
		return form;
	},
	onTreeNotifyDrop:function(){
		
	},
	onDBClick:function(view,index,htmlNode,e){
		var r = view.getRecord(htmlNode);
		if(r.data["RefType"] == 'G'){
			this.onNodeClick2({id:r.data["DataGroupId"]})
		}
		if(r.data["RefType"] == 'E'){
			if(!r.data["DataSetContentId"]){
				return;
			}
			if(!this.def){
				this.doAddDataElement();
			}
			this.def.initDataId = r.data["DataElementId"];
			this.def.initDataBody = {
				DataSetContentId:r.data["DataSetContentId"]
			};
			this.def.loadData();
			this.def.getWin().setTitle(r.data["DName"]+"-修改");
			if(this.def.getWin().hidden){
				this.def.getWin().show();
			}
		}
	},
	//为了在同一个dataview里显示数据组下面的数据元信息
	onNodeClick2:function(node,e){
		this.requestData.entryName1 = "RES_DataGroup4Group";
		this.requestData.entryName2 = "RES_DataElement4Group";
		var cnd = ['eq',['$','b.DataGroupId'],['s',node.id]];
		if(this.initCnd){
			cnd = ['and',this.initCnd,cnd]
		}
		this.requestData.cnd = cnd;
		this.resetFirstPage();
		this.refresh();
	},
	onNodeClick:function(node,e){
		if(!node.isLeaf()){
			return;
		}
		this.requestData.entryName1 = this.entryName1;
		this.requestData.entryName2 = this.entryName2;
		var cnd = ['eq',['$',this.clickField],['s',node.attributes.key]];
		if(this.initCnd){
			cnd = ['and',this.initCnd,cnd]
		}
		this.requestData.cnd = cnd;
		this.resetFirstPage();
		this.refresh();
	},
	onSearchSelect:function(cb,r,i){
		this.requestData.entryName1 = "RES_DataGroup4Group";
		this.requestData.entryName2 = "RES_DataElement4Group";
		this.refresh();
	},
	fireSearchStore:function(search, store){
		 store.on("beforeload",function(){
	    	var cnd = ['like',['$','a.DName'],['s','%'+search.getValue()+'%']];
			if(this.initCnd){
				cnd = ['and',this.initCnd,cnd]
			}
			this.searchRequestData.cnd = cnd;
			this.requestData.cnd = cnd;
		},this)
	},
	reset:function(){
		var rds = this.resDataStandard;
		var loader = this.wp.getLoader();
		loader.load(this.wp.getRootNode());
		this.initCnd = ['eq',['$','DataStandardId'],['s',rds]];
		this.requestData.cnd = this.initCnd;
		this.clear();
		this.wp.getSelectionModel().clearSelections();
		if(this.catalogFrom){
			var tree = this.catalogFrom.initPanel().getForm().findField("ParentCatalogId").tree;
			tree.getLoader().load(tree.getRootNode());
		}
		if(this.dataSetForm){
			var tree = this.dataSetForm.initPanel().getForm().findField("Catalog").tree;
			tree.getLoader().load(tree.getRootNode());
		}
	},
	selectedSuccess:function(){
		this.refresh();
	},
	onWinShow:function(w,v){
		if(!this.loadOnShow){
			this.loadOnShow = true;
		}else{
			var p = v.westPanel.getLayout().activeItem;
			p.getLoader().load(p.getRootNode());
		}
	},
	doAdd:function(){
		var n = this.wp.getSelectionModel().getSelectedNode();
		if(!n || !n.isLeaf()){
			Ext.MessageBox.alert("提示","请先选择左边菜单中您想要加入元素的数据集。")
			return;
		}
		var view = this.getJoinPanel();
		if(this.resDataStandard != view.resDataStandard){
			Ext.apply(view,{
				resDataStandard:this.resDataStandard
			})
			view.reset();
		}
		var win = view.getWin();
		win.setTitle("["+n.text+"]数据元、数据组选取")
		this.selectedJoinId = n.attributes.key
		win.show();
	},
	getJoinPanel:function(){
		var view = this.selectedView;
		if(!view){
			view = new sys.data.element.DataElementView({
				hideToolbars:true,
				allowMutiSelected:true,
				resDataStandard:this.resDataStandard,
				selectedScope:this,
				joinSchema:this.joinSchema,
				needAttachmentNode:true
			});
			view.on("winShow",this.onWinShow,this)
			this.selectedView = view;
		}
		return view;
	},
	doRemove:function(){
		var rs = this.view.getSelectedRecords();
		if(rs.length < 1){
			Ext.MessageBox.alert("提示","请先选择列表中的数据元。")
			return;
		}
		var body = [];
		var name = "";
		for(var i=0;i<rs.length;i++){
			body.push(rs[i].data);
			name += (" "+rs[i].data.DName +" ");
		}
		Ext.Msg.show({
		   title: '确认删除记录[' + name + ']',
		   msg: '删除操作将无法恢复，是否继续?',
		   modal:true,
		   width: 300,
		   buttons: Ext.MessageBox.OKCANCEL,
		   multiline: false,
		   fn: function(btn, text){
		   	 if(btn == "ok"){
		   	 	this.processRemove(body);
		   	 }
		   },
		   scope:this
		})
	},
	processRemove:function(body){
		util.rmi.jsonRequest({
				serviceId:"dataJoinService",
				schema:this.joinSchema,
				op:"remove",
				body:body
			},
			function(code,msg,json){
				if(code == 200){
					this.refresh();
				}
			},
			this)
	},
	validateXML : function(xmlContent) {
			// errorCode 0是xml正确，1是xml错误，2是无法验证
			var xmlDoc, errorMessage, errorCode = 0;
			// code for IE
			if (window.ActiveXObject) {
				xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
				xmlDoc.async = "false";
				xmlDoc.loadXML(xmlContent);

				if (xmlDoc.parseError.errorCode != 0) {
					errorMessage = "错误code: " + xmlDoc.parseError.errorCode
							+ "\n";
					errorMessage = errorMessage + "错误原因: "
							+ xmlDoc.parseError.reason;
					errorMessage = errorMessage + "错误位置: "
							+ xmlDoc.parseError.line;
					errorCode = 1;
				} else {
					errorMessage = "格式正确";
				}
			}
			// code for Mozilla, Firefox, Opera, chrome, safari,etc.
			else if (document.implementation.createDocument) {
				var parser = new DOMParser();
				xmlDoc = parser.parseFromString(xmlContent, "text/xml");
				var error = xmlDoc.getElementsByTagName("parsererror");
				if (error.length > 0) {
					if (xmlDoc.documentElement.nodeName == "parsererror") {
						errorCode = 1;
						errorMessage = xmlDoc.documentElement.childNodes[0].nodeValue;
					} else {
						errorCode = 1;
						errorMessage = xmlDoc
								.getElementsByTagName("parsererror")[0].innerHTML;
					}
				} else {
					errorMessage = "格式正确";
				}
			} else {
				errorCode = 2;
				errorMessage = "浏览器不支持验证，无法验证xml正确性";
			}
			return {
				"msg" : errorMessage,
				"error_code" : errorCode
			}
		}
});
