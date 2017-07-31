/*
 * @(#)MPIController.java Created on 2013年11月8日 上午11:29:16
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
import com.bsoft.xds.support.instance.psychosis.PsychosisVisitDocumentEntryRetrieveService;

/**
 * 精神病随访。
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
@Controller
@LogonValidation
public class PsychosisVisitController extends AbstractTemplateViewController {

	private static final Logger logger = LoggerFactory
			.getLogger(PsychosisVisitController.class);

	@Autowired
	private PsychosisVisitDocumentEntryRetrieveService psychosisService;

	/**
	 * @param request
	 * @param vk
	 * @return
	 */
	@RequestMapping(value = "/psychosisVisit/getPsychosisVisit", method = RequestMethod.GET)
	@ResponseBody
	public ControllerResponse getPsychosisVisit(VisitKey visitKey,
			String effectiveTime, Integer start, Integer limit) {
		if (start == null) {
			start = 0;
		}
		if (limit == null) {
			limit = 20;
		}
		ControllerResponse res = new ControllerResponse();
		try {
			res.setBody(psychosisService.getListByDate(visitKey.getMpiId(),
					effectiveTime, start, limit));
		} catch (DocumentEntryException e) {
			logger.error("Cannot get psychosis visit record.", e);
			res.setStatus(ServiceCode.CODE_DATABASE_ERROR, "获取精神病随访记录失败。");
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
	@RequestMapping("/psychosisVisit/getHtmlDocument")
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
		return psychosisService
				.getDocumentByRecordId(dcId, DocumentFormat.HTML);
	}
}
