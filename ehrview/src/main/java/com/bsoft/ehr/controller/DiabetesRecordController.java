/*
 * @(#)DiabetesRecordController.java Created on 2014年1月6日 下午5:31:20
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
import com.bsoft.xds.support.instance.diabetes.DiabetesRecordDocumentEntryRetrieveService;

/**
 * 糖尿病档案。
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
@Controller
@LogonValidation
public class DiabetesRecordController extends AbstractTemplateViewController {
	
	private static final Logger logger = LoggerFactory
			.getLogger(DiabetesRecordController.class);

	@Autowired
	private DiabetesRecordDocumentEntryRetrieveService diabetesRecordService;
	
	
	
	/**
	 * @param request
	 * @param vk
	 * @return
	 */
	@RequestMapping(value = "/diabetesRecord/getDiabetesRecord", method = RequestMethod.GET)
	@ResponseBody
	public ControllerResponse getDiabetesRecord(VisitKey visitKey) {
		
		ControllerResponse res = new ControllerResponse();
		try {
			res.setBody(diabetesRecordService.getMap(visitKey.getMpiId()));
		} catch (DocumentEntryException e) {
			logger.error("Cannot get hypertension record.", e);
			res.setStatus(ServiceCode.CODE_DATABASE_ERROR, "获取高血压记录失败。");
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
	@RequestMapping("/diabetesRecord/getHtmlDocument")
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
		return diabetesRecordService.getDocumentByRecordId(dcId,
				DocumentFormat.HTML);
	}
}
