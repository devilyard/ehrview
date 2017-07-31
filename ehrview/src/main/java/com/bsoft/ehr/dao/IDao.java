package com.bsoft.ehr.dao;

import java.io.Serializable;
import java.util.List;
import java.util.Map;

import org.hibernate.HibernateException;

public interface IDao {

	Map<String, Object> findById(String entryName, boolean hasDoc,
			String idName, Serializable id) throws HibernateException;

	public Map<String, Object> findOne(String entryName, boolean hasDOc,
			String where, Object... args) throws HibernateException;

	List<Map<String, Object>> find(String entryName, boolean hasDOc,
			String where, Object... args) throws HibernateException;

	List<Map<String, Object>> findOrder(String entryName, boolean hasDoc,
			String where, String orderField, boolean isDesc, Object... args)
			throws HibernateException;

	List<Map<String, Object>> findPage(String entryName, boolean hasDoc,
			String where, int pageNo, int pageSize, Object... args)
			throws HibernateException;

	List<Map<String, Object>> findPageOrder(String entryName, boolean hasDoc,
			String where, int pageNo, int pageSize, String orderField,
			boolean isDesc, Object... args) throws HibernateException;

	List<Object> findField(String entryName, String field, String where,
			Object... args) throws HibernateException;

	List<Object> findFieldOrder(String entryName, String field, String where,
			String orderField, boolean isDesc, Object... args)
			throws HibernateException;

	List<Map<String, Object>> findFields(String entryName, List<String> fields,
			String where, Object... args) throws HibernateException;

	public void update(String hql, Object... args) throws HibernateException;

	public void update(String entryName, String where, Map<String, Object> data)
			throws HibernateException;

	public void save(String entryName, Map<String, Object> data)
			throws HibernateException;
}
