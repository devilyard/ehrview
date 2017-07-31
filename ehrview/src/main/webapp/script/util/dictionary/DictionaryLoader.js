$package("util.dictionary")

util.dictionary.DictionaryLoader = {
	cache:{},
	getUrl:function(dic){
		var url = ClassLoader.serverAppUrl || ""
		url += dic.id + ".dic"
		if(dic.parentKey){
			url += "?parentKey=" + dic.parentKey;
		}
		if(dic.sliceType || dic.sliceType == 0){
			if(url.indexOf("?") > -1){
				url += "&sliceType=" + dic.sliceType
			}
			else{
				url += "?sliceType=" + dic.sliceType
			}
		}
		if(dic.src){
			if(url.indexOf("?") > -1){
				url += "&src=" + dic.src
			}
			else{
				url += "?src=" + dic.src
			}			
		}
		if(dic.filter){
			var ft = typeof dic.filter=="string"?dic.filter:Ext.encode(dic.filter);
			if(url.indexOf("?") > -1){
				url += "&filter=" + ft
			}
			else{
				url += "?filter=" + ft
			}	
		}
		if(dic.lengthLimit){
			if(url.indexOf("?") > -1){
				url += "&lengthLimit=" + dic.lengthLimit
			}
			else{
				url += "?lengthLimit=" + dic.lengthLimit
			}	
		}
		url = encodeURI(url);
		return url
	},
	load:function(dic){
		if(this.cache[dic.id]){
			return this.cache[dic.id]
		}
		var url = this.getUrl(dic)
		var sender = ClassLoader.createNewTransport();
		var method = "GET"
		sender.open(method , url, false)
		sender.setRequestHeader('encoding','utf-8');
		sender.send("")
		if(sender.readyState == 4){
			if(sender.status == 200){
				var dictionary = {}
				var json = eval("(" + sender.responseText + ")")
				if(!json){
					return;
				}
				var items = json.items
				for(var i = 0; i <items.length; i ++){
					var it = items[i]
					dictionary[it.key] = it
				}
				this.cache[dic.id] = {wraper:dictionary,items:items}
				return this.cache[dic.id]
			}
		}
	},
	require:function(dic,callback,scope,mustRefresh){
		if(!mustRefresh){
			if(this.cache[dic.id]){
				if(typeof callback == "function"){
					callback.call(scope || this,this.cache[dic.id])
				}
			}		
		}		
		var url = this.getUrl(dic)
		var con = new Ext.data.Connection();
		con.request({
			url:url,
			method:"GET",
			scope:this,
			callback:function(ops,sucess,response){
				var dictionary = {}
				var code = 200
				var msg = ""
				
				if(sucess){
					try{
						var json = eval("(" + response.responseText + ")")
						
						if(json.items){
							var items = json.items
							for(var i = 0; i <items.length; i ++){
								var it = items[i]
								dictionary[it.key] = it
							}
							this.cache[dic.id] = {wraper:dictionary,items:items}
						}
					}
					catch(e){
						
					}
				}
				if(typeof callback == "function"){
					callback.call(scope || response,this.cache[dic.id])
				}
				
			}
		})
	}
}