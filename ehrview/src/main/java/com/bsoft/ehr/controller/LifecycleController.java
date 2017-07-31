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
import com.bsoft.mpi.service.ServiceCode;
import com.bsoft.xds.support.instance.summary.LifeCycleService;

import ctd.service.core.ServiceException;

@Controller
@LogonValidation
public class LifecycleController {

	private static final Logger logger = LoggerFactory
			.getLogger(LifecycleController.class);

	@Autowired
	private LifeCycleService lifeService;

	/**
	 * @param request
	 * @param vk
	 * @return
	 */
	@RequestMapping(value = "/app/getLifecycle", method = RequestMethod.GET)
	@ResponseBody
	public ControllerResponse getLifecycle(VisitKey vk, String timeSlot,Integer start,Integer limit) {
		ControllerResponse res = new ControllerResponse();
		List<Map<String, Object>> l;
		try {
			if (start == null) {
				start = 0;
			}
			if (limit == null) {
				limit = SysArgs.DEFAULT_RETURN_ROW_COUNT;
			}
			
			l = lifeService.getLifeCycle(vk.getMpiId(),
					timeSlot,start,limit);
			res.setBody(l);
		} catch (ServiceException e) {
			logger.error("Cannot get life cycle.", e);
			res.setStatus(ServiceCode.CODE_DATABASE_ERROR, "获取生命周期失败。");
		}
		return res;
	}
}
