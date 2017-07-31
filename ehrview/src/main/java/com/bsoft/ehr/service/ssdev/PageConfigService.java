/*
 * @(#)MPIQueryService.java Created on Nov 9, 2012 12:18:05 PM
 *
 * 版权：版权所有 Bsoft 保留所有权力。
 */
package com.bsoft.ehr.service.ssdev;

import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.bsoft.ehr.util.FileUtils;

import ctd.service.core.Service;
import ctd.service.core.ServiceException;
import ctd.service.dao.DBService;
import ctd.util.context.Context;

/**
 * 
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
public class PageConfigService extends DBService {

	private static final Logger logger = LoggerFactory
			.getLogger(MPIListService.class);

	/*
	 * (non-Javadoc)
	 * 
	 * @see ctd.service.core.Service#execute(java.util.Map, java.util.Map,
	 * ctd.util.context.Context)
	 */
	@Override
	public void execute(Map<String, Object> req, Map<String, Object> res,
			Context ctx) throws ServiceException {
		
		String nodename = (String) req.get("nodename");
		String html = (String) req.get("html");
		
		String pathName1 = getFilePath("2011_V1.0");
		String pathName2 = getFilePath("V2012");
		
		List<String> listName = new ArrayList<String>();
		listName.add(pathName1);
		listName.add(pathName2);
		
		// 获取修改后的HTML内容
		if (html != null && !"".equals(html)) {
			String filePath = pathName1 + "/" + nodename;
			FileUtils.writerFile(filePath, html,false);
			return;
		}
				
		// 获取HTML模板内容
		if(nodename!=null&&!"".equals(nodename)){
			String filePath = pathName1+"/"+nodename;
			res.put("html",FileUtils.readFileByLines(filePath));
			return;
		}
		
		// 设置目录树
		res.put("body",getTreeJson(listName));

		res.put(Service.RES_CODE, 200);
		res.put(Service.RES_MESSAGE, "QuerySuccess");
	}
	
	private String getFilePath(String version) {
		File f = new File(this.getClass().getResource("/").getPath());
		String rootPath = f.getParent() + "/config/templates/";
		logger.info("HTML模板根路径："+rootPath);
		return rootPath + version;
	}

	private String getTreeJson(List<String> rootArray) {
		File file = new File(rootArray.get(0));
		File[] files = file.listFiles();
		File file2 = new File(rootArray.get(1));
		File[] files2 = file2.listFiles();
		StringBuffer sb = new StringBuffer();
		sb.append("[");
		sb.append("{");
		sb.append("id:\"node1\",text:\"2011_V1.0\",children:");
		sb.append("[");
		int i = 2;
		for (File tempfile : files) {
			if (i == 2) {
				sb.append("{");
			} else {
				sb.append(",{");
			}
			sb.append("id:\"").append("node" + i).append("\",");
			sb.append("text:\"").append(tempfile.getName()).append("\",");
			sb.append("leaf:true");
			sb.append("}");
			i++;
		}
		sb.append("]");
		sb.append("}");
		sb.append(",");
		sb.append("{");
		int j = i + 1;
		sb.append("id:\"node" + i + "\",text:\"V2012\",children:");
		sb.append("[");
		for (File tempfile : files2) {
			if (j == i + 1) {
				sb.append("{");
			} else {
				sb.append(",{");
			}
			sb.append("id:\"").append("node" + j).append("\",");
			sb.append("text:\"").append(tempfile.getName()).append("\",");
			sb.append("leaf:true");
			sb.append("}");
			j++;
		}
		sb.append("]");
		sb.append("}");
		sb.append("]");
		return sb.toString();
	}
	
}