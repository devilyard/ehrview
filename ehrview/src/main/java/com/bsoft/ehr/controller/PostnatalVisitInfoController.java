/*
 * @(#)PregnantVisitController.java Created on 2013年12月18日 下午2:28:53
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

import com.bsoft.ehr.auth.LogonValidation;
import com.bsoft.ehr.auth.VisitKey;
import com.bsoft.ehr.controller.support.ControllerResponse;
import com.bsoft.ehr.extend.dic.DocumentFormat;
import com.bsoft.mpi.service.ServiceCode;
import com.bsoft.xds.exception.DocumentEntryException;
import com.bsoft.xds.support.instance.pregnant.PostnatalVisitInfoDocumentEntryRetrieveService;

/**
 * 孕妇产后访视信息。
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
@Controller
@LogonValidation
public class PostnatalVisitInfoController extends
		AbstractTemplateViewController {
	private static final Logger logger = LoggerFactory
			.getLogger(PostnatalVisitInfoController.class);

	@Autowired
	private PostnatalVisitInfoDocumentEntryRetrieveService pregnantVisitService;

	/**
	 * @param request
	 * @param vk
	 * @return
	 */
	@RequestMapping(value = "/postnatal/getVisitRecord", method = RequestMethod.GET)
	@ResponseBody
	public ControllerResponse getFirstVisitRecord(VisitKey visitKey,
			String pregnantId) {
		ControllerResponse res = new ControllerResponse();
		try {
			List<Map<String, Object>> l = pregnantVisitService
					.getListByDate(pregnantId);
			res.setBody(l);
		} catch (DocumentEntryException e) {
			logger.error("Cannot get pregnant first visit record.", e);
			res.setStatus(ServiceCode.CODE_DATABASE_ERROR, "获取孕妇随访记录失败。");
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
	@RequestMapping("/postnatal/getHtmlDocument")
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
		return pregnantVisitService.getDocumentByRecordId(dcId,
				DocumentFormat.HTML);
	}

}
