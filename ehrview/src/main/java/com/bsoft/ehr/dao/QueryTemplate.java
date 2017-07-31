/*
 * @(#)QueryTemplate.java Created on 2012-8-25 ����4:32:08
 *
 * ��Ȩ����Ȩ���� B-Soft ��������Ȩ����
 */
package com.bsoft.ehr.dao;

import java.util.List;
import java.util.Map;

import org.hibernate.HibernateException;
import org.hibernate.Query;
import org.hibernate.Session;
import org.hibernate.transform.Transformers;

import com.bsoft.ehr.util.HibernateSessionFactory;


/**
 * 
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
public class QueryTemplate extends DBTemplate {

	/**
	 * @param sql
	 * @param args
	 */
	@SuppressWarnings("unchecked")
	public static Map<String, Object> queryForMap(String sql, Object... args)
			throws HibernateException {
		Session session = null;
		try {
			session = HibernateSessionFactory.getSession();
			Query query = session.createQuery(sql).setResultTransformer(
					Transformers.ALIAS_TO_ENTITY_MAP);
			setParameters(query, args);
			return (Map<String, Object>) query.uniqueResult();
		} finally {
			if (session != null && session.isOpen()) {
				session.close();
			}
		}
	}

	@SuppressWarnings("unchecked")
	public static Map<String, Object> queryForMap(String sql,
			Map<String, Object> args) throws HibernateException {
		Session session = null;
		try {
			session = HibernateSessionFactory.getSession();
			Query query = session.createQuery(sql).setResultTransformer(
					Transformers.ALIAS_TO_ENTITY_MAP);
			setParameters(query, args);
			return (Map<String, Object>) query.uniqueResult();
		} finally {
			if (session != null && session.isOpen()) {
				session.close();
			}
		}
	}

	/**
	 * @param sql
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public static List<Map<String, Object>> queryForListMap(String sql,
			Map<String, Object> args) throws HibernateException {
		Session session = null;
		try {
			session = HibernateSessionFactory.getSession();
			Query query = session.createQuery(sql).setResultTransformer(
					Transformers.ALIAS_TO_ENTITY_MAP);
			return (List<Map<String, Object>>) setParameters(query, args)
					.list();
		} finally {
			if (session != null && session.isOpen()) {
				session.close();
			}
		}
	}
	
	/**
	 * @param sql
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public static List<Map<String, Object>> querySQLForListMap(String sql,
			Map<String, Object> args) throws HibernateException {
		Session session = null;
		try {
			session = HibernateSessionFactory.getSession();
			Query query = session.createSQLQuery(sql).setResultTransformer(
					Transformers.ALIAS_TO_ENTITY_MAP);
			return (List<Map<String, Object>>) setParameters(query, args)
					.list();
		} finally {
			if (session != null && session.isOpen()) {
				session.close();
			}
		}
	}

	/**
	 * @param sql
	 * @param args
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public static List<Map<String, Object>> queryForListMap(String sql,
			Object... args) throws HibernateException {
		Session session = null;
		try {
			session = HibernateSessionFactory.getSession();
			Query query = session.createQuery(sql).setResultTransformer(
					Transformers.ALIAS_TO_ENTITY_MAP);
			return (List<Map<String, Object>>) setParameters(query, args)
					.list();
		} finally {
			if (session != null && session.isOpen()) {
				session.close();
			}
		}
	}
	//start: policy add//
	@SuppressWarnings("unchecked")
	public static List<Map<String, Object>> querySqlForPagedList(String sql,
			int pageNo, int pageSize, Object... args) throws HibernateException {
		Session session = null;
		try {
			session = HibernateSessionFactory.getSession();
			Query query = session.createSQLQuery(sql).setResultTransformer(
					Transformers.ALIAS_TO_ENTITY_MAP);
			query.setFirstResult((pageNo - 1) * pageSize);
			query.setMaxResults(pageSize);
			return (List<Map<String, Object>>) setParameters(query, args)
					.list();
		} finally {
			if (session != null && session.isOpen()) {
				session.close();
			}
		}
	}
	//end: policy add//
	@SuppressWarnings("unchecked")
	public static List<Map<String, Object>> queryForPagedList(String sql,
			int pageNo, int pageSize, Object... args) throws HibernateException {
		Session session = null;
		try {
			session = HibernateSessionFactory.getSession();
			Query query = session.createQuery(sql).setResultTransformer(
					Transformers.ALIAS_TO_ENTITY_MAP);
			query.setFirstResult((pageNo - 1) * pageSize);
			query.setMaxResults(pageSize);
			return (List<Map<String, Object>>) setParameters(query, args)
					.list();
		} finally {
			if (session != null && session.isOpen()) {
				session.close();
			}
		}
	}

	/**
	 * @param sql
	 * @param args
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public static List<Object> queryForList(String sql, Map<String, Object> args)
			throws HibernateException {
		Session session = null;
		try {
			session = HibernateSessionFactory.getSession();
			Query query = session.createQuery(sql);
			setParameters(query, args);
			return (List<Object>) query.list();
		} finally {
			if (session != null && session.isOpen()) {
				session.close();
			}
		}
	}

	@SuppressWarnings("unchecked")
	public static List<Object> queryForList(String sql, Object... args)
			throws HibernateException {
		Session session = null;
		try {
			session = HibernateSessionFactory.getSession();
			Query query = session.createQuery(sql);
			setParameters(query, args);
			return (List<Object>) query.list();
		} finally {
			if (session != null && session.isOpen()) {
				session.close();
			}
		}
	}
}
