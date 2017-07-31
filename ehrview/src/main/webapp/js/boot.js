( function ( global, config ) {
	config = config || {
		debug: false,
		autoloadAppScript: true
	};
	var ns = function ( ns ) {
		var pkgs = ns.split( "." );
		var root = pkgs[ 0 ];
		var obj = global[ root ];
		if ( !obj ) {
			global[ root ] = obj = {};
		}
		for ( var i = 1; i < pkgs.length; i++ ) {
			var p = pkgs[ i ];
			obj[ p ] = obj[ p ] || {};
			obj = obj[ p ];
		}
	}
	global.$package = ns;
	var appRootOffsetPath = function ( ) {
		var pathname = window.location.pathname;
		if ( pathname.slice( 0, 1 ) != "/" ) {
			pathname = "/" + pathname;
		}
		var fds = pathname.split( "/" );
		var tiers = fds.length - 3;
		var offset = "";
		for ( var i = 0; i < tiers; i++ ) {
			offset += "../";
		}
		return offset;
	}( );

	var emptyFunction = function ( ) {};
	global.$emptyFunction = emptyFunction;

	var loadedScripts = {};
	var markCache = function ( cls ) {
		if ( typeof cls == "object" ) {
			for ( var i = 0; i < cls.length; i++ ) {
				loadedScripts[ cls[ i ] ] = true;
			}
		} else {
			loadedScripts[ cls ] = true;
		}
	};
	var clearCache = function ( cls ) {
		if ( typeof cls == "object" ) {
			for ( var i = 0; i < cls.length; i++ ) {
				delete loadedScripts[ cls[ i ] ];
			}
		} else {
			delete loadedScripts[ cls ];
		}
	};
	var evalEx = function ( s ) {
		if ( window.execScript ) {
			window.execScript( s );
		} else {
			window.eval( s );
		}
	}
	var transportFactory = [
		function ( ) {
			return new ActiveXObject( 'Msxml2.XMLHTTP' );
		},
		function ( ) {
			return new ActiveXObject( 'Microsoft.XMLHTTP' );
		},
		function ( ) {
			return new XMLHttpRequest( );
		}
	];

	var createNewTransport = function ( ) {
		var factory = transportFactory;
		var transport = null;
		for ( var i = 0, length = factory.length; i < length; i++ ) {
			var lambda = factory[ i ];
			try {
				transport = lambda( );
				break;
			} catch ( e ) {}
		}
		return transport;
	};

	var loadScriptSync = function ( ) {
		if ( arguments.length == 0 ) {
			return;
		}
		var cls, url;
		if ( arguments.length == 1 ) {
			cls = url = arguments[ 0 ]
			if ( loadedScripts[ cls ] ) {
				return
			}
		} else {
			cls = [ ];
			var j = 0;
			for ( var i = 0; i < arguments.length; i++ ) {
				var c = arguments[ i ];
				if ( !loadedScripts[ c ] ) {
					cls[ j ] = c
					j++;
				}
			}
			if ( j == 0 ) {
				return;
			}
			url = cls.join( "," );
		}

		var xhr = createNewTransport( );
		var method = "GET";
		xhr.open( method, url + ".jsc", false );
		xhr.setRequestHeader( 'encoding', 'utf-8' );
		try {
			xhr.send( "" );
		} catch ( e ) {
			if ( config.debug ) {
				throw e;
			}
		}

		if ( xhr.readyState == 4 ) {
			if ( xhr.status == 200 ) {
				try {
					var file = xhr.responseText;
					if ( file.length == 0 ) {
						if ( config.debug ) {
							throw "responseText is empty";
						}
						return;
					}
					markCache( cls );
					evalEx( file );
				} catch ( e ) {
					clearCache( cls );
					if ( config.debug ) {
						throw e;
					}
				} finally {
					xhr.abort( )
				}
			} else {
				if ( config.debug ) {
					throw "loadsscript[ " + cls + "] failed, responseStatus:" + xhr.status;
				}
				xhr.abort( );
			}
		}
	}
	global.$import = loadScriptSync;

	var fire = function ( ) {
		if ( arguments.length == 0 ) {
			return
		}
		var fn = arguments[ 0 ]
		var scope = this
		if ( typeof fn == "object" ) {
			scope = ( typeof fn[ 1 ] == "object" ) ? fn[ 1 ] : scope
			fn = fn[ 0 ]
		}
		if ( typeof fn == 'function' ) {
			fn.apply( scope, Array.prototype.slice.call( arguments, 1 ) )
		}
	};

	var loadScriptAsync = function ( cls, callback, notify ) {
		var method = "GET"
		var url = cls

		if ( typeof cls == "string" ) {
			if ( loadedScripts[ cls ] ) {
				fire.apply( this, [ callback ] );
				return
			}
		} else {
			if ( typeof cls == "object" && cls.length > 0 ) {
				var j = 0;
				var newClsName = [ ];
				for ( var i = 0; i < cls.length; i++ ) {
					var c = cls[ i ];
					if ( !loadedScripts[ c ] ) {
						newClsName[ j ] = c
						j++;
					}
				}
				if ( j == 0 ) {
					fire.apply( this, [ callback ] )
					return;
				}
				cls = newClsName;
				url = cls.join( "," )
			} else {
				return;
			}
		}
		var xhr = createNewTransport( )

		xhr.onreadystatechange = complete
		xhr.open( method, url + ".jsc", true )
		xhr.setRequestHeader( 'encoding', 'utf-8' );
		xhr.send( "" )

		function complete( ) {
			var readyState = xhr.readyState
			fire.apply( xhr, [ notify, readyState, cls, null, null ] )

			if ( readyState == 4 ) {
				xhr.onreadystatechange = emptyFunction
				var status = xhr.status
				if ( status == 200 ) {
					try {
						var file = xhr.responseText
						if ( file.length == 0 ) {
							throw "responseText is empty";
						}
						markCache( cls )
						evalEx( file )
						fire.apply( this, [ callback ] )
					} catch ( e ) {
						clearCache( cls )
						fire.apply( xhr, [ notify, readyState, cls, status, e ] )
						if ( config.debug ) {
							throw e
						}
					} finally {
						xhr.abort( )
					}
				} else {
					fire.apply( xhr, [ notify, readyState, cls, status, null ] )
					if ( config.debug ) {}
					throw "loadsscript failed, responseStatus:" + xhr.status;
				}
				xhr.abort( )
			}

		}
	}

	global.$require = loadScriptAsync;

	var destoryScript = function ( cls ) {
		try {
			if ( typeof cls == "object" ) {
				for ( var i = 0; i < cls.length; i++ ) {
					evalEx( "delete " + cls[ i ] );
				}
			} else {
				evalEx( "delete " + cls )

			}
		} catch ( e ) {
			if ( config.debug )
				throw e;
		}
		clearCache( cls )
	}
	global.$destory = destoryScript;

	var stylesheetHome = appRootOffsetPath + "resources/";
	var stylesheetRefCount = {};
	var loadStylesheet = function ( id ) {
		if ( stylesheetRefCount[ id ] ) {
			var count = stylesheetRefCount[ id ]
			stylesheetRefCount[ id ] = ++count
			return
		}
		var ss = document.createElement( "Link" )
		ss.setAttribute( "id", id );
		ss.setAttribute( "href", stylesheetHome + id.replace( /[.]/gi, "/" ) + ".css" )
		ss.setAttribute( "rel", "stylesheet" )
		ss.setAttribute( "type", "text/css" )
		document.getElementsByTagName( "head" )[ 0 ].appendChild( ss )
		stylesheetRefCount[ id ] = 1
	}
	global.$styleSheet = loadStylesheet;

	var removeStylesheet = function ( id ) {
		if ( stylesheetRefCount[ id ] ) {
			var count = --stylesheetRefCount[ id ]
			if ( count > 0 ) {
				stylesheetRefCount[ id ] = count
				return
			}
			delete stylesheetRefCount[ id ]
			var existing = document.getElementById( id );
			if ( existing ) {
				existing.parentNode.removeChild( existing );
			}
		}
	}
	global.$rStyleSheet = removeStylesheet;

	var listeners = {};
	var setGlobalCallback = function ( id, func, scope ) {
		listeners[ id ] = {
			func: func,
			scope: scope
		};
	}
	global.$setGlobalCallback = setGlobalCallback;

	var removeGlobalCallback = function ( id ) {
		delete listeners[ id ];
	}
	global.$removeGlobalCallback = removeGlobalCallback;
	var fireGlobalEvent = function ( id ) {
		var context = listeners[ id ];
		if ( context && typeof context.func == "function" ) {
			context.func.apply( context.scope, Array.prototype.slice.call( arguments, 1 ) )
		}
	}
	global.$fireGlobalEvent = fireGlobalEvent;

	//for json
	var isNativeJson = window.JSON && JSON.toString( ) == '[object JSON]'
	var jsonDecode, jsonEncode;
	if ( isNativeJson ) {
		jsonDecode = JSON.parse
		jsonEncode = JSON.stringify;
	} else {
		jsonDecode = function ( json ) {
			return eval( "(" + json + ')' );
		}

		jsonEncode = function ( ) {
			var toString = Object.prototype.toString,
				charToReplace = /[\\\"\x00-\x1f\x7f-\uffff]/g,
				m = {
					"\b": '\\b',
					"\t": '\\t',
					"\n": '\\n',
					"\f": '\\f',
					"\r": '\\r',
					'"': '\\"',
					"\\": '\\\\',
					'\x0b': '\\u000b'
				},
				useHasOwn = !! {}.hasOwnProperty,
				isDate = function ( value ) {
					return toString.call( value ) === '[object Date]'
				},
				isObject = ( toString.call( null ) === '[object Object]' ) ?
					function ( value ) {
						return value !== null && value !== undefined && toString.call( value ) === '[object Object]' && value.ownerDocument === undefined;
				} :
					function ( value ) {
						return toString.call( value ) === '[object Object]';
				},
				isBoolean = function ( value ) {
					return typeof value === 'boolean';
				},
				isArray = ( 'isArray' in Array ) ? Array.isArray : function ( value ) {
					return toString.call( value ) === '[object Array]';
				}
			encodeString = function ( s ) {
				return '"' + s.replace( charToReplace, function ( a ) {
					var c = m[ a ];
					return typeof c === 'string' ? c : '\\u' + ( '0000' + a.charCodeAt( 0 )
						.toString( 16 ) )
						.slice( -4 );
				} ) + '"';
			},
			pad = function ( n ) {
				return n < 10 ? "0" + n : n;
			},
			encodeDate = function ( o ) {
				return '"' + o.getFullYear( ) + "-" + pad( o.getMonth( ) + 1 ) + "-" + pad( o.getDate( ) ) + "T" + pad( o.getHours( ) ) + ":" + pad( o.getMinutes( ) ) + ":" + pad( o.getSeconds( ) ) + '"';
			},
			encodeArray = function ( o ) {
				var a = [ "[", "" ],
					len = o.length,
					i;
				for ( i = 0; i < len; i += 1 ) {
					a.push( doEncode( o[ i ] ), ',' );
				}

				a[ a.length - 1 ] = ']';
				return a.join( "" );
			},
			encodeObject = function ( o ) {
				var a = [ "{", "" ],
					i;
				for ( i in o ) {
					if ( !useHasOwn || o.hasOwnProperty( i ) ) {
						a.push( doEncode( i ), ":", doEncode( o[ i ] ), ',' );
					}
				}
				a[ a.length - 1 ] = '}';
				return a.join( "" );
			},
			doEncode = function ( o ) {
				if ( o === null || o === undefined ) {
					return "null";
				} else if ( isDate( o ) ) {
					return encodeDate( o );
				} else if ( typeof o === 'string' ) {
					return encodeString( o );
				} else if ( typeof o === "number" ) {
					return isFinite( o ) ? String( o ) : "null";
				} else if ( isBoolean( o ) ) {
					return String( o );
				} else if ( o.toJSON ) {
					return o.toJSON( );
				} else if ( isArray( o ) ) {
					return encodeArray( o );
				} else if ( isObject( o ) ) {
					return encodeObject( o );
				} else if ( typeof o === "function" ) {
					return "null";
				}
				return 'undefined';
			};
			return doEncode;
		}( );
	}
	global.$decode = jsonDecode;
	global.$encode = jsonEncode;

	//for class extends system
	var TemplateClass = function ( ) {};
	var chain = function ( object ) {
		TemplateClass.prototype = object;
		var result = new TemplateClass( );
		TemplateClass.prototype = null;
		return result;
	}

	var enumerables = [ 'hasOwnProperty', 'valueOf', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', 'toString', 'constructor' ];
	var noArgs = [ ];
	var apply = function ( object, config ) {
		if ( object && config && typeof config === 'object' ) {
			var i, j, k;

			for ( i in config ) {
				object[ i ] = config[ i ];
			}

			if ( enumerables ) {
				for ( j = enumerables.length; j--; ) {
					k = enumerables[ j ];
					if ( config.hasOwnProperty( k ) ) {
						object[ k ] = config[ k ];
					}
				}
			}
			return object;
		}
	}
	global.$apply = apply;
	var Base = function ( ) {};
	apply( Base, {
		$isClass: true,
		addMembers: function ( members ) {
			var prototype = this.prototype,
				names = [ ],
				i, ln, name, member;

			for ( name in members ) {
				names.push( name );
			}

			if ( enumerables ) {
				names.push.apply( names, enumerables );
			}

			for ( i = 0, ln = names.length; i < ln; i++ ) {
				name = names[ i ];
				if ( members.hasOwnProperty( name ) ) {
					member = members[ name ];
					if ( typeof member == 'function' && !member.$isClass ) {
						member.$owner = this;
						member.$name = name;
					}
					prototype[ name ] = member;
				}
			}

			return this;
		},
		extend: function ( superClass ) {
			var superPrototype = superClass.prototype,
				basePrototype, prototype, name;

			prototype = this.prototype = chain( superPrototype );
			this.superclass = prototype.superclass = superPrototype;

			if ( !superClass.$isClass ) {
				basePrototype = Base.prototype;
				for ( name in basePrototype ) {
					if ( name in prototype ) {
						prototype[ name ] = basePrototype[ name ];
					}
				}
			}
		}
	} );

	apply( Base.prototype, {
		$isInstance: true,
		callParent: function ( args ) {
			var method,
				superMethod = ( method = this.callParent.caller ) &&
					( method = method.$owner ? method : method.caller ) &&
					method.$owner.superclass[ method.$name ];
			return superMethod.apply( this, args || noArgs );
		},

		constructor: function ( ) {
			return this;
		}
	} );

	var makeCtor = function ( ) {
		function constructor( ) {
			return this.constructor.apply( this, arguments ) || null;
		}
		return constructor;
	};

	var extend = function ( newClass, overrides ) {
		var basePrototype = Base.prototype,
			newClassExtend = overrides.extend,
			superClass, superPrototype, name;

		delete overrides.extend;

		if ( newClassExtend && newClassExtend !== Object ) {
			superClass = newClassExtend;
		} else {
			superClass = Base;
		}

		superPrototype = superClass.prototype;

		if ( !superClass.$isClass ) {
			for ( name in basePrototype ) {
				if ( !superPrototype[ name ] ) {
					superPrototype[ name ] = basePrototype[ name ];
				}
			}
		}
		newClass.extend( superClass );
	};

	var define = function ( overrides ) {
		var newClass, name;

		if ( !overrides ) {
			overrides = {};
		}

		newClass = makeCtor( );
		for ( name in Base ) {
			newClass[ name ] = Base[ name ];
		}

		extend( newClass, overrides );
		newClass.addMembers( overrides );

		return newClass;
	}
	global.$class = define;

	var override = function ( cls, overrides ) {
		cls.addMembers( overrides );
	}
	global.$override = override;

	var classLoader = {
		appRootOffsetPath: appRootOffsetPath,
		stylesheetHome: stylesheetHome,
		eval: evalEx,
		emptyFunction: emptyFunction,
		createNewTransport: createNewTransport,
		destory: destoryScript,
		apply: apply,
		override: override,
		define: define
	};
	global.ClassLoader = classLoader;
	global.$AppContext = {};

	var loadAppScript = function ( ) {
		var path = window.location.pathname;

		if ( path.slice( 0, 1 ) != "/" ) { //for ie9preview bug
			path = "/" + path;
		}

		if ( path.substr( path.length - 1, 1 ) == "/" ) {
			path += "index.html";
		}
		var v = path.split( "/" );
		var n = v.length;
		if ( v[ n - 1 ].length > 0 ) {
			v[ n - 1 ] = v[ n - 1 ].split( "." )[ 0 ];
		}
		v[ 1 ] = "";
		v = v.slice( 1, v.length );
		if ( v.length == 2 && v[ 1 ] == '' ) {
			v[ 1 ] = ( 'index' );
		}
		$import( v.join( "." ) );
	};
	if ( config.autoloadAppScript ) {
		loadAppScript( );
	}
	var addRunningMask = function() {
	    $("<div id=\"global-running-mask\" class=\"running-mask\"></div>").css({ 
	    	display: "block", 
	    	width: "100%", 
	    	height: $(document).height(),
	    	'z-index': 9999999
	    }).appendTo("body");
	    $("<div id=\"global-running-mask-msg\" class=\"running-mask-msg\"></div>").html("正在处理，请稍候...")
	    	.appendTo("body").css({ 
	    		display: "block", 
	    		left: ($(document.body).outerWidth(true) - 190) / 2, 
	    		top: ($(document).height() - 45) / 2,
	    		'z-index': 99999999
	    	});
	}
	global.addRunningMask = addRunningMask;
	var removeRunningMask = function() {
	    $("div#global-running-mask").remove();
	    $("div#global-running-mask-msg").remove();
	}
	global.removeRunningMask = removeRunningMask;
} )( this );