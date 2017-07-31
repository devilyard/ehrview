package com.bsoft.xds.support.instance.ipt;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.StringUtils;
import org.hibernate.HibernateException;
import org.springframework.dao.DataAccessException;

import com.bsoft.xds.exception.DocumentEntryException;
import com.bsoft.xds.support.instance.CommonDocumentEntryRetrieveService;

import ctd.service.core.ServiceException;

/**
 * 病案首页
 * 
 */
public class InpatientRecordHomeDocumentEntryRetrieveService extends
		CommonDocumentEntryRetrieveService {

	/**
	 * @param mpiId
	 * @param start
	 * @param limit
	 * @return
	 */
	public List<Map<String, Object>> getInpatientRecords(String mpiId,
			int start, int limit) throws ServiceException {
		String hql = "from Ipt_Record where MPIID=? and EffectiveFlag=? order by RYSJ desc";//AdmissionDateTime
		try {
			return getDao().queryForPage(hql, start, limit,
					new Object[] { mpiId, "0" });
		} catch (HibernateException e) {
			throw new ServiceException(e);
		}
	}

	/**
	 * @param visitId
	 * @param authorOrganization
	 * @return
	 * @throws DocumentEntryException
	 */
	public Map<String, Object> getRecordByVisitId(String visitId,
			String authorOrganization) throws DocumentEntryException {
		try {
			return getDao().queryForMap(recordClassifying,
					"JZLSH=? and AuthorOrganization=? and EffectiveFlag=?",//VisitID MedicalOrgnationCode
					new Object[] { visitId, authorOrganization, "0" });
		} catch (DataAccessException e) {
			throw new DocumentEntryException(e);
		}
	}
	
	
	public List<Map<String, Object>> queryInpatientRecord(String mpiId,
			Map<String, String> args) throws ServiceException {
		try {
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
			String masterDiseaseName = args.get("masterDiseaseName");
			String dateTime = args.get("dateTime");
			String medicalInstitutions = args.get("medicalInstitutions");
			StringBuffer hql = new StringBuffer();
			Map<String, Object> queryArgs = new HashMap<String, Object>();
			hql.append(" MPIID=:mpiId ");
			queryArgs.put("mpiId", mpiId);
			if(StringUtils.isNotEmpty(masterDiseaseName)){
				hql.append(" and MasterDiseaseName like :masterDiseaseName ");
				queryArgs.put("masterDiseaseName", "%"+masterDiseaseName+"%");
			}
			if(StringUtils.isNotEmpty(dateTime)){
				hql.append(" and ((AdmissionDateTime>= :dateTime and  AdmissionDateTime< :time ) or (DischargeDateTime>= :dateTime and DischargeDateTime< :time)) ");
				queryArgs.put("dateTime", sdf.parse(dateTime));
				Calendar c = Calendar.getInstance();  
		        c.setTime(sdf.parse(dateTime));
		        c.add(Calendar.DATE, 1);
		        queryArgs.put("time",  c.getTime());
			}
			if(StringUtils.isNotEmpty(medicalInstitutions)){
				hql.append(" and MedicalInstitutions like :medicalInstitutions ");
				queryArgs.put("medicalInstitutions", "%"+medicalInstitutions+"%");
			}
			hql.append(" order by AdmissionDateTime desc ");
			return getDao().queryForList(recordClassifying, hql.toString(), queryArgs);
		} catch (Exception e) {
			throw new ServiceException(e);
		}
	}
}
