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
 * 输血
 *
 */
public class PtTransfusionDocumentEntryRetrieveService extends
		CommonDocumentEntryRetrieveService {

	/**
	 * @param mpiId
	 * @param start
	 * @param limit
	 * @return
	 */
	public List<Map<String, Object>> getTransfusions(String mpiId, int start,
			int limit) throws ServiceException {
		String hql = "from " + getRecordClassifying()
				+ " where MPIID=? and EffectiveFlag=? order by SXSJ desc";//BloodTransfusionDateTime
		try {
			return getDao().queryForPage(hql, start, limit,
					new Object[] { mpiId , "0"});
		} catch (HibernateException e) {
			throw new ServiceException(e);
		}
	}
	
	public List<Map<String, Object>> queryTransfusions(String mpiId,Map<String, String> args) throws ServiceException {
		try {
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
			String aBOBloodCode_Text = args.get("aBOBloodCode_Text");
			String bloodTransfusionDateTime = args.get("bloodTransfusionDateTime");
			String authorOrganizationName = args.get("authorOrganizationName");
			StringBuffer hql = new StringBuffer();
			Map<String, Object> queryArgs = new HashMap<String, Object>();
			hql.append(" MPIID=:mpiId ");
			queryArgs.put("mpiId", mpiId);
			if(StringUtils.isNotEmpty(aBOBloodCode_Text)){
				hql.append(" and ABOBloodCode_Text like :aBOBloodCode_Text ");
				queryArgs.put("aBOBloodCode_Text", "%"+aBOBloodCode_Text+"%");
			}
			if(StringUtils.isNotEmpty(bloodTransfusionDateTime)){
				hql.append(" and BloodTransfusionDateTime>= :bloodTransfusionDateTime  and BloodTransfusionDateTime< :time");
				queryArgs.put("bloodTransfusionDateTime", sdf.parse(bloodTransfusionDateTime));
				Calendar c = Calendar.getInstance();  
		        c.setTime(sdf.parse(bloodTransfusionDateTime));
		        c.add(Calendar.DATE, 1);
		        queryArgs.put("time",  c.getTime());
			}
			if(StringUtils.isNotEmpty(authorOrganizationName)){
				hql.append(" and AuthorOrganizationName like :authorOrganizationName ");
				queryArgs.put("authorOrganizationName", "%"+authorOrganizationName+"%");
			}
			hql.append(" order by BloodTransfusionDateTime desc ");
			return getDao().queryForList(recordClassifying, hql.toString(), queryArgs);
		} catch (Exception e) {
			throw new ServiceException(e);
		}
	}
	
}
