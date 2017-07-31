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
import com.bsoft.xds.support.instance.pt.ExamReportDocumentEntryRetrieveService;

/**
 * 检验记录。
 * 
 * @author
 */
@Controller
@LogonValidation
public class ExamReportController extends AbstractTemplateViewController {

	private static final Logger logger = LoggerFactory
			.getLogger(ExamReportController.class);

	@Autowired
	private ExamReportDocumentEntryRetrieveService examReportService;

	/**
	 * @param request
	 * @param vk
	 * @return
	 */
	@RequestMapping(value = "/examReport/getExamReport", method = RequestMethod.GET)
	@ResponseBody
	public ControllerResponse getExamReport(VisitKey visitKey, Integer start,
			Integer limit) {
		if (start == null) {
			start = 0;
		}
		if (limit == null) {
			limit = 20;
		}
		ControllerResponse res = new ControllerResponse();
		try {
			List<Map<String, Object>> list = examReportService
					.findPersonalRecords(visitKey.getMpiId(), start, limit);
			res.setBody(list);
		} catch (DocumentEntryException e) {
			logger.error("Cannot get patient exam record.", e);
			res.setStatus(ServiceCode.CODE_DATABASE_ERROR, "获取检验记录失败。");
		}
		return res;
	}

	/**
	 * @param request
	 * @param vk
	 * @return
	 */
	@RequestMapping(value = "/examReport/getExamReportByVisitId", method = RequestMethod.GET)
	@ResponseBody
	public ControllerResponse getExamReportByVisitId(String visitId,
			String authorOrganization, Integer start, Integer limit) {
		if (start == null) {
			start = 0;
		}
		if (limit == null) {
			limit = 20;
		}
		ControllerResponse res = new ControllerResponse();
		try {
			List<Map<String, Object>> bodySet = examReportService
					.getRecordByVisitId(visitId, authorOrganization, start,
							limit);
			res.setBody(bodySet);
		} catch (DocumentEntryException e) {
			logger.error("Cannot get patient exam record.", e);
			res.setStatus(ServiceCode.CODE_DATABASE_ERROR, "获取检验记录失败。");
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
	@RequestMapping("/examReport/getHtmlDocument")
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
		return examReportService.getDocumentByRecordId(dcId,
				DocumentFormat.HTML);
	}
	
	
	@RequestMapping(value = "/examReport/queryExamReport", method = RequestMethod.POST)
	@ResponseBody
	public ControllerResponse queryExamReport(VisitKey visitKey, @RequestBody Map<String, String> args) {
		ControllerResponse res = new ControllerResponse();
		if (args.isEmpty()) {
			return res;
		}
		try {
			List<Map<String, Object>> list = examReportService.queryExamReportRecords(visitKey.getMpiId(), args);
			res.setBody(list);
		} catch (Exception e) {
			logger.error("Cannot query patient exam record.", e);
			res.setStatus(ServiceCode.CODE_DATABASE_ERROR, "查询检验记录失败。");
		}
		return res;
	}
}