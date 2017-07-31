package com.bsoft.ehr.auth;

public class VisitKey {

	private String mpiId;
	private String sessionId;
	
	public VisitKey(String key) {
		int idx = key.lastIndexOf("-");
		if (idx == -1) {
			mpiId = key;
		} else {
			sessionId = key.substring(0, idx);
			mpiId = key.substring(idx + 1);
		}
	}

	public String getMpiId() {
		return mpiId;
	}

	public String getSessionId() {
		return sessionId;
	}
}
