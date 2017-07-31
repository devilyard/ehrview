$package("sys.data.element")

$styleSheet("sys.data.element.go")
$import("app.lang.UIModule",
	"util.dictionary.TreeDicFactory",
	"org.ext.ux.ProgressBarPager",
	"util.schema.SchemaLoader",
	"app.modules.form.TableFormView")

sys.data.element.DataElementView = function(cfg) {
	this.westTree = "resDataGroup";
	this.entryName1 = "RES_DataGroup4Group";
	this.entryName2 = "RES_DataElement4Group";
	this.clickField = "b.DataGroupId";
	this.clickFieldFix = "bDataGroupId";
	this.dataElementSaveService = "dataElementSave";
	this.dataElementLoadService = "dataElementLoad";
	this.allowMutiSelected = false;
	this.joinSchema = "RES_DataGroupContent";
	this.initCnd = ['eq',['$','DataStandardId'],['s',cfg.resDataStandard]];
	this.searchRequestData = {
		serviceId:"elementAndGroupQuery",
		pageSize:this.pageSize || 10,
		pageNo:1,
		cnd:this.initCnd,
		entryName1:"RES_DataGroup4Group",
		entryName2:"RES_DataElement4Group"
	};
	this.searchBars = ['搜索:',this.createSearchField()];
	this.tbars = ['->',
		{text:"加入",iconCls:"add",handler:this.doAdd,scope:this},'-',
		{text:"新增数据元",iconCls:"add",handler:this.doAddDataElement,scope:this},'-',
		{text:"修改",iconCls:"update",handler:this.doUpdate,scope:this},'-',
		{text:"删除",iconCls:"remove",handler:this.doRemove,scope:this}
	];
	this.requestData = {
		serviceId:"elementAndGroupQuery",
		pageSize:this.pageSize || 25,
		pageNo:1,
		cnd:this.initCnd,
		entryName1:this.entryName1,
		entryName2:this.entryName2
	};
	this.loadOnShow = false;
	this.needAttachmentNode = true;
	sys.data.element.DataElementView.superclass.constructor.apply(this, [cfg]);
}
Ext.extend(sys.data.element.DataElementView, app.lang.UIModule, {
	initPanel:function(){
		if(this.panel){
			return this.panel;
		}
		var westPanel = this.getWestPanel()
		westPanel.region = "west";
		var store = this.getStore();
		var cfg = {
			multiSelect:this.allowMutiSelected,
			autoScroll:true,
			singleSelect:true,
			tpl:this.getTpl(),
			store:store,
			cls:"data-element-item-own",
			itemSelector:"div.data-item",
			overClass:'data-item-over',
	        selectedClass:"data-item-selected",
	        loadingText:"正在加载数据..." 
		}
		if(this.viewDDGroup){
			cfg.ddGroup = this.viewDDGroup;
			cfg.enableDragDrop = true
		}
		var view = new Ext.DataView(cfg);
		view.on({
			dblclick:this.onDBClick,
			scope:this
		})
		this.view = view;
		var panel = new Ext.Panel({
			layout:"border",
			items:[westPanel,{
				region:"center",
				layout:"fit",
				items:view,
				tbar:this.hideToolbars?this.searchBars:this.searchBars.concat(this.tbars),
				bbar:this.getPagingToolBar()
			}]
		})
		this.panel = panel;
		return panel;
	},
	addAttachmentNode:function(t,n){
		var root = this.S.getRootNode();
		if(n == root){
			var node = root.appendChild({
				text:"附件",
				leaf:true,
				iconCls:"new"
			})
			node.attributes.key = "attachments"
		}
	},
	getWestPanel:function(){
		var H = util.dictionary.TreeDicFactory.createTree({
			title:"文件头",
			id:this.westTree,
			keyNotUniquely:true
		});
		H.getLoader().on("beforeload",function(loader){
			loader.dic.filter = ['and',['eq',['$map','GroupType'],['s','H']],['eq',['$map','DataStandardId'],['s',this.resDataStandard]]];
		},this)
		this.H = H;
		H.on({
			click:this.onNodeClick,
			expand:this.onPanelExpand,
			containercontextmenu:this.containercontextmenu,
			contextmenu:this.onContextMenu,
			scope:this
		})
		var S = util.dictionary.TreeDicFactory.createTree({
			title:"文件体",
			id:this.westTree,
			keyNotUniquely:true
		});
		this.S = S;
		S.getLoader().on("beforeload",function(loader){
			loader.dic.filter = ['and',['eq',['$map','GroupType'],['s','S']],['eq',['$map','DataStandardId'],['s',this.resDataStandard]]];
		},this);
		if(this.needAttachmentNode){
			S.getLoader().on("load",this.addAttachmentNode,this);
		}
		S.on({
			click:this.onNodeClick,
			expand:this.onPanelExpand,
			containercontextmenu:this.containercontextmenu,
			contextmenu:this.onContextMenu,
			render:function(){
				H.expand(true);
			},
			scope:this
		})
		var west = new Ext.Panel({
			layout:'accordion',
			layoutConfig : {
				animate : true
			},
			collapsible: true,
			split:true,
			defaults:{
				autoScroll: true,
				collapsed:true
			},
			title:"目录",
			width:180,
			items:[H,S]
		});
		this.westPanel = west;
		return west
	},
	containercontextmenu:function(tree,e){
		e.stopEvent();
		if(this.selectedNode){
			this.selectedNode.unselect();
		}
		this.selectedNode = tree.getRootNode();
		var cmenu = this.midiMenus['westTreeContainerMenu']
		if(!cmenu){
			cmenu = new Ext.menu.Menu({
				items:[
					{text:"新增数据组",iconCls:"add",scope:this,handler:this.doAddDataGroup}
				]
			});
			this.midiMenus['westTreeContainerMenu'] = cmenu
		}
		cmenu.showAt([e.getPageX(),e.getPageY()]);
	},
	onContextMenu:function(node, e){
		e.stopEvent();
		if(node.attributes.key == "attachments"){
			return;
		}
		node.select();
		this.selectedNode = node;
		var cmenu = this.midiMenus['westTreeMenu']
		if(!cmenu){
			cmenu = new Ext.menu.Menu({
				items:[
					{text:"新增子数据组",iconCls:"add",scope:this,handler:this.doAddDataGroup}
				]
			});
			this.midiMenus['westTreeMenu'] = cmenu
		}
		cmenu.showAt([e.getPageX(),e.getPageY()]);
	},
	onPanelExpand:function(p){
		var cnd = ['eq',['$','a.GroupType'],['s',p.title=='文件头'?'H':'S']];
		if(this.initCnd){
			cnd = ['and',this.initCnd,cnd]
		}
		this.requestData.cnd = cnd;
		this.requestData.queryGroupOnly = true;
		this.resetFirstPage();
		this.refresh();
	},
	onDBClick:function(view,index,htmlNode,e){
		var r = view.getRecord(htmlNode);
		if(r.data["RefType"] == 'G'){
			this.onNodeClick({attributes:{key:r.data["DataGroupId"]}})
		}
		if(r.data["RefType"] == 'E'){
			if(!this.def){
				this.doAddDataElement();
			}
			this.def.initDataId = r.data["DataElementId"];
			if(r.data["DataGroupContentId"]){
				this.def.initDataBody = {
					DataGroupContentId:r.data["DataGroupContentId"]
				}
			}
			this.def.loadData();
			this.def.getWin().setTitle(r.data["DName"]+"-修改");
			if(this.def.getWin().hidden){
				this.def.getWin().show();
			}
		}
	},
	onNodeClick:function(node,e){
		this.selectedNode = node;
		if(node.attributes.key=="attachments"){
			if(this.store){
				util.rmi.jsonRequest({
					serviceId:"simpleQuery",
					schema:"RES_DataElement",
					cnd:['and',['eq',['$','DataStandardId'],['s',this.resDataStandard]],['eq',['$','StandardIdentify'],['s','$attachment']]]
				},
				function(code,msg,json){
					this.store.loadData(json)
				},this)
			}
		}else{
			var cnd = ['eq',['$',this.clickField],['s',node.attributes.key]];
			if(this.initCnd){
				cnd = ['and',this.initCnd,cnd]
			}
			this.requestData.cnd = cnd;
			this.requestData.queryGroupOnly = false;
			this.resetFirstPage();
			this.refresh();
		}
	},
	doAddDataGroup:function(){
		var dgf = this.dgf;
		if(!dgf){
			dgf = new app.modules.form.TableFormView({
				entryName:this.entryName1,
				saveServiceId:"dataGroupSave",
				loadServiceId:"dataGroupLoad",
				actions : [
					{id:"save",name:"确定"},
					{id:"cancel",name:"取消",iconCls:"common_cancel"}
				]
			});
			dgf.on({
				save:function(a,b,c,d){
					this.refresh();
					dgf.getWin().hide();
					if(b == "create"){
						this.selectedNode.leaf = false;
						var node = this.selectedNode.appendChild({
							text:d["DName"],
							iconCls:"expandall"
						});
						node.attributes.key = d["DataGroupId"];
						this.selectedNode.expand();
						node.expand();	//for set attributes DataGroupContentId
					}
					if(b == "update"){
						var p = this.westPanel.getLayout().activeItem;
						var node = p.getRootNode();
						node.cascade(function(n){
							if(node != n && n.attributes.key == d["DataGroupId"]){
								n.setText(d["DName"]);
							}
						},this)
					}
				},
				winShow:function(){
					var data = {};
					var p = this.westPanel.getLayout().activeItem
					if(p){
						data.GroupType = {key:p.title=="文件头"?"H":"S",text:p.title}
					}
					if(dgf.op == "create" && this.selectedNode){
						data.bDataGroupId = {key:this.selectedNode.attributes.key,text:this.selectedNode.text};
					}
					dgf.initFormData(data);
					dgf.form.getForm().isValid();
				},
				scope:this
			});
			var tr = dgf.form.getForm().findField(this.clickFieldFix).tree;
			tr.getLoader().on("beforeload",function(loader){
				loader.dic.filter = ['eq',['$map','DataStandardId'],['s',this.resDataStandard]];
			},this);
			this.dgf = dgf;
		}else{
			var tr = dgf.form.getForm().findField(this.clickFieldFix).tree;
			tr.getLoader().load(dgf.form.getForm().findField(this.clickFieldFix).tree.getRootNode());
		}
		dgf.getWin().setTitle("新建数据组");
		dgf.doNew();
		var data = {
			DataStandardId:this.resDataStandard
		}
		Ext.apply(dgf,{data:data});
		dgf.getWin().show();
	},
	doAddDataElement:function(btn){
		var def = this.def;
		if(!def){
			def = new app.modules.form.TableFormView({
				entryName:this.entryName2,
				saveServiceId:this.dataElementSaveService,
				loadServiceId:this.dataElementLoadService,
				actions : [
					{id:"save",name:"确定"},
					{id:"cancel",name:"取消",iconCls:"common_cancel"}
				]
			});
			def.on("save",function(){
				this.refresh();
				def.getWin().hide();
			},this)
			def.on("winShow",function(){
				if(!this.westPanel){
					return;
				}
				var p = this.westPanel.getLayout().activeItem;
				var node = p.getSelectionModel().getSelectedNode();
				var form = def.form.getForm();
				if(node && node.attributes.key!="attachments" && form){
					var f = form.findField("bDataGroupId");
					if(f){
						f.setValue({key:node.attributes.key,text:node.text});
					}
				}
				form.isValid();
			},this)
			var tr = def.form.getForm().findField(this.clickFieldFix).tree;
			tr.getLoader().on("beforeload",function(loader){
				loader.dic.filter = ['eq',['$map','DataStandardId'],['s',this.resDataStandard]];
			},this);
			this.def = def;
		}else{
			var tr = def.form.getForm().findField(this.clickFieldFix).tree;
			tr.getLoader().load(def.form.getForm().findField(this.clickFieldFix).tree.getRootNode());
		}
		def.getWin().setTitle("新建数据元");
		def.doNew();
		var data = {
			DataStandardId:this.resDataStandard
		}
		Ext.apply(def,{data:data});
		if(btn && btn.el){
			def.getWin().show(btn.el);
		}else{
			def.getWin().show();
		}
	},
	doUpdate:function(){
		var rs = this.view.getSelectedRecords();
		if(rs.length != 1){
			return;
		}
		var r = rs[0];
		if(r.data["RefType"] == 'G'){
			if(!this.dgf){
				this.doAddDataGroup();
			}
			this.dgf.initDataId = r.data["DataGroupId"];
			this.dgf.initDataBody = {
				DataGroupContentId:r.data["DataGroupContentId"]
			}
			this.dgf.doNew();
			this.dgf.loadData();
			this.dgf.getWin().setTitle(r.data["DName"]+"-修改");
			if(this.dgf.getWin().hidden){
				this.dgf.getWin().show();
			}
		}
		if(r.data["RefType"] == 'E'){
			if(!this.def){
				this.doAddDataElement();
			}
			this.def.initDataId = r.data["DataElementId"];
			this.def.initDataBody = {
				DataGroupContentId:r.data["DataGroupContentId"]
			}
			this.def.doNew();
			this.def.loadData();
			this.def.getWin().setTitle(r.data["DName"]+"-修改");
			if(this.def.getWin().hidden){
				this.def.getWin().show();
			}
		}
	},
	doRemove:function(){
		var rs = this.view.getSelectedRecords();
		if(rs.length != 1){
			return;
		}
		var r = rs[0];
		if(r.data["StandardIdentify"] == '$attachment'){
			return;
		}
		Ext.Msg.show({
		   title: '确认删除记录[' + r.data.DName + ']',
		   msg: '删除操作将无法恢复，是否继续?',
		   modal:true,
		   width: 300,
		   buttons: Ext.MessageBox.OKCANCEL,
		   multiline: false,
		   fn: function(btn, text){
		   	 if(btn == "ok"){
		   	 	this.processRemove(r);
		   	 }
		   },
		   scope:this
		})
	},
	processRemove:function(r){
		util.rmi.jsonRequest({
				serviceId:"elementAndGroupRemove",
				schema:r.data["RefType"]=="G"?this.entryName1:this.entryName2,
				pkey:r.data["RefType"]=="G"?r.data["DataGroupId"]:r.data["DataElementId"],
				DataGroupContentId:r.data["DataGroupContentId"]
			},
			function(code,msg,json){
				this.unmask()
				if(code == 200){
					this.store.remove(r);
					if(r.data["RefType"]=="G"){
						var p = this.westPanel.getLayout().activeItem;
						var node;
						if(r.data["DataGroupContentId"] == 0){ // ==0
							node = p.getRootNode().findChild("key",r.data["DataGroupId"],false);
						}else{
							node = p.getRootNode().findChild("DataGroupContentId",r.data["DataGroupContentId"],true);
						}
						if(node){
							node.remove();
						}
					}
				}
				if(code == 556){
					Ext.MessageBox.alert("错误","数据组下还有元素。")
				}
				if(code == 557){
					Ext.MessageBox.alert("错误","该数据组还存在被引用。")
				}
				if(code == 558){
					Ext.MessageBox.alert("错误","该数据元还存在被引用。")
				}
			},
			this)
	},
	getWin:function(){
		var win = this.win;
		if(!win){
			win = new Ext.Window({
				width:600*1.618,
				height:600,
				layout:"fit",
				items:this.initPanel(),
				modal:true,
				closeAction:"hide",
				buttonAlign:"center",
				buttons:[
					{text:"确定",iconCls:"save",handler:this.doSelected,scope:this},
					{text:"取消",iconCls:"common_cancel",handler:function(){
						this.win.hide();
					},scope:this}]
			});
			win.on("show",function(w){
				this.fireEvent("winShow",w,this)
			},this)
			this.win = win;
		}
		return win;
	},
	doSelected:function(){
		var rs = this.selectedScope.selectedView.view.getSelectedRecords();
		var selectedJoinId = this.selectedScope.selectedJoinId;
		if(!selectedJoinId || rs.length < 1){
			return;
		}
		var body = [];
		for(var i=0;i<rs.length;i++){
			body.push(rs[i].data);
		}
		util.rmi.jsonRequest({
				serviceId:"dataJoinService",
				schema:this.selectedScope.joinSchema,
				op:"add",
				joinId:selectedJoinId,
				body:body
			},
			function(code,msg,json){
				this.win.hide();
				if(code == 200){
					this.selectedScope.selectedSuccess();
				}
				if(code == 555){
					Ext.MessageBox.alert("错误","已经存在你选择的元素。");				
				}
			},
			this)
	},
	selectedSuccess:function(){
		var p = this.westPanel.getLayout().activeItem;
		p.getLoader().load(p.getRootNode());
		this.refresh();
	},
	doAdd:function(){
		var n = this.westPanel.getLayout().activeItem.getSelectionModel().getSelectedNode();
		if(!n || n.attributes.key=="attachments"){
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
				needAttachmentNode:false
			});
			view.on("winShow",this.onWinShow,this)
			this.selectedView = view;
		}
		return view;
	},
	onWinShow:function(w,v){
		if(!this.loadOnShow){
			this.loadOnShow = true;
		}else{
			var p = v.westPanel.getLayout().activeItem;
			p.getLoader().load(p.getRootNode());
		}
	},
	reset:function(){
		var rds = this.resDataStandard;
		var loaderH = this.H.getLoader();
		var loaderS = this.S.getLoader();
		loaderH.load(this.H.getRootNode());
		loaderS.load(this.S.getRootNode());
		this.initCnd = ['eq',['$','DataStandardId'],['s',rds]];
		this.requestData.cnd = this.initCnd;
		this.onPanelExpand(this.westPanel.getLayout().activeItem)
		this.H.getSelectionModel().clearSelections();
		this.S.getSelectionModel().clearSelections();
	},
	clear:function(){
		if(this.store){
			this.store.removeAll();
		}
	},
	resetFirstPage:function(){
		var pt = this.panel.items.itemAt(1).getBottomToolbar();
		if(pt){
			pt.cursor = 0;
		}else{
			this.requestData.pageNo = 1;
		}
	},
	refresh:function(){
		if(this.store){
			var pt = this.panel.items.itemAt(1).getBottomToolbar();
			if(pt){
				pt.doLoad(pt.cursor);
			}else
				this.store.reload();
		}
	},
	getTpl:function(){
		var tpl = new Ext.XTemplate(
			'<tpl for=".">',
				'<div class="data-item">',
					'<tpl if="DataGroupId">',
						'<div class="data-group-item">',
							'<div class="data-group-item-icon"></div>',
					'</tpl>',
					'<tpl if="DataElementId">',
						'<div class="data-element-item">',
							'<div class="data-element-item-icon"></div>',
					'</tpl>',
						'<div class="data-item-body">',
							'<div>',
								'<span style="width:340px"><b>{DName}</b></span>',
								'<span style="width:100px">{StandardIdentify}</span>',
								'<span style="width:80px">{Frequency}</span>',
								'<tpl if="DataElementId">',
									'<tpl if="DataLength">',
										'<span style="width:100px">{DataType}({DataLength})</span>',
									'</tpl>',
									'<tpl if="!DataLength">',
										'<span style="width:100px">{DataType}</span>',
									'</tpl>',
								'</tpl>',
							'</div>',
							'<div>',
								'<span style="width:440px">{CustomIdentify}</span>',
								'<tpl if="DataElementId">',
									'<span style="width:180px">{CodeSystem}</span>',
								'</tpl>',
							'</div>',
							'<div>',
								'<span style="width:620px">{DComment}</span>',
							'</div>',
						'</div>',
					'</div>',
				'</div>',
			'</tpl>'
		);
		this.tpl = tpl;
		return tpl;
	},
	createSearchField:function(){
		var reader = new Ext.data.JsonReader({
            root: 'body',
            totalProperty: 'totalCount',
            fields:['CustomIdentify','StandardIdentify','DName','DComment']
        })
		var url = ClassLoader.serverAppUrl || "";
		var proxy = new Ext.data.HttpProxy({
			url : url + '*.jsonRequest',
			method : 'post',
			jsonData : this.searchRequestData
		})
		var store = new Ext.data.Store({
			proxy: proxy,
			reader:reader
		})
		var tpl = new Ext.XTemplate(
			'<tpl for=".">',
				'<div class="data-item">',
					'<table>',
						'<tr>',
							'<td width="240">{DName}</td>',
							'<td>{StandardIdentify}</td>',
						'</tr>',
						'<tr>',
							'<td colspan="2">',
								'<tpl if="CustomIdentify">',
									'{CustomIdentify}',
								'</tpl>',
							'</td>',
						'</tr>',
					'</table>',
				'</div>',
			'</tpl>'
		)
		var search = new util.widgets.MyCombox({
	        store: store,
	        displayField:'type',
	        typeAhead: false,
	        loadingText: 'Searching...',
	        width: 420,
	        minChars:2,
	        requestData:this.searchRequestData,
//	        pageSize:10,
	        hideTrigger:true,
	        tpl: tpl,
	        itemSelector: 'div.data-item'
	    })
		search.on("select",this.onSearchSelect,this)
	    store.on("beforeload", function() {
			var cnd = ['like', ['$', 'a.DName'],	['s', '%' + search.getValue() + '%']];
			if (this.initCnd) {
				cnd = ['and', this.initCnd, cnd]
			}
			this.searchRequestData.cnd = cnd;
			this.requestData.cnd = cnd;
		}, this)
	    return search
	},
	onSearchSelect:function(cb,r,i){
		this.requestData.queryGroupOnly = false;
		this.refresh();
	},
	getPagingToolBar:function(){
		var ptb = new util.widgets.MyPagingToolbar({
			store: this.store || this.getStore(),
			requestData:this.requestData,
			displayInfo: true,
			emptyMsg:"无相关记录"	,
			plugins: new Ext.ux.ProgressBarPager()
		});
		return ptb;
	},
	getStore:function(){
		var g = util.schema.loadSync("RES_DataGroup4Group").schema.items
		var e = util.schema.loadSync("RES_DataElement4Group").schema.items
		var gs = util.schema.loadSync("RES_DataGroup4Set").schema.items
		var es = util.schema.loadSync("RES_DataElement4Set").schema.items
		var items = g.concat(e).concat(gs).concat(es);
		for(var i=0;i<items.length;i++){
			items[i].name = items[i].id
		}
		var reader = new Ext.data.JsonReader({
            root: 'body',
            totalProperty: 'totalCount',
            fields:items
        })
		var url = ClassLoader.serverAppUrl || "";
		var proxy = new Ext.data.HttpProxy({
			url : url + '*.jsonRequest',
			method : 'post',
			jsonData : this.requestData
		})
		var store = new Ext.data.Store({
			proxy: proxy,
			reader:reader
//			,
//			autoLoad:true
		})
		this.store = store;
		return store;
	}
});
