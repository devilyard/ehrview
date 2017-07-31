$package("sys.monitor")
Ext.chart.Chart.CHART_URL = ClassLoader.appRootOffsetPath+'resources/charts.swf';

sys.monitor.MyChart = {
	
	getLineChart:function(store, xField, yField, tipRenderer){
		return {
			width:320,
			height:160,
			store : store,
			xtype : 'linechart',
			xField: xField,
            yField: yField,
            tipRenderer:tipRenderer 
		}
	},
	
	getPieChart:function(store, dataField, categoryField){
		return {
			width:320,
			height:160,
			store : store,
			xtype : 'piechart',
			dataField : dataField,
			categoryField : categoryField,
			extraStyle : {
				legend : {
					display : 'bottom',
					padding : 5,
					font : {
						family : 'Tahoma',
						size : 13
					}
				}
			}
		}
	}
	
}
