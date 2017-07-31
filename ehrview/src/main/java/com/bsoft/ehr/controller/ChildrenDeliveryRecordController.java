package com.bsoft.ehr.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.bsoft.ehr.auth.LogonValidation;
import com.bsoft.ehr.auth.VisitKey;
import com.bsoft.ehr.controller.support.ControllerResponse;
import com.bsoft.ehr.extend.dic.DocumentFormat;
import com.bsoft.mpi.service.ServiceCode;
import com.bsoft.xds.exception.DocumentEntryException;
import com.bsoft.xds.support.instance.children.DeliveryRecordDocumentEntryRetrieveService;

@Controller
@LogonValidation
public class ChildrenDeliveryRecordController extends AbstractTemplateViewController {

	private static final Logger logger = LoggerFactory
			.getLogger(ChildrenDeliveryRecordController.class);

	@Autowired
	private DeliveryRecordDocumentEntryRetrieveService deliveryRecordService;

	/**
	 * @param request
	 * @param vk
	 * @param checkupStage
	 * @return
	 */
	@RequestMapping(value = "/childrenDeliveryRecord/getChildrenDeliveryRecord", method = RequestMethod.GET)
	@ResponseBody
	public ControllerResponse getChildrenDeliveryRecord(VisitKey visitKey) {
		ControllerResponse res = new ControllerResponse();
		try {
			res.setBody(deliveryRecordService.getMap(visitKey.getMpiId()));
		} catch (DocumentEntryException e) {
			logger.error("Cannot get child delivery record list.", e);
			res.setStatus(ServiceCode.CODE_DATABASE_ERROR, "获取儿童产时记录记录失败");
		}
		return res;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.bsoft.ehr.controller.AbstractTemplateViewController#getHtmlDocument
	 * (java.lang.String)
	 */
	@RequestMapping("/childrenDeliveryRecord/getHtmlDocument")
	@ResponseBody
	@Override
	public ControllerResponse getHtmlDocument(String dcId) {
		return super.getHtmlDocument(dcId);
	}

	@Override
	protected Object getDocument(String dcId) throws DocumentEntryException {
		return deliveryRecordService.getDocumentByRecordId(dcId, DocumentFormat.HTML);
	}

}
