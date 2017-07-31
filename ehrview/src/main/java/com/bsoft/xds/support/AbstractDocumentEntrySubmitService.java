/*
 * @(#)AbstractDocumentEntrySubmitService.java Created on Jan 10, 2013 3:32:57 PM
 *
 * 版权：版权所有 B-Soft 保留所有权力。
 */
package com.bsoft.xds.support;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.dao.DataAccessException;
import org.springframework.transaction.annotation.Transactional;

import com.bsoft.xds.DocumentCompressor;
import com.bsoft.xds.DocumentEntrySubmitService;
import com.bsoft.xds.exception.DocumentEntryException;
import com.bsoft.xds.support.dao.IDAO;

import ctd.annotation.RpcService;
import ctd.util.keyManager.KeyManager;
import ctd.util.keyManager.KeyMgtInitException;

/**
 * 
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
public abstract class AbstractDocumentEntrySubmitService implements
		DocumentEntrySubmitService {

	private String recordClassifying;
	private String recordDocClassifying;
	// private int regionCount;
	private IDAO dao;
	private List<DocumentCompressor> documentCompressors;
	private List<HashMap<String, String>> keyEntity;

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.bsoft.xds.DocumentEntrySubmitService#createRecord(java.util.Map)
	 */
	@RpcService
	@Override
	public String createRecord(Map<String, Object> record)
			throws DocumentEntryException {
		String key;
		try {
			key = KeyManager.getKeyByName(recordClassifying, getKeyEntity(),
					"DCID", null);
			record.put("DCID", key);
			dao.save(recordClassifying, record);
		} catch (DataAccessException e) {
			throw new DocumentEntryException(
					DocumentEntryException.DATABASE_ACCESS_FAILED, e);
		} catch (KeyMgtInitException e) {
			throw new DocumentEntryException(
					DocumentEntryException.ID_GENERATE_FAILED, e);
		}
		return key;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.bsoft.xds.DocumentEntrySubmitService#createRecords(java.util.List)
	 */
	@Override
	@RpcService
	@Transactional(rollbackFor = Throwable.class)
	public List<String> createRecords(List<Map<String, Object>> records)
			throws DocumentEntryException {
		List<String> keys = new ArrayList<String>(records.size());
		for (Map<String, Object> record : records) {
			keys.add(createRecord(record));
		}
		return keys;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.bsoft.xds.DocumentEntrySubmitService#updateRecord(java.util.HashMap)
	 */
	@Override
	@RpcService
	public void updateRecord(Map<String, Object> record)
			throws DocumentEntryException {
		try {
			dao.update(recordClassifying, record);
		} catch (DataAccessException e) {
			throw new DocumentEntryException(
					DocumentEntryException.DATABASE_ACCESS_FAILED, e);
		}
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.bsoft.xds.DocumentEntrySubmitService#removeRecord(java.lang.String)
	 */
	@Override
	@RpcService
	@Transactional(rollbackFor = Throwable.class)
	public void removeRecord(String recordId) throws DocumentEntryException {
		dao.delete(recordDocClassifying, "DCID", recordId);
		dao.delete(recordClassifying, "DCID", recordId);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.bsoft.xds.DocumentEntrySubmitService#removePersonalRecords(java.lang
	 * .String)
	 */
	@Override
	@RpcService
	@Transactional(rollbackFor = Throwable.class)
	public void removePersonalRecords(String mpiId)
			throws DocumentEntryException {
		dao.delete(recordDocClassifying, "DCID in (select DCID from "
				+ recordClassifying + " where MPIID=?)", new Object[] { mpiId });
		dao.delete(recordClassifying, "MPIID", mpiId);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.bsoft.xds.DocumentEntrySubmitService#updateRecordField(java.lang.
	 * String, java.lang.String, java.lang.Object)
	 */
	@Override
	@RpcService
	public void updateRecordField(String recordId, String fieldName, Object val)
			throws DocumentEntryException {
		try {
			dao.update(recordClassifying, "set " + fieldName + "=?", "DCID=?",
					new Object[] { val, recordId });
		} catch (DataAccessException e) {
			throw new DocumentEntryException(
					DocumentEntryException.DATABASE_ACCESS_FAILED, e);
		}
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.bsoft.xds.DocumentEntrySubmitService#submitDocument(java.lang.String,
	 * java.lang.String, java.lang.String, byte[])
	 */
	@Override
	@RpcService
	public void submitDocument(String recordId, String format,
			String compressionAlgorithm, byte[] content)
			throws DocumentEntryException {
		if (documentCompressors == null && compressionAlgorithm != null) {
			throw new DocumentEntryException(
					DocumentEntryException.DOCUMENT_COMPRESSION_NOT_SUPPORTED,
					"No document compressor.");
		}
		DocumentCompressor docCompressor = null;
		for (DocumentCompressor dc : documentCompressors) {
			if (dc.getAlgorithm().equalsIgnoreCase(compressionAlgorithm)) {
				docCompressor = dc;
				break;
			}
		}
		if (docCompressor == null) {
			throw new DocumentEntryException(
					DocumentEntryException.DOCUMENT_COMPRESSION_NOT_SUPPORTED,
					"No document compressor found of algorithm ["
							+ compressionAlgorithm + "].");
		}
		byte[] compressedContent;
		try {
			compressedContent = docCompressor.compress(content);
		} catch (IOException e) {
			throw new DocumentEntryException(
					DocumentEntryException.DOCUMENT_COMPRESS_FAILED,
					"Cannot compress document with algorithm ["
							+ compressionAlgorithm + "].", e);
		}
		Map<String, Object> data = new HashMap<String, Object>();
		data.put("DCID", recordId);
		data.put("DocFormat", format);
		data.put("DocContent", compressedContent);
		data.put("CompressionAlgorithm", compressionAlgorithm);
		try {
			data.put("DocID", KeyManager.getKeyByName(recordDocClassifying,
					getKeyEntity(), "DocID", null));
		} catch (KeyMgtInitException e) {
			throw new DocumentEntryException(
					DocumentEntryException.ID_GENERATE_FAILED, e);
		}
		dao.save(recordDocClassifying, data);
	}

	/**
	 * 初始化key配置。
	 * 
	 * @return
	 */
	private List<HashMap<String, String>> getKeyEntity() {
		if (keyEntity == null) {
			keyEntity = new ArrayList<HashMap<String, String>>(1);
			HashMap<String, String> e = new HashMap<String, String>();
			e.put("name", "increaseId");
			e.put("defaultFill", "0");
			e.put("type", "increase");
			e.put("length", "16");
			e.put("startPos", "1");
			keyEntity.add(e);
		}
		return keyEntity;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.bsoft.xds.DocumentEntrySubmitService#setRegionCount(int)
	 */
	@Override
	public void setRegionCount(int count) {
		// this.regionCount = count;
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

	public String getRecordClassifying() {
		return recordClassifying;
	}

	public String getRecordDocClassifying() {
		return recordDocClassifying;
	}

	public void setRecordDocClassifying(String recordDocClassifying) {
		this.recordDocClassifying = recordDocClassifying;
	}

	public IDAO getDao() {
		return dao;
	}

	public void setDao(IDAO dao) {
		this.dao = dao;
	}

	public List<DocumentCompressor> getDocumentCompressors() {
		return documentCompressors;
	}

	public void setDocumentCompressors(
			List<DocumentCompressor> documentCompressors) {
		this.documentCompressors = documentCompressors;
	}

}
