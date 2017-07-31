/*
 * @(#)PublicHealthInfoService.java Created on 2013年12月5日 下午3:58:58
 * 
 * 版权：版权所有 Bsoft 保留所有权力。
 */
package com.bsoft.ehr.service;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.StringUtils;
import org.dom4j.DocumentException;
import org.hibernate.HibernateException;
import org.hibernate.Query;
import org.hibernate.Session;
import org.hibernate.transform.Transformers;
import org.springframework.dao.DataAccessException;
import org.springframework.orm.hibernate3.HibernateCallback;
import org.springframework.stereotype.Service;

import com.bsoft.ehr.dictionary.instance.Population;
import com.bsoft.ehr.util.DateUtils;
import com.bsoft.ehr.util.MPIProxy;
import com.bsoft.mpi.server.MPIServiceException;

import ctd.service.core.ServiceException;

/**
 * 公共卫生档案信息（有建立哪些档案）。
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
@Service
public class PublicHealthInfoService extends AbstractHibernateDAOSupoortServcie {

	/**
	 * 查询一个人有哪些公卫档案。
	 * 
	 * @param mpiId
	 * @return
	 */
	public List<Map<String, Object>> getHealthRecordInfo(final String mpiId)
			throws ServiceException {
		final String hql = "from EHR_PublicHealthInfo where MPIID=:mpiId";
		try {
			return getHibernateTemplate().execute(
					new HibernateCallback<List<Map<String, Object>>>() {
						@SuppressWarnings("unchecked")
						@Override
						public List<Map<String, Object>> doInHibernate(
								Session session) throws HibernateException,
								SQLException {
							Query query = session.createQuery(hql);
							query.setString("mpiId", mpiId);
							return query.list();
						}
					});
		} catch (DataAccessException e) {
			throw new ServiceException(e);
		}
	}

	/**
	 * 获取一个人的人群归类，目前人群定义分为：高血压人群，糖尿病人群，精神病，孕妇人群，老年人群以及儿童人群。
	 * 
	 * @param mpiId
	 * @return
	 * @throws HibernateException
	 * @throws MPIServiceException
	 * @throws DocumentException
	 */
	@SuppressWarnings("unchecked")
	public List<String> getPopulations(final String mpiId)
			throws ServiceException {
		Map<String, Object> mpi;
		try {
			mpi = MPIProxy.getBaseMPI(mpiId);
		} catch (MPIServiceException e) {
			throw new ServiceException(e);
		}
		if (mpi == null || mpi.size() == 0) {
			return null;
		}
		Date birthDate = (Date) mpi.get("birthday");
		List<String> list = new ArrayList<String>(5);
		if (birthDate != null) {
			int age = DateUtils.getAnniversary(birthDate, new Date());
			if (age <= 14) {
				list.add(Population.CHILD);
			}
			if (age >= 60) {
				list.add(Population.OLD_PEOPLE);
			}
		}
		List<Map<String, Object>> prs;
		try {
			prs = getHibernateTemplate().executeFind(
					new HibernateCallback<List<Map<String, Object>>>() {
						@Override
						public List<Map<String, Object>> doInHibernate(
								Session session) throws HibernateException,
								SQLException {
							String hql = "select DateOfPrenatal as dateOfPrenatal from MHC_PregnantRecord where MPIID=:mpiId";
							Query query = session.createQuery(hql);
							query.setResultTransformer(Transformers.ALIAS_TO_ENTITY_MAP);
							query.setString("mpiId", mpiId);
							return query.list();
						}
					});
		} catch (DataAccessException e) {
			throw new ServiceException(e);
		}
		if (prs != null && prs.isEmpty() == false) {
//			for (Map<String, Object> m : prs) {
//				String status = (String) m.get("status");
//				Date lastMenstrualPeriod = (Date) m.get("lastMenstrualPeriod");
//				if (StringUtils.isEmpty(status) && lastMenstrualPeriod == null) {
//					continue;
//				}
//				int period = DateUtils.getPeriod(lastMenstrualPeriod,
//						new Date());
//				if ("0".equals(status) && period <= 300) {
//					list.add(Population.PREGNANT);
//					break;
//				}
//			}
			list.add(Population.PREGNANT);
		}
		List<Map<String, Object>> docs = getHealthRecordInfo(mpiId);
		if (docs != null && docs.isEmpty() == false) {
			for (Map<String, Object> doc : docs) {
				if (doc.get("SRCEntryName").equals("MDC_Diabetes")) {
					if (!list.contains(Population.DIABETES)) {
						list.add(Population.DIABETES);
					}
				} else if (doc.get("SRCEntryName").equals("MDC_Hypertension")) {
					if (!list.contains(Population.HYPERTENSION)) {
						list.add(Population.HYPERTENSION);
					}
				} else if (doc.get("SRCEntryName").equals("PSY_Psychosis")) {
					if (!list.contains(Population.PSYCHOSIS)) {
						list.add(Population.PSYCHOSIS);
					}
				}
			}
		}
		return list;
	}
	
	/**
	 * @return
	 */
	public Map<String, Object> getAllPopulations() {
		Map<String, Object> pops = new HashMap<String, Object>();
		pops.put("儿童", Population.CHILD);
		pops.put("糖尿病", Population.DIABETES);
		pops.put("高血压", Population.HYPERTENSION);
		pops.put("老年人", Population.OLD_PEOPLE);
		pops.put("孕妇", Population.PREGNANT);
		pops.put("精神病", Population.PSYCHOSIS);
		return pops;
	}
}
