/*
 *添加应用
 */
$import("lib.jqueryztreecore",
		"lib.jqueryztreeexcheck");
var appListData;
var appHtmlStr = "<div class='appsList'>";
var loadApp = function() {
//	var addContent = $(".bs-docs-example").each(function(index) {
//		var $mod = $("#" + this.id);
//		var $addButton = $mod.find('.addButton');
//		var appContentId = this.id;
//	})
}

var getAppList = function($appContent, appContentId) {
	var initAppList = function(data) {
		var setting = {
			check: {
				enable: true,
				chkboxType: {
					"Y": "ps",
					"N": "ps"
				}
			}
		};
		$("#" + appContentId + "_tree").removeClass("hide")
		$("#" + appContentId + "_tree").css({
			'display': 'inline-block'
		});
		// @@ 已经添加过的app把checkbox去掉，不能重复添加。
		for (var i in data) {
			var apps = data[i].children;
			for (var j in apps) {
				if ($('#' + apps[j].id).length > 0 || $('#li_' + apps[j].id).length > 0) {
					apps[j].nocheck = true;
				} else {
					apps[j].nocheck = false;
				}
			}
		}
		$.fn.zTree.init($("#" + appContentId + "_tree"), setting, data);

		$("#" + appContentId + "appList").find('.portlet-foot').removeClass("hide")

		$("#" + appContentId + "appList").find('.portlet-foot').css({
			'display': 'inline-block'
		});

		$("#" + appContentId + "_btn").bind('click', function(event) {
			if ($(this).text() == "确定") {
				var treeObj = $.fn.zTree.getZTreeObj(appContentId + "_tree");
				var nodes = treeObj.getCheckedNodes(true);
				addApp(nodes, appContentId)
			} else {
				addAppList(appContentId);
				loadApp();
			}
		});
		$("#" + appContentId + "_backBtn").bind('click', function(event) {
			addAppList(appContentId);
			loadApp();
		});
	}
	if (appListData) {
		initAppList(appListData);
	} else {
		$.getJsonData({
			serviceId: "LayoutConfigService",
			method: "execute",
			action: "getAPPList"
		}).done(function(res) {
			var data = res.body;
			appListData = data;
			initAppList(data);
		}).fail(function() {
		}).always(function() {
		});
	}
}

var addApp = function(nodes, appContentId) {
	var appData = [];
	for (var i = 0; i < nodes.length; i++) {
		if ($('#' + nodes[i].id).length > 0 || $('#li_' + nodes[i].id).length > 0) {
			$.globalMessenger().post({
				message: '模块[' + nodes[i].name + ']已经被添加过了',
				type: 'error',
				showCloseButton: true
			});
			return;
		}
		appData[i] = {
			"id": nodes[i].id,
			"name": nodes[i].name
		}
	}
	$("#" + appContentId).empty();
	loadApps(nodes, appContentId)
	editData[appContentId] = appData
}