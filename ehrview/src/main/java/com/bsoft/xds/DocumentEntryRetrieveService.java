package com.bsoft.xds;

import java.util.Date;
import java.util.List;
import java.util.Map;

import com.bsoft.xds.exception.DocumentEntryException;

import ctd.annotation.RpcService;

public interface DocumentEntryRetrieveService extends DocumentEntryService {

	/**
	 * 获取某条记录现有的所有文档格式，现有的文档格式指的是在文档表中存储的文档格式。
	 * 
	 * @param recordId
	 * @return
	 * @throws DocumentEntryException
	 */
	@RpcService
	public String[] getExistDocumentFormats(String recordId)
			throws DocumentEntryException;

	/**
	 * 获取某条记录支持的文档格式，支持的文档格式指的是除文档表存储的文档格式之外，还包括通过<code>TemplateFormater</code>
	 * 能转化出来的格式。
	 * 
	 * @param recordId
	 * @return
	 * @throws DocumentEntryException
	 */
	@RpcService
	public String[] getSupportFormats(String recordId)
			throws DocumentEntryException;

	/**
	 * 可以返回的最大记录数。
	 * 
	 * @param limit
	 */
	public void setMaxLimit(int limit);

	/**
	 * 可以回溯查询的数据的最大天数。
	 * 
	 * @param maxPeriodDays
	 */
	public void setMaxQueryPeriodDays(int maxPeriodDays);

	/**
	 * 设置格式转化器。
	 * 
	 * @param tfs
	 */
	public void setTemplateFormaters(List<TemplateFormater> tfs);

	/**
	 * 获取个人记录的总数。
	 * 
	 * @param mpiId
	 * @return
	 * @throws DocumentEntryException
	 */
	@RpcService
	public Integer getPersonalRecordsCount(String mpiId)
			throws DocumentEntryException;

	/**
	 * 获取指定格式的文档。
	 * 
	 * @param recordId
	 * @param format
	 * @return 如果格式是CDA或者BSXML，将返回<code>org.dom4j.Document</code>，否则返回byte[]。
	 * @throws DocumentEntryException
	 */
	@RpcService
	public Object getDocumentByRecordId(String recordId, String format)
			throws DocumentEntryException;

	/**
	 * 获取默认格式的文档。
	 * 
	 * @param recordId
	 * @return 如果默认的格式是CDA或者BSXML，将返回<code>org.dom4j.Document</code>，否则返回byte[]。
	 * @throws DocumentEntryException
	 */
	@RpcService
	public Object getDefaultDocumentByRecordId(String recordId)
			throws DocumentEntryException;

	/**
	 * 根据SourceId查询记录。
	 * 
	 * @param organization
	 * @param sourceId
	 * @return
	 * @throws DocumentEntryException
	 */
	@RpcService
	public Map<String, Object> getRecordBySourceId(String organization,
			String sourceId) throws DocumentEntryException;

	/**
	 * 查询个人记录。
	 * 
	 * @param mpiId
	 * @param start
	 * @param limit
	 * @return
	 * @throws DocumentEntryException
	 */
	@RpcService
	public List<Map<String, Object>> findPersonalRecords(String mpiId,
			int start, int limit) throws DocumentEntryException;

	/**
	 * 根据记录时间查询个人记录。
	 * 
	 * @param mpiId
	 * @param begin
	 * @param end
	 * @param start
	 * @param limit
	 * @return
	 * @throws DocumentEntryException
	 */
	@RpcService
	public List<Map<String, Object>> findPersonalRecordsByEffectiveTime(
			String mpiId, Date begin, Date end, int start, int limit)
			throws DocumentEntryException;

	/**
	 * 查询最近的个人记录。
	 * 
	 * @param mpiId
	 * @param periodDays
	 * @param start
	 * @param limit
	 * @return
	 * @throws DocumentEntryException
	 */
	@RpcService
	public List<Map<String, Object>> findPersonalRecordsByRecent(String mpiId,
			int periodDays, int start, int limit) throws DocumentEntryException;

	/**
	 * 将BSXML格式的文档转换成指定格式。
	 * 
	 * @param doc
	 * @param targetFormat
	 * @param sourceVersion
	 * @return
	 * @throws DocumentEntryException
	 */
	public Object formatBSXMLDocument(byte[] doc, String targetFormat,
			String sourceVersion) throws DocumentEntryException;
	
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
	@RpcService
	public String getPersonalRecords(String cardNo, String cardTypeCode, String dcid,int start, int limit)
			throws DocumentEntryException;
}
