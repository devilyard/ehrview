/*
 * @(#)DrugController.java Created on 2014年5月9日 上午10:29:26
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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.bsoft.ehr.auth.LogonValidation;
import com.bsoft.ehr.auth.VisitKey;
import com.bsoft.ehr.controller.support.ControllerResponse;
import com.bsoft.mpi.service.ServiceCode;
import com.bsoft.xds.support.instance.summary.DrugService;

import ctd.service.core.ServiceException;

/**
 * 
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
@Controller
@LogonValidation
public class DrugController {

	private static final Logger logger = LoggerFactory
			.getLogger(DrugController.class);

	@Autowired
	private DrugService dService;

	/**
	 * @param request
	 * @param vk
	 * @return
	 */
	@RequestMapping(value = "/summary/getMedicalRecord", method = RequestMethod.GET)
	@ResponseBody
	public ControllerResponse getDrugRecord(VisitKey visitKey, Integer start,
			Integer limit) {
		if (start == null) {
			start = 0;
		}
		if (limit == null) {
			limit = 0;
		}
		ControllerResponse res = new ControllerResponse();
		try {
			List<Map<String, Object>> records = dService.getDrugs(
					visitKey.getMpiId(), start, limit);
			res.setBody(records);
		} catch (ServiceException e) {
			logger.error("Cannot get summary_hist_drug record list.", e);
			res.setStatus(ServiceCode.CODE_DATABASE_ERROR, "获取用药记录失败。");
		}
		return res;
	}
	
	
	@RequestMapping(value = "/summary/queryMedicalRecord", method = RequestMethod.POST)
	@ResponseBody
	public ControllerResponse queryDrugRecord(VisitKey visitKey, @RequestBody Map<String, String> args) {
		ControllerResponse res = new ControllerResponse();
		if (args.isEmpty()) {
			return res;
		}
		try {
			List<Map<String, Object>> records = dService.queryDrugs(
					visitKey.getMpiId(),args);
			res.setBody(records);
		} catch (ServiceException e) {
			logger.error("Cannot query summary_hist_drug record list.", e);
			res.setStatus(ServiceCode.CODE_DATABASE_ERROR, "查询用药记录失败。");
		}
		return res;
	}
}
