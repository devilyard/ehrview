package com.bsoft.ehr.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.dom4j.Document;
import org.dom4j.Element;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.bsoft.ehr.controller.support.ControllerResponse;
import com.bsoft.ehr.util.DictionariesUtil;
import com.bsoft.mpi.service.ServiceCode;

import ctd.dictionary.Dictionaries;
import ctd.dictionary.Dictionary;
import ctd.dictionary.DictionaryItem;
import ctd.dictionary.XMLDictionary;
import ctd.util.JSONUtils;

@Controller
public class EHRViewDictionaryController {

	private static final Logger logger = LoggerFactory
			.getLogger(EHRViewDictionaryController.class);

	/**
	 * @param key
	 * @return
	 */
	@RequestMapping(value = "/config/getManageUnit", method = RequestMethod.GET)
	@ResponseBody
	public ControllerResponse getManageUnit(String key) {
		ControllerResponse response = new ControllerResponse();
		XMLDictionary d;
		d = (XMLDictionary) DictionariesUtil.getDic("manageUnit");
//		if (key == null) {
//			key = "3301";
//		}
		List<DictionaryItem> dItemList = d.getSlice(key, 3, null, 0, 0, null);
		List<HashMap<String, Object>> bodyList = new ArrayList<HashMap<String, Object>>();
		for (DictionaryItem dItem : dItemList) {
			@SuppressWarnings("unchecked")
			HashMap<String, Object> m = JSONUtils.parse(
					JSONUtils.toString(dItem), HashMap.class);
			m.put("pId", key);
			m.put("isParent",
					!Boolean.parseBoolean(dItem.getProperty("leaf", "false")));
			bodyList.add(m);
		}
		response.setBody(bodyList);
		return response;
	}

	/**
	 * @return
	 */
	@RequestMapping(value = "/config/getMpiDic", method = RequestMethod.GET)
	@ResponseBody
	public ControllerResponse getMpiDic() {
		ControllerResponse response = new ControllerResponse();
		Dictionary cardTypeCode = DictionariesUtil
				.getDic("cardTypeCode");
		Dictionary certificateTypeCode = DictionariesUtil.getDic(
				"certificateTypeCode1");
		HashMap<String, Object> body = new HashMap<String, Object>();
		body.put("cardTypeCode", JSONUtils.parse(
				JSONUtils.toString(cardTypeCode.itemsList()), ArrayList.class));
		body.put("certificateTypeCode", JSONUtils.parse(
				JSONUtils.toString(certificateTypeCode.itemsList()),
				ArrayList.class));
		response.setBody(body);
		return response;
	}

	/**
	 * @return
	 */
	@RequestMapping(value = "/config/getDiseases", method = RequestMethod.GET)
	@ResponseBody
	public ControllerResponse getDiseases() {
		ControllerResponse response = new ControllerResponse();
		Dictionary diseases = DictionariesUtil.getDic("diseases");
		HashMap<String, Object> body = new HashMap<String, Object>();
		List<DictionaryItem> list = diseases.itemsList();
		List<Map<String, Object>> diseaseList = new ArrayList<Map<String, Object>>(
				list.size());
		for (DictionaryItem di : list) {
			@SuppressWarnings("unchecked")
			Map<String, Object> m = JSONUtils.parse(JSONUtils.toString(di),
					HashMap.class);
			m.put("leaf",
					!Boolean.parseBoolean(di.getProperty("folder", "false")));
			diseaseList.add(m);
		}
		body.put("Diseases", diseaseList);
		response.setBody(body);
		return response;
	}

	/**
	 * @param data
	 * @return
	 */
	@RequestMapping(value = "/config/eidtDiseases", method = RequestMethod.POST)
	@ResponseBody
	public ControllerResponse eidtDiseases(@RequestBody Map<String, Object> data) {
		ControllerResponse response = new ControllerResponse();
		try {
			Dictionary diseaseDic = DictionariesUtil.getDic("diseases");
			Document doc = diseaseDic.getDefineDoc();
			Element e = (Element) doc.selectSingleNode("//item[@key='"
					+ data.get("key") + "']");
			e.addAttribute("checkFlag", (String) data.get("checkFlag"));
			diseaseDic.setDefineDoc(doc);
			Dictionaries.instance().saveConfigFile("diseases");
		} catch (Exception e) {
			logger.error("Cannot get edit diseases dictionary.", e);
			response.setStatus(ServiceCode.CODE_DATABASE_ERROR, "编辑疾病字典失败。");
		}
		return response;
	}

	/**
	 * @param data
	 * @return
	 */
	@RequestMapping(value = "/config/addDiseases", method = RequestMethod.POST)
	@ResponseBody
	public ControllerResponse addDiseases(@RequestBody Map<String, Object> data) {
		ControllerResponse response = new ControllerResponse();

		try {
			Dictionary diseaseDic = DictionariesUtil.getDic("diseases");
			Document doc = diseaseDic.getDefineDoc();
			if (doc.selectSingleNode("//item[@key='" + data.get("parentId")
					+ "']") != null) {
				Element e = (Element) doc.selectSingleNode("//item[@key='"
						+ data.get("parentId") + "']");
				e.addElement("item")
						.addAttribute("key", UUID.randomUUID().toString())
						.addAttribute("text", (String) data.get("text"))
						.addAttribute("checkFlag", "false");
				diseaseDic.setDefineDoc(doc);
				Dictionaries.instance().saveConfigFile("diseases");
			} else {
				response.setBody("存在相同的项");
			}
		} catch (Exception e) {
			logger.error("Cannot add disease item.", e);
			response.setStatus(ServiceCode.CODE_DATABASE_ERROR, "添加疾病字典项失败。");
		}
		return response;
	}

	/**
	 * @param data
	 * @return
	 */
	@RequestMapping(value = "/config/delDiseases", method = RequestMethod.POST)
	@ResponseBody
	public ControllerResponse delDiseases(@RequestBody Map<String, Object> data) {
		ControllerResponse response = new ControllerResponse();
		try {
			Dictionary diseaseDic = DictionariesUtil.getDic("diseases");
			Document doc = diseaseDic.getDefineDoc();
			if (doc.selectSingleNode("//item[@key='" + data.get("key") + "']") != null) {
				Element e = (Element) doc.selectSingleNode("//item[@key='"
						+ data.get("key") + "']");
				e.getParent().remove(e);
				diseaseDic.setDefineDoc(doc);
				Dictionaries.instance().saveConfigFile("diseases");
			}
		} catch (Exception e) {
			logger.error("Cannot delete disease item.", e);
			response.setStatus(ServiceCode.CODE_DATABASE_ERROR, "删除疾病字典项目失败。");
		}
		return response;
	}
}
