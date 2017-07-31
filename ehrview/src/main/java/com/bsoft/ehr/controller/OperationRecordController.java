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
import com.bsoft.xds.support.instance.pt.PtOperationDocumentEntryRetrieveService;

import ctd.service.core.ServiceException;

/**
 * 手术记录。
 * 
 * @author
 */
@Controller
@LogonValidation
public class OperationRecordController extends AbstractTemplateViewController {

	private static final Logger logger = LoggerFactory
			.getLogger(OperationRecordController.class);

	@Autowired
	private PtOperationDocumentEntryRetrieveService ptOperation;

	/**
	 * @param visitKey
	 * @param start
	 * @param limit
	 * @return
	 */
	@RequestMapping(value = "/operation/getPtOperation", method = RequestMethod.GET)
	@ResponseBody
	public ControllerResponse getPtOperation(VisitKey visitKey, Integer start,
			Integer limit) {
		if (start == null) {
			start = 0;
		}
		if (limit == null) {
			limit = 20;
		}
		ControllerResponse res = new ControllerResponse();
		try {
			List<Map<String, Object>> list = ptOperation.getOperationRecords(
					visitKey.getMpiId(), start, limit);
			res.setBody(list);
		} catch (ServiceException e) {
			logger.error("Cannot get patient operation record.", e);
			res.setStatus(ServiceCode.CODE_DATABASE_ERROR, "获取手术记录失败。");
		}
		return res;
	}

	@RequestMapping(value = "/operation/getPtOperationsByVisitId", method = RequestMethod.GET)
	@ResponseBody
	public ControllerResponse getPtOperationByVisitId(String visitId,
			String authorOrganization, Integer start, Integer limit) {
		if (start == null) {
			start = 0;
		}
		if (limit == null) {
			limit = 20;
		}
		ControllerResponse res = new ControllerResponse();
		try {
			List<Map<String, Object>> bodySet = ptOperation.getRecordByVisitId(
					visitId, authorOrganization, start, limit);
			res.setBody(bodySet);
		} catch (DocumentEntryException e) {
			logger.error("Cannot get patient operation record.", e);
			res.setStatus(ServiceCode.CODE_DATABASE_ERROR, "获取手术记录失败。");
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
	@RequestMapping("/operation/getHtmlDocument")
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
		return ptOperation.getDocumentByRecordId(dcId, DocumentFormat.HTML);
	}
	
	
	@RequestMapping(value = "/operation/queryPtOperation", method = RequestMethod.POST)
	@ResponseBody
	public ControllerResponse queryPtOperation(VisitKey visitKey, @RequestBody Map<String, String> args) {
		ControllerResponse res = new ControllerResponse();
		if (args.isEmpty()) {
			return res;
		}
		try {
			List<Map<String, Object>> list = ptOperation.queryOperationRecords(
					visitKey.getMpiId(), args);
			res.setBody(list);
		} catch (ServiceException e) {
			logger.error("Cannot query patient operation record.", e);
			res.setStatus(ServiceCode.CODE_DATABASE_ERROR, "查询手术记录失败。");
		}
		return res;
	}
}
