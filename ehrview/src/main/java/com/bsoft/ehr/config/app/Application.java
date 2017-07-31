/**
 * 
 */
package com.bsoft.ehr.config.app;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import ctd.config.ElementConfig;

/**
 * @author chinnsii
 * 
 */
public class Application extends ElementConfig {

	private static final long serialVersionUID = -3434323036458412157L;

	private Map<String, String> args = new HashMap<String, String>();
	private List<Category> categorys = new ArrayList<Category>();

	public Map<String, String> getArgs() {
		return args;
	}

	public void setArgs(Map<String, String> args) {
		this.args = args;
	}

	public void addArg(String name, String value) {
		this.args.put(name, value);
	}
	
	public String getArg(String name) {
		return this.args.get(name);
	}
	
	public List<Category> getCategorys() {
		return categorys;
	}

	public void setCategorys(List<Category> categorys) {
		this.categorys = categorys;
	}

	public void addCategory(Category category) {
		this.categorys.add(category);
	}
}
