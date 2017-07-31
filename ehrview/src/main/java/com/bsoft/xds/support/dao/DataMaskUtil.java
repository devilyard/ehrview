/*
 * @(#)DataMaskUtil.java Created on 2013年12月3日 下午2:08:31
 * 
 * 版权：版权所有 Bsoft 保留所有权力。
 */
package com.bsoft.xds.support.dao;

import java.io.ByteArrayInputStream;
import java.nio.charset.Charset;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import org.apache.commons.lang3.StringUtils;
import org.dom4j.Document;
import org.dom4j.DocumentException;
import org.dom4j.Element;
import org.dom4j.io.SAXReader;

import com.bsoft.ehr.privacy.config.ControllerException;
import com.bsoft.ehr.privacy.config.Filter;
import com.bsoft.ehr.privacy.config.MaskField;
import com.bsoft.ehr.privacy.config.PrivacyFilter;
import com.bsoft.ehr.privacy.config.PrivacyFilterConfigController;
import com.bsoft.ehr.util.ByteArrayUtils;
import com.bsoft.ehr.util.DictionariesUtil;

import ctd.dictionary.Dictionaries;
import ctd.dictionary.Dictionary;
import ctd.dictionary.DictionaryItem;
import ctd.util.converter.ConversionUtils;

/**
 * 
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
public class DataMaskUtil {

	/**
	 * 根据配置对数据进行加码。
	 * 
	 * @param classifying
	 * @param data
	 * @return
	 * @throws DataMaskException
	 */
	public static Map<String, Object> mask(String classifying,
			Map<String, Object> data) throws DataMaskException {
		if (classifying.toLowerCase().endsWith("_doc")) {
			byte[] content = (byte[]) data.get("DocContent");
			classifying = classifying.substring(0, classifying.length() - 4);
			data.put("DocContent", maskDocument(classifying, content));
			return data;
		}
		return maskRecord(classifying, data);
	}

	/**
	 * 对索引数据加码。
	 * 
	 * @param classifying
	 * @param data
	 * @return
	 */
	public static Map<String, Object> maskRecord(String classifying,
			Map<String, Object> data) throws DataMaskException {
		if (data == null || data.isEmpty()) {
			return new HashMap<String, Object>();
		}
		Map<String, Object> map = new HashMap<String, Object>(data.size());
		PrivacyFilter pf = PrivacyFilterConfigController.instance()
				.getPrivacyFilter();
		Filter filter = pf.getFilter(classifying);
		if (filter == null || pf.getMaskFields(classifying) == null
				|| pf.getMaskFields(classifying).isEmpty()) {
			return data;
		}
		boolean encript = false;
		for (Entry<String, Object> entry : data.entrySet()) {
			String field = entry.getKey();
			Object value = entry.getValue();
			MaskField mf = pf.getMaskField(classifying, field);
			if (mf == null || value == null) {
				map.put(field, value);
			} else {
				String stringValue = ConversionUtils.convert(value,
						String.class);
				String sv;
				try {
					sv = maskString(stringValue, mf);
				} catch (ControllerException e) {
					throw new DataMaskException(e.getMessage(), e);
				}
				map.put(field, sv);
				if (!encript && !sv.equals(stringValue)) {
					encript = true;
				}
			}
		}
		map.put("_encript", encript);
		return map;
	}

	/**
	 * 对文档数据加码。
	 * 
	 * @param classifying
	 * @param content
	 * @return
	 * @throws DataMaskException
	 */
	public static byte[] maskDocument(String classifying, byte[] content)
			throws DataMaskException {
		if (content == null || content.length == 0) {
			return null;
		}
		PrivacyFilter pf = PrivacyFilterConfigController.instance()
				.getPrivacyFilter();
		Filter filter = pf.getFilter(classifying);
		Map<String, MaskField> maskFields = filter == null ? null : pf
				.getMaskFields(classifying);
		if (maskFields == null || maskFields.isEmpty()) {
			return content;
		}
		SAXReader reader = new SAXReader();
		reader.setEncoding(ByteArrayUtils.guessEncoding(content));
		Document doc;
		try {
			doc = reader.read(new ByteArrayInputStream(content));
		} catch (DocumentException e) {
			throw new DataMaskException("Cannot process mask content.", e);
		}
		Element root = doc.getRootElement();
		for (MaskField mf : maskFields.values()) {
			List<?> list = root.selectNodes("//*[name()='" + mf.getName()
					+ "']");
			if (list == null || list.isEmpty()) {
				continue;
			}
			for (Object o : list) {
				Element ele = (Element) o;
				if (ele.getText().length() == 0) {
					continue;
				}
				try {
					ele.setText(maskString(ele.getText(), mf));
				} catch (ControllerException e) {
					throw new DataMaskException(e.getMessage(), e);
				}
			}
		}
		return doc.asXML().getBytes(Charset.forName("UTF-8"));
	}

	/**
	 * 给一个字符串加掩码。
	 * 
	 * @param stringValue
	 * @param mf
	 * @return
	 * @throws ControllerException
	 */
	public static String maskString(String stringValue, MaskField mf)
			throws ControllerException {
		if (stringValue == null) {
			return null;
		}
		if (stringValue.length() == 0) {
			return stringValue;
		}
		if (StringUtils.isNotEmpty(mf.getMaskDic())) {
			Dictionary dic = DictionariesUtil.getDic(mf.getMaskDic());
			if (dic != null) {
				Map<String, DictionaryItem> items = dic.items();
				boolean needMask = false;
				for (Entry<String, DictionaryItem> e : items.entrySet()) {
					DictionaryItem di = e.getValue();
					String checkFlag = (String) di.getProperty("checkFlag");
					if (Boolean.valueOf(checkFlag)
							&& stringValue.contains(di.getText())) {
						needMask = true;
						break;
					}
				}
				if (!needMask) {
					return stringValue;
				}
			}
		}
		Integer begin = mf.getBegin();
		Integer length = mf.getLength();
		String direct = mf.getDirect();
		if (begin == null) {
			begin = 0;
		}
		if (begin > stringValue.length() - 1) {
			begin = stringValue.length() - 1;
		}
		if (length == null) {
			length = stringValue.length() - begin;
		}
		if (length > stringValue.length() - begin) {
			length = stringValue.length() - begin;
		}
		if (direct.equals("-")) {
			// @@ 逆转索引号，换算成从左边开始计算。
			begin = stringValue.length() - length - begin;
			if (begin < 0) {
				begin = 0;
			}
		}
		StringBuilder replacement = new StringBuilder();
		for (int i = 0; i < length; i++) {
			replacement.append("*");
		}
		return new StringBuilder(stringValue).replace(begin, begin + length,
				replacement.toString()).toString();
	}

}
