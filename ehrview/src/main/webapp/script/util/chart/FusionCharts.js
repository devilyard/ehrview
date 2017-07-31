/**
 * FusionCharts: Flash Player detection and Chart embed 
 * 
 * Morphed from SWFObject (http://blog.deconcept.com/swfobject/) under MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 */
$package("util.chart")
$import("util.chart.FusionChartsUtil")

util.chart.FusionCharts = function(swf, id, w, h, debugMode, registerWithJS, c, scaleMode, lang){
	if (!document.getElementById) { return; }
	
	//Flag to see whether data has been set initially
	this.initialDataSet = false;
	
	//Create container objects
	this.params = new Object();
	this.variables = new Object();
	this.attributes = new Array();
	this.i18nTexts = util.chart.FusionCharts.i18nTexts;
	//Set attributes for the SWF
	swf = this.getOffsetSwf(swf)  //added by sean
	if(swf) { this.setAttribute('swf',swf ); }
	if(id) { this.setAttribute('id', id); }
	if(w) { this.setAttribute('width', w); }
	if(h) { this.setAttribute('height', h); }
	
	//Set background color
	if(c) { this.addParam('bgcolor', c); }
	
	//Set Quality	
	this.addParam('quality', 'high');
	
	this.addParam('wmode','Opaque') //added by 2562
	//this.addParam('wmode','transparent');
	//Add scripting access parameter
	this.addParam('allowScriptAccess', 'always');
	
	//Pass width and height to be appended as chartWidth and chartHeight
	this.addVariable('chartWidth', w);
	this.addVariable('chartHeight', h);

	//Whether in debug mode
	debugMode = debugMode ? debugMode : 0;
	this.addVariable('debugMode', debugMode);
	//Pass DOM ID to Chart
	this.addVariable('DOMId', id);
	//Whether to registed with JavaScript
	
	registerWithJS = registerWithJS ? registerWithJS : 0;
	this.addVariable('registerWithJS', registerWithJS);
	
	//Scale Mode of chart
	scaleMode = scaleMode ? scaleMode : 'noScale';
	this.addVariable('scaleMode', scaleMode);
	//Application Message Language
	lang = lang ? lang : 'EN';
	this.addVariable('lang', lang);
}

util.chart.FusionCharts.prototype = {
	getOffsetSwf:function(name){ //added by sean
		var catalog = 'chart'
		var offsetPath = ClassLoader.appRootOffsetPath
		if(name.indexOf('.') > -1){
			name = name.split(".")
			catalog = name[0]
			name = name[1]
		}
		var url = offsetPath + "component/fusioncharts/" + catalog +  "/" + name + ".swf"
		var t = this.i18nTexts
		var pms = [];
		for(var nm in t){
			var q = nm + "=" + t[nm]
			pms.push(q)
		}
		if(pms.length > 0){
			url += "?" + pms.join("&")
		}
		return url;
	},
	setLocaleText:function(name,value){
		var t = this.i18nTexts
		t[name] = value;
	},
	setAttribute: function(name, value){
		this.attributes[name] = value;
	},
	getAttribute: function(name){
		return this.attributes[name];
	},
	addParam: function(name, value){
		this.params[name] = value;
	},
	getParams: function(){
		return this.params;
	},
	addVariable: function(name, value){
		this.variables[name] = value;
	},
	getVariable: function(name){
		return this.variables[name];
	},
	getVariables: function(){
		return this.variables;
	},
	getVariablePairs: function(){
		var variablePairs = new Array();
		var key;
		var variables = this.getVariables();
		for(key in variables){
			variablePairs.push(key +"="+ variables[key]);
		}
		return variablePairs;
	},
	getSWFHTML: function() {
		var swfNode = "";
		if (navigator.plugins && navigator.mimeTypes && navigator.mimeTypes.length) { 
			// netscape plugin architecture			
			swfNode = '<embed type="application/x-shockwave-flash" src="'+ this.getAttribute('swf') +'" width="'+ this.getAttribute('width') +'" height="'+ this.getAttribute('height') +'"  ';
			swfNode += ' id="'+ this.getAttribute('id') +'" name="'+ this.getAttribute('id') +'" ';
			var params = this.getParams();
			for(var key in params){ 
				swfNode += [key] +'="'+ params[key] +'" '; 
			}
			var pairs = this.getVariablePairs().join("&");
			if (pairs.length > 0){ 
				swfNode += 'flashvars="'+ pairs +'"'; 
			}
			swfNode += '/>';
		} else { // PC IE			
			swfNode = '<object id="'+ this.getAttribute('id') +'" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="'+ this.getAttribute('width') +'" height="'+ this.getAttribute('height') +'">';
			swfNode += '<param name="movie" value="'+ this.getAttribute('swf') +'" />';
			var params = this.getParams();
			for(var key in params) {
			 swfNode += '<param name="'+ key +'" value="'+ params[key] +'" />';
			}
			var pairs = this.getVariablePairs().join("&");			
			if(pairs.length > 0) {
				swfNode += '<param name="flashvars" value="'+ pairs +'" />';
			}
			swfNode += "</object>";
		}
		return swfNode;
	},
	setDataURL: function(strDataURL){
		//This method sets the data URL for the chart.
		//If being set initially
		var time = new Date().getTime()
		
		if(strDataURL.indexOf("?") > -1){
			strDataURL += "@time;" + time;
		}
		else{
			strDataURL += "?temp=" + time;
		}
		if (this.initialDataSet==false){
			this.addVariable('dataURL',strDataURL);
			//Update flag
			this.initialDataSet = true;
		}else{
			//Else, we update the chart data using External Interface
			//Get reference to chart object
			var chartObj = util.chart.FusionChartsUtil.getChartObject(this.getAttribute('id'));
			chartObj.setDataURL(strDataURL);
		}
	},
	setDataXML: function(strDataXML){
		//If being set initially
		
		if (this.initialDataSet==false){
			//This method sets the data XML for the chart INITIALLY.
			this.addVariable('dataXML',strDataXML);
			//Update flag
			this.initialDataSet = true;
		}else{
			//Else, we update the chart data using External Interface
			//Get reference to chart object
			var chartObj = util.chart.FusionChartsUtil.getChartObject(this.getAttribute('id'));
			chartObj.setDataXML(strDataXML);
		}
	},
	render: function(elementId){
		var n = (typeof elementId == 'string') ? document.getElementById(elementId) : elementId;
		n.innerHTML = this.getSWFHTML();
		return true;		
	},
	on:function(evt,callback,scope){
		if(typeof callback != "function"){
			return;
		}
		var chartId = this.getAttribute('id');
		if(this.un(evt,chartId,callback,scope)){}
		var ob = util.chart.FusionCharts.observers;
		var list = ob[evt]
		if(list){
			list.push({callback:callback,scope:scope,chartId:chartId})
		}

		
	},
	un:function(evt,callback,scope){
		var ob = util.chart.FusionCharts.observers;
		var list = ob[evt]
		var chartId = this.getAttribute('id');
		if(list){
			for(var i = 0;i < list.length; i ++){
				var ev = list[i]
				if(ev.callback == callback && ev.scope == scope && ev.chartId == chartId){
					list.splice(i,1)
					return true
				}
			}
		}	
		return false
	}
}

util.chart.FusionCharts.i18nTexts = {
	PBarLoadingText:"加载图表控件中...",
	XMLLoadingText:"加载数据中...",
	ParsingDataText:"解析数据中...",
	ChartNoDataText:"无可用数据...",
	RenderingChartText:"图表渲染中...",
	LoadDataErrorText:"加载数据错误...",
	InvalidXMLText:"数据格式有误..."
}

util.chart.FusionCharts.observers = {
	"render":[],
	"update":[],
	"click":[]
}

//chart event added by sean---------------------------
FC_fireEvent = function(evt,chartId){
	var ob = util.chart.FusionCharts.observers;
	var list = ob[evt]
	if(list){
		for(var i = 0;i < list.length; i ++){
			var ev = list[i]
			var chart = getChartFromId(chartId)
			if(ev.chartId == chartId){
				var args = Array.prototype.slice.call(arguments, 2)
				ev.callback.apply(typeof ev.scope == "object" ? ev.scope : chart,args)
			}
		}
	}	
}
	
FC_Rendered =function(DOMId){
	FC_fireEvent("render",DOMId)
}

FC_ChartUpdated = function(DOMId){
	FC_fireEvent("update",DOMId)
}
FC_Click = function(DOMId){
	var args = ["click"]
	args = args.concat(Array.prototype.slice.call(arguments, 0))
	FC_fireEvent.apply(this,args)
}
//+----------------------------------------------------

/* Aliases for easy usage */
getChartFromId = util.chart.FusionChartsUtil.getChartObject;
FusionCharts = util.chart.FusionCharts;