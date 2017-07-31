/*
 * @(#)GetLayoutService.java Created on 2013年11月11日 下午2:03:31
 * 
 * 版权：版权所有 Bsoft 保留所有权力。
 */
package com.bsoft.ehr.service;

import java.sql.SQLException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.hibernate.HibernateException;
import org.hibernate.Query;
import org.hibernate.transform.Transformers;
import org.springframework.dao.DataAccessException;
import org.springframework.orm.hibernate3.HibernateCallback;
import org.springframework.stereotype.Service;

import ctd.service.core.ServiceException;
import ctd.util.JSONUtils;

/**
 * 
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
@Service
public class LayoutService extends AbstractHibernateDAOSupoortServcie {

	/**
	 * @param data
	 * @throws HibernateException
	 */
	public void saveLayout(Map<String, Object> data) throws ServiceException {
		String layoutId = (String) data.get("layoutId");
		@SuppressWarnings("unchecked")
		Map<String, Object> ld = (Map<String, Object>) data.get("layoutData");
		String layoutData = JSONUtils.writeValueAsString(ld);
		Map<String, Object> layout = new HashMap<String, Object>();
		layout.put("LayoutId", layoutId);
		layout.put("LayoutData", layoutData);
		try {
			getHibernateTemplate().saveOrUpdate("SYS_LayoutData", layout);
		} catch (DataAccessException e) {
			throw new ServiceException(e);
		}
	}

	/**
	 * @param layoutId
	 * @return
	 * @throws DataAccessException
	 */
	public String getLayoutData(final String layoutId) throws ServiceException {
		try {
			return getHibernateTemplate().execute(
					new HibernateCallback<String>() {
						@Override
						public String doInHibernate(
								org.hibernate.Session session)
								throws HibernateException, SQLException {
							Query query = session
									.createQuery("select LayoutData from SYS_LayoutData where RecordID=:layoutId");
							query.setString("layoutId", layoutId);
							return (String) query.uniqueResult();
						}
					});
		} catch (DataAccessException e) {
			throw new ServiceException(e);
		}
	}

	public List<Map<String, Object>> getLayoutNames(final List<Integer> layoutId)
			throws ServiceException {
		try {
			return getHibernateTemplate().execute(
					new HibernateCallback<List<Map<String, Object>>>() {
						@SuppressWarnings("unchecked")
						@Override
						public List<Map<String, Object>> doInHibernate(
								org.hibernate.Session session)
								throws HibernateException, SQLException {
							Query query = session
									.createQuery("select RecordID as layoutId, LayoutText as name, TemplateID as templateId from SYS_LayoutData where RecordID in(:layoutId)");
							query = query
									.setResultTransformer(Transformers.ALIAS_TO_ENTITY_MAP);
							query.setParameterList("layoutId", layoutId);
							return (List<Map<String, Object>>) query.list();
						}
					});
		} catch (DataAccessException e) {
			throw new ServiceException(e);
		}
	}

	/**
	 * @param roleId
	 * @return
	 */
	public List<Map<String, Object>> getViewRules() throws ServiceException {
		try {
			return getHibernateTemplate().execute(
					new HibernateCallback<List<Map<String, Object>>>() {
						@SuppressWarnings("unchecked")
						@Override
						public List<Map<String, Object>> doInHibernate(
								org.hibernate.Session session)
								throws HibernateException, SQLException {
							Query query = session
									.createQuery("from SYS_ViewPortalRule");
							return (List<Map<String, Object>>) query.list();
						}
					});
		} catch (DataAccessException e) {
			throw new ServiceException(e);
		}
	}
}
