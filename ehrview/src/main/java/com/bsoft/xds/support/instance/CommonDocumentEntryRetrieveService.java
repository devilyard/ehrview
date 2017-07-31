/*
 * @(#)CommonDocumentEntryRetrieveService.java Created on Jan 10, 2013 3:34:39 PM
 *
 * 版权：版权所有 B-Soft 保留所有权力。
 */
package com.bsoft.xds.support.instance;

import java.util.List;
import java.util.Map;

import org.apache.commons.lang.StringUtils;
import org.joda.time.LocalDateTime;
import org.springframework.dao.DataAccessException;

import com.bsoft.xds.exception.DocumentEntryException;
import com.bsoft.xds.support.AbstractDocumentEntryRetrieveService;
import com.bsoft.xds.support.dao.IDAO;

import ctd.service.core.ServiceException;

/**
 * 
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
public class CommonDocumentEntryRetrieveService extends
		AbstractDocumentEntryRetrieveService {

	/**
	 * @param visitId
	 * @param authorOgranization
	 * @return
	 * @throws ServiceException
	 */
	public List<Map<String, Object>> getRecordByVisitId(String visitId,
			String authorOrganization, int start, int limit)
			throws DocumentEntryException {
		try {
			return getDao().queryForPage(recordClassifying,
					"JZLSH=? and AuthorOrganization=? and EffectiveFlag=? order by EffectiveTime desc",//VisitID
					start, limit,
					new Object[] { visitId, authorOrganization, "0" });
		} catch (DataAccessException e) {
			throw new DocumentEntryException(e);
		}
	}

	/**
	 * @param visitId
	 * @param authorOrganization
	 * @return
	 * @throws DocumentEntryException
	 */
	public Map<String, Object> getRecordByVisitId(String visitId,
			String authorOrganization) throws DocumentEntryException {
		try {
			return getDao().queryForMap(recordClassifying,
					"JZLSH=? and AuthorOrganization=? and EffectiveFlag=?",
					new Object[] { visitId, authorOrganization, "0" });
		} catch (DataAccessException e) {
			throw new DocumentEntryException(e);
		}
	}
	
	/**
	 * @param mpiId
	 * @return
	 * @throws DocumentEntryException
	 */
	public List<Map<String, Object>> getList(String mpiId) throws DocumentEntryException {
		try {
			return getDao().queryForList(getRecordClassifying(),
					 " MPIID=? and EffectiveFlag=?",
					new Object[] { mpiId, "0"});
		} catch (DataAccessException e) {
			throw new DocumentEntryException(
					DocumentEntryException.DATABASE_ACCESS_FAILED, e);
		}
	}
	
	/**
	 * @param mpiId
	 * @return
	 * @throws DocumentEntryException
	 */
	public Map<String, Object> getMap(String mpiId) throws DocumentEntryException {
		try {
			return getDao().queryForMap(getRecordClassifying(),
					 " MPIID=? and EffectiveFlag=?",
					new Object[] { mpiId, "0"});
		} catch (DataAccessException e) {
			throw new DocumentEntryException(
					DocumentEntryException.DATABASE_ACCESS_FAILED, e);
		}
	}
	
	
	public List<Map<String, Object>> queryOptRecords(String hql,String recordClassifying) throws ServiceException {
		try {
			return getDao().queryForList(recordClassifying, hql, new Object[]{});
		} catch (Exception e) {
			throw new ServiceException(e);
		}
	}
	
	
	/**
	 * 根据随访日期，取一段时间内的随访记录列表。
	 * 
	 * @param mpiId
	 * @param effectiveTime
	 * @return
	 * @throws DocumentEntryException
	 */
	public List<Map<String, Object>> getListByDate(String mpiId,
			String effectiveTime, int start, int limit)
			throws DocumentEntryException {
		String where = "MPIID=? and EffectiveFlag=?";
		Object[] params = new Object[] { mpiId, "0" };
		if (!StringUtils.isEmpty(effectiveTime)) {
			LocalDateTime begin = LocalDateTime.parse(effectiveTime + "-01-01");
			LocalDateTime end = LocalDateTime.parse(effectiveTime + "-12-31");
			params = new Object[] { mpiId, "0", begin.toDate(), end.toDate() };
			where += " and EffectiveTime>=? and EffectiveTime<=?";
		}
		where += " order by EffectiveTime desc";
		IDAO dao = getDao();
		try {
			return dao.queryForPage(getRecordClassifying(), where, start,
					limit, params);
		} catch (DataAccessException e) {
			throw new DocumentEntryException(
					DocumentEntryException.DATABASE_ACCESS_FAILED, e);
		}
	}
	
	
	/**
	 * 根据随访时间，获取一段时间内的产后访视信息。
	 * 
	 * @param pregnantId
	 * @return
	 * @throws DocumentEntryException
	 */
	public List<Map<String, Object>> getListByDate(String pregnantId)
			throws DocumentEntryException {
		String where = "EffectiveFlag=?";
		Object[] params = new Object[] { "0" };
		if (!StringUtils.isEmpty(pregnantId)) {
			params = new Object[] { pregnantId, "0" };
			where = "PregnantID=? and EffectiveFlag=?";
		}
		IDAO dao = getDao();
		try {
			return dao.queryForList(getRecordClassifying(), where, params);
		} catch (DataAccessException e) {
			throw new DocumentEntryException(
					DocumentEntryException.DATABASE_ACCESS_FAILED, e);
		}
	}
}
