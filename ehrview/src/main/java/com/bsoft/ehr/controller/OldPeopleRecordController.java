/*
 * 
 * 版权：版权所有 Bsoft 保留所有权力。
 */
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
import com.bsoft.xds.support.instance.oldPeople.OldPeopleRecordDocumentEntryRetrieveService;

/**
 * 老年人档案。
 * 
 */
@Controller
@LogonValidation
public class OldPeopleRecordController extends
		AbstractTemplateViewController {

	private static final Logger logger = LoggerFactory
			.getLogger(OldPeopleRecordController.class);
	
	@Autowired
	private OldPeopleRecordDocumentEntryRetrieveService oldPeopleRecordService;
	
	
	
	/**
	 * @param request
	 * @param vk
	 * @return
	 */
	@RequestMapping(value = "/oldPeopleRecord/getOldPeopleRecord", method = RequestMethod.GET)
	@ResponseBody
	public ControllerResponse getOldPeopleRecord(VisitKey visitKey) {
		
		ControllerResponse res = new ControllerResponse();
		try {
			res.setBody(oldPeopleRecordService.getMap(visitKey.getMpiId()));
		} catch (DocumentEntryException e) {
			logger.error("Cannot get hypertension record.", e);
			res.setStatus(ServiceCode.CODE_DATABASE_ERROR, "获取老年人记录失败。");
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
	@RequestMapping("/oldPeopleRecord/getHtmlDocument")
	@ResponseBody
	@Override
	public ControllerResponse getHtmlDocument(String dcId) {
		return super.getHtmlDocument(dcId);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.bsoft.ehr.controller.AbstractTemplateViewController#getDocument(java
	 * .lang.String)
	 */
	@Override
	protected Object getDocument(String dcId) throws DocumentEntryException {
		return oldPeopleRecordService.getDocumentByRecordId(dcId,
				DocumentFormat.HTML);
	}
}
