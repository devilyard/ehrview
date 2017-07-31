/*
 * @(#)MPIController.java Created on 2013年11月8日 上午11:29:16
 * 
 * 版权：版权所有 Bsoft 保留所有权力。
 */
package com.bsoft.ehr.controller;

import java.util.HashMap;
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
import com.bsoft.ehr.util.MPIProxy;
import com.bsoft.mpi.server.MPIServiceException;
import com.bsoft.mpi.service.ServiceCode;
import com.bsoft.xds.exception.DocumentEntryException;
import com.bsoft.xds.support.instance.children.CheckUpDocumentEntryRetrieveService;

@Controller
@LogonValidation
public class WHOLineController {

	private static final Logger logger = LoggerFactory
			.getLogger(WHOLineController.class);

	@Autowired
	private CheckUpDocumentEntryRetrieveService checkUpService;

	/**
	 * @param request
	 * @param vk
	 * @return
	 */
	@RequestMapping(value = "/children/getWHOLine", method = RequestMethod.GET)
	@ResponseBody
	public ControllerResponse getWHOLine(VisitKey visitKey) {
		ControllerResponse res = new ControllerResponse();
		Map<String, Object> mpi;
		List<Map<String, Object>> standardData = null;
		List<Map<String, Object>> checkUpdata = null;
		try {
			mpi = MPIProxy.getBaseMPI(visitKey.getMpiId());
			String sexCode = (String) mpi.get("sexCode");
			standardData = checkUpService.getWHOAgeStandard(sexCode);
			checkUpdata = (checkUpService.findPersonalRecords(
					visitKey.getMpiId(), 0, 72));
			HashMap<String, Object> body = new HashMap<String, Object>();
			body.put("standardData", standardData);
			body.put("checkUpdata", checkUpdata);
			res.setBody(body);
		} catch (MPIServiceException e) {
			logger.error("Failed to get mpi base information for: {}",
					visitKey.getMpiId(), e);
			res.setCode(ServiceCode.CODE_REQUEST_PARSE_ERROR);
			res.setMessage("个人信息获取失败：" + e.getMessage());
			return res;
		} catch (DocumentEntryException e) {
			logger.error("Cannot get children check up record.", e);
			res.setStatus(ServiceCode.CODE_DATABASE_ERROR, "获取儿童体格检查记录失败");
		}
		return res;
	}
}
