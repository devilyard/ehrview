/*
 * @(#)DiabetesRecordController.java Created on 2014年1月6日 下午5:31:20
 * 
 * 版权：版权所有 Bsoft 保留所有权力。
 */
package com.bsoft.ehr.controller;

import java.util.List;
import java.util.Map;

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
import com.bsoft.xds.support.instance.pregnant.Postnatal42DayDocumentEntryRetrieveService;


@Controller
@LogonValidation
public class Postnatal42DayController extends AbstractTemplateViewController {

	private static final Logger logger = LoggerFactory.getLogger(Postnatal42DayController.class);
	
	@Autowired
	private Postnatal42DayDocumentEntryRetrieveService pregnantRecordService;

	
	/**
	 * @param request
	 * @param vk
	 * @return
	 */
	@RequestMapping(value = "/postnatal42Day/getRecord", method = RequestMethod.GET)
	@ResponseBody
	public ControllerResponse getRecord(VisitKey visitKey,
			String pregnantId) {
		ControllerResponse res = new ControllerResponse();
		try {
			List<Map<String, Object>> l = pregnantRecordService
					.getListByDate(pregnantId);
			res.setBody(l);
		} catch (DocumentEntryException e) {
			logger.error("Cannot get pregnant 42day record.", e);
			res.setStatus(ServiceCode.CODE_DATABASE_ERROR, "获取孕妇产后记录失败。");
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
	@RequestMapping("/postnatal42Day/getHtmlDocument")
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
		return pregnantRecordService.getDocumentByRecordId(dcId,
				DocumentFormat.HTML);
	}
}
