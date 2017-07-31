$package("app.modules.list")
$import("app.desktop.Module")

app.modules.list.PrintWin = function(cfg) {
	app.modules.list.PrintWin.superclass.constructor.apply(this, [cfg])
}
Ext.extend(app.modules.list.PrintWin, app.desktop.Module, {
	initPanel:function(){
		var printForm = new Ext.FormPanel({
			frame: true,
			labelWidth: 75,
			defaults: {width: '95%'},
			shadow:true,
			items: new util.widgets.MyRadioGroup({
				hideLabel:true,
	            value:'single',
	            items: [
	                {boxLabel: '当前页', name: 'gird-print-1',inputValue:'single'},
	                {boxLabel: '全部页', name: 'gird-print-1',inputValue:'whole'}
	            ]   	
			})
		})
		this.printPage = printForm.items.itemAt(0)
		return printForm
	},
	printPreview:function(btn){
		var page = this.printPage.getValue()
		var type = 0
		if(btn && btn.iconCls){
			if(btn.iconCls=="print"){
				type = 1
			}else if(btn.iconCls=="doc"){
				type = 2
			}else if(btn.iconCls=="excel"){
				type = 3
			}
		}
		var cm = this.cm
		var cos = cm.getColumnsBy(function(c){
  			return !c.hidden;
		})
		var cname = []
		for(var i=0;i<cos.length;i++){
			cname.push(cos[i].dataIndex)
		}
		var printConfig = {
			title:this.title,
			page:page,
			requestData:this.requestData,
			cname:cname
		}
		var url ="list.print?type="+type+"&config="+encodeURI(encodeURI(Ext.encode(printConfig)))
		var printWin = window.open(url,"","height="+(screen.height-100)+", width="+(screen.width-10)+", top=0, left=0, toolbar=no, menubar=yes, scrollbars=yes, resizable=yes,location=no, status=no")
		return printWin
	},
	getWin:function(){
		var win = this.win
		if(!win){
			win = new Ext.Window({
				title:"打印设置",
				width:360,
				closeAction:"hide",
				items:this.initPanel(),
				tbar:[{
					text:"打印预览",
					iconCls:"print",
					handler:this.printPreview,
					scope:this
				},{
					text:"WORD",
					iconCls:"doc",
					handler:this.printPreview,
					scope:this
				},{
					text:"PDF",
					iconCls:"pdf",
					handler:this.printPreview,
					scope:this
				},{
					text:"EXCEL",
					iconCls:"excel",
					handler:this.printPreview,
					scope:this
				}]
			})
			var renderToEl = this.getRenderToEl()
			if (renderToEl) {
				win.render(renderToEl)
			}
			win.on("add", function() {
				this.win.doLayout()
			}, this)
			this.win = win
		}
		return win
	}
})