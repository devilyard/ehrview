$package("util.Expression")

util.Expression.usages = {
	ref:{
		type:1,
		args:{
			count:1,
			wl:[
				{type:'string'}
			]
		}
	},
	str:{},
	num:{},
	dt:{},
	and:{
		type:2,
		args:{
			whitelist:[
				{type:2},
				{type:44}
			]
		}
	}

}