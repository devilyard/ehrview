/*
 * @(#)DebilityChildrenController.java Created on 2014年1月6日 下午6:57:11
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
import com.bsoft.xds.support.instance.children.DebilityChildrenDocumentEntryRetrieveService;

/**
 * 体弱儿童。
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
@Controller
@LogonValidation
public class DebilityChildrenController extends AbstractTemplateViewController {
	private static final Logger logger = LoggerFactory
			.getLogger(GlucoseHistController.class);

	@Autowired
	private DebilityChildrenDocumentEntryRetrieveService debilityRecordService;

	/**
	 * @param request
	 * @param vk
	 * @return
	 */
	@RequestMapping(value = "/debilityChildren/getDebilityChildren", method = RequestMethod.GET)
	@ResponseBody
	public ControllerResponse getDebilityChildrenList(VisitKey visitKey) {
		ControllerResponse res = new ControllerResponse();
		try {
			List<Map<String, Object>> list = debilityRecordService
					.findPersonalRecords(visitKey.getMpiId(), 0, 20);
			res.setBody(list);
		} catch (DocumentEntryException e) {
			logger.error("Cannot get debility children record.", e);
			res.setStatus(ServiceCode.CODE_DATABASE_ERROR, "获取体弱儿记录失败");
		}
		return res;
	}

	@RequestMapping("/debilityChildren/getHtmlDocument")
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
		return debilityRecordService.getDocumentByRecordId(dcId,
				DocumentFormat.HTML);
	}

}
