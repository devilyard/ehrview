/**
* @include "SimpleListView.js"
*/
$package("app.modules.list")

$import("app.modules.list.SimpleListView")
/**
 * @class app.modules.list.SelectListView
 * @extends app.modules.list.SimpleListView
 *
 * @constructor
 * Creates a new Field
 * @param {Object} config Configuration options
 */
app.modules.list.SelectListView = function(cfg){
	this.width = 620;
	this.mutiSelect = cfg.mutiSelect || true;
	this.checkOnly = cfg.checkOnly || false;
	this.actions = [
			{id:"confirmSelect",name:"确定",iconCls:"read"},
			{id:"showOnlySelected",name:"查看已选",iconCls:"update"}
	]
	app.modules.list.SelectListView.superclass.constructor.apply(this,[cfg])
}
Ext.extend(app.modules.list.SelectListView, app.modules.list.SimpleListView,{
	
	init:function(){
		this.addEvents({
			"select":true
		})
		if(this.mutiSelect){
			this.selectFirst = false
		}
		this.selects = {}
		this.singleSelect = {}
		app.modules.list.SelectListView.superclass.init.call(this)
	},
	initPanel:function(schema){
		return app.modules.list.SelectListView.superclass.initPanel.call(this,schema)
	},
	onStoreLoadData:function(store,records,ops){
		app.modules.list.SelectListView.superclass.onStoreLoadData.call(this,store,records,ops)
		if(records.length == 0 ||  !this.selects || !this.mutiSelect){
			return
		}
		var selRecords = []
		for(var id in this.selects){
			var r = store.getById(id)
			if(r){
				selRecords.push(r)
			}
		}
		this.grid.getSelectionModel().selectRecords(selRecords)
		
	},
	getCM:function(items){
		var cm = app.modules.list.SelectListView.superclass.getCM.call(this,items)
		var sm = new Ext.grid.CheckboxSelectionModel({
			checkOnly:this.checkOnly,
			singleSelect:!this.mutiSelect
		})
		this.sm = sm
		sm.on("rowselect",function(sm,rowIndex,record){
			if(this.mutiSelect){
				this.selects[record.id] = record
			}
			else{
				this.singleSelect = record
			}
		},this)
		sm.on("rowdeselect",function(sm,rowIndex,record){
			if(this.mutiSelect){
				delete this.selects[record.id]
			}
		},this)
		return [sm].concat(cm)
	},
	onDblClick:function(grid,index,e){
		this.doConfirmSelect()
	},
	clearSelect:function(){
		this.selects = {};
		this.singleSelect = {};
		this.sm.clearSelections();
		Ext.fly(this.grid.getView().innerHd).child('.x-grid3-hd-checker').removeClass('x-grid3-hd-checker-on');
	},
	doConfirmSelect:function(){
		this.fireEvent("select",this.getSelectedRecords(),this)
		this.clearSelect();
		this.win.hide()
	},
	doShowOnlySelected:function(){
		this.store.removeAll()
		var records = this.getSelectedRecords()
		this.store.add(records)
		this.grid.getSelectionModel().selectRecords(records)
	},
	getSelectedRecords:function(){
		var records = []
		if(this.mutiSelect){
			for(var id in this.selects){
				records.push(this.selects[id])
			}
		}
		else{
			records[0] = this.singleSelect
		}
		return records
	}
});