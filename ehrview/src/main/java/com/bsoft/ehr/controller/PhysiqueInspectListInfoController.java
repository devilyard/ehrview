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

import com.bsoft.ehr.SysArgs;
import com.bsoft.ehr.auth.LogonValidation;
import com.bsoft.ehr.auth.VisitKey;
import com.bsoft.ehr.controller.support.ControllerResponse;
import com.bsoft.ehr.extend.dic.DocumentFormat;
import com.bsoft.mpi.service.ServiceCode;
import com.bsoft.xds.exception.DocumentEntryException;
import com.bsoft.xds.support.instance.check.CheckUpRegisterDocumentEntryRetrieveService;

/**
 * 社区体检
 * 
 * @author <a href="mailto:lisc@bsoft.com.cn">lisc</a>
 */
@Controller
@LogonValidation
public class PhysiqueInspectListInfoController extends
		AbstractTemplateViewController {

	private static final Logger logger = LoggerFactory
			.getLogger(PhysiqueInspectListInfoController.class);

	@Autowired
	private CheckUpRegisterDocumentEntryRetrieveService checkUp;

	/**
	 * @param request
	 * @param vk
	 * @return
	 */
	@RequestMapping(value = "/physiqueInspect/getPhysiqueInspectList", method = RequestMethod.GET)
	@ResponseBody
	public ControllerResponse getPhysiqueInspectList(VisitKey visitKey,
			Integer start, Integer limit) {
		if (start == null) {
			start = 0;
		}
		if (limit == null) {
			limit = SysArgs.DEFAULT_RETURN_ROW_COUNT;
		}
		ControllerResponse res = new ControllerResponse();
		try {
			List<Map<String, Object>> list = checkUp.findPersonalRecords(
					visitKey.getMpiId(), start, limit);
			res.setBody(list);
		} catch (DocumentEntryException e) {
			logger.error("Cannot get physique inspect list.", e);
			res.setStatus(ServiceCode.CODE_DATABASE_ERROR, "获取体检记录列表失败。");
		}
		return res;
	}

	@RequestMapping("/physiqueInspect/getHtmlDocument")
	@ResponseBody
	@Override
	public ControllerResponse getHtmlDocument(String dcId) {
		return super.getHtmlDocument(dcId);
	}

	@Override
	protected Object getDocument(String dcId) throws DocumentEntryException {
		return checkUp.getDocumentByRecordId(dcId, DocumentFormat.HTML);
	}
}
