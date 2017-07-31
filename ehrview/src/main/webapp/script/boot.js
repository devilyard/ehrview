$package = function(ns) {
	var obj
	var pkgs = ns.split(".");
	var root = pkgs[0];
	eval('if (typeof ' + root + ' == "undefined"){' + root + ' = {};} obj = '
			+ root + ';');
	for (var i = 1; i < pkgs.length; i++) {
		var p = pkgs[i]
		obj[p] = obj[p] || {};
		obj = obj[p];
	}
}

$apply = function(o, c, defaults){
    if(defaults){
        $apply(o, defaults);
    }
    if(o && c && typeof c == 'object'){
        for(var p in c){
            o[p] = c[p];
        }
    }
    return o;
};



$package("ClassLoader")

ClassLoader.debug = true
ClassLoader.autoloadAppScript = true
ClassLoader.transportFactory = [function() {
			return new ActiveXObject('Msxml2.XMLHTTP')
		}, function() {
			return new ActiveXObject('Microsoft.XMLHTTP')
		}, function() {
			return new XMLHttpRequest()
		}]
ClassLoader.createNewTransport = function() {
	var factory = ClassLoader.transportFactory
	var transport = null;
	for (var i = 0, length = factory.length; i < length; i++) {
		var lambda = factory[i];
		try {
			transport = lambda();
			break;
		} catch (e) {
		}
	}
	return transport;
}

ClassLoader.transport = ClassLoader.createNewTransport.apply();
ClassLoader.emptyFunction = function() {}
ClassLoader.cacheScript = {}
ClassLoader.stylesheetRefCount = {}
ClassLoader.appRootOffsetPath = function() {
	var pathname = window.location.pathname
	if(pathname.slice(0,1) != "/"){ //for ie9preview bug
		pathname = "/" + pathname
	}
	var fds = pathname.split("/")
	var tiers = fds.length - 3
	var offset = ""
	for (var i = 0; i < tiers; i++) {
		offset += "../"
	}
	return offset

}()
ClassLoader.stylesheetHome = ClassLoader.appRootOffsetPath
		+ "resources/css/"
ClassLoader.scriptHome = ClassLoader.appRootOffsetPath + "script/"
ClassLoader.eval = function(s) {
	if (window.execScript) {
		window.execScript(s)
	} else {
		window.eval(s);
	}
}

ClassLoader.markCache = function(clsName) {
	if (typeof clsName == "object") {
		for (var i = 0; i < clsName.length; i++) {
			ClassLoader.cacheScript[clsName[i]] = true
		}
	} else {
		ClassLoader.cacheScript[clsName] = true
	}
}
ClassLoader.clearCache = function(clsName) {
	if (typeof clsName == "object") {
		for (var i = 0; i < clsName.length; i++) {
			delete ClassLoader.cacheScript[clsName[i]]
		}
	} else {
		delete ClassLoader.cacheScript[clsName]
	}
}
ClassLoader.destory = function(clsName) {
	try {
		if (typeof clsName == "object") {
			for (var i = 0; i < clsName.length; i++) {
				ClassLoader.eval("delete " + clsName[i])
			}
		} else {
			ClassLoader.eval("delete " + clsName)

		}
	} catch (e) {
		if (ClassLoader.debug)
			alert("destory failed:" + e.toString())
	}
	ClassLoader.clearCache(clsName)
}
// --------------------------------------------------------------------------
ClassLoader.loadScriptSync = function() {
	if (arguments.length == 0) {
		return;
	}
	var clsName;
	if (arguments.length == 1) {
		clsName = arguments[0]
		if (ClassLoader.cacheScript[clsName]) {
			return
		}
	} else {
		var j = 0;
		clsName = []
		for (var i = 0; i < arguments.length; i++) {
			var cls = arguments[i];
			if (!ClassLoader.cacheScript[cls]) {
				clsName[j] = cls
				j++;
			}
		}
		if (j == 0) {
			return;
		}
	}

	var sender = ClassLoader.createNewTransport();

	var method = "GET"
	var url = clsName

	if (typeof clsName == "object" && clsName.length > 0) {
		url = clsName.join(",")
	}
	sender.open(method, url + ".jsc", false)
	sender.setRequestHeader('encoding', 'utf-8');
	
	try {
		sender.send("")
	} catch (e) {
		alert(e)
	}

	if (sender.readyState == 4) {
		if (sender.status == 200) {
			var file = sender.responseText
			if (file.length == 0) {
				return;
			}
			ClassLoader.markCache(clsName)
			try {
				ClassLoader.eval(file)
			} 
			catch (e) {
				ClassLoader.clearCache(clsName)
				if (ClassLoader.debug) {
					alert(clsName + " script file error:\r" + e.toString())
				}
				throw e
			}
		} else {
			if (ClassLoader.debug)
				alert(clsName + " class file load failed")
		}
		sender.abort()
	}
}
// --------------------------------------------------------------------------
ClassLoader.loadScriptAsync = function(clsName, callback, notify) {
	var method = "get"
	var url = clsName

	if (typeof clsName == "string") {
		if (ClassLoader.cacheScript[clsName]) {
			fire.apply(this, [callback]);
			return
		}
	} else {
		if (typeof clsName == "object" && clsName.length > 0) {
			
			var j = 0;
			var newClsName = [];
			for (var i = 0; i < clsName.length; i++) {
				var sCls = clsName[i];
				if (!ClassLoader.cacheScript[sCls]) {
					newClsName[j] = sCls
					j++;
				}
			}
			if (j == 0) {
				fire.apply(this, [callback])
				return;
			}
			clsName = newClsName;
			url = clsName.join(",")
		} else {
			return;
		}
	}
	var sender = ClassLoader.createNewTransport.apply()

	sender.onreadystatechange = complete
	sender.open(method, url + ".jsc", true)
	sender.setRequestHeader('encoding', 'utf-8');
	
	sender.send("")

	function complete() {
		var readyState = sender.readyState
		fire.apply(sender, [notify, readyState, clsName, null, null])
		if (readyState == 4) {
			sender.onreadystatechange = ClassLoader.emptyFunction
			var status = sender.status
			if (status == 200) {
				var file = sender.responseText
				if (file.length == 0) {
					return;
				}
				ClassLoader.markCache(clsName)
				try {
					ClassLoader.eval(file)
					fire.apply(this, [callback])
				} catch (e) {
					ClassLoader.clearCache(clsName)
					fire.apply(sender, [notify, readyState, clsName,
											status, e])
					if (ClassLoader.debug) {
						alert(clsName + " script file error:\r" + e)
					}
					throw e
				}

			} else {
				fire.apply(sender, [notify, readyState, clsName, status, null])
				if (ClassLoader.debug)
					alert(clsName + " script file load failed")
			}
			sender.abort()
		}
	}

	function fire() {
		if (arguments.length == 0) {
			return
		}

		var fn = arguments[0]
		var scope = this

		if (typeof fn == "object") {
			scope = (typeof fn[1] == "object") ? fn[1] : scope
			fn = fn[0]
		}
		if (typeof fn == 'function')
			fn.apply(scope, Array.prototype.slice.call(arguments, 1))
	}
}
// --------------------------------------------------------------------------
ClassLoader.loadStylesheet = function(id) {
	if (ClassLoader.stylesheetRefCount[id]) {
		var count = ClassLoader.stylesheetRefCount[id]
		ClassLoader.stylesheetRefCount[id] = ++count
		return
	}
	var temp = new Date().getTime();
	var ss = document.createElement("Link")
	ss.setAttribute("id", id);
	ss.setAttribute("href", ClassLoader.stylesheetHome
					+ id.replace(/[.]/gi, "/") + ".css")
//					+ id.replace(/[.]/gi, "/") + ".css?temp=" + temp)
	ss.setAttribute("rel", "stylesheet")
	ss.setAttribute("type", "text/css")
	document.getElementsByTagName("head")[0].appendChild(ss)
	ClassLoader.stylesheetRefCount[id] = 1
}
ClassLoader.removeStylesheet = function(id) {
	if (ClassLoader.stylesheetRefCount[id]) {
		var count = --ClassLoader.stylesheetRefCount[id]
		if (count > 0) {
			ClassLoader.stylesheetRefCount[id] = count
			return
		}
		delete ClassLoader.stylesheetRefCount[id]
		var existing = document.getElementById(id);
		if (existing) {
			existing.parentNode.removeChild(existing);
		}
	}
}
ClassLoader.swapStylesheet = function(old, id) {
	ClassLoader.removeStylesheet(old)
	ClassLoader.loadStylesheet(id)
}

$import = ClassLoader.loadScriptSync;
$require = ClassLoader.loadScriptAsync
$destory = ClassLoader.destory
$styleSheet = ClassLoader.loadStylesheet;
$rStyleSheet = ClassLoader.removeStylesheet;

// --------------------------------------------------------------------------
ClassLoader.loadAppScript = function() {
	var path = window.location.pathname
	
	if(path.slice(0,1) != "/"){ //for ie9preview bug
		path = "/" + path
	}
	
	if(path.substr(path.length - 1,1) == "/"){
		path += "index.html"
	}
	var v = path.split("/")
	var n = v.length
	if (v[n - 1].length > 0) {
		v[n - 1] = v[n - 1].split(".")[0]
	}
	v[1] = "app"
	v = v.slice(1, v.length)
	if(v.length==2 && v[1]==''){
		v[1]=('index')
	}
	$import(v.join("."))
};

if (ClassLoader.autoloadAppScript) {
	ClassLoader.loadAppScript();
}
