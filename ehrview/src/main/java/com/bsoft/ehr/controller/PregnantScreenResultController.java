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
import com.bsoft.xds.support.instance.pregnant.PregnantScreenResultDocumentEntryRetrieveService;

/**
 * 孕妇产前检查信息
 * 
 */
@Controller
@LogonValidation
public class PregnantScreenResultController extends AbstractTemplateViewController {
	private static final Logger logger = LoggerFactory
			.getLogger(PregnantScreenResultController.class);

	@Autowired
	private PregnantScreenResultDocumentEntryRetrieveService pregnantScreenResultService;

	@RequestMapping("/pregnantScreenResult/getPregnantScreenResult")
	@ResponseBody
	public ControllerResponse getPregnantScreenResult(VisitKey visitKey) {
		ControllerResponse res = new ControllerResponse();
		try {
			Map<String, Object> l = pregnantScreenResultService
					.getMap(visitKey.getMpiId());
			res.setBody(l);
		} catch (DocumentEntryException e) {
			logger.error("Cannot get pregnantScreenResult record.", e);
			res.setStatus(ServiceCode.CODE_DATABASE_ERROR, "获取孕妇产前检查信息失败。");
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
	@RequestMapping("/pregnantScreenResult/getHtmlDocument")
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
		return pregnantScreenResultService.getDocumentByRecordId(dcId,
				DocumentFormat.HTML);
	}
}
