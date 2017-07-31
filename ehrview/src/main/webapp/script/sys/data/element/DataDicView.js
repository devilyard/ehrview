$package("sys.data.element")
$styleSheet("sys.data.element.go")
$import("util.dictionary.DictionaryBuilder")

sys.data.element.DataDicView = function(cfg) {
	sys.data.element.DataDicView.superclass.constructor.apply(this, [cfg])
}
Ext.extend(sys.data.element.DataDicView, util.dictionary.DictionaryBuilder, {
	initPanel:function(){
		this.dicId = "dictionaries.res."+this.resDataStandard;
		this.title = "数据字典";
		var panel=sys.data.element.DataDicView.superclass.initPanel.apply(this);
		panel.items.item(0).title="数据字典管理"
		this.tree.add(new Ext.Toolbar(["-",new Ext.form.TextField({
										width : 165,
										emptyText : '输入查询关键字',
										enableKeyEvents : true,
										listeners : {
											keyup : {
												fn : this.filterTree,
												buffer : 350,
												scope : this
											},
										scope : this
										}
								}),"-"]))
		return panel;
	},
	filterTree:function(t,e){
		var text = t.getValue();
		if(!text){
			this.tree.filter.clear();
			return;
		}
		var re = new RegExp(Ext.escapeRe(text), 'i');
		this.tree.filter.filterBy(function(n){
			return re.test(n.text);
		});
	},
	reset:function(){
		this.tree.getLoader().url = "dictionaries.res."+this.resDataStandard+".dic"
		this.tree.getLoader().load(this.tree.getRootNode());
	}
});
