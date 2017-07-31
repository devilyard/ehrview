package com.bsoft.ehr.config.app;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

/**
 * 
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
public class Category implements Cloneable, Serializable {

	private static final long serialVersionUID = 1609585134132216715L;

	private String id;
	private String name;
	private boolean nocheck = true;
	private List<App> apps = new ArrayList<App>();

	public Category() {

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

	public List<App> getApps() {
		return apps;
	}

	public void setApps(List<App> apps) {
		this.apps = apps;
	}

	public void addApp(App app) {
		this.apps.add(app);
	}

	public boolean isNocheck() {
		return nocheck;
	}

	public void setNocheck(boolean noCheck) {
		this.nocheck = noCheck;
	}

}
