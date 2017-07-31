package com.bsoft.ehr.controller;

import java.net.URLDecoder;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.bsoft.ehr.auth.LogonValidation;
import com.bsoft.ehr.auth.VisitKey;
import com.bsoft.ehr.controller.support.ControllerResponse;
import com.bsoft.ehr.util.HqlComposor;
import com.bsoft.mpi.service.ServiceCode;
import com.bsoft.xds.exception.DocumentEntryException;
import com.bsoft.xds.support.instance.pt.hdpt.PtLabReportDocumentEntryRetrieveService;

import ctd.service.core.ServiceException;

@Controller
@LogonValidation
public class CheckRecordCountViewController {

	private static final Logger logger = LoggerFactory
			.getLogger(CheckRecordCountViewController.class);

	
	@Autowired
	private PtLabReportDocumentEntryRetrieveService checkRecordCountView;
	
	@RequestMapping(value = "/entryName/Check_Record_Count_View", method = RequestMethod.GET)
	@ResponseBody
	public ControllerResponse checkRecordCountView(VisitKey visitKey) {
		ControllerResponse res = new ControllerResponse();
		
		try {
			List<Map<String, Object>> records = checkRecordCountView.getList(visitKey.getMpiId());
			res.setBody(records);
		} catch (DocumentEntryException e) {
			logger.error("Cannot query Check_Record_Count_View record list.", e);
			res.setStatus(ServiceCode.CODE_DATABASE_ERROR, "查询信息失败。");
		}
		return res;
	}
	
	@RequestMapping(value = "/entryName/queryRecord")
	@ResponseBody
	public ControllerResponse queryRecord(VisitKey visitKey, @RequestParam String args,@RequestParam String recordClassifying) {
		ControllerResponse res = new ControllerResponse();
		if (args.isEmpty()) {
			res.setCode(201);
			return res;
		}
		try {
			String where = HqlComposor.conectWhere(HqlComposor.createWhereQueryByField("MPIID", visitKey.getMpiId()),"EffectiveFlag = 0");
			
			if (!StringUtils.isEmpty(args) && !("\"\"").equals(args)) {
				//中文解码
				try {
					args =URLDecoder.decode(args,"UTF-8");
				} catch (Exception e) {
					e.printStackTrace();
				}
				args = args.replace("\\", "");
				if(args.startsWith("\""))
				{
					args = args.substring(1, args.length() - 1);
				}
				where = HqlComposor.conectWhere(where, HqlComposor.exp2string(args));
			}
			if("SUMMARY_Hist_Drug".equals(recordClassifying)){
				where += " order by PrescribeDate desc";
			}else{
				where += " order by EffectiveTime desc";
			}
			
			
			List<Map<String, Object>> list = checkRecordCountView.queryOptRecords(where,recordClassifying);
			res.setBody(list);
		} catch (ServiceException e) {
			logger.error("Cannot query outpatient treatment record list.", e);
			res.setStatus(ServiceCode.CODE_DATABASE_ERROR, "查询门诊列表失败。");
		}
		return res;
	}
}
