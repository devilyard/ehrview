$package("app.modules.form")
$import(
	"util.Accredit",
	"app.modules.form.SimpleFormView"
)
app.modules.form.TabFormView = function(cfg){
	this.width = 650;
	this.colCount = 2
	app.modules.form.TabFormView.superclass.constructor.apply(this,[cfg])
}
Ext.extend(app.modules.form.TabFormView, app.modules.form.SimpleFormView,{
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
		var cfg = {
			buttonAlign:"center",
			labelAlign:this.labelAlign || "right",
			labelWidth:this.labelWidth || 80,
			border:false,
			frame: true,
			autoHeight:true,
			autoWidth:true,
			shadow:true
		}
		this.initBars(cfg);
		this.form = new Ext.FormPanel(cfg)
		this.form.on("render",this.onReady,this)
		var groups;
		if(this.colCount == 1){
			groups = this.createSingleLayout();
		}
		else{
			groups = this.createColLayout();
		}
		var tab = new Ext.TabPanel({
			border:false,
            activeTab:0,
            frame:true,
    		autoHeight:true,
    		deferredRender:false,
            defaults:{border:false,bodyStyle:'padding:10px',autoHeight:true,autoWidth:true}
		})
		
		for(s in groups){
			var title = s
			if(s == "_default"){
				title = "基本信息"
			}
			var g =  groups[s]
			g.title = title
			tab.add(groups[s])
		}
		this.form.add(tab)
		this.setKeyReadOnly(true)
		if(!this.isCombined){
			this.addPanelToWin();
		}
		return this.form
	},
	createSingleLayout:function(){
		var ac =  util.Accredit;
		var defaultWidth = this.fldDefaultWidth || 200
		var items = this.schema.items
		var groups = {}
		groups["_default"] = {
				border:false,
				frame:true,
				layout:"form",
				defaultType : 'textfield',
				autoWidth:true,
				title:title,
				items:[]
			}
		for(var i = 0; i <items.length; i ++){
			var it = items[i]
			if((it.display == 0 || it.display == 1)  || !ac.canRead(it.acValue)){
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
					groups[gname] = {
						border:false,
						frame:true,
						layout:"form",
						defaultType : 'textfield',
						autoWidth:true,
						title:title,
						items:[]
					};
				}
			}
			else{
				gname = "_default"
			}
			groups[gname].items.push(f)
		}
		return groups;
	},
	createColLayout:function(items){
		var ac =  util.Accredit;
		var items = this.schema.items
		var colCount = this.colCount;
		var groups = {}
		var groupsCount = {};
		groups["_default"] = this.createColTab()
		groupsCount["_default"] = 0;
		
		for(var i = 0; i <items.length; i ++){
			var it = items[i]
			if((it.display == 0 || it.display == 1)  || !ac.canRead(it.acValue)){
				continue;
			}
			var f = this.createField(it)
			delete f.width
			f.index = i;
			f.anchor = '98%'
			if(!this.fireEvent("addfield",f,it)){
				continue;
			}			
			var gname = it.group
			if(gname){
				if(!groups[gname]){
					groups[gname] = this.createColTab();
					groupsCount[gname] = 0;
				}
			}
			else{
				gname = "_default"
			}
			var colTab = groups[gname]
			var colIndex = groupsCount[gname];
			colTab.items[colIndex].items.push(f);
			colIndex ++;
			if(colIndex == colCount){
				colIndex = 0;
			}
			groupsCount[gname] = colIndex;
		}
		return groups;
	},
	createColTab:function(){
		var colCount = this.colCount;
		var colAnchor= parseFloat(1/this.colCount).toFixed(2);
		var col = [];
		for(var i = 0; i < colCount; i ++){
			col.push({
				columnWidth:colAnchor,
                layout: 'form',
                border:false,
				frame: false,
				defaultType: 'textfield',
				autoHeight:true,
                items:[]
			})
		}
		return {layout:'column',frame:true,items:col,autoWidth:true} 
	}
});