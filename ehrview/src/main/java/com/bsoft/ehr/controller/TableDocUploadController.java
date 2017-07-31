package com.bsoft.ehr.controller;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.StringReader;
import java.io.StringWriter;
import java.net.URLDecoder;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletResponse;

import org.dom4j.Document;
import org.dom4j.io.OutputFormat;
import org.dom4j.io.SAXReader;
import org.dom4j.io.XMLWriter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

import com.bsoft.ehr.service.TableDocUploadService;
import com.bsoft.ehr.util.HttpHelper;
import com.bsoft.mpi.server.rpc.IMPIProvider;

import ctd.util.xml.XMLHelper;
import ctd.util.zip.ZipUtil;

@Controller
public class TableDocUploadController {
	
	private static final Logger LOGGER = LoggerFactory.getLogger(TableDocUploadController.class);

	@Autowired
	private TableDocUploadService tableDocUploadService;
	
	@Autowired
	private IMPIProvider mpiProvider;
	
	private Map<String, String> records;
	
//	public void setRecords(Map<String, String> records) {
//		this.records = records;
//	}

	@RequestMapping(value = "/tableDocForm", method = RequestMethod.GET)
	public void handleFormUpload(HttpServletResponse response,
			@RequestParam("MPIID") String MPIID,
			@RequestParam("service") String service,
			@RequestParam("idCard") String idCard,
			@RequestParam("selRecords") String selRecords){
		ZipUtil zipUtil = null;
		try {
			Map<String,Object> map = mpiProvider.getMPI(MPIID);
			String userName = (String)map.get("personName");
			String filename = userName + "_共享文档.zip";
			if("dataset".equals(service)){
				filename = userName + "_数据集.zip";
			}
			String downLoadName = new String(filename.getBytes("gbk"), "iso-8859-1"); 
	        response.reset();  
	        response.setContentType("application/octet-stream; charset=utf-8"); 
	        response.addHeader("Content-disposition", "attachment; filename="+downLoadName);
			
			
			if("dataset".equals(service)){
				initDataSetRecords();
			}else if("sharedocs".equals(service)){
				initSharedocsRecords();
			}
			Map<String, InputStream> end = new HashMap<String, InputStream>();
			
			String[] arryRecords=selRecords.split(",");
			for (String Record : arryRecords) {
				if (MPIID != null) {
					Document table_doc = tableDocUploadService.process2(Record, MPIID,service,idCard);
					ByteArrayOutputStream o = new ByteArrayOutputStream();
					XMLHelper.putDocument(o, table_doc);
					ByteArrayInputStream inputStream = new ByteArrayInputStream(o.toByteArray());
					end.put(records.get(Record)+ "_" + userName + ".xml", inputStream);
				}
			}
			OutputStream out = response.getOutputStream();
			zipUtil = new ZipUtil(end, out);
			zipUtil.zip();
			out.flush();
		} catch (Exception e) {
			LOGGER.error(e.getMessage(), e);
		} finally {
			if (zipUtil != null) {
				zipUtil.close();
			}
		}
	}

	@RequestMapping(value = "/tableDocQuery", method = RequestMethod.POST)
	public void queryFormUpload(HttpServletResponse response,
			@RequestParam("DCID") String DCID,@RequestParam("RecordClassifying") String RecordClassifying) {
		try {
			Map<String, Object> map = tableDocUploadService.query(RecordClassifying,DCID);
			String content = (String) map.get("DOCCONTENT");
			content = xmlFormat(content);
			if (content != null) {
				HttpHelper.writeJSON(200, "查询成功", content, response);
			} else {
				HttpHelper.writeJSON(300, "查询失败", "", response);
			}
		} catch (Exception e) {
			e.printStackTrace();
			HttpHelper.writeJSON(500, "查询失败", "", response);
		}
	}
	
	public void initDataSetRecords(){
		this.records=new HashMap<String, String>();
		this.records.put("EHR_HealthRecord", "EHR-DE-01-个人基本信息-T01");
		this.records.put("Birth_Certificate", "EHR-DE-02-出生医学证明-T01");
		this.records.put("MHC_BabyVisitRecord", "EHR-DE-03-新生儿家庭访视信息-T01");
		this.records.put("CDH_CheckUp", "EHR-DE-04-儿童健康检查信息-T01");
//		this.records.put("FoodborneDiseases_Report", "职业病报告");
		this.records.put("MHC_VisitRecord", "EHR-DE-05-产前随访服务信息-T01");
		this.records.put("MHC_PostnatalVisitInfo", "EHR-DE-07-产后访视服务信息-T01");
		this.records.put("MHC_Postnatal42DayRecord", "EHR-DE-08-产后42天健康检查信息-T01");
		this.records.put("Vaccination_Report", "EHR-DE-09-预防接种卡信息-T01");
		this.records.put("InfectiousDisease_Report", "EHR-DE-10-传染病报告卡信息-T01");
		this.records.put("Death_Certificate", "EHR-DE-11-死亡医学证明-T01");
		this.records.put("MDC_HypertensionVisit", "EHR-DE-12-高血压患者随访信息-T01");
		this.records.put("MDC_DiabetesVisit", "EHR-DE-13-2型糖尿病患者随访信息-T01");
		this.records.put("PSY_PsychosisRecord", "EHR-DE-14-重性精神疾病患者管理信息-T01");
//		this.records.put("OccupationDisease_Report", "EHR-DE-15-食源性疾病报告卡信息-T01");
		this.records.put("Cu_Register", "EHR-DE-16-健康体检信息-T01");
		this.records.put("Opt_Record", "EHR-DE-17-门诊摘要信息-T01");
		this.records.put("Ipt_Record", "EHR-DE-18-住院摘要信息-T01");
		this.records.put("EMR_ConsultationRecord", "EHR-DE-19-会诊信息-T01");
		this.records.put("EMR_ReferralRecord", "EHR-DE-20-转诊（院）信息-T01");
	}

	public void initSharedocsRecords(){
		this.records = new HashMap<String, String>();
		this.records.put("EHR_HealthRecord", "EHR-SD-1-个人基本健康信息登记-T01");
		this.records.put("Birth_Certificate", "EHR-SD-2-出生医学证明-T01");
		this.records.put("MHC_BabyVisitRecord", "EHR-SD-3-新生儿家庭访视-T01");
		this.records.put("CDH_CheckUp", "EHR-SD-4-儿童健康体检-T01");
		this.records.put("MHC_FirstVisitRecord", "EHR-SD-5-首次产前随访服务-T01");//MHC_VisitRecord
		this.records.put("MHC_VisitRecord", "EHR-SD-6-产前随访服务-T01");
		this.records.put("MHC_PostnatalVisitInfo", "EHR-SD-7-产后访视-T01");
		this.records.put("MHC_Postnatal42DayRecord","EHR-SD-8-产后42天健康检查-T01");
		this.records.put("Vaccination_Report", "EHR-SD-9-预防接种报告-T01");
		this.records.put("InfectiousDisease_Report","EHR-SD-10-传染病报告-T01");
		this.records.put("Death_Certificate", "EHR-SD-11-死亡医学证明-T01");
		this.records.put("MDC_HypertensionVisit", "EHR-SD-12-高血压患者随访服务-T01");
		this.records.put("MDC_DiabetesVisit", "EHR-SD-13-2型糖尿病患者随访服务-T01");
		this.records.put("PSY_PsychosisRecord", "EHR-SD-14-重性精神疾病患者个人信息登记-T01");
		this.records.put("PSY_PsychosisVisit", "EHR-SD-15-重性精神病随访服务-T01");//PSY_PsychosisRecord
		this.records.put("Cu_Register", "EHR-SD-16-成人健康体检-T01");
		this.records.put("Opt_Record", "EHR-SD-17-门诊摘要-T01");
		this.records.put("Ipt_Record", "EHR-SD-18-住院摘要-T01");
		this.records.put("EMR_ConsultationRecord", "EHR-SD-19-会诊记录-T01");
		this.records.put("EMR_ReferralRecord", "EHR-SD-20-转诊（院）记录-T01");
	}
	
	
	public static String xmlFormat(String xml){
		SAXReader reader = new SAXReader();  
		StringWriter stringWriter = null;
		XMLWriter writer = null;
		try { 
			Document document = reader.read(new StringReader(xml));  
			if (document != null) {
				stringWriter = new StringWriter(); 
				//			OutputFormat format = new OutputFormat("", true);  
				OutputFormat format = OutputFormat.createPrettyPrint();
				format.setEncoding("UTF-8");
				format.setIndent(true);
				writer = new XMLWriter(stringWriter, format);  

				writer.write(document);  
				writer.flush();  
				xml = stringWriter.getBuffer().toString();	
			}
		}catch(Exception e){
			e.printStackTrace();
//			LOGGER.error(e.getMessage());
		}finally {  
			if (writer != null) {  
				try {
					writer.close();
				} catch (IOException e) {
					e.printStackTrace();
//					LOGGER.error(e);
				}  
			}  
		}
		return xml;
	}

}
