/*
 * @(#)MPIController.java Created on 2013年11月8日 上午11:29:16
 * 
 * 版权：版权所有 Bsoft 保留所有权力。
 */
package com.bsoft.ehr.controller;

import javax.annotation.Resource;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.bsoft.ehr.auth.LogonValidation;
import com.bsoft.ehr.auth.VisitKey;
import com.bsoft.ehr.controller.support.ControllerResponse;
import com.bsoft.ehr.controller.support.ServiceCode;
import com.bsoft.ehr.service.PublicHealthInfoService;

import ctd.service.core.ServiceException;

/**
 * 查询有哪些公卫档案。
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
@Controller
@LogonValidation
public class PublicHealthInfoController {

	private static final Logger logger = LoggerFactory
			.getLogger(PublicHealthInfoController.class);

	@Resource
	private PublicHealthInfoService publicHealthInfoService;

	/**
	 * @param request
	 * @param vk
	 * @return
	 */
	@RequestMapping(value = "/public/getPublicHealthInfo", method = RequestMethod.GET)
	@ResponseBody
	public ControllerResponse getPublicHealthInfo(VisitKey vk) {
		String mpiId = vk.getMpiId();
		ControllerResponse res = new ControllerResponse();
		try {
			res.setBody(publicHealthInfoService.getHealthRecordInfo(mpiId));
		} catch (ServiceException e) {
			logger.error(
					"Cannot get public health recordId information for : {}",
					mpiId, e);
			res.setCode(ServiceCode.DATA_ACCESS_FAILED);
			res.setMessage("获取公共卫生档案信息失败。");
		}
		return res;
	}
}
