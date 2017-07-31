/*
 * @(#)SetMPILevelService.java Created on 2014年2月27日 上午10:58:57
 * 
 * 版权：版权所有 Bsoft 保留所有权力。
 */
package com.bsoft.ehr.service.ssdev;

import java.util.HashMap;
import java.util.Map;

import org.hibernate.HibernateException;
import org.hibernate.Query;
import org.hibernate.Session;

import ctd.service.core.ServiceException;
import ctd.service.dao.DBService;
import ctd.util.context.Context;

/**
 * 
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
public class SetMPILevelService extends DBService {

	public SetMPILevelService() {
		transactionSupport = true;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see ctd.service.core.Service#execute(java.util.Map, java.util.Map,
	 * ctd.util.context.Context)
	 */
	@Override
	public void execute(Map<String, Object> req, Map<String, Object> res,
			Context ctx) throws ServiceException {
		@SuppressWarnings("unchecked")
		Map<String, Object> reqBody = (Map<String, Object>) req.get(BODY);
		String mpiId = (String) reqBody.get("mpiId");
		Integer type = (Integer) reqBody.get("type");
		Session session = (Session) ctx.get(Context.DB_SESSION);
		try {
			if (type == 0) {
				Query query = session
						.createQuery("delete from SYS_MPILevel where mpiId=:mpiId");
				query.setString("mpiId", mpiId);
				query.executeUpdate();
			} else if (type == 1) {
				Map<String, Object> record = new HashMap<String, Object>();
				record.put("mpiLevel", "1");
				record.put("mpiId", mpiId);
				session.save("SYS_MPILevel", record);
			}
		} catch (HibernateException e) {
			throw new ServiceException(e);
		}
	}

}
