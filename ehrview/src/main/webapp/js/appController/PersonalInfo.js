/*
 * 个人基本信息
 */
var PersonalInfo = function () {
	$.getJsonData('mpi/getBaseInfo').done(function (data) {
		var body = data.body
		$('#Personallnfo_idCard').text(body.idCard)
		$('#Personallnfo_cardNo').text(body.cardNo)
		$('#Personallnfo_personName').text(body.personName)
		$('#Personallnfo_sexCode').text(body.sexCode_text)
		$('#Personallnfo_Birthday').text(safeDateString(body.birthday))
		$('#Personallnfo_educationCode').text(body.educationCode_text)
		$('#Personallnfo_address').text(body.address)
		$('#Personallnfo_contactNo').text(body.contactNo)
		$('#Personallnfo_contactName').text(body.contactName)
		$('#Personallnfo_manaUnit').text(safeDateString(body.manaUnit_Text))
		$('#Personallnfo_manaDoctor').text(safeDateString(body.manaDoctor_text))
		$.getJsonData('mpi/getPhoto').done(function (data) {
			if (data.code == 200) {
				$('#personalinfoPhoto').attr('src', data.body);
			}
		});
		
	});
	var publicData = {}
	$.getJsonData('public/getPublicHealthInfo').done(function (data) {
		var body = data.body
		for (var i = 0; i < body.length; i++) {
			var bodyItem = body[i];
			if (bodyItem.SRCEntryName == "MDC_Diabetes") {
				publicData["MDC_Diabetes"] = bodyItem.SRCID
				$('#MDC_Diabetes').removeClass('hide')
			}
			if (bodyItem.SRCEntryName == "MDC_Hypertension") {
				publicData["MDC_Hypertension"] = bodyItem.SRCID
				$('#MDC_Hypertension').removeClass('hide')
			}
			if (bodyItem.SRCEntryName == "PSY_Psychosis") {
				publicData["PSY_Psychosis"] = bodyItem.SRCID
				$('#PSY_Psychosis').removeClass('hide')
			}
			if (bodyItem.SRCEntryName == "CDH") {
				publicData["CDH"] = bodyItem.SRCID
				$('#CDH').removeClass('hide')
			}
			if (bodyItem.SRCEntryName == "EHR_HealthRecord") {
				publicData["EHR_HealthRecord"] = bodyItem.SRCID
				$('#EHR_HealthRecord').removeClass('hide')
			}
			if (bodyItem.SRCEntryName == "MDC_OldPeopleRecord") {
				publicData["MDC_OldPeopleRecord"] = bodyItem.SRCID
				$('#MDC_OldPeopleRecord').removeClass('hide')
			}
			if (bodyItem.SRCEntryName == "MHC") {
				publicData["MHC"] = bodyItem.SRCID
				$('#MHC').removeClass('hide')
			}
		}
	});

	$.getJsonData('healthRecord/getLivingHabitsInfo').done(function (data) {
		if (data.code == 200) {
			var body = data.body
			if (!body) {
				return;
			}
			if (body.drink) {
				$('#yj').removeClass('hide')
			} else if (body.drink == false) {
				$('#byj').removeClass('hide')
			}
			if (body.train) {
				$('#dl').removeClass('hide')
			} else if (body.train == false) {
				$('#bdl').removeClass('hide')
			}
			if (body.smoke) {
				$('#xy').removeClass('hide')
			} else if (body.smoke == false) {
				$('#bxy').removeClass('hide')
			}
			if (body.sweet) {
				$('#pt').removeClass('hide')
			}
			if (body.salt) {
				$('#px').removeClass('hide')
			}
			if (body.oil) {
				$('#py').removeClass('hide')
			}
			if (body.spicy) {
				$('#pl').removeClass('hide')
			}
			if (body.sour) {
				$('#ps').removeClass('hide')
			}
		}
	});

	$(".familyPopUp").colorbox({
		transition: "true",
		width: "765",
		height: "550",
		href: "../partials/family/familyTree.html",
		onOpen: function () {

		},
		onLoad: function () {

		},
		onComplete: function () {


		},
		onCleanup: function () {

		},
		onClosed: function () {

		}
	});

	$(".popUp").colorbox({
		transition: "true",
		width: "95%",
		height: "95%",
		href: "../partials/popUp/EHRPopUpView.html",
		onOpen: function () {

		},
		onLoad: function () {

		},
		onComplete: function () {
			var popUpId = this.id;
			$.cachedScript("../js/appController/popUp/EHRPopUp.js").done(function (script, textStatus) {
				setRecordId(publicData[popUpId])
				EHRPopUp(popUpId);
			});
		},
		onCleanup: function () {

		},
		onClosed: function () {

		}
	});
}