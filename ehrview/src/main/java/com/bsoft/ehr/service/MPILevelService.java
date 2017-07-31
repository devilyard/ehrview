/*
 * @(#)MPILevelService.java Created on 2014年3月5日 上午9:56:49
 * 
 * 版权：版权所有 Bsoft 保留所有权力。
 */
package com.bsoft.ehr.service;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

/**
 * 
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
@Service
public class MPILevelService extends AbstractHibernateDAOSupoortServcie {

	/**
	 * @param mpiId
	 * @return
	 */
	public boolean isPrivacy(String mpiId) {
		String hql = "from SYS_MPILevel where mpiId=:mpiId";
		@SuppressWarnings("unchecked")
		List<Map<String, Object>> list = getHibernateTemplate()
				.findByNamedParam(hql, "mpiId", mpiId);
		if (list == null || list.isEmpty()) {
			return false;
		}
		Map<String, Object> map = list.get(0);
		String mpiLevel = (String) map.get("mpiLevel");
		if ("1".equals(mpiLevel)) {
			return true;
		}
		return false;
	}
}
