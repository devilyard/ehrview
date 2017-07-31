/*
 * @(#)VitalSignRecordController.java Created on 2013年12月18日 下午3:38:13
 * 
 * 版权：版权所有 Bsoft 保留所有权力。
 */
package com.bsoft.ehr.controller;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.dom4j.DocumentException;
import org.jfree.chart.ChartUtilities;
import org.jfree.chart.JFreeChart;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.bsoft.ehr.auth.LogonValidation;
import com.bsoft.ehr.auth.VisitKey;
import com.bsoft.ehr.controller.support.ControllerResponse;
import com.bsoft.ehr.controller.support.ServiceCode;
import com.bsoft.ehr.image.IImageLoader;
import com.bsoft.ehr.temperature.ChartProcessor;
import com.bsoft.ehr.temperature.PTempDetailInfo;
import com.bsoft.ehr.temperature.PTempInfo;
import com.bsoft.ehr.temperature.TwdChartService;
import com.bsoft.xds.support.instance.ipt.VitalSignRecordRetrieveService;
import com.bsoft.xds.support.instance.ipt.VitalSignRetrieveService;

import ctd.service.core.ServiceException;

/**
 * 体温单。
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
@Controller
@LogonValidation
public class VitalSignRecordController {

	private static final Logger logger = LoggerFactory
			.getLogger(VitalSignRecordController.class);

	@Autowired
	private VitalSignRecordRetrieveService vitalSignRecordService;
	@Autowired
	private VitalSignRetrieveService vitalSignService;

	/**
	 * 获得体温单
	 * 
	 * @param request
	 * @param response
	 * @param uuid
	 * @param cnd
	 */
	@RequestMapping("/inpatient/getSignsRecord")
	@ResponseBody
	public ControllerResponse getSignsRecord(HttpServletRequest request,
			HttpServletResponse response, VisitKey visitKey, String visitId) {
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		List<Map<String, Object>> list2 = new ArrayList<Map<String, Object>>();
		ControllerResponse res = new ControllerResponse();
		// String mpiId=visitKey.getMpiId();
		try {
			// 查询条件为“就诊流水号”
			list = vitalSignService.getVitalSign(visitId);// 生命体征(EMR_VitalSign)
			list2 = vitalSignRecordService.getVitalSignRecord(visitId);// 生命体征测量记录(EMR_VitalSignRecord)
		} catch (ServiceException e) {
			logger.error(e.getMessage(), e);
			res.setCode(ServiceCode.DATA_ACCESS_FAILED);
			res.setBody(getErrorStr(e.getMessage()));
			return res;
		}
		String str = null;
		Map<String, Object> body = new HashMap<String, Object>();
		if (list.size() > 0) {
			ChartProcessor cp = new ChartProcessor(request, response);
			TwdChartService ts = new TwdChartService(request);
			Map<String, Object> map = null;
//			String filename = null;
			response.setContentType(IImageLoader.responseContentType);
			try {
				map = getSignsRecordData(list, list2);
				ts.initAllData(cp, map);
				JFreeChart	chart = cp
						.createChart("", "", "", "", "", false, 1200, 1000);
	            ChartUtilities.writeChartAsPNG(response.getOutputStream(), chart, 1200, 1000);  
	            response.getOutputStream().close();  
	            return null; 
			} catch (DocumentException e) {
				logger.error("Temperature XML data error:", e);
				res.setCode(ServiceCode.SERVICE_PROCESS_FAILED);
				res.setBody(getErrorStr(e.getMessage()));
				return res;
			} catch (Exception exp) {
				logger.error("Temperature create image error:", exp);
				res.setCode(ServiceCode.SERVICE_PROCESS_FAILED);
				res.setBody(getErrorStr(exp.getMessage()));
				return res;
			}
			
//			String url = request.getContextPath() + "/jfreechart/";
//			String img = url + filename;
//			StringBuilder sb = new StringBuilder(
//					"<html xmlns=\"http://www.w3.org/1999/xhtml\"><body align=\"center\">");
//			sb.append("<img src=").append(img).append(" >");
//			sb.append("</body></html>");
//			body.put("nextDate", map.get("nextDate"));
//			body.put("img", filename);
//			str = sb.toString();
		} else {
			str = getNoRecordStr();
		}
		body.put("html", str);
		res.setBody(body);
		return res;
	}

	/**
	 * 生成体温单显示数据
	 * 
	 * @param list
	 * @return
	 * @throws DocumentException
	 */
	private Map<String, Object> getSignsRecordData(
			List<Map<String, Object>> list, List<Map<String, Object>> list2)
			throws DocumentException {
		Map<String, Object> result = new HashMap<String, Object>();
		List<String> dateList = new ArrayList<String>(); // 日期集合
		List<PTempInfo> tempInfoList = new ArrayList<PTempInfo>();// 体温单信息集合

		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
		String previous = null;
		String current = null;
		PTempInfo pTempInf = null;
		List<PTempDetailInfo> pTempDetailInfos = null;// 体温单详细信息集合
		PTempDetailInfo pTempDetailInfo = null;
		int index = 0;
		for (Map<String, Object> map : list) {
			current = sdf.format(map.get("TemperatureRecordDateTime"));
			pTempDetailInfo = new PTempDetailInfo();
			if (!current.equals(previous) && index < list2.size()) {
				dateList.add(current);
				result.put(current,
						list2.get(index).get("ActualHospitalizationDays"));
				result.put("op" + current,
						list2.get(index).get("DaysAfterOperationOrDelivery"));
				index++;
				pTempInf = new PTempInfo();
				pTempInf.setBloodPressure1((String) map.get("SystolicPressure"));
				pTempInf.setBloodPressure2((String) map
						.get("DiastolicPressure"));
				pTempInf.setWeight((String) map.get("Weight"));
				pTempDetailInfos = new ArrayList<PTempDetailInfo>(6);// 体温单详细信息标准为6条
				pTempDetailInfos.add(null);
				pTempDetailInfos.add(null);
				pTempDetailInfos.add(null);
				pTempDetailInfos.add(null);
				pTempDetailInfos.add(null);
				pTempDetailInfos.add(null);
				pTempInf.setDetailInfo(pTempDetailInfos);
				tempInfoList.add(pTempInf);
			}
			pTempDetailInfo.setTemperature((String) map.get("Temperature"));
			pTempDetailInfo.setBreathe((String) map.get("BreathingRate"));
			pTempDetailInfo.setPulse(Double.valueOf((String) map
					.get("PulseRate")));
			pTempInf.getDetailInfo()
					.set(getDetailIndex((Date) map
							.get("TemperatureRecordDateTime")),
							pTempDetailInfo);
			previous = current;
		}
		if (dateList.size() > 7) {
			result.put("nextDate", dateList.get(7));
			dateList = dateList.subList(0, 7);
		}
		if (list2.size() > 0) {
			String name = (String) list2.get(0).get("Name");
			result.put("name", name == null ? "" : name);
			result.put("AdmissionDateTime",
					list2.get(0).get("AdmissionDateTime"));
			result.put("DeptName", list2.get(0).get("DeptName"));
			result.put("SickbedID", list2.get(0).get("SickbedID"));
			result.put("VisitID", list2.get(0).get("VisitID"));
		}
		result.put("dateList", dateList);
		result.put("tempInfoList", tempInfoList);
		return result;
	}

	/**
	 * 判断测量体温时间段
	 * 
	 * @param elementText
	 * @return
	 */
	private int getDetailIndex(Date date) {
		int hour = 0;
		int result = 0;
		Calendar c = Calendar.getInstance();
		c.setTime(date);
		hour = c.get(Calendar.HOUR_OF_DAY);
		if (hour == 2) {
			result = 0;
		} else if (hour == 6) {
			result = 1;
		} else if (hour == 10) {
			result = 2;
		} else if (hour == 14) {
			result = 3;
		} else if (hour == 18) {
			result = 4;
		} else if (hour == 22) {
			result = 5;
		}
		return result;
	}

	/**
	 * @return
	 */
	private String getNoRecordStr() {
		return "<html xmlns=\"http://www.w3.org/1999/xhtml\"><body><h1 align=\"center\">无记录</h1></body></html>";
	}

	/**
	 * @param msg
	 * @return
	 */
	private String getErrorStr(String msg) {
		return "<html xmlns=\"http://www.w3.org/1999/xhtml\"><body><h1 align=\"center\">"
				+ msg + "</h1></body></html>";
	}
}
