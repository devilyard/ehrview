$package("util.dictionary")

util.dictionary.TreeLoader = Ext.extend(Ext.tree.TreeLoader,{
	 requestData : function(node, callback){
        if(this.fireEvent("beforeload", this, node, callback) !== false){
            var url = this.dataUrl || "";
//            var temp = new Date().getTime()
            if((this.dic.id == "dictionaries" || this.dic.id.indexOf("dictionaries.")==0) && !node.attributes.root){
            	var n = node
            	while(n){
            		if(n.attributes.type == "dic"){
            			break;
            		}
            		n = n.parentNode
            	}
				url += n.attributes.key + ".dic?sliceType=3"
				if(n != node){
					url += "&parentKey=" + node.attributes.key
				}
//				url += "&temp=" + temp 
            }
            else{
            	var sliceType = this.dic.sliceType || 3
            	var layer = 0
            	if(node.attributes._sliceType){
            		sliceType = node.attributes._sliceType
            	}
            	if(node.attributes._layer){
            		layer = node.attributes._layer
            	}
            	url = this.url + "?sliceType="+sliceType+"&start="+layer+"&parentKey=" + node.attributes.key
            	if(this.dic.src){
            		url += "&src=" + this.dic.src
            	}
            }
            var requestData = {
            	method:"GET",
                url: encodeURI(url),
                success: this.handleResponse,
                failure: this.handleFailure,
                scope: this,
                argument: {callback: callback, node: node},
                params:{}
//                params: this.getParams(node)
            }
            if(this.dic.filter){
            	var ft = typeof this.dic.filter=="string"?this.dic.filter:Ext.encode(this.dic.filter);
            	requestData.params.filter = ft;
            }
            if(this.dic.lengthLimit){
            	requestData.params.lengthLimit = this.dic.lengthLimit;
            }
            if(this.dic.layerLength){
            	requestData.params.layerLength = this.dic.layerLength
            }
            if(this.dic.layer){
            	requestData.params.layer = this.dic.layer
            }
            if(this.dic.layerConfig){
            	requestData.params.layerLength = this.dic.layerConfig.length;
            	requestData.params.layer = this.dic.layerConfig.layer;
            }
            this.transId = Ext.Ajax.request(requestData);
        }else{
            // if the load is cancelled, make sure we notify
            // the node that we are done
            if(typeof callback == "function"){
                callback();
            }
        }
    },
    processResponse : function(response, node, callback){
        try {
            var json = eval("("+response.responseText+")");
            var o;
            if(json && json.items){
            	o = json.items
            }
            else{
            	this.handleFailure(response);
            	return;
            }
            node.beginUpdate();
            for(var i = 0, len = o.length; i < len; i++){
            	var it = o[i]
            	if(!(this.keyNotUniquely === true||this.keyNotUniquely === "true"||this.dic.keyNotUniquely===true||this.dic.keyNotUniquely==="true")){
            		it.id = it.key
            	}
            	it.leaf = ((it.folder || it.nav) === "true" ||   (it.folder || it.nav) === true)  ? false : true
                var n = this.createNode(it);
   				
                if(n){
                    node.appendChild(n);
                }
            }
            node.endUpdate();
            if(typeof callback == "function"){
                callback(this, node);
            }
            //process parentNode
            var tree = node.getOwnerTree()
            var root = tree.getRootNode() 

           // if(root.attributes.key == node.attributes.key || root.attributes.key){
        	var pi = json.parentItem
        	if(pi){
        		node.id = pi.key
        		node.setText(pi.text);
        		Ext.apply(node.attributes,pi)
        	}
          //  }
        }catch(e){
            this.handleFailure(response);
        }
    }
})