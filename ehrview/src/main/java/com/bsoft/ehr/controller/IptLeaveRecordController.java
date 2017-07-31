/*
 * @(#)IptLeaveRecordController.java Created on 2013年12月18日 下午2:20:04
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
import com.bsoft.ehr.controller.support.ControllerResponse;
import com.bsoft.ehr.extend.dic.DocumentFormat;
import com.bsoft.mpi.service.ServiceCode;
import com.bsoft.xds.exception.DocumentEntryException;
import com.bsoft.xds.support.instance.ipt.IptLeaveRecordDocumentEntryRetrieveService;

/**
 * 出院记录。
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
@Controller
@LogonValidation
public class IptLeaveRecordController extends AbstractTemplateViewController {

	private static final Logger logger = LoggerFactory
			.getLogger(IptLeaveRecordController.class);

	@Autowired
	private IptLeaveRecordDocumentEntryRetrieveService iptLeaveRecordService;

	@RequestMapping("/iptLeaveRecord/getHtmlDocument")
	@ResponseBody
	public ControllerResponse getHtmlDocument(String visitId,
			String authorOrganization) {
		Map<String, Object> r;
		try {
			r = iptLeaveRecordService.getRecordByVisitId(visitId,
					authorOrganization);
		} catch (DocumentEntryException e) {
			ControllerResponse res = new ControllerResponse();
			logger.error("Cannot get inhospital patient leave record.", e);
			res.setStatus(ServiceCode.CODE_DATABASE_ERROR, "获取出院记录失败。");
			return res;
		}
		String dcId = (String) (r == null ? null : r.get("DCID"));
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
		return iptLeaveRecordService.getDocumentByRecordId(dcId,
				DocumentFormat.HTML);
	}

}
