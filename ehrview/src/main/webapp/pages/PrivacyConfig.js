$import("lib.respond");
$import("lib.JQuery.jquery");
$import("lib.jqueryjson");
$import("lib.bootstrap.bootstrap");
$import("lib.icheckmin");
$import("lib.messengermin");

$._messengerDefaults = {
	extraClasses: 'messenger-fixed messenger-theme-block messenger-on-bottom messenger-on-right'
}

var ArrayFun = function() {};
ArrayFun.prototype = new Array(); //继承数组

//按v值删数组元素
ArrayFun.prototype.spliceObjForValue = function(k, v) {
	this.every(function(e, i, a) {
		if (v == e[k]) {
			a.splice(i, 1)
		};
		return true;
	})
};

//判断数组是否含有v值
ArrayFun.prototype.containValue = function(k, v) {
	var flag = false;
	this.every(function(e, i, a) {
		if (e[k] == v) flag = true;
		return true;
	})
	return flag;
}

//复制数组
ArrayFun.prototype.clone = function(obj) {
	if (typeof obj != 'object') return new obj.constructor();
	for (var key in obj) {
		if (this[key] != obj[key]) {
			this[key] = obj[key];
		}
	}
	this.length = obj.length;
}

$(document).ready(function() {
	//加载隐私模板
	$.get("../partials/privacyConfig.html", {}, function(data, textStatus, xhr) {
		var html = $.parseHTML(data);
		$("#privacyConfig").append(html)
		var rData = {}
		var privacyConfigData = getPrivacyData(rData);
		buildAccordionPanel("diseases", privacyConfigData.jb);
		buildAccordionPanel("ss", privacyConfigData.ss);
		$('.collapse').collapse()
	})

	//加载角色模板
	$.get("../partials/jobConfig.html", {}, function(data, textStatus, xhr) {
		var html = $.parseHTML(data);
		$("#jobConfig").append(html)

		var roleList = new ArrayFun();
		$.getJsonPOSTData({
			serviceId: "LayoutConfigService",
			method: "execute",
			action: "getRoleList"
		}, true).done(function(data) {
			if (data.code == 403) {
				alert('会话超时，请重新登录后再次打开本页面');
				return;
			}
			var body = data.body
			roleList.clone(body);
		})

		//获取角色配置
		$.getJsonData('privacy/getRoleConfig').done(function(data) {
			var body = data.body;
			var authorized = body.authorized;
			//var common = body.common;
			var privacy = body.privacy;
			if (authorized != null) {
				var authorizedFun = new ArrayFun();
				authorizedFun.clone(authorized);

				for (var i = 0; i < authorized.length; i++) {
					if (!roleList.containValue('key', authorized[i].roleId)) {
						authorizedFun.spliceObjForValue('roleId', authorized[i].roleId);
					}
				}
				for (var j = 0; j < authorizedFun.length; j++) {
					var bodyItem = authorizedFun[j];
					roleList.spliceObjForValue('key', bodyItem.roleId)
					var bodyStr = "<option value=" + bodyItem.roleId + ">" + bodyItem.roleName + "</option>"
					$("#sqys").append(bodyStr);
				}
			}

			if (privacy != null) {
				var privacyFun = new ArrayFun();
				privacyFun.clone(privacy);
				for (var i = 0; i < privacy.length; i++) {
					if (!roleList.containValue('key', privacy[i].roleId)) {
						privacyFun.spliceObjForValue('roleId', privacy[i].roleId);
					};
				}

				for (var j = 0; j < privacyFun.length; j++) {
					var bodyItem = privacyFun[j];
					roleList.spliceObjForValue('key', bodyItem.roleId)
					var bodyStr = "<option value=" + bodyItem.roleId + ">" + bodyItem.roleName + "</option>"
					$("#gbys").append(bodyStr);
				}
			}

			for (var i = 0; i < roleList.length; i++) {
				var bodyItem = roleList[i];
				var bodyStr = "<option value=" + bodyItem.key + ">" + bodyItem.text + "</option>"
				$("#jclb").append(bodyStr);
			}
		})
	})
})

//构建面板
function buildPanel(container, title, body) {
	var panelStr = '<div id="' + body + '"   class="panel panel-default"><div class="panel-heading"><h2 class="panel-title">';
	panelStr = panelStr + title;
	panelStr = panelStr + '</h2></div><div class="panel-body"></div></div>';
	$("#" + container)
		.append(panelStr)
}

//构建面板组
$(document).on("mouseover", ".checkbox", function(event) {
	$(this).find("span").removeClass("hide");
	$(this).siblings().find("span").addClass("hide");
	event.stopPropagation();
})

$(document).on("click", ".privacyClose", function(event) {
	var key = $(this).parent().find("input").attr("id");
	$.ajax("/ehrview/config/delDiseases", {
		data: $.toJSON({
			"key": key
		}),
		contentType: 'application/json; charset=UTF-8',
		type: 'POST'
	}).done(function() {
		var rData = {}
		var privacyConfigData = getPrivacyData(rData);
		buildAccordionPanel("diseases", privacyConfigData.jb);
		buildAccordionPanel("ss", privacyConfigData.ss);
		$('.collapse').collapse()
	})

})


function buildAccordionPanel(container, body) {
	$("#" + container + " .panel-body ").eq(0).empty();
	var panelGroupStr = "";
	for (var b in body) {
		var itemB = body[b]
		var panelStr = '<div class="panel panel-default"><div class="panel-heading"><h4 class="panel-title">';
		panelStr = panelStr + ' <a data-toggle="collapse" data-toggle="collapse" data-parent="#accordion" href="#' + b + '">' + itemB.text + '</a>';
		panelStr = panelStr + '</h4></div> <div id="' + b + '" class="panel-collapse collapse"><div class="panel-body">';
console.log($.toJSON(itemB))		
		if (itemB.content.length > 0) {
			for (var j = 0; j < itemB.content.length; j++) {
				var o = itemB.content[j];
				if (o.checkFlag == "true") {
					var checkStr = '<div class="checkbox"><label><input id=' + o.id + ' type="checkbox" value="" checked>  ' + o.text + '</label><span class="privacyClose glyphicon glyphicon-remove hide"></span></div>';
				} else {
					var checkStr = '<div class="checkbox"><label><input id=' + o.id + ' type="checkbox" value="">  ' + o.text + '</label><span class="privacyClose glyphicon glyphicon-remove hide"></span></div>';
				}
				panelStr = panelStr + checkStr
			}
		}
		panelStr = panelStr + "<a id='" + b + "-add' class='addItem'>添加更多</a></div></div></div>"
		panelGroupStr = panelGroupStr + panelStr;
		var panelGroupStr = panelGroupStr + "</div>";
	}


	$("#" + container + " .panel-body ").append(panelGroupStr);
	$("#" + container + " .panel-body input").iCheck({
		checkboxClass: 'icheckbox_square-blue',
		radioClass: 'iradio_square-blue',
		increaseArea: '20%' // optional
	});

	$("#" + container + " .panel-body input").on('ifChecked', function(event) {
		var key = this.id
		$.ajax("/ehrview/config/eidtDiseases", {
			data: $.toJSON({
				"key": key,
				"checkFlag": "true"
			}),
			contentType: 'application/json; charset=UTF-8',
			type: 'POST'
		})
	});

	$("#" + container + " .panel-body input").on('ifUnchecked', function(event) {
		var key = this.id
		$.ajax("/ehrview/config/eidtDiseases", {
			data: $.toJSON({
				"key": key,
				"checkFlag": "false"
			}),
			contentType: 'application/json; charset=UTF-8',
			type: 'POST'
		})
	});
}

//弹出添加字典
$(document).on("click", ".addItem", function() {
	var tId = $(this).attr('id').replace("-add", "");
	if ($("#" + tId + "-mod").length == 0) {
		$.get("../partials/popUp/privacyItem.html", {}, function(data, textStatus, xhr) {
			var html = $.parseHTML(data);
			$("#" + tId).append(html);
			$("#" + tId + " .modal").attr('id', tId + "-mod");
			$("#" + tId + "-mod").modal("show")
		})
	} else {
		$("#" + tId + "-mod").modal("show")
	}

});

//保存内容
$(document).on("click", ".modal .save", function() {
	var parentId = $(this).parent().parent().parent().parent().parent().attr('id')
	var text = $(this).parent().find('.name').val()
	if (!text) {
		$.globalMessenger().post({
			message: '名称必须填写',
			type: 'error',
			showCloseButton: true
		});
		return;
	}
	$.ajax("/ehrview/config/addDiseases", {
		data: $.toJSON({
			"parentId": parentId,
			"text": text
		}),
		contentType: 'application/json; charset=UTF-8',
		type: 'POST'
	}).done(function() {
		$("#" + parentId + "-mod").on('hidden.bs.modal', function(e) {
			var rData = {}
			var privacyConfigData = getPrivacyData(rData);
			buildAccordionPanel("diseases", privacyConfigData.jb);
			buildAccordionPanel("ss", privacyConfigData.ss);
			$('.collapse').collapse()
		})
		$("#" + parentId + "-mod").modal("hide")
	})
})

//添加过滤角色
$(document).on("click", " .add", function() {
	var sId = $(this).parent().parent().attr("id").replace("bar", "");
	var dobj = $("#" + sId)[0];
	for (var i = 0; i < dobj.options.length; i++) {
		if (dobj.options[i].value == $("#jclb").val()) {
			$.globalMessenger().post({
				message: '请不要添加重复的选项!',
				type: 'error',
				showCloseButton: true
			});
			return;
		}
	}

	if ($("#jclb").val() == null) {
		$.globalMessenger().post({
			message: '请在角色列表中选中一项!',
			type: 'error',
			showCloseButton: true
		});
		return;
	} else {
		$("#" + sId).append('<option value=' + $("#jclb").val() + '>' + $("#jclb").find("option:selected").text() + '</option>');
		$("#jclb option[value='" + $("#jclb").val() + "']").remove();
	}


	var commonData = [];
	var authorizedData = [];
	var privacyData = [];

	var common = $("#jclb")[0];
	var authorized = $("#sqys")[0];
	var privacy = $("#gbys")[0];
	for (var i = 0; i < common.options.length; i++) {
		var o = {
			"roleId": common.options[i].value,
			"roleName": common.options[i].text
		}
		commonData.push(o);
	}

	for (var i = 0; i < authorized.options.length; i++) {
		var o = {
			"roleId": authorized.options[i].value,
			"roleName": authorized.options[i].text
		}
		authorizedData.push(o);
	}

	for (var i = 0; i < privacy.options.length; i++) {
		var o = {
			"roleId": privacy.options[i].value,
			"roleName": privacy.options[i].text
		}
		privacyData.push(o);
	}
	$.ajax("/ehrview/privacy/saveRoleConfig", {
		data: $.toJSON({
			"common": commonData,
			"authorized": authorizedData,
			"privacy": privacyData
		}),
		contentType: 'application/json; charset=UTF-8',
		type: 'POST'
	})
})


//删除过虑项

$(document).on("click", " .del", function() {
	var sId = $(this).parent().parent().attr("id").replace("bar", "");
	var dobj = $("#" + sId)[0];
	var delIndex;
	for (var i = 0; i < dobj.options.length; i++) {
		if (dobj.options[i].value == $("#" + sId).val()) {
			delIndex = i;
		}
	}

	if ($("#" + sId).val() == null) {
		$.globalMessenger().post({
			message: '请在列表中选中一项!',
			type: 'error',
			showCloseButton: true
		});
		return;
	}
	$("#jclb").append('<option value=' + $("#" + sId).val() + '>' + $("#" + sId).find("option:selected").text() + '</option>');
	$("#" + sId)[0].remove(delIndex);

	var commonData = [];
	var authorizedData = [];
	var privacyData = [];

	var common = $("#jclb")[0];
	var authorized = $("#sqys")[0];
	var privacy = $("#gbys")[0];
	for (var i = 0; i < common.options.length; i++) {
		var o = {
			"roleId": common.options[i].value,
			"roleName": common.options[i].text
		}
		commonData.push(o);
	}

	for (var i = 0; i < authorized.options.length; i++) {
		var o = {
			"roleId": authorized.options[i].value,
			"roleName": authorized.options[i].text
		}
		authorizedData.push(o);
	}

	for (var i = 0; i < privacy.options.length; i++) {
		var o = {
			"roleId": privacy.options[i].value,
			"roleName": privacy.options[i].text
		}
		privacyData.push(o);
	}
	$.ajax("/ehrview/privacy/saveRoleConfig", {
		data: $.toJSON({
			"common": commonData,
			"authorized": authorizedData,
			"privacy": privacyData
		}),
		contentType: 'application/json; charset=UTF-8',
		type: 'POST'
	})
})


//获取疾病列表
function getPrivacyData(rData) {
	$.getJsonData('config/getDiseases', true).done(function(data) {
		var body = data.body;
		var diseases = body.Diseases
		var ssData = {};
		var jbData = {};
		var rContentData = [];
		var rList = [];
		var x = -1
		for (var i = 0; i < diseases.length; i++) {
			var bodyItem = diseases[i];
			if (bodyItem["properties"].parent == "jb") {
				jbData[bodyItem.key] = {
					"text": bodyItem.text,
					"content": []
				}
			} else if (bodyItem["properties"].parent == "ss") {
				ssData[bodyItem.key] = {
					"text": bodyItem.text,
					"content": []
				}
			}

		}
		for (var j = 0; j < diseases.length; j++) {
			var bodyItem = diseases[j];
			if (bodyItem.leaf) {
				x = x + 1

				if (jbData[bodyItem["properties"].parent] != undefined) {
					jbData[bodyItem["properties"].parent].content.push({
						"id": bodyItem.key,
						"text": bodyItem.text,
						"checkFlag": bodyItem["properties"].checkFlag
					})
				} else if (ssData[bodyItem["properties"].parent] != undefined) {
					ssData[bodyItem["properties"].parent].content.push({
						"id": bodyItem.key,
						"text": bodyItem.text,
						"checkFlag": bodyItem["properties"].checkFlag
					})
				}
			}
		}
		rData = {
			"jb": jbData,
			"ss": ssData
		};
	})

	return rData;
}

$.getJsonPOSTData = function(data, async) {
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

$.getJsonData = function(url, async, options) {
	if (!this.contextName) {
		this.contextName = "ehrview"
	}
	if (!async) {
		async = true;
	} else {
		async = false;
	}
	options = $.extend(options || {}, {
		dataType: "json",
		cache: false,
		async: async,
		contentType: 'application/json; charset=UTF-8',
		url: "/" + this.contextName + "/" + url
	});
	return jQuery.ajax(options);
};