package com.bsoft.ehr.config.eval;


import java.io.IOException;
import java.util.Date;
import java.util.Iterator;

import org.apache.commons.lang.StringUtils;
import org.dom4j.Document;
import org.dom4j.Element;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;

import ctd.config.MultiConfigController;
import ctd.config.schema.Schema;
import ctd.config.schema.SchemaController;
import ctd.config.schema.SchemaItem;
import ctd.dictionary.ComposeDictionary;
import ctd.dictionary.Dictionary;
import ctd.dictionary.XMLDictionary;
import ctd.net.rpc.Client;
import ctd.util.AppContextHolder;
import ctd.util.DomainUtil;
import ctd.util.S;

public class EvalDictionary extends MultiConfigController {

	private static final long serialVersionUID = 5547681493832332057L;
	private static final Logger LOGGER = LoggerFactory.getLogger(EvalDictionary.class);
	private final static String defaultPackage = "ctd.dictionary.";
	
	private static EvalDictionary pf;
	
	public EvalDictionary() throws IOException{
		Resource res = AppContextHolder.get().getResource("WEB-INF/config/eval_dictionary/share.xml");
		setDefineDoc(res.getFile().getPath());
		pf = this;
	}
	
	public static EvalDictionary instance(){
		return pf;
	}
	
	public void reload(String id){
		super.reload(id);
		reloadComposeDic("navDic",id);
		LOGGER.info("{action:'Reload',docId:'{}'}", id);
	}
	
	public void reloadComposeDic(String field, String value){
		for (Iterator<String> it = cache.keySet().iterator(); it.hasNext();){
			Dictionary d = (Dictionary)cache.get(it.next());
			if(d instanceof ComposeDictionary){
				String entry = d.getProperty(field);
				if(StringUtils.contains(entry, value)){
					String id = d.getId();
					it.remove();
					LOGGER.info("{action:'Reload',ComposeDic docId:'{}'}", id);
				}
			}
		}
	}
	
	public void reloadComposeDicByEntry(String entryName){
		reloadComposeDic("entry",entryName);
	}
	
	public Dictionary getDic(String id){
		Dictionary dic = (Dictionary)cache.get(id);
		if(dic == null){
			String cls = "XMLDictionary";
			String alias = null;
			if(defineDoc != null){	//鍙兘鎵惧埌鐨勪笉鏄搴旂殑瀛楀吀鑺傜偣
				Element define = (Element)defineDoc.getRootElement().selectSingleNode("dic[@id='"+ id +"']");
				if(define != null){
					cls = define.attributeValue("class",cls);
					alias = define.attributeValue("alias");
				}
			}
			Document doc = getConfigDoc(id);
			if(doc != null){
				Element el = doc.getRootElement();
				if(S.isEmpty(el.attributeValue("alias")) && !S.isEmpty(alias)){
					el.addAttribute("alias", alias);
				}
				boolean isRemote = Boolean.valueOf(el.attributeValue("isRemote", "false"));
				if(isRemote){
					try {
						dic = (Dictionary) Client.rpcInvoke(DomainUtil.CONFIG_DOMAIN+".dictionaryLoader", "getDictionary", new Object[]{id});
						cache.put(id, dic);
					} catch (Exception e) {
						LOGGER.error("can't init dic for[" + id + "]:", e);
					}
				}else{
					cls = el.attributeValue("class",cls);
					try {
						if(!cls.contains(".")){
							cls = defaultPackage+cls;
						}
						dic = (Dictionary) Class.forName(cls).newInstance();
						dic.setDefineDoc(doc);
						cache.put(id, dic);
					} 
					catch (Exception e) {
						LOGGER.error("can't init dic for[" + id + "]:", e);
					}
				}
			}
			else{
				if(id.contains("_")){		//schemaItem's dic
					int in = id.lastIndexOf("_");
					String schemaName = id.substring(0, in);
					String schemaItemName = id.substring(in+1);
					Schema sc = SchemaController.instance().getSchema(schemaName);
					if(sc != null){
						SchemaItem si = sc.item(schemaItemName);
						if(si != null){
							dic = si.reloadSchemaItemDic();
						}else{
							reload(id);
						}
					}else{
						reload(id);
					}
				}else{
					reload(id);
				}
			}
		}
		return dic;
	}
	
	public Dictionary registerDic(String id,Document doc){
		Dictionary dic = new XMLDictionary();
		doc.getRootElement().addAttribute("id", id);
		doc.getRootElement().addAttribute("version", String.valueOf(new Date().getTime()));
		dic.setDefineDoc(doc);
		registerDic(id,dic);
		return dic;
	}
	
	public void registerDic(String id,Dictionary dic){
		cache.put(id, dic);
	}
	
}
