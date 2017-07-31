/*
 * @(#)MPIQueryService.java Created on Nov 9, 2012 12:18:05 PM
 *
 * 版权：版权所有 Bsoft 保留所有权力。
 */
package com.bsoft.ehr.service.ssdev;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.StringTokenizer;
import java.util.TimeZone;

import org.apache.commons.lang.StringUtils;
import org.hibernate.HibernateException;
import org.hibernate.Query;
import org.hibernate.Session;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import com.bsoft.ehr.util.DictionariesUtil;
import com.bsoft.ehr.util.MPIProxy;
import com.bsoft.ehr.util.UserUtil;
import com.bsoft.mpi.Constants;
import com.bsoft.mpi.exp.CExpRunner;
import com.bsoft.mpi.server.MPIServiceException;
import com.bsoft.mpi.server.rpc.IMPIProvider;
import com.bsoft.mpi.service.ServiceCode;

import ctd.accredit.User;
import ctd.accredit.result.AuthorizeResult;
import ctd.config.schema.DisplayModes;
import ctd.config.schema.Schema;
import ctd.config.schema.SchemaController;
import ctd.config.schema.SchemaItem;
import ctd.dictionary.Dictionaries;
import ctd.dictionary.Dictionary;
import ctd.service.core.Service;
import ctd.service.core.ServiceException;
import ctd.service.dao.DBService;
import ctd.util.context.Context;
import ctd.util.context.ContextUtils;
import ctd.util.exp.ExpException;

/**
 * 
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
public class MPIListService extends DBService {

	private static final Logger logger = LoggerFactory
			.getLogger(MPIListService.class);

	private static final int DEFAULT_PAGESIZE = 25;
	private static final int DEFAULT_PAGENO = 1;
	public final static String DEFAULT_QUERYCNDSTYPE = "filter";
	private String timeZone = "Asia/Shanghai";
	@Autowired
	private IMPIProvider mpiProvider;

	/*
	 * (non-Javadoc)
	 * 
	 * @see ctd.service.core.Service#execute(java.util.Map, java.util.Map,
	 * ctd.util.context.Context)
	 */
	@SuppressWarnings("unchecked")
	@Override
	public void execute(Map<String, Object> req, Map<String, Object> res,
			Context ctx) throws ServiceException {
		int code = 200;
		String msg = "Success";
		String schemaId = (String) req.get("schema");
		if (StringUtils.isEmpty(schemaId)) {
			code = 401;
			msg = "SchemaIdMissed";
			res.put(Service.RES_CODE, code);
			res.put(Service.RES_MESSAGE, msg);
			return;
		}
		Schema sc = SchemaController.instance().getSchema(schemaId);
		List<String> queryCnd = null;
		if (req.containsKey("cnd")) {
			queryCnd = (List<String>) req.get("cnd");
		}
		String queryCndsType = null;
		if (req.containsKey("queryCndsType")) {
			queryCndsType = (String) req.get("queryCndsType");
		}
		String sortInfo = null;
		if (req.containsKey("sortInfo")) {
			sortInfo = (String) req.get("sortInfo");
		} else {
			sortInfo = sc.getSortInfo();
		}
		QueryContext qc = initQueryContext(sc, queryCnd, queryCndsType,
				sortInfo, ctx);
		String q = qc.buildQueryString();
		if (q.isEmpty()) {
			q = "*:*";
		}
		String fl = qc.buildQueryField();
		String sort = qc.buildSortString();

		int pageSize = DEFAULT_PAGESIZE;
		if (req.containsKey("pageSize")) {
			pageSize = (Integer) req.get("pageSize");
		}
		int pageNo = DEFAULT_PAGENO;
		if (req.containsKey("pageNo")) {
			pageNo = (Integer) req.get("pageNo");
		}
		int first = (pageNo - 1) * pageSize;

		Map<String, Object> rst;
		try {
			rst = mpiProvider.getMPIList(fl, q, sort, first, pageSize);
		} catch (MPIServiceException e) {
			logger.error(e.getMessage(), e);
			res.put(Service.RES_CODE, ServiceCode.CODE_SERVICE_ERROR);
			res.put(Service.RES_MESSAGE,
					"SolrServerException:" + e.getMessage());
			return;
		}
		if (rst == null || rst.isEmpty()) {
			logger.warn("No record is found.");
			res.put(Service.RES_CODE, ServiceCode.CODE_OK);
			res.put("totalCount", 0);
			return;
		}
		res.put("totalCount", rst.get("totalCount"));
		List<Map<String, Object>> list = (List<Map<String, Object>>) rst
				.get(Constants.P_BODY);
		List<Map<String, Object>> body = new ArrayList<Map<String, Object>>(
				list.size());
		res.put("body", body);
		SchemaItem si = sc.item("mpiLevel");
		List<String> mpiIds = new ArrayList<String>(list.size());
		Dictionary dic = DictionariesUtil.getDic("anonymity");
		for (Map<String, Object> map : list) {
			//匿名判断
			if(dic != null &&  !"".equals(dic.getText("1"))){
				map = MPIProxy.handle(map);
			}
			Map<String, Object> o = new HashMap<String, Object>();
			o.put("mpiLevel", "0");
			if (si != null) {// 双检事业部 修改
				o.put("mpiLevel_text", si.getDisplayValue("0"));
			}
			for (String key : map.keySet()) {
				Object value = map.get(key);
				String type = qc.getFieldType(key);
				if (type != null && (value instanceof Date)) {
					value = formatDateType((Date) value, type);
				}
				if (value instanceof List) {
					List<String> l = (List<String>) value;
					if (l.size() > 0) {
						value = l.get(0);
					}
				}
				o.put(key, value);
			}
			body.add(o);
			mpiIds.add((String) map.get("mpiId"));
		}
		List<Map<String, Object>> levels = null;
		if (mpiIds.isEmpty() == false) {
			try {
				String hql = "from SYS_MPILevel where mpiId in (:mpiIds)";
				Session session = (Session) ctx.get(Context.DB_SESSION);
				Query query = session.createQuery(hql);
				query.setParameterList("mpiIds", mpiIds);
				levels = query.list();
			} catch (HibernateException e) {
				throw new ServiceException(e);
			}
		}
		if (levels != null && levels.isEmpty() == false) {
			for (Map<String, Object> level : levels) {
				String mpiId = (String) level.get("mpiId");
				int index = mpiIds.indexOf(mpiId);
				if (index >= 0) {
					Map<String, Object> mpi = body.get(index);
					String mpiLevel = (String) level.get("mpiLevel");
					mpi.put("mpiLevel", mpiLevel);
					mpi.put("mpiLevel_text", si.getDisplayValue(mpiLevel));
				}
			}
		}
		res.put(Service.RES_CODE, 200);
		res.put(Service.RES_MESSAGE, "QuerySuccess");
	}

	@SuppressWarnings({ "rawtypes", "unchecked" })
	private QueryContext initQueryContext(Schema sc, List queryCnd,
			String queryCndsType, String sortInfo, Context ctx) {
		List<List> cnds = new ArrayList<List>();
		List<SchemaItem> items = sc.getAllItemsList();
		User user = UserUtil.getCurrentUser();
		QueryContext qc = new QueryContext();
		AuthorizeResult r = null;
		for (SchemaItem it : items) {
			String fid = it.getId();
			r = user.authorize("storage", sc.getId() + "." + it.getId());
			if (r.getResult() == AuthorizeResult.NO) {
				continue;
			}
			if (sc.getKey() != it
					&& (it.displayMode() == DisplayModes.NONE || it
							.displayMode() == DisplayModes.NO_LIST_DATA)) {
				continue;
			}
			qc.addField(fid, it.getType());
			if (it.isCodedValue()) {
				qc.addField(fid + "_text");
			}
		}

		if (queryCnd != null) {
			cnds.add(queryCnd);
		}
		// add role query condition
		// Condition c = sc.lookupCondition(queryCndsType);
		// if (c != null) {
		// List<Object> roleCnd = (List<Object>) c.data().get("exp");
		// if (roleCnd != null && !roleCnd.isEmpty()) {
		// cnds.add(roleCnd);
		// }
		// }
		// start
		List searchCnds = null;
		int cndCount = cnds.size();
		if (cndCount == 0) {
			searchCnds = queryCnd;
		} else {
			if (cndCount == 1) {
				searchCnds = cnds.get(0);
			} else {
				searchCnds = new ArrayList();
				searchCnds.add("and");
				for (List cd : cnds) {
					searchCnds.add(cd);
				}
			}
		}
		if (searchCnds != null) {
			try {
				qc.setQueryFactor(CExpRunner.toString(searchCnds,
						ContextUtils.getContext()));
			} catch (ExpException e) {
				e.printStackTrace();
			}
		}
		// set sortinfo
		qc.setSortInfo(sortInfo);
		return qc;
	}

	private String formatDateType(Date date, String type) {
		SimpleDateFormat sdf = null;
		if (type.equals("date")) {
			sdf = new SimpleDateFormat("yyyy-MM-dd");
		} else if (type.equals("timestamp")) {
			sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		} else if (type.equals("time")) {
			sdf = new SimpleDateFormat("HH:mm:ss");
		} else {
			return "";
		}
		sdf.setTimeZone(TimeZone.getTimeZone(timeZone));
		return sdf.format(date);
	}
}

class QueryContext {
	private List<String> fields = new ArrayList<String>();
	private Map<String, String> fieldTypes = new HashMap<String, String>();
	private String queryFactor = "";
	private String sortInfo = "";

	public void addField(String f) {
		fields.add(f);
		fieldTypes.put(f, "string");
	}

	public void addField(String f, String t) {
		fieldTypes.put(f, t);
		fields.add(f);
	}

	public String getFieldName(int i) {
		return fields.get(i);
	}

	public List<String> getAllFields() {
		return fields;
	}

	public String getFieldType(String f) {
		return fieldTypes.get(f);
	}

	public void setSortInfo(String sortInfo) {
		this.sortInfo = sortInfo;
	}

	public int getFieldCount() {
		return fields.size();
	}

	public void setQueryFactor(String queryFactor) {
		this.queryFactor = queryFactor;
	}

	public String buildQueryField() {
		StringBuffer q = new StringBuffer();
		for (String f : fields) {
			q.append(",").append(f);
		}
		if (fields.size() > 0) {
			q.deleteCharAt(0);
		}
		return q.toString();
	}

	public String buildQueryString() {
		if (queryFactor.trim().length() == 0) {
			return "";
		}
		queryFactor = queryFactor.replaceAll("[a-z]\\.", "");
		return queryFactor;
	}

	public String buildSortString() {
		StringBuffer q = new StringBuffer();
		if (sortInfo != null && !sortInfo.equals("")) {
			StringTokenizer st = new StringTokenizer(sortInfo, ",");
			while (st.hasMoreTokens()) {
				String str = st.nextToken();
				int i = str.indexOf(".");
				if (i > 0) {
					str = str.substring(i + 1);
				}
				if (str.endsWith(" asc") || str.endsWith(" desc")) {
					q.append(str);
				} else {
					q.append(str).append(" asc");
				}
			}
		}
		return q.toString();
	}
}
