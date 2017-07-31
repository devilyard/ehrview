$package( "app.biz.ehrview" )

$import( "app.modules.list.SimpleListView" )

app.biz.ehrview.BrowsingList = function ( cfg ) {
	app.biz.ehrview.BrowsingList.superclass.constructor.apply( this, [ cfg ] )
	this.autoLoadData = true
	this.disablePagingTbr = false
}

Ext.extend(app.biz.ehrview.BrowsingList, app.modules.list.SimpleListView, {
	doCndQuery: function ( ) {
		var initCnd = this.initCnd
		var index = this.cndFldCombox.getValue( )
		var it = this.schema.items[ index ]

		if ( !it ) {
			return;
		}
		this.resetFirstPage( )
		var f = this.cndField;
		var v = f.getValue( )
		if ( v == null || v == "" ) {
			this.queryCnd = null;
			this.requestData.cnd = initCnd
			this.refresh( )
			return
		}
		var refAlias = it.refAlias || "a"

		var cnd = [ 'eq', [ '$', refAlias + "." + it.id ] ]
		if ( it.dic ) {
			if ( it.dic.render == "Tree" ) {
				var node = this.cndField.selectedNode
				if ( !node.isLeaf( ) ) {
					cnd[ 0 ] = 'like'
					cnd.push( [ 's', v + '%' ] )
				} else {
					cnd.push( [ 's', v ] )
				}
			} else {
				cnd.push( [ 's', v ] )
			}
		} else {
			switch ( it.type ) {
			case 'int':
				cnd.push( [ 'i', v ] )
				break;
			case 'double':
			case 'bigDecimal':
				cnd.push( [ 'd', v ] )
				break;
			case 'string':
				cnd[ 0 ] = 'like'
				cnd.push( [ 's', v + '%' ] )
				break;
			case "date":
				v = v.format( "Y-m-d" )
				cnd[ 1 ] = [ '$',
					"str(" + refAlias + "." + it.id + ",'yyyy-MM-dd')"
				]
				cnd.push( [ 's', v ] )
				break;
			}
		}
		this.queryCnd = cnd
		if ( initCnd ) {
			cnd = [ 'and', initCnd, cnd ]
		}
		this.requestData.cnd = cnd
		this.refresh( )
	},

	doEhrview: function ( ) {
		var r = this.getSelectedRecord( );
		if ( r == null ) {
			return;
		}
		var mpiId = r.data.mpiId;
		util.rmi.jsonRequest({
			method : "execute",
			serviceId : 'sessionIdService'
		}, function(code, msg, json) {
			if (code != 200) {
				this.processReturnMsg(code, msg)
				return;
			}
//			this.mainApp.sessionId = json.body.sessionId;
			var url = "pages/viewPortal.html?vk=" + json.body.sessionId + "-" + mpiId
			var exploreType = this.getExploreType();
			if(exploreType.ie) {//IE 
				feature="dialogHeight:" + window.screen.height + "px;dialogWidth:" 
						+ window.screen.width + "px;status:no;help:no";  
				window.showModalDialog(url,null,feature);  
	   		} else if (exploreType.firefox){
				feature = "fullscreen=1,menubar=no,toolbar=no,location=no,";
				feature += "scrollbars=yes,status=no,modal=yes";
				window.open( url, null, feature );
			} else {
				feature = "menubar=no,toolbar=no,location=no,";
				var heightL= window.screen.height-110;
				var widthL= window.screen.width-10;
				feature += "width=" + widthL + ",height=" + heightL + ",";
				feature += "scrollbars=yes,status=no,modal=yes";
				window.open( url, null, feature );
			}
		}, this);
	},

	onDblClick: function ( ) {
		this.doEhrview( )
	},
	
	getExploreType: function() {
		var sys = {};
		var ua = navigator.userAgent.toLowerCase();
		var s;
		(s = ua.match(/msie ([\d.]+)/)) ? sys.ie = s[1] :
			(s = ua.match(/firefox\/([\d.]+)/)) ? sys.firefox = s[1] :
				(s = ua.match(/chrome\/([\d.]+)/)) ? sys.chrome = s[1] :
					(s = ua.match(/opera.([\d.]+)/)) ? sys.opera = s[1] :
						(s = ua.match(/version\/([\d.]+).*safari/)) ? sys.safari = s[1] : 0;
		return sys;
	}
} )