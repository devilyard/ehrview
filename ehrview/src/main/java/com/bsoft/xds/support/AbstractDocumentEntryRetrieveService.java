package com.bsoft.xds.support;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.ArrayUtils;
import org.apache.commons.lang3.StringUtils;
import org.joda.time.LocalDate;
import org.springframework.beans.factory.annotation.Autowired;

import com.alibaba.fastjson.JSONObject;
import com.bsoft.ehr.extend.dic.DocumentFormat;
import com.bsoft.mpi.Constants;
import com.bsoft.mpi.server.MPIServiceException;
import com.bsoft.mpi.server.rpc.IMPIProvider;
import com.bsoft.xds.DocumentCompressor;
import com.bsoft.xds.DocumentEntryRetrieveService;
import com.bsoft.xds.TemplateFormater;
import com.bsoft.xds.exception.DocumentEntryException;
import com.bsoft.xds.support.dao.IDAO;

import ctd.annotation.RpcService;
import ctd.util.context.ContextUtils;

public abstract class AbstractDocumentEntryRetrieveService implements
		DocumentEntryRetrieveService {

	protected String recordClassifying;
	protected String recordDocClassifying;
	protected int maxPeriodDays;
	protected int maxLimit;
	protected String defaultFormat = "02";// @@ BSXML
	private IDAO dao;
	private List<TemplateFormater> templateFormaters;
	private List<DocumentCompressor> documentDecompressors;
	@Autowired
	private IMPIProvider mpiService;

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.bsoft.xds.DocumentEntryRetrieveService#getExistFormats(java.lang.
	 * String)
	 */
	@Override
	@RpcService
	public String[] getExistDocumentFormats(String recordId)
			throws DocumentEntryException {
		List<Map<String, Object>> list = dao.queryForList(
				"select DocFormat as DocFormat from " + recordDocClassifying
						+ " where DCID=?", new Object[] { recordId });
		if (isEmpty(list)) {
			return new String[0];
		}
		String[] formats = new String[list.size()];
		int i = 0;
		for (Map<String, Object> m : list) {
			formats[i] = (String) m.get("DocFormat");
			i++;
		}
		return formats;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.bsoft.xds.DocumentEntryRetrieveService#getSupportFormats(java.lang
	 * .String)
	 */
	@Override
	@RpcService
	public String[] getSupportFormats(String recordId)
			throws DocumentEntryException {
		String[] formats = this.getExistDocumentFormats(recordId);
		if (templateFormaters == null || templateFormaters.isEmpty()) {
			return formats;
		}
		String[] array = new String[formats.length + templateFormaters.size()];
		System.arraycopy(formats, 0, array, 0, formats.length);
		int i = 0;
		for (TemplateFormater tf : templateFormaters) {
			if (ArrayUtils.contains(array, tf.getSourceFormat())
					&& !ArrayUtils.contains(array, tf.getDestFormat())) {
				array[formats.length + i] = tf.getDestFormat();
			}
		}
		return ArrayUtils.subarray(array, 0, formats.length + i);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.bsoft.xds.DocumentEntryRetrieveService#getPersonalRecordsCount(java
	 * .lang.String)
	 */
	@Override
	@RpcService
	public Integer getPersonalRecordsCount(String mpiId)
			throws DocumentEntryException {
		int count = dao.queryForCount(recordClassifying,
				"MPIID=? and EffectiveFlag=?", new Object[] { mpiId, "0" });
		return count;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.bsoft.xds.DocumentEntryRetrieveService#getDocumentByRecordId(java
	 * .lang.String, java.lang.String)
	 */
	@Override
	@RpcService
	public Object getDocumentByRecordId(String recordId, String format)
			throws DocumentEntryException {
		Map<String, Object> doc = dao.queryForMap(recordDocClassifying,
				"DCID=?", new Object[] { recordId });
		if (doc == null) {
			return null;
		}
		Object o = doc.get("HtmlContent");//先判断 有没html值
		
		if(o == null){ //判断xml值
			Object obj = doc.get("DocContent");
			if (obj == null) {
				return null;
			}
			byte[] content = (byte[]) obj;
			String compressionAlgorithm = (String) doc.get("CompressionAlgorithm");
			byte[] decomressedContent = decompressDocument(compressionAlgorithm,
					content);
			String docFormat = (String) doc.get("DocFormat");
			if(!StringUtils.isEmpty(docFormat)){
				docFormat = docFormat.trim();
			}
			// @@ 如果格式不符合，尝试使用转换器转。
			if (!docFormat.equals(format)) {
				Map<String, Object> record = dao.queryForMap(recordClassifying,
						"DCID=? and EffectiveFlag=?",
						new Object[] { recordId, "0" });
				String version = (String) record.get("VersionNumber");
				TemplateFormater templateFormater = getTemplateFormater(docFormat,
						format, version);
				if (templateFormater == null) {
					return null;
				}
				return formatDocument(decomressedContent, templateFormater);
			}
			return new String(decomressedContent);
		}else{
			return new String((byte[]) o);
		}
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.bsoft.xds.DocumentEntryRetrieveService#getRecordBySourceId(java.lang
	 * .String, java.lang.String)
	 */
	@Override
	@RpcService
	public Map<String, Object> getRecordBySourceId(String organization,
			String sourceId) throws DocumentEntryException {
		return dao.queryForMap(recordClassifying,
				"AuthorOrganization=? and SourceID=? and EffectiveFlag=?",
				new Object[] { organization, sourceId, "0" });
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.bsoft.xds.DocumentEntryRetrieveService#getDefaultDocumentByRecordId
	 * (java.lang.String)
	 */
	@Override
	@RpcService
	public Object getDefaultDocumentByRecordId(String recordId)
			throws DocumentEntryException {
		return getDocumentByRecordId(recordId, defaultFormat);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.bsoft.xds.DocumentEntryRetrieveService#findPersonalRecords(java.lang
	 * .String, int, int)
	 */
	@Override
	@RpcService
	public List<Map<String, Object>> findPersonalRecords(String mpiId,
			int start, int limit) throws DocumentEntryException {
		if (maxLimit > 0 && limit > maxLimit) {
			throw new DocumentEntryException(
					DocumentEntryException.LIMIT_MAX_EXCEED);
		}
		return dao.queryForPage(recordClassifying,
				"MPIID=? and EffectiveFlag=? order by EffectiveTime desc",
				start, limit, new Object[] { mpiId, "0" });
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.bsoft.xds.DocumentEntryRetrieveService#findPersonalRecordsByEffectiveTime
	 * (java.lang.String, java.util.Date, java.util.Date, int, int)
	 */
	@Override
	@RpcService
	public List<Map<String, Object>> findPersonalRecordsByEffectiveTime(
			String mpiId, Date begin, Date end, int start, int limit)
			throws DocumentEntryException {
		if (maxLimit > 0 && limit > maxLimit) {
			throw new DocumentEntryException(
					DocumentEntryException.LIMIT_MAX_EXCEED);
		}
		return dao.queryForPage(recordClassifying,
				"EffectiveTime>=? and EffectiveTime<?", start, limit,
				new Object[] { begin, end });
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.bsoft.xds.DocumentEntryRetrieveService#findPersonalRecordsByRecent
	 * (java.lang.String, int, int, int)
	 */
	@Override
	@RpcService
	public List<Map<String, Object>> findPersonalRecordsByRecent(String mpiId,
			int periodDays, int start, int limit) throws DocumentEntryException {
		if (maxLimit > 0 && limit > maxLimit) {
			throw new DocumentEntryException(
					DocumentEntryException.LIMIT_MAX_EXCEED);
		}
		if (maxPeriodDays > 0 && periodDays > maxPeriodDays) {
			throw new DocumentEntryException(
					DocumentEntryException.PERIOD_RANGE_EXCEED);
		}
		LocalDate begin = new LocalDate();
		if (maxPeriodDays > 0 && periodDays > maxPeriodDays) {
			periodDays = maxPeriodDays;
		}
		LocalDate end = begin.plusDays(periodDays);
		return findPersonalRecordsByEffectiveTime(mpiId, begin.toDate(),
				end.toDate(), start, limit);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.bsoft.xds.DocumentEntryRetrieveService#formatBSXMLDocument(byte[],
	 * java.lang.String, java.lang.String)
	 */
	@Override
	@RpcService
	public Object formatBSXMLDocument(byte[] doc, String versionNumber,
			String targetFormat) throws DocumentEntryException {
		if (targetFormat.equals(DocumentFormat.BSXML)) {
			return doc;
		}
		if (getTemplateFormaters() == null || getTemplateFormaters().isEmpty()) {
			throw new DocumentEntryException(
					DocumentEntryException.DOCUMENT_FORMAT_FAILED,
					"No document formater defined.");
		}
		for (TemplateFormater tf : getTemplateFormaters()) {
			if ("02".equals(tf.getSourceFormat())
					&& targetFormat.equals(tf.getDestFormat())
					&& versionNumber.equals(tf.getAcceptableVersion())) {
				ContextUtils.put("classifying", recordClassifying);
				return tf.run(doc);
			}
		}
		throw new DocumentEntryException(
				DocumentEntryException.DOCUMENT_FORMAT_FAILED,
				"No document formater defined for" + targetFormat + ".");
	}
	
	
	
	/**
	 * 获取个人业务数据
	 * @param cardNo
	 * @param cardTypeCode
	 * @param effectivetime
	 * @param start
	 * @param limit
	 * @return
	 * @throws DocumentEntryException
	 */
	@Override
	@RpcService
	public String getPersonalRecords(String cardNo,
			String cardTypeCode, String dcid, int page, int limit)
			throws DocumentEntryException {
		
		if ((StringUtils.isEmpty(cardNo) || StringUtils
						.isEmpty(cardTypeCode))) {
			throw new DocumentEntryException(DocumentEntryException.MPI_FAILED,
					"[cardNo and cardTypeCode] is necessary.");
		}
		Map<String, Object> mpiArgs = new HashMap<String, Object>();
		if ("01".equals(cardTypeCode)) {//身份证
			mpiArgs.put(Constants.F_IDCARD, cardNo);
		}else{
			if (StringUtils.isNotEmpty(cardNo)
					&& StringUtils.isNotEmpty(cardTypeCode)) {
				List<Map<String, Object>> cards = new ArrayList<Map<String, Object>>(
						1);
				Map<String, Object> card = new HashMap<String, Object>(2);
				card.put(Constants.F_CERTIFICATENO, cardNo);
				card.put(Constants.F_CERTIFICATETYPECODE, cardTypeCode);
				cards.add(card);
				mpiArgs.put(Constants.MPI_INTERFACE_FIELD_CERTIFICATES, cards);
			}
		}
		List<String> mpiIds;
		try {
			mpiIds = mpiService.getMPIID(mpiArgs);
		} catch (MPIServiceException e) {
			throw new DocumentEntryException(DocumentEntryException.MPI_FAILED,
					e);
		}
		if (mpiIds == null || mpiIds.isEmpty()) {
			throw new DocumentEntryException(
					DocumentEntryException.MPI_NOT_FOUND, "MPI not found.");
		}
		String mpiId = mpiIds.get(0);
		Map<String, Object> params = new HashMap<String, Object>();
		StringBuilder where = new StringBuilder("MPIID=:mpiId and EffectiveFlag=:effectiveFlag ");
		params.put("mpiId", mpiId);
		params.put("effectiveFlag", "0");
		if(!StringUtils.isEmpty(dcid)){
			where.append(" and DCID >:dcid");
			params.put("dcid", dcid);
		}
		where.append(" order by EffectiveTime desc ");
		List<Map<String, Object>> records = getDao().queryForPage(recordClassifying, where.toString(),
				(page - 1) * limit, limit, params);
		int count = getDao().queryForCount(recordClassifying, where.toString(), params);
		
		JSONObject obj = new JSONObject();
		obj.put("count",count);
		obj.put("list", records);
		return obj.toJSONString();
	}

	/**
	 * @param sourceFormat
	 * @param destFormat
	 * @param version
	 * @return
	 * @throws DocumentEntryException
	 */
	protected TemplateFormater getTemplateFormater(String sourceFormat,
			String destFormat, String version) throws DocumentEntryException {
		for (TemplateFormater tf : templateFormaters) {
			// @@ 如果转换器能转换成目标格式，并且源格式相符。
			if (tf.getSourceFormat().equals(sourceFormat)
					&& tf.getDestFormat().equals(destFormat)
					&& version.equals(tf.getAcceptableVersion())) {
				return tf;
			}
		}
		return null;
	}

	/**
	 * @param doc
	 * @return
	 * @throws DocumentEntryException
	 */
	protected byte[] decompressDocument(String compressionAlgorithm, byte[] doc)
			throws DocumentEntryException {
		if (StringUtils.isEmpty(compressionAlgorithm)) {
			return doc;
		}
		if (compressionAlgorithm != null && isEmpty(documentDecompressors)) {
			throw new DocumentEntryException(
					DocumentEntryException.DOCUMENT_COMPRESSION_NOT_SUPPORTED,
					"No document decompressor.");
		}
		for (DocumentCompressor dc : documentDecompressors) {
			if (dc.getAlgorithm().equalsIgnoreCase(compressionAlgorithm)) {
				try {
					return dc.decompress(doc);
				} catch (IOException e) {
					throw new DocumentEntryException(
							DocumentEntryException.DOCUMENT_COMPRESS_FAILED,
							e.getMessage(), e);
				}
			}
		}
		throw new DocumentEntryException(
				DocumentEntryException.DOCUMENT_COMPRESSION_NOT_SUPPORTED,
				"No document decompressor found for [" + compressionAlgorithm
						+ "].");
	}

	/**
	 * 格式化从数据库里取出来的文档，如果文档类型是01（CDA）或者02（BSXML）将返回一个
	 * <code>org.dom4j.Document</code> 对象，否则将调用受支持的
	 * <code>com.bsoft.xds.TemplateFormater</code>实例来进行格式化。如果是不受支持的类将抛出
	 * <code>com.bsoft.xds.exception.DocumentEntryException</code>异常。
	 * 
	 * @param content
	 * @param version
	 * @param sourceFormat
	 * @param destFormat
	 * @return
	 */
	protected Object formatDocument(byte[] content,
			TemplateFormater templateFormater) throws DocumentEntryException {
		if (templateFormater == null) {
			return content;
		}
		ContextUtils.put("classifying", recordClassifying);
		Object formated = templateFormater.run(content);
		// if ("01".equals(destFormat) || "02".equals(destFormat)) {
		// ByteArrayInputStream bais = new ByteArrayInputStream(content);
		// try {
		// return new SAXReader().read(bais);
		// } catch (DocumentException e) {
		// throw new DocumentEntryException(e);
		// }
		// }
		return formated;
	}

	/**
	 * @param list
	 * @return
	 */
	private boolean isEmpty(List<?> list) {
		return list == null || list.isEmpty();
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.bsoft.xds.DocumentEntryService#setRecordClassifying(java.lang.String)
	 */
	@Override
	public void setRecordClassifying(String recordClassifying) {
		this.recordClassifying = recordClassifying;
		if (this.recordDocClassifying == null) {
			this.recordDocClassifying = recordClassifying + "_Doc";
		}
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.bsoft.xds.DocumentEntryRetrieveService#setMaxQueryPeriodDays(int)
	 */
	@Override
	public void setMaxQueryPeriodDays(int maxPeriodDays) {
		this.maxPeriodDays = maxPeriodDays;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.bsoft.xds.DocumentEntryRetrieveService#setMaxLimit(int)
	 */
	@Override
	public void setMaxLimit(int limit) {
		maxLimit = limit;
	}

	public String getRecordClassifying() {
		return recordClassifying;
	}

	public String getRecordDocClassifying() {
		return recordDocClassifying;
	}

	public void setRecordDocClassifying(String recordDocClassifying) {
		this.recordDocClassifying = recordDocClassifying;
	}

	public int getMaxPeriodDays() {
		return maxPeriodDays;
	}

	public void setMaxPeriodDays(int maxPeriodDays) {
		this.maxPeriodDays = maxPeriodDays;
	}

	public String getDefaultFormat() {
		return defaultFormat;
	}

	public void setDefaultFormat(String defaultFormat) {
		this.defaultFormat = defaultFormat;
	}

	public IDAO getDao() {
		return dao;
	}

	public void setDao(IDAO dao) {
		this.dao = dao;
	}

	public int getMaxLimit() {
		return maxLimit;
	}

	@Override
	public void setTemplateFormaters(List<TemplateFormater> templateFormaters) {
		this.templateFormaters = templateFormaters;
	}

	public List<TemplateFormater> getTemplateFormaters() {
		return templateFormaters;
	}

	public List<DocumentCompressor> getDocumentDecompressors() {
		return documentDecompressors;
	}

	public void setDocumentDecompressors(
			List<DocumentCompressor> documentDecompressors) {
		this.documentDecompressors = documentDecompressors;
	}

}
