package com.bsoft.xds.support.instance.pt.app;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import wl.zs.utils.DateUtils;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.bsoft.mpi.Constants;
import com.bsoft.mpi.server.MPIServiceException;
import com.bsoft.mpi.server.rpc.IMPIProvider;
import com.bsoft.xds.exception.DocumentEntryException;
import com.bsoft.xds.support.instance.CommonDocumentEntryRetrieveService;
import com.bsoft.xds.support.instance.pt.ExamReportDocumentEntryRetrieveService;
import com.bsoft.xds.support.instance.pt.PtCheckReportDocumentEntryRetrieveService;


/**
 * APP检验检查接口
 */
public class AppPtLabExamReportService extends CommonDocumentEntryRetrieveService implements IAppPtLabExamReportService {

	private static final Logger logger = LoggerFactory
			.getLogger(AppPtLabExamReportService.class);
	@Autowired
	private IMPIProvider mpiService;
	
	@Autowired
	private ExamReportDocumentEntryRetrieveService examReportService;
	
	@Autowired
	private PtCheckReportDocumentEntryRetrieveService ptCheckReport;
	
	/**
	 * @return the mpiService
	 */
	public IMPIProvider getMpiService() {
		return mpiService;
	}

	/**
	 * @param mpiService
	 *            the mpiService to set
	 */
	public void setMpiService(IMPIProvider mpiService) {
		this.mpiService = mpiService;
	}

	@Override
	public String getLabExamReport(String idCard,
			String cardNo, String cardTypeCode, String name, int page, int limit)
			throws DocumentEntryException {
		
		if (StringUtils.isEmpty(idCard)
				&& (StringUtils.isEmpty(cardNo) || StringUtils
						.isEmpty(cardTypeCode))) {
			logger.error("[idCard] or [cardNo and cardTypeCode] is necessary.");
			throw new DocumentEntryException(DocumentEntryException.MPI_FAILED,
					"[idCard] or [cardNo and cardTypeCode] is necessary.");
		}
		Map<String, Object> mpiArgs = new HashMap<String, Object>();
		if (StringUtils.isNotEmpty(idCard)) {
			mpiArgs.put(Constants.F_IDCARD, idCard);
		}
		if (StringUtils.isNotEmpty(cardNo)
				&& StringUtils.isNotEmpty(cardTypeCode)) {
			List<Map<String, Object>> cards = new ArrayList<Map<String, Object>>(
					1);
			Map<String, Object> card = new HashMap<String, Object>(2);
			card.put(Constants.F_CARDNO, cardNo);
			card.put(Constants.F_CARDTYPECODE, cardTypeCode);
			cards.add(card);
			mpiArgs.put(Constants.MPI_INTERFACE_FIELD_CARDS, cards);
		}
		List<String> mpiIds;
		try {
			mpiIds = mpiService.getMPIID(mpiArgs);
		} catch (MPIServiceException e) {
			logger.error("Failed to get MPIID with args[{}].", mpiArgs);
			throw new DocumentEntryException(DocumentEntryException.MPI_FAILED,
					e);
		}
		if (mpiIds == null || mpiIds.isEmpty()) {
			logger.error("MPI not found with args[{}].", mpiArgs);
			throw new DocumentEntryException(
					DocumentEntryException.MPI_NOT_FOUND, "MPI not found.");
		}
		String mpiId = mpiIds.get(0);
		
		Map<String, Object> params = new HashMap<String, Object>();
		StringBuilder where = new StringBuilder("MPIID=:mpiId");
		params.put("mpiId", mpiId);
		
		if (StringUtils.isNotEmpty(name)) {
			where.append(" and title like ('%"+name+"%') ");
		}
		where.append(" order by time desc ");
		List<Map<String, Object>> records = getDao().queryForPage(recordClassifying, where.toString(),
				(page - 1) * limit, limit, params);
		int count = getDao().queryForCount(recordClassifying, where.toString(), params);
		
		JSONObject obj = new JSONObject();
		obj.put("count",count);
		obj.put("list", records);
		return obj.toJSONString();
	}

	@Override
	public String getDocumentById(String id) throws DocumentEntryException {
		
		Object obj = null;
		
		if(id.startsWith("9999")){
			//Pt_LabReport
			obj = examReportService.getDefaultDocumentByRecordId(id.substring(4));
		}else{
			//Pt_ExamReport
			obj = ptCheckReport.getDefaultDocumentByRecordId(id.substring(4));
		}
		
		if(obj == null){
			return null;
		}else{
			return String.valueOf(obj);
		}
		
	}




}
