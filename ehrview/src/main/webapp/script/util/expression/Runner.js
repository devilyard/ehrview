$package("util.Expression")

util.Expression.Runner = new function(){
	var flyweight = {}
	var alias = {}
	function invoke(op,jsonExp,ctx){
		if(!typeof jsonExp == "object" && jsonExp.length < 1){
			return
		}
		var name = jsonExp[0]
		if(!this.hasExp(name)){
			return
		}
		var exp  = flyweight[name]
		var args = jsonExp.slice(1)
		if(exp)
			return exp[op].apply(exp,[args,ctx])
	}
	
	this.run = function(jsonExp,ctx){
		return invoke.apply(this,["run",jsonExp,ctx])
	}
	
	this.toString = function(jsonExp,ctx){
		return invoke.apply(this,["toString",jsonExp,ctx])
	}
	
	this.hasExp = function(name){
		return typeof flyweight[name]
	}
	
	this.register =function(name,exp){
		if(name && typeof exp == "object"){
			flyweight[name] = exp
		}
	}
}()
//+------------------------------------------------------------
util.Expression.Ref = {
	run:function(jsonExp,ctx){
		if(jsonExp.length == 1){
			var name = jsonExp[0]
			if(typeof ctx == "object"){
				if(ctx[name]){
					return ctx[name]
				}
				if(ctx.getValue){
					return ctx.getValue(name)
				}
			}
		}
	},
	toString:function(jsonExp,ctx){
		var s = ""
		if(jsonExp.length == 1){
			s = jsonExp[0]
		}
		return s
	}
}
util.Expression.Runner.register("$",util.Expression.Ref)
//+------------------------------------------------------------
util.Expression.String = {
	run:function(jsonExp,ctx){
		var r = ""
		if(jsonExp.length == 1){
			r = new String(jsonExp[0])
		}
		return r
	},
	toString:function(jsonExp,ctx){
		var s = this.run(jsonExp,ctx)
		return "'" + s + "'"
	}
}
util.Expression.Runner.register("str",util.Expression.String)
//+------------------------------------------------------------
util.Expression.Number = {
	run:function(jsonExp,ctx){
		var r = ""
		if(jsonExp.length == 1){
			r = new Number(jsonExp[0])
		}
		return r
	},
	toString:function(jsonExp,ctx){
		var s = this.run(jsonExp,ctx)
		return new String(s)
	}
}
util.Expression.Runner.register("num",util.Expression.Number)
//+------------------------------------------------------------
util.Expression.Datetime = {
	run:function(jsonExp,ctx){
		var r = ""
		if(jsonExp.length == 1){
			r = Date.parseDate(jsonExp[0])
		}
		return r.getTime()
	},
	toString:function(jsonExp,ctx){
		var s = ""
		if(jsonExp.length == 1){
			s = new String(jsonExp[0])
		}
		return "'" + s + "'"
	}
}
util.Expression.Runner.register("dt",util.Expression.Datetime)
//+------------------------------------------------------------
util.Expression.And = {
		symbols:"and",
		run:function(jsonExp,ctx){
			var flag = true
			for(var i = 0; i < jsonExp.length; i ++){
				if(!util.Expression.Runner.run(jsonExp[i],ctx)){
					flag = false
					break
				}
			}
			return flag
		},
		toString:function(jsonExp,ctx){
			var s = []
			for(var i = 0; i < jsonExp.length; i ++){
				var t = "(" + util.Expression.Runner.toString(jsonExp[i],ctx) + ")"
				s.push(t)
			}
			return s.join(" "+ this.symbols +" ")
		}
	}
util.Expression.Runner.register("and",util.Expression.And)

//+------------------------------------------------------------
util.Expression.Or = {
		symbols:"or",
		run:function(jsonExp,ctx){
			var flag = false
			for(var i = 0; i < jsonExp.length; i ++){
				if(util.Expression.Runner.run(jsonExp[i],ctx)){
					flag = true
					break
				}
			}
			return flag
		},
		toString:util.Expression.And.toString
	}
util.Expression.Runner.register("or",util.Expression.Or)

//+------------------------------------------------------------
util.Expression.Not = {
		symbols:"not",
		run:function(jsonExp,ctx){
			var flag = false
			if(jsonExp.length == 1){
				flag = !util.Expression.Runner.run(jsonExp[0],ctx)
			}
			return flag
		},
		toString:function(jsonExp,ctx){
			if(!jsonExp.length < 1){
				return this.symbols + "()"
			}
			var s = "(" + util.Expression.Runner.toString(jsonExp[0],ctx) + ")"
			return this.symbols + s
		}
	}
util.Expression.Runner.register("not",util.Expression.Not)

//+------------------------------------------------------------
util.Expression.EQ = {
		symbols:"=",
		run:function(jsonExp,ctx){
			var flag = true
			if(jsonExp.length < 2){
				return flag
			}
			var r1 = util.Expression.Runner.run(jsonExp[0],ctx)
			for(var i = 1; i < jsonExp.length; i ++){
				var r2 = util.Expression.Runner.run(jsonExp[i],ctx)
				if(r1 != r2){
					flag = false
					break
				}
			}
			return flag
		},
		toString:function(jsonExp,ctx){
			var s = []
			for(var i = 0; i < jsonExp.length; i ++){
				var t = util.Expression.Runner.toString(jsonExp[i],ctx)
				s.push(t)
			}
			return s.join("" + this.symbols + "")
		}
	}
util.Expression.Runner.register("eq",util.Expression.EQ)
//+------------------------------------------------------------
util.Expression.GT = {
		symbols:">",
		run:function(jsonExp,ctx){
			var flag = true
			if(jsonExp.length < 2){
				return flag
			}
			var r1 = util.Expression.Runner.run(jsonExp[0],ctx)
			for(var i = 1; i < jsonExp.length; i ++){
				var r2 = util.Expression.Runner.run(jsonExp[i],ctx)
				if(r1 <= r2){
					flag = false
					break
				}
				r1 = r2
			}
			return flag
		},
		toString:util.Expression.EQ.toString
	}
util.Expression.Runner.register("gt",util.Expression.GT)
//+------------------------------------------------------------
util.Expression.GE = {
		symbols:">=",
		run:function(jsonExp,ctx){
			var flag = true
			if(jsonExp.length < 2){
				return flag
			}
			var r1 = util.Expression.Runner.run(jsonExp[0],ctx)
			for(var i = 1; i < jsonExp.length; i ++){
				var r2 = util.Expression.Runner.run(jsonExp[i],ctx)
				if(r1 < r2){
					flag = false
					break
				}
				r1 = r2
			}
			return flag
		},
		toString:util.Expression.EQ.toString
	}
util.Expression.Runner.register("ge",util.Expression.GE)
//+------------------------------------------------------------
util.Expression.LT = {
		symbols:"<",
		run:function(jsonExp,ctx){
			var flag = true
			if(jsonExp.length < 2){
				return flag
			}
			var r1 = util.Expression.Runner.run(jsonExp[0],ctx)
			for(var i = 1; i < jsonExp.length; i ++){
				var r2 = util.Expression.Runner.run(jsonExp[i],ctx)
				if(r1 >= r2){
					flag = false
					break
				}
				r1 = r2
			}
			return flag
		},
		toString:util.Expression.EQ.toString
	}
util.Expression.Runner.register("lt",util.Expression.LT)
//+------------------------------------------------------------
util.Expression.LE = {
		symbols:"<=",
		run:function(jsonExp,ctx){
			var flag = true
			if(jsonExp.length < 2){
				return flag
			}
			var r1 = util.Expression.Runner.run(jsonExp[0],ctx)
			for(var i = 1; i < jsonExp.length; i ++){
				var r2 = util.Expression.Runner.run(jsonExp[i],ctx)
				if(r1 > r2){
					flag = false
					break
				}
				r1 = r2
			}
			return flag
		},
		toString:util.Expression.EQ.toString
	}
util.Expression.Runner.register("le",util.Expression.LE)

//====================================================================
util.Expression.Sum = {
		symbols:"+",
		run:function(jsonExp,ctx){
			var r = 0
			if(jsonExp.length < 1){
				return r
			}
			r += util.Expression.Runner.run(jsonExp[0],ctx)
			for(var i = 1; i < jsonExp.length; i ++){
				r += util.Expression.Runner.run(jsonExp[i],ctx)
			}
			return r
		},
		toString:util.Expression.EQ.toString
	}
util.Expression.Runner.register("sum",util.Expression.Sum)
//====================================================================
util.Expression.Dec = {
		symbols:"-",
		run:function(jsonExp,ctx){
			var r = 0
			if(jsonExp.length < 1){
				return r
			}
			r = util.Expression.Runner.run(jsonExp[0],ctx)
			for(var i = 1; i < jsonExp.length; i ++){
				r -= util.Expression.Runner.run(jsonExp[i],ctx)
			}
			return r
		},
		toString:util.Expression.EQ.toString
	}
util.Expression.Runner.register("dec",util.Expression.Dec)
//====================================================================
util.Expression.Mul = {
		symbols:"*",
		run:function(jsonExp,ctx){
			if(jsonExp.length < 1){
				return 0
			}
			var r = util.Expression.Runner.run(jsonExp[0],ctx)
			for(var i = 1; i < jsonExp.length; i ++){
				r *= util.Expression.Runner.run(jsonExp[i],ctx)
			}
			return r
		},
		toString:util.Expression.And.toString
	}
util.Expression.Runner.register("mul",util.Expression.Mul)
//====================================================================
util.Expression.Div = {
		symbols:"/",
		run:function(jsonExp,ctx){
			if(jsonExp.length < 1){
				return 0
			}
			var r1 = util.Expression.Runner.run(jsonExp[0],ctx)
			for(var i = 1; i < jsonExp.length; i ++){
				var r2 = util.Expression.Runner.run(jsonExp[i],ctx)
				if(r2 != 0){
					r1 = r1 / r2
				}
			}
			return r1
		},
		toString:util.Expression.And.toString
	}
util.Expression.Runner.register("div",util.Expression.Div)
//====================================================================
util.Expression.Max = {
		symbols:"max",
		run:function(jsonExp,ctx){
			if(jsonExp.length < 1){
				return 0
			}
			var r1 = util.Expression.Runner.run(jsonExp[0],ctx)
			for(var i = 1; i < jsonExp.length; i ++){
				var r2 = util.Expression.Runner.run(jsonExp[i],ctx)
				if(r2 > r1){
					r1 = r2
				}
			}
			return r1
		},
		toString:function(jsonExp,ctx){
			if(jsonExp.length < 1){
				return this.symbols + "()"
			}
			var s = []
			for(var i = 0; i < jsonExp.length; i ++){
				var t = util.Expression.Runner.toString(jsonExp[i],ctx)
				s.push(t)
			}
			return this.symbols + "(" +s.join(",") + ")"
		}
	}
util.Expression.Runner.register("max",util.Expression.Max)
//====================================================================
util.Expression.Min = {
		symbols:"min",
		run:function(jsonExp,ctx){
			if(jsonExp.length < 1){
				return 0
			}
			var r1 = util.Expression.Runner.run(jsonExp[0],ctx)
			for(var i = 1; i < jsonExp.length; i ++){
				var r2 = util.Expression.Runner.run(jsonExp[i],ctx)
				if(r2 < r1){
					r1 = r2
				}
			}
			return r1
		},
		toString:util.Expression.Max.toString
	}
util.Expression.Runner.register("min",util.Expression.Min)
//====================================================================
util.Expression.Substring = {
		symbols:"substring",
		run:function(jsonExp,ctx){
			if(jsonExp.length < 2){
				return
			}
			var s 	= new String(util.Expression.Runner.run(jsonExp[0],ctx))
			var start = parseInt(util.Expression.Runner.run(jsonExp[1]))
			var end = s.length
			if(jsonExp.length == 3){
				var n = parseInt(util.Expression.Runner.run(jsonExp[2]))
				if(n < end && n >= start){
					end = n
				}
			}
			return s.substring(start,end)
		},
		toString:function(jsonExp,ctx){
			var ret = ""
			if(jsonExp.length < 2){
				return ret
			}
			var s 	= new String(util.Expression.Runner.toString(jsonExp[0],ctx))
			var start = parseInt(util.Expression.Runner.toString(jsonExp[1]))
			if(jsonExp.length == 3){
				var end = parseInt(util.Expression.Runner.toString(jsonExp[2]))
				ret = this.symbols + "(" + s + "," + start + "," + end + ")";
			}else{
				ret = this.symbols + "(" + s + "," + start + ")";
			}
			
			return ret
		}
	}
util.Expression.Runner.register("substr",util.Expression.Substring)
//====================================================================
if(!Date.prototype.parseDate){
	$import("util.DateUtil")
}
util.Expression.Year = {
		symbols:"year",
		fmt:"Y-m-d H:i:s u",
		run:function(jsonExp,ctx){
			if(jsonExp.length != 1){
				return
			}
			var fmt = this.fmt
			var d 	= Date.parseDate(util.Expression.Runner.run(jsonExp[0],ctx),fmt)
			return d.getFullYear()
		},
		toString:function(jsonExp,ctx){
			var s = ""
			if(jsonExp.length != 1){
				return this.symbols + "()"
			}
			s = util.Expression.Runner.toString(jsonExp[0],ctx)
			return this.symbols + "(" + s  + ")"
		}
	}
util.Expression.Runner.register("year",util.Expression.Year)