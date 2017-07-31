/*
 * @(#)UpdateTemplate.java Created on 2012-9-2 ����4:08:43
 *
 * ��Ȩ����Ȩ���� B-Soft ��������Ȩ����
 */
package com.bsoft.ehr.dao;

import java.util.Map;

import org.hibernate.HibernateException;
import org.hibernate.Query;
import org.hibernate.Session;

import com.bsoft.ehr.util.HibernateSessionFactory;


/**
 * 
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
public class UpdateTemplate extends DBTemplate {

	/**
	 * @param sql
	 * @return
	 */
	public static void update(String sql, Map<String, Object> args)
			throws HibernateException {
		Session session = null;
		try {
			session = HibernateSessionFactory.getSession();
			Query query = session.createQuery(sql);
			setParameters(query, args);
			query.executeUpdate();
		} finally {
			if (session != null && session.isOpen()) {
				session.close();
			}
		}
	}

	/**
	 * @param sql
	 * @param args
	 */
	public static void update(String sql, Object... args)
			throws HibernateException {
		Session session = null;
		try {
			session = HibernateSessionFactory.getSession();
			Query query = session.createQuery(sql);
			setParameters(query, args);
			query.executeUpdate();
		} finally {
			if (session != null && session.isOpen()) {
				session.close();
			}
		}
	}

	/**
	 * @param entryName
	 * @param data
	 */
	public static void save(String entryName, Map<String, Object> data)
			throws HibernateException {
		Session session = null;
		try {
			session = HibernateSessionFactory.getSession();
			session.save(entryName, data);
		} finally {
			if (session != null && session.isOpen()) {
				session.flush();
				session.close();
			}
		}
	}
}
