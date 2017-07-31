/*
 * @(#)DBTemplate.java Created on 2012-9-2 ����4:15:00
 *
 * ��Ȩ����Ȩ���� B-Soft ��������Ȩ����
 */
package com.bsoft.ehr.dao;

import java.util.Collection;
import java.util.Map;

import org.hibernate.HibernateException;
import org.hibernate.Query;

/**
 * 
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
public class DBTemplate {

	/**
	 * @param query
	 * @param args
	 */
	static Query setParameters(Query query, Map<String, Object> args)
			throws HibernateException {
		if (args == null || args.size() == 0) {
			return query;
		}
		for (String key : args.keySet()) {
			Object value = args.get(key);
			if (value instanceof Collection) {
				query.setParameterList(key, (Collection<?>) value);
			} else {
				query.setParameter(key, value);
			}
		}
		return query;
	}

	static Query setParameters(Query query, Object[] args)
			throws HibernateException {
		if (args == null || args.length == 0) {
			return query;
		}
		for (int i = 0; i < args.length; i++) {
			query.setParameter(i, args[i]);
		}
		return query;
	}
}
