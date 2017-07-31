$package("util")

util.CSSHelper = function(){
    var camelRe = /(-[a-z])/gi;
    var camelFn = function(m, a){ return a.charAt(1).toUpperCase(); };
	var doc = document
	var sheet = null;
	var rules = {};
	return {
	   initPageStyleSheet : function(){
	       var ss;
	       var head = doc.getElementsByTagName("head")[0]
	       var styles = head.getElementsByTagName("style"); ;
	       var n = styles.length
	       
	       if(n > 0){
	       		//sheet = doc.styleSheets[doc.styleSheets.length - 1]
	       		//alert(doc.styleSheets.length)
	       		sheet = doc.styleSheets[n-1]
	       		var ssRules = sheet.rules || sheet.cssRules
	           	for(var i = ssRules.length-1; i >= 0; --i){
	               rules[ssRules[i].selectorText] = ssRules[i];
	           	}
	       }
	       else{
	       		if(doc.createStyleSheet){
	       			sheet = doc.createStyleSheet(); 
	       		}
				else{
	       			var se = doc.createElement("style");
	       			se.setAttribute("type", "text/css");
	       			head.appendChild(se);
	       			sheet = se.sheet
				}
	       }
	   },
	   hasRule:function(selector){
			return rules[selector]
	   },
	   createRule:function(selector,text){
   			if(sheet == null){
   				this.initPageStyleSheet()
   			}
   			if(sheet.addRule){
   				var n = sheet.rules.length
   				sheet.addRule(selector,text,n); 
   				rules[selector] = sheet.rules[n]
			}
			else if(sheet.insertRule){
				var n = sheet.cssRules.length
				sheet.insertRule(selector   +   "{ "   +   text   +   "} ",n); 
				rules[selector] = sheet.cssRules[n]
			}	   
	   },
	   updateRule:function(selector,property,value){
   			if(sheet == null){
   				this.initPageStyleSheet()
   			}
	   		var rule = rules[selector]
	   		if(rule){
	   			rule.style[property.replace(camelRe, camelFn)] = value;
	   		}
	   },
	   removeRule:function(selector){
	   		var ssRules = sheet.rules || sheet.cssRules
           	for(var i = ssRules.length-1; i >= 0; --i){
               if(ssRules[i].selectorText == selector){
               		if(sheet.removeRule){
               			sheet.removeRule(i)
               		}
               		else{
               			sheet.deleteRule(i)
               		}
               }
           	}	   
	   }
	}
}()