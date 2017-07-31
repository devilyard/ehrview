/*
 * 公共卫生服务记录
 */
var HealthcareRecordsInfo = function() {
	$.getJsonData('public/getHealthcare', {
		"start": 0,
		"limit": 10
	}).done(function(data) {
		var body = data.body
		var $ttable = $("#healthInfoUl");
		for (var i = 0; i < body.length; i++) {
			var bodyItem = body[i];
			var htmlStr = '<li><a href="#" SRCEntryName="' + bodyItem.SRCEntryName + '" dcId="' + bodyItem.SRCID + '" class="blue">' + getEntryDicName(bodyItem.SRCEntryName) + '</a><br />最后一次随访时间：' + safeString(bodyItem.SystemTime) + '</li>'
			html = $.parseHTML(htmlStr);
			$ttable.append(html)
		}
		bindOpenHealthCareDocumentListener("#healthInfoUl")
	});
}

function getEntryDicName(SRCEntryName) {
	var name = SRCEntryName;
	switch (SRCEntryName) {
		case "CDH_CheckUp":
			name = "儿童体格检查";
			break;
		case "MDC_HypertensionVisit":
			name = "高血压随访";
			break;
		case "MDC_DiabetesVisit":
			name = "糖尿病随访";
			break;
		case "PSY_PsychosisVisit":
			name = "精神病随访";
			break;
		case "MHC_BabyVisitRecord":
			name = "新生儿家庭访视";
			break;
		case "MHC_PostnatalVisitInfo":
			name = "孕妇产后访视";
			break;
		case "MHC_VisitRecord":
			name = "孕妇产前随访";
			break;
		case "MHC_FirstVisitRecord":
			name = "孕妇产前首次随访";
			break;
		case "CDH_DebilityChildrenVisit":
			name = "体弱儿童随访";
			break;
	}
	return name;
}

function bindOpenHealthCareDocumentListener(selector) {
	var me = $(selector);
	$(me).find('a').colorbox({
		transition: "true",
		width: "95%",
		height: "95%",
		href: "../partials/popUp/visitPopUp.html",
		onOpen: function () {

		},
		onLoad: function () {

		},
		onComplete: function () {
			var SRCEntryName = $(this).attr("SRCEntryName");
			var dcId = $(this).attr("dcId");
			var url = getDocumentURL(SRCEntryName);
			$.cachedScript("../js/appController/popUp/PopUp.js").done(function (script, textStatus) {
				getHtmlContent(url, dcId)
			});
		},
		onCleanup: function () {

		},
		onClosed: function () {

		}
	});
}

function getDocumentURL(SRCEntryName) {
	switch (SRCEntryName) {
	case "CDH_CheckUp":
		return "CDH/getHtmlDocument";
	case "MDC_HypertensionVisit":
		return "hypertensionVisit/getHtmlDocument";
	case "MDC_DiabetesVisit":
		return "diabetesVisit/getHtmlDocument";
	case "PSY_PsychosisVisit":
		return "psychosisVisit/getHtmlDocument";
	case "MHC_BabyVisitRecord":
		return "babyVisit/getHtmlDocument";
	case "MHC_PostnatalVisitInfo":
		return "postnatal/getHtmlDocument";
	case "MHC_VisitRecord":
		return "pregnantVisit/getHtmlDocument";
	case "MHC_FirstVisitRecord":
		return "pregnantFirstVisit/getHtmlDocument";
	case "CDH_DebilityChildrenVisit":
		return "debilityChildren/getHtmlDocument";
	}
}
