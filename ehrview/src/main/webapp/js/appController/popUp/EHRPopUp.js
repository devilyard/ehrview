$import("lib.bootstrap-datepicker");
var MDC_DiabetesNavData = {
	"DiabetesRecord": "糖尿病档案",
	"DiabetesVisitPop": "糖尿病随访"
};
var MDC_HypertensionNavData = {
	"HypertensionRecord": "高血压档案",
	"HypertensionVisitPop": "高血压随访"
};
var PSY_PsychosisNavData = {
	"PsychosisRecord": "精神病档案",
	"PsychosisVisitPop": "精神病随访"
};
var MHCNavData = {
	"PregnantRecord": "孕产妇档案",
	"PregnantFirstVisit": "首次随访",
	"MHCChart": "妊娠图",
	"VisitRecord": "产后访视",
	"Postnatal42DayRecord": "产后检查",
	"BabyVisit": "新生儿随访",
	"HighRiskVisitReason":"孕产妇高危管理",
	"PregnantScreenResult":"产前检查信息记录",
	"PregnantDeathReport":"孕产妇死亡报告",
	"PregnantDeliveryInfo":"产妇分娩信息记录"
		
};
var CDHNavData = {
	"ChildrenRecord": "基本信息",
	"ChildrenOneVisit": "1岁内体检",
	"ChildrenOneTwoVisit": "1-2岁内体检",
	"ChildrenThreeVisit": "3岁内体检",
	"DebilityChildren": "体弱儿体检",
	"ChildrenDeliveryRecord":"新生儿出生登记",
	"ChildrenDefectRegister":"出生缺陷信息",
	"BabyVisitRecord":"新生儿随访",
	"ChildrenDeadRegister":"儿童死亡报告信息记录",
	"ChildrenCheckUp":"儿童健康体检"
};

var EHR_HealthNavData = {
	"HealthRecord": "个人基本信息"
}
var appNavDatas = {
	"MDC_Diabetes": MDC_DiabetesNavData,
	"MDC_Hypertension": MDC_HypertensionNavData,
	"PSY_Psychosis": PSY_PsychosisNavData,
	"MHC": MHCNavData,
	"CDH": CDHNavData,
	"EHR_HealthRecord": EHR_HealthNavData
}

var recordId = "";

var setRecordId = function(id) {
	recordId = id
}

var getRecordId = function() {
	return recordId;
}

var getSysTime = function() {
	var d = new Date();
	return d.getFullYear() + "";
}

var idContentFlag = {};

var EHRPopUp = function(appId) {
	var navData = appNavDatas[appId];
	if (navData != "") {
		var $nav = $("#EHRNav");
		var $popUpContent = $("#PopUpContent");
		for (var navId in navData) {
			var id = navId;
			var name = navData[id];
			$nav.append($.parseHTML("<li><a href='#" + id + "' data-toggle='pill'>" + name + "</a></li>"))
			$popUpContent.append($.parseHTML("<div id='" + id + "' class='tab-pane'></div>"))
		}
		$("#EHRNav li:first").addClass('active')
		$("#PopUpContent div:first").addClass('active')
		var id = $("#PopUpContent div:first").attr("id")
		onNavShow(id)
	}
	$('a[data-toggle="pill"]').on('shown.bs.tab', function(e) {
		var id = $(e.target).attr('href');
		id = id.replace(/#/g, "");
		onNavShow(id)
	});
}

var onNavShow = function(id) {
	addRunningMask();
	$.cachedScript("../js/appController/popUp/" + id + ".js").done(function(script, textStatus) {
		if (id == "Postnatal42DayRecord" || id == "BabyVisit" || id == "PregnantRecord" || id == "PregnantFirstVisit" || id == "VisitRecord" || id == "MHCChart") {
			if ($("#pregnantUl").length > 0) {

			} else {
				var url = "pregnantRecord/getPregnantId";
				var cnd = "";
				$.getJsonData(url, cnd, "true").done(function(data) {
					var body = data['body'];
					for (var i = 0; i < body.length; i++) {
						var bodyItem = body[i];
						var o = {
							"pregnantId": bodyItem.PregnantID,
							"DCID": bodyItem.DCID
						}
						pregnants[i] = o;
					}
				});
				$nav = $("#EHRNav");
				var dateStr = '<li class="divider"></li><li id="buttonLi"><div id="navPanel" class="navPanel btn-group"><button id="showBnt" type="button" class="btn btn-default">孕次1</button><button  type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown"><span class="caret"></span><span class="sr-only">Toggle Dropdown</span></button><ul id="pregnantUl" class="dropdown-menu" role="menu"></ul></div></li>';
				var btnHtml = $.parseHTML(dateStr)
				$nav.append(btnHtml);
				for (var i = 0; i < pregnants.length; i++) {
					var o = pregnants[i];
					var yc = i + 1
					var liStr = "<li><a data-toggle='dropdown' pregnantId=" + o.pregnantId + " id=" + o.DCID + " href='#'>孕次" + yc + "</a></li>"
					var liHtml = $.parseHTML(liStr)
					$("#pregnantUl").append(liHtml);
				}

				$('.dropdown-menu li a').bind('click', function(event) {
					$("#showBnt").text($(this).text())
					pregnantObj = {
						"pregnantId": $(this).attr("pregnantId"),
						"DCID": $(this).attr("id")
					}
					var appId = ($nav.find(".active a").eq(0).attr("href")).replace("#", "");
					addRunningMask();
					eval(appId + "(appId)")
				});
			}
		} else {
			$(".navPanel").addClass('hide');
		}
		eval(id + "(id)")
	});

	// if ( $( "#dataNavBar-" + id )
	// 	.length > 0 ) {

	// 	if ( $( "#datePForm" )
	// 		.length > 0 ) {
	// 		$( "#datePForm" )
	// 			.removeClass( 'hide' )
	// 	}

	// 	return;
	// } else {

	// 	$.cachedScript( "../js/appController/popUp/" + id + ".js" )
	// 		.done( function ( script, textStatus ) {
	// 			loadApp( id );
	// 		} );
	// }
}