$import("lib.respond",
		"lib.JQuery.jquery",
		"lib.jqueryjson",
		"lib.bootstrap.bootstrap",
		"lib.icheckmin",
		"lib.jqueryztreecore",
		"lib.jqueryztreeexcheck",
		"lib.messengermin",
		"lib.jqueryPin");

var populations;
var roles;
var layouts;

//弹出信息配置
$._messengerDefaults = {
	extraClasses: 'messenger-fixed messenger-theme-block messenger-on-bottom messenger-on-right'
}

var getRoles = function() {
	return roles;
}

var setRoles = function(r) {
	roles = r;
}

var getPopulations = function() {
	return populations;
}

var setPopulations = function(p) {
	populations = p;
}

var getLayouts = function() {
	return layouts
}

var setLayouts = function(ls) {
	layouts = ls;
}

$(".pined").pin();

//机构树配置
var setting = {
	async: {
		enable: true,
		type: "get",
		url: "/ehrview/config/getManageUnit",
		autoParam: ["key", "pId"],
		dataFilter: filter
	},
	check: {
		enable: true,
		chkStyle: "radio",
		radioType: "all"
	},
	data: {
		key: {
			name: "text"
		},
		simpleData: {
			enable: true,
			idKey: "key",
			pIdKey: "pId"
		}
	},
	callback: {
		onCheck: onTreeClick,
		onAsyncSuccess: zTreeOnAsyncSuccess
	}
};


function zTreeOnAsyncSuccess(event, treeId, treeNode, msg) {
	var treeObj = $.fn.zTree.getZTreeObj(treeId);
	var ruleItemId = treeId.replace("tree-", "");
	var manaUnitId = $("#" + ruleItemId).find('.organization button').attr("manageUnitId");
	if (manaUnitId != undefined) {
		var nodes = treeObj.getNodesByParamFuzzy("key", manaUnitId, null);
		if (nodes && nodes.length > 0) {
			treeObj.checkNode(nodes[0], true)
		}
	}
	$(".organization > .dropdown-menu").click(function(event) {
		event.stopPropagation();
	});
}

function isScroll() {
	if ($(document)[0].documentElement.clientHeight < $(document)[0].documentElement.offsetHeight - 4) {
		$(".toTop").removeClass('hide')
	} else {
		$(".toTop").addClass('hide')
	}
}

$(document).on('click', ".toTop", function() {
	$("html,body").animate({
		"scrollTop": 0
	}, 500);
});


function onTreeClick(event, treeId, treeNode, clickFlag) {
	var text = treeNode.text
	var manageUnitId = treeNode.key;
	var rid = treeId.replace("tree-", "");
	$("#" + rid + " .expSave").removeClass('hide')
	if (treeNode.checked) {
		$("#" + rid + " .organization button").text(text)
		$("#" + rid + " .organization button").attr("manageUnitId", manageUnitId);
	} else {
		$("#" + rid + " .organization button").text("机构")
		$("#" + rid + " .organization button").attr("manageUnitId", "");
	}
}

function filter(treeId, parentNode, childNodes) {
	childNodes = childNodes.body
	if (!childNodes) {
		return null;
	}
	return childNodes;
}
var ruleItemHtml = "";

var getRuleItemHtml = function() {
	return ruleItemHtml;
}

var setRuleItemHtml = function(html) {
	ruleItemHtml = html;
}


//加载规则模板
function getRuleItem() {
	$.ajax({
		url : "ruleItem.html",
		async : false,
		cache : false
	}).done(function(html) {
		setRuleItemHtml(html);
	});
}

$(function() {
	getRuleItem();
	var ruleItem = getRuleItemHtml();
	//加载规则数据
	$.getJsonData({
		serviceId: "LayoutConfigService",
		method: "execute",
		action: "getExpList"
	}).done(function(data) {
		var body = data.body;
		if (body.length > 0) {
			getCrowdDataFromServer();
			getLayoutDataFromServer();
			getRoleDataFromServer();
			for (var i = 0; i < body.length; i++) {
				var bodyItem = body[i];
				var dcid = bodyItem["DCID"];
				var ruleItemId = "rule-" + dcid;
				var ruleDiv = "<div id='" + ruleItemId + "' ruleId='" + dcid + "'></div>"
				$(".col-md-11").append(ruleDiv);
				$("#" + ruleItemId).append(ruleItem);
				getCrowdData(ruleItemId);
				getOrganizationData(ruleItemId);
				getLayoutData(ruleItemId);
				getRoleData(ruleItemId);
				$("#" + ruleItemId).find('.crowd ul li').each(function(index) {
					if ($(this).attr("crowdId") == bodyItem.Population) {
						$(this).find('input').iCheck('check');
					}
				});
				
				$("#" + ruleItemId).find('.role ul li').each(function(index) {
					if ($(this).attr("roleId") == bodyItem.RoleId) {
						$(this).find('input').iCheck('check');
					}
				});
				
				$("#" + ruleItemId).find('.layout ul li').each(function(index) {
					if ($(this).attr("layoutId") == bodyItem.LayoutId) {
						$(this).find('input').iCheck('check');
					}
				});
				
				$("#" + ruleItemId).find('.organization button').text(bodyItem.ManageUnit_Text);
				$("#" + ruleItemId).find('.organization button').attr('manageUnitId', bodyItem.ManageUnit);
			}
		}
		window.onresize = isScroll;
		isScroll();
		$('input').iCheck({
			checkboxClass: 'icheckbox_square-blue',
			radioClass: 'iradio_square-blue',
			increaseArea: '20%' // optional
		});

		$(".expSave").addClass('hide')
	})

	//添加数据
	$(".expAdd").bind('click', function(event) {
		var ruleItemId = "rule-" + new Date().getTime();
//		if ($("div[id^=rule-]:last").attr('saved') == 'false') {
//			$.globalMessenger().post({
//				message: '请先保存当前新增项',
//				type: 'error',
//				showCloseButton: true
//			});
//			return;
//		}
		var newStr = "<div id=" + ruleItemId + " saved='false'><a name=" + ruleItemId + "></a></div>";
		$(".col-md-11").append(newStr)
		$("#" + ruleItemId).append(ruleItem);

		isScroll();
		getRoleData(ruleItemId);
		getCrowdData(ruleItemId);
		getOrganizationData(ruleItemId);
		getLayoutData(ruleItemId);
		location.hash = ruleItemId;
		$("#" + ruleItemId + " .expSave").removeClass('hide')

		$("#" + ruleItemId + ' input').iCheck({
			checkboxClass: 'icheckbox_square-blue',
			radioClass: 'iradio_square-blue',
			increaseArea: '20%' // optional
		});
	});

	//删除数据
	$(".expDel").bind('click', function(event) {
		if ($(".roleItmeCheck").parent().hasClass('checked')) {
			var savedList = [];
			var unsavedList = [];
			$(".roleItmeCheck").each(function() {
				if ($(this).parent().hasClass('checked')) {
					var rule = $(this).parent().parent().parent().parent();
					if (rule.attr('saved') == 'false') {
						unsavedList.push(rule.attr('id'));
					} else {
						savedList.push(rule.attr('ruleId'));
					}
				}
			})
			for (var i = 0; i < unsavedList.length; i++) {
				var delId = unsavedList[i];
				$('#' + delId).remove();
			}
			if (savedList.length > 0) {
				$.getJsonData({
					serviceId: "LayoutConfigService",
					method: "execute",
					action: "delExp",
					delIds: savedList
				}, true).done(function(data) {
					for (var i = 0; i < savedList.length; i++) {
						$('div[ruleid=' + savedList[i] + ']').remove();
					}
					isScroll();
					$.globalMessenger().post({
						message: '删除成功',
						type: 'success',
						showCloseButton: true
					});
				});
			} else {
				$.globalMessenger().post({
					message: '删除成功',
					type: 'success',
					showCloseButton: true
				});
			}
		} else {
			$.globalMessenger().post({
				message: '请勾选要删除的项',
				type: 'error',
				showCloseButton: true
			});
			return;
		}
	});

	$(".role > .dropdown-menu").click(function(event) {
		event.stopPropagation();
	});

	$(".crowd > .dropdown-menu").click(function(event) {
		event.stopPropagation();
	});

	$(".layout > .dropdown-menu").click(function(event) {
		event.stopPropagation();
	});
});

var getRoleDataFromServer = function() {
	$.getJsonData({
		serviceId: "LayoutConfigService",
		method: "execute",
		action: "getRoleList"
	}, true).done(function(data) {
		setRoles(data.body);
	});
}

//获取角色数据
var getRoleData = function(itId) {
	var roles = getRoles();
	if (!roles) {
		$.getJsonData({
			serviceId: "LayoutConfigService",
			method: "execute",
			action: "getRoleList"
		}, true).done(function(data) {
			setRoles(data.body);
			setPageRoles(itId, data.body);
		});
	} else {
		setPageRoles(itId, roles);
	}
}

var setPageRoles = function(itId, r) {
	for (var i = 0; i < r.length; i++) {
		var role = r[i];
		var str = "<li roleId=" + role['key'] + "><a href='#'><input type='checkbox'>" + role['text'] + "</a></li>";
		$("#" + itId + " .role > ul").append(str);
	}
	$("#" + itId + " .role input").on('ifChecked', function(event) {
		$(this).parent().parent().parent().siblings().find('input').iCheck('uncheck');
		var text = $(this).parent().parent().text()
		var roleId = $(this).parent().parent().parent().attr('roleId');
		if (roleId == undefined) {
			roleId = $(this).parent().parent().attr('roleId');
		}
		if ($("#" + itId + " .role button").text() != text) {
			$("#" + itId + " .expSave").removeClass('hide')
		}
		if ($("#" + itId + " .role button").text() == "角色") {
			$("#" + itId + " .role button").text(text)
			$("#" + itId + " .role button").attr('roleId', roleId);
		} else {
			$("#" + itId + " .role button").text($("#" + itId + " .role button").text() + "," + text)
			$("#" + itId + " .role button").attr('roleId', $("#" + itId + " .role button").attr("roleId") + "," + roleId);
		}
	});

	$("#" + itId + " .role input").on('ifUnchecked', function(event) {
		var text = $(this).parent().parent().text()
		var roleId = $(this).parent().parent().parent().attr('roleId');
		if (roleId == undefined) {
			roleId = $(this).parent().parent().attr('roleId');
		}
		var t = $("#" + itId + " .role button").text()
		var roles = $("#" + itId + " .role button").attr('roleId');
		if (t.indexOf(text) != 0) {
			var s = t.replace("," + text, "")
			var rs = roles.replace("," + roleId, "")
		} else {
			var s = t.replace(text, "")
			var rs = roles.replace(roleId, "")
		}
		if (s == "" || s == ",") {
			$("#" + itId + " .role button").text("角色")
			$("#" + itId + " .role button").attr('roleId', '');
		} else {
			if (s.charAt(0) == ",") {
				$("#" + itId + " .role button").text(s.replace(",", ""));
				$("#" + itId + " .role button").attr('roleId', rs.replace(",", ""));
			} else {
				$("#" + itId + " .role button").text(s)
				$("#" + itId + " .role button").attr('roleId', rs);
			}
		}
		if ($("#" + itId + " .role button").text() != text) {
			$("#" + itId + " .expSave").removeClass('hide')
		}
	});
}

var getCrowdDataFromServer = function() {
	$.getJsonData({
		serviceId: "LayoutConfigService",
		method: "execute",
		action: "getAllPopulations"
	}, true).done(function(data) {
		setPopulations(data.body);
	});
}

//获取人群数据
var getCrowdData = function(itId) {
	var pops = getPopulations();
	if (!pops) {
		$.getJsonData({
			serviceId: "LayoutConfigService",
			method: "execute",
			action: "getAllPopulations"
		}, true).done(function(data) {
			setPopulations(data.body);
			setPagePopulations(itId, data.body);
		});
	} else {
		setPagePopulations(itId, pops);
	}
}

var setPagePopulations = function(itId, p) {
	for (var populat in p) {
		var str = "<li crowdId=" + p[populat] + "><a href='#'><input type='checkbox' name='crowdoptionsRadios-" + itId + "'>" + populat + "</a></li>";
		$("#" + itId + " .crowd > ul").append(str)
	}
	$("#" + itId + " .crowd > ul>li>a").each(function() {
		$(this).click(function() {
			return false;
		})
	});

	$("#" + itId + " .crowd input").on('ifChecked', function(event) {
		$(this).parent().parent().parent().siblings().find('input').iCheck('uncheck');
		var text = $(this).parent().parent().text();
		var crowdId = $(this).parent().parent().parent().attr('crowdId');
		if (crowdId == undefined) {
			crowdId = $(this).parent().parent().attr('crowdId');
		}
		if ($("#" + itId + " .crowd button").text() != text) {
			$("#" + itId + " .expSave").removeClass('hide');
		}
		if ($("#" + itId + " .crowd button").text() == "人群") {
			$("#" + itId + " .crowd button").text(text);
			$("#" + itId + " .crowd button").attr('crowdId', crowdId);
		} else {
			$("#" + itId + " .crowd button").text($("#" + itId + " .crowd button").text() + "," + text);
			$("#" + itId + " .crowd button").attr('crowdId', $("#" + itId + " .crowd button").attr('crowdId') + "," + crowdId);
		}
	});
	$("#" + itId + " .crowd input").on('ifUnchecked', function(event) {
		var text = $(this).parent().parent().text()
		var crowdId = $(this).parent().parent().parent().attr('crowdId');
		if (crowdId == undefined) {
			crowdId = $(this).parent().parent().attr('crowdId');
		}
		var t = $("#" + itId + " .crowd button").text()
		var crowds = $("#" + itId + " .crowd button").attr('crowdId');

		if (t.indexOf(text) != 0) {
			var s = t.replace("," + text, "")
			var cr = crowds.replace("," + crowdId, "");
		} else {
			var s = t.replace(text, "")
			var cr = crowds.replace(crowdId, "");
		}

		if (s == "" || s == ",") {
			$("#" + itId + " .crowd button").text("人群")
			$("#" + itId + " .crowd button").attr('crowdId', '');
		} else {
			if (s.charAt(0) == ",") {
				$("#" + itId + " .crowd button").text(s.replace(",", ""));
				$("#" + itId + " .crowd button").attr('crowdId', cr.replace(",", ""));
			} else {
				$("#" + itId + " .crowd button").text(s)
				$("#" + itId + " .crowd button").attr('crowdId', cr);
			}
		}
		if ($("#" + itId + " .crowd button").text() != text) {
			$("#" + itId + " .expSave").removeClass('hide')
		}
	});
}

//初始机构树
var getOrganizationData = function(itId) {
	var ulStr = "<ul id=tree-" + itId + " class='dropdown-menu ztree' role='menu'</ul>";
	$("#" + itId + " .organization").append(ulStr)
	$.fn.zTree.init($("#tree-" + itId), setting);
}

var getLayoutDataFromServer = function() {
	$.getJsonData({
		serviceId: "LayoutConfigService",
		method: "execute",
		action: "layoutList"
	}, true).done(function(data) {
		setLayouts(data.body);
	});
}

//获取布局数据
var getLayoutData = function(itId) {
	var layouts = getLayouts();
	if (!layouts) {
		$.getJsonData({
			serviceId: "LayoutConfigService",
			method: "execute",
			action: "layoutList"
		}, true).done(function(data) {
			setLayouts(data.body);
			setPageLayoutData(itId, data.body)
		});
	} else {
		setPageLayoutData(itId, layouts)
	}
}

var setPageLayoutData = function(itId, layouts) {
	var html = '';
	for (var i = 0; i < layouts.length; i++) {
		var item = layouts[i]
		var str = "<li layoutId=" + item["RecordID"] + "><a href='#'><input type='radio' name='optionsRadios-" + itId + "'>" + item["LayoutText"] + "</a></li>";
		html += str;
	}
	$("#" + itId + " .layout > ul").html(html);
	$("#" + itId + " .layout > ul>li>a").each(function() {
		$(this).click(function() {
			return false;
		})
	});
	
	$("#" + itId + " .layout input").on('ifChecked', function(event) {
		var text = $(this).parent().parent().text();
		var layoutId = $(this).parent().parent().parent().attr('layoutId');
		if (layoutId == undefined) {
			layoutId = $(this).parent().parent().attr('layoutId');
		}
		if ($("#" + itId + " .layout button").text() != text) {
			$("#" + itId + " .expSave").removeClass('hide')
		}
		if ($("#" + itId + " .layout button").text() == "布局") {
			$("#" + itId + " .layout button").text(text)
			$("#" + itId + " .layout button").attr('layoutId', layoutId);
		} else {
			$("#" + itId + " .layout button").text($("#" + itId + " .layout button").text() + "," + text)
			$("#" + itId + " .layout button").attr('layoutId', layoutId);
		}
	});

	$("#" + itId + " .layout input").on('ifUnchecked', function(event) {
		var text = $(this).parent().parent().text()
		var layoutId = $(this).parent().parent().parent().attr('layoutId');
		if (layoutId == undefined) {
			layoutId = $(this).parent().parent().attr('layoutId');
		}
		var t = $("#" + itId + " .layout button").text()

		if (t.indexOf(text) != 0) {
			var s = t.replace("," + text, "")
		} else {
			var s = t.replace(text, "")
		}

		if (s == "" || s == ",") {
			$("#" + itId + " .layout button").text("布局")
		} else {
			if (s.charAt(0) == ",") {
				$("#" + itId + " .layout button").text(s.replace(",", ""));
			} else {
				$("#" + itId + " .layout button").text(s)
				$("#" + itId + " .layout button").attr('layoutId', "");
			}
		}
		if ($("#" + itId + " .layout button").text() != text) {
			$("#" + itId + " .expSave").removeClass('hide')
		}
	});
}

$.getJsonData = function(data, async) {
	if (!async) {
		async = true;
	} else {
		async = false;
	}
	return $.ajax("/ehrview/*.jsonRequest", {
		data: $.toJSON(data),
		dataType: 'json',
		async: async,
		contentType: 'application/json; charset=UTF-8',
		type: 'POST'
	})
};

//保存数据
$(document).on('click', ".expSave", function() {
	var ruleItemId = $(this).parent().parent().parent().attr("id");
	var saved = $('#' + ruleItemId).attr('saved');
	var role = $("#" + ruleItemId + " .role button").attr('roleId');
	var crowd = $("#" + ruleItemId + " .crowd button").attr('crowdId');
	var layout = $("#" + ruleItemId + " .layout button").attr('layoutId');
	var manageUnit = $("#" + ruleItemId + " .organization button").attr('manageUnitId');
	var manageUnit_text = $("#" + ruleItemId + " .organization button").text();

	if (role == undefined && crowd == undefined && manageUnit == undefined) {
		$.globalMessenger().post({
			message: '请在角色人群机构中至少勾选一个选项!',
			type: 'error',
			showCloseButton: true
		});
		return;
	}
	if (layout == undefined) {
		$.globalMessenger().post({
			message: '请选择一个布局!',
			type: 'error',
			showCloseButton: true
		});
		return;
	}
	var saveData = {
		"role": role,
		"crowd": crowd,
		"layout": layout,
		"manageUnit": manageUnit,
		"manageUnit_text": manageUnit_text
	}
	var ruleId = $('#' + ruleItemId).attr('ruleId');
	if (!saved || saved != 'false') {
		saveData.ruleId = ruleId;
	}

	$.getJsonData({
		serviceId: "LayoutConfigService",
		method: "execute",
		action: "saveExp",
		saveData: saveData
	}, true).done(function(data) {
		if (data.status == "200") {
			$("#" + ruleItemId + " .expSave").addClass('hide')
			$('#' + ruleItemId).attr('saved', 'true');
			$('#' + ruleItemId).attr('ruleId', data.ruleId);
			$.globalMessenger().post({
				message: '保存成功',
				type: 'success',
				showCloseButton: true
			});
			$('div[id^=rule-]').each(function() {
				$(this).children('nav').css('border', '');
			});
		} else if (data.status == "205") {
			$('div[ruleid=' + data.ruleId + ']').children('nav').css('border', '1px solid #FF0000');
			$.globalMessenger().post({
				message: '该规则已经存在',
				type: 'error',
				showCloseButton: true
			});
		} else {
			$.globalMessenger().post({
				message: '规则保存失败',
				type: 'error',
				showCloseButton: true
			});
		}
	});
});