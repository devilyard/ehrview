/*
 * @(#)PrivacyConfigController.java Created on 2014年3月4日 上午11:10:49
 * 
 * 版权：版权所有 Bsoft 保留所有权力。
 */
package com.bsoft.ehr.controller;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import org.dom4j.Document;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.bsoft.ehr.controller.support.ControllerResponse;
import com.bsoft.ehr.controller.support.ServiceCode;
import com.bsoft.ehr.privacy.config.Filter;
import com.bsoft.ehr.privacy.config.MaskField;
import com.bsoft.ehr.privacy.config.PrivacyFilter;
import com.bsoft.ehr.privacy.config.PrivacyFilterConfigController;
import com.bsoft.ehr.util.DictionariesUtil;

import ctd.dictionary.Dictionaries;
import ctd.dictionary.Dictionary;
import ctd.dictionary.DictionaryItem;

/**
 * 
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
@Controller
public class PrivacyConfigController {

	private static final Logger logger = LoggerFactory
			.getLogger(PrivacyConfigController.class);

	/**
	 * 数据结构：<br/>
	 * {"common":[{"roleId":"01","roleName":"全科医生"}],"authorized":[{"roleId":
	 * "02","责任医生"}],"privacy":[{"roleId":"03","roleName":"干保医生"}]}
	 * 
	 * @param args
	 * @return
	 */
	@RequestMapping(value = "/privacy/saveRoleConfig", method = RequestMethod.POST)
	@ResponseBody
	public ControllerResponse saveRolePrivacy(
			@RequestBody Map<String, Object> args) {
		@SuppressWarnings("unchecked")
		List<Map<String, String>> commonRoles = (List<Map<String, String>>) args
				.get("common");
		ControllerResponse response = new ControllerResponse();
		if (commonRoles != null && !commonRoles.isEmpty()) {
			PrivacyFilter pf = PrivacyFilterConfigController.instance()
					.getPrivacyFilter();
			List<String> roles = new ArrayList<String>(commonRoles.size());
			for (Map<String, String> map : commonRoles) {
				String roleId = map.get("roleId");
				roles.add(roleId);
			}
			Collection<Filter> filters = pf.getFilters();
			for (Filter f : filters) {
				Map<String, MaskField> fields = f.getMaskFields();
				for (Entry<String, MaskField> field : fields.entrySet()) {
					MaskField mf = field.getValue();
					mf.setRoles(roles);
				}
			}
			PrivacyFilterConfigController.instance().saveCtrlFile();
		}
		@SuppressWarnings("unchecked")
		List<Map<String, String>> authorizedRoles = (List<Map<String, String>>) args
				.get("authorized");
		@SuppressWarnings("unchecked")
		List<Map<String, String>> privacyRoles = (List<Map<String, String>>) args
				.get("privacy");
		try {
			saveDictionary("commonRoles", "普通医生角色", commonRoles);
			saveDictionary("authorizedRoles", "授权医生角色", authorizedRoles);
			saveDictionary("privacyRoles", "干保医生角色", privacyRoles);
		} catch (IOException e) {
			logger.error(e.getMessage(), e);
			response.setStatus(ServiceCode.SERVICE_PROCESS_FAILED, "角色权限设置失败！");
			return response;
		} catch (Exception e) {
			logger.error(e.getMessage(), e);
			response.setStatus(ServiceCode.SERVICE_PROCESS_FAILED, "角色权限设置失败！");
		}
		return response;
	}

	/**
	 * @return 数据结构：<br/>
	 *         {"common":[{"roleId":"01","roleName":"全科医生"}],"authorized":[{
	 *         "roleId":
	 *         "02","责任医生"}],"privacy":[{"roleId":"03","roleName":"干保医生"}]}
	 */
	@RequestMapping(value = "/privacy/getRoleConfig")
	@ResponseBody
	public ControllerResponse getRolePrivacy() {
		ControllerResponse response = new ControllerResponse();
		Dictionary commonDic = DictionariesUtil.getDic("commonRoles");
		Dictionary authorDic = DictionariesUtil
				.getDic("authorizedRoles");
		Dictionary privacyDic = DictionariesUtil.getDic("privacyRoles");
		Map<String, Object> body = new HashMap<String, Object>();
		List<Map<String, Object>> commons = convertDictionaryToMap(commonDic);
		if (commons != null) {
			body.put("common", commons);
		}
		List<Map<String, Object>> authors = convertDictionaryToMap(authorDic);
		if (commons != null) {
			body.put("authorized", authors);
		}
		List<Map<String, Object>> privacys = convertDictionaryToMap(privacyDic);
		if (commons != null) {
			body.put("privacy", privacys);
		}
		response.setBody(body);
		return response;
	}

	/**
	 * @param dic
	 * @return
	 */
	private List<Map<String, Object>> convertDictionaryToMap(Dictionary dic) {
		List<DictionaryItem> commonList = dic.itemsList();
		if (commonList == null) {
			return null;
		}
		List<Map<String, Object>> commons = new ArrayList<Map<String, Object>>(
				commonList.size());
		for (DictionaryItem di : commonList) {
			Map<String, Object> item = new HashMap<String, Object>();
			item.put("roleId", di.getKey());
			item.put("roleName", di.getText());
			commons.add(item);
		}
		return commons;
	}

	/**
	 * @param dicName
	 * @param alias
	 * @param items
	 * @throws Exception
	 */
	private void saveDictionary(String dicName, String alias,
			List<Map<String, String>> items) throws Exception {
		Document doc = DocumentHelper.createDocument();
		Element dicElement = doc.addElement("dic");
		dicElement.addAttribute("alias", alias);
		List<String> roles = new ArrayList<String>(items.size());
		for (Map<String, String> map : items) {
			String roleId = map.get("roleId");
			roles.add(roleId);
			Element itemEle = dicElement.addElement("item");
			itemEle.addAttribute("key", roleId);
			itemEle.addAttribute("text", map.get("roleName"));
		}
		Dictionary dic = DictionariesUtil.getDic(dicName);
		dic.setDefineDoc(doc);
		Dictionaries.instance().saveConfigFile(dicName);
		// Client.rpcInvoke("platform.xmlRemoteLoader", "save", new Object[] {
		// doc, dicName, ".dic" });
		// Dictionaries.instance().reload(dicName);
	}
}
