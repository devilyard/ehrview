package com.bsoft.xds.support.instance.pt;

import java.util.List;
import java.util.Map;

import org.dom4j.Document;

import com.bsoft.xds.DocumentEntryRetrieveService;
import com.bsoft.xds.exception.DocumentEntryException;

import ctd.annotation.RpcService;

public interface IPtLabExamReportRealtimeRetrieveService extends DocumentEntryRetrieveService {

	/**
	 * 根据机构和检查流水号获得检查报告。
	 * 
	 * @param authorOrganizationCode
	 * @param examNo
	 * @return 报告单的bsxml格式文档。
	 */
//	@RpcService
//	public Document getExamReportDocument(String authorOrganizationCode,
//			String examNo) throws DocumentEntryException;

	/**
	 * 根据以下条件组合检索检查报告单列表。<br/>
	 * 身份证（或者医保卡） ---必填<br/>
	 * 开始日期---可选<br/>
	 * 结束日期 ---可选<br/>
	 * 页码--必填 （默认为：1）<br/>
	 * 每页展现条数 ---必填（默认为：25）<br/>
	 * 医疗机构编码 ---可选<br/>
	 * 报告单号：（检查流水号） ---可选<br/>
	 * 
	 * map型入参中的各参数key：<br/>
	 * 身份证（idCard），<br/>
	 * 医保卡（cardNo）+ 卡类别（cardTypeCode），<br/>
	 * 开始日期（beginDate），<br/>
	 * 结束日期（endDate），<br/>
	 * 医疗机构编码（authorOrganizationCode），<br/>
	 * 报告单号（reportNo）<br/>
	 * 
	 * @param args
	 * @param page
	 * @param recordClassifying
	 * @param limit
	 * @return 报告单列表，以时间从最近到过去排序。
	 * @throws DocumentEntryException
	 */
	@RpcService
	public List<Map<String, Object>> getLabExamReportDocuments(String idCard,
			String cardNo,
			String cardTypeCode, 
			String beginDate,
			String endDate,
			String authorOrganizationCode,
			String Name,
			String recordClassifying, 
			int page, 
			int limit
			)throws DocumentEntryException;
}
