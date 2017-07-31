$package("app.modules.chart")
$import("app.modules.chart.DiggerCardWraper",
"org.ext2.ux.portal.Portal",
"org.ext2.ux.portal.MaximizeTool",
"util.dictionary.DictionaryLoader"
)
// @@ 周蛋蛋个山花开~~
app.modules.chart.ChartPortal = function(cfg) {
	this.portlets = {}
	this.portletModules = {}
	this.colCount = 2;
	this.rowCount = 2;
	this.maxCount=6;
	this.entryNames = cfg.entryNames
			|| ["EHR_grjds_year","EHR_grjds_unit","MHC_ycglrs_year","MHC_ycglrs_unit"];
	this.tips=[
		'如果打开统计图速度过慢请换用火狐或者chrome等非IE内核浏览器浏览',
		'如果同时打开多个统计图可能会出现加载缓慢的现象,请耐心等待',
		'如果点击打开的树节点是目录则加载该目录下所有统计图,如果点击打开的树节点是子节点则只加载该节点(业务)对应的统计图',
		'如果点击树节点后没有任何反应表示该节点(业务)对应的统计图已经被打开,请不要重复点击'
	];
	app.modules.chart.ChartPortal.superclass.constructor.apply(this, [cfg])
}

Ext.extend(app.modules.chart.ChartPortal, app.desktop.Module, {
			// override
			initPanel : function() {
				var myPage = this.myPage
				var cfg = {}
				cfg.items = []
				cfg.title = this.title
				cfg.border = false
				cfg.bodyStyle = 'padding:5px 0px 0px 0px'
				cfg.tbar = [{
							text : "关闭所有面板",
							iconCls : "common_closeall",
							handler : this.doClose,
							scope : this
						}, new Ext.Toolbar.TextItem({
									text :'＊小贴士：'+this.tips[Math.round(Math.random()*3)] ,
									style : 'color:#15428B'
								})
				]
				this.panel = new Ext.ux.Portal(cfg)
				var dic = util.dictionary.DictionaryLoader.load({
							id : this.navField || "statisticalAnalysis"
						})
				this.dic=dic;
				for (var j = 0; j < this.entryNames.length; j++) {
					for (var i = 0; i < dic.items.length; i++) {
						var it = dic.items[i]
						if (it.key== this.entryNames[j]) {
							this.addPortlet({
										id : it.key,
										entryName : it.entryName
									}, {
										path : it.path,
										KPICode : it.kpicode,
										title : encodeURI(encodeURI(it.title)),
										subtitle : "(按" + it.text + ")"
									});
							break;
						}
					}
				}
				for (var i = 0; i < this.entryNames.length; i++) {
					this.addPortlet(this.entryNames[i]);
				}
				return this.panel;
			},
			
			//public 
			addPortlets:function(entrys,param){
				this.panel.el.mask("加载中...", "x-mask-loading");
				if(entrys.length>1)
					this.doClose();
				for(var i=0;i<entrys.length;i++){
					this.addPortlet(entrys[i],param[i])
				}
				this.panel.el.unmask();
			},
			
			addPortletByParent:function(parentID){
				this.panel.el.mask("加载中...", "x-mask-loading");
				this.doClose();
				for (var i = 0; i < this.dic.items.length; i++) {
						var it = this.dic.items[i]
						if (it.parent==parentID
							|| it.key.indexOf(parentID)>-1 ) {
							this.addPortlet({
										id : it.key,
										entryName : it.entryName
									}, {
										path : it.path,
										KPICode : it.kpicode,
										KPICode2:it.kpicode2,
										title : encodeURI(encodeURI(it.title)),
										subtitle : "(按" + it.text + ")"
									});
						}
				}
				this.panel.el.unmask();
			},
			
			//public
			addPortlet : function(entryName,param) {
				var id=entryName.id || entryName;
				if(!entryName || 
					this.portlets[id]){
					return;
				}
				
				if (this.panel.items.length >= this.maxCount) {
					for (var k in this.portlets) {
						if (!this.portlets[k])
							continue;
						this.portlets[k].ownerCt.destroy();
						this.portlets[k] = undefined;
						break;
					}
				}
				var column = {
					columnWidth : 1 / this.colCount,
					style : 'padding:0px 2px 0px 2px',
					items : []
				}
				var cfg={
					entryName : entryName.entryName || entryName,
					cndHidden:true,
					title : param?decodeURI(decodeURI(param.title))+param.subtitle:param,
					exQueryParam:{}
				}
				for(var k in param){
					cfg.exQueryParam[k]=param[k]
				}
				var chartView = new app.modules.chart.DiggerCardWraper(cfg);
				var portlet = this.getPortlet(chartView);
				portlet.entryName=entryName;
				portlet.on("expand", this.onPortletExpand, this);
				portlet.on("destroy",this.onPortletDestroy,this);
				column.items.push(portlet);
				this.portlets[id] = portlet;
				this.panel.add(column);
				this.panel.doLayout();
				//chartView.currentView.setCndVisible(false);
			},
			
			//public 
			setChartParam:function(param){
			},
			
			//private
			doSave:function(){
				for(var i=0; i <this.panel.getTopToolbar().items.getCount();i++){
					if(this.panel.getTopToolbar().items.item(i).name=="maxCount"){
						this.maxCount=this.panel.getTopToolbar().items.item(i).getValue();
					}
				}
			},
			
			//private
			doClose:function(){
				for(var k in this.portlets){
					if(!this.portlets[k]) continue;
					this.portlets[k].ownerCt.destroy();
					this.portlets[k]=undefined;
				}
			},
			
			//private
			onPortletDestroy:function(panel){
				var id=panel.entryName.id || panel.entryName;
				this.portlets[id]=null;
				//alert(this.portlets[entryName]);
				//alert(panel.entryName)
			},
			
			//private
			onPortletExpand:function(panel){
				panel.doLayout();
			},

			//private
			getPortlet : function(module) {
				var p = module.initPanel()
				p.frame = false
				return new Ext.ux.Portlet({
							title : module.title,
							height : 240,
							width : '110%',
							layout : "fit",
							plugins : new Ext.ux.MaximizeTool(),
							items : p,
							_m: module
						})
			},
			
			// override
			getWin : function() {
				var win = this.win
				if (!win) {
					var cfg = {
						id : this.id,
						title : this.title,
						width : this.width,
						height : this.height,
						iconCls : 'bogus',
						shim : true,
						layout : "fit",
						items : this.initPanel(),
						animCollapse : true,
						constrainHeader : true,
						minimizable : true,
						maximizable : true,
						shadow : false
					}
					if (!this.mainApp) {
						cfg.closeAction = 'hide'
					}
					win = new Ext.Window(cfg)
					win.on("resize", this.onWinResize, this)
					win.on("show", function() {
								jsReady = true;
							});
					// win.on("show",this.initMap,this)
					var renderToEl = this.getRenderToEl()
					if (renderToEl) {
						win.render(renderToEl)
					}
					this.win = win
				}
				return win
			},
			onWinResize : function() {
			}

		})
