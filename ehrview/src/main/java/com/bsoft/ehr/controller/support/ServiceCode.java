package com.bsoft.ehr.controller.support;

public abstract class ServiceCode {

	public static final int OK = 200;
	
	public static final int TARGET_NOT_FOUND = 404;
	
	public static final int INVALID_UUID = 405;

	public static final int CONTENT_VIEW_NOT_DEFINED = 406;
	
	public static final int NONE = 406;
	
	public static final int SERVICE_PROCESS_FAILED = 205;
	
	public static final int NOT_LOGON = 201; 
	
	public static final int DATA_ACCESS_FAILED=203;
	
	public static final int REDIRECT_TO_VIEW = 20;
	
	public static final int ACCESS_UNAUTHORIZED = 4004;
}
