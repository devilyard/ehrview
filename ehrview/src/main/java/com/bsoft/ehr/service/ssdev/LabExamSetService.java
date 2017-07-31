package com.bsoft.ehr.service.ssdev;

import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import org.dom4j.Attribute;
import org.dom4j.Document;
import org.dom4j.Element;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.bsoft.ehr.config.labexam.LabExamSetConfigLocalLoader;

import ctd.service.core.Service;
import ctd.service.core.ServiceException;
import ctd.util.context.Context;
import ctd.util.xml.XMLHelper;

public class LabExamSetService implements Service {

	private static final Logger logger = LoggerFactory
			.getLogger(LabExamSetService.class);
	
	@Override
	public void execute(Map<String, Object> req, Map<String, Object> res,
			Context ctx) throws ServiceException {

		List<Map<String, String>> list = new ArrayList<Map<String, String>>();
		String method  = (String) req.get("cnd");
		if("list".equals(method)){
			Document doc = LabExamSetConfigLocalLoader.instance().getDefineDoc();
			Element find = (Element)doc.selectSingleNode("//LabExam");
			if(find != null){
				@SuppressWarnings("unchecked")
				List<Element> maskFields = find.element("maskFields").selectNodes("maskField");
				if(maskFields != null){
					for(Element maskField : maskFields){
						HashMap<String,String> map = new HashMap<String,String>();
						String name = maskField.attributeValue("name");
						map.put("name", name);
						list.add(map);
					}
				}
			}
		}else if("save".equals(method)){
			HashMap<String,Object> rec = (HashMap<String,Object>)req.get("body");
			String name  = (String) rec.get("name");
			String entryName  = (String) rec.get("schema");
			String maskDic  = (String) rec.get("maskDic");
			String resDataStandard  = (String) rec.get("resDataStandard");
			String status = (String) rec.get("status");
			if(entryName != null && !"".equals(entryName)){
				String filename = LabExamSetConfigLocalLoader.instance().getConfigFilename("dataFilter");
				Document doc = LabExamSetConfigLocalLoader.instance().getDefineDoc();
				Element find = (Element)doc.selectSingleNode("//filter[@entryName='" + entryName + "'][@resDataStandard='" + resDataStandard + "']");
				if(find == null){
					doc.getRootElement().addElement("filter").addAttribute("entryName",entryName).addAttribute("resDataStandard",resDataStandard).addElement("maskFields").addElement("maskField").addAttribute("name", name)
					.addAttribute("maskDic",maskDic).addAttribute("status", status);
				}else{
					Element maskFields = find.element("maskFields");
					if(maskFields == null){
						maskFields  = find.addElement("maskFields").addElement("maskField").addAttribute("name", name)
								.addAttribute("maskDic",maskDic).addAttribute("status", status);
					}else{
						maskFields  = maskFields.addElement("maskField").addAttribute("name", name)
								.addAttribute("maskDic",maskDic).addAttribute("status", status);
					}
				}
				XMLHelper.putDocument(new File(filename),doc);
			}
		}else if("remove".equals(method)){
			String name  = (String) req.get("name");
			String entryName  = (String) req.get("schema");
			String resDataStandard  = (String) req.get("resDataStandard");
			String filename = LabExamSetConfigLocalLoader.instance().getConfigFilename("dataFilter");
			Document doc = LabExamSetConfigLocalLoader.instance().getDefineDoc();
			Element find = (Element)doc.selectSingleNode("//filter[@entryName='" + entryName + "'][@resDataStandard='" + resDataStandard + "']//maskField[@name='" + name + "']");
			if(find != null){
				if(find != null){
					find.getParent().remove(find);
					XMLHelper.putDocument(new File(filename),doc);
				}
				
			}
		}else if("update".equals(method)){
			String name  = (String) req.get("name");
			String entryName  = (String) req.get("schema");
			String maskDic  = (String) req.get("maskDic");
			String resDataStandard  = (String) req.get("resDataStandard");
			String status = (String) req.get("status");
			if(entryName != null && !"".equals(entryName)){
				String filename = LabExamSetConfigLocalLoader.instance().getConfigFilename("dataFilter");
				Document doc = LabExamSetConfigLocalLoader.instance().getDefineDoc();
				Element find = (Element)doc.selectSingleNode("//filter[@entryName='" + entryName + "'][@resDataStandard='" + resDataStandard + "']//maskField[@name='" + name + "']");
				if(find != null){
					if(find != null){
						for(@SuppressWarnings("unchecked")
						Iterator<Attribute> it=find.attributeIterator();it.hasNext();){
							@SuppressWarnings("unused")
							Attribute attr = it.next();
							it.remove();
						}
						find.addAttribute("name", name)
						.addAttribute("maskDic",maskDic).addAttribute("status", status);
						XMLHelper.putDocument(new File(filename),doc);
					}
				}
			}
		}
		
		
		res.put("body", list);
		res.put(Service.RES_CODE, 200);
		res.put(Service.RES_MESSAGE, "QuerySuccess");
		
	}
}
