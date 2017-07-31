/*
 * 
 * 版权：版权所有 Bsoft 保留所有权力。
 */
package com.bsoft.ehr.service.ssdev;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;

import ctd.service.core.Service;
import ctd.service.core.ServiceException;
import ctd.util.context.Context;

public class TemplateListService implements Service {

	@Override
	public void execute(Map<String, Object> req, Map<String, Object> res,
			Context ctx) throws ServiceException {
		String method  = (String) req.get("method");
		ArrayList<Object> l = new ArrayList<Object>();
		if("list".equals(method)){//取模板版本
			if(fileList("") != null){
				String test[] = fileList("").list();
				for (int i = 0; i < test.length; i++) {
					Map<String, Object> data = new HashMap<String, Object>();
					data.put("text", test[i]);
					data.put("key", test[i]);
					data.put("leaf", true);
					l.add(data);
				}
			}
			res.put("body", l);
		}else if("query".equals(method)){
			String templateId  = (String) req.get("templateId");
			if(fileList(templateId) != null){
				String test[] = fileList(templateId).list();
				for (int i = 0; i < test.length; i++) {
					Map<String, Object> data = new HashMap<String, Object>();
					data.put("templateName", test[i]);
					l.add(data);
				}
			}
			res.put("body", l);
		}else if("queryName".equals(method)){
			Document doc = null;
			String templateId  = (String) req.get("templateId");
			String templateName  = (String) req.get("templateName");
			File file = fileList(templateId+"/"+templateName);
			if(file != null){
				try {
					doc = Jsoup.parse(file, "UTF-8");
				} catch (IOException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
			}
			if(doc != null){
				res.put("body", doc.toString());
			}else{
				res.put("body", "");
			}
			
		}else if("update".equals(method)){
			String content = (String) req.get("content");
			Document doc = null;
			String templateId  = (String) req.get("templateId");
			String templateName  = (String) req.get("templateName");
			File file = fileList(templateId+"/"+templateName);
			if(file != null){
				try {
					doc = Jsoup.parse(file, "UTF-8");
				} catch (IOException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
			}
			if(doc != null){
				doc.html(content);
				FileOutputStream fos = null;
				try {
					fos = new FileOutputStream(file, false);
					fos.write(doc.html().getBytes("UTF-8"));
					fos.close();
				} catch (Exception e1) {
					// TODO Auto-generated catch block
					e1.printStackTrace();
				}  
			}
			
		}
	}
	
	public static File fileList(String templateId){
		String path = TemplateListService.class.getClassLoader().getResource("")
				.getPath();
		File file = null;
		if(path != null){
			// str会得到这个函数所在类的路径
			String str = path.substring(1, path.length());
			// 将%20换成空格（如果文件夹的名称带有空格的话，会在取得的字符串上变成%20）
			str = str.replaceAll("%20", " ");
			// 查找“WEB-INF”在该字符串的位置
			int num = str.indexOf("WEB-INF");
			// 截取即可
			str = str.substring(0, num + "WEB-INF".length() + 1);
			//模板文件
			file = new File(str+"config/templates/"+templateId);
		}
		return file;
	}

}
