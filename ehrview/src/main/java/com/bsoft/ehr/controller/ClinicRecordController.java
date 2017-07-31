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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.bsoft.ehr.auth.LogonValidation;
import com.bsoft.ehr.auth.VisitKey;
import com.bsoft.ehr.controller.support.ControllerResponse;
import com.bsoft.ehr.extend.dic.DocumentFormat;
import com.bsoft.mpi.service.ServiceCode;
import com.bsoft.xds.exception.DocumentEntryException;
import com.bsoft.xds.support.instance.opt.OptRecordDocumentEntryRetrieveService;

import ctd.service.core.ServiceException;

/**
 * 门诊
 * 
 * @author <a href="mailto:lisc@bsoft.com.cn">lisc</a>
 */
@Controller
@LogonValidation
public class ClinicRecordController extends AbstractTemplateViewController {

	private static final Logger logger = LoggerFactory
			.getLogger(ClinicRecordController.class);

	@Autowired
	private OptRecordDocumentEntryRetrieveService optRecordService;

	/**
	 * @param request
	 * @param vk
	 * @return
	 */
	@RequestMapping(value = "/medical/ClinicRecord", method = RequestMethod.GET)
	@ResponseBody
	public ControllerResponse getClinicRecord(VisitKey visitKey, Integer start,
			Integer limit) {
		if (start == null) {
			start = 0;
		}
		if (limit == null) {
			limit = 20;
		}
		ControllerResponse res = new ControllerResponse();
		try {
			List<Map<String, Object>> list = optRecordService.getOptRecords(
					visitKey.getMpiId(), start, limit);
			res.setBody(list);
		} catch (ServiceException e) {
			logger.error("Cannot get outpatient treatment record list.", e);
			res.setStatus(ServiceCode.CODE_DATABASE_ERROR, "获取门诊列表失败。");
		}
		return res;
	}

	@RequestMapping(value = "/medical/ClinicRecordByDCID", method = RequestMethod.GET)
	@ResponseBody
	public ControllerResponse getOptRecipeByDcid(VisitKey visitKey, String DCID) {
		ControllerResponse res = new ControllerResponse();
		try {
			Map<String, Object> bodySet = optRecordService.getOptRecord(DCID);
			res.setBody(bodySet);
		} catch (ServiceException e) {
			logger.error("Cannot get outpatient recipe record list.", e);
			res.setStatus(ServiceCode.CODE_DATABASE_ERROR, "获取门诊列表失败。");
		}
		return res;
	}

	@RequestMapping("/medical/getHtmlDocument")
	@ResponseBody
	@Override
	public ControllerResponse getHtmlDocument(String dcId) {
		return super.getHtmlDocument(dcId);
	}
	
	@Override
	protected Object getDocument(String dcId) throws DocumentEntryException {
		return optRecordService.getDocumentByRecordId(dcId,
				DocumentFormat.HTML);
	}
	
	
	@RequestMapping(value = "/medical/queryClinicRecord", method = RequestMethod.POST)
	@ResponseBody
	public ControllerResponse queryClinicRecord(VisitKey visitKey, @RequestBody Map<String, String> args) {
		ControllerResponse res = new ControllerResponse();
		if (args.isEmpty()) {
			return res;
		}
		try {
			List<Map<String, Object>> list = optRecordService.queryOptRecords(visitKey.getMpiId(), args);
			res.setBody(list);
		} catch (ServiceException e) {
			logger.error("Cannot query outpatient treatment record list.", e);
			res.setStatus(ServiceCode.CODE_DATABASE_ERROR, "查询门诊列表失败。");
		}
		return res;
	}
}
