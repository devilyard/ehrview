package com.bsoft.ehr.service;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URL;
import java.net.URLConnection;
import java.util.List;

import org.apache.commons.io.IOUtils;
import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;

import ctd.net.rpc.Client;


public class EhrViewService {
	
	private Logger mLog = LogManager.getLogger(this.getClass());
	/**
	 * @param args
	 */
	public static void main(String[] args) {
		// TODO Auto-generated method stub
		EhrViewService ehrview = new EhrViewService();
		try {
			System.out.println("------");
			//System.out.println(ehrview.getRoleId("http://172.25.220.171:8088/ehrview/", "system", "123"));
			System.out.println(ehrview.getSessionId("http://192.168.201.173:8092/ehrview/", "system", "123", "system"));
			System.out.println(ehrview.getMPIId("320522199003017336"));
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		System.exit(0);
	}
	
	/**
	 * @param preUrl
	 * @param userName
	 * @param passWord
	 * @param IdCard
	 * @return url
	 * @throws IOException
	 */
	public String getPersonEHRView(String preUrl, String userName, String passWord, String IdCard) throws IOException {
		
		String roleId = this.getRoleId(preUrl, userName, passWord);
		String sessionId = this.getSessionId(preUrl, userName, passWord, roleId);
		String mpiId = this.getMPIId(IdCard);
		String finalUrl = preUrl+"pages/viewPortal.html?vk="+sessionId+"-"+mpiId;
		return finalUrl;
	}
	
	/**
	 * @param userName
	 * @param passWord
	 * @return roleId
	 * @throws IOException 
	 */
	public String getRoleId(String preUrl, String userName, String passWord) throws IOException {
		
		mLog.debug("preUrl:"+preUrl+"userName:"+userName+"||passWord:"+passWord);
		
		String text = this.getResponse(preUrl+"interface/getUerJob?user="+userName+"&password="+passWord);
		String roleId = null;
		String[] textList = null;
		String[] nodeList = null;
		if(!text.isEmpty())
		{
			textList = text.split(",");
		}
		
		nodeList = textList[1].substring(0, textList[1].length()-2).split(":");
		
		if(nodeList != null)
		{
			roleId  = nodeList[1].substring(1, nodeList[1].length()-1);
		}
		
		return roleId;
	}
	
	/**
	 * @param userName
	 * @param password
	 * @param roleId
	 * @return sessionId
	 * @throws IOException 
	 */
	public String getSessionId(String preUrl, String userName, String passWord, String roleId) throws IOException {
		mLog.debug("userName:"+userName+"||passWord:"+passWord+"||roleId:"+roleId);
		
		String text = this.getResponse(preUrl+"interface/logon?user="+userName+"&password="+passWord+"&roleId="+roleId);
		String sessionId = null;
		String[] textList = null;
		String[] nodeList = null;
		if(!text.isEmpty())
		{
			textList = text.split(",");
		}
		
		nodeList = textList[1].split(":");
		
		if(nodeList != null)
		{
			sessionId  = nodeList[1].substring(1, nodeList[1].length()-1);
		}
		
		return sessionId;
	}
	
	/**
	 * @param idcard
	 * @return mpiId
	 */
	
	public String getMPIId(String idcard){
		//ApplicationContext appContext = new ClassPathXmlApplicationContext("./spring-demo.xml");
		String services="mpi.mpiProvider";
		String method="getMPIID";
		String mpiId = null;
		try {
			Object obj = Client.rpcInvoke(services, method, new Object[]{idcard});
			mpiId = obj.toString();
		} catch (Exception e) {
			e.printStackTrace();
		}
		return mpiId;
	}
	
	/**
	 * @param sessionId
	 * @param mpiId
	 * @return url
	 */
	public String getUrl(String preUrl, String sessionId, String mpiId) {
		
		String url = null;
		
		url= preUrl+"flex/EHRView.html?uuid="+sessionId+"-"+mpiId;
		return url;
	}
	
	
	/**
	 * @param urlString
	 * @return
	 * @throws IOException
	 */
	private String getResponse(String urlString) throws IOException{
		
		URL url = new URL(urlString);
		String responseText = null;
		StringBuffer stringBuffer = new StringBuffer();
		
		URLConnection connection = url.openConnection();
		
		InputStream inputStream = connection.getInputStream();
        BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(inputStream));
        
        List<String> readLines = IOUtils.readLines(bufferedReader);
        for (String string : readLines) {
        	stringBuffer.append(string);
        }
        responseText = stringBuffer.toString();
		return responseText;
        
	}
}
