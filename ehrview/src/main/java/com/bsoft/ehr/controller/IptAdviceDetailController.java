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
import com.bsoft.ehr.controller.support.ControllerResponse;
import com.bsoft.ehr.extend.dic.DocumentFormat;
import com.bsoft.mpi.service.ServiceCode;
import com.bsoft.xds.exception.DocumentEntryException;
import com.bsoft.xds.support.instance.ipt.IptAdviceDetailDocumentEntryRetrieveService;

/**
 * 住院医嘱记录。
 * 
 * @author
 */
@Controller
@LogonValidation
public class IptAdviceDetailController extends AbstractTemplateViewController {

	private static final Logger logger = LoggerFactory
			.getLogger(IptAdviceDetailController.class);

	@Autowired
	private IptAdviceDetailDocumentEntryRetrieveService iptAdviceDetail;

	/**
	 * @param request
	 * @param vk
	 * @return
	 */
	@RequestMapping(value = "/iptAdviceDetail/getIptAdviceDetail", method = RequestMethod.GET)
	@ResponseBody
	public ControllerResponse getIptAdviceDetail(String visitId,
			String authorOrganization, Integer start, Integer limit) {
		if (start == null) {
			start = 0;
		}
		if (limit == null) {
			limit = 20;
		}
		ControllerResponse res = new ControllerResponse();
		try {
			List<Map<String, Object>> bodySet = iptAdviceDetail
					.getRecordByVisitId(visitId, authorOrganization, start,
							limit);
			res.setBody(bodySet);
		} catch (DocumentEntryException e) {
			logger.error("Cannot get inhospital patient advice detail record.",
					e);
			res.setStatus(ServiceCode.CODE_DATABASE_ERROR, "获取医嘱明细记录失败。");
		}
		return res;
	}
	
	@RequestMapping("/iptAdviceDetail/getHtmlDocument")
	@ResponseBody
	@Override
	public ControllerResponse getHtmlDocument(String dcId) {
		return super.getHtmlDocument(dcId);
	}
	
	@Override
	protected Object getDocument(String dcId) throws DocumentEntryException {
		return iptAdviceDetail.getDocumentByRecordId(dcId,
				DocumentFormat.HTML);
	}

}
