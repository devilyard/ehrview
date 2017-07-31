package com.bsoft.ehr.temperature;

import java.util.List;

public class PTempInfo {
private String weightType;
private String weight;
private String heightType;
private String height;
private String urineVolume;
private String KFXT;
private String CHXT;
private String poopCount;
private String bloodPressure1;
private String bloodPressure2;

private List<PTempDetailInfo> detailInfo;

public List<PTempDetailInfo> getDetailInfo() {
	return detailInfo;
}
public void setDetailInfo(List<PTempDetailInfo> detailInfo) {
	this.detailInfo = detailInfo;
}
public String getWeightType() {
	return weightType;
}
public void setWeightType(String weightType) {
	this.weightType = weightType;
}
public String getWeight() {
	return weight;
}
public void setWeight(String weight) {
	this.weight = weight;
}
public String getHeightType() {
	return heightType;
}
public void setHeightType(String heightType) {
	this.heightType = heightType;
}
public String getHeight() {
	return height;
}
public void setHeight(String height) {
	this.height = height;
}
public String getUrineVolume() {
	return urineVolume;
}
public void setUrineVolume(String urineVolume) {
	this.urineVolume = urineVolume;
}
public String getKFXT() {
	return KFXT;
}
public void setKFXT(String kFXT) {
	KFXT = kFXT;
}
public String getCHXT() {
	return CHXT;
}
public void setCHXT(String cHXT) {
	CHXT = cHXT;
}
public String getPoopCount() {
	return poopCount;
}
public void setPoopCount(String poopCount) {
	this.poopCount = poopCount;
}
public String getBloodPressure1() {
	return bloodPressure1;
}
public void setBloodPressure1(String bloodPressure1) {
	this.bloodPressure1 = bloodPressure1;
}
public String getBloodPressure2() {
	return bloodPressure2;
}
public void setBloodPressure2(String bloodPressure2) {
	this.bloodPressure2 = bloodPressure2;
}
}
