/*
 * 
 * 版权：版权所有 Bsoft 保留所有权力。
 */
package com.bsoft.ehr.controller;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.bsoft.ehr.auth.LogonValidation;
import com.bsoft.ehr.auth.VisitKey;
import com.bsoft.ehr.controller.support.ControllerResponse;
import com.bsoft.ehr.extend.dic.DocumentFormat;
import com.bsoft.mpi.service.ServiceCode;
import com.bsoft.xds.exception.DocumentEntryException;
import com.bsoft.xds.support.instance.pregnant.HighRiskVisitReasonDocumentEntryRetrieveService;

/**
 * 孕妇高危管理。
 * 
 */
@Controller
@LogonValidation
public class PregnantHighRiskVisitReasonController extends AbstractTemplateViewController {
	private static final Logger logger = LoggerFactory
			.getLogger(PregnantHighRiskVisitReasonController.class);

	@Autowired
	private HighRiskVisitReasonDocumentEntryRetrieveService highRiskVisitReasonService;

	@RequestMapping("/highRiskVisitReason/getHighRiskVisitReason")
	@ResponseBody
	public ControllerResponse getHighRiskVisitReason(VisitKey visitKey) {
		ControllerResponse res = new ControllerResponse();
		try {
			Map<String, Object> l = highRiskVisitReasonService
					.getMap(visitKey.getMpiId());
			res.setBody(l);
		} catch (DocumentEntryException e) {
			logger.error("Cannot get highRiskVisitReason record.", e);
			res.setStatus(ServiceCode.CODE_DATABASE_ERROR, "获取孕妇高危管理失败。");
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
	@RequestMapping("/highRiskVisitReason/getHtmlDocument")
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
		return highRiskVisitReasonService.getDocumentByRecordId(dcId,
				DocumentFormat.HTML);
	}
}
