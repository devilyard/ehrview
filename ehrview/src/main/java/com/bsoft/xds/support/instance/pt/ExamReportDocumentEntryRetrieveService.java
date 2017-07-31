package com.bsoft.xds.support.instance.pt;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.StringUtils;

import com.bsoft.xds.support.instance.CommonDocumentEntryRetrieveService;

import ctd.service.core.ServiceException;

/**
 * 检验。
 *
 */
public class ExamReportDocumentEntryRetrieveService extends
		CommonDocumentEntryRetrieveService {

	public List<Map<String, Object>> queryExamReportRecords(String mpiId,Map<String, String> args) throws ServiceException {
		try {
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
			String typeName = args.get("typeName");
			String effectiveTime = args.get("effectiveTime");
			String authorOrganizationName = args.get("authorOrganizationName");
			StringBuffer hql = new StringBuffer();
			Map<String, Object> queryArgs = new HashMap<String, Object>();
			hql.append(" MPIID=:mpiId ");
			queryArgs.put("mpiId", mpiId);
			if(StringUtils.isNotEmpty(typeName)){
				hql.append(" and TypeName like :typeName ");
				queryArgs.put("typeName", "%"+typeName+"%");
			}
			if(StringUtils.isNotEmpty(effectiveTime)){
				hql.append(" and EffectiveTime>= :effectiveTime  and EffectiveTime< :time");
				queryArgs.put("effectiveTime", sdf.parse(effectiveTime));
				Calendar c = Calendar.getInstance();  
		        c.setTime(sdf.parse(effectiveTime));
		        c.add(Calendar.DATE, 1);
		        queryArgs.put("time",  c.getTime());
			}
			if(StringUtils.isNotEmpty(authorOrganizationName)){
				hql.append(" and AuthorOrganizationName like :authorOrganizationName ");
				queryArgs.put("authorOrganizationName", "%"+authorOrganizationName+"%");
			}
			hql.append(" order by EffectiveTime desc ");
			return getDao().queryForList(recordClassifying, hql.toString(), queryArgs);
		} catch (Exception e) {
			throw new ServiceException(e);
		}
	}
	
	
}
