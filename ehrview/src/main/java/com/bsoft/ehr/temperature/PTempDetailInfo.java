package com.bsoft.ehr.temperature;


public class PTempDetailInfo {

	private String breathe;
	private String temperature;
	private double pulse;
	public double getPulse() {
		return pulse;
	}
	public void setPulse(double pulse) {
		this.pulse = pulse;
	}
	private double reductionTemperature;
	
	public double getReductionTemperature() {
		return reductionTemperature;
	}
	public void setReductionTemperature(double reductionTemperature) {
		this.reductionTemperature = reductionTemperature;
	}
	public String getBreathe() {
		return breathe;
	}
	public void setBreathe(String breathe) {
		this.breathe = breathe;
	}
	public String getTemperature() {
		return temperature;
	}
	public void setTemperature(String temperature) {
		this.temperature = temperature;
	}
	
}
