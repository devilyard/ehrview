package com.bsoft.xds.support.instance.opt;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.StringUtils;
import org.hibernate.HibernateException;
import org.springframework.dao.DataAccessException;

import com.bsoft.xds.support.instance.CommonDocumentEntryRetrieveService;

import ctd.service.core.ServiceException;

/**
 * 门诊记录
 * 
 */
public class OptRecordDocumentEntryRetrieveService extends
		CommonDocumentEntryRetrieveService {

	/**
	 * 获取门诊记录。
	 * 
	 * @param DCID
	 * @return
	 * @throws ServiceException
	 */
	public Map<String, Object> getOptRecord(String DCID)
			throws ServiceException {
		try {
			return getDao().queryForMap(recordClassifying, "DCID=? ",
					new Object[] { DCID });
		} catch (DataAccessException e) {
			throw new ServiceException(e);
		}
	}
	
	/**
	 * @param mpiId
	 * @param start
	 * @param limit
	 * @return
	 */
	public List<Map<String, Object>> getOptRecords(String mpiId, int start,
			int limit) throws ServiceException {
		String hql = "from " + getRecordClassifying()
				+ " where MPIID=? and EffectiveFlag ='0' order by JZRQ desc";
		try {
			return getDao().queryForPage(hql, start, limit,
					new Object[] { mpiId });
		} catch (HibernateException e) {
			throw new ServiceException(e);
		}
	}
	
	
	public List<Map<String, Object>> queryOptRecords(String mpiId,Map<String, String> args) throws ServiceException {
		try {
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
			String zdmc = args.get("zdmc");
			String jzrq = args.get("jzrq");
			String jzksmc = args.get("jzksmc");
			String jgdmtext = args.get("jgdmtext");
			StringBuffer hql = new StringBuffer();
			Map<String, Object> queryArgs = new HashMap<String, Object>();
			hql.append(" MPIID=:mpiId ");
			queryArgs.put("mpiId", mpiId);
			if(StringUtils.isNotEmpty(zdmc)){
				hql.append(" and ZDMC like :zdmc ");
				queryArgs.put("zdmc", "%"+zdmc+"%");
			}
			if(StringUtils.isNotEmpty(jzrq)){
				hql.append(" and JZRQ>= :jzrq and JZRQ< :time ");
				queryArgs.put("jzrq", sdf.parse(jzrq));
				Calendar c = Calendar.getInstance();  
		        c.setTime(sdf.parse(jzrq));
		        c.add(Calendar.DATE, 1);
		        queryArgs.put("time",  c.getTime());
			}
			if(StringUtils.isNotEmpty(jzksmc)){
				hql.append(" and JZKSMC like :jzksmc ");
				queryArgs.put("jzksmc", "%"+jzksmc+"%");
			}
			if(StringUtils.isNotEmpty(jgdmtext)){
				hql.append(" and JGDMTEXT like :jgdmtext ");
				queryArgs.put("jgdmtext", "%"+jgdmtext+"%");
			}
			hql.append(" order by JZRQ desc ");
			return getDao().queryForList(recordClassifying, hql.toString(), queryArgs);
		} catch (Exception e) {
			throw new ServiceException(e);
		}
	}
}
