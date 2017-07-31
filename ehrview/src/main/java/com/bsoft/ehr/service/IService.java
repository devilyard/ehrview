package com.bsoft.ehr.service;

import java.io.Serializable;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.hibernate.HibernateException;

public interface IService {

	public Map<String, Object> findById(String entryName, String idName,
			Serializable id) throws HibernateException;

	public Map<String, Object> findOne(String entryName, String where,
			Object... args) throws HibernateException;

	List<Map<String, Object>> find(String entryName, String where,
			Object... args) throws HibernateException;

	List<Map<String, Object>> find(String entryName, String where,
			String orderField, boolean isDesc, Object... args)
			throws HibernateException;

	List<Map<String, Object>> find(String entryName, String where, int pageNo,
			int pageSize, Object... args) throws HibernateException;

	List<Map<String, Object>> find(String entryName, String where, int pageNo,
			int pageSize, String orderField, boolean isDesc, Object... args)
			throws HibernateException;

	List<Object> find(String entryName, String field, String where,
			Object... args) throws HibernateException;

	List<Object> find(String entryName, String field, String where,
			String orderField, boolean isDesc, Object... args)
			throws HibernateException;
	//start: policy add//
	List<Map<String, Object>> find(String entryName, String where, int pageNo,
			int pageSize, String orderField, boolean isDesc, HttpServletRequest request,
			HttpServletResponse response)
			throws HibernateException;
	//end: policy add//
	List<Map<String, Object>> find(String entryName, List<String> fields,
			String where, Object... args) throws HibernateException;

	public void update(String hql, Object... args) throws HibernateException;

	public void update(String entryName, String where, Map<String, Object> data)
			throws HibernateException;

	public void save(String entryName, Map<String, Object> data)
			throws HibernateException;
}
