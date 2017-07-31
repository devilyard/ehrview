/*
 * @(#)BrowsingHistorySaveService.java Created on 2013年11月13日 上午10:29:20
 * 
 * 版权：版权所有 Bsoft 保留所有权力。
 */
package com.bsoft.ehr.service;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import javax.servlet.http.HttpSession;

import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;

import com.bsoft.ehr.util.UserUtil;

import ctd.accredit.User;
import ctd.config.schema.Schema;
import ctd.config.schema.SchemaController;
import ctd.config.schema.SchemaItem;

/**
 * 开启线程写EHRView的访问记录，
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
@Service
public class BrowsingHistorySaveService extends
		AbstractHibernateDAOSupoortServcie {

	private final ExecutorService executorService = Executors
			.newFixedThreadPool(5);

	// @@ 单位是分。
	private int delayPeriod = 5;

	/**
	 * @param mpi
	 * @param session
	 */
	public void saveBrowsingHistory(final Map<String, Object> mpi,
			final HttpSession session) {
		if (mpi == null || mpi.isEmpty()) {
			return;
		}
		final ctd.accredit.User user = UserUtil.getCurrentUser();
		if (user == null) {
			return;
		}
		String lastSavedMpiId = (String) session.getAttribute("lastSavedMpiId");
		Date lastSavedTime = (Date) session.getAttribute("lastSavedTime");
		final String mpiId = (String) mpi.get("mpiId");
		if (!needToSave(mpiId, lastSavedMpiId, lastSavedTime)) {
			return;
		}
		executorService.execute(new Runnable() {
			@Override
			public void run() {
				processSave(mpi, user);
				session.setAttribute("lastSavedMpiId", mpiId);
				session.setAttribute("lastSavedTime", new Date());
			}
		});
	}
	
	public void saveBrowsingHistoryOther(final Map<String, Object> mpi,final User user){
		executorService.execute(new Runnable() {
			@Override
			public void run() {
				processSave(mpi, user);
			}
		});
	}
	

	/**
	 * 在5分钟内对同一个的重复访问不会被记录到访问历史里去。
	 * 
	 * @param currentMpiId
	 * @param lastSavedMpiId
	 * @param lastSaveTime
	 * @return
	 */
	private boolean needToSave(String currentMpiId, String lastSavedMpiId,
			Date lastSaveTime) {
		if (currentMpiId == null) {
			return false;
		}
		if (lastSavedMpiId == null || lastSaveTime == null
				|| !currentMpiId.equals(lastSavedMpiId)) {
			return true;
		}
		long diff = System.currentTimeMillis() - lastSaveTime.getTime();
		if (diff < delayPeriod * 60 * 1000) {
			return false;
		} else {
			return true;
		}
	}

	/**
	 * @param mpi
	 * @throws DataAccessException
	 */
	private void processSave(Map<String, Object> mpi, ctd.accredit.User user)
			throws DataAccessException {
		Map<String, Object> browsingMap = new HashMap<String, Object>();
		Schema sc = SchemaController.instance().getSchema("SYS_BrowsingHist");
		for (SchemaItem si : sc.getAllItemsList()) {
			if (sc.getKey() == si) {
				continue;
			}
			browsingMap.put(si.getId(), mpi.get(si.getId()));
		}
		browsingMap.put("userId", user.getId());
		browsingMap.put("roleList", user.get("role.id"));
		browsingMap.put("systemTime", new Date());
		browsingMap.put("datasource", "ehrview系统");//默认来源是ehrview系统
		
		if(mpi.get("organizationcode") != null){
			browsingMap.put("organizationcode", mpi.get("organizationcode"));
		}
		if(mpi.get("docid") != null){
			browsingMap.put("docid", mpi.get("docid"));	
		}
		if(mpi.get("docidcard") != null){
			browsingMap.put("docidcard", mpi.get("docidcard"));
		}
		if(mpi.get("docname") != null){
			browsingMap.put("docname", mpi.get("docname"));
		}
		if(mpi.get("datasource") != null){
			browsingMap.put("datasource", mpi.get("datasource"));
		}
		getHibernateTemplate().save("SYS_BrowsingHist", browsingMap);
	}

	public int getDelayPeriod() {
		return delayPeriod;
	}

	public void setDelayPeriod(int delayPeriod) {
		this.delayPeriod = delayPeriod;
	}
}
