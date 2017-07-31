/**
 * 
 */
package com.bsoft.ehr.config.app;

import java.util.List;

import org.dom4j.Document;
import org.dom4j.Element;
import org.dom4j.Node;

import com.bsoft.ehr.privacy.config.ControllerException;

import ctd.util.converter.ConversionUtils;

/**
 * @author chinnsii
 * 
 */
public class ApplicationConfigLocalLoader {

	/**
	 * @param doc
	 * @return
	 * @throws ControllerException
	 */
	public Application createInstanceFormDoc(Document doc) throws ControllerException {
		Element root = doc.getRootElement();
		if (root == null) {
			throw new ControllerException(ControllerException.PARSE_ERROR,
					"root element missing.");
		}
		Application application = ConversionUtils.convert(root,
				Application.class);
		Node args = root.selectSingleNode("args");
		if (args != null) {
			@SuppressWarnings("unchecked")
			List<Element> argList = args.selectNodes("arg");
			for (Element argEle : argList) {
				application.addArg(argEle.attributeValue("id"),
						argEle.getText());
			}
		}
		@SuppressWarnings("unchecked")
		List<Element> categorys = root.selectNodes("category");
		for (Element c : categorys) {
			Category category = ConversionUtils.convert(c, Category.class);
			@SuppressWarnings("unchecked")
			List<Element> apps = c.selectNodes("app");
			for (Element a : apps) {
				App app = ConversionUtils.convert(a, App.class);
				app.setCatalogId(category.getId());
				category.addApp(app);
			}
			application.addCategory(category);
		}
		return application;
	}

}
