/*
 * @(#)MPIController.java Created on 2013年11月8日 上午11:29:16
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
import com.bsoft.xds.support.instance.pregnant.PregnantFirstVisitRecordDocumentEntryRetrieveService;


/**
 * 孕妇首次随访。
 * 
 * @author <a href="mailto:lisc@bsoft.com.cn">lisc</a>
 */
@Controller
@LogonValidation
public class PregnantFirstVisitRecordController  extends AbstractTemplateViewController {

	private static final Logger logger = LoggerFactory.getLogger(PregnantFirstVisitRecordController.class);
	
	
	@Autowired
	private PregnantFirstVisitRecordDocumentEntryRetrieveService visitService;
	
	
	/**
	 * @param request
	 * @param vk
	 * @return
	 */
	@RequestMapping(value = "/postnatal/getFirstVisitRecord", method = RequestMethod.GET)
	@ResponseBody
	public ControllerResponse getFirstVisitRecord(VisitKey visitKey,
			String pregnantId) {
		ControllerResponse res = new ControllerResponse();
		try {
			List<Map<String, Object>> l = visitService
					.getListByDate(pregnantId);
			res.setBody(l);
		} catch (DocumentEntryException e) {
			logger.error("Cannot get pregnant first visit record.", e);
			res.setStatus(ServiceCode.CODE_DATABASE_ERROR, "获取孕妇首次随访记录失败。");
		}
		return res;
	}
	
	
	

	@RequestMapping("/pregnantFirstVisit/getHtmlDocument")
	@ResponseBody
	@Override
	public ControllerResponse getHtmlDocument(String dcId) {
		return super.getHtmlDocument(dcId);
	}

	@Override
	protected Object getDocument(String dcId) throws DocumentEntryException {
		return visitService.getDocumentByRecordId(dcId, DocumentFormat.HTML);
	}
}
