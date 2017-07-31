$package("app.biz.ehrview")

$import("app.modules.list.SimpleListView","app.biz.eval.Sharedocs","app.biz.eval.Datasets")

app.biz.ehrview.EHRSearch = function(cfg) {
	app.biz.ehrview.EHRSearch.superclass.constructor.apply(this, [cfg])
	this.showButtonOnTop = true
}

Ext.extend(app.biz.ehrview.EHRSearch, app.modules.list.SimpleListView, {
	doCndQuery : function() {
		var initCnd = this.initCnd
		var index = this.cndFldCombox.getValue()
		var it = this.schema.items[index]
		if (!it) {
			return;
		}
		this.resetFirstPage()
		var f = this.cndField;
		var v = f.getValue()
		if (v == null || v == "") {
			this.queryCnd = null;
			this.requestData.cnd = initCnd
			this.refresh()
			return
		}
		if (it.id == "cardNo" || it.id == "idCard") {
			v = v.toUpperCase();
		}
		var refAlias = it.refAlias || "a"

		var cnd = ['eq', ['$', refAlias + "." + it.id]]
		if (it.dic) {
			if (it.dic.render == "Tree") {
				var node = this.cndField.selectedNode
				if (!node.isLeaf()) {
					cnd[0] = 'like'
					cnd.push(['s', v + '%'])
				} else {
					cnd.push(['s', v])
				}
			} else {
				cnd.push(['s', v])
			}
		} else {
			switch (it.type) {
				case 'int' :
					cnd.push(['i', v])
					break;
				case 'double' :
				case 'bigDecimal' :
					cnd.push(['d', v])
					break;
				case 'string' :
					cnd[0] = 'like'
					cnd.push(['s', v + '%'])
					break;
				case "date" :
					v = v.format("Y-m-d")
					cnd[1] = [
							'$',
							"str(" + refAlias + "." + it.id
									+ ",'yyyy-MM-dd')"]
					cnd.push(['s', v])
					break;
			}
		}
		this.queryCnd = cnd
		if (initCnd) {
			cnd = ['and', initCnd, cnd]
		}
		this.requestData.cnd = cnd
		this.refresh()
	},
	
	doEhrview : function() {
		var r = this.getSelectedRecord();
		if (r == null) {
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
			this.mainApp.sessionId = json.body.sessionId;
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
	
	onDblClick: function() {
		this.doEhrview()
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
	},
	
	doSetToSpecial: function() {
		var r = this.getSelectedRecord();
		if (!r || r.data.mpiLevel == '1') {
			return
		}
		util.rmi.jsonRequest({
			method : "execute",
			serviceId : this.setMPILevelService,
			schema : this.entryName,
			body : {
				mpiId: r.data.mpiId,
				type: 1
			}
		}, function(code, msg, json) {
			this.unmask()
			if (code > 300) {
				this.processReturnMsg(code, msg)
				return;
			} else {
				this.refresh()
			}
		}, this);
	},
	
	doSetToNormal: function() {
		var r = this.getSelectedRecord();
		if (!r || r.data.mpiLevel == '0') {
			return
		}
		util.rmi.jsonRequest({
			method : "execute",
			serviceId : this.setMPILevelService,
			schema : this.entryName,
			body : {
				mpiId: r.data.mpiId,
				type: 0
			}
		}, function(code, msg, json) {
			this.unmask()
			if (code > 300) {
				this.processReturnMsg(code, msg)
				return;
			} else {
				this.refresh()
			}
		}, this);
	},
	
	onRowClick : function(grid, index, e) {
		app.biz.ehrview.EHRSearch.superclass.onRowClick.call(this, grid, index, e);
		var r = this.getSelectedRecord();
		var toolBar = this.grid.getTopToolbar();
		if (!r) {
			for (var i = 0; i < this.actions.length; i++) {
				var btn = toolBar.find("cmd", this.actions[i].id);
				if (!btn || btn.length == 0) {
					continue;
				}
				btn[0].disable();
			}
			return;
		} else {
			for (var i = 0; i < this.actions.length; i++) {
				var btn = toolBar.find("cmd", this.actions[i].id);
				if (!btn || btn.length == 0) {
					continue;
				}
				btn[0].enable();
			}
		}
		var mpiLevel = r.get("mpiLevel");
		var ts = toolBar.find("cmd", "setToSpecial");// @@ 设为特殊人群
		var tn = toolBar.find("cmd", "setToNormal");// @@ 设为普通人群
		if (mpiLevel == '0') {
			if (tn && tn.length > 0) {
				tn[0].disable();
			}
			if (ts && ts.length > 0) {
				ts[0].enable();
			}
		} else if (mpiLevel == '1') {
			if (ts && ts.length > 0) {
				ts[0].disable();
			}
			if (tn && tn.length > 0) {
				tn[0].enable();
			}
		}
	},
	
	onStoreLoadData : function(store, records, ops) {
		app.biz.ehrview.EHRSearch.superclass.onStoreLoadData.call(this, store, records, ops);
		this.onRowClick(this.grid, this.selectedIndex);
		var girdcount = 0;
		store.each(function(r) {
			var mpiLevel = r.get("mpiLevel");
			if (mpiLevel == '1') {
				this.grid.getView().getRow(girdcount).style.backgroundColor = '#ffbeba';
			}
			girdcount += 1;
		}, this);
	},
	
	doSharedoc : function(){
		var r = this.getSelectedRecord();
		if (r == null) {
			return;
		}
		var mpiId = r.data.mpiId;
		var idCard = r.data.idCard;
		var service="sharedocs";
		var personName = r.data.personName;
		var birthday = r.data.birthday;
		var sexCode = r.data.sexCode;
//		window.open("tableDocForm.ehr?MPIID="+mpiId+"&service="+service+"&idCard="+idCard+"&personName="+encodeURI(encodeURI(personName)));
		var shareDoc=new app.biz.eval.Sharedocs(mpiId,idCard,service,birthday,sexCode);
		shareDoc.show(null,[280,30]);
	},
	
	doDataset : function(){
		var r = this.getSelectedRecord();
		if (r == null) {
			return;
		}
		var mpiId = r.data.mpiId;
		var idCard = r.data.idCard;
		var service="dataset";
		var personName = r.data.personName;
		var birthday = r.data.birthday;
		var sexCode = r.data.sexCode;
//		window.open("tableDocForm.ehr?MPIID="+mpiId+"&service="+service+"&idCard="+idCard+"&personName="+encodeURI(encodeURI(personName)));
		var dataset=new app.biz.eval.Datasets(mpiId,idCard,service,birthday,sexCode);
		dataset.show(null,[280,30]);
	}
});
