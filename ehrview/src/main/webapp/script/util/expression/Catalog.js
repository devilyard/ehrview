$package("util.Expression")

util.Expression.types = [
			{id:'vari',text:'变量'},
			{id:'logic',text:'逻辑表达式'},
			{id:'math',text:'数学表达式'},
			{id:'func',text:'函数',items:[
									{id:'fm',text:'数学函数'},
									{id:'fs',text:'字符串函数'},
									{id:'fd',text:'日期函数'},
									{id:'fl',text:'逻辑函数'}
								]
			}
					
		]


util.Expression.usages = {
	vari:[{
			id:'$',
			text:'字段($)',
			datatype:'string'
		},{
			id:'str',
			text:'字符串(str)',
			datatype:'string'
		},{
			id:'num',
			text:'数值(num)',
			datatype:'number'
		},{
			id:'dt',
			text:'日期(dt)',
			datatype:'date'
		}
	],
	logic:[{
			id:'and',
			text:'并且(and)',
			blist:["vari","math","fm","fs","fd"]
		},{
			id:'or',
			text:'或者(or)',
			blist:["vari","math","fm","fs","fd"]
		},{
			id:'not',
			text:'否(not)',
			blist:["vari","math","fm","fs","fd"]
		},{
			id:'eq',
			text:"等于(=)",
			blist:['logic',"fl"]
		},{
			id:'gt',
			text:'大于(>)',
			blist:["logic","fl","str"]
		},{
			id:'ge',
			text:'大于等于(>=)',
			blist:["logic","f1","str"]
		},{
			id:'lt',
			text:'小于(<)',
			blist:["logic","f1","str"]
		},{
			id:'le',
			text:'小于等于(<=)',
			wlist:["logic","f1","str"]
		}
	],
	math:[{
			id:'sum',
			text:'加(+)',
			blist:['logic','str','dt','fs','fd','fl']
		},{
			id:'dec',
			text:'减(-)',
			blist:['logic','str','dt','fs','fd','fl']
		},{
			id:'mul',
			text:'乘(*)',
			blist:['logic','str','dt','fs','fd','fl']
		},{
			id:'div',
			text:'除(/)',
			blist:['logic','str','dt','fs','fd','fl']
		}
	],
	fm: [{
			id:'max',
			text:'最大值(max)',
			blist:['logic','str','dt','fs','fd','fl']
		},{
			id:'min',
			text:'最小值(min)',
			blist:['logic','str','dt','fs','fd','fl']
		},{
			id:'avg',
			text:'平均值(avg)',
			blist:['logic','str','dt','fs','fd','fl']
		}
		
	],
	fs:	 [{
			id:'substr',
			text:'子字符串(substr)',
			args:[
					{blist:['num',"dt","logic","math",'fm',"fd","fl"]},
					{blist:['str','logic','fs','fd','fl']},
					{blist:['str','logic','fs','fd','fl']}
			]
		},{
			id:'indexof',
			text:'查找子串(indexof)'
		}
		
	]
}

util.Expression.idCaches = null
util.Expression.findById =function(id){
	if(!util.Expression.idCaches){
		util.Expression.initIdCaches()
	}
	return util.Expression.idCaches[id]
}
util.Expression.initIdCaches = function(){
	var caches = {}
	var usages = util.Expression.usages 
	for(fn in usages){
		var folder = usages[fn]
		for(var i = 0; i < folder.length ; i ++){
			var usage = folder[i]
			caches[usage.id] = usage
		}
	}
	util.Expression.idCaches = caches
}