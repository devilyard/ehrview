package com.bsoft.ehr.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.codec.binary.Base64;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.bsoft.ehr.auth.LogonValidation;
import com.bsoft.ehr.auth.VisitKey;
import com.bsoft.ehr.controller.support.ControllerResponse;
import com.bsoft.ehr.controller.support.ServiceCode;
import com.bsoft.ehr.extend.dic.DocumentFormat;
import com.bsoft.ehr.util.DictionariesUtil;
import com.bsoft.xds.exception.DocumentEntryException;
import com.bsoft.xds.support.instance.pt.CheckReportDocumentEntryRetrieveServiceSJ;
import com.bsoft.xds.support.instance.pt.ICheckReportDocumentEntryRetrieveService;

import ctd.dictionary.Dictionaries;
import ctd.dictionary.Dictionary;
import ctd.dictionary.DictionaryItem;

/**
 * 检查报告。
 * 
 * @author <a href="mailto:lisc@bsoft.com.cn">lisanchuan</a>
 */
@Controller
@LogonValidation
public class CheckReportController extends AbstractTemplateViewController {

	private static final Logger logger = LoggerFactory
			.getLogger(CheckReportController.class);

	@Autowired
	private ICheckReportDocumentEntryRetrieveService ptCheckReport;

	/**
	 * @param visitKey
	 * @param start
	 * @param limit
	 * @return
	 */
	@RequestMapping(value = "/checkReport/getCheckReport", method = RequestMethod.GET)
	@ResponseBody
	public ControllerResponse getPtExamRecord(VisitKey visitKey, Integer start,
			Integer limit) {
		if (start == null) {
			start = 0;
		}
		if (limit == null) {
			limit = 20;
		}
		ControllerResponse res = new ControllerResponse();
		try {
			List<Map<String, Object>> list = ptCheckReport.getDocList(
					visitKey.getMpiId(), start, limit);
			res.setBody(list);
		} catch (DocumentEntryException e) {
			logger.error("Cannot get check record.", e);
			res.setStatus(ServiceCode.DATA_ACCESS_FAILED, "获取检查记录失败。");
		}
		return res;
	}

	/**
	 * @param visitId
	 * @param authorOrganization
	 * @param start
	 * @param limit
	 * @return
	 */
	@RequestMapping(value = "/checkReport/getCheckReportsByVisitId", method = RequestMethod.GET)
	@ResponseBody
	public ControllerResponse getPtExamRecordByVisitId(String visitId,
			String authorOrganization, Integer start, Integer limit) {
		if (start == null) {
			start = 0;
		}
		if (limit == null) {
			limit = 20;
		}
		ControllerResponse res = new ControllerResponse();
		try {
			List<Map<String, Object>> bodySet = ptCheckReport
					.getRecordByVisitId(visitId, authorOrganization, start,
							limit);
			res.setBody(bodySet);
		} catch (DocumentEntryException e) {
			logger.error("Cannot get check record.", e);
			res.setStatus(ServiceCode.DATA_ACCESS_FAILED, "获取检查记录失败。");
		}
		return res;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.bsoft.ehr.controller.AbstractTemplateViewController#getHtmlDocument
	 * (java.lang.String)
	 */
	@RequestMapping("/checkReport/getHtmlDocument")
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
		return ptCheckReport.getDocumentByRecordId(dcId, DocumentFormat.HTML);
	}

	/**
	 * @param dcId
	 * @param authorOrganization
	 * @return
	 * @throws DocumentEntryException
	 */
	@RequestMapping("/checkReport/getScreenageDocument")
	@ResponseBody
	protected ControllerResponse getScreenageDocument(String dcId,
			String authorOrganization, String studyUID) {
		ControllerResponse response = new ControllerResponse();
		Map<String, Object> screenageMap = new HashMap<String, Object>();
		response.setBody(screenageMap);
		try {
			screenageMap.put("html", ptCheckReport.getDocumentByRecordId(dcId,
					DocumentFormat.HTML));
		} catch (DocumentEntryException e) {
			logger.error("Cannot get check report:{}", dcId, e);
			if (e.getCode() == DocumentEntryException.FORMAT_NOT_SUPPORT
					|| e.getCode() == DocumentEntryException.RECORD_NOT_EXISTS) {
				screenageMap.put("html", getNoRecordStr());
			} else {
				response.setStatus(ServiceCode.DATA_ACCESS_FAILED, "获取检查报告失败。");
			}
			response.setCode(ServiceCode.NONE);
			return response;
		}
		if (StringUtils.isEmpty(studyUID)) {
			response.setStatus(ServiceCode.NONE, "没有影像");
		} else {
			// 读取路由字典获取ip
			Dictionary dic = DictionariesUtil.getDic("imageIPRoute");
			DictionaryItem di = dic.getItem(authorOrganization);
			if (di == null) {
				logger.error(
						"Cannot get screenage document server, author organization:{} not defined.",
						authorOrganization);
				response.setStatus(ServiceCode.TARGET_NOT_FOUND, "获取影像服务器地址失败。");
			} else {
				String url = (String) di.getProperty("url");
				String company = (String) dic.getItem(authorOrganization)
						.getProperty("company");
				if ("bsoft".equals(company)) {
					screenageMap.put("url", url + "?patientid=" + "&studyuid="
							+ studyUID + "&accnumber=&studydate=");
				} else {
					screenageMap.put("url", url + "?pid=" + "&siu=" + studyUID
							+ "&accnumber=&studydate=");
				}
			}
		}
		return response;
	}

	/**
	 * 新影像报告跳转
	 * 
	 * @param request
	 * @param response
	 * @param authororganization
	 * @param YXH
	 */
	@RequestMapping("/checkReport/Imagereport_Url")
	@ResponseBody
	public void Imagereport_Url(String authororganization, String YXH) {

	}

	/**
	 * @param dcId
	 * @return
	 */
	@RequestMapping("/checkReport/{dcId}.pdf")
	public ResponseEntity<byte[]> getReportPDF(@PathVariable String dcId) {
		if (!CheckReportDocumentEntryRetrieveServiceSJ.class
				.isInstance(ptCheckReport)) {
			return null;
		}
		final HttpHeaders headers = new HttpHeaders();
		CheckReportDocumentEntryRetrieveServiceSJ special = (CheckReportDocumentEntryRetrieveServiceSJ) ptCheckReport;
		byte[] data;
		try {
			Map<String, Object> content = special.getDocumentContent(dcId);
			headers.setContentLength((Long) content.get("fileSize"));
			headers.setContentType(new MediaType("application",
					(String) content.get("type")));
			Object text = content.get("text");
			if (text == null) {
				return null;
			}
			if (text.getClass() == String.class) {
				data = new Base64().decode((String) text);
			} else if (text.getClass() == byte[].class) {
				data = (byte[]) text;
			} else {
				return null;
			}
		} catch (Exception e) {
			logger.error("Cannot get document content for dcId:{}.", dcId, e);
			return null;
		}
		return new ResponseEntity<byte[]>(data, headers, HttpStatus.CREATED);
	}
	
	
	@RequestMapping(value = "/checkReport/queryCheckReport", method = RequestMethod.POST)
	@ResponseBody
	public ControllerResponse queryCheckReport(VisitKey visitKey, @RequestBody Map<String, String> args) {
		ControllerResponse res = new ControllerResponse();
		if (args.isEmpty()) {
			return res;
		}
		try {
			List<Map<String, Object>> list = ptCheckReport.queryCheckReport(
					visitKey.getMpiId(), args);
			res.setBody(list);
		} catch (Exception e) {
			logger.error("Cannot query check record.", e);
			res.setStatus(ServiceCode.DATA_ACCESS_FAILED, "查询检查记录失败。");
		}
		return res;
	}
}
