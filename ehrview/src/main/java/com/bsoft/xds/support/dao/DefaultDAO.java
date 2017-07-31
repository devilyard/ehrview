package com.bsoft.xds.support.dao;

import java.sql.SQLException;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import org.apache.commons.lang.StringUtils;
import org.hibernate.HibernateException;
import org.hibernate.Query;
import org.hibernate.Session;
import org.hibernate.transform.Transformers;
import org.springframework.dao.DataAccessException;
import org.springframework.orm.hibernate3.HibernateCallback;
import org.springframework.orm.hibernate3.support.HibernateDaoSupport;

/**
 * EHR中心库默认的DAO实现。
 * 
 * @author chinnsii
 */
public class DefaultDAO extends HibernateDaoSupport implements IDAO {

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.bsoft.xds.support.dao.IDAO#queryForCount(java.lang.String,
	 * java.lang.String, java.util.Map)
	 */
	public int queryForCount(String classifying, String where,
			Map<String, Object> params) throws DataAccessException {
		String hql = new StringBuilder("select count(*) as count from ")
				.append(classifying).append(" where ").append(where).toString();
		Map<String, Object> r = queryForMap(hql, params);
		return ((Long) r.get("count")).intValue();
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.bsoft.xds.support.dao.IDAO#queryForCount(java.lang.String,
	 * java.lang.String, java.lang.Object[])
	 */
	public int queryForCount(String classifying, String where, Object[] params)
			throws DataAccessException {
		String hql = new StringBuilder("select count(*) as count from ")
				.append(classifying).append(" where ").append(where).toString();
		Map<String, Object> r = queryForMap(hql, params);
		return ((Long) r.get("count")).intValue();
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.bsoft.xds.support.dao.IDAO#queryForMap(java.lang.String,
	 * java.lang.String, java.util.Map)
	 */
	public Map<String, Object> queryForMap(String classifying, String where,
			Map<String, Object> params) throws DataAccessException {
		String hql = new StringBuilder("from ").append(classifying)
				.append(" where ").append(where).toString();
		return queryForMap(hql, params);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.bsoft.xds.support.dao.IDAO#queryForMap(java.lang.String,
	 * java.lang.String, java.lang.Object[])
	 */
	public Map<String, Object> queryForMap(String classifying, String where,
			Object[] params) throws DataAccessException {
		String hql = new StringBuilder("from ").append(classifying)
				.append(" where ").append(where).toString();
		return queryForMap(hql, params);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.bsoft.xds.support.dao.IDAO#queryForList(java.lang.String,
	 * java.lang.String, java.util.Map)
	 */
	public List<Map<String, Object>> queryForList(String classifying,
			String where, Map<String, Object> params)
			throws DataAccessException {
		String hql = new StringBuilder("from ").append(classifying)
				.append(" where ").append(where).toString();
		return queryForList(hql, params);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.bsoft.xds.support.dao.IDAO#queryForList(java.lang.String,
	 * java.lang.String, java.lang.Object[])
	 */
	public List<Map<String, Object>> queryForList(String classifying,
			String where, Object[] params) throws DataAccessException {
		StringBuilder hql = new StringBuilder("from ").append(classifying);
		if (StringUtils.isEmpty(where) == false) {
			hql.append(" where ").append(where).toString();
		}
		return queryForList(hql.toString(), params);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.bsoft.xds.support.dao.IDAO#queryForPage(java.lang.String,
	 * java.lang.String, int, int, java.util.Map)
	 */
	public List<Map<String, Object>> queryForPage(String classifying,
			String where, final int start, final int limit,
			final Map<String, Object> params) throws DataAccessException {
		final String hql = new StringBuilder("from ").append(classifying)
				.append(" where ").append(where).toString();
		return queryForPage(hql, start, limit, params);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.bsoft.xds.support.dao.IDAO#queryForPage(java.lang.String,
	 * java.lang.String, int, int, java.lang.Object[])
	 */
	public List<Map<String, Object>> queryForPage(String classifying,
			String where, final int start, final int limit,
			final Object[] params) throws DataAccessException {
		final String hql = new StringBuilder("from ").append(classifying)
				.append(" where ").append(where).toString();
		return queryForPage(hql, start, limit, params);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.bsoft.xds.support.dao.IDAO#queryForPage(java.lang.String, int,
	 * int, java.util.Map)
	 */
	public List<Map<String, Object>> queryForPage(final String hql,
			final int start, final int limit, final Map<String, Object> params)
			throws DataAccessException {
		return getHibernateTemplate().execute(
				new HibernateCallback<List<Map<String, Object>>>() {
					@SuppressWarnings("unchecked")
					@Override
					public List<Map<String, Object>> doInHibernate(
							Session session) throws HibernateException,
							SQLException {
						Query query = session.createQuery(hql);
						wrapQuery(hql, query);
						if (params != null && params.isEmpty() == false) {
							for (Entry<String, Object> e : params.entrySet()) {
								query.setParameter(e.getKey(), e.getValue());
							}
						}
						query.setFirstResult(start);
						query.setMaxResults(limit);
						return query.list();
					}
				});
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.bsoft.xds.support.dao.IDAO#queryForPage(java.lang.String, int,
	 * int, java.lang.Object[])
	 */
	public List<Map<String, Object>> queryForPage(final String hql,
			final int start, final int limit, final Object[] params)
			throws DataAccessException {
		return getHibernateTemplate().execute(
				new HibernateCallback<List<Map<String, Object>>>() {
					@SuppressWarnings("unchecked")
					@Override
					public List<Map<String, Object>> doInHibernate(
							Session session) throws HibernateException,
							SQLException {
						Query query = session.createQuery(hql);
						wrapQuery(hql, query);
						if (params != null && params.length > 0) {
							for (int i = 0; i < params.length; i++) {
								query.setParameter(i, params[i]);
							}
						}
						query.setFirstResult(start);
						query.setMaxResults(limit);
						return query.list();
					}
				});
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.bsoft.xds.support.dao.IDAO#executeQueryList(java.lang.String,
	 * java.util.Map)
	 */
	public List<Map<String, Object>> queryForList(final String hql,
			final Map<String, Object> params) throws DataAccessException {
		return getHibernateTemplate().execute(
				new HibernateCallback<List<Map<String, Object>>>() {
					@SuppressWarnings("unchecked")
					@Override
					public List<Map<String, Object>> doInHibernate(
							Session session) throws HibernateException,
							SQLException {
						Query query = session.createQuery(hql);
						wrapQuery(hql, query);
						if (params != null && params.isEmpty() == false) {
							for (Entry<String, Object> e : params.entrySet()) {
								query.setParameter(e.getKey(), e.getValue());
							}
						}
						return query.list();
					}
				});
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.bsoft.xds.support.dao.IDAO#executeQueryList(java.lang.String,
	 * java.lang.Object[])
	 */
	public List<Map<String, Object>> queryForList(final String hql,
			final Object[] params) throws DataAccessException {
		return getHibernateTemplate().execute(
				new HibernateCallback<List<Map<String, Object>>>() {
					@SuppressWarnings("unchecked")
					@Override
					public List<Map<String, Object>> doInHibernate(
							Session session) throws HibernateException,
							SQLException {
						Query query = session.createQuery(hql);
						wrapQuery(hql, query);
						if (params != null && params.length > 0) {
							for (int i = 0; i < params.length; i++) {
								query.setParameter(i, params[i]);
							}
						}
						return query.list();
					}
				});
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.bsoft.xds.support.dao.IDAO#executeQueryOne(java.lang.String,
	 * java.util.Map)
	 */
	public Map<String, Object> queryForMap(final String hql,
			final Map<String, Object> params) throws DataAccessException {
		return getHibernateTemplate().execute(
				new HibernateCallback<Map<String, Object>>() {
					@SuppressWarnings("unchecked")
					@Override
					public Map<String, Object> doInHibernate(Session session)
							throws HibernateException, SQLException {
						Query query = session.createQuery(hql);
						wrapQuery(hql, query);
						if (params != null && params.isEmpty() == false) {
							for (Entry<String, Object> e : params.entrySet()) {
								query.setParameter(e.getKey(), e.getValue());
							}
						}
						return (Map<String, Object>) query.uniqueResult();
					}
				});
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.bsoft.xds.support.dao.IDAO#executeQueryOne(java.lang.String,
	 * java.lang.Object[])
	 */
	public Map<String, Object> queryForMap(final String hql,
			final Object[] params) throws DataAccessException {
		return getHibernateTemplate().execute(
				new HibernateCallback<Map<String, Object>>() {
					@SuppressWarnings("unchecked")
					@Override
					public Map<String, Object> doInHibernate(Session session)
							throws HibernateException, SQLException {
						Query query = session.createQuery(hql);
						wrapQuery(hql, query);
						if (params != null && params.length > 0) {
							for (int i = 0; i < params.length; i++) {
								query.setParameter(i, params[i]);
							}
						}
						return (Map<String, Object>) query.uniqueResult();
					}
				});
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
		getHibernateTemplate().update(classifying, record);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.bsoft.xds.support.dao.IDAO#update(java.lang.String,
	 * java.lang.String, java.lang.String, java.lang.Object[])
	 */
	public int update(final String classifying, final String clause,
			final String where, final Object[] params)
			throws DataAccessException {
		return getHibernateTemplate().execute(new HibernateCallback<Integer>() {
			@Override
			public Integer doInHibernate(Session session)
					throws HibernateException, SQLException {
				Query query = session.createQuery("update " + classifying + " "
						+ clause + " where " + where);
				if (params != null && params.length > 0) {
					for (int i = 0; i < params.length; i++) {
						query.setParameter(i, params[i]);
					}
				}
				return query.executeUpdate();
			}
		});
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.bsoft.xds.support.dao.IDAO#delete(java.lang.String,
	 * java.lang.String, java.lang.String)
	 */
	public int delete(final String classifying, final String fieldName,
			final String value) throws DataAccessException {
		return getHibernateTemplate().execute(new HibernateCallback<Integer>() {
			@Override
			public Integer doInHibernate(Session session)
					throws HibernateException, SQLException {
				Query query = session.createQuery("delete from " + classifying
						+ " where " + fieldName + "=?");
				query.setString(0, value);
				return query.executeUpdate();
			}
		});
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.bsoft.xds.support.dao.IDAO#delete(java.lang.String,
	 * java.lang.String, java.lang.Object[])
	 */
	public int delete(final String classifying, final String where,
			final Object[] params) throws DataAccessException {
		return getHibernateTemplate().execute(new HibernateCallback<Integer>() {
			@Override
			public Integer doInHibernate(Session session)
					throws HibernateException, SQLException {
				Query query = session.createQuery("delete from " + classifying
						+ " where " + where);
				for (int i = 0; i < params.length; i++) {
					query.setParameter(i, params[i]);
				}
				return query.executeUpdate();
			}
		});
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.bsoft.xds.support.dao.IDAO#save(java.lang.String, java.util.Map)
	 */
	public void save(String classifying, Map<String, Object> data)
			throws DataAccessException {
		getHibernateTemplate().save(classifying, data);
	}

	/**
	 * 默认地当以select开头，将查询结果包装成Map。
	 * 
	 * @param hql
	 * @param query
	 */
	private void wrapQuery(String hql, Query query) {
		String hql0 = hql.trim();
		int inx = hql0.indexOf(' ');
		if (inx > 0) {
			String begin = hql0.substring(0, inx);
			if (begin.equalsIgnoreCase("select")) {
				query = query
						.setResultTransformer(Transformers.ALIAS_TO_ENTITY_MAP);
			}
		}
	}
	
	public List<Map<String, Object>> queryForListSQL(final String sql,
			final Object[] params) throws DataAccessException {
		return getHibernateTemplate().execute(
				new HibernateCallback<List<Map<String, Object>>>() {
					@SuppressWarnings("unchecked")
					@Override
					public List<Map<String, Object>> doInHibernate(
							Session session) throws HibernateException,
							SQLException {
						Query query = session.createSQLQuery(sql);
						wrapQuery(sql, query);
						if (params != null && params.length > 0) {
							for (int i = 0; i < params.length; i++) {
								query.setParameter(i, params[i]);
							}
						}
						return query.list();
					}
				});
	}
}
