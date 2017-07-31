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
import com.bsoft.xds.support.instance.ipt.InpatientRecordHomeDocumentEntryRetrieveService;

import ctd.net.rpc.Client;
import ctd.service.core.ServiceException;

/**
 * 
 * 住院记录
 */
@Controller
@LogonValidation
public class IptRecordHomeController extends AbstractTemplateViewController {

	private static final Logger logger = LoggerFactory
			.getLogger(IptRecordHomeController.class);

	@Autowired
	private InpatientRecordHomeDocumentEntryRetrieveService iptRecordProvider;

	/**
	 * @param visitKey
	 * @param start
	 * @param limit
	 * @return
	 */
	@RequestMapping(value = "/iptRecordHome/getInpatientRecord", method = RequestMethod.GET)
	@ResponseBody
	public ControllerResponse getInpatientRecord(VisitKey visitKey,
			Integer start, Integer limit) {
		if (start == null) {
			start = 0;
		}
		if (limit == null) {
			limit = 20;
		}
		ControllerResponse res = new ControllerResponse();
		try {
			List<Map<String, Object>> list = iptRecordProvider
					.getInpatientRecords(visitKey.getMpiId(), start, limit);
			res.setBody(list);
		} catch (ServiceException e) {
			logger.error("Cannot get inpatient treatment record list.", e);
			res.setStatus(ServiceCode.CODE_DATABASE_ERROR, "获取住院记录列表失败。");
		}
		return res;
	}

	/**
	 * @param visitId
	 * @param authorOrganization
	 * @return
	 */
	@RequestMapping("/iptRecordHome/getHtmlDocument")
	@ResponseBody
	public ControllerResponse getHtmlDocument(String visitId,
			String authorOrganization, String dcId) {
		if (dcId == null) {
			Map<String, Object> r;
			try {
				r = iptRecordProvider.getRecordByVisitId(visitId,
						authorOrganization);
			} catch (DocumentEntryException e) {
				ControllerResponse res = new ControllerResponse();
				logger.error("Cannot get inhospital patient record home.", e);
				res.setStatus(ServiceCode.CODE_DATABASE_ERROR, "获取住院记录失败。");
				return res;
			}
			dcId = (String) (r == null ? null : r.get("DCID"));
		}
		return super.getHtmlDocument(dcId);
//		ControllerResponse res = new ControllerResponse();
//		Object[] parameters = { "3301"};
//		try {
//			Object o = Client.rpcInvoke("test.dataServiceAdapter", "getDatasetDetailByParam",
//					parameters);
//			System.out.print(o);
//			res.setBody(o);
//		} catch (Exception e) {
//			res.setBody("<h1 align=\"center\"><font color='red'>对方提供的明细服务已下线，请稍后再试!</font></h1>");
//		}
//
//		return res;
		
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
		return iptRecordProvider.getDocumentByRecordId(dcId,
				DocumentFormat.HTML);
	}
	
	
	@RequestMapping(value = "/iptRecordHome/queryInpatientRecord",method = RequestMethod.POST)
	@ResponseBody
	public ControllerResponse getInpatientRecord(VisitKey visitKey,@RequestBody Map<String, String> args) {
		ControllerResponse res = new ControllerResponse();
		if (args.isEmpty()) {
			return res;
		}
		try {
			List<Map<String, Object>> list = iptRecordProvider
					.queryInpatientRecord(visitKey.getMpiId(),args);
			res.setBody(list);
		} catch (ServiceException e) {
			logger.error("Cannot query inpatient treatment record list.", e);
			res.setStatus(ServiceCode.CODE_DATABASE_ERROR, "查询住院记录信息失败。");
		}
		return res;
	}
}
