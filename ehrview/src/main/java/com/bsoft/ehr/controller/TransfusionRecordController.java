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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.bsoft.ehr.auth.LogonValidation;
import com.bsoft.ehr.auth.VisitKey;
import com.bsoft.ehr.controller.support.ControllerResponse;
import com.bsoft.ehr.extend.dic.DocumentFormat;
import com.bsoft.mpi.service.ServiceCode;
import com.bsoft.xds.exception.DocumentEntryException;
import com.bsoft.xds.support.instance.pt.PtTransfusionDocumentEntryRetrieveService;

import ctd.service.core.ServiceException;

/**
 * 输血记录。
 * 
 * @author
 */
@Controller
@LogonValidation
public class TransfusionRecordController extends AbstractTemplateViewController {

	private static final Logger logger = LoggerFactory
			.getLogger(TransfusionRecordController.class);

	@Autowired
	private PtTransfusionDocumentEntryRetrieveService ptTransfusion;

	/**
	 * @param visitKey
	 * @param start
	 * @param limit
	 * @return
	 */
	@RequestMapping(value = "/transfusion/getPtTransfusion", method = RequestMethod.GET)
	@ResponseBody
	public ControllerResponse getPtTransfusion(VisitKey visitKey,
			Integer start, Integer limit) {
		if (start == null) {
			start = 0;
		}
		if (limit == null) {
			limit = 20;
		}
		ControllerResponse res = new ControllerResponse();
		try {
			List<Map<String, Object>> list = ptTransfusion.getTransfusions(
					visitKey.getMpiId(), start, limit);
			res.setBody(list);
		} catch (ServiceException e) {
			logger.error("Cannot get patient blood transfusion record.", e);
			res.setStatus(ServiceCode.CODE_DATABASE_ERROR, "获取输血记录失败。");
		}
		return res;
	}

	@RequestMapping(value = "/transfusion/getPtTransfusionsByVisitId", method = RequestMethod.GET)
	@ResponseBody
	public ControllerResponse getPtTransfusionsByVisitId(String visitId,
			String authorOrganization, Integer start, Integer limit) {
		if (start == null) {
			start = 0;
		}
		if (limit == null) {
			limit = 20;
		}
		ControllerResponse res = new ControllerResponse();
		try {
			List<Map<String, Object>> bodySet = ptTransfusion
					.getRecordByVisitId(visitId, authorOrganization, start,
							limit);
			res.setBody(bodySet);
		} catch (DocumentEntryException e) {
			logger.error("Cannot get patient blood transfusion record.", e);
			res.setStatus(ServiceCode.CODE_DATABASE_ERROR, "获取输血记录失败。");
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
	@RequestMapping("/transfusion/getHtmlDocument")
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
		return ptTransfusion.getDocumentByRecordId(dcId, DocumentFormat.HTML);
	}
	
	
	@RequestMapping(value = "/transfusion/queryPtTransfusion", method = RequestMethod.POST)
	@ResponseBody
	public ControllerResponse queryPtTransfusion(VisitKey visitKey,@RequestBody Map<String, String> args) {
		ControllerResponse res = new ControllerResponse();
		if (args.isEmpty()) {
			return res;
		}
		try {
			List<Map<String, Object>> list = ptTransfusion.queryTransfusions(
					visitKey.getMpiId(), args);
			res.setBody(list);
		} catch (ServiceException e) {
			logger.error("Cannot query patient blood transfusion record.", e);
			res.setStatus(ServiceCode.CODE_DATABASE_ERROR, "查询输血记录失败。");
		}
		return res;
	}
}
