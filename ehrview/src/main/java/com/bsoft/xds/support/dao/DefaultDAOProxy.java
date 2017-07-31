/*
 * @(#)DefaultDAOProxy.java Created on 2013年11月28日 上午9:48:11
 * 
 * 版权：版权所有 Bsoft 保留所有权力。
 */
package com.bsoft.xds.support.dao;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.StringUtils;
import org.springframework.dao.DataAccessException;

import com.bsoft.ehr.privacy.PermissionDeniedDataAccessException;
import com.bsoft.ehr.privacy.config.PrivacyFilter;
import com.bsoft.ehr.privacy.config.PrivacyFilterConfigController;

/**
 * 默认的EHR中心库DAO代码类，本类对查询方法动态加入隐私控制的条件。
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
public class DefaultDAOProxy implements IDAO {

	private IDAO dao;

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.bsoft.xds.support.dao.IDAO#queryForCount(java.lang.String,
	 * java.lang.String, java.util.Map)
	 */
	@Override
	public int queryForCount(String classifying, String where,
			Map<String, Object> params) throws DataAccessException {
		checkPermission(classifying);
		where = wrapWhere(classifying, where);
		setParameter(classifying, params);
		return dao.queryForCount(classifying, where, params);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.bsoft.xds.support.dao.IDAO#queryForCount(java.lang.String,
	 * java.lang.String, java.lang.Object[])
	 */
	@Override
	public int queryForCount(String classifying, String where, Object[] params)
			throws DataAccessException {
		checkPermission(classifying);
		where = wrapWhere(classifying, where);
		setParameter(classifying, params);
		return dao.queryForCount(classifying, where, params);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.bsoft.xds.support.dao.IDAO#queryForMap(java.lang.String,
	 * java.lang.String, java.util.Map)
	 */
	@Override
	public Map<String, Object> queryForMap(String classifying, String where,
			Map<String, Object> params) throws DataAccessException {
		checkPermission(classifying);
		where = wrapWhere(classifying, where);
		setParameter(classifying, params);
		Map<String, Object> map = dao.queryForMap(classifying, where, params);
		if (map == null) {
			return null;
		}
		return DataMaskUtil.mask(classifying, map);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.bsoft.xds.support.dao.IDAO#queryForMap(java.lang.String,
	 * java.lang.String, java.lang.Object[])
	 */
	@Override
	public Map<String, Object> queryForMap(String classifying, String where,
			Object[] params) throws DataAccessException {
		checkPermission(classifying);
		where = wrapWhere(classifying, where);
		setParameter(classifying, params);
		Map<String, Object> map = dao.queryForMap(classifying, where, params);
		if (map == null) {
			return null;
		}
		return DataMaskUtil.mask(classifying, map);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.bsoft.xds.support.dao.IDAO#queryForMap(java.lang.String,
	 * java.util.Map)
	 */
	@Override
	public Map<String, Object> queryForMap(String hql,
			Map<String, Object> params) throws DataAccessException {
		QueryHQLAnalyzer ha = QueryHQLAnalyzer.getInstance(hql);
		String classifying = ha.getTableName();
		checkPermission(classifying);
		String where = ha.getWhereClause();
		where = wrapWhere(classifying, where);
		setParameter(classifying, params);
		Map<String, Object> map = dao.queryForMap(ha.replaceWhere(where), params);
		if (map == null) {
			return null;
		}
		return DataMaskUtil.mask(classifying, map);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.bsoft.xds.support.dao.IDAO#queryForMap(java.lang.String,
	 * java.lang.Object[])
	 */
	@Override
	public Map<String, Object> queryForMap(String hql, Object[] params)
			throws DataAccessException {
		QueryHQLAnalyzer ha = QueryHQLAnalyzer.getInstance(hql);
		String classifying = ha.getTableName();
		checkPermission(classifying);
		String where = ha.getWhereClause();
		where = wrapWhere(classifying, where);
		setParameter(classifying, params);
		Map<String, Object> map = dao.queryForMap(ha.replaceWhere(where), params);
		if (map == null) {
			return null;
		}
		return DataMaskUtil.mask(classifying, map);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.bsoft.xds.support.dao.IDAO#queryForList(java.lang.String,
	 * java.lang.String, java.util.Map)
	 */
	@Override
	public List<Map<String, Object>> queryForList(String classifying,
			String where, Map<String, Object> params)
			throws DataAccessException {
		checkPermission(classifying);
		where = wrapWhere(classifying, where);
		setParameter(classifying, params);
		List<Map<String, Object>> results = dao.queryForList(classifying,
				where, params);
		if (results == null || results.isEmpty()) {
			return results;
		}
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>(
				results.size());
		for (Map<String, Object> map : results) {
			list.add(DataMaskUtil.mask(classifying, map));
		}
		return list;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.bsoft.xds.support.dao.IDAO#queryForList(java.lang.String,
	 * java.lang.String, java.lang.Object[])
	 */
	@Override
	public List<Map<String, Object>> queryForList(String classifying,
			String where, Object[] params) throws DataAccessException {
		checkPermission(classifying);
		where = wrapWhere(classifying, where);
		setParameter(classifying, params);
		List<Map<String, Object>> results = dao.queryForList(classifying,
				where, params);
		if (results == null || results.isEmpty()) {
			return results;
		}
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>(
				results.size());
		for (Map<String, Object> map : results) {
			list.add(DataMaskUtil.mask(classifying, map));
		}
		return list;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.bsoft.xds.support.dao.IDAO#queryForList(java.lang.String,
	 * java.util.Map)
	 */
	@Override
	public List<Map<String, Object>> queryForList(String hql,
			Map<String, Object> params) throws DataAccessException {
		QueryHQLAnalyzer ha = QueryHQLAnalyzer.getInstance(hql);
		String classifying = ha.getTableName();
		checkPermission(classifying);
		String where = ha.getWhereClause();
		where = wrapWhere(classifying, where);
		setParameter(classifying, params);
		List<Map<String, Object>> results = dao.queryForList(
				ha.replaceWhere(where), params);
		if (results == null || results.isEmpty()) {
			return results;
		}
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>(
				results.size());
		for (Map<String, Object> map : results) {
			list.add(DataMaskUtil.mask(classifying, map));
		}
		return list;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.bsoft.xds.support.dao.IDAO#queryForList(java.lang.String,
	 * java.lang.Object[])
	 */
	@Override
	public List<Map<String, Object>> queryForList(String hql, Object[] params)
			throws DataAccessException {
		QueryHQLAnalyzer ha = QueryHQLAnalyzer.getInstance(hql);
		String classifying = ha.getTableName();
		checkPermission(classifying);
		String where = ha.getWhereClause();
		where = wrapWhere(classifying, where);
		setParameter(classifying, params);
		hql = ha.replaceWhere(where);
		List<Map<String, Object>> results = dao.queryForList(hql, params);
		if (results == null || results.isEmpty()) {
			return results;
		}
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>(
				results.size());
		for (Map<String, Object> map : results) {
			list.add(DataMaskUtil.mask(classifying, map));
		}
		return list;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.bsoft.xds.support.dao.IDAO#queryForPage(java.lang.String,
	 * java.lang.String, int, int, java.util.Map)
	 */
	@Override
	public List<Map<String, Object>> queryForPage(String classifying,
			String where, int start, int limit, Map<String, Object> params)
			throws DataAccessException {
		checkPermission(classifying);
		where = wrapWhere(classifying, where);
		setParameter(classifying, params);
		List<Map<String, Object>> results = dao.queryForPage(classifying,
				where, start, limit, params);
		if (results == null || results.isEmpty()) {
			return results;
		}
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>(
				results.size());
		for (Map<String, Object> map : results) {
			list.add(DataMaskUtil.mask(classifying, map));
		}
		return list;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.bsoft.xds.support.dao.IDAO#queryForPage(java.lang.String,
	 * java.lang.String, int, int, java.lang.Object[])
	 */
	@Override
	public List<Map<String, Object>> queryForPage(String classifying,
			String where, int start, int limit, Object[] params)
			throws DataAccessException {
		checkPermission(classifying);
		where = wrapWhere(classifying, where);
		setParameter(classifying, params);
		List<Map<String, Object>> results = dao.queryForPage(classifying,
				where, start, limit, params);
		if (results == null || results.isEmpty()) {
			return results;
		}
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>(
				results.size());
		for (Map<String, Object> map : results) {
			list.add(DataMaskUtil.mask(classifying, map));
		}
		return list;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.bsoft.xds.support.dao.IDAO#queryForPage(java.lang.String, int,
	 * int, java.util.Map)
	 */
	@Override
	public List<Map<String, Object>> queryForPage(String hql, int start,
			int limit, Map<String, Object> params) throws DataAccessException {
		QueryHQLAnalyzer ha = QueryHQLAnalyzer.getInstance(hql);
		String classifying = ha.getTableName();
		checkPermission(classifying);
		String where = ha.getWhereClause();
		where = wrapWhere(classifying, where);
		setParameter(classifying, params);
		List<Map<String, Object>> results = dao.queryForPage(
				ha.replaceWhere(where), start, limit, params);
		if (results == null || results.isEmpty()) {
			return results;
		}
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>(
				results.size());
		for (Map<String, Object> map : results) {
			list.add(DataMaskUtil.mask(classifying, map));
		}
		return list;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.bsoft.xds.support.dao.IDAO#queryForPage(java.lang.String, int,
	 * int, java.lang.Object[])
	 */
	@Override
	public List<Map<String, Object>> queryForPage(String hql, int start,
			int limit, Object[] params) throws DataAccessException {
		QueryHQLAnalyzer ha = QueryHQLAnalyzer.getInstance(hql);
		String classifying = ha.getTableName();
		checkPermission(classifying);
		String where = ha.getWhereClause();
		where = wrapWhere(classifying, where);
		setParameter(classifying, params);
		List<Map<String, Object>> results = dao.queryForPage(
				ha.replaceWhere(where), start, limit, params);
		if (results == null || results.isEmpty()) {
			return results;
		}
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>(
				results.size());
		for (Map<String, Object> map : results) {
			list.add(DataMaskUtil.mask(classifying, map));
		}
		return list;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.bsoft.xds.support.dao.IDAO#update(java.lang.String,
	 * java.util.Map)
	 */
	@Override
	public void update(String classifying, Map<String, Object> record)
			throws DataAccessException {
		dao.update(classifying, record);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.bsoft.xds.support.dao.IDAO#update(java.lang.String,
	 * java.lang.String, java.lang.String, java.lang.Object[])
	 */
	@Override
	public int update(String classifying, String clause, String where,
			Object[] params) throws DataAccessException {
		return dao.update(classifying, clause, where, params);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.bsoft.xds.support.dao.IDAO#delete(java.lang.String,
	 * java.lang.String, java.lang.String)
	 */
	@Override
	public int delete(String classifying, String fieldName, String value)
			throws DataAccessException {
		return dao.delete(classifying, fieldName, value);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.bsoft.xds.support.dao.IDAO#delete(java.lang.String,
	 * java.lang.String, java.lang.Object[])
	 */
	@Override
	public int delete(String classifying, String where, Object[] params)
			throws DataAccessException {
		return dao.delete(classifying, where, params);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.bsoft.xds.support.dao.IDAO#save(java.lang.String, java.util.Map)
	 */
	@Override
	public void save(String classifying, Map<String, Object> data)
			throws DataAccessException {
		dao.save(classifying, data);
	}

	/**
	 * @param classifying
	 * @throws DataAccessException
	 */
	private void checkPermission(String classifying) throws DataAccessException {
		PrivacyFilter pf = PrivacyFilterConfigController.instance()
				.getPrivacyFilter();
		if (pf.isPrevented(classifying)) {
			throw new PermissionDeniedDataAccessException("Access of ["
					+ classifying + "] is not permitted.");
		}
	}

	/**
	 * @param classifying
	 * @param where
	 * @return
	 */
	private String wrapWhere(String classifying, String where)
			throws DataAccessException {
		PrivacyFilter pf = PrivacyFilterConfigController.instance()
				.getPrivacyFilter();
		String condition = pf.getFilterCondition(classifying);
		if (StringUtils.isEmpty(condition)) {
			return where;
		}
		if (StringUtils.isEmpty(where)) {
			return condition;
		}
		return where + " and " + condition;
	}

	/**
	 * @param classifying
	 * @param params
	 * @throws DataAccessException
	 */
	private void setParameter(String classifying, Map<String, Object> params)
			throws DataAccessException {
		PrivacyFilter pf = PrivacyFilterConfigController.instance()
				.getPrivacyFilter();
		Map<String, Object> values = pf.getVariables(classifying);
		if (values != null && values.isEmpty() == false) {
			if (params == null) {
				params = new HashMap<String, Object>();
			}
			params.putAll(values);
		}
	}

	/**
	 * @param classifying
	 * @param params
	 * @throws DataAccessException
	 */
	private void setParameter(String classifying, Object[] params)
			throws DataAccessException {
		PrivacyFilter pf = PrivacyFilterConfigController.instance()
				.getPrivacyFilter();
		List<Object> values = pf.getVariableList(classifying);
		if (values == null || values.isEmpty()) {
			return;
		}
		int length = params == null ? values.size() : params.length
				+ values.size();
		Object[] array = new Object[length];
		int i = 0;
		if (params != null && params.length > 0) {
			System.arraycopy(params, 0, array, 0, params.length);
			i = params.length;
		}
		for (Object o : values) {
			array[i] = o;
			i++;
		}
	}

	public IDAO getDao() {
		return dao;
	}

	public void setDao(IDAO dao) {
		this.dao = dao;
	}

}
