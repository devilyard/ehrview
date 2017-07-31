package com.bsoft.ehr.service.ssdev;

import java.util.List;
import java.util.Map;

import org.hibernate.Query;
import org.hibernate.Session;
import org.hibernate.transform.Transformers;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.bsoft.ehr.util.UserUtil;

import ctd.service.core.ServiceException;
import ctd.service.dao.DBService;
import ctd.util.context.Context;

public class BrowsingHistoryListService extends DBService {

	private static final Logger logger = LoggerFactory
			.getLogger(BrowsingHistoryListService.class);
	private static final int DEFAULT_PAGESIZE = 25;
	private static final int DEFAULT_PAGENO = 1;

	/*
	 * (non-Javadoc)
	 * 
	 * @see ctd.service.core.Service#execute(java.util.Map, java.util.Map,
	 * ctd.util.context.Context)
	 */
	@Override
	public void execute(Map<String, Object> req, Map<String, Object> res,
			Context ctx) throws ServiceException {
		Session session = (Session) ctx.get(Context.DB_SESSION);
		if (session == null) {
			throw new ServiceException("Cannot get DB session.");
		}
		int pageSize = DEFAULT_PAGESIZE;
		if (req.containsKey("pageSize")) {
			pageSize = (Integer) req.get("pageSize");
		}
		int pageNo = DEFAULT_PAGENO;
		if (req.containsKey("pageNo")) {
			pageNo = (Integer) req.get("pageNo");
		}
		int first = (pageNo - 1) * pageSize;
		StringBuilder countHql = new StringBuilder();
		countHql.append("select count(*) from SYS_BrowsingHist a where  a.userId=:userId and a.systemTime=");
		countHql.append("(select max(systemTime) from SYS_BrowsingHist b where a.mpiId=b.mpiId)");
		Query countQuery = session.createQuery(countHql.toString());
		countQuery.setString("userId", UserUtil.getUserId());
		Long count = (Long) countQuery.uniqueResult();
		if (first > count) {
			logger.warn("No more browsing history.");
			return;
		}

		StringBuilder hql = new StringBuilder();
		hql.append("select a.BHID as BHID,a.userId as userId,a.mpiId as mpiId,a.systemTime as systemTime,");
		hql.append("a.roleList as roleList,a.personName as personName,a.sexCode_text as sexCode_text,");
		hql.append("a.birthday as birthday,a.idCard as idCard,a.cardNo as cardNo, ");
		hql.append("organizationcode as organizationcode,docid as docid,docidcard as docidcard,docname as docname,datasource as datasource ");
		hql.append("from SYS_BrowsingHist a where a.userId=:userId and a.systemTime=");
		hql.append("(select max(systemTime) from SYS_BrowsingHist b where a.mpiId=b.mpiId) order by a.systemTime desc");
		Query query = session.createQuery(hql.toString()).setResultTransformer(
				Transformers.ALIAS_TO_ENTITY_MAP);
		query.setFirstResult(first);
		query.setMaxResults(pageSize);
		query.setString("userId", UserUtil.getUserId());
		@SuppressWarnings("unchecked")
		List<Map<String, Object>> list = query.list();

		res.put("totalCount", count);
		res.put("body", list);
	}
}
