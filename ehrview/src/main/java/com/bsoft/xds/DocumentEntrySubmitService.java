package com.bsoft.xds;

import java.util.List;
import java.util.Map;

import com.bsoft.xds.exception.DocumentEntryException;

import ctd.annotation.RpcService;

public interface DocumentEntrySubmitService extends DocumentEntryService {
	
	/**
	 * 设置分区总数。
	 * 
	 * @param count
	 */
	public void setRegionCount(int count);

	/**
	 * 创建一条索引表记录。
	 * 
	 * @param record
	 * @return 新插入数据的记录号。
	 * @throws DocumentEntryException
	 */
	@RpcService
	public String createRecord(Map<String, Object> record)
			throws DocumentEntryException;

	/**
	 * 批量创建索引表记录。
	 * 
	 * @param records
	 * @return 索引表记录号。
	 * @throws DocumentEntryException
	 */
	@RpcService
	public List<String> createRecords(List<Map<String, Object>> records)
			throws DocumentEntryException;

	/**
	 * 更新记录。
	 * 
	 * @param record
	 * @throws DocumentEntryException
	 */
	@RpcService
	public void updateRecord(Map<String, Object> record)
			throws DocumentEntryException;

	/**
	 * 删除记录，同时删除索引表和文档表对应的记录。
	 * 
	 * @param recordId 索引表记录号。
	 * @throws DocumentEntryException
	 */
	@RpcService
	public void removeRecord(String recordId) throws DocumentEntryException;;

	/**
	 * 删除一个mpiId对应的所有索引表记录和文档表记录。
	 * 
	 * @param mpiId
	 * @throws DocumentEntryException
	 */
	@RpcService
	public void removePersonalRecords(String mpiId)
			throws DocumentEntryException;

	/**
	 * 更新索引表的某个字段值。
	 * 
	 * @param recordId 索引表记录号。
	 * @param fieldName
	 * @param val
	 * @throws DocumentEntryException
	 */
	@RpcService
	public void updateRecordField(String recordId, String fieldName, Object val)
			throws DocumentEntryException;

	/**
	 * 提交一份文档。
	 * 
	 * @param recordId  索引表记录号。
	 * @param format 文档格式，如：BSXML，CDA，pdf等
	 * @param compressionAlgorithm 文档数据压缩算法，默认为gzip
	 * @param content 文档原始数据。
	 * @throws DocumentEntryException
	 */
	@RpcService
	public void submitDocument(String recordId, String format,
			String compressionAlgorithm, byte[] content)
			throws DocumentEntryException;
}
