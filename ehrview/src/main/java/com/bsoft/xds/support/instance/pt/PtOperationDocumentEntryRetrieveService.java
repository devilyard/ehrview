package com.bsoft.xds.support.instance.pt;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.StringUtils;
import org.hibernate.HibernateException;

import com.bsoft.xds.support.instance.CommonDocumentEntryRetrieveService;

import ctd.service.core.ServiceException;

/**
 * 手术
 * 
 */
public class PtOperationDocumentEntryRetrieveService extends
		CommonDocumentEntryRetrieveService {

	/**
	 * @param mpiId
	 * @param start
	 * @param limit
	 * @return
	 */
	public List<Map<String, Object>> getOperationRecords(String mpiId,
			int start, int limit) throws ServiceException {
		String hql = "from " + getRecordClassifying()
				+ " where MPIID=? and EffectiveFlag=? order by SSJSSJ desc";//OperationDateTime
		try {
			return getDao().queryForPage(hql, start, limit,
					new Object[] { mpiId , "0"});
		} catch (HibernateException e) {
			throw new ServiceException(e);
		}
	}
	
	
	public List<Map<String, Object>> queryOperationRecords(String mpiId,Map<String, String> args) throws ServiceException {
		try {
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
			String operationName = args.get("operationName");
			String operationStartDateTime = args.get("operationStartDateTime");
			String operationPartName = args.get("operationPartName");
			String authorOrganizationName = args.get("authorOrganizationName");
			StringBuffer hql = new StringBuffer();
			Map<String, Object> queryArgs = new HashMap<String, Object>();
			hql.append(" MPIID=:mpiId ");
			queryArgs.put("mpiId", mpiId);
			if(StringUtils.isNotEmpty(operationName)){
				hql.append(" and OperationName like :operationName ");
				queryArgs.put("operationName", "%"+operationName+"%");
			}
			if(StringUtils.isNotEmpty(operationStartDateTime)){
				hql.append(" and OperationStartDateTime>= :operationStartDateTime  and OperationStartDateTime< :time");
				queryArgs.put("operationStartDateTime", sdf.parse(operationStartDateTime));
				Calendar c = Calendar.getInstance();  
		        c.setTime(sdf.parse(operationStartDateTime));
		        c.add(Calendar.DATE, 1);
		        queryArgs.put("time",  c.getTime());
			}
			if(StringUtils.isNotEmpty(operationPartName)){
				hql.append(" and OperationPartName like :operationPartName ");
				queryArgs.put("operationPartName", "%"+operationPartName+"%");
			}
			if(StringUtils.isNotEmpty(authorOrganizationName)){
				hql.append(" and AuthorOrganizationName like :authorOrganizationName ");
				queryArgs.put("authorOrganizationName", "%"+authorOrganizationName+"%");
			}
			hql.append(" order by OperationDateTime desc ");
			return getDao().queryForList(recordClassifying, hql.toString(), queryArgs);
		} catch (Exception e) {
			throw new ServiceException(e);
		}
	}
}
