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
import com.bsoft.mpi.service.ServiceCode;
import com.bsoft.xds.exception.DocumentEntryException;
import com.bsoft.xds.support.instance.healthRecord.ExamDetailUnusualService;

/**
 * 近期检验异常指标
 * 
 * @author <a href="mailto:lisc@bsoft.com.cn">lisc</a>
 */
@Controller
@LogonValidation
public class ExamDetailUnusualController {

	private static final Logger logger = LoggerFactory
			.getLogger(ExamDetailUnusualController.class);

	@Autowired
	private ExamDetailUnusualService examDetailUnusual;

	/**
	 * @param request
	 * @param vk
	 * @return
	 */
	@RequestMapping(value = "/exam/getExamDetailUnusual", method = RequestMethod.GET)
	@ResponseBody
	public ControllerResponse getExamDetailUnusual(VisitKey visitKey,
			Integer start, Integer limit) {
		if (start == null) {
			start = 0;
		}
		if (limit == null) {
			limit = 20;
		}
		ControllerResponse res = new ControllerResponse();
		try {
			List<Map<String, Object>> list = examDetailUnusual
					.findPersonalRecords(visitKey.getMpiId(), start, limit);
			res.setBody(list);
		} catch (DocumentEntryException e) {
			logger.error("Cannot get examination detail unusual record.", e);
			res.setStatus(ServiceCode.CODE_DATABASE_ERROR, "获取近期检验异常指标失败。");
		}
		return res;
	}
}
