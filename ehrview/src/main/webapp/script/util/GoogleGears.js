(function() {
 
   if(!Ext.get('_GoogleGears')){
   		var codebase = ClassLoader.appRootOffsetPath + "inc/component/Gears.CAB";
		var html = '<OBJECT id="_GoogleGears"  align="CENTER" WIDTH="0" HEIGHT="0" codeBase="' + codebase + '#version=0,5,33,0" classid="CLSID:C93A7319-17B3-4504-87CD-03EFC6103E6E"></OBJECT>'
		var el = Ext.DomHelper.insertHtml('beforeEnd',document.body,html)
  	}
  
  if (window.google && google.gears) {
    return;
  }
  var factory = null;
  // Firefox
  if (typeof GearsFactory != 'undefined') {
    factory = new GearsFactory();
  } 
  else {
    // IE
    try {
    //	alert(_GoogleGears.create)
      factory = new ActiveXObject('Gears.Factory');
      if (factory.getBuildInfo().indexOf('ie_mobile') != -1) {
        factory.privateSetGlobalObject(this);
      }
    } 
    catch (e) {
	  throw e
      if ((typeof navigator.mimeTypes != 'undefined')
           && navigator.mimeTypes["application/x-googlegears"]) {
        factory = document.createElement("object");
        factory.style.display = "none";
        factory.width = 0;
        factory.height = 0;
        factory.type = "application/x-googlegears";
        document.documentElement.appendChild(factory);
      }
    }
  }

  if (!factory) {
  	
    return;
  }

  if (!window.google) {
    google = {};
  }

  if (!google.gears) {
    google.gears = {factory: factory};
  }
})();

$package("util")
util.GoogleGears = {
	
}

util.GoogleGears.database = {
	connect:function(dbName){
		var con = util.GoogleGears.database.con
		con.open(dbName)
	},
	createTable:function(table,fields){
		var indexs = []
		var keyField = ""
		var sql = "create table if not exists " + table + " (";
		for(var i = 0; i < fields.length; i ++){
			var f = fields[i]
			sql += f.id + " " + (f.type || "varchar(100)")
			if(f.pkey){
				sql +=" primary key"
				if(f.autoIncrement){
					sql +=" autoincrement";
				}
				keyField = f.id
			}
			if(f.required){
				sql += " not null"
			}
			if(f.defaultValue){
				sql +=" default " + f.defaultValue
			}
			if(f.index){
				indexs.push(f)
			}
			sql +=","
		}
		sql = sql.substring(0,sql.length - 1)
		sql += " )"
		var con = util.GoogleGears.database.con
		try{
			con.execute(sql)
			if(indexs.length > 0){
				for(var i = 0;i < indexs.length; i ++){
					var f = indexs[i]
					this.createIndex("idx_" + table + "_" + f.id,table,[f.id],f.unique)
				}
			}
			util.GoogleGears.database.schemas[table] = {keyField:keyField}
			return true;
		}
		catch(e){
			return false;
		}
	},
	removeTable:function(table){
		var sql = "drop table if exists " + table
		var con = util.GoogleGears.database.con
		try{
			con.execute(sql)
			delete util.GoogleGears.database.schemas[table]
			return true;
		}
		catch(e){
			throw e
			return false;
		}
	},
	createIndex:function(index,table,fields,isUnique){
		var sql = "create"
		if(isUnique){
			sql += " unique"
		}
		sql +=" index if not exists " + index + " on " + table + "("
		for(var i = 0; i < fields.length; i ++){
				sql += fields[i] + ","
		}
		sql = sql.substring(0,sql.length -1);
		sql += ")"
		var con = util.GoogleGears.database.con
		try{
			con.execute(sql)
			return true;
		}
		catch(e){
			return false;
		}
	},
	query:function(sql,args){
		var data = [];
		var con = util.GoogleGears.database.con
		try{
			var rs = con.execute(sql,args)
			var fieldCount = rs.fieldCount()
			while (rs.isValidRow()) {
			  var o = {}
			  for(var i = 0 ; i < fieldCount; i ++){
			  	o[rs.fieldName(i)] = rs.field(i)
			  }
			  data.push(o);
			  rs.next();
			}
			rs.close();
			return data
		}
		catch(e){
			return data;
		}
	},
	insert:function(table,data){
		var con = util.GoogleGears.database.con
		var sql = "Insert Into " + table
		var cols = ""
		var vals = ""
		for(var c in data){
			var v = data[c]
			cols += c + ","
			if(typeof v == "number"){
				vals += v + ","
			}
			else{
				vals += "'" + v  +"',"
			}
		}
		cols = cols.substring(0,cols.length - 1)
		vals = vals.substring(0,vals.length - 1)
		sql += "(" + cols + ")"
		
		sql += " values(" + vals +")"
		try{
			con.execute(sql)
			return con.lastInsertRowId;
		}
		catch(e){
			return null;
		}
	},
	updateByKey:function(table,keyValue,data){
		var keyField = util.GoogleGears.database.schemas[table].keyField
		var con = util.GoogleGears.database.con
		var sql = "update " + table + " set "
		for(var c in data){
			if(c == keyField){
				continue;
			}
			var v = data[c]
			if(typeof v == "number"){
				sql += c + "=" + v + ","
			}
			else{
				sql += c + "='" + v + "',"
			}
		}
		sql = sql.substring(0,sql.length - 1)
		sql += " where " + keyField + "="
		if(typeof keyValue == "number"){
			sql +=  keyValue
		}
		else{
			sql +="'" + keyValue + "'"
		}
		try{
			con.execute(sql)
			return con.rowsAffected == 1;
		}
		catch(e){
			return false;
		}		
	},
	removeByKey:function(table,keyValue){
		var keyField = util.GoogleGears.database.schemas[table].keyField
		var con = util.GoogleGears.database.con
		var sql = "delete from " + table + " where " + keyField + "="
		if(typeof keyValue == "number"){
			sql +=  keyValue
		}
		else{
			sql +="'" + keyValue + "'"
		}
		try{
			con.execute(sql)
			return con.rowsAffected == 1;
		}
		catch(e){
			return false;
		}	
	},
	loadByKey:function(table,keyValue){
		var keyField = util.GoogleGears.database.schemas[table].keyField
		var sql = "select * from " + table + " where " + keyField + "="
		if(typeof keyValue == "number"){
			sql +=  keyValue
		}
		else{
			sql +="'" + keyValue + "'"
		}
		var rs = this.query(sql)
		if(rs.length == 1){
			return rs[0]
		}
		else{
			return null;
		}
	},
	list:function(table,pageSize,pageNo,where,sortField,sortMethod){
		var sql = "select * from " + table
		if(where){
			sql += " where " + where
		}
		if(sortField){
			sql +=" order by " + sortField
			if(sortMethod){
				sql += " " + sortMethod
			}
		}
		if(pageSize){
			sql += " limit " + pageSize
			if(pageNo){
				var offset = (pageNo - 1) * pageSize
				sql += " offset " + offset
			}
		}
		return this.query(sql)
	},
	clear:function(table){
		var con = util.GoogleGears.database.con
		var sql = "delete from " + table
		try{
			con.execute(sql)
			return con.rowsAffected;
		}
		catch(e){
			return 0;
		}		
	}
}
util.GoogleGears.database.con = google.gears.factory.create('beta.database');
util.GoogleGears.database.schemas = {}
