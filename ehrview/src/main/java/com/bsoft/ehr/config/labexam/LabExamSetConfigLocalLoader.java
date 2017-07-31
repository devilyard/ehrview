package com.bsoft.ehr.config.labexam;

import java.io.IOException;
import java.util.List;
import org.dom4j.Document;
import org.dom4j.Element;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import ctd.config.MultiConfigController;
import ctd.util.AppContextHolder;

public class LabExamSetConfigLocalLoader extends MultiConfigController {

	private static final long serialVersionUID = 145049206023811238L;
	private static final Logger logger = LoggerFactory.getLogger(LabExamSetConfigLocalLoader.class);
	
	private static LabExamSetConfigLocalLoader pf;
	
	public LabExamSetConfigLocalLoader() throws IOException {
		Resource res = AppContextHolder.get().getResource("WEB-INF/config/LabExamSet.xml");
		setDefineDoc(res.getFile().getPath());
		pf = this;
	}
	
	public static LabExamSetConfigLocalLoader instance(){
		return pf;
	}
	
	@Override
	public void setDefineDoc(Document doc) {
		// TODO Auto-generated method stub
		this.defineDoc = doc;
		if (this.defineDoc == null) {
			logger.error("can't init LabExamSet-config from file: {}"
					+ this.ctrlFilename);
			return;
		}
		Element root = this.defineDoc.getRootElement();
		if (root != null) {
			@SuppressWarnings("unchecked")
			List<Element> filterEles = root.elements("filter");
			if (filterEles.isEmpty()) {
				return ;
			}
			for (Element filterEle : filterEles) {
				Filter filter = new Filter(filterEle);
				this.cache.put(filter.getEntryName(), filter);
			}
		}
	}
	
	public Filter getEntry(String id) {
		return (Filter) this.cache.get(id);
	}
	
}
