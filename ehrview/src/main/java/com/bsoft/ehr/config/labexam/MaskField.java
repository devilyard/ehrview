package com.bsoft.ehr.config.labexam;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

/**
 * 
 * 
 */
public class MaskField implements Serializable, Cloneable {

	private static final long serialVersionUID = 3970939859069622074L;

	private String name;
	private String maskDic;
	private String resDataStandard;
	private String status;

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getMaskDic() {
		return maskDic;
	}

	public void setMaskDic(String maskDic) {
		this.maskDic = maskDic;
	}

	public String getResDataStandard() {
		return resDataStandard;
	}

	public void setResDataStandard(String resDataStandard) {
		this.resDataStandard = resDataStandard;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}
}
