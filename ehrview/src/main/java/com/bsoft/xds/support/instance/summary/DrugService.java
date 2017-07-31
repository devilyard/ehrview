package com.bsoft.xds.support.instance.summary;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.StringUtils;
import org.hibernate.HibernateException;

import com.bsoft.xds.TemplateFormater;
import com.bsoft.xds.exception.DocumentEntryException;
import com.bsoft.xds.support.instance.CommonDocumentEntryRetrieveService;

import ctd.annotation.RpcService;
import ctd.service.core.ServiceException;
import ctd.util.context.ContextUtils;

/**
 * 既往史_用药记录
 * 
 */
public class DrugService extends CommonDocumentEntryRetrieveService {

	/**
	 * @param mpiId
	 * @param start
	 * @param limit
	 * @return
	 */
	public List<Map<String, Object>> getDrugs(String mpiId, int start, int limit)
			throws ServiceException {
		String hql = "from " + getRecordClassifying()
				+ " where MPIID=? and EffectiveFlag = '0' order by PrescribeDate desc";
		try {
			return getDao().queryForPage(hql, start, limit,
					new Object[] { mpiId });
		} catch (HibernateException e) {
			throw new ServiceException(e);
		}
	}
	
	
	@Override
	@RpcService
	public Object getDocumentByRecordId(String recordId, String format){
		try{
			
			Map<String, Object> d = getDao().queryForMap(recordClassifying,
					"DCID=?", new Object[] { recordId });
			if(d == null){
				return null;
			}
			String recordClassifying = (String)d.get("SRCEntryName");
			String dcId =(String) d.get("SRCID");
			
			Map<String, Object> doc = getDao().queryForMap(recordClassifying+"_Doc",
					"DCID=?", new Object[] { dcId });
			if (doc == null) {
				return null;
			}
			Object obj = doc.get("DocContent");
			if (obj == null) {
				return null;
			}
			byte[] content = (byte[]) obj;
			String compressionAlgorithm = (String) doc.get("CompressionAlgorithm");
			byte[] decomressedContent = decompressDocument(compressionAlgorithm,
					content);
			String docFormat = (String) doc.get("DocFormat");
			if(!StringUtils.isEmpty(docFormat)){
				docFormat = docFormat.trim();
			}
			// @@ 如果格式不符合，尝试使用转换器转。
			if (!docFormat.equals(format)) {
				Map<String, Object> record = getDao().queryForMap(recordClassifying,
						"DCID=? and EffectiveFlag=?",
						new Object[] { dcId, "0" });
				String version = (String) record.get("VersionNumber");
				TemplateFormater templateFormater = getTemplateFormater(docFormat,
						format, version);
				if (templateFormater == null) {
					return null;
				}
				ContextUtils.put("classifying", recordClassifying);
				return templateFormater.run(content);
			}
			return decomressedContent;
		}catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}
	
	public List<Map<String, Object>> queryDrugs(String mpiId,Map<String, String> args) throws ServiceException {
		try {
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
			String medicineName = args.get("medicineName");
			String prescribeDate = args.get("prescribeDate");
			String medicineWay = args.get("medicineWay");
			String medicineCategory = args.get("medicineCategory");
			StringBuffer hql = new StringBuffer();
			Map<String, Object> queryArgs = new HashMap<String, Object>();
			hql.append(" MPIID=:mpiId ");
			queryArgs.put("mpiId", mpiId);
			if(StringUtils.isNotEmpty(medicineName)){
				hql.append(" and MedicineName like :medicineName ");
				queryArgs.put("medicineName", "%"+medicineName+"%");
			}
			if(StringUtils.isNotEmpty(prescribeDate)){
				hql.append(" and PrescribeDate>= :prescribeDate  and PrescribeDate< :time");
				queryArgs.put("prescribeDate", sdf.parse(prescribeDate));
				Calendar c = Calendar.getInstance();  
		        c.setTime(sdf.parse(prescribeDate));
		        c.add(Calendar.DATE, 1);
		        queryArgs.put("time",  c.getTime());
			}
			if(StringUtils.isNotEmpty(medicineWay)){
				hql.append(" and MedicineWay like :medicineWay ");
				queryArgs.put("medicineWay", "%"+medicineWay+"%");
			}
			if(StringUtils.isNotEmpty(medicineCategory)){
				hql.append(" and MedicineCategory like :medicineCategory ");
				queryArgs.put("medicineCategory", "%"+medicineCategory+"%");
			}
			hql.append(" order by PrescribeDate desc ");
			return getDao().queryForList(recordClassifying, hql.toString(), queryArgs);
		} catch (Exception e) {
			throw new ServiceException(e);
		}
	}
}
