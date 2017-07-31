package com.bsoft.xds.support.instance.pt;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.StringUtils;
import org.dom4j.Document;
import org.dom4j.DocumentException;
import org.dom4j.DocumentHelper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import wl.zs.utils.DateUtils;

import com.bsoft.ehr.redis.dao.RedisInitDao;
import com.bsoft.mpi.Constants;
import com.bsoft.mpi.server.MPIServiceException;
import com.bsoft.mpi.server.rpc.IMPIProvider;
import com.bsoft.xds.exception.DocumentEntryException;
import com.bsoft.xds.support.instance.CommonDocumentEntryRetrieveService;

import ctd.annotation.RpcService;

/**
 * 检查实时查询。
 */
public class PtLabExamReportDocumentEntryRealtimeRetrieveService extends
		CommonDocumentEntryRetrieveService implements
		IPtLabExamReportRealtimeRetrieveService {

	private static final Logger logger = LoggerFactory
			.getLogger(PtLabExamReportDocumentEntryRealtimeRetrieveService.class);
	@Autowired
	private IMPIProvider mpiService;
	
	@Autowired
	private RedisInitDao redisInitDao;

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.bsoft.xds.IPtExamReportRetrieveService#getExamReportDocument(java
	 * .lang.String, java.lang.String)
	 */
//	@Override
//	@RpcService
//	public Document getExamReportDocument(String authorOrganizationCode,
//			String examNo) throws DocumentEntryException {
//		if (StringUtils.isEmpty(authorOrganizationCode)
//				|| StringUtils.isEmpty(examNo)) {
//			logger.error("authorOrganizationCode or examNo is empty.");
//			throw new DocumentEntryException(
//					DocumentEntryException.ARGUMENTS_ERROR,
//					"authorOrganizationCode or examNo is empty.");
//		}
//		Map<String, Object> map = getDao().queryForMap(
//				getRecordClassifying(),
//				"AuthorOrganization=? and UPPER(JCLSH)=? and EffectiveFlag=?",
//				new Object[] { authorOrganizationCode, examNo.toUpperCase(),
//						"0" });
//		if (map == null || map.isEmpty()) {
//			logger.error(
//					"Record not found for AuthorOrganization[{}] and reportNo[{}].",
//					authorOrganizationCode, examNo);
//			throw new DocumentEntryException(
//					DocumentEntryException.RECORD_NOT_EXISTS,
//					"Record not found for AuthorOrganization["
//							+ authorOrganizationCode + "] and reportNo["
//							+ examNo + "]");
//		}
//
//		String dcId = (String) map.get("DCID");
//		String versionNumber = (String) map.get("versionNumber");
//		Map<String, Object> record = ((Map<String, Object>) this
//				.getDefaultDocumentByRecordId(dcId, versionNumber));
//		if (record == null) {
//			logger.error(
//					"Document not found for AuthorOrganization[{}] and reportNo[{}].",
//					authorOrganizationCode, examNo);
//			throw new DocumentEntryException(
//					DocumentEntryException.RECORD_DOC_NOT_EXISTS,
//					"Document not found for AuthorOrganization["
//							+ authorOrganizationCode + "] and reportNo["
//							+ examNo + "]");
//		}
//		String header = (String) record.get("HeaderContent");
//		Document content = (Document) record.get("DocContent");
//		StringBuilder sb = new StringBuilder("<Request>").append(header)
//				.append("<Body DocFormat=\"02\">")
//				.append(content.getRootElement().asXML())
//				.append("</Body></Request>");
//		try {
//			return DocumentHelper.parseText(sb.toString());
//		} catch (DocumentException e) {
//			logger.error("Document format error.", e);
//			throw new DocumentEntryException(
//					DocumentEntryException.DOCUMENT_PARSE_ERROR, e);
//		}
//	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.bsoft.xds.support.AbstractDocumentEntryRetrieveService#
	 * getDefaultDocumentByRecordId(java.lang.String)
	 */
//	@Override
//	public Document getDefaultDocumentByRecordId(String recordId)
//			throws DocumentEntryException {
//		Map<String, Object> map = getDao().queryForMap(getRecordClassifying(),
//				"DCID=? and EffectiveFlag=?", new Object[] { recordId, "0" });
//		if (map == null) {
//			logger.error("Record not found for dcId[{}].", recordId);
//			throw new DocumentEntryException(
//					DocumentEntryException.RECORD_NOT_EXISTS,
//					"Record not found for dcId[" + recordId + "]");
//		}
//		String versionNumber = (String) map.get("versionName");
//		Map<String, Object> doc = getDefaultDocumentByRecordId(recordId,
//				versionNumber);
//		if (doc == null) {
//			logger.error("Document not found for dcId[{}].", recordId);
//			throw new DocumentEntryException(
//					DocumentEntryException.RECORD_DOC_NOT_EXISTS,
//					"Document not found for dcId[" + recordId + "]");
//		}
//		String header = (String) doc.get("HeaderContent");
//		Document content = (Document) doc.get("DocContent");
//		StringBuilder sb = new StringBuilder("<Request>").append(header)
//				.append("<Body DocFormat=\"02\">")
//				.append(content.getRootElement().asXML())
//				.append("</Body></Request>");
//
//		Document document;
//		try {
//			document = DocumentHelper.parseText(sb.toString());
//		} catch (DocumentException e) {
//			logger.error("Document format error.", e);
//			throw new DocumentEntryException(e);
//		}
////		document.setXMLEncoding(ByteArrayUtils.guessEncoding(sb.toString()
////				.getBytes()));
//		return document;
//	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.bsoft.xds.IPtExamReportRetrieveService#getExamReportDocuments(java
	 * .util.Map, int, int)
	 */
	@Override
	@RpcService
	public List<Map<String, Object>> getLabExamReportDocuments(
				String idCard,
				String cardNo,
				String cardTypeCode, 
				String beginDate,
				String endDate,
				String authorOrganizationCode,
				String Name,
				String recordClassifying, 
				int page, 
				int limit
			)throws DocumentEntryException {
		
		String redisName = idCard+":"+cardNo+":"+cardTypeCode+":"+beginDate+":"
				+endDate+":"+authorOrganizationCode+":"+Name+":"+recordClassifying+":"+page+":"+limit;
		
		if (StringUtils.isEmpty(idCard)
				&& (StringUtils.isEmpty(cardNo) || StringUtils
						.isEmpty(cardTypeCode))) {
			logger.error("[idCard] or [cardNo and cardTypeCode] is necessary.");
			throw new DocumentEntryException(DocumentEntryException.MPI_FAILED,
					"[idCard] or [cardNo and cardTypeCode] is necessary.");
		}
		Map<String, Object> mpiArgs = new HashMap<String, Object>();
		if (StringUtils.isNotEmpty(idCard)) {
			mpiArgs.put(Constants.F_IDCARD, idCard);
		}
		if (StringUtils.isNotEmpty(cardNo)
				&& StringUtils.isNotEmpty(cardTypeCode)) {
			List<Map<String, Object>> cards = new ArrayList<Map<String, Object>>(
					1);
			Map<String, Object> card = new HashMap<String, Object>(2);
			card.put(Constants.F_CARDNO, cardNo);
			card.put(Constants.F_CARDTYPECODE, cardTypeCode);
			cards.add(card);
			mpiArgs.put(Constants.MPI_INTERFACE_FIELD_CARDS, cards);
		}
		List<String> mpiIds;
		try {
			mpiIds = mpiService.getMPIID(mpiArgs);
		} catch (MPIServiceException e) {
			logger.error("Failed to get MPIID with args[{}].", mpiArgs);
			throw new DocumentEntryException(DocumentEntryException.MPI_FAILED,
					e);
		}
		if (mpiIds == null || mpiIds.isEmpty()) {
			logger.error("MPI not found with args[{}].", mpiArgs);
			throw new DocumentEntryException(
					DocumentEntryException.MPI_NOT_FOUND, "MPI not found.");
		}
		String mpiId = mpiIds.get(0);
		//redis获取缓存数据 
		List<Map<String, Object>> list = redisInitDao.getListFromRedis(mpiId+":"+redisName);
		if(list != null && !list.isEmpty()){
			return list;
		}
		
		Map<String, Object> params = new HashMap<String, Object>();
		StringBuilder where = new StringBuilder("MPIID=:mpiId");
		params.put("mpiId", mpiId);
		if (StringUtils.isNotEmpty(beginDate)) {
			if("SUMMARY_Hist_Drug".equals(recordClassifying)){
				where.append(" and SystemTime>=:beginDate");
			}else{
				where.append(" and EffectiveTime>=:beginDate");
			}
			params.put("beginDate", DateUtils.toDate(beginDate));
		}
		if (StringUtils.isNotEmpty(endDate)) {
			if("SUMMARY_Hist_Drug".equals(recordClassifying)){
				where.append(" and SystemTime<=:endDate");
			}else{
				where.append(" and EffectiveTime<=:endDate");
			}
			params.put("endDate", DateUtils.toDate(endDate));
		}
		if (StringUtils.isNotEmpty(authorOrganizationCode)) {
			where.append(" and AuthorOrganization=:authorOrganizationCode");
			params.put("authorOrganizationCode", authorOrganizationCode);
		}
		
		if (StringUtils.isNotEmpty(Name)) {
			String[] names = Name.split(",");
			String name = "";
			for(String n : names){
				name += "'"+ n +"'" + ",";
			}
			if(!"".equals(name)){
				name = name.substring(0,name.lastIndexOf(","));
			}
			if("SUMMARY_Hist_Drug".equals(recordClassifying)){
				where.append(" and MedicineName in ("+name+")");
//					params.put("medicineName", Name);
			}else if("Pt_ExamReport".equals(recordClassifying)){
				where.append(" and JCXMMC in ("+name+")");
//					params.put("jcxmmc", Name);
			}
		}
		where.append(" and EffectiveFlag=:effectiveFlag");
		params.put("effectiveFlag", "0");
		List<Map<String, Object>> records = getDao().queryForPage(recordClassifying, where.toString(),
				(page - 1) * limit, limit, params);
		//入redis缓存
		if(records != null && !records.isEmpty()){
			redisInitDao.addList(records, mpiId+":"+redisName);
		}
		return records;
	}

	/**
	 * @return the mpiService
	 */
	public IMPIProvider getMpiService() {
		return mpiService;
	}

	/**
	 * @param mpiService
	 *            the mpiService to set
	 */
	public void setMpiService(IMPIProvider mpiService) {
		this.mpiService = mpiService;
	}

}
