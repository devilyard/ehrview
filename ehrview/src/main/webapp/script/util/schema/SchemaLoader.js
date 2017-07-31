$package("util.schema")

$import(
	"util.rmi.miniRequestSync",
	"util.rmi.miniRequestAsync"
)

util.schema.SchemaPool = {}

util.schema.loadSync = function(id){
	if(!id || id == ""){
		return
	}
	var pool = util.schema.SchemaPool
	if(pool[id]){
		pool[id].ref ++
		return {schema:pool[id].schema,code:200,msg : "FromCache"}
	}
	var result = util.rmi.miniRequestSync(id+".schema")
	if(result.code == 200){
		var schema = result.json.body
		if(schema){
			pool[id] = {ref:1,schema:schema};
		}
		return {schema:schema,code:200,msg:result.msg}
	}
	else{
		return {code:result.code,msg:result.msg}
	}
}

util.schema.load = function(id,callback,scope){
	if(!id || id == ""){
		return
	}
	var pool = util.schema.SchemaPool
	if(pool[id]){
		pool[id].ref ++
		if(typeof callback == 'function'){
			callback.call(scope || this,200,"Success",pool[id].schema)
		}
		return
	}
	util.rmi.miniRequestAsync(id+".schema",
		function(code,msg,json){
			var schema = null
			if(code == 200){
				schema = json.body
				if(schema){
					pool[id] = {ref:1,schema:schema};
				}
			}
			if(typeof callback == 'function'){
				callback.call(scope || this,code,msg,schema)
			}
		},
		this)
}
util.schema.unload = function(id){
	var pool = util.schema.SchemaPool
	if(pool[id]){
		var ref = pool[id].ref
		ref --;
		if(ref == 0){
			delete pool[id]
		}
	}
}
