package com.bsoft.xds.support.instance.pt;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.StringUtils;

import com.bsoft.xds.exception.DocumentEntryException;
import com.bsoft.xds.support.instance.CommonDocumentEntryRetrieveService;


/**
 * 检查
 *
 */
public class PtCheckReportDocumentEntryRetrieveService extends
		CommonDocumentEntryRetrieveService implements
		ICheckReportDocumentEntryRetrieveService {

	/**
	 * @param mpiId
	 * @param start
	 * @param limit
	 * @return
	 * @throws DocumentEntryException
	 */
	@Override
	public List<Map<String, Object>> getDocList(String mpiId, int start,
			int limit) throws DocumentEntryException {
		return findPersonalRecords(mpiId, start, limit);
	}
	
	public List<Map<String, Object>> queryCheckReport(String mpiId,Map<String, String> args) throws Exception {
		try {
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
			String checkItmNm = args.get("checkItmNm");
			String checkReportDate = args.get("checkReportDate");
			String medicalInstitutions = args.get("medicalInstitutions");
			StringBuffer hql = new StringBuffer();
			Map<String, Object> queryArgs = new HashMap<String, Object>();
			hql.append(" MPIID=:mpiId ");
			queryArgs.put("mpiId", mpiId);
			if(StringUtils.isNotEmpty(checkItmNm)){
				hql.append(" and CheckItmNm like :checkItmNm ");
				queryArgs.put("checkItmNm", "%"+checkItmNm+"%");
			}
			if(StringUtils.isNotEmpty(checkReportDate)){
				hql.append(" and CheckReportDate>= :checkReportDate  and CheckReportDate< :time");
				queryArgs.put("checkReportDate", sdf.parse(checkReportDate));
				Calendar c = Calendar.getInstance();  
		        c.setTime(sdf.parse(checkReportDate));
		        c.add(Calendar.DATE, 1);
		        queryArgs.put("time",  c.getTime());
			}
			if(StringUtils.isNotEmpty(medicalInstitutions)){
				hql.append(" and MedicalInstitutions like :medicalInstitutions ");
				queryArgs.put("medicalInstitutions", "%"+medicalInstitutions+"%");
			}
			hql.append(" order by EffectiveTime desc ");
			return getDao().queryForList(recordClassifying, hql.toString(), queryArgs);
		} catch (Exception e) {
			throw new Exception(e);
		}
	}
}
