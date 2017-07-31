package com.bsoft.ehr.service;

import java.io.Serializable;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.hibernate.HibernateException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.bsoft.ehr.dao.IDao;

import ctd.config.schema.Schema;
import ctd.config.schema.SchemaController;

@Service
public class BaseService implements IService {

//	@Autowired
	private IDao baseDao;

	public IDao getBaseDao() {
		return baseDao;
	}

	public void setBaseDao(IDao baseDao) {
		this.baseDao = baseDao;
	}

	@Override
	public Map<String, Object> findById(String entryName, String idName,
			Serializable id) {
		Schema sc = SchemaController.instance().getSchema(entryName);
		boolean hasDoc = false;
		if (sc != null) {
			hasDoc = Boolean.parseBoolean((String) sc.getProperty("hasDoc"));
		}
		return baseDao.findById(entryName, hasDoc, idName, id);
	}

	@Override
	public Map<String, Object> findOne(String entryName, String where,
			Object... args) throws HibernateException {
		Schema sc = SchemaController.instance().getSchema(entryName);
		boolean hasDoc = false;
		if (sc != null) {
			hasDoc = Boolean.parseBoolean((String) sc.getProperty("hasDoc"));
		}
		return baseDao.findOne(entryName, hasDoc, where, args);
	}

	@Override
	public List<Map<String, Object>> find(String entryName, String where,
			Object... args) throws HibernateException {
		Schema sc = SchemaController.instance().getSchema(entryName);
		boolean hasDoc = false;
		if (sc != null) {
			hasDoc = Boolean.parseBoolean((String) sc.getProperty("hasDoc"));
		}
		return baseDao.find(entryName, hasDoc, where, args);
	}

	@Override
	public List<Object> find(String entryName, String field, String where,
			Object... args) throws HibernateException {
		return baseDao.findField(entryName, field, where, args);
	}

	@Override
	public List<Map<String, Object>> find(String entryName,
			List<String> fields, String where, Object... args)
			throws HibernateException {
		return baseDao.findFields(entryName, fields, where, args);
	}

	@Override
	public List<Map<String, Object>> find(String entryName, String where,
			int pageNo, int pageSize, Object... args) throws HibernateException {
		Schema sc = SchemaController.instance().getSchema(entryName);
		boolean hasDoc = false;
		if (sc != null) {
			hasDoc = Boolean.parseBoolean((String) sc.getProperty("hasDoc"));
		}
		return baseDao.findPage(entryName, hasDoc, where, pageNo, pageSize, args);
	}

	@Override
	public List<Map<String, Object>> find(String entryName, String where,
			String orderField, boolean isDesc, Object... args)
			throws HibernateException {
		Schema sc = SchemaController.instance().getSchema(entryName);
		boolean hasDoc = false;
		if (sc != null) {
			hasDoc = Boolean.parseBoolean((String) sc.getProperty("hasDoc"));
		}
		return baseDao.findOrder(entryName, hasDoc, where, orderField, isDesc, args);
	}

	@Override
	public List<Map<String, Object>> find(String entryName, String where,
			int pageNo, int pageSize, String orderField, boolean isDesc,
			Object... args) throws HibernateException {
		Schema sc = SchemaController.instance().getSchema(entryName);
		boolean hasDoc = false;
		if (sc != null) {
			hasDoc = Boolean.parseBoolean((String) sc.getProperty("hasDoc"));
		}
		return baseDao.findPageOrder(entryName, hasDoc, where, pageNo, pageSize,
				orderField, isDesc, args);
	}
	//start: policy add//
	@Override
	public List<Map<String, Object>> find(String entryName, String where,
			int pageNo, int pageSize, String orderField, boolean isDesc,
			 HttpServletRequest request,
			HttpServletResponse response) throws HibernateException {
		Schema sc = SchemaController.instance().getSchema(entryName);
		boolean hasDoc = false;
		if (sc != null) {
			hasDoc = Boolean.parseBoolean((String) sc.getProperty("hasDoc"));
		}
		return baseDao.findPageOrder(entryName, hasDoc, where, pageNo, pageSize,
				orderField, isDesc,  request,
				 response);
	}
	//end: policy add//
	
	@Override
	public List<Object> find(String entryName, String field, String where,
			String orderField, boolean isDesc, Object... args)
			throws HibernateException {
		return baseDao.findFieldOrder(entryName, field, where, orderField, isDesc,
				args);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see dc.service.IService#update(java.lang.String, java.lang.Object[])
	 */
	@Override
	public void update(String hql, Object... args) throws HibernateException {
		baseDao.update(hql, args);
	}

	/**
	 * @param entryName
	 * @param where
	 * @param data
	 * @throws HibernateException
	 */
	public void update(String entryName, String where, Map<String, Object> data)
			throws HibernateException {
		baseDao.update(entryName, where, data);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see dc.service.IService#save(java.lang.String, java.util.Map)
	 */
	public void save(String entryName, Map<String, Object> data)
			throws HibernateException {
		baseDao.save(entryName, data);
	}
}
