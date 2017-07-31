/*
 * @(#)InpatientAdmissionNoteController.java Created on 2013年12月18日 下午2:13:40
 * 
 * 版权：版权所有 Bsoft 保留所有权力。
 */
package com.bsoft.ehr.controller;

import java.util.Map;

import javax.annotation.Resource;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.bsoft.ehr.auth.LogonValidation;
import com.bsoft.ehr.controller.support.ControllerResponse;
import com.bsoft.ehr.extend.dic.DocumentFormat;
import com.bsoft.mpi.service.ServiceCode;
import com.bsoft.xds.exception.DocumentEntryException;
import com.bsoft.xds.support.instance.ipt.IptAdmissionNoteDocumentEntryRetrieveService;

/**
 * 入院记录
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
@Controller
@LogonValidation
public class IptAdmissionNoteController extends AbstractTemplateViewController {

	private static final Logger logger = LoggerFactory
			.getLogger(IptAdmissionNoteController.class);

	@Resource
	private IptAdmissionNoteDocumentEntryRetrieveService iptAdmissionNoteDocumentEntryRetrieveService;

	/**
	 * @param visitId
	 * @param authorOrganization
	 * @return
	 */
	@RequestMapping("/iptAdmissionNote/getHtmlDocument")
	@ResponseBody
	public ControllerResponse getHtmlDocument(String visitId,
			String authorOrganization) {
		Map<String, Object> r;
		try {
			r = iptAdmissionNoteDocumentEntryRetrieveService
					.getRecordByVisitId(visitId, authorOrganization);
		} catch (DocumentEntryException e) {
			ControllerResponse res = new ControllerResponse();
			logger.error("Cannot get inhospital patient admission note record.",
					e);
			res.setStatus(ServiceCode.CODE_DATABASE_ERROR, "获取入院记录失败。");
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
		return iptAdmissionNoteDocumentEntryRetrieveService
				.getDocumentByRecordId(dcId, DocumentFormat.HTML);
	}

}
