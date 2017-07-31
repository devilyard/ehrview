$import("lib.respond",
		"lib.JQuery.jquery",
		"lib.jqueryjson",
		"lib.bootstrap.bootstrap",
		"lib.colorboxmin",
		"lib.messengermin",
		"lib.unslider");
var editData = {};

var newOrUpdate = "update";
//@@ 下面两个参数需要跟css里portlet-title，pageBar的设置一致，IE及Chrome下无法从css取到。
var titleHeight = 24;
var pageBarHeight = 22;
var templateId = "";

$._messengerDefaults = {
	extraClasses: 'messenger-fixed messenger-theme-block messenger-on-bottom messenger-on-right'
}

$(document).ready(function() {
	loadConfig();
	//返回事件
	$("#backButton").bind('click', function(event) {
		loadConfig();
	});

	//保存布局
	$("#doSaveBtn").click(function(event) {
		var saveData = {};
		var layoutName = $("#layoutNameInput").val()
		if (layoutName.length == 0) {
			$("#layoutSaveGroup").addClass('has-error')
			$.globalMessenger().post({
				message: '请输入布局名称',
				type: 'error',
				showCloseButton: true
			});
			return;
		} else {
			$("#layoutSaveGroup").removeClass('has-error')
			saveData["layoutData"] = editData;
			saveData["layoutText"] = layoutName;
			saveData["templateID"] = getTemplateId();
			saveData["fixed"] = '0';
			$.getJsonData({
				serviceId: "LayoutConfigService",
				method: "execute",
				action: "saveLayout",
				saveData: saveData
			}).done(function(data) {
				if (data.body == "205") {
					$.globalMessenger().post({
						message: '布局名称重复',
						type: 'error',
						showCloseButton: true
					});
				} else {
					$.globalMessenger().post({
						message: '保存成功',
						type: 'success',
						showCloseButton: true
					});
					location.reload()
				}
			}).fail(function() {
				$.globalMessenger().post({
					message: '保存失败',
					type: 'error',
					showCloseButton: true
				});
			});
		}
		newOrUpdate = "update";
	});
})

var getTemplateId = function() {
	return templateId
}

var setTemplateId = function(id) {
	templateId = id
}

//加载布局管理
var loadConfig = function() {
	$("#configNav").removeClass('hide')
	$("#toolBar").addClass('hide')
	$("body").removeClass('addBodyPadding20')
	$("body").addClass('addBodyPadding70')
	$("#layoutContent").empty();
	$("#layoutsUl").empty();
	$.getJsonData({
		serviceId: "LayoutConfigService",
		method: "execute",
		action: "layoutList"
	}).done(function(data) {
		if (data.code == 403) {
			$('body').append('<div><span>会话超时，请重新登录后再次打开本页面</span></div>');
			return;
		}
		var body = data.body
		for (var i = 0; i < body.length; i++) {
			var bodyItem = body[i];
			var navItemText = bodyItem["LayoutText"];
			var navItemId = bodyItem["RecordID"];
			var templateId = bodyItem["TemplateID"];
			var fixed = bodyItem["Fixed"];
			var liStr = "<li class='btn-group navPadding'><a class='tabName btn btn-default' fixed='" + fixed + "' id=a-" + navItemId + " layoutId=" + navItemId + " templateId=" + templateId + " href=#" + navItemId + ">" + navItemText + "</a><a class='btn btn-default dropdown-toggle' data-toggle='dropdown'><span class='caret'></span> <span class='sr-only'>Toggle Dropdown</span></a><ul class='dropdown-menu'><li>";
			if (fixed == '0') {
				liStr += "<a href='#' class='delLayout' onclick='return false' id='delLayout-" + navItemId + "'>删除</a>";
			}
			liStr += "</li><li><a href='#' onclick='return false' class='rename' id='rename-" + navItemId + "'>重命名</a></li></ul></li>";
			$("#layoutsUl").append($.parseHTML(liStr))
		}
		$("#layoutsUl li:first").addClass('active');
		var $firstA = $("#layoutsUl li:first a.tabName");
		var templateId = $firstA.attr('templateId');
		var layoutText = $firstA.text();
		var layoutId = $firstA.attr('layoutId');
		var fixed = $firstA.attr('fixed');
		loadLayoutData(templateId, layoutId);
		$("#layoutsUl li").bind('click', function(event) {
			if ($(this).hasClass('active')) {
				return;
			}
			if ($(this).find('ul').length == 0) {
				return;
			}
			$(this).addClass('active')
			$(this).siblings().removeClass('active')
			$("#layoutContent").empty();
			var $a = $(this).find('a.tabName');
			templateId = $a.attr('templateId');
			layoutId = $a.attr('href');
			layoutText = $a.text();
			fixed = $a.attr('fixed');
			layoutId = layoutId.replace(/#/g, "");
			loadLayoutData(templateId, layoutId)
		});
		var lId = "";
		$(".rename").click(function(event) {
			lId = $(this).attr('id');
			$('#newName').modal('show')
		});
		$("#saveNewName").click(function(event) {
			var updateData = {};
			updateData["recordID"] = (lId.split("-"))[1];
			if ($("#nameInput").val() != "") {
				updateData["layoutText"] = $("#nameInput").val();
			} else {
				return $(".form-group").addClass('has-error');
			}
			$.getJsonData({
				serviceId: "LayoutConfigService",
				method: "execute",
				action: "rename",
				saveData: updateData
			}).done(function() {
				$.globalMessenger().post({
					message: '保存成功',
					type: 'success',
					showCloseButton: true
				});
				location.reload();
			}).fail(function() {
				$.globalMessenger().post({
					message: '保存失败',
					type: 'error',
					showCloseButton: true
				});
			});
		});

		$(".delLayout").click(function(event) {
			var id = $(this).attr('id');
			msg = Messenger().post({
				message: "确定删除吗？",
				actions: {
					retry: {
						label: '确定',
						action: function() {
							var lid = id.split("-")
							$.getJsonData({
								serviceId: "LayoutConfigService",
								method: "execute",
								action: "deleteLayout",
								recordID: lid[1]
							}).done(function() {
								location.reload();
								return msg.update({
									message: '删除成功',
									type: 'success',
									actions: false
								});
							});
						}
					},
					cancel: {
						label: '取消',
						action: function() {
							return msg.cancel();
						}
					}
				}
			});
		});

		//保存布局
		$("#savebutton").bind('click', function(event) {
			if (newOrUpdate == "update") {
				var saveData = {};
				saveData["layoutData"] = editData;
				saveData["recordID"] = layoutId;
				saveData["templateID"] = templateId;
				saveData["layoutText"] = layoutText;
				saveData["fixed"] = fixed;
				$.getJsonData({
					serviceId: "LayoutConfigService",
					method: "execute",
					action: "saveLayout",
					saveData: saveData
				}).done(function() {
					$.globalMessenger().post({
						message: '保存成功',
						type: 'success',
						showCloseButton: true
					});
				}).fail(function() {
					$.globalMessenger().post({
						message: '保存失败',
						type: 'error',
						showCloseButton: true
					});
				});
			}
		});
	});
}

$(document).on('click', '#addbutton', function(event) {
	newOrUpdate = "new";
	newLayout()
});

//加载布局
var loadLayoutData = function(templateId, layoutId) {
	$.get('../layoutTemplates/' + templateId + ".html", {}, function(data, textStatus, xhr) {
		var $html = $(data);
		$html.find('.bs-docs-example').each(function() {
			$(this).css('height', $(this).attr('height'));
		});
		$("#layoutContent").append($html)
		$.getJsonData({
			serviceId: "LayoutConfigService",
			method: "execute",
			action: "getLayoutData",
			layoutId: layoutId
		}).done(function(data) {
			var body = data.body
console.log(body)			
			var modData = $.parseJSON(body);
			var addContent = $(".bs-docs-example").each(function(index) {
				if (modData && modData[this.id]) {
					if (modData[this.id].length > 0) {
						var apps = modData[this.id];
						editData[this.id] = apps;
						loadApps(apps, this.id);
					} else {
						addAppList(this.id);
					}
				} else {
					addAppList(this.id);
				}
			});
			$.cachedScript("../js/appController/appList.js").done(function(script, textStatus) {
				loadApp();
			});
		})
	});
}

//添加应用列表
var addAppList = function(modId) {
	var $mod = $("#" + modId);
	$mod.empty();
	editData[modId] = [];
	var htmlStr = "<div id='" + modId + "appList' style='height: 100%;'></div>";
	html = $.parseHTML(htmlStr);
	$mod.append(html);
	var str = '<div class="portlet-title">点击+号添加模块</div><div class="content"><div class="addMod"><div class="addButton"><span class="glyphicon glyphicon-plus"></span></div></div></div>'
	$("#" + modId + "appList").append(str);
	var $title = $("#" + modId + "appList").children('.portlet-title')
	var height = $mod.height();
	if ($title.length > 0) {
//		var lh = $title.css('line-height');
//		var m = $title.css('margin-bottom');
//		height -=  Number(lh.substring(0, lh.length - 2)) + Number(m.substring(0, m.length - 2));
		height -= titleHeight;
	}
	$("#" + modId + "appList").children('.content').css('height', height + 'px');
	$("#" + modId + "appList" + " .content .addMod").css('height', (height - 40) + 'px').append('<ul id="' + modId + '_tree" class="ztree hide"></ul>');
	$("#" + modId + "appList" + " .content").append("<div class='portlet-foot hide'><button id='" + modId + "_btn' >确定</button><button id='" + modId + "_backBtn'>返回</button></div>");
	$("#" + modId + "appList").find('.addButton').click(function() {
		getAppList($(this), $(this).parent().parent().parent().parent().attr('id'));
		$(this).remove('.addButton');
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

$.getAsyncData = function(url, options) {
	options = $.extend(options || {}, {
		dataType: "html",
		cache: true,
		async: false,
		url: url
	});

	return jQuery.ajax(options);
};

//加载应用
var loadApps = function(apps, modId) {
	var $mod = $("#" + modId);
	if (apps.length == 1) {
		app = apps[0];
		loadMod(app.id, modId, false);
		$mod.addClass('noTab');
	} else {
		var tabStr = '<ul class="nav nav-tabs"></ul>';
		var $html = $(tabStr);
		$mod.append($html);
		var $tabUl = $mod.find('.nav-tabs');
		for (var i = 0; i < apps.length; i++) {
			var app = apps[i];
			var liStr = "<li id='li_" + app["id"] + "' href='#" + app['id'] + "' data-toggle='tab' ><a href='#'' onclick='return false'>" + app['name'] + "<button class='close hide'><span class='glyphicon glyphicon-remove'></span></button></a></li>"
			var html1 = $.parseHTML(liStr);
			$tabUl.append(html1)
			if (i == 0) {
				$tabUl.find('li').addClass('active')
				$tabUl.find('li .close').removeClass('hide')
				$tabUl.find('a').addClass('active')
			}
		}
		var tabContentId = modId + "tap";
		$mod.removeClass('noTab')
		$mod.find('.nav-tabs li a button.close').bind('click', function(event) {
			var $delApp = $(this);
			delTabApp($(this), modId);
		});
		var height = $mod.height() - $mod.children('ul').height();
		var tabContentStr = "<div id=" + tabContentId + " style='height:" + height + "px;' class='tab-content tab-content-border'></div>";
		var taphtml = $.parseHTML(tabContentStr);
		$mod.append(taphtml);

		$mod.find('li').each(function(index) {
			if ($(this).hasClass('active')) {
				var appId = $(this).attr('href');
				appId = appId.replace(/#/g, "")
				loadMod(appId, tabContentId, true)
			}
		});

		$('li[data-toggle="tab"]').on('shown.bs.tab', function(e) {
			if ($(e.target).hasClass('active')) {
				return;
			} else {
				$mod.find('.nav-tabs li').removeClass('active')
				$mod.find('.nav-tabs li .close').addClass('hide');
				$mod.find('.nav-tabs li a').removeClass('active')
				$(e.target).addClass('active')
				$(e.target).find('a').addClass('active')
				$(e.target).find('.close').removeClass('hide');
				var appId = $(e.target).attr('href');
				appId = appId.replace(/#/g, "")
				if (appId) {
					loadMod(appId, tabContentId, true)
				}
			}
		})
	}
};

$.cachedScript = function(url, options) {
	options = $.extend(options || {}, {
		dataType: "script",
		cache: true,
		url: url
	});

	return jQuery.ajax(options);
};

//加载模块
var loadMod = function(appId, modId, tabFlag) {
	if (tabFlag) {
		var $mod = $("#" + modId);
		if ($("#" + appId).length > 0) {
			if ($("#" + appId).hasClass('active')) {
				return;
			} else {
				$mod.find('.active').removeClass('in active')
				$("#" + appId).removeClass('fade')
				$("#" + appId).addClass('fade in active')
			}
		} else {
			$.get('../partials/' + appId + ".html", function(data) {
				var $html = $(data);
				var height = $mod.height()
				var $pb = $html.children('.pageBar');
				if ($pb.length > 0) {
//					var h = $pb.css('height');
//					var ch = height - Number(h.substring(0, h.length - 2));
					var ch = height - pageBarHeight;
					$html.children('.content').css('height', ch);
				}
				var tapContentStr = "<div id='" + appId + "' style='height:" + height + "px;' class='tab-pane fade in active'></div>";
				var contentHtml = $.parseHTML(tapContentStr);
				$mod.append(contentHtml);
				var $app = $("#" + appId);
				$app.append($html);
				$app.find(".portlet-title").remove();
				$app.removeClass('content')
				$mod.find('.active').removeClass('in active')
				$("#" + appId).removeClass('fade')
				$("#" + appId).addClass('fade in active')
			});
			$.cachedScript("../js/appController/" + appId + ".js").done(function(script, textStatus) {
				//eval( appId + "()" )
			});
		}
	} else {
		$.get('../partials/' + appId + ".html", function(data) {
			var $mod = $("#" + modId);
			var $html = $(data);
			var $title = $html.children('.portlet-title');
			var height;
			if ($title.length > 0) {
//				var lh = $title.css('line-height');
//				var m = $title.css('margin-bottom');
//				height = $mod.height() - Number(lh.substring(0, lh.length - 2)) - Number(m.substring(0, m.length - 2));
				height = $mod.height() - titleHeight;
			}
			var $pb = $html.children('.pageBar');
			if ($pb.length > 0) {
//				var h = $pb.css('height');
//				var ch = height - Number(h.substring(0, h.length - 2));
				var ch = height - pageBarHeight;
				$html.children('.content').css('height', ch);
			}
			$title.remove();
			var d = $('<div style="height:' + height + 'px;border:1px solid #dddddd;overflow:auto;"></div>').append($html);
			$mod.empty().append($title).append(d);
			$.cachedScript("../js/appController/" + appId + ".js").done(function(script, textStatus) {
				var closeStr = "<button class='close'><span class='glyphicon glyphicon-remove'></span></button>";
				var html = $.parseHTML(closeStr);
				$("#" + modId + " .portlet-title").attr('id', appId).append(html);
				$mod.find('button.close').bind('click', function(event) {
					addAppList(modId);
					$.cachedScript("../js/appController/appList.js").done(function(script, textStatus) {
						loadApp();
					});
				});
			});
		});
	}
}
//删除tab应用
var delTabApp = function($delApp, modId) {
	$delLi = $delApp.parent().parent();
	editData[modId].splice($delLi.index(), 1);
	var num = $delLi.nextAll().length
	if (num != 0) {
		$delLi.next("li").addClass('active');
		$delLi.next("li").find('.close').removeClass('hide');
		$delLi.next("li").find('a').addClass('active');
		if ($delLi.parent().find('li').length == 2) {
			$("#" + modId).addClass('noTab')
			$("#" + modId).empty();
			loadApps([{
				"id": ($delLi.next("li").attr('href')).replace(/#/g, "")
			}], modId);
		} else {
			$('#' + modId + ' a[href="' + $delLi.next("li").attr('href') + '"]').tab('show')
			var tabContentId = ($delLi.next("li").attr('href')).replace(/#/g, "");
			loadMod(tabContentId, modId + "tap", true);
		}
	} else {
		var $prevLi = $delLi.prev("li");
		$prevLi.addClass('active');
		$prevLi.find('.close').removeClass('hide');
		$prevLi.find('a').addClass('active')
		if ($delLi.parent().find('li').length == 2) {
			$("#" + modId).addClass('noTab')
			$("#" + modId).empty();
			loadApps([{
				"id": ($prevLi.attr('href')).replace(/#/g, "")
			}], modId);
		} else {
			$('#' + modId + ' a[href="' + $prevLi.attr('href') + '"]').tab('show')
			var tabContentId = ($prevLi.attr('href')).replace(/#/g, "");
			loadMod(tabContentId, modId + "tap", true);
		}
	}
	$delLi.remove();
	$($delLi.attr('href')).remove()
}

//添加新的视图
var newLayout = function(templateId) {
	$("#configNav").addClass('hide');
	$("body").removeClass('addBodyPadding70')
	$("body").addClass('addBodyPadding20')
	var layoutBannerStr = "<div class='layoutBanner'></div>";
	var layoutTitleStr = "<div class='layoutselTitle row'>请选择一个布局<button id='back1' class='backButton btn btn-default'>返回</button></div>"
	var bannerHtml = $.parseHTML(layoutBannerStr);
	$("#layoutContent").empty();
	$("#layoutContent").append(layoutTitleStr);
	$("#back1").click(function(event) {
		loadConfig();
	});
	$("#layoutContent").append(bannerHtml);

	$.getJsonData({
		serviceId: "LayoutConfigService",
		method: "execute",
		action: "getTemplateList"
	}).done(function(data) {
		var templates = data.body;
		$(".layoutBanner").empty();
		for (var i = 0; i < templates.length; i++) {
			var template = templates[i];
			var str = "<div id=" + template["id"] + " class='layoutCC'><div class='l-layoutTextButton' layoutId=" + template["id"] + ">" + template["text"] + "</div><div class='layoutMain'></div></div>";
			var html = $.parseHTML(str);
			$(".layoutBanner").append(html);
			$.getAsyncData('../layoutTemplates/' + template["id"] + ".html").done(function(data) {
				var height = $("#" + template["id"] + " .layoutMain").height();
				var $html = $(data);
				var tempHeight = 0;
				$html.find('.row').each(function() {
					tempHeight += Number($(this).attr('height').replace('px', ''));
				});
				$html.find('.bs-docs-example').each(function() {
					var h = Number($(this).attr('height').replace('px', ''));
					console.log($(this).css('margin'));
					$(this).css('height', ((height / tempHeight) * h - 22.5) + 'px')
				});
				$("#" + template["id"] + " .layoutMain").empty();
				$("#" + template["id"] + " .layoutMain").append($html);
				$(".bs-docs-example").addClass('new-example')
			})
		}
		$(".layoutMain").click(function(event) {
			templateId = $(this).parent().attr('id');
			setTemplateId(templateId)
			$.get('../layoutTemplates/' + templateId + ".html", {}, function(data, textStatus, xhr) {
				var $html = $(data);
				$html.find('.bs-docs-example').each(function() {
					var h = Number($(this).attr('height').replace('px', ''));
					$(this).css('height', h + 'px')
				});
				$("#layoutContent").empty();
				$("#layoutContent").append($html)
				$(".bs-docs-example").each(function(index, val) {
					addAppList(this.id);
				});
				$.cachedScript("../js/appController/appList.js").done(function(script, textStatus) {
					loadApp();
				});
				$("#toolBar").removeClass('hide');
			})
		});
	})
}