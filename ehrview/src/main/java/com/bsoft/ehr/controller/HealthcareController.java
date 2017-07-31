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
import com.bsoft.mpi.service.ServiceCode;
import com.bsoft.xds.support.instance.healthRecord.HealthcareRetrieveService;

import ctd.service.core.ServiceException;

/**
 * 
 * 公共卫生服务记录
 */
@Controller
@LogonValidation
public class HealthcareController {

	private static final Logger logger = LoggerFactory
			.getLogger(HealthcareController.class);

	@Autowired
	private HealthcareRetrieveService healthcareRetrieve;

	/**
	 * @param request
	 * @param vk
	 * @return
	 */
	@RequestMapping(value = "/public/getHealthcare", method = RequestMethod.GET)
	@ResponseBody
	public ControllerResponse getHealthcareRetrieve(VisitKey visitKey,
			Integer start, Integer limit) {
		if (start == null) {
			start = 0;
		}
		if (limit == null) {
			limit = SysArgs.DEFAULT_RETURN_ROW_COUNT;
		}
		ControllerResponse res = new ControllerResponse();
		try {
			List<Map<String, Object>> list = healthcareRetrieve
					.getHealthcareServiceRecords(visitKey.getMpiId(), start,
							limit);
			res.setBody(list);
		} catch (ServiceException e) {
			logger.error("Cannot get healthcare retrieve record.", e);
			res.setStatus(ServiceCode.CODE_DATABASE_ERROR, "获取公共卫生服务记录失败。");
		}
		return res;
	}
}
