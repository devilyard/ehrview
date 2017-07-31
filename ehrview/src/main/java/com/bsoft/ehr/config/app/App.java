package com.bsoft.ehr.config.app;

import java.io.Serializable;

/**
 * 
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
public class App implements Serializable,Cloneable {

	private static final long serialVersionUID = -3391898372292517796L;

	private String id = null;
	private String name = null;
	private String catalogId = null;
	
	public App() {
		
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getCatalogId() {
		return catalogId;
	}

	public void setCatalogId(String catalogId) {
		this.catalogId = catalogId;
	}

}
