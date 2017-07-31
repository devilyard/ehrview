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

import com.bsoft.ehr.auth.LogonValidation;
import com.bsoft.ehr.auth.VisitKey;
import com.bsoft.ehr.controller.support.ControllerResponse;
import com.bsoft.mpi.service.ServiceCode;
import com.bsoft.xds.support.instance.summary.BloodPressHistService;

import ctd.service.core.ServiceException;

/**
 * 体征:血压历史。
 * 
 * @author <a href="mailto:lisc@bsoft.com.cn">lisc</a>
 */
@Controller
@LogonValidation
public class BloodPressController {

	private static final Logger logger = LoggerFactory
			.getLogger(BloodPressController.class);

	@Autowired
	private BloodPressHistService bloodService;

	/**
	 * @param request
	 * @param vk
	 * @return
	 */
	@RequestMapping(value = "/summary/getBloodPress", method = RequestMethod.GET)
	@ResponseBody
	public ControllerResponse getBloodPress(VisitKey visitKey, Integer start,
			Integer limit) {
		if (start == null) {
			start = 0;
		}
		if (limit == null) {
			limit = 20;
		}
		ControllerResponse res = new ControllerResponse();
		try {
			List<Map<String, Object>> list = bloodService.getBloodPressHist(
					visitKey.getMpiId(), start, limit);
			res.setBody(list);
		} catch (ServiceException e) {
			logger.error("Cannot get blood pressure history.", e);
			res.setStatus(ServiceCode.CODE_DATABASE_ERROR, "获取血压记录失败");
		}
		return res;
	}

}
