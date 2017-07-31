package com.bsoft.ehr.service.ssdev;

import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.StringUtils;
import org.hibernate.HibernateException;
import org.hibernate.Query;
import org.hibernate.Session;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;

import com.bsoft.ehr.config.app.App;
import com.bsoft.ehr.config.app.Application;
import com.bsoft.ehr.config.app.ApplicationConfigController;
import com.bsoft.ehr.config.app.Category;
import com.bsoft.ehr.service.PublicHealthInfoService;
import com.bsoft.ehr.util.DictionariesUtil;

import ctd.dictionary.Dictionaries;
import ctd.dictionary.Dictionary;
import ctd.dictionary.DictionaryItem;
import ctd.service.core.ServiceException;
import ctd.service.dao.DBService;
import ctd.util.JSONUtils;
import ctd.util.context.Context;

public class LayoutConfigService extends DBService {

	@Autowired
	private PublicHealthInfoService publicHealthInfoService;

	@SuppressWarnings("unchecked")
	@Override
	public void execute(Map<String, Object> req, Map<String, Object> res,
			Context ctx) throws ServiceException {
		Session session = (Session) ctx.get(Context.DB_SESSION);
		String action = req.get("action").toString();
		if (action.equals("layoutList")) {
			getLayoutsList(res, session, ctx);
		} else if (action.equals("saveLayout")) {
			saveLayout(res, (Map<String, Object>) req.get("saveData"), session,
					ctx);
		} else if (action.equals("deleteLayout")) {
			delLayout(session, req.get("recordID").toString());
		} else if (action.equals("getLayoutData")) {
			res.put("body",
					getLayoutData((String) req.get("layoutId"), session, ctx));
		} else if (action.equals("getAPPList")) {
			getAppList(res);
		} else if (action.equals("rename")) {
			rename(session, (Map<String, Object>) req.get("saveData"));
		} else if (action.equals("getTemplateList")) {
			getTemplateList(res);
		} else if (action.equals("getRoleList")) {
			getRoleList(res);
		} else if (action.equals("getAllPopulations")) {
			getAllPopulations(res);
		} else if (action.equals("getExpList")) {
			getExpList(session, res);
		} else if (action.equals("saveExp")) {
			Map<String, Object> data = (Map<String, Object>) req
					.get("saveData");
			saveExp(data, session, res);
		} else if (action.equals("delExp")) {
			List<String> delList = (List<String>) req.get("delIds");
			delExp(session, res, delList);
		}
	}

	private void getRoleList(Map<String, Object> res) {
		Dictionary dic = DictionariesUtil.getDic("rolelist");
		ArrayList<Object> l = new ArrayList<Object>();
		for (DictionaryItem item : dic.itemsList()) {
			HashMap<String, String> m = new HashMap<String, String>();
			m.put("key", item.getKey());
			m.put("text", item.getText());
			l.add(m);
		}
		res.put("body", l);
	}

	private void getAllPopulations(Map<String, Object> res) {
		res.put("body", publicHealthInfoService.getAllPopulations());
	}

	private void rename(Session session, Map<String, Object> data) {
		session.createQuery(
				"update SYS_LayoutData set LayoutText='"
						+ (String) data.get("layoutText") + "' where RecordID="
						+ Integer.parseInt(data.get("recordID").toString())
						+ " ").executeUpdate();
	}

	private void delLayout(Session session, String rid) {
		HashMap<String, Integer> m = new HashMap<String, Integer>();
		m.put("RecordID", Integer.parseInt(rid));
		session.delete("SYS_LayoutData", m);
		session.flush();
	}

	private void getTemplateList(Map<String, Object> res) {
		String path = this.getClass().getClassLoader().getResource("")
				.getPath().replaceAll("%20", " ");
		File file = new File(path + "../../layoutTemplates/");
		String test[];
		test = file.list();
		ArrayList<Object> l = new ArrayList<Object>();
		for (int i = 0; i < test.length; i++) {
			HashMap<String, String> m = new HashMap<String, String>();
			String templateName = test[i];
			String[] s = templateName.split("\\.");
			m.put("id", s[0]);
			int x = i + 1;
			m.put("text", "布局" + x);
			l.add(m);
		}
		res.put("body", l);
	}

	private void getLayoutsList(Map<String, Object> res, Session session,
			Context ctx) {
		Query q = session.createQuery("from SYS_LayoutData");
		res.put("body", q.list());
	}

	public void saveLayout(Map<String, Object> res, Map<String, Object> data,
			Session session, Context ctx) {
		@SuppressWarnings("unchecked")
		Map<String, Object> ld = (Map<String, Object>) data.get("layoutData");
		String layoutData = JSONUtils.writeValueAsString(ld);
		Map<String, Object> layout = new HashMap<String, Object>();
		// String querySql = "from SYS_LayoutData where LAYOUTTEXT=:LAYOUTTEXT";
		// Query query = session.createQuery(querySql);
		// query.setString("LAYOUTTEXT", (String) data.get("LAYOUTTEXT"));
		// if (query.list().size() > 0) {
		// res.put("body", "205");
		// } else {
		if (data.containsKey("recordID")) {
			layout.put("RecordID",
					Integer.parseInt((String) data.get("recordID")));
		}
		if (data.containsKey("layoutText")) {
			layout.put("LayoutText", (String) data.get("layoutText"));
		}
		if (data.containsKey("templateID")) {
			layout.put("TemplateID", (String) data.get("templateID"));
		}
		if (data.containsKey("fixed")) {
			layout.put("Fixed", data.get("fixed"));
		}
		if (data.containsKey("layoutData")) {
			layout.put("LayoutData", layoutData);
		}
		session.saveOrUpdate("SYS_LayoutData", layout);
		session.flush();
		// }

	}

	/**
	 * @param layoutId
	 * @throws HibernateException
	 */
	public void deleteLayout(final String layoutId, Session session, Context ctx) {
		String hql = "DELETE FROM SYS_LayoutData WHERE LayoutId=:layoutId";
		Query query = session.createQuery(hql);
		query.setString("layoutId", layoutId);
		query.executeUpdate();
	}

	/**
	 * @param layoutId
	 * @return
	 * @throws DataAccessException
	 */
	public String getLayoutData(final String layoutId, Session session,
			Context ctx) {
		Query query = session
				.createQuery("select LayoutData from SYS_LayoutData where RecordID=:RecordID");
		query.setString("RecordID", layoutId);
		return (String) query.uniqueResult();

	}

	public void getAppList(Map<String, Object> res) {
		Application application = ApplicationConfigController.instance()
				.getApplication();
		List<Category> list = application.getCategorys();
		List<Object> ll = new ArrayList<Object>();
		for (Category c : list) {
			Map<String, Object> cm = new HashMap<String, Object>();
			cm.put("id", c.getId());
			cm.put("name", c.getName());
			cm.put("nocheck", c.isNocheck());
			ll.add(cm);
			List<Map<String, Object>> children = new ArrayList<Map<String, Object>>();
			for (App a : c.getApps()) {
				Map<String, Object> am = new HashMap<String, Object>();
				am.put("name", a.getName());
				am.put("id", a.getId());
				children.add(am);
			}
			if (children.isEmpty() == false) {
				cm.put("children", children);
			}
		}
		res.put("body", ll);
	}

	public void getExpList(Session session, Map<String, Object> res) {
		Query q = session
				.createQuery("from SYS_ViewPortalRule where RoleId <> '-'");
		res.put("body", q.list());
	}

	public void saveExp(Map<String, Object> data, Session session,
			Map<String, Object> res) {
		StringBuilder exp = new StringBuilder();
		exp.append("['and'");
		if (!"".equals((String) data.get("role")) && data.get("role") != null) {
			exp.append(",['eq',['s','");
			exp.append(data.get("role"));
			exp.append("'],['$','%roleId']]");
		}
		if (!"".equals((String) data.get("crowd")) && data.get("crowd") != null) {
			exp.append(",['has',['$','%populations'],['s','");
			exp.append(data.get("crowd"));
			exp.append("']]");
		}
		if (!"".equals((String) data.get("manageUnit"))
				&& data.get("manageUnit") != null) {
			exp.append(",['like',['$','%manaUnitId'],['s','");
			exp.append(data.get("manageUnit"));
			exp.append("']]");
		}
		exp.append("]");

		String querySql = "select DCID from SYS_ViewPortalRule where Expression=:exp and LayoutId=:layout";
		Query query = session.createQuery(querySql);
		query.setString("exp", exp.toString());
		query.setString("layout", data.get("layout").toString());
		Integer dcId = (Integer) query.uniqueResult();
		String ruleId = (String) data.get("ruleId");
		if (dcId != null) {
			if (StringUtils.isEmpty(ruleId)
					|| !String.valueOf(dcId).equals(ruleId)) {
				res.put("status", "205");
				res.put("ruleId", dcId);
				return;
			}
		}
		HashMap<String, Object> saveData = new HashMap<String, Object>();
		saveData.put("RoleId", data.get("role"));
		saveData.put("Population", data.get("crowd"));
		saveData.put("ManageUnit", data.get("manageUnit"));
		saveData.put("Expression", exp.toString());
		saveData.put("LayoutId", Integer.parseInt((String) data.get("layout")));
		saveData.put("ManageUnit_Text", data.get("manageUnit_text"));
		if (StringUtils.isNotEmpty(ruleId)) {
			saveData.put("DCID", Integer.parseInt(ruleId));
			session.update("SYS_ViewPortalRule", saveData);
		} else {
			ruleId = String.valueOf(session
					.save("SYS_ViewPortalRule", saveData));
		}
		session.flush();
		res.put("status", "200");
		res.put("ruleId", ruleId);
	}

	public void delExp(Session session, Map<String, Object> res,
			List<String> delList) {
		for (int i = 0; i < delList.size(); i++) {
			String dcid = delList.get(i);
			String hql = "DELETE FROM SYS_ViewPortalRule WHERE DCID=:DCID";
			Query query = session.createQuery(hql);
			query.setString("DCID", dcid);
			query.executeUpdate();
		}
	}
}
